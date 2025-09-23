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
    <form onSubmit={handleSubmit} className="space-y-6" role="form" aria-label="Search for choir music">
      <div className="flex flex-col sm:flex-row gap-4">
        <label htmlFor="search-input" className="sr-only">
          Search for choir music
        </label>
        <input
          id="search-input"
          type="text"
          placeholder="Sök efter körstycken, kompositörer eller stilar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-elegant flex-1"
          aria-describedby="search-help"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="btn-refined"
          aria-label={isLoading ? 'Searching for music' : 'Search for music'}
        >
          {isLoading ? 'Söker...' : 'Sök'}
        </button>
      </div>
      <div id="search-help" className="body-small text-secondary-600 text-center">
        Sökförslag: Prova kompositörer som "Bach", "Mozart", eller stilar som "Lucia", "Advent"
      </div>
    </form>
  );
};
