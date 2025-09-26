/**
 * Service for fetching example songs to display on the front page
 * Provides a curated selection of songs to inspire users
 */

import { Song } from '../types/Song';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface ExampleSongsResponse {
  examples: Song[];
  error?: string;
}

/**
 * Fetches a random selection of example songs from the database
 * Returns songs that showcase the variety available in the collection
 * Each call will return different songs for variety
 */
export async function fetchExampleSongs(): Promise<ExampleSongsResponse> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/choir-music-api/examples`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { examples: data.examples || [] };
  } catch (error) {
    console.error('Failed to fetch example songs:', error);
    return { 
      examples: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch example songs' 
    };
  }
}

/**
 * Fallback example songs to display if API fails
 * Provides a curated selection of well-known choral works
 */
export function getFallbackExampleSongs(): Song[] {
  return [
    {
      id: 'fallback-1',
      title: 'Ave Maria',
      composer: 'Franz Schubert',
      description: 'Classic Ave Maria arranged for women\'s choir',
      voicing: 'SSAA',
      difficulty: 'Intermediate',
      source: 'MuseScore',
      sourceLink: '#',
      language: 'Latin',
      season: 'Christmas',
      theme: 'Sacred'
    },
    {
      id: 'fallback-2', 
      title: 'Danny Boy',
      composer: 'Traditional Irish',
      description: 'Traditional Irish ballad arranged for women\'s choir',
      voicing: 'SSA',
      difficulty: 'Beginner',
      source: 'MuseScore',
      sourceLink: '#',
      language: 'English',
      theme: 'Folk'
    },
    {
      id: 'fallback-3',
      title: 'Amazing Grace',
      composer: 'John Newton',
      description: 'Beloved hymn arranged for women\'s choir',
      voicing: 'SSAA',
      difficulty: 'Easy',
      source: 'MuseScore',
      sourceLink: '#',
      language: 'English',
      theme: 'Sacred'
    }
  ];
}
