import { SearchResult } from './SearchForm';

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
}

/**
 * SearchResults component displays the list of search results
 * Provides accessible results with proper ARIA regions and semantic markup
 */
export const SearchResults = ({ results, query }: SearchResultsProps) => {
  if (results.length === 0) {
    return (
      <div role="status" aria-live="polite" className="text-center text-secondary-600 mt-12">
        <p className="body-large">No results found for "{query}"</p>
        <p className="body-small mt-3">
          Try different search terms or check your spelling
        </p>
      </div>
    );
  }

  return (
    <div role="region" aria-label="Search results" className="card-elevated animate-fade-in">
      <h2 className="heading-2 mb-6">Search Results ({results.length} found)</h2>
      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={result.id || index} className="p-4 border-b border-secondary-200 last:border-b-0">
            <h3 className="heading-3 mb-2">{result.title}</h3>
            <div className="space-y-1">
              <p className="body-base"><strong>Composer:</strong> {result.composer}</p>
              {result.textWriter && <p className="body-base"><strong>Text:</strong> {result.textWriter}</p>}
              {result.description && <p className="body-base"><strong>Description:</strong> {result.description}</p>}
              {result.language && <p className="body-base"><strong>Language:</strong> {result.language}</p>}
              {result.voicing && <p className="body-base"><strong>Voicing:</strong> {result.voicing}</p>}
              {result.difficulty && <p className="body-base"><strong>Difficulty:</strong> {result.difficulty}</p>}
              {result.season && <p className="body-base"><strong>Season:</strong> {result.season}</p>}
              {result.theme && <p className="body-base"><strong>Theme:</strong> {result.theme}</p>}
            </div>
            {result.sourceLink && (
              <a
                href={result.sourceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-primary-600 hover:text-primary-700 transition-colors duration-200 focus-ring rounded px-2 py-1"
                aria-label={`View source for ${result.title} by ${result.composer}`}
              >
                View Source →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
