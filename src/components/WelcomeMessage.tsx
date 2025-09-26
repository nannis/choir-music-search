/**
 * WelcomeMessage component displays random example songs from the database
 * Provides inspiration and showcases the collection to new users
 * Shows different songs each time the page loads for variety
 */

import { useState, useEffect } from 'react';
import { fetchExampleSongs, getFallbackExampleSongs } from '../services/exampleSongsService';
import { Song } from '../types/Song';

export const WelcomeMessage = () => {
  const [exampleSongs, setExampleSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExampleSongs = async () => {
      try {
        setIsLoading(true);
        const response = await fetchExampleSongs();
        
        if (response.error) {
          console.warn('Failed to fetch example songs, using fallback:', response.error);
          setExampleSongs(getFallbackExampleSongs());
        } else {
          setExampleSongs(response.examples);
        }
      } catch (err) {
        console.warn('Error loading example songs, using fallback:', err);
        setExampleSongs(getFallbackExampleSongs());
        setError('Unable to load example songs');
      } finally {
        setIsLoading(false);
      }
    };

    loadExampleSongs();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center text-gray-600 mt-12">
        <p className="text-lg">Loading examples...</p>
      </div>
    );
  }

  if (error && exampleSongs.length === 0) {
    return (
      <div className="text-center text-gray-600 mt-12">
        <p className="text-lg">Enter a search term above to find choir music!</p>
        <p className="text-sm mt-3">
          Try searching for composers like "Bach", "Mozart", or styles like "Christmas", "Latin"
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Discover Beautiful Choral Music</h2>
        <p className="text-gray-600">Here are some random examples from our collection:</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exampleSongs.map((song, index) => (
          <div key={song.id || index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
            <h3 className="font-semibold text-gray-900 mb-2">{song.title}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Composer:</strong> {song.composer}</p>
              {song.voicing && <p><strong>Voicing:</strong> {song.voicing}</p>}
              {song.difficulty && <p><strong>Difficulty:</strong> {song.difficulty}</p>}
              {song.language && <p><strong>Language:</strong> {song.language}</p>}
              {song.theme && <p><strong>Theme:</strong> {song.theme}</p>}
            </div>
            {song.description && (
              <p className="text-sm text-gray-500 mt-2 italic">{song.description}</p>
            )}
          </div>
        ))}
      </div>
      
      <div className="text-center mt-8">
        <p className="text-gray-600">
          <strong>Ready to explore?</strong> Use the search above to find more music by composer, title, or style!
        </p>
      </div>
    </div>
  );
};
