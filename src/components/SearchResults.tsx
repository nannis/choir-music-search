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
      <div role="status" aria-live="polite" className="text-center mt-16">
        <div className="max-w-md mx-auto">
          <h2 className="heading-results mb-4">Inga resultat hittades</h2>
          <p className="text-meta">
            Försök med andra söktermer för "{query}"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div role="region" aria-label="Search results" className="max-w-6xl mx-auto">
      <h2 className="heading-results mb-8">Alla körmusik stycken</h2>
      <p className="text-meta mb-8">{results.length} stycken funna • Sida 1 av 1</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {results.map((result, index) => (
          <div key={result.id || index} className="card-result">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-body font-semibold mb-1 truncate">{result.title}</h3>
                <p className="text-meta mb-2">av {result.composer}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {result.voicing && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {result.voicing}
                    </span>
                  )}
                  {result.difficulty && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                      {result.difficulty}
                    </span>
                  )}
                  {result.language && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                      {result.language}
                    </span>
                  )}
                </div>

                {result.description && (
                  <p className="text-meta text-sm leading-relaxed line-clamp-2">{result.description}</p>
                )}
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4">
                    <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      👁 Preview
                    </button>
                    {result.sourceLink && (
                      <a
                        href={result.sourceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        aria-label={`View source for ${result.title}`}
                      >
                        🔗 Source
                      </a>
                    )}
                  </div>
                  <button className="btn-primary text-sm px-4 py-2">
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
