// Core note and fretboard types (the basic data the fretboard works with)

// Pitch class: a note without its octave (C, C#, D... B written as numbers 0 to 11)
export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type NoteName =
  | 'C' | 'C#' | 'Db'
  | 'D' | 'D#' | 'Eb'
  | 'E'
  | 'F' | 'F#' | 'Gb'
  | 'G' | 'G#' | 'Ab'
  | 'A' | 'A#' | 'Bb'
  | 'B'; 
  // Note names, including sharps and flats (enharmonic equivalents, for example E and B both mean the next note F and C, as there is no true sharp or flat between them, but they are still different note names that users may prefer to see based on their musical background and the context of the chord they are making)

// String index: which string, from 0 (low E) to 5 (high E), 6 strings on a standard guitar
export type StringIndex = 0 | 1 | 2 | 3 | 4 | 5;

export type FretNumber = number;

// One tapped note: the string, the fret on it, and the note it makes:
export interface FretSelection {
  stringIndex: StringIndex;
  fret: FretNumber;
  pitchClass: PitchClass;
}

// Tuning: the open (unfretted) note of each string
export interface Tuning {
  id: string;
  name: string;
  notes: PitchClass[];
  noteNames: NoteName[];
  isPreset: boolean;
}
