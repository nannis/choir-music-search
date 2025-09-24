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
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-6 py-12" role="main">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="heading-main mb-4">
            Körmusik Repertoire
          </h1>
          <p className="subtitle-main">
            Upptäck körmusik för alla körer
          </p>
        </header>

        {/* Search Container */}
        <div className="search-container mb-12">
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