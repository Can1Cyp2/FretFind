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
