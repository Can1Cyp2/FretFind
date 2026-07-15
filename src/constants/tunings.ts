import { Tuning } from '../types';

// Standard tuning: the default 6 string guitar tuning (open strings low E to high e)
export const STANDARD_TUNING: Tuning = {
  id: 'standard', name: 'Standard',
  notes: [4, 9, 2, 7, 11, 4],
  noteNames: ['E', 'A', 'D', 'G', 'B', 'E'], // Defaulted to standard tuning, but can be changed by user
  octaves: [2, 2, 3, 3, 3, 4], // The octave of each open string: E2 A2 D3 G3 B3 E4 (both E strings are 2 octaves apart)
  isPreset: true,
};

// Turns each open string into its MIDI note number (a running count of semitones where C4 = 60,
// so every pitch class + octave pair has exactly one number). The fretboard uses these because
// adding the fret number to one gives the exact fretted note, octave included, which is how it
// knows a fretted note crossed into the next octave (for example the A string's 3rd fret is C3, not C2).
    // - This is also helpful for playing the sound of the note (coming in a later deliverable)
export function getOpenStringMidi(tuning: Tuning): number[] {
  return tuning.notes.map((pc, i) => (tuning.octaves[i] + 1) * 12 + pc);
}
