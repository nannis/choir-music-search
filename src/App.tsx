import { useState, useEffect } from "react";
import VersionInfo from "./components/VersionInfo";
import { SearchForm, SearchResults, ErrorAlert, WelcomeMessage } from "./components";
import { SearchFilters, FilterOptions } from "./components/SearchFilters";
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
  const [filters, setFilters] = useState<FilterOptions>({
    source: [],
    voicing: [],
    difficulty: [],
    language: [],
    theme: [],
    season: [],
    period: []
  });
  const [showFilters, setShowFilters] = useState(false);

  // Set document title for accessibility
  useEffect(() => {
    document.title = "Choir Music Search";
  }, []);

  const handleSearch = async (query: string) => {
    setHasSearched(true);
    setCurrentQuery(query);
    await performSearch(query, filters);
  };

  const performSearch = async (query: string, currentFilters: FilterOptions) => {
    setIsLoading(true);
    setError("");

    try {
      const searchResults = await SearchService.searchMusic(query, currentFilters);
      setResults(searchResults);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Search failed');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = async (newFilters: FilterOptions) => {
    setFilters(newFilters);
    
    // If we have a current query, re-run the search with new filters
    if (currentQuery.trim()) {
      await performSearch(currentQuery, newFilters);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'hsl(var(--color-background))' }}>
      <header className="page-header">
        <div className="container-main py-8">
          <div className="max-w-4xl">
            <h1 className="heading-main mb-2">
              Choir Music Search
            </h1>
            <p className="subtitle-main">
              Discover beautiful choral music for your ensemble
            </p>
          </div>
        </div>
      </header>
      <main className="container-main py-8" role="main">

        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {hasSearched && (
          <SearchFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isVisible={showFilters}
            onToggleVisibility={() => setShowFilters(!showFilters)}
          />
        )}

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