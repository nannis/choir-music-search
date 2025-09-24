import { useState, useEffect } from "react";
import VersionInfo from "./components/VersionInfo";
import { SearchForm, SearchResults, ErrorAlert } from "./components";
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
    document.title = "FemVoice Repertoire - Choir Music Search";
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
    <div className="min-h-screen" style={{ background: 'hsl(var(--color-background))' }}>
      <header className="page-header">
        <div className="container-main py-8">
          <div className="max-w-4xl">
            <h1 className="heading-main mb-2">
              FemVoice Repertoire
            </h1>
            <p className="subtitle-main">
              Discover sheet music for all-female choirs
            </p>
          </div>
        </div>
      </header>

      <main role="main" className="container-main py-8">
        <div className="mb-8">
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        <ErrorAlert error={error} />

        <SearchResults 
          results={results} 
          query={currentQuery} 
          isLoading={isLoading}
          hasSearched={hasSearched}
        />

        <VersionInfo />
      </main>
    </div>
  );
};

export default App;