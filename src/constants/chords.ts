/* This file holds the table of chord formulas. Each entry describes one kind of
   chord: its name, the short symbol shown after the root, the intervals that make
   it up (as gaps in semitones from the root), and which of those notes are
   essential (must be present for the chord to count). The matcher compares the
   tapped notes against every formula in this table.

   This covers the common triads, power chords, suspended chords, sixth chords,
   the seventh chords, the added-tone chords, and the common extended chords.
   More types can still be added here later without changing the matching logic. */

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

  /* Tone chords: a plain triad with one extra colour note dropped in, and no 7th.
     The added note is named an octave up (the 9th is the same note as the 2nd, the 11th
     the same as the 4th), so a 9th adds interval 2 and an 11th adds interval 5.
     The added note is essential (it is the whole point of the chord) whereas the fifth is not essential. */
  { name: 'Add 9', symbol: 'add9', intervals: [0, 2, 4, 7], essentialIntervals: [0, 2, 4], category: 'added_tone' },
  { name: 'Minor Add 9', symbol: 'madd9', intervals: [0, 2, 3, 7], essentialIntervals: [0, 2, 3], category: 'added_tone' },
  { name: 'Add 11', symbol: 'add11', intervals: [0, 4, 5, 7], essentialIntervals: [0, 4, 5], category: 'added_tone' },
  { name: '6/9', symbol: '6/9', intervals: [0, 2, 4, 7, 9], essentialIntervals: [0, 2, 4, 9], category: 'added_tone' },
  { name: 'Minor 6/9', symbol: 'm6/9', intervals: [0, 2, 3, 7, 9], essentialIntervals: [0, 2, 3, 9], category: 'added_tone' },

  // 9th chords: a seventh chord with the 9th added, so the 9th and the 7th are the essentials
  // (the notes include: the root, the 3rd, the 5th, the 7th, and the 9th of the scale)
  { name: 'Dominant 9th', symbol: '9', intervals: [0, 2, 4, 7, 10], essentialIntervals: [0, 2, 4, 10], category: 'extended' },
  { name: 'Major 9th', symbol: 'maj9', intervals: [0, 2, 4, 7, 11], essentialIntervals: [0, 2, 4, 11], category: 'extended' },
  { name: 'Minor 9th', symbol: 'm9', intervals: [0, 2, 3, 7, 10], essentialIntervals: [0, 2, 3, 10], category: 'extended' },

  // 11th chords: the 9th chord with the 11th added. 
  // In a dominant 11th the 3rd is usually left out when played (it clashes with the 11th), so its essentials are just root, 11th, and 7th
  { name: 'Dominant 11th', symbol: '11', intervals: [0, 2, 4, 5, 7, 10], essentialIntervals: [0, 5, 10], category: 'extended' },
  { name: 'Minor 11th', symbol: 'm11', intervals: [0, 2, 3, 5, 7, 10], essentialIntervals: [0, 3, 5, 10], category: 'extended' },

  // 13th chords: the whole stack. Only the root, the 3rd, the 7th, and the 13th are essential, 
  // which is the four note voicing guitarists actually play for these (no 9th or 11th)
  { name: 'Dominant 13th', symbol: '13', intervals: [0, 2, 4, 5, 7, 9, 10], essentialIntervals: [0, 4, 9, 10], category: 'extended' },
  { name: 'Minor 13th', symbol: 'm13', intervals: [0, 2, 3, 5, 7, 9, 10], essentialIntervals: [0, 3, 9, 10], category: 'extended' },
  { name: 'Major 13th', symbol: 'maj13', intervals: [0, 2, 4, 5, 7, 9, 11], essentialIntervals: [0, 4, 9, 11], category: 'extended' },
];
