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
  octaves: number[]; // the octave each open string sounds in (standard tuning is E2 A2 D3 G3 B3 E4), used for the optional octave labels
  isPreset: boolean;
}

// ----- 
// Chord data (the formulas and the matches the app finds)

// Chord category: a rough grouping for each chord type, used when ranking matches
export type ChordCategory =
  | 'triad'     // Identified by the root, 3rd, and 5th notes
  | 'seventh'   // Identified by the root, 3rd, 5th, and 7th notes
  | 'extended'  // Identified by the root, 3rd, 5th, 7th, 9th, and 11th notes
  | 'suspended' // Identified by the root, 2nd or 4th
  | 'added_tone' // Identified by the root, 3rd, 5th, and 6th
  | 'altered'   // Identified by the root, 3rd, 5th, and 6th
  | 'power'   // Identified by the root and 5th only
  | 'other';    // Unrecognized chord

// Match quality: how well the tapped notes fit a chord. Perfect has every "must have"
// note and nothing extra. Partial is close, missing at most a note or two but still
// has every essential note (or almost does, for the bigger extended chords). Weak
// is shakier still, roughly half of the must-have notes are there, so it is a real
// possibility but not a confident guess.
export type MatchQuality = 'perfect' | 'partial' | 'weak';

// Chord type: the formula for one kind of chord
export interface ChordType {
  name: string;                 // full name, for example: Major 7th
  symbol: string;               // short symbol added after the root, for example maj7
  intervals: number[];          // every note of the chord, as gaps in semitones from the root
  essentialIntervals: number[]; // the notes that must be present for the chord to count
  category: ChordCategory;  // 
}

// Chord match: one chord the matcher thinks the selected notes could be
export interface ChordMatch {
  rootPitchClass: PitchClass;   // the root note as a pitch class
  rootName: NoteName;           // the root note name
  chordType: ChordType;         // which formula matched
  fullName: string;             // the full chord name, for example Cmaj7
  matchQuality: MatchQuality;   // perfect or partial
  matchedIntervals: number[];   // chord notes that were found in the selection
  missingIntervals: number[];   // chord notes that were not found
  extraNotes: number[];         // selected notes that are not part of the chord
  bassNote?: NoteName;          // the lowest note name, only set for inversions
  bassPitchClass?: PitchClass;  // the lowest note as a pitch class, only for inversions
  isInversion: boolean;         // true when the lowest note is not the root
  inversionNumber?: number;     // 1st, 2nd, or 3rd inversion, when it can be worked out
  score: number;                // used to rank the matches against each other
}

// -----------------------------------------------------------------------------------------------------
// Progression data (chords the user collects to write music with):

// One chord added to the progression: enough to name it again and to recall its exact fretboard shape later
export interface ProgressionChord {
  id: string;                   // unique id, so removing and reordering work reliably
  fullName: string;             // the chord name at the time it was added
  rootPitchClass: PitchClass;
  symbol: string;               // the chord symbol, kept so the name can be respelt (sharps or flats)
  bassPitchClass?: PitchClass;  // only set for inversions and slash chords
  matchQuality: MatchQuality;
  selections: (FretSelection | null)[]; // the exact fretboard shape it was played as
}

// A progression saved on the device with a name, so the user can keep more than one
export interface SavedProgression {
  id: string;
  name: string;
  chords: ProgressionChord[];
  createdAt: number; // when it was saved (a milliseconds timestamp)
}

// --------------------
// Key and scale data (for suggesting other chords that fit the progression):

export type ScaleType = 'major' | 'minor'; // the two scale types the app currently recognizes (I may add more later but for now these are the most common)

// The basic chord quality a scale degree carries when its triad is built from scale notes
export type TriadQuality = 'major' | 'minor' | 'dim';

// One key the progression might be in: a tonic note plus a scale type,
// with a score for how well the progression's chords fit inside it
export interface MusicKey {
  tonicPc: PitchClass;
  type: ScaleType;
  name: string;   // for example 'C Major' or 'A Minor'
  score: number;  // used to rank the candidate keys against each other
}

// One chord that belongs to a key: the chord built on one of its scale degrees
export interface DiatonicChord {
  numeral: string;            // the roman numeral (I, ii, V, vii, and so on)
  rootPitchClass: PitchClass;
  quality: TriadQuality;
  symbol: string;               // '' for major, 'm' for minor, 'dim' for diminished
  inProgression: boolean;     // whether the progression already uses this chord
}
