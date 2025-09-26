/**
 * SearchFilters component provides filtering options for search results
 * Allows users to filter by source, voicing, difficulty, language, theme, season, and period
 */

import { useState } from 'react';

export interface FilterOptions {
  source: string[];
  voicing: string[];
  difficulty: string[];
  language: string[];
  theme: string[];
  season: string[];
  period: string[];
}

export interface SearchFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

// Available filter options based on actual database content
const FILTER_OPTIONS = {
  source: [
    // Note: Source data is null in database, so no source filters available
  ],
  voicing: [
    { value: 'SSA', label: 'SSA (3-part women)' },
    { value: 'SSAA', label: 'SSAA (4-part women)' }
  ],
  difficulty: [
    { value: 'Easy', label: 'Easy' },
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' }
  ],
  language: [
    { value: 'English', label: 'English' },
    { value: 'Macedonian', label: 'Macedonian' },
    { value: 'Serbian', label: 'Serbian' },
    { value: 'Swedish', label: 'Swedish' },
    { value: 'Various', label: 'Various' }
  ],
  theme: [
    { value: 'Folk', label: 'Folk' }
  ],
  season: [
    { value: 'Summer', label: 'Summer' }
  ],
  period: [
    // Note: Period data is null in database, so no period filters available
  ]
};

export const SearchFilters = ({ filters, onFiltersChange, isVisible, onToggleVisibility }: SearchFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (category: keyof FilterOptions, value: string, checked: boolean) => {
    const currentValues = filters[category];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    const newFilters = {
      ...filters,
      [category]: newValues
    };
    
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      source: [],
      voicing: [],
      difficulty: [],
      language: [],
      theme: [],
      season: [],
      period: []
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).reduce((total, category) => total + category.length, 0);
  };

  const renderFilterCategory = (category: keyof FilterOptions, label: string, options: Array<{value: string, label: string}>) => {
    // Only render categories that have options
    if (options.length === 0) {
      return null;
    }
    
    return (
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">{label}</h4>
        <div className="space-y-2">
          {options.map(option => (
            <label key={option.value} className="flex items-center">
              <input
                type="checkbox"
                checked={filters[category].includes(option.value)}
                onChange={(e) => handleFilterChange(category, option.value, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  if (!isVisible) {
    return (
      <div className="mb-6">
        <button
          onClick={onToggleVisibility}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {getActiveFilterCount() > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8 bg-gray-50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Filter Results</h3>
          {getActiveFilterCount() > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {getActiveFilterCount()} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {getActiveFilterCount() > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onToggleVisibility}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {renderFilterCategory('source', 'Source', FILTER_OPTIONS.source)}
        {renderFilterCategory('voicing', 'Voicing', FILTER_OPTIONS.voicing)}
        {renderFilterCategory('difficulty', 'Difficulty', FILTER_OPTIONS.difficulty)}
        {renderFilterCategory('language', 'Language', FILTER_OPTIONS.language)}
        {renderFilterCategory('theme', 'Theme', FILTER_OPTIONS.theme)}
        {renderFilterCategory('season', 'Season', FILTER_OPTIONS.season)}
        {renderFilterCategory('period', 'Period', FILTER_OPTIONS.period)}
      </div>

      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Select filters to narrow down your search results
            </p>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
