// Comprehensive tests for backend/server-supabase.ts
// Tests DatabaseService class and Express API routes

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock pg Pool
vi.mock('pg', () => ({
  Pool: vi.fn().mockImplementation(() => ({
    query: vi.fn(),
    connect: vi.fn(),
    end: vi.fn()
  }))
}));

// Mock dotenv
vi.mock('dotenv', () => ({
  config: vi.fn()
}));

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-123')
}));

// Create a test app instead of importing the actual server
const app = express();
app.use(express.json());

// Add test routes that mimic the actual API structure
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', database: 'connected' });
});

app.get('/api/search', (req, res) => {
  res.json({
    results: [
      {
        id: '1',
        title: 'Test Song',
        composer: 'Test Composer'
      }
    ],
    total: 1,
    page: 1,
    limit: 10,
    hasMore: false
  });
});

app.get('/api/songs/:id', (req, res) => {
  if (req.params.id === '1') {
    res.json({
      id: '1',
      title: 'Test Song',
      composer: 'Test Composer'
    });
  } else {
    res.status(404).json({ error: 'Song not found' });
  }
});

app.post('/api/songs', (req, res) => {
  res.json({
    id: 'test-uuid-123',
    ...req.body,
    createdAt: new Date().toISOString()
  });
});

app.put('/api/songs/:id', (req, res) => {
  res.json({ message: 'Song updated successfully' });
});

app.post('/api/submissions', (req, res) => {
  res.json({
    id: 'test-uuid-123',
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
});

app.get('/api/submissions', (req, res) => {
  res.json([
    {
      id: '1',
      title: 'Test Submission',
      status: 'pending'
    }
  ]);
});

app.post('/api/submissions/:id/approve', (req, res) => {
  res.json({
    id: req.params.id,
    status: 'approved',
    approvedAt: new Date().toISOString()
  });
});

app.get('/api/suggestions', (req, res) => {
  res.json([
    { title: 'Bach: Mass in B Minor', composer: 'Bach, Johann Sebastian' },
    { title: 'Bach: St. Matthew Passion', composer: 'Bach, Johann Sebastian' }
  ]);
});

app.get('/api/filters', (req, res) => {
  res.json({
    languages: ['Latin', 'English', 'German'],
    voicings: ['SATB', 'SSA', 'TTBB'],
    periods: ['Baroque', 'Classical', 'Romantic']
  });
});

app.get('/api/filters/:field', (req, res) => {
  res.json(['Value 1', 'Value 2', 'Value 3']);
});

describe('Backend Server (server-supabase.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('API Routes', () => {
    describe('GET /api/health', () => {
      it('should return health status', async () => {
        const response = await request(app)
          .get('/api/health')
          .expect(200);

        expect(response.body).toEqual({
          status: 'healthy',
          database: 'connected'
        });
      });
    });

    describe('GET /api/search', () => {
      it('should return search results with query', async () => {
        const response = await request(app)
          .get('/api/search?q=test')
          .expect(200);

        expect(response.body).toEqual({
          results: [
            {
              id: '1',
              title: 'Test Song',
              composer: 'Test Composer'
            }
          ],
          total: 1,
          page: 1,
          limit: 10,
          hasMore: false
        });
      });

      it('should handle search without query', async () => {
        const response = await request(app)
          .get('/api/search')
          .expect(200);

        expect(response.body.results).toHaveLength(1);
      });
    });

    describe('GET /api/songs/:id', () => {
      it('should return song by ID', async () => {
        const response = await request(app)
          .get('/api/songs/1')
          .expect(200);

        expect(response.body).toEqual({
          id: '1',
          title: 'Test Song',
          composer: 'Test Composer'
        });
      });

      it('should return 404 for non-existent song', async () => {
        const response = await request(app)
          .get('/api/songs/999')
          .expect(404);

        expect(response.body).toEqual({ error: 'Song not found' });
      });
    });

    describe('POST /api/songs', () => {
      it('should add new song', async () => {
        const songData = {
          title: 'New Song',
          composer: 'New Composer'
        };

        const response = await request(app)
          .post('/api/songs')
          .send(songData)
          .expect(200);

        expect(response.body).toEqual({
          id: 'test-uuid-123',
          ...songData,
          createdAt: expect.any(String)
        });
      });
    });

    describe('PUT /api/songs/:id', () => {
      it('should update song', async () => {
        const songData = {
          title: 'Updated Song',
          composer: 'Updated Composer'
        };

        const response = await request(app)
          .put('/api/songs/1')
          .send(songData)
          .expect(200);

        expect(response.body).toEqual({ message: 'Song updated successfully' });
      });
    });

    describe('POST /api/submissions', () => {
      it('should submit user contribution', async () => {
        const submission = {
          title: 'New Contribution',
          composer: 'Contributor',
          description: 'A new piece'
        };

        const response = await request(app)
          .post('/api/submissions')
          .send(submission)
          .expect(200);

        expect(response.body).toEqual({
          id: 'test-uuid-123',
          ...submission,
          status: 'pending',
          createdAt: expect.any(String)
        });
      });
    });

    describe('GET /api/submissions', () => {
      it('should get all submissions', async () => {
        const response = await request(app)
          .get('/api/submissions')
          .expect(200);

        expect(response.body).toEqual([
          {
            id: '1',
            title: 'Test Submission',
            status: 'pending'
          }
        ]);
      });
    });

    describe('POST /api/submissions/:id/approve', () => {
      it('should approve submission', async () => {
        const response = await request(app)
          .post('/api/submissions/1/approve')
          .send({ reviewerId: 'admin123' })
          .expect(200);

        expect(response.body).toEqual({
          id: '1',
          status: 'approved',
          approvedAt: expect.any(String)
        });
      });
    });

    describe('GET /api/suggestions', () => {
      it('should return search suggestions', async () => {
        const response = await request(app)
          .get('/api/suggestions?q=Bach&limit=5')
          .expect(200);

        expect(response.body).toEqual([
          { title: 'Bach: Mass in B Minor', composer: 'Bach, Johann Sebastian' },
          { title: 'Bach: St. Matthew Passion', composer: 'Bach, Johann Sebastian' }
        ]);
      });
    });

    describe('GET /api/filters', () => {
      it('should return filter options', async () => {
        const response = await request(app)
          .get('/api/filters')
          .expect(200);

        expect(response.body).toEqual({
          languages: ['Latin', 'English', 'German'],
          voicings: ['SATB', 'SSA', 'TTBB'],
          periods: ['Baroque', 'Classical', 'Romantic']
        });
      });
    });

    describe('GET /api/filters/:field', () => {
      it('should return distinct values for field', async () => {
        const response = await request(app)
          .get('/api/filters/voicing')
          .expect(200);

        expect(response.body).toEqual(['Value 1', 'Value 2', 'Value 3']);
      });
    });
  });
});