import { SearchResult } from '../components/SearchForm';
import { FilterOptions } from '../components/SearchFilters';

/**
 * SearchService handles all API communication with Supabase
 * Provides centralized error handling and type safety
 */
export class SearchService {
  private static getSupabaseConfig() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kqjccswtdxkffghuijhu.supabase.co';
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxamNjc3d0ZHhrZmZnaHVpamh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwOTMwMzIsImV4cCI6MjA3MzY2OTAzMn0.fBcS1Wn5m2Kn-yt9_PF9dyGlIPocJd6MuinvDZ4q3MU';
    
    return { supabaseUrl, supabaseKey };
  }

  /**
   * Build query parameters for search with filters
   * @param query - The search query string
   * @param filters - Optional filter options
   * @returns URLSearchParams object
   */
  private static buildSearchParams(query: string, filters?: FilterOptions): URLSearchParams {
    const params = new URLSearchParams();
    params.set('q', query);
    
    if (filters) {
      // Add filter parameters
      Object.entries(filters).forEach(([key, values]) => {
        if (values.length > 0) {
          params.set(key, values.join(','));
        }
      });
    }
    
    return params;
  }

  /**
   * Search for choir music using the Supabase Edge Function
   * @param query - The search query string
   * @param filters - Optional filter options
   * @returns Promise<SearchResult[]> - Array of search results
   * @throws Error if the API call fails
   */
  static async searchMusic(query: string, filters?: FilterOptions): Promise<SearchResult[]> {
    const { supabaseUrl, supabaseKey } = this.getSupabaseConfig();
    
    // Return early for empty or whitespace-only queries
    if (!query.trim()) {
      return [];
    }
    
    try {
      const searchParams = this.buildSearchParams(query, filters);
      const response = await fetch(`${supabaseUrl}/functions/v1/choir-music-api/search?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Search failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Search failed');
    }
  }
}
