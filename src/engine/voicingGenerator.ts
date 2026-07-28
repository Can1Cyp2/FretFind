/* Works out the different shapes a chord can actually be played as on the fretboard

  (Nothing here is hardcoded:) A table of shapes need six fret numbers for every
  chord type at every root, and all of it would be wrong the moment the tuning
  changed (which d7 implements). So the shapes are generated from the
  tuning instead, the same way the rest of the app already works out everything from
  the open string notes.

  The approach is the same brute force and score idea the chord matcher and the key
  matcher use: build every shape that could work, throw out the ones that are not
  really the chord, then score what is left so the shape as a player would reach
  for comes out on top: */

import { ChordType, ChordVoicing, FretSelection, PitchClass, StringIndex, Tuning } from '../types';
import { TOTAL_FRETS } from '../constants/notes';
import { getPitchClassAtFret } from './noteUtils';

/* A hand covers about four frets without shifting position, so a shape is only
   looked for inside a window that size. Open strings are allowed on top of that,
   since an open string needs no finger at all */
const WINDOW_SPAN = 4;

// Shapes are searched for from the nut up to here. 
// Past the twelfth fret they repeat an octave higher, so there is nothing new to find above this.
const HIGHEST_FRET = 16;

// Fewer than three sounding strings stops being a chord shape and starts being a
// fragment, except for power chords, which are only two notes (and not technically chords at all, but for the purposes of this app they are)
const MIN_STRINGS = 3;

// A hand has four fingers to fret with. Anything needing more than this is not a shape
// a person can hold (of course this is subjective, some people use their thumb to hold bass notes but it is not likely)
const MAX_FINGERS = 4;

// How many shapes to hand back (handles most common chord shapes and some more unique ones):
const MAX_VOICINGS = 8;

// How many of the best scoring shapes go through the comparison filtering below: 
// To pick the best ones we go above the eight that get shown, so the filtering still has the alternatives it needs
// to find best ones, spot duplicates, and it keeps them small enough that comparing them all against each other stays
// cheap even for 6 note chords
const CANDIDATE_POOL = 80;

/* Every fret on one string that lands on a note belonging to the chord, all the way up
   the playable part of the neck. The search used to do this a four fret window at a
   time and slide the window up, which meant most shapes were found five times over,
   once from every window that happened to contain them. 
   
   The stretch is now checked while the shape is being built instead, so the whole neck can be handed over at once
   and each shape is only ever found once. */
function fretsForString(openPc: PitchClass, chordPcs: Set<number>): number[] {
  const frets: number[] = [];
  const highest = Math.min(HIGHEST_FRET, TOTAL_FRETS);
  for (let fret = 0; fret <= highest; fret++) {
    if (chordPcs.has(getPitchClassAtFret(openPc, fret))) frets.push(fret);
  }
  return frets;
}

/* Works out how many fingers a shape actually needs, which is the thing that decides
   whether a shape is playable rather than just theoretically correct.

   Open strings cost nothing, they need no finger. Every fretted note costs one finger,
   except for the one case where a single finger really does cover several notes: the
   index finger laid flat across the lowest fret of the shape, which is a barre.

   A barre only works from the lowest fret, since the index finger has to lie under the
   other fingers, not over them. So a group of notes sharing a higher fret costs a
   finger each, which is the difference between a normal barre chord and a shape that
   only looks easy on paper */
function analyzeFingering(sounding: FretSelection[]): { fingers: number; hasBarre: boolean } {
  const fretted = sounding.filter(s => s.fret > 0);
  if (fretted.length === 0) return { fingers: 0, hasBarre: false };

  const lowestFret = Math.min(...fretted.map(s => s.fret));
  const atLowest = fretted.filter(s => s.fret === lowestFret).map(s => s.stringIndex);

  /* The barre is only real if nothing between its two ends would be pressed by the
     finger lying across them. Every string in between has to be sounding at that fret
     or higher, so the other fingers sit on top of the barre. An open or unplayed
     string in the middle would be pressed down by the barre and ruined, so that shape
     does not get the ranking discount */
  let hasBarre = false;
  if (atLowest.length >= 2) {
    const lo = Math.min(...atLowest);
    const hi = Math.max(...atLowest);
    hasBarre = true;
    for (let stringIndex = lo; stringIndex <= hi; stringIndex++) {
      const between = sounding.find(s => s.stringIndex === stringIndex);
      if (!between || between.fret < lowestFret) {
        hasBarre = false;
        break;
      }
    }
  }

  // One finger for the whole barre, otherwise one per note down there, plus one for
  // every note above it
  const above = fretted.filter(s => s.fret > lowestFret).length;
  const fingers = (hasBarre ? 1 : atLowest.length) + above;

  return { fingers, hasBarre };
}

function scoreVoicing(
  selections: (FretSelection | null)[],
  rootPc: PitchClass,
  allChordPcs: Set<number>,
): Omit<ChordVoicing, 'selections' | 'score'> & { score: number } {
  const sounding = selections.filter(Boolean) as FretSelection[];
  const fretted = sounding.filter(s => s.fret > 0).map(s => s.fret);

  const lowestFret = fretted.length > 0 ? Math.min(...fretted) : 0;
  const highestFret = fretted.length > 0 ? Math.max(...fretted) : 0;
  const span = fretted.length > 0 ? highestFret - lowestFret : 0;
  const hasOpenStrings = sounding.some(s => s.fret === 0);

  // The lowest sounding string is the bass note, which is what decides whether the shape sounds rooted or like an inversion:
  const bass = sounding.reduce((low, s) => (s.stringIndex < low.stringIndex ? s : low), sounding[0]);
  const isRootInBass = bass.pitchClass === rootPc;

  // How much of the full chord the shape actually covers, not just the essentials.
  // This is deliberately only a mild preference: leaving out an optional note to get a
  // shape a hand can actually hold is the better trade, which is the whole point of
  // the chord table marking some notes essential and the rest not
  const covered = new Set<number>(sounding.map(s => s.pitchClass));
  const coverage = [...allChordPcs].filter(pc => covered.has(pc)).length / allChordPcs.size;

  const { fingers, hasBarre } = analyzeFingering(sounding);

  let score = 0;
  score += isRootInBass ? 30 : 0;      // a shape rooted in the bass is the default way to play a chord
  score += sounding.length * 8;        // fuller shapes sound better strummed and are what most players learn
  score += coverage * 14;            // having every colour note is nice, but not at the cost of playability
  score -= span * 5;             // a wide stretch is harder to hold
  score -= lowestFret * 3.5;          // shapes near the nut come before the same shape higher up
  score += hasOpenStrings ? 20 : 0;    // open strings make a shape far easier, and they are the first ones taught
  score -= fingers * 9;             // every extra finger is real difficulty, so this weighs heavily

  return {
    lowestFret,
    highestFret,
    stringsUsed: sounding.length,
    hasOpenStrings,
    isRootInBass,
    fingers,
    hasBarre,
    score,
  };
}

/* The main entry point: every playable shape for this chord in this tuning, best first.

   minStrings drops to two for power chords, (which are a two note shape,)
   so they are not filtered out for being too small. */
export function generateVoicings(
  rootPc: PitchClass,
  chordType: ChordType,
  tuning: Tuning,
): ChordVoicing[] {
  const numStrings = tuning.notes.length;

  // The notes of the chord, and the ones it cannot do without, as pitch classes
  const chordPcs = new Set(chordType.intervals.map(iv => (rootPc + iv) % 12));
  const essentialPcs = new Set(chordType.essentialIntervals.map(iv => (rootPc + iv) % 12));

  const minStrings = Math.max(
    chordType.category === 'power' ? 2 : MIN_STRINGS,
    essentialPcs.size,
  );

  /* The essential notes as a set of bits, one per pitch class. Checking whether a
     part built shape has all of them is then a single bitwise test instead of building
     a set and looping it, which matters because that check runs on every shape the
     search produces, and most shapes fail it */
  let essentialMask = 0;
  for (const pc of essentialPcs) essentialMask |= 1 << pc;

  // What each string could play, and the note each of those frets makes, worked out once up front rather than per shape:
  const options: number[][] = [];
  const optionPcs: number[][] = [];
  for (let i = 0; i < numStrings; i++) {
    const frets = fretsForString(tuning.notes[i], chordPcs);
    options.push(frets);
    optionPcs.push(frets.map(fret => getPitchClassAtFret(tuning.notes[i], fret)));
  }

  const found = new Map<string, ChordVoicing>();

  /* Only runs of neighbouring strings are considered, so a shape never leaves a
     silent string in the middle of itself. That is both how nearly every real chord
     shape is built and what makes a shape strummable, which matters here because
     the app can strum whatever is on the fretboard. */
  for (let startString = 0; startString + minStrings <= numStrings; startString++) {
    collectShapes(startString, numStrings, options, optionPcs, minStrings, (shape, pcMask) => {
      // Cheapest rejections first, so the expensive work only happens for shapes that are actually going to be kept:

      // Every note the chord cannot do without has to be sounding (meaning the shape is actually the chord, not just a fragment of it)
      if ((pcMask & essentialMask) !== essentialMask) return;

      const key = `${startString}:${shape.join(',')}`;
      if (found.has(key)) return;

      const selections: (FretSelection | null)[] = Array(numStrings).fill(null);
      for (let offset = 0; offset < shape.length; offset++) {
        const stringIndex = (startString + offset) as StringIndex;
        selections[stringIndex] = {
          stringIndex,
          fret: shape[offset],
          pitchClass: getPitchClassAtFret(tuning.notes[stringIndex], shape[offset]),
        };
      }

      const scored = scoreVoicing(selections, rootPc, chordPcs);

      /* The hard limit on whether a shape is real: a hand has four fingers. Notes
         sharing a fret on neighbouring strings already count as one finger barred
         across them, and open strings cost nothing, so anything still needing more
         than four is not a shape a person can hold and is thrown out rather than
         just ranked lower */
      if (scored.fingers > MAX_FINGERS) return;

      found.set(key, { selections, ...scored });
    });
  }

  /* The filtering below compares every shape against every other one:
     
     Only eight are ever shown, so the field is cut to the best scoring handful first. 
     That keeps the comparison cheap and accurate, since a shape outside the top of the ranking was never going to be shown anyway. */
  const all = [...found.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, CANDIDATE_POOL);

  /* Drop a shape when a fuller version of the very same fingering exists and is not
     meaningfully harder to hold. Playing G on five strings instead of six is the same
     shape with one fewer string ringing, so only the fuller one is worth showing.

     The 'not meaningfully harder' part matters. A power chord is a small shape in its
     own right, not a cut down version of some six string thing that happens to contain
     the same three notes way up the neck, so a fuller shape only wins when it costs at
     most one extra finger and one extra fret of stretch. */
  const notTruncations = all.filter(
    shape =>
      !all.some(
        fuller =>
          isSubShapeOf(shape, fuller) &&
          // Adding a string below the shape changes the bass note, and a chord with a
          // different note in the bass is a different voicing, not the same one played wider.
          // Example: Open C is not a cut down C with G in the bass.
          bassPitchClass(fuller) === bassPitchClass(shape) &&
          fuller.fingers <= shape.fingers + 1 &&
          fuller.highestFret - fuller.lowestFret <= shape.highestFret - shape.lowestFret + 1,
      ),
  );

  // Anything still overlapping after that gets thinned out, keeping the better ranked one:
  const distinct: ChordVoicing[] = [];
  for (const voicing of notTruncations) {
    if (!distinct.some(kept => isSubShapeOf(voicing, kept))) distinct.push(voicing);
    if (distinct.length === MAX_VOICINGS) break;
  }
  return distinct;
}

// The note the shape sounds lowest, which is what gives a voicing its character:
function bassPitchClass(voicing: ChordVoicing): number {
  const lowest = voicing.selections.find(Boolean) as FretSelection;
  return lowest.pitchClass;
}

// True when every string the candidate plays is played identically by the other
// shape, and that other shape uses at least one string more
function isSubShapeOf(candidate: ChordVoicing, other: ChordVoicing): boolean {
  if (candidate.stringsUsed >= other.stringsUsed) return false;
  return candidate.selections.every((selection, i) => {
    if (!selection) return true;
    return other.selections[i]?.fret === selection.fret;
  });
}

/* Walks the run of strings one at a time, trying each fret that string could play, and
   reports every combination along the way.
   
   Written as a recursion rather than nested loops because the run can be any length from two strings up to six.

   Two things here matter for speed, because the seven note chords (the 11ths and 13ths)
   have so many notes to choose between that the search would otherwise crawl:

   The shape is reported at every length from the minimum upwards, rather than the
   whole search being run again for each possible last string. A four string shape is
   just a prefix of the six string one, so it comes out of the same walk.

   The fret stretch is checked while building instead of at the end. Once the notes
   chosen so far are already too far apart for one hand, nothing added later can fix
   that, so the whole branch is abandoned there rather than being built out in full and
   thrown away. The shape being built is also reused rather than copied at every step,
   since copying it was most of the work for the bigger chords */
function collectShapes(
  startString: number,
  numStrings: number,
  options: number[][],
  optionPcs: number[][],
  minStrings: number,
  onShape: (shape: number[], pcMask: number) => void,
): void {
  const chosen: number[] = [];

  function walk(
    stringIndex: number,
    lowestFret: number,
    highestFret: number,
    pcMask: number,
  ): void {
    if (chosen.length >= minStrings) onShape(chosen, pcMask);
    if (stringIndex >= numStrings) return;

    const frets = options[stringIndex];
    const pcs = optionPcs[stringIndex];
    for (let i = 0; i < frets.length; i++) {
      const fret = frets[i];
      let nextLowest = lowestFret;
      let nextHighest = highestFret;
      if (fret > 0) {
        if (fret < nextLowest) nextLowest = fret;
        if (fret > nextHighest) nextHighest = fret;
        if (nextHighest - nextLowest > WINDOW_SPAN) continue;
      }
      chosen.push(fret);
      walk(stringIndex + 1, nextLowest, nextHighest, pcMask | (1 << pcs[i]));
      chosen.pop();
    }
  }

  walk(startString, Infinity, -Infinity, 0);
}
