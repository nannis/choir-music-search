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
      <div role="status" aria-live="polite" className="text-center text-secondary-600 mt-16">
        <div className="card-refined max-w-md mx-auto">
          <p className="body-large mb-3">Inga resultat hittades för "{query}"</p>
          <p className="body-small text-secondary-500">
            Prova andra söktermer eller kontrollera stavningen
          </p>
        </div>
      </div>
    );
  }

  return (
    <div role="region" aria-label="Search results" className="card-refined animate-fade-in">
      <h2 className="heading-2 mb-8 text-center">Sökresultat ({results.length} hittade)</h2>
      <div className="space-y-6">
        {results.map((result, index) => (
          <div key={result.id || index} className="p-6 border-b border-secondary-100 last:border-b-0 hover:bg-cream-50 transition-colors duration-200 rounded-xl">
            <h3 className="heading-3 mb-3 text-primary-700">{result.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <p className="body-base"><span className="font-medium text-primary-600">Kompositör:</span> {result.composer}</p>
              {result.textWriter && <p className="body-base"><span className="font-medium text-primary-600">Text:</span> {result.textWriter}</p>}
              {result.language && <p className="body-base"><span className="font-medium text-primary-600">Språk:</span> {result.language}</p>}
              {result.voicing && <p className="body-base"><span className="font-medium text-primary-600">Stämsättning:</span> {result.voicing}</p>}
              {result.difficulty && <p className="body-base"><span className="font-medium text-primary-600">Svårighet:</span> {result.difficulty}</p>}
              {result.season && <p className="body-base"><span className="font-medium text-primary-600">Säsong:</span> {result.season}</p>}
              {result.theme && <p className="body-base"><span className="font-medium text-primary-600">Tema:</span> {result.theme}</p>}
            </div>
            {result.description && <p className="body-base mt-3 text-secondary-600 italic">{result.description}</p>}
            {result.sourceLink && (
              <a
                href={result.sourceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-primary-600 hover:text-primary-700 transition-colors duration-200 focus-ring rounded-lg px-3 py-2 bg-primary-50 hover:bg-primary-100"
                aria-label={`View source for ${result.title} by ${result.composer}`}
              >
                Visa källa →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
