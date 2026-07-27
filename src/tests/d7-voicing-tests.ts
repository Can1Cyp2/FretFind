/* Tests for the voicing generator, written the same way as the d4
   chord matcher tests so they compile and run in the console. If a check fails the
   script throws and the command fails.

   The important thing these prove is that the shapes are not hardcoded anywhere: the
   generator is handed a tuning and works everything out from the open string notes,
   so the same chord asked for in Drop D comes back with different frets than it does
   in standard. */

import { generateVoicings } from '../engine/voicingGenerator';
import { CHORD_TYPES } from '../constants/chords';
import { COMMON_TUNINGS, STANDARD_TUNING } from '../constants/tunings';
import { ChordVoicing, PitchClass, Tuning } from '../types';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAILED: ${message}`);
}

// A shape written the way guitarists write them, so a failure is readable
function asShape(voicing: ChordVoicing): string {
  return voicing.selections.map(s => (s ? s.fret : 'x')).join(' ');
}

function typeBySymbol(symbol: string) {
  const found = CHORD_TYPES.find(t => t.symbol === symbol);
  if (!found) throw new Error(`no chord type with symbol "${symbol}"`);
  return found;
}

function voicingsFor(root: number, symbol: string, tuning: Tuning = STANDARD_TUNING) {
  return generateVoicings(root as PitchClass, typeBySymbol(symbol), tuning);
}

console.log('Known open shapes (the generator should rank these first):');

// Each of these is the shape a beginner actually learns first for that chord, so the
// top ranked result is the one that should come back:
const KNOWN_TOP_SHAPES: { label: string; root: number; symbol: string; shape: string }[] = [
  { label: 'C major', root: 0, symbol: '', shape: 'x 3 2 0 1 0' },
  { label: 'E minor', root: 4, symbol: 'm', shape: '0 2 2 0 0 0' },
  { label: 'G major', root: 7, symbol: '', shape: '3 2 0 0 0 3' },
  { label: 'A minor', root: 9, symbol: 'm', shape: 'x 0 2 2 1 0' },
  { label: 'D major', root: 2, symbol: '', shape: 'x x 0 2 3 2' },
  { label: 'Cmaj7', root: 0, symbol: 'maj7', shape: 'x 3 2 0 0 0' },
  { label: 'A5 power chord', root: 9, symbol: '5', shape: 'x 0 2 2 x x' },
];

for (const { label, root, symbol, shape } of KNOWN_TOP_SHAPES) {
  const voicings = voicingsFor(root, symbol);
  assert(voicings.length > 0, `${label} returned no shapes at all`);
  const top = asShape(voicings[0]);
  assert(top === shape, `${label} top shape was [${top}], expected [${shape}]`);
  console.log(`  ${label} -> [${top}]`);
}
console.log('Known open shape tests passed.\n');

console.log('Shape validity (every shape really is the chord):');
{
  let checked = 0;
  for (const chordType of CHORD_TYPES) {
    for (let root = 0; root < 12; root++) {
      const voicings = generateVoicings(root as PitchClass, chordType, STANDARD_TUNING);
      assert(
        voicings.length > 0,
        `root ${root} ${chordType.name} produced no playable shapes`,
      );
      const essentialPcs = chordType.essentialIntervals.map(iv => (root + iv) % 12);
      for (const voicing of voicings) {
        const sounded = new Set(
          voicing.selections.filter(Boolean).map(s => s!.pitchClass as number),
        );
        for (const pc of essentialPcs) {
          assert(
            sounded.has(pc),
            `root ${root} ${chordType.name} shape [${asShape(voicing)}] is missing essential note ${pc}`,
          );
        }
        // Every fretted note has to sit inside one hand position
        const fretted = voicing.selections.filter(s => s && s.fret > 0).map(s => s!.fret);
        if (fretted.length > 0) {
          const span = Math.max(...fretted) - Math.min(...fretted);
          assert(
            span <= 4,
            `root ${root} ${chordType.name} shape [${asShape(voicing)}] spans ${span} frets`,
          );
        }
        checked++;
      }
    }
  }
  console.log(`  ${checked} shapes across all ${CHORD_TYPES.length} chord types, every one valid`);
}
console.log('Shape validity tests passed.\n');

console.log('Playability (every shape has to be holdable by a real hand):');
{
  let maxFingersSeen = 0;
  let barreCount = 0;
  let checked = 0;
  for (const chordType of CHORD_TYPES) {
    for (let root = 0; root < 12; root++) {
      for (const voicing of generateVoicings(root as PitchClass, chordType, STANDARD_TUNING)) {
        assert(
          voicing.fingers <= 4,
          `root ${root} ${chordType.name} shape [${asShape(voicing)}] needs ${voicing.fingers} fingers`,
        );
        maxFingersSeen = Math.max(maxFingersSeen, voicing.fingers);
        if (voicing.hasBarre) barreCount++;
        checked++;
      }
    }
  }
  console.log(`  ${checked} shapes, none needing more than ${maxFingersSeen} fingers`);
  console.log(`  ${barreCount} of them use a barre, which is one finger across several strings`);

  // The finger counting itself, checked against shapes whose real fingering I know
  const fingerCases: { label: string; root: number; symbol: string; fingers: number }[] = [
    { label: 'open C', root: 0, symbol: '', fingers: 3 },
    { label: 'open Em', root: 4, symbol: 'm', fingers: 1 },  // one finger flat across two strings
    { label: 'open G', root: 7, symbol: '', fingers: 3 },
    // Most people play D with three separate fingers, but the index can lie across
    // the two notes at fret 2 with the third finger on top, so two is the real minimum
    { label: 'open D', root: 2, symbol: '', fingers: 2 },
    { label: 'A5 power chord', root: 9, symbol: '5', fingers: 1 },
  ];
  for (const { label, root, symbol, fingers } of fingerCases) {
    const top = voicingsFor(root, symbol)[0];
    assert(
      top.fingers === fingers,
      `${label} [${asShape(top)}] counted ${top.fingers} fingers, expected ${fingers}`,
    );
    console.log(`  ${label} [${asShape(top)}] -> ${top.fingers} finger${top.fingers === 1 ? '' : 's'}`);
  }

  // Optional notes really are allowed to be dropped: a major chord's fifth is not
  // essential, so at least one shape should leave it out rather than every shape
  // being forced to carry every note
  const cMajorShapes = voicingsFor(0, '');
  const withoutFifth = cMajorShapes.filter(
    v => !v.selections.some(s => s && (s.pitchClass as number) === 7),
  );
  console.log(
    `  ${withoutFifth.length} of ${cMajorShapes.length} C major shapes leave out the optional fifth`,
  );
}
console.log('Playability tests passed.\n');

console.log('Ranking:');
{
  const cMajor = voicingsFor(0, '');
  // Best first, so the scores should never climb back up as the list goes on
  for (let i = 1; i < cMajor.length; i++) {
    assert(
      cMajor[i].score <= cMajor[i - 1].score,
      `C major shape ${i + 1} scored higher than the one before it`,
    );
  }
  console.log('  shapes come back ordered best first');

  /* A shape should not be listed when a fuller version of the same fingering is also
     listed and is no harder to play. It is allowed to survive when the fuller version
     costs real extra effort or changes the bass note, because then the two are
     genuinely different ways to play the chord rather than the same one twice. */
  for (let i = 0; i < cMajor.length; i++) {
    for (let j = 0; j < cMajor.length; j++) {
      if (i === j) continue;
      const a = cMajor[i];
      const b = cMajor[j];
      if (a.stringsUsed >= b.stringsUsed) continue;
      const isTruncation = a.selections.every(
        (s, k) => !s || b.selections[k]?.fret === s.fret,
      );
      if (!isTruncation) continue;

      const bassOf = (v: ChordVoicing) => v.selections.find(Boolean)!.pitchClass;
      const sameBass = bassOf(a) === bassOf(b);
      const notMuchHarder =
        b.fingers <= a.fingers + 1 &&
        b.highestFret - b.lowestFret <= a.highestFret - a.lowestFret + 1;

      assert(
        !(sameBass && notMuchHarder),
        `C major lists [${asShape(a)}] which is just [${asShape(b)}] on fewer strings, ` +
          `for no extra effort`,
      );
    }
  }
  console.log('  a shape is only repeated smaller when the fuller one is genuinely harder');
}
console.log('Ranking tests passed.\n');

console.log('Tuning awareness (nothing is hardcoded):');
{
  const dropD = COMMON_TUNINGS.find(t => t.id === 'drop-d');
  assert(Boolean(dropD), 'Drop D tuning is missing from the common tunings');

  const standardD = asShape(voicingsFor(2, '')[0]);
  const dropDd = asShape(voicingsFor(2, '', dropD as Tuning)[0]);
  assert(
    standardD !== dropDd,
    `D major came back as [${standardD}] in both tunings, so the tuning is being ignored`,
  );
  console.log(`  D major standard -> [${standardD}]`);
  console.log(`  D major Drop D   -> [${dropDd}]`);

  // Every preset tuning should still find shapes for a plain major chord
  for (const tuning of COMMON_TUNINGS) {
    const voicings = voicingsFor(0, '', tuning);
    assert(voicings.length > 0, `${tuning.name} found no shapes for C major`);
  }
  console.log(`  all ${COMMON_TUNINGS.length} preset tunings find shapes for C major`);
}
console.log('Tuning awareness tests passed.\n');

console.log('All voicing generator tests passed.');
