import type { ChordAnalysisResult } from '../mockData';

export class ChordAnalysisController {
  identifyChord(selectedNotes: string[]): ChordAnalysisResult {
    const uniqueNotes = Array.from(new Set(selectedNotes));

    // This is intentionally hardcoded for the first deliverable proof.
    if (hasSameNotes(uniqueNotes, ['C', 'E', 'G'])) {
      return {
        selectedNotes,
        bestMatch: 'C',
        quality: 'perfect',
        formula: '1 - 3 - 5',
        explanation:
          'The selected notes contain C, E, and G, which form a C major triad.',
      };
    }

    return {
      selectedNotes,
      bestMatch: 'Unknown',
      quality: 'partial',
      formula: 'Not enough mock data',
      explanation:
        'This skeleton only recognizes the hardcoded open C major example.',
    };
  }
}

function hasSameNotes(actual: string[], expected: string[]): boolean {
  return (
    actual.length === expected.length &&
    expected.every((note) => actual.includes(note))
  );
}
