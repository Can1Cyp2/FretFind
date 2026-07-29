/* Extra edge case tests for the voicing generator, carried over from d6, focused just on
   the added-tone and extended chords (6ths, add9/add11, 6/9s, 9ths, 11ths, 13ths).

   d7-voicing-tests.ts already loops every chord type for the basic checks (essential notes
   present, fits in 4 frets, fingers <= 4), so this file is not repeating that. It is only
   the things specific to the busier chords: do they actually drop optional notes when they
   need to, do they still use enough strings, does the well known 11th chord clash get
   handled sensibly, and does everything still hold up in every tuning.

   Run: npm run test:edge-cases */

import { generateVoicings } from '../engine/voicingGenerator';
import { CHORD_TYPES } from '../constants/chords';
import { COMMON_TUNINGS, STANDARD_TUNING } from '../constants/tunings';
import { PitchClass } from '../types';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAILED: ${message}`);
}

// A shape written the way guitarists write them, so a failure is readable
function asShape(voicing: { selections: ({ fret: number } | null)[] }): string {
  return voicing.selections.map(s => (s ? s.fret : 'x')).join(' ');
}

const ADDED_TONE = CHORD_TYPES.filter(t => t.category === 'added_tone');
const EXTENDED = CHORD_TYPES.filter(t => t.category === 'extended');
const BUSIER_CHORDS = [...ADDED_TONE, ...EXTENDED];

console.log('Optional notes actually get dropped somewhere (not just for C major):');
{
  // Every added-tone and extended chord has at least one note that is not essential,
  // that is the whole point of those two categories.
  // 
  // A chord does not have to drop it every time (an easy shape may as well keep it), 
  //but the mechanism has to actually work somewhere, or the essential/optional split in the chord table is pointless.
  let combosChecked = 0;
  let combosThatDrop = 0;
  for (const chordType of BUSIER_CHORDS) {
    const optionalCount = chordType.intervals.length - chordType.essentialIntervals.length;
    assert(optionalCount > 0, `${chordType.name} has no optional notes, does not belong in this list`);

    for (let root = 0; root < 12; root++) {
      const essentialPcs = new Set(chordType.essentialIntervals.map(iv => (root + iv) % 12));
      const optionalPcs = chordType.intervals
        .map(iv => (root + iv) % 12)
        .filter(pc => !essentialPcs.has(pc));

      const voicings = generateVoicings(root as PitchClass, chordType, STANDARD_TUNING);
      const dropsAnOptional = voicings.some(v => {
        const sounding = new Set(v.selections.filter(Boolean).map(s => s!.pitchClass as number));
        return optionalPcs.some(pc => !sounding.has(pc));
      });
      if (dropsAnOptional) combosThatDrop++;
      combosChecked++;
    }
  }
  assert(combosThatDrop > 0, 'not one added-tone or extended chord ever dropped an optional note');
  console.log(`  ${combosThatDrop} of ${combosChecked} root/chord combinations drop an optional note somewhere`);
}
console.log('Optional note tests passed.\n');

console.log('Busier chords still use enough strings for their note count:');
{
  // minStrings inside the generator is max(3, essential note count), so a chord with
  // four essential notes (the 13ths) should never come back with a three string shape
  let checked = 0;
  for (const chordType of BUSIER_CHORDS) {
    for (let root = 0; root < 12; root++) {
      const essentialPcs = new Set(chordType.essentialIntervals.map(iv => (root + iv) % 12));
      const minStrings = Math.max(3, essentialPcs.size);
      const voicings = generateVoicings(root as PitchClass, chordType, STANDARD_TUNING);
      for (const voicing of voicings) {
        assert(
          voicing.stringsUsed >= minStrings,
          `root ${root} ${chordType.name} shape uses only ${voicing.stringsUsed} strings, needs at least ${minStrings}`,
        );
      }
      checked += voicings.length;
    }
  }
  console.log(`  ${checked} shapes, every one uses enough strings for its essential note count`);
}
console.log('String count tests passed.\n');

console.log('The dominant 11th can drop its clashing 3rd:');
{
  // The 3rd is left out of the essential notes for 11ths on purpose, real players drop
  // it because it clashes with the 11th (which is the same note as the 4th an octave up).
  // This checks the generator can actually find a shape without it, not just that it is
  // allowed to.
  const dom11 = CHORD_TYPES.find(t => t.symbol === '11');
  assert(Boolean(dom11), 'Dominant 11th missing from the chord table');

  let foundWithoutThird = 0;
  for (let root = 0; root < 12; root++) {
    const thirdPc = (root + 4) % 12;
    const voicings = generateVoicings(root as PitchClass, dom11!, STANDARD_TUNING);
    const withoutThird = voicings.some(v =>
      !v.selections.some(s => s && (s.pitchClass as number) === thirdPc),
    );
    if (withoutThird) foundWithoutThird++;
  }
  assert(
    foundWithoutThird === 12,
    `only ${foundWithoutThird} of 12 roots found a dominant 11th shape without the clashing 3rd`,
  );
  console.log('  every root finds at least one shape that leaves the clashing 3rd out');
}
console.log('Dominant 11th test passed.\n');

console.log('Busier chords still find shapes in every tuning:');
{
  // More notes to fit means less room to work with, so this is where a tuning is most
  // likely to leave a chord with nowhere to go. Root is fixed at C for each chord so
  // this stays quick, the earlier tests already cover every root in standard tuning.
  for (const tuning of COMMON_TUNINGS) {
    for (const chordType of BUSIER_CHORDS) {
      const voicings = generateVoicings(0 as PitchClass, chordType, tuning);
      assert(voicings.length > 0, `${tuning.name} found no shapes for C ${chordType.name}`);
    }
  }
  console.log(`  all ${COMMON_TUNINGS.length} tunings find shapes for every added-tone and extended chord`);
}
console.log('Tuning coverage test passed.\n');

console.log('The truncation filter still holds up on a busier chord:');
{
  // The same rule d7-voicing-tests.ts checks on C major (do not list a shape that is
  // just a fuller shape with strings dropped off, unless the fuller one is genuinely
  // harder), checked here on Cmaj13 instead, since it has the most notes of anything in
  // the table and is the most likely place for that filtering to break down.
  const maj13 = CHORD_TYPES.find(t => t.symbol === 'maj13');
  assert(Boolean(maj13), 'Major 13th missing from the chord table');

  const shapes = generateVoicings(0 as PitchClass, maj13!, STANDARD_TUNING);
  assert(shapes.length > 0, 'Cmaj13 produced no shapes at all');

  for (let i = 0; i < shapes.length; i++) {
    for (let j = 0; j < shapes.length; j++) {
      if (i === j) continue;
      const a = shapes[i];
      const b = shapes[j];
      if (a.stringsUsed >= b.stringsUsed) continue;
      const isTruncation = a.selections.every((s, k) => !s || b.selections[k]?.fret === s.fret);
      if (!isTruncation) continue;

      const bassOf = (v: typeof a) => v.selections.find(Boolean)!.pitchClass;
      const sameBass = bassOf(a) === bassOf(b);
      const notMuchHarder =
        b.fingers <= a.fingers + 1 && b.highestFret - b.lowestFret <= a.highestFret - a.lowestFret + 1;

      assert(
        !(sameBass && notMuchHarder),
        `Cmaj13 lists [${asShape(a)}] which is just [${asShape(b)}] on fewer strings, for no extra effort`,
      );
    }
  }
  console.log(`  ${shapes.length} Cmaj13 shapes, none are a redundant cut down copy of a fuller one`);
}
console.log('Truncation test passed.\n');

console.log('All edge case tests passed.');
