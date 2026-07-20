/* Works out which musical keys a progression fits into, and which chords belong
   to a key. This powers the 'chords that fit' view: the progression is scored
   against all 24 keys (12 tonics, major and minor each), the best match becomes
   the default, and the chords built on that key's scale degrees are the
   suggestions.

   The idea is the same trick as the chord matcher: instead of asking the user
   what key they are in, try every key and see which one explains the most of
   what they played. */

import { ChordMatch, DiatonicChord, MusicKey, PitchClass, ProgressionChord, ScaleType, TriadQuality } from '../types';
import { SCALE_INTERVALS, SCALE_DEGREE_QUALITIES, SCALE_DEGREE_NUMERALS } from '../constants/scales';
import { CHORD_TYPES } from '../constants/chords';
import { pitchClassToName } from './noteUtils';
import { formatChordName, formatRootName } from './chordNamer';

/* Boils a chord symbol down to the basic quality of its triad, since key fitting
   only cares whether the chord is major, minor, or diminished at heart:
   - maj7, 6, add9, and the dominant chords (7, 9, 13...) all sit on a major triad
   - m, m7, m9, madd9, mMaj7 and so on all sit on a minor triad
   - dim, dim7, and m7b5 sit on a diminished triad
   - sus and power chords have no third at all, and augmented chords do not sit
     naturally in a major or minor scale, so those only count for their root */
function qualityFromSymbol(symbol: string): TriadQuality | 'other' {
  if (symbol.includes('sus') || symbol === '5') return 'other';
  if (symbol.startsWith('maj')) return 'major';
  if (symbol.startsWith('dim')) return 'dim';
  if (symbol.startsWith('aug') || symbol.includes('#5')) return 'other';
  if (symbol.startsWith('m')) return symbol.includes('b5') ? 'dim' : 'minor';
  return 'major';
}

// Scores every key against the progression and returns them best first.
// A chord scores 2 when it is exactly the chord that key would build on that
// degree, 1 when only its root note is in the scale, and 0 when not even that.
export function rankKeys(progression: ProgressionChord[], preferFlats?: boolean): MusicKey[] {
  const keys: MusicKey[] = [];

  for (let tonic = 0; tonic < 12; tonic++) {
    const tonicPc = tonic as PitchClass;
    for (const type of ['major', 'minor'] as ScaleType[]) {
      const scale = SCALE_INTERVALS[type];
      const qualities = SCALE_DEGREE_QUALITIES[type];

      let score = 0;
      for (const chord of progression) {
        const gap = (chord.rootPitchClass - tonicPc + 12) % 12;
        const degree = scale.indexOf(gap);
        if (degree === -1) continue; // the chord's root is not even in this scale
        const quality = qualityFromSymbol(chord.symbol);
        score += quality === qualities[degree] ? 2 : 1;
      }

      // Small tiebreaker: progressions very often start on their key's home chord
      if (progression.length > 0 && progression[0].rootPitchClass === tonicPc) {
        score += 0.5;
      }

      keys.push({
        tonicPc,
        type,
        name: `${pitchClassToName(tonicPc, preferFlats)} ${type === 'major' ? 'Major' : 'Minor'}`,
        score,
      });
    }
  }

  // Best score first, and when two keys tie the major one is listed first
  // (a major key and its relative minor share every note, so ties are common)
  keys.sort((a, b) => b.score - a.score || (a.type === 'major' ? -1 : 1));
  return keys;
}

// The seven chords a key builds on its scale degrees, with the ones the
// progression already uses marked, so the suggestions show what is left to try
export function getDiatonicChords(key: MusicKey, progression: ProgressionChord[]): DiatonicChord[] {
  const scale = SCALE_INTERVALS[key.type];
  const qualities = SCALE_DEGREE_QUALITIES[key.type];
  const numerals = SCALE_DEGREE_NUMERALS[key.type];

  return scale.map((gap, degree) => {
    const rootPitchClass = ((key.tonicPc + gap) % 12) as PitchClass;
    const quality = qualities[degree];
    const symbol = quality === 'major' ? '' : quality === 'minor' ? 'm' : 'dim';
    const inProgression = progression.some(
      c => c.rootPitchClass === rootPitchClass && qualityFromSymbol(c.symbol) === quality,
    );
    return { numeral: numerals[degree], rootPitchClass, quality, symbol, inProgression };
  });
}

// Turns a suggested chord into a full chord match, so the theory breakdown view can
// open for it exactly like it does for a matched chord. Every chord note counts as
// present, because this is the chord in its ideal form, not a comparison against
// anything the user tapped.
export function diatonicChordToMatch(chord: DiatonicChord, preferFlats?: boolean): ChordMatch {
  // The plain major, minor, and diminished formulas are all in the chord table
  const chordType = CHORD_TYPES.find(t => t.symbol === chord.symbol)!;
  return {
    rootPitchClass: chord.rootPitchClass,
    rootName: formatRootName(chord.rootPitchClass, preferFlats),
    chordType,
    fullName: formatChordName(chord.rootPitchClass, chord.symbol, undefined, preferFlats),
    matchQuality: 'perfect',
    matchedIntervals: [...chordType.intervals],
    missingIntervals: [],
    extraNotes: [],
    isInversion: false,
    score: 0,
  };
}
