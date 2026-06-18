import { NoteName } from '../types';

// All sharps
export const PITCH_CLASS_TO_SHARP: NoteName[] = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
];

// All flats
export const PITCH_CLASS_TO_FLAT: NoteName[] = [
  'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B',
];

export const TOTAL_FRETS = 22; // Max frets (22 is a common number for guitar fretboards, but this can be adjusted if needed later, though realitically this many frets is already not truly needed)
export const NUM_STRINGS = 6; // Standard guitar has 6 strings
