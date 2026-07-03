/* This file holds the table of chord formulas. Each entry describes one kind of
   chord: its name, the short symbol shown after the root, the intervals that make
   it up (as gaps in semitones from the root), and which of those notes are
   essential (must be present for the chord to count). The matcher compares the
   tapped notes against every formula in this table.

   This first version covers the common triads, power chords, suspended chords,
   sixth chords, and the seventh chords. Extended and altered chords can be added
   here later without changing the matching logic. */

import { ChordType } from '../types';

export const CHORD_TYPES: ChordType[] = [
  // Triads (three otes)
  { name: 'Major', symbol: '', intervals: [0, 4, 7], essentialIntervals: [0, 4], category: 'triad' },
  { name: 'Minor', symbol: 'm', intervals: [0, 3, 7], essentialIntervals: [0, 3], category: 'triad' },
  { name: 'Diminished', symbol: 'dim', intervals: [0, 3, 6], essentialIntervals: [0, 3, 6], category: 'triad' },
  { name: 'Augmented', symbol: 'aug', intervals: [0, 4, 8], essentialIntervals: [0, 4, 8], category: 'triad' },

  // Power chord (root and fifth only)
  { name: 'Power Chord', symbol: '5', intervals: [0, 7], essentialIntervals: [0, 7], category: 'power' },

  // Suspended (the third is swapped for a 2nd or a 4th)
  { name: 'Suspended 2nd', symbol: 'sus2', intervals: [0, 2, 7], essentialIntervals: [0, 2, 7], category: 'suspended' },
  { name: 'Suspended 4th', symbol: 'sus4', intervals: [0, 5, 7], essentialIntervals: [0, 5, 7], category: 'suspended' },

  // Sixth chords (a triad with the sixth added)
  { name: 'Major 6th', symbol: '6', intervals: [0, 4, 7, 9], essentialIntervals: [0, 4, 9], category: 'added_tone' },
  { name: 'Minor 6th', symbol: 'm6', intervals: [0, 3, 7, 9], essentialIntervals: [0, 3, 9], category: 'added_tone' },

  // Seventh chords (four notes)
  { name: 'Dominant 7th', symbol: '7', intervals: [0, 4, 7, 10], essentialIntervals: [0, 4, 10], category: 'seventh' },
  { name: 'Major 7th', symbol: 'maj7', intervals: [0, 4, 7, 11], essentialIntervals: [0, 4, 11], category: 'seventh' },
  { name: 'Minor 7th', symbol: 'm7', intervals: [0, 3, 7, 10], essentialIntervals: [0, 3, 10], category: 'seventh' },
  { name: 'Minor Major 7th', symbol: 'mMaj7', intervals: [0, 3, 7, 11], essentialIntervals: [0, 3, 11], category: 'seventh' },
  { name: 'Diminished 7th', symbol: 'dim7', intervals: [0, 3, 6, 9], essentialIntervals: [0, 3, 6, 9], category: 'seventh' },
  { name: 'Half-Diminished 7th', symbol: 'm7b5', intervals: [0, 3, 6, 10], essentialIntervals: [0, 3, 6, 10], category: 'seventh' },
  { name: 'Augmented 7th', symbol: 'aug7', intervals: [0, 4, 8, 10], essentialIntervals: [0, 4, 8, 10], category: 'seventh' },
  
  { name: '7sus4', symbol: '7sus4', intervals: [0, 5, 7, 10], essentialIntervals: [0, 5, 10], category: 'seventh' },
  { name: '7sus2', symbol: '7sus2', intervals: [0, 2, 7, 10], essentialIntervals: [0, 2, 10], category: 'seventh' },
];
