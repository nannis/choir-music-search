import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../src/App';

describe('Elegant Design Improvements', () => {
  it('should have a large, prominent search input field', () => {
    render(<App />);
    
    const searchInput = screen.getByRole('textbox');
    expect(searchInput).toHaveClass('input-elegant');
    expect(searchInput).toHaveClass('text-lg'); // Large text
    expect(searchInput).toHaveClass('py-4'); // Substantial padding
  });

  it('should have sophisticated spacing and layout', () => {
    render(<App />);
    
    const main = screen.getByRole('main');
    expect(main).toHaveClass('py-16'); // Generous section spacing
  });

  it('should use refined typography hierarchy', () => {
    render(<App />);
    
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveClass('text-5xl'); // Large, prominent heading
    expect(mainHeading).toHaveClass('font-serif');
    
    const subtitle = screen.getByText(/låt.*musik.*förgyll/i);
    expect(subtitle).toHaveClass('text-xl'); // Substantial subtitle
  });

  it('should have subtle, monochromatic design elements', () => {
    render(<App />);
    
    // Check for refined button styling
    const searchButton = screen.getByRole('button', { name: /sök/i });
    expect(searchButton).toHaveClass('btn-refined');
  });

  it('should have elegant card styling with ample whitespace', () => {
    render(<App />);
    
    const searchCard = document.querySelector('.card-refined');
    expect(searchCard).toBeInTheDocument();
  });
});