import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../src/App';

describe('Stockholm Aesthetic Improvements', () => {
  it('should display elegant heading with serif font', () => {
    render(<App />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('font-serif');
    expect(heading).toHaveTextContent(/choir.*music.*search/i);
  });

  it('should have cream/warm background aesthetic', () => {
    render(<App />);
    
    const main = screen.getByRole('main');
    expect(main).toHaveClass('bg-cream-50');
  });

  it('should display elegant subtitle in Swedish', () => {
    render(<App />);
    
    // Should have an elegant subtitle similar to Stockholm choir
    const subtitle = screen.getByText(/låt.*musik.*förgyll/i);
    expect(subtitle).toBeInTheDocument();
    expect(subtitle).toHaveClass('font-serif');
  });

  it('should have refined card styling with subtle shadows', () => {
    render(<App />);
    
    const searchSection = screen.getByRole('form');
    const parentCard = searchSection.closest('.card-elegant');
    expect(parentCard).toHaveClass('shadow-elegant');
  });

  it('should use elegant color scheme', () => {
    render(<App />);
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).toHaveClass('btn-elegant');
  });
});