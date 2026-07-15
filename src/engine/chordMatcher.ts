/* This file holds the reverse chord matching: it takes the notes the user tapped
   and works out which chords they could be
    This is the main technical idea of the app, so the steps are listed here to make it easy to understand:

   1. Collect the tapped notes as pitch classes and drop any repeats
   2. Find the bass note (the lowest string that has a selection) (this is likely to be the root, but not always)
   3. try all twelve notes as a possible root, one at a time
   4. For each root, measure the gap (interval) from the root to every note, and compare thos e gaps against every chord formula
   5. Give each match a score, then sort the matches from best to worst.
   */

import { PitchClass, FretSelection, ChordMatch, ChordType, MatchQuality } from '../types';
import { CHORD_TYPES } from '../constants/chords';
import { interval } from './noteUtils';
import { formatChordName, formatRootName } from './chordNamer';

// turn the tapped notes into a ranked list of chord matches
export function identifyChords(selections: FretSelection[], preferFlats?: boolean): ChordMatch[] {
  // A single note is not a chord, so there is nothing to match yet
  if (selections.length < 2) return [];

  // The unique pitch classes that were tapped (repeats removed)
  const uniquePCs = [...new Set(selections.map(s => s.pitchClass))] as PitchClass[];

  // The bass note is the lowest string that has a selection (string 0 is the low E)
  const sorted = [...selections].sort((a, b) => a.stringIndex - b.stringIndex);
  const bassPC = sorted[0].pitchClass;

  const results: ChordMatch[] = [];

  // Try every note as a possible root, and test it against every chord formula
  for (let root = 0; root < 12; root++) {
    const rootPC = root as PitchClass;
    // The gaps (intervals) from this root up to each tapped note.
    const intervalSet = new Set(uniquePCs.map(pc => interval(rootPC, pc)));

    for (const chordType of CHORD_TYPES) {
      const match = evaluateMatch(rootPC, chordType, intervalSet, bassPC, preferFlats);
      if (match) results.push(match);
    }
  }

  // Best matches first
  results.sort((a, b) => b.score - a.score);

  // The same chord name can come up more than once, so keep only the highest scoring of each
  const seen = new Set<string>();
  const deduped: ChordMatch[] = [];
  for (const match of results) {
    if (!seen.has(match.fullName)) {
      seen.add(match.fullName);
      deduped.push(match);
    }
  }

  return deduped.slice(0, 20);
}

// Tests one root and one chord formula against the tapped notes. Returns a match,
// or null when the notes do not fit this chord well enough to be worth showing
function evaluateMatch(
  rootPC: PitchClass,
  chordType: ChordType,
  intervalSet: Set<number>,
  bassPC: PitchClass,
  preferFlats?: boolean,
): ChordMatch | null {
  const chordIntervalSet = new Set(chordType.intervals);

  // Chord notes that were tapped, chord notes that were missed, and the must-have notes that were missed
  const matchedIntervals = chordType.intervals.filter(iv => intervalSet.has(iv));
  const missingIntervals = chordType.intervals.filter(iv => !intervalSet.has(iv));
  const missingEssential = chordType.essentialIntervals.filter(iv => !intervalSet.has(iv));

  // Tapped notes that are not part of this chord
  const extraNotes = [...intervalSet].filter(iv => !chordIntervalSet.has(iv));

  // The root itself has to be one of the tapped notes (interval 0)
  const rootInSelection = intervalSet.has(0);

  // Decide whether this is a perfect match, a partial match, or not a match at all
  const quality = classifyMatch(missingEssential, extraNotes, rootInSelection, chordType);
  if (!quality) return null;

  // If the lowest note is not the root, the chord is an inversion or a slash chord
  const bassInterval = interval(rootPC, bassPC);
  const isInversion = bassPC !== rootPC && rootInSelection;
  let inversionNumber: number | undefined;
  if (isInversion) {

    // The bass landing on the chord's 2nd, 3rd, or 4th note means a 1st, 2nd, or 3rd inversion
    if (chordType.intervals.length > 1 && bassInterval === chordType.intervals[1]) inversionNumber = 1;
    else if (chordType.intervals.length > 2 && bassInterval === chordType.intervals[2]) inversionNumber = 2;
    else if (chordType.intervals.length > 3 && bassInterval === chordType.intervals[3]) inversionNumber = 3;
  }

  const score = scoreMatch(
    quality,
    rootInSelection,
    bassPC === rootPC,
    extraNotes.length,
    matchedIntervals.length,
    chordType.intervals.length,
    chordType,
  );

  const fullName = formatChordName(rootPC, chordType.symbol, isInversion ? bassPC : undefined, preferFlats);

  return {
    rootPitchClass: rootPC,
    rootName: formatRootName(rootPC, preferFlats),
    chordType,
    fullName,
    matchQuality: quality,
    matchedIntervals,
    missingIntervals,
    extraNotes,
    bassNote: isInversion ? formatRootName(bassPC, preferFlats) : undefined,
    bassPitchClass: isInversion ? bassPC : undefined,
    isInversion,
    inversionNumber,
    score,
  };
}

// Decides how well the notes fit: 'perfect', 'partial', 'weak', or null (back end logic for the front end:
function classifyMatch(
  missingEssential: number[],
  extraNotes: number[],
  rootInSelection: boolean,
  chordType: ChordType,
): MatchQuality | null {

  // Without the root, this is not really this chord
  if (!rootInSelection) return null;

  const allEssentialPresent = missingEssential.length === 0;
  const noExtraNotes = extraNotes.length === 0;

  // Perfect: every musthave note is there and nothing extra was added
  if (allEssentialPresent && noExtraNotes) return 'perfect';

  // For larger chords (five notes or more), allow a little more leeway so that they can still be recognized even if the user missed one or two notes.
  // This is important for extended chords, which are often played with only four notes
  if (chordType.intervals.length >= 5 && allEssentialPresent && extraNotes.length <= 2) return 'partial';

  // Partial: every must have note is there, just one extra note came along for the ride
  if (allEssentialPresent && extraNotes.length <= 1) return 'partial';

  // Weak: at least half of the must have notes made it, so the shape is a real possibility, 
  // but with a must have note actually missing it is a shakier guess than a partial match, so it gets told apart with its own grade (weak):
  const essentialCoverage =
    (chordType.essentialIntervals.length - missingEssential.length) / chordType.essentialIntervals.length;
  if (essentialCoverage >= 0.5 && extraNotes.length <= 1) return 'weak';

  return null;
}

// Gives a match a score so the best ones rise to the top of the list
function scoreMatch(
  quality: MatchQuality,
  rootInSelection: boolean,
  rootIsBass: boolean,
  extraNotesCount: number,
  matchedCount: number,
  totalChordTones: number,
  chordType: ChordType,
): number {
  let score = 0;

  // A perfect fit is worth much more than a partial one, and a weak one less so,
  // so the ranking always puts the more confident reading of the notes on top
  if (quality === 'perfect') score += 75;
  else if (quality === 'partial') score += 35;
  else if (quality === 'weak') score += 15;

  // Having the root present, and having it as the lowest note, both help:
  if (rootInSelection) score += 8;
  if (rootIsBass) score += 7;

  // Reward having no extra notes, and lightly punish each extra note:
  if (extraNotesCount === 0) score += 5;
  else score -= extraNotesCount * 3;

  // How much of the chord is actually there:
  const completeness = matchedCount / totalChordTones;
  score += Math.round(completeness * 10);

  // Simpler chords win ties (a plain triad usually reads better than a fancy name for the same notes):
  if (totalChordTones <= 3) score += 5;
  else if (totalChordTones <= 4) score += 3;
  else if (totalChordTones <= 5) score += 1;

  // Small nudge so the most common chords rank a little higher:
  if (chordType.category === 'triad') score += 3;
  else if (chordType.category === 'power') score += 2;
  else if (chordType.category === 'seventh') score += 1;

  return score;
}
