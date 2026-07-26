import { Tuning } from '../types';

// Standard tuning: the default 6 string guitar tuning (open strings low E to high e)
export const STANDARD_TUNING: Tuning = {
  id: 'standard', name: 'Standard',
  notes: [4, 9, 2, 7, 11, 4],
  noteNames: ['E', 'A', 'D', 'G', 'B', 'E'], // Defaulted to standard tuning, but can be changed by user
  octaves: [2, 2, 3, 3, 3, 4], // The octave of each open string: E2 A2 D3 G3 B3 E4 (both E strings are 2 octaves apart)
  isPreset: true,
};

// Every other common tuning keeps the same octave spread as standard (2 2 3 3 3 4),
// which stays close enough to real pitch for every one of these to still sound and
// play back sensibly, without needing a per-tuning octave to be worked out by hand.
const COMMON_OCTAVES = [2, 2, 3, 3, 3, 4];

// The rest of the common tunings a guitarist is likely to want, alongside Standard.
// Each one is just a different set of open string pitch classes, the rest of the
// app (the fretboard, the matcher, the audio) already works from open notes alone,
// so no other logic needed to change to support these.
export const COMMON_TUNINGS: Tuning[] = [
  STANDARD_TUNING,
  {
    id: 'drop-d', name: 'Drop D',
    notes: [2, 9, 2, 7, 11, 4],
    noteNames: ['D', 'A', 'D', 'G', 'B', 'E'],
    octaves: COMMON_OCTAVES,
    isPreset: true,
  },
  {
    id: 'half-step-down', name: 'Half Step Down',
    notes: [3, 8, 1, 6, 10, 3],
    noteNames: ['Eb', 'Ab', 'Db', 'Gb', 'Bb', 'Eb'],
    octaves: COMMON_OCTAVES,
    isPreset: true,
  },
  {
    id: 'full-step-down', name: 'Full Step Down',
    notes: [2, 7, 0, 5, 9, 2],
    noteNames: ['D', 'G', 'C', 'F', 'A', 'D'],
    octaves: COMMON_OCTAVES,
    isPreset: true,
  },
  {
    id: 'drop-c', name: 'Drop C',
    notes: [0, 7, 0, 5, 9, 2],
    noteNames: ['C', 'G', 'C', 'F', 'A', 'D'],
    octaves: COMMON_OCTAVES,
    isPreset: true,
  },
  {
    id: 'open-g', name: 'Open G',
    notes: [2, 7, 2, 7, 11, 2],
    noteNames: ['D', 'G', 'D', 'G', 'B', 'D'],
    octaves: COMMON_OCTAVES,
    isPreset: true,
  },
  {
    id: 'open-d', name: 'Open D',
    notes: [2, 9, 2, 6, 9, 2],
    noteNames: ['D', 'A', 'D', 'F#', 'A', 'D'],
    octaves: COMMON_OCTAVES,
    isPreset: true,
  },
  {
    id: 'open-e', name: 'Open E',
    notes: [4, 11, 4, 8, 11, 4],
    noteNames: ['E', 'B', 'E', 'G#', 'B', 'E'],
    octaves: COMMON_OCTAVES,
    isPreset: true,
  },
  {
    id: 'dadgad', name: 'DADGAD',
    notes: [2, 9, 2, 7, 9, 2],
    noteNames: ['D', 'A', 'D', 'G', 'A', 'D'],
    octaves: COMMON_OCTAVES,
    isPreset: true,
  },
];

// Turns each open string into its MIDI note number (a running count of semitones where C4 = 60,
// so every pitch class + octave pair has exactly one number). The fretboard uses these because
// adding the fret number to one gives the exact fretted note, octave included, which is how it
// knows a fretted note crossed into the next octave (for example the A string's 3rd fret is C3, not C2).
    // - This is also helpful for playing the sound of the note (coming in a later deliverable)
export function getOpenStringMidi(tuning: Tuning): number[] {
  return tuning.notes.map((pc, i) => (tuning.octaves[i] + 1) * 12 + pc);
}
