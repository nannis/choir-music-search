import { SearchResult } from './SearchForm';
import sheetMusic1 from '../assets/sheet-music-1.jpg';
import sheetMusic2 from '../assets/sheet-music-2.jpg';

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  isLoading?: boolean;
  hasSearched?: boolean;
}

// Mock data to demonstrate the rich content layout matching FemVoice Repertoire
const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'O Magnum Mysterium',
    composer: 'Morten Lauridsen',
    description: 'A beautiful setting of the traditional Christmas text, showcasing Lauridsen\'s signature harmonic language with lush, flowing lines...',
    language: 'Latin',
    voicing: 'SSAA',
    difficulty: 'Medium',
    season: 'Sacred',
    sourceLink: '#',
    rating: 4.8,
    reviewCount: 127,
    price: '$3.95',
    duration: '5-6 minutes',
    publisher: 'Peer Music',
    thumbnail: sheetMusic1
  },
  {
    id: '2',
    title: 'Sleep My Child',
    composer: 'Eric Whitacre',
    description: 'A tender lullaby with Whitacre\'s characteristic cluster harmonies and flowing melodic lines. Features beautiful interweaving vocal...',
    language: 'English',
    voicing: 'SSA',
    difficulty: 'Challenging',
    season: 'Contemporary',
    sourceLink: '#',
    rating: 4.9,
    reviewCount: 89,
    price: '$2.75',
    duration: '4-5 minutes',
    publisher: 'Hal Leonard',
    thumbnail: sheetMusic2
  }
];

/**
 * SearchResults component displays search results in rich content cards
 * Matches the FemVoice Repertoire design with thumbnails, ratings, and detailed info
 */
export const SearchResults = ({ results, query, isLoading, hasSearched }: SearchResultsProps) => {
  // Use mock data for demonstration when no real results
  const displayResults = results.length > 0 ? results : (!hasSearched ? mockResults : []);
  
  console.log('SearchResults debug:', { 
    results: results.length, 
    hasSearched, 
    displayResults: displayResults.length,
    firstResult: displayResults[0]
  });

  if (isLoading) {
    return (
      <div className="text-center py-12" role="status" aria-live="polite">
        <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md transition ease-in-out duration-150 cursor-not-allowed" style={{ color: 'hsl(var(--color-text-secondary))', background: 'hsl(var(--color-surface))' }}>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" style={{ color: 'hsl(var(--color-text-secondary))' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Searching music...
        </div>
      </div>
    );
  }

  if (hasSearched && displayResults.length === 0) {
    return (
      <div role="status" aria-live="polite" className="text-center mt-16">
        <div className="max-w-md mx-auto">
          <svg className="mx-auto h-12 w-12 mb-4" style={{ color: 'hsl(var(--color-text-muted))' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="heading-results mb-4">No results found</h2>
          <p className="results-meta">
            Try different keywords for "{query}"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div role="region" aria-label="Search results">
      <div className="mb-6">
        <h2 className="heading-results">
          All Sheet Music
        </h2>
        <p className="results-meta">
          {displayResults.length} pieces found • Page 1 of {Math.ceil(displayResults.length / 10)}
        </p>
      </div>
      
      <div className="space-y-6">
        {displayResults.map((result, index) => (
          <div key={result.id || index} className="card-content">
            <div className="flex gap-4">
              {/* Thumbnail */}
              <div className="flex-shrink-0">
                <img 
                  src={result.thumbnail || sheetMusic1} 
                  alt={`Sheet music for ${result.title}`}
                  className="music-thumbnail"
                />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="content-title mb-1">
                      {result.title}
                    </h3>
                    <p className="content-composer">
                      by {result.composer}
                    </p>
                  </div>
                  {result.price && (
                    <div className="content-price text-right">
                      {result.price}
                    </div>
                  )}
                </div>
                
                {/* Rating - Make sure this is visible */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(result.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'hsl(var(--color-text-secondary))' }}>
                    {result.rating} ({result.reviewCount} reviews)
                  </span>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {result.voicing && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {result.voicing}
                    </span>
                  )}
                  {result.difficulty && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      result.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                      result.difficulty === 'Challenging' ? 'bg-orange-100 text-orange-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {result.difficulty}
                    </span>
                  )}
                  {result.season && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                      {result.season}
                    </span>
                  )}
                  {result.duration && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                      {result.duration}
                    </span>
                  )}
                </div>
                
                {/* Description */}
                {result.description && (
                  <p className="content-description mb-3">
                    {result.description}
                  </p>
                )}
                
                {/* Publisher info */}
                {(result.language || result.publisher) && (
                  <p className="text-xs mb-4" style={{ color: 'hsl(var(--color-text-muted))' }}>
                    {result.language}{result.language && result.publisher && ' • '}Published by {result.publisher}
                  </p>
                )}
                
                {/* Action buttons */}
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors" style={{ borderColor: 'hsl(var(--color-border))', color: 'hsl(var(--color-text-secondary))' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12c0 1.93-8.75 8-9 8s-9-6.07-9-8c0-4.43 4.03-8 9-8s9 3.57 9 8z" />
                    </svg>
                    Preview
                  </button>
                  <button className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
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
