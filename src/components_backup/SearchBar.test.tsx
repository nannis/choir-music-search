import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('allows submitting an empty query', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} isLoading={false} />);
    const button = screen.getByRole('button', { name: /search/i });
    fireEvent.click(button);
    expect(onSearch).toHaveBeenCalledWith('');
  });
});





