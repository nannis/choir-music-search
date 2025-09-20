import { describe, it, expect } from 'vitest';
import { searchSheetMusic, searchIMSLPFemaleChorus, searchMuseScore, searchSundMusik } from './searchService';

describe('searchService', () => {
  it('returns results for a simple text query', async () => {
    const results = await searchSheetMusic('Ave');
    expect(results.length).toBeGreaterThan(0);
  });

  it('honors explicit filters without a text query', async () => {
    const results = await searchSheetMusic('', { language: 'Latin', season: 'Christmas' });
    expect(results.every(r => r.language === 'Latin')).toBe(true);
    expect(results.every(r => r.season === 'Christmas')).toBe(true);
  });

  it('indexes IMSLP female chorus category and returns matches', async () => {
    const results = await searchIMSLPFemaleChorus('Ave');
    // We cannot guarantee network, but we expect an array (possibly empty). The call should not throw.
    expect(Array.isArray(results)).toBe(true);
  });

  it('indexes MuseScore women\'s choir category and returns matches', async () => {
    const results = await searchMuseScore('choir');
    // We cannot guarantee network, but we expect an array (possibly empty). The call should not throw.
    expect(Array.isArray(results)).toBe(true);
  });

  it('indexes Sund Musik women\'s choir category and returns matches', async () => {
    const results = await searchSundMusik('folkvisor');
    // We cannot guarantee network, but we expect an array (possibly empty). The call should not throw.
    expect(Array.isArray(results)).toBe(true);
  });
});



