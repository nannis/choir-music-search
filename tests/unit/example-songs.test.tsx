/**
 * Tests for the random example songs functionality
 * Verifies that random example songs are displayed on the front page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { WelcomeMessage } from '../../src/components/WelcomeMessage';
import { fetchExampleSongs, getFallbackExampleSongs } from '../../src/services/exampleSongsService';

// Mock the example songs service
vi.mock('../../src/services/exampleSongsService', () => ({
  fetchExampleSongs: vi.fn(),
  getFallbackExampleSongs: vi.fn()
}));

describe('Random Example Songs Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    // Mock fetchExampleSongs to return a promise that never resolves
    vi.mocked(fetchExampleSongs).mockImplementation(() => new Promise(() => {}));
    
    render(<WelcomeMessage />);
    
    expect(screen.getByText('Loading examples...')).toBeInTheDocument();
  });

  it('should display example songs when API call succeeds', async () => {
    const mockExamples = [
      {
        id: 'test-1',
        title: 'Ave Maria',
        composer: 'Franz Schubert',
        voicing: 'SSAA',
        difficulty: 'Intermediate',
        language: 'Latin',
        theme: 'Sacred',
        description: 'Classic Ave Maria arranged for women\'s choir',
        source: 'MuseScore',
        sourceLink: '#'
      },
      {
        id: 'test-2',
        title: 'Danny Boy',
        composer: 'Traditional Irish',
        voicing: 'SSA',
        difficulty: 'Beginner',
        language: 'English',
        theme: 'Folk',
        description: 'Traditional Irish ballad arranged for women\'s choir',
        source: 'MuseScore',
        sourceLink: '#'
      }
    ];

    vi.mocked(fetchExampleSongs).mockResolvedValue({
      examples: mockExamples
    });

    render(<WelcomeMessage />);

    // Wait for examples to load
    await waitFor(() => {
      expect(screen.getByText('Discover Beautiful Choral Music')).toBeInTheDocument();
      expect(screen.getByText('Here are some random examples from our collection:')).toBeInTheDocument();
      expect(screen.getByText('Ave Maria')).toBeInTheDocument();
      expect(screen.getByText('Franz Schubert')).toBeInTheDocument();
      expect(screen.getByText('Danny Boy')).toBeInTheDocument();
      expect(screen.getByText('Traditional Irish')).toBeInTheDocument();
    });

    // Check that song details are displayed
    expect(screen.getByText('SSAA')).toBeInTheDocument();
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
    expect(screen.getByText('Latin')).toBeInTheDocument();
    expect(screen.getByText('Sacred')).toBeInTheDocument();
    expect(screen.getByText('SSA')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Folk')).toBeInTheDocument();
  });

  it('should display fallback songs when API call fails', async () => {
    const mockFallbackSongs = [
      {
        id: 'fallback-1',
        title: 'Amazing Grace',
        composer: 'John Newton',
        voicing: 'SSAA',
        difficulty: 'Easy',
        language: 'English',
        theme: 'Sacred',
        description: 'Beloved hymn arranged for women\'s choir',
        source: 'MuseScore',
        sourceLink: '#'
      }
    ];

    vi.mocked(fetchExampleSongs).mockResolvedValue({
      examples: [],
      error: 'API request failed'
    });
    vi.mocked(getFallbackExampleSongs).mockReturnValue(mockFallbackSongs);

    render(<WelcomeMessage />);

    // Wait for fallback songs to load
    await waitFor(() => {
      expect(screen.getByText('Discover Beautiful Choral Music')).toBeInTheDocument();
      expect(screen.getByText('Amazing Grace')).toBeInTheDocument();
      expect(screen.getByText('John Newton')).toBeInTheDocument();
    });
  });

  it('should display error fallback when both API and fallback fail', async () => {
    vi.mocked(fetchExampleSongs).mockRejectedValue(new Error('Network error'));
    vi.mocked(getFallbackExampleSongs).mockReturnValue([]);

    render(<WelcomeMessage />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Enter a search term above to find choir music!')).toBeInTheDocument();
      expect(screen.getByText('Try searching for composers like "Bach", "Mozart", or styles like "Christmas", "Latin"')).toBeInTheDocument();
    });
  });

  it('should display call-to-action message', async () => {
    const mockExamples = [
      {
        id: 'test-1',
        title: 'Test Song',
        composer: 'Test Composer',
        voicing: 'SSAA',
        difficulty: 'Easy',
        language: 'English',
        theme: 'Sacred',
        description: 'Test description',
        source: 'MuseScore',
        sourceLink: '#'
      }
    ];

    vi.mocked(fetchExampleSongs).mockResolvedValue({
      examples: mockExamples
    });

    render(<WelcomeMessage />);

    await waitFor(() => {
      expect(screen.getByText('Ready to explore?')).toBeInTheDocument();
      expect(screen.getByText(/Use the search above to find more music/)).toBeInTheDocument();
    });
  });
});
