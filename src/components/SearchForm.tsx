import { useState } from 'react';

// Interface for search results
export interface SearchResult {
  id?: string;
  title: string;
  composer: string;
  textWriter?: string;
  description?: string;
  language?: string;
  voicing?: string;
  difficulty?: string;
  season?: string;
  theme?: string;
  sourceLink?: string;
}

interface SearchFormProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

/**
 * SearchForm component handles the search input and submission
 * Provides accessible form with proper labels and ARIA attributes
 */
export const SearchForm = ({ onSearch, isLoading }: SearchFormProps) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8" role="form" aria-label="Search for choir music">
      <div className="flex gap-3 mb-5">
        <label htmlFor="search-input" className="sr-only">
          Search for choir music
        </label>
        <input
          id="search-input"
          type="text"
          placeholder="Search for music by composer, title, or style..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-primary flex-1"
          aria-describedby="search-help"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary"
          aria-label={isLoading ? 'Searching for music' : 'Search for music'}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>
      <div id="search-help" className="body-small text-secondary-600">
        Search suggestions: Try composers like "Bach", "Mozart", or styles like "Christmas", "Latin"
      </div>
    </form>
  );
};
