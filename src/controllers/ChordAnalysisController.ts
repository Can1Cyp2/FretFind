import type { ChordAnalysisResult } from '../mockData';

export class ChordAnalysisController {
  identifyChord(selectedNotes: string[]): ChordAnalysisResult {
    const uniqueNotes = Array.from(new Set(selectedNotes));

    // This is intentionally hardcoded for the first deliverable
    if (hasSameNotes(uniqueNotes, ['C', 'E', 'G'])) {
      return {
        selectedNotes,
        bestMatch: 'C',
        quality: 'perfect',
        formula: '1 - 3 - 5',
        explanation:
          'The selected notes contain C, E, and G, which form a C major triad.',
      };
    } // In the real implementation there will be more complex logic here to analyze the notes

    return {
      selectedNotes,
      bestMatch: 'Unknown',
      quality: 'partial',
      formula: 'Not enough mock data',
      explanation:
        'This skeleton only recognizes the hardcoded open C major example.',
    }; // This is a fallback result for any other combination of notes, indicating that the analysis is not yet implemented for those cases
       // In the real implementation, this will be replaced with a message to indicate the notes do not have a clear match chord
  }
}

function hasSameNotes(actual: string[], expected: string[]): boolean {
  return (
    actual.length === expected.length &&
    expected.every((note) => actual.includes(note))
  ); // This checks if the actual notes match the expected notes
}
