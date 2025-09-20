import { ExternalLink, Music, User, FileText, Volume2 } from "lucide-react";
import { SheetMusicResult } from "@/services/searchService";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SearchResultsProps {
  results: SheetMusicResult[];
  isLoading: boolean;
}

export const SearchResults = ({ results, isLoading }: SearchResultsProps) => {
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 border rounded-lg animate-pulse">
              <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-muted rounded w-full mb-4"></div>
              <div className="flex gap-4">
                <div className="h-8 bg-muted rounded w-24"></div>
                <div className="h-8 bg-muted rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 text-center py-12">
        <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No results found</h3>
        <p className="text-muted-foreground">
          Try searching for a specific piece, composer, or musical style
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Sheet Music Results</h2>
        <p className="text-muted-foreground">
          Found {results.length} result{results.length !== 1 ? 's' : ''}
        </p>
        <Separator className="mt-4" />
      </div>
      
      <div className="space-y-6">
        {results.map((result, index) => (
          <div
            key={index}
            className="p-6 border rounded-lg hover:shadow-md transition-shadow bg-card"
          >
            <div className="space-y-4">
              {/* Title and basic info */}
              <div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">
                  {result.title}
                </h3>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Music className="h-4 w-4" />
                  <span>Composer: {result.composer}</span>
                </div>
                {result.textWriter && (
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>Text: {result.textWriter}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                    {result.source}
                  </span>
                </div>
              </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {result.description}
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild variant="default">
                  <a
                    href={result.sourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Sheet Music
                  </a>
                </Button>
                
                {result.audioLink && (
                  <Button asChild variant="outline">
                    <a
                      href={result.audioLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Volume2 className="h-4 w-4" />
                      Listen to Audio
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};