import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SheetMusicResult } from "@/services/searchService";

export interface ActiveFilters {
  language?: string;
  voicing?: string;
  difficulty?: string;
  season?: string;
  theme?: string;
}

interface ResultsFiltersProps {
  results: SheetMusicResult[];
  filters: ActiveFilters;
  onChange: (next: ActiveFilters) => void;
  options?: {
    languages: string[];
    voicings: string[];
    difficulties: string[];
    seasons: string[];
    themes: string[];
  };
}

export const ResultsFilters = ({ results, filters, onChange, options: preset }: ResultsFiltersProps) => {
  const ALL = "__all__";
  // Build option lists from current results so users only see relevant values
  const options = useMemo(() => {
    const uniq = (values: (string | undefined)[]) =>
      Array.from(new Set(values.filter(Boolean) as string[])).sort();

    return preset ?? {
      languages: uniq(results.map(r => r.language)),
      voicings: uniq(results.map(r => r.voicing)),
      difficulties: uniq(results.map(r => r.difficulty)),
      seasons: uniq(results.map(r => r.season)),
      themes: uniq(results.map(r => r.theme)),
    };
  }, [results, preset]);

  const handle = (key: keyof ActiveFilters, value?: string) => {
    const normalized = value === ALL ? undefined : value;
    const next = { ...filters, [key]: normalized };
    if (!normalized) delete (next as any)[key];
    onChange(next);
  };

  const renderSelect = (
    id: keyof ActiveFilters,
    label: string,
    items: string[],
  ) => (
    <div className="flex-1 min-w-[160px]">
      <Label className="mb-1 block">{label}</Label>
      <Select value={filters[id] ?? ALL} onValueChange={(v) => handle(id, v)}>
        <SelectTrigger>
          <SelectValue placeholder={`All ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All</SelectItem>
          {items.map((value) => (
            <SelectItem key={value} value={value}>{value}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {renderSelect("language", "Language", options.languages)}
        {renderSelect("voicing", "Voicing", options.voicings)}
        {renderSelect("difficulty", "Difficulty", options.difficulties)}
        {renderSelect("season", "Season", options.seasons)}
        {renderSelect("theme", "Theme", options.themes)}
      </div>
    </div>
  );
};

export default ResultsFilters;


