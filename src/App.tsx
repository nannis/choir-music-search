import { useState, useEffect } from "react";
import VersionInfo from "./components/VersionInfo";
import { SearchForm, SearchResults, ErrorAlert, WelcomeMessage } from "./components";
import { SearchService } from "./services/searchService";
import { SearchResult } from "./components/SearchForm";

/**
 * Main App component for the Choir Music Search application
 * Orchestrates the search functionality and manages application state
 */
const App = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string>("");

  // Set document title for accessibility
  useEffect(() => {
    document.title = "Choir Music Search";
  }, []);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setHasSearched(true);
    setError("");

    try {
      const searchResults = await SearchService.searchMusic(query);
      setResults(searchResults);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Search failed');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="container-main section-spacing">
        <h1 className="heading-1 text-center mb-8">
          Choir Sheet Music Search
        </h1>

        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        <ErrorAlert error={error} />

        {results.length > 0 && (
          <SearchResults results={results} query={hasSearched ? "search" : ""} />
        )}

        {hasSearched && results.length === 0 && !isLoading && !error && (
          <div role="status" aria-live="polite" className="text-center text-secondary-600 mt-12">
            <p className="body-large">No results found</p>
            <p className="body-small mt-3">
              Try different search terms or check your spelling
            </p>
          </div>
        )}

        {!hasSearched && <WelcomeMessage />}
      </div>

      {/* Version info for deployment tracking */}
      <VersionInfo />
    </div>
  );
};

export default App;