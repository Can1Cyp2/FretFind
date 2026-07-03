import { PitchClass, NoteName } from '../types';
import { PITCH_CLASS_TO_SHARP, PITCH_CLASS_TO_FLAT } from '../constants/notes';

// Helper functions for working with musical notes and pitch classes:

// Gets the pitch class at a given fret, based on the open string's pitch class
export function getPitchClassAtFret(openStringPC: PitchClass, fret: number): PitchClass {
  return ((openStringPC + fret) % 12) as PitchClass;
}

// Converts a pitch class to a note name, for example (C sharp) C# becomes Db (D flat) if preferFlats is true (set by user)
// This is only a visual preference, unless the person using the app already knows enough music theory for this to matter to their understanding of the fretboard.
export function pitchClassToName(pc: PitchClass, preferFlats?: boolean): NoteName {
  return preferFlats ? PITCH_CLASS_TO_FLAT[pc] : PITCH_CLASS_TO_SHARP[pc];
}

// Gets the gap in semitones from one note up to another (always 0 to 11)
export function interval(from: PitchClass, to: PitchClass): number {
  return (to - from + 12) % 12;
}

// Gets the set of gaps from a root note to a group of notes, sorted low to high (no repeats)
export function computeIntervalSet(root: PitchClass, pitchClasses: PitchClass[]): number[] {
  return [...new Set(pitchClasses.map(pc => interval(root, pc)))].sort((a, b) => a - b);
}

// Short interval name, for example R for the root, b3 for a minor third, 5 for a perfect fifth
export function intervalToName(semitones: number): string {
  const names: Record<number, string> = {
    0: 'R', 1: 'b2', 2: '2', 3: 'b3', 4: '3', 5: '4',
    6: 'b5', 7: '5', 8: '#5', 9: '6', 10: 'b7', 11: '7',
  };
  return names[semitones % 12] ?? `${semitones}`;
}

// Long interval name, for example Root, Minor 3rd, Perfect 5th
export function intervalToFullName(semitones: number): string {
  const names: Record<number, string> = {
    0: 'Root', 1: 'Minor 2nd', 2: 'Major 2nd', 3: 'Minor 3rd',
    4: 'Major 3rd', 5: 'Perfect 4th', 6: 'Tritone', 7: 'Perfect 5th',
    8: 'Minor 6th', 9: 'Major 6th', 10: 'Minor 7th', 11: 'Major 7th',
  };
  return names[semitones % 12] ?? `Interval ${semitones}`;
}
