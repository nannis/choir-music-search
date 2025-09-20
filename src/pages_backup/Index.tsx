import { useState } from "react";
import { searchSheetMusic, SheetMusicResult } from "@/services/searchService";

const Index = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SheetMusicResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    setHasSearched(true);
    try {
      console.log('Searching for:', query);
      
      // First test the health endpoint
      const healthResponse = await fetch('https://kqjccswtdxkffghuijhu.supabase.co/functions/v1/choir-music-api/health', {
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxamNjc3d0ZHhrZmZnaHVpamh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwOTMwMzIsImV4cCI6MjA3MzY2OTAzMn0.fBcS1Wn5m2Kn-yt9_PF9dyGlIPocJd6MuinvDZ4q3MU`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Health check response:', healthResponse.status);
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('Health data:', healthData);
      }
      
      // Now try the search
      const searchResults = await searchSheetMusic(query.trim());
      console.log('Search results:', searchResults);
      setResults(searchResults.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
          🎵 Choir Sheet Music Search
        </h1>
        
        <form onSubmit={handleSearch} style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Search for music by composer, title, or style..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                backgroundColor: isLoading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {results.length > 0 && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>Search Results ({results.length} found)</h3>
            {results.map((result, index) => (
              <div key={result.id || index} style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>{result.title}</h4>
                <p style={{ margin: '0 0 4px 0', color: '#666' }}><strong>Composer:</strong> {result.composer}</p>
                {result.textWriter && <p style={{ margin: '0 0 4px 0', color: '#666' }}><strong>Text:</strong> {result.textWriter}</p>}
                {result.description && <p style={{ margin: '0 0 4px 0', color: '#666' }}><strong>Description:</strong> {result.description}</p>}
                {result.language && <p style={{ margin: '0 0 4px 0', color: '#666' }}><strong>Language:</strong> {result.language}</p>}
                {result.voicing && <p style={{ margin: '0 0 4px 0', color: '#666' }}><strong>Voicing:</strong> {result.voicing}</p>}
                {result.difficulty && <p style={{ margin: '0 0 4px 0', color: '#666' }}><strong>Difficulty:</strong> {result.difficulty}</p>}
                {result.season && <p style={{ margin: '0 0 4px 0', color: '#666' }}><strong>Season:</strong> {result.season}</p>}
                {result.theme && <p style={{ margin: '0 0 4px 0', color: '#666' }}><strong>Theme:</strong> {result.theme}</p>}
                {result.sourceLink && (
                  <a 
                    href={result.sourceLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#007bff', textDecoration: 'none' }}
                  >
                    View Source →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {hasSearched && results.length === 0 && !isLoading && (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
            <p>No results found for "{query}"</p>
            <p style={{ fontSize: '14px', marginTop: '10px' }}>
              Try different search terms or check your spelling
            </p>
          </div>
        )}

        {!hasSearched && (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
            <p>Enter a search term above to find choir music!</p>
            <p style={{ fontSize: '14px', marginTop: '10px' }}>
              Try searching for composers like "Bach", "Mozart", or styles like "Christmas", "Latin"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;