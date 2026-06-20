import { Tuning } from '../types';

// Standard tuning: the default 6 string guitar tuning (open strings low E to high E)
export const STANDARD_TUNING: Tuning = {
  id: 'standard', name: 'Standard',
  notes: [4, 9, 2, 7, 11, 4],
  noteNames: ['E', 'A', 'D', 'G', 'B', 'E'], // Defaulted to standard tuning, but can be changed by user
  isPreset: true,
};
