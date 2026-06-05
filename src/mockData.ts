export type FretSelection = {
  string: number;
  fret: number;
  note: string;
};

export type ChordAnalysisResult = {
  selectedNotes: string[];
  bestMatch: string;
  quality: 'perfect' | 'partial'; 
  formula: string;
  explanation: string;
};

export type ProgressionAnalysisResult = {
  progression: string[];
  candidateChord: string;
  fits: boolean;
  summary: string;
  reasons: string[];
  warnings: string[];
};

export const mockFretSelections: FretSelection[] = [
  { string: 5, fret: 3, note: 'C' },
  { string: 4, fret: 2, note: 'E' },
  { string: 3, fret: 0, note: 'G' },
  { string: 2, fret: 1, note: 'C' },
  { string: 1, fret: 0, note: 'E' },
];

export const mockProgression = ['C', 'Am', 'F', 'G'];
export const mockCandidateChord = 'Em';
