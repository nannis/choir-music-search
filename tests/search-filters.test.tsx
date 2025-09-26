/**
 * Tests for the SearchFilters component
 * Verifies filter functionality and user interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchFilters, FilterOptions } from '../src/components/SearchFilters';

describe('SearchFilters Component', () => {
  const mockFilters: FilterOptions = {
    source: [],
    voicing: [],
    difficulty: [],
    language: [],
    theme: [],
    season: [],
    period: []
  };

  const mockOnFiltersChange = vi.fn();
  const mockOnToggleVisibility = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render filter toggle button when not visible', () => {
    render(
      <SearchFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        isVisible={false}
        onToggleVisibility={mockOnToggleVisibility}
      />
    );

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should show active filter count when filters are applied', () => {
    const filtersWithActive = {
      ...mockFilters,
      voicing: ['SSA', 'SSAA'],
      difficulty: ['Easy']
    };

    render(
      <SearchFilters
        filters={filtersWithActive}
        onFiltersChange={mockOnFiltersChange}
        isVisible={false}
        onToggleVisibility={mockOnToggleVisibility}
      />
    );

    expect(screen.getByText('3')).toBeInTheDocument(); // 2 voicing + 1 difficulty = 3 active filters
  });

  it('should render all available filter categories when visible', () => {
    render(
      <SearchFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onToggleVisibility={mockOnToggleVisibility}
      />
    );

    expect(screen.getByText('Filter Results')).toBeInTheDocument();
    expect(screen.getByText('Voicing')).toBeInTheDocument();
    expect(screen.getByText('Difficulty')).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Season')).toBeInTheDocument();
    
    // Source and Period categories should not be rendered (no options available)
    expect(screen.queryByText('Source')).not.toBeInTheDocument();
    expect(screen.queryByText('Period')).not.toBeInTheDocument();
  });

  it('should show active filter count in header when visible', () => {
    const filtersWithActive = {
      ...mockFilters,
      voicing: ['SSA'],
      difficulty: ['Easy', 'Intermediate']
    };

    render(
      <SearchFilters
        filters={filtersWithActive}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onToggleVisibility={mockOnToggleVisibility}
      />
    );

    expect(screen.getByText('3 active')).toBeInTheDocument();
  });

  it('should call onToggleVisibility when toggle button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <SearchFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        isVisible={false}
        onToggleVisibility={mockOnToggleVisibility}
      />
    );

    const toggleButton = screen.getByText('Filters');
    await user.click(toggleButton);

    expect(mockOnToggleVisibility).toHaveBeenCalledTimes(1);
  });

  it('should call onFiltersChange when checkbox is checked', async () => {
    const user = userEvent.setup();
    
    render(
      <SearchFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onToggleVisibility={mockOnToggleVisibility}
      />
    );

    const ssaCheckbox = screen.getByLabelText('SSA (3-part women)');
    await user.click(ssaCheckbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      voicing: ['SSA']
    });
  });

  it('should call onFiltersChange when checkbox is unchecked', async () => {
    const user = userEvent.setup();
    
    const filtersWithSSA = {
      ...mockFilters,
      voicing: ['SSA']
    };

    render(
      <SearchFilters
        filters={filtersWithSSA}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onToggleVisibility={mockOnToggleVisibility}
      />
    );

    const ssaCheckbox = screen.getByLabelText('SSA (3-part women)');
    await user.click(ssaCheckbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      voicing: []
    });
  });

  it('should show clear all button when filters are active', () => {
    const filtersWithActive = {
      ...mockFilters,
      voicing: ['SSA']
    };

    render(
      <SearchFilters
        filters={filtersWithActive}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onToggleVisibility={mockOnToggleVisibility}
      />
    );

    expect(screen.getByText('Clear all')).toBeInTheDocument();
  });

  it('should not show clear all button when no filters are active', () => {
    render(
      <SearchFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onToggleVisibility={mockOnToggleVisibility}
      />
    );

    expect(screen.queryByText('Clear all')).not.toBeInTheDocument();
  });

  it('should call onFiltersChange with empty filters when clear all is clicked', async () => {
    const user = userEvent.setup();
    
    const filtersWithActive = {
      ...mockFilters,
      voicing: ['SSA'],
      difficulty: ['Easy']
    };

    render(
      <SearchFilters
        filters={filtersWithActive}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onToggleVisibility={mockOnToggleVisibility}
      />
    );

    const clearAllButton = screen.getByText('Clear all');
    await user.click(clearAllButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      source: [],
      voicing: [],
      difficulty: [],
      language: [],
      theme: [],
      season: [],
      period: []
    });
  });

  it('should render all available filter options for each category', () => {
    render(
      <SearchFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onToggleVisibility={mockOnToggleVisibility}
      />
    );

    // Check voicing options (only SSA and SSAA are available)
    expect(screen.getByLabelText('SSA (3-part women)')).toBeInTheDocument();
    expect(screen.getByLabelText('SSAA (4-part women)')).toBeInTheDocument();

    // Check difficulty options (Easy, Beginner, Intermediate, Advanced)
    expect(screen.getByLabelText('Easy')).toBeInTheDocument();
    expect(screen.getByLabelText('Beginner')).toBeInTheDocument();
    expect(screen.getByLabelText('Intermediate')).toBeInTheDocument();
    expect(screen.getByLabelText('Advanced')).toBeInTheDocument();

    // Check language options (English, Macedonian, Serbian, Swedish, Various)
    expect(screen.getByLabelText('English')).toBeInTheDocument();
    expect(screen.getByLabelText('Macedonian')).toBeInTheDocument();
    expect(screen.getByLabelText('Serbian')).toBeInTheDocument();
    expect(screen.getByLabelText('Swedish')).toBeInTheDocument();
    expect(screen.getByLabelText('Various')).toBeInTheDocument();

    // Check theme options (only Folk is available)
    expect(screen.getByLabelText('Folk')).toBeInTheDocument();

    // Check season options (only Summer is available)
    expect(screen.getByLabelText('Summer')).toBeInTheDocument();

    // Source and Period categories should not be rendered (no options available)
    expect(screen.queryByText('Source')).not.toBeInTheDocument();
    expect(screen.queryByText('Period')).not.toBeInTheDocument();
  });

  it('should handle multiple selections in same category', async () => {
    const user = userEvent.setup();
    
    render(
      <SearchFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onToggleVisibility={mockOnToggleVisibility}
      />
    );

    // Select multiple voicing options (SSA and SSAA are available)
    await user.click(screen.getByLabelText('SSA (3-part women)'));
    await user.click(screen.getByLabelText('SSAA (4-part women)'));

    // Check that both calls were made with the correct individual changes
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      voicing: ['SSA']
    });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      voicing: ['SSAA']
    });
  });

  it('should handle selections across different categories', async () => {
    const user = userEvent.setup();
    
    render(
      <SearchFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onToggleVisibility={mockOnToggleVisibility}
      />
    );

    // Select from different categories (using available options)
    await user.click(screen.getByLabelText('SSA (3-part women)')); // Voicing
    await user.click(screen.getByLabelText('Easy')); // Difficulty
    await user.click(screen.getByLabelText('English')); // Language

    // Check that each individual change was called correctly
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      voicing: ['SSA']
    });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      difficulty: ['Easy']
    });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      language: ['English']
    });
  });
});
