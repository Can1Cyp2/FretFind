/* The scale data behind the 'chords that fit' feature. A key is a tonic note plus
   a scale type (major or natural minor). Each scale lists its notes as gaps in
   semitones from the tonic, the chord quality that naturally sits on each scale
   degree (from stacking scale notes in thirds), and the roman numeral names used
   to label those degrees. */

import { ScaleType, TriadQuality } from '../types';

// The notes of each scale, as gaps in semitones up from the tonic
export const SCALE_INTERVALS: Record<ScaleType, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10], // the natural minor scale
};

// The chord built on each degree of the scale (I would eventually like to add more but likely not during this project,
// since these are the most common ones useful to users):
// In a major key that is the familiar: I ii iii IV V vi vii° pattern, 
// in minor: i ii° III iv v VI VII
export const SCALE_DEGREE_QUALITIES: Record<ScaleType, TriadQuality[]> = {
  major: ['major', 'minor', 'minor', 'major', 'major', 'minor', 'dim'],
  minor: ['minor', 'dim', 'major', 'minor', 'minor', 'major', 'major'],
};

// The roman numeral names: uppercase for major chords, lowercase for minor, ° for diminished
export const SCALE_DEGREE_NUMERALS: Record<ScaleType, string[]> = {
  major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  minor: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
};

// The intervals that build each triad quality, for showing the notes of a suggested chord
export const TRIAD_INTERVALS: Record<TriadQuality, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  dim: [0, 3, 6],
};
