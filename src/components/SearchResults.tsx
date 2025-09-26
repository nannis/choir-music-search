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
    <div role="region" aria-label="Search results">
      <h2 className="heading-results">Search Results ({results.length} found)</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {results.map((result, index) => (
          <div key={result.id || index} className="card-content">
            <h3 className="content-title mb-2">{result.title}</h3>
            <div className="space-y-1">
              <p className="content-composer"><strong>Composer:</strong> {result.composer}</p>
              {result.textWriter && <p className="text-body"><strong>Text:</strong> {result.textWriter}</p>}
              {result.description && <p className="text-body"><strong>Description:</strong> {result.description}</p>}
              {result.language && <p className="text-body"><strong>Language:</strong> {result.language}</p>}
              {result.voicing && <p className="text-body"><strong>Voicing:</strong> {result.voicing}</p>}
              {result.difficulty && <p className="text-body"><strong>Difficulty:</strong> {result.difficulty}</p>}
              {result.season && <p className="text-body"><strong>Season:</strong> {result.season}</p>}
              {result.theme && <p className="text-body"><strong>Theme:</strong> {result.theme}</p>}
            </div>
            {result.sourceLink && (
              <a
                href={result.sourceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-blue-600 hover:text-blue-700 transition-colors duration-200 underline"
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
