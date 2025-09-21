// Tests for the frontend search functionality
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

// Mock fetch globally
global.fetch = vi.fn();

describe('Choir Music Search Frontend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Search Form', () => {
    it('should render search form elements', () => {
      render(<App />);
      
      expect(screen.getByText('Choir Sheet Music Search')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search for music by composer, title, or style...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Search for music' })).toBeInTheDocument();
    });

    it('should update input value when typing', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const input = screen.getByPlaceholderText('Search for music by composer, title, or style...');
      await user.type(input, 'Bach');
      
      expect(input).toHaveValue('Bach');
    });

    it('should not submit empty search', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const button = screen.getByRole('button', { name: 'Search for music' });
      await user.click(button);
      
      // Should not call fetch for empty search
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('Search Results', () => {
    it('should display search results after successful search', async () => {
      const mockResults = {
        results: [
          {
            id: '1',
            title: 'Test Song',
            composer: 'Test Composer',
            textWriter: 'Test Writer',
            description: 'Test description',
            language: 'English',
            voicing: 'SATB',
            difficulty: 'Easy',
            season: null,
            theme: 'Sacred',
            sourceLink: 'https://example.com'
          }
        ],
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const user = userEvent.setup();
      render(<App />);
      
      const input = screen.getByPlaceholderText('Search for music by composer, title, or style...');
      const button = screen.getByRole('button', { name: 'Search for music' });
      
      await user.type(input, 'test');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Search Results (1 found)')).toBeInTheDocument();
        expect(screen.getByText('Test Song')).toBeInTheDocument();
        expect(screen.getByText(/Composer:/)).toBeInTheDocument();
        expect(screen.getByText(/Text:/)).toBeInTheDocument();
        expect(screen.getByText(/Description:/)).toBeInTheDocument();
        expect(screen.getByText(/Language:/)).toBeInTheDocument();
        expect(screen.getByText(/Voicing:/)).toBeInTheDocument();
        expect(screen.getByText(/Difficulty:/)).toBeInTheDocument();
        expect(screen.getByText(/Theme:/)).toBeInTheDocument();
      });
    });

    it('should display no results message when search returns empty', async () => {
      const mockResults = {
        results: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: false
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const user = userEvent.setup();
      render(<App />);
      
      const input = screen.getByPlaceholderText('Search for music by composer, title, or style...');
      const button = screen.getByRole('button', { name: 'Search for music' });
      
      await user.type(input, 'nonexistent');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('No results found for "nonexistent"')).toBeInTheDocument();
        expect(screen.getByText('Try different search terms or check your spelling')).toBeInTheDocument();
      });
    });

    it('should display error message when API call fails', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const user = userEvent.setup();
      render(<App />);
      
      const input = screen.getByPlaceholderText('Search for music by composer, title, or style...');
      const button = screen.getByRole('button', { name: 'Search for music' });
      
      await user.type(input, 'test');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });
    });

    it('should display error message when API returns error status', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const user = userEvent.setup();
      render(<App />);
      
      const input = screen.getByPlaceholderText('Search for music by composer, title, or style...');
      const button = screen.getByRole('button', { name: 'Search for music' });
      
      await user.type(input, 'test');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
        expect(screen.getByText(/API request failed: 500 Internal Server Error/)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during search', async () => {
      // Mock a delayed response
      (fetch as any).mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ results: [], total: 0, page: 1, limit: 20, hasMore: false })
          }), 100)
        )
      );

      const user = userEvent.setup();
      render(<App />);
      
      const input = screen.getByPlaceholderText('Search for music by composer, title, or style...');
      const button = screen.getByRole('button', { name: 'Search for music' });
      
      await user.type(input, 'test');
      await user.click(button);

      // Should show loading state
      expect(screen.getByText('Searching...')).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  describe('Initial State', () => {
    it('should show welcome message when no search has been performed', () => {
      render(<App />);
      
      expect(screen.getByText('Enter a search term above to find choir music!')).toBeInTheDocument();
      expect(screen.getByText('Try searching for composers like "Bach", "Mozart", or styles like "Christmas", "Latin"')).toBeInTheDocument();
    });
  });

  describe('Search API Call', () => {
    it('should make correct API call with proper headers', async () => {
      const mockResults = {
        results: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: false
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const user = userEvent.setup();
      render(<App />);
      
      const input = screen.getByPlaceholderText('Search for music by composer, title, or style...');
      const button = screen.getByRole('button', { name: 'Search for music' });
      
      await user.type(input, 'Bach');
      await user.click(button);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'https://kqjccswtdxkffghuijhu.supabase.co/functions/v1/choir-music-api/search?q=Bach',
          {
            method: 'GET',
            headers: {
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxamNjc3d0ZHhrZmZnaHVpamh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwOTMwMzIsImV4cCI6MjA3MzY2OTAzMn0.fBcS1Wn5m2Kn-yt9_PF9dyGlIPocJd6MuinvDZ4q3MU',
              'Content-Type': 'application/json'
            }
          }
        );
      });
    });
  });
});
