/* This file builds the readable chord name from a root note and a chord symbol.
   For example, a root of C with the symbol 'maj7' becomes 'Cmaj7'. It also works
   out the actual note names that make up a chord, which the results use when they
   list the notes of a match. */

import { PitchClass, NoteName } from '../types';
import { DEFAULT_ROOT_SPELLING, PITCH_CLASS_TO_SHARP, PITCH_CLASS_TO_FLAT } from '../constants/notes';
import { pitchClassToName } from './noteUtils';

// Picks the name for the root note. Uses sharps or flats when the user has chosen,
// otherwise falls back to the more common spelling for that note.
export function formatRootName(rootPC: PitchClass, preferFlats?: boolean): NoteName {
  if (preferFlats === true) return PITCH_CLASS_TO_FLAT[rootPC];
  if (preferFlats === false) return PITCH_CLASS_TO_SHARP[rootPC];
  return DEFAULT_ROOT_SPELLING[rootPC];
}

// Builds the full chord name, for example 'Cmaj7'. When the lowest note is not the
// root (a slash chord), the bass note is added after a slash, for example 'C/E'
export function formatChordName(rootPC: PitchClass, symbol: string, bassPC?: PitchClass, preferFlats?: boolean): string {
  const rootName = formatRootName(rootPC, preferFlats);
  let name = `${rootName}${symbol}`;
  if (bassPC !== undefined && bassPC !== rootPC) {
    const bassName = formatRootName(bassPC, preferFlats);
    name += `/${bassName}`;
  }
  return name;
}

// Works out the actual note names in a chord, from its root and its interval formula:
export function getNotesInChord(rootPC: PitchClass, intervals: number[], preferFlats?: boolean): NoteName[] {
  const useFlats = preferFlats ?? ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb'].includes(DEFAULT_ROOT_SPELLING[rootPC]);
  return intervals.map(iv => {
    const pc = ((rootPC + iv) % 12) as PitchClass;
    return pitchClassToName(pc, useFlats);
  });
}
