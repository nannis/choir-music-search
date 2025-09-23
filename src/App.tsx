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
  const [currentQuery, setCurrentQuery] = useState<string>("");

  // Set document title for accessibility
  useEffect(() => {
    document.title = "Choir Music Search";
  }, []);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setHasSearched(true);
    setError("");
    setCurrentQuery(query);

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
    <div className="min-h-screen bg-cream-50">
      <main className="container-main section-spacing" role="main">
        <header className="text-center mb-16">
          <h1 className="heading-1 mb-6">
            Choir Music Search
          </h1>
          <p className="subtitle-elegant mb-2">
            Låt vår musik förgyll din dag
          </p>
          <p className="body-base text-secondary-500">
            En elegant portal för att upptäcka körmusik från hela världen
          </p>
        </header>

        <div className="card-refined mb-12">
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        <ErrorAlert error={error} />

        {results.length > 0 && (
          <SearchResults results={results} query={currentQuery} />
        )}

        {hasSearched && results.length === 0 && !isLoading && !error && (
          <SearchResults results={[]} query={currentQuery} />
        )}

        {!hasSearched && <WelcomeMessage />}
      </main>

      {/* Version info for deployment tracking */}
      <VersionInfo />
    </div>
  );
};

export default App;