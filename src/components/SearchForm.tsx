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
  rating?: number;
  reviewCount?: number;
  price?: string;
  duration?: string;
  publisher?: string;
  thumbnail?: string;
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
    <form onSubmit={handleSubmit} role="form" aria-label="Search for choir music">
      <div className="flex gap-4">
        <label htmlFor="search-input" className="sr-only">
          Search for choir music
        </label>
        <input
          id="search-input"
          type="text"
          placeholder="Search by title, composer, or keyword..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input-main flex-1"
          aria-describedby="search-help"
        />
        <button
          type="button"
          disabled={isLoading}
          className="btn-filters flex items-center gap-2 whitespace-nowrap"
          aria-label={isLoading ? 'Searching for music' : 'Filters'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.586a1 1 0 01-.293.707l-2 2A1 1 0 0110 21v-7.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>
      </div>
    </form>
  );
};
