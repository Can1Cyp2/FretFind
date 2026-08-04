/* Works out which musical keys a progression fits into, and which chords belong
   to a key. This powers the 'chords that fit' view: the progression is scored
   against all 24 keys (12 tonics, major and minor each), the best match becomes
   the default, and the chords built on that key's scale degrees are the
   suggestions.

   The idea is the same trick as the chord matcher: instead of asking the user
   what key they are in, try every key and see which one explains the most of
   what they played. */

import { ChordMatch, DiatonicChord, MusicKey, PitchClass, ProgressionChord, ScaleType, TriadQuality } from '../types';
import { SCALE_INTERVALS, SCALE_DEGREE_QUALITIES, SCALE_DEGREE_NUMERALS, TRIAD_INTERVALS } from '../constants/scales';
import { CHORD_TYPES } from '../constants/chords';
import { pitchClassToName } from './noteUtils';
import { formatChordName, formatRootName, getNotesInChord } from './chordNamer';

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

/* Explains one chord of a key using that keys actual notes, rather than in the generic text. 
   The explanations say what a degree does in general (vii is tense, IV sounds like open air, and so on), which
   is the half that transfers to every key. This is the other half: in the key the user is actually looking at, 
   which chord is it, which notes is it made of, and why does it come out major, minor or diminished rather than something else.

   The why is worth pointing out because it is the one part a beginner cannot see from the chord list. 
   A major third on the bottom gives major, a minor third on the bottom gives minor, 
   and two minor thirds stacked give diminished because that leaves the outer fifth a semitone short. 
   Naming the real notes and the real semitone counts makes it easier to understand to someone who does not understand theory */
export function explainDiatonicChord(
  key: MusicKey,
  chord: DiatonicChord,
  preferFlats?: boolean,
): string {
  const name = formatChordName(chord.rootPitchClass, chord.symbol, undefined, preferFlats);
  const notes = getNotesInChord(chord.rootPitchClass, TRIAD_INTERVALS[chord.quality], preferFlats);
  const [root, third, fifth] = notes;

  // The two stacked thirds, measured off the triad formula rather than hardcoded,
  // so this cannot drift out of step with the intervals the rest of the app uses
  const intervals = TRIAD_INTERVALS[chord.quality];
  const lowerThird = intervals[1];
  const upperThird = intervals[2] - intervals[1];
  const outerFifth = intervals[2];
  const thirdName = (semitones: number) => (semitones === 4 ? 'a major third' : 'a minor third');

  // What the two third sizes add up to, which is the actual reason for the quality:
  const why =
    chord.quality === 'major'
      ? `The major third at the bottom is what makes it major, and ${root} up to ${fifth} comes out at ${outerFifth} semitones, an ordinary perfect fifth.`
      : chord.quality === 'minor'
        ? `The minor third at the bottom is what makes it minor, and ${root} up to ${fifth} still comes out at ${outerFifth} semitones, an ordinary perfect fifth.`
        : `Two minor thirds stacked leaves ${root} up to ${fifth} at only ${outerFifth} semitones instead of the usual 7, so the fifth is flattened, and that flattened fifth is what makes the chord diminished. It is also why this chord sounds unstable next to the others.`;

  return (
    `In ${key.name}, ${chord.numeral} is ${name}, made of ${notes.join(', ')}. ` +
    `Those are every other note of the ${key.name} scale starting from ${root}, which is how every chord in a key is built. ` +
    `${root} up to ${third} is ${lowerThird} semitones (${thirdName(lowerThird)}), and ${third} up to ${fifth} is ${upperThird} semitones (${thirdName(upperThird)}). ` +
    why
  );
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
