/* Tests for the d4 chord matching logic. 
They verify the matcher with printed outputs, replacing the manual checks I did in the last d3 deliverable.

   The tests cover three things:
   1. Every chord type in the formula table, one known example each.
   2. The edge cases (too few notes, duplicate notes, inversions, ambiguous shapes,
      no sensible match, the two note power chord, and missing optional notes)
   3. Naming and preference handling (sharps, flats, and the default spelling).

   This file compiles and runs in the console the same way the d1 mock tests do.
   There is no UI interaction in the tests.
   Each check prints its case and result, so the output results verification.
   If a check fails, the script throws an error and the command fails.

   Run: npm run test:chords
*/

import { identifyChords } from '../engine/chordMatcher';
import { PITCH_CLASS_TO_SHARP, PITCH_CLASS_TO_FLAT } from '../constants/notes';
import { FretSelection, PitchClass, StringIndex } from '../types';

// helper so this can run without a full test framework
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

// Note name: pitch class lookup: built from the two spelling tables (so both C# and Db work as input)
const NOTE_TO_PC: Record<string, PitchClass> = {};
PITCH_CLASS_TO_SHARP.forEach((name, pc) => { NOTE_TO_PC[name] = pc as PitchClass; });
PITCH_CLASS_TO_FLAT.forEach((name, pc) => { NOTE_TO_PC[name] = pc as PitchClass; });

// Builds fret selections from note names. The first note is placed on the lowest string, so it becomes the bass note (the frets themselves do not matter to the
// matcher, only the pitch classes and the string order do).
function chord(...noteNames: string[]): FretSelection[] {
  return noteNames.map((name, i) => {
    const pitchClass = NOTE_TO_PC[name];
    assert(pitchClass !== undefined, `Unknown note name in test setup: ${name}`);
    return { stringIndex: i as StringIndex, fret: 0, pitchClass };
  });
}

// Checks that a set of notes names the expected chord as the best match, with a perfect quality
function assertBestMatch(notes: string[], expectedName: string, expectedTypeName: string): void {
  const matches = identifyChords(chord(...notes), false);
  const top = matches[0];

  // The matcher should always return at least one match even if its a weak match
  assert(top !== undefined, `${notes.join(' ')} should return at least one match.`);
  assert(
    top.fullName === expectedName,
    `${notes.join(' ')} should name ${expectedName} as the best match, got ${top.fullName}.`,
  );
  assert(
    top.matchQuality === 'perfect',
    `${expectedName} should be a perfect match, got ${top.matchQuality}.`,
  );
  assert(
    top.chordType.name === expectedTypeName,
    `${expectedName} should match the ${expectedTypeName} formula, got ${top.chordType.name}.`,
  );

  console.log(`  ${notes.join(' ')} -> ${top.fullName} [${top.chordType.name}, ${top.matchQuality}]`);
} //

// Run each section separately so the output shows what passed:
testEveryChordType();
testEdgeCases();
testNamingPreferences();

console.log('\nAll chord matcher tests passed.');


// ==================================================================================== tests:

// === Section 1: every chord type in the table ===
// One example per formula, with the root in the bass so nothing is an inversion. This complicates the test a bit because some chords have multiple possible roots, but it is the most common case for guitarists and the one that should be tested first
// The roots are varied on purpose, to show the matcher works from any root, not just C
function testEveryChordType(): void {
  console.log('Every chord type:');

  // Triads
  assertBestMatch(['C', 'E', 'G'], 'C', 'Major');
  assertBestMatch(['A', 'C', 'E'], 'Am', 'Minor');
  assertBestMatch(['B', 'D', 'F'], 'Bdim', 'Diminished');
  assertBestMatch(['F', 'A', 'C#'], 'Faug', 'Augmented');

  // Power chord:
  assertBestMatch(['E', 'B'], 'E5', 'Power Chord');

  // Suspended (note: D E A are the same three notes as A D E, the bass decides
  // whether they read as Dsus2 or Asus4, both checks below use the same pitch set
  assertBestMatch(['D', 'E', 'A'], 'Dsus2', 'Suspended 2nd');
  assertBestMatch(['A', 'D', 'E'], 'Asus4', 'Suspended 4th');

  // sixth chords:
  assertBestMatch(['G', 'B', 'D', 'E'], 'G6', 'Major 6th');
  assertBestMatch(['E', 'G', 'B', 'C#'], 'Em6', 'Minor 6th');

  // Seventh chords:
  assertBestMatch(['G', 'B', 'D', 'F'], 'G7', 'Dominant 7th');
  assertBestMatch(['C', 'E', 'G', 'B'], 'Cmaj7', 'Major 7th');
  assertBestMatch(['D', 'F', 'A', 'C'], 'Dm7', 'Minor 7th');
  assertBestMatch(['C', 'Eb', 'G', 'B'], 'CmMaj7', 'Minor Major 7th');
  assertBestMatch(['B', 'D', 'F', 'Ab'], 'Bdim7', 'Diminished 7th');
  assertBestMatch(['F#', 'A', 'C', 'E'], 'F#m7b5', 'Half-Diminished 7th');
  assertBestMatch(['C', 'E', 'G#', 'A#'], 'Caug7', 'Augmented 7th');
  assertBestMatch(['E', 'A', 'B', 'D'], 'E7sus4', '7sus4');
  assertBestMatch(['A', 'B', 'E', 'G'], 'A7sus2', '7sus2');

  // Added-tone chords (a triad or 6th chord with one extra colour note dropped in, no 7th):
  assertBestMatch(['C', 'D', 'E', 'G'], 'Cadd9', 'Add 9');
  assertBestMatch(['C', 'D', 'Eb', 'G'], 'Cmadd9', 'Minor Add 9');
  assertBestMatch(['C', 'E', 'F', 'G'], 'Cadd11', 'Add 11');
  assertBestMatch(['C', 'D', 'E', 'G', 'A'], 'C6/9', '6/9');
  assertBestMatch(['C', 'D', 'Eb', 'G', 'A'], 'Cm6/9', 'Minor 6/9');

  // Extended chords (seventh chords stacked further, up to the 9th, 11th, or 13th):
  assertBestMatch(['C', 'D', 'E', 'Bb'], 'C9', 'Dominant 9th');
  assertBestMatch(['C', 'D', 'E', 'B'], 'Cmaj9', 'Major 9th');
  assertBestMatch(['C', 'D', 'Eb', 'Bb'], 'Cm9', 'Minor 9th');
  // C11 needs the 9th included too, otherwise root + 11th + b7 alone is the exact
  // same notes as C7sus4 and reads as that instead (checked this by hand first)
  assertBestMatch(['C', 'D', 'F', 'Bb'], 'C11', 'Dominant 11th');
  assertBestMatch(['C', 'Eb', 'F', 'Bb'], 'Cm11', 'Minor 11th');
  assertBestMatch(['C', 'E', 'A', 'Bb'], 'C13', 'Dominant 13th');
  assertBestMatch(['C', 'Eb', 'A', 'Bb'], 'Cm13', 'Minor 13th');
  assertBestMatch(['C', 'E', 'A', 'B'], 'Cmaj13', 'Major 13th');

  // if the above tests pass:
  console.log('Every chord type test passed.\n'); 
}

// === Section 2: edge cases ==
function testEdgeCases(): void {
  console.log('Edge cases:');

  // Fewer than 2 notes: a single note (or nothing) is not a chord, so no matches
  assert(identifyChords([], false).length === 0, 'No notes should return no matches.');
  assert(identifyChords(chord('C'), false).length === 0, 'A single note should return no matches.');
  console.log('No notes / one note -> no matches');

  // Duplicate notes count once: the open C shape has two Cs and two Es, still names C
  const openCShape = chord('C', 'E', 'G', 'C', 'E');
  const openCTop = identifyChords(openCShape, false)[0];
  assert(openCTop.fullName === 'C', `The open C shape should name C, got ${openCTop.fullName}.`);
  assert(openCTop.matchQuality === 'perfect', 'The open C shape should be a perfect match.');
  console.log(`C E G C E (open C shape , repeats) -> ${openCTop.fullName} [${openCTop.matchQuality}]`);

  // Inversions / slash chords: the same C major notes with E as the lowest note name C/E
  const firstInversion = identifyChords(chord('E', 'C', 'G'), false)[0];
  assert(firstInversion.fullName === 'C/E', `C major with E in the bass should name C/E, got ${firstInversion.fullName}.`);
  assert(firstInversion.isInversion, 'C/E should be marked as an inversion.');
  assert(firstInversion.inversionNumber === 1, `C/E should be the 1st inversion, got ${firstInversion.inversionNumber}.`);
  console.log(`E C G (E in the bass) -> ${firstInversion.fullName} [inversion ${firstInversion.inversionNumber}]`);

  // Second inversion: G major with the fifth (D) in the bass
  const secondInversion = identifyChords(chord('D', 'G', 'B'), false)[0];
  assert(secondInversion.fullName === 'G/D', `G major with D in the bass should name G/D, got ${secondInversion.fullName}.`);
  assert(secondInversion.inversionNumber === 2, `G/D should be the 2nd inversion, got ${secondInversion.inversionNumber}.`);
  console.log(`D G B (D in the bass)  -> ${secondInversion.fullName} [inversion ${secondInversion.inversionNumber}]`);

  // Ambiguous shapes: Am7 and C6 contain the exact same four notes. Both should
  // appear in the results, and the ranking should pick the one whose root is in the bass.
  const ambiguous = identifyChords(chord('A', 'C', 'E', 'G'), false);
  assert(ambiguous[0].fullName === 'Am7', `A C E G with A in the bass should rank Am7 first, got ${ambiguous[0].fullName}.`);
  assert(
    ambiguous.some(m => m.fullName === 'C6/A'),
    'A C E G should also list C6/A as another reading of the same notes.',
  );
  console.log(`A C E G -> ${ambiguous[0].fullName} first, with C6/A also listed`);

  // No sensible match: a tight cluster of notes fits no chord well, so nothing
  // should be marked perfect (a wrong answer would be worse than a weak answer)
  const cluster = identifyChords(chord('C', 'C#', 'D'), false);
  assert(
    cluster.every(m => m.matchQuality !== 'perfect'),
    'C C# D should not produce any perfect match.',
  );
  const clusterPartial = cluster.filter(m => m.matchQuality === 'partial').length;
  const clusterWeak = cluster.filter(m => m.matchQuality === 'weak').length;
  console.log(` C C# D (cluster) -> no perfect matches (${clusterPartial} partial, ${clusterWeak} weak)`);

  // Weak match: a third grade below partial, for when only about half of a chord's
  // must have notes show up. C E Bb has the root, 3rd, and flat 7th but not the 9th,
  // so it reads as a perfect C7 first, with C9 also listed, just as a weak guess
  const weakCase = identifyChords(chord('C', 'E', 'Bb'), false);
  const c7 = weakCase.find(m => m.fullName === 'C7');
  const c9 = weakCase.find(m => m.fullName === 'C9');
  assert(c7 !== undefined && c7.matchQuality === 'perfect', 'C E Bb should read C7 as a perfect match.');
  assert(c9 !== undefined && c9.matchQuality === 'weak', 'C E Bb should also read C9 as a weak match (missing the 9th).');
  console.log(`C E Bb -> C7 [perfect], C9 [weak] (missing the 9th)`);

  // Two note power chord: just a root and a fifth still name a chord
  const powerChord = identifyChords(chord('C', 'G'), false)[0];
  assert(powerChord.fullName === 'C5', `C and G alone should name C5, got ${powerChord.fullName}.`);
  assert(powerChord.matchQuality === 'perfect', 'C5 should be a perfect match.');
  console.log(`C G -> ${powerChord.fullName} [${powerChord.matchQuality}]`);

  // Missing optional notes: C and E alone still name C as perfect, because the
  // fifth is not an essential note for the major chord, only the root and third are 
  const noFifth = identifyChords(chord('C', 'E'), false)[0];
  assert(noFifth.fullName === 'C', `C and E alone should name C, got ${noFifth.fullName}.`);
  assert(noFifth.matchQuality === 'perfect', 'C without its fifth should still be a perfect match.');
  assert(noFifth.missingIntervals.includes(7), 'The missing fifth should be reported in the missing intervals.');
  console.log(`C E (no fifth) -> ${noFifth.fullName} [${noFifth.matchQuality}, missing the optional fifth]`);

  console.log('Edge case tests passed.\n');
}


// === Section 3: naming and preference handling ====
// The preferFlats option is not in the UI yet, these tests verify the code behind itb efore the switch is added later this deliverable.
function testNamingPreferences(): void {
  console.log('Naming and preferences:');

  const bFlatMajor = ['Bb', 'D', 'F']; // Bb major chord

  // preferFlats true -> the root is spelled Bb
  const flats = identifyChords(chord(...bFlatMajor), true)[0];
  assert(flats.fullName === 'Bb', `preferFlats true should name Bb, got ${flats.fullName}.`);
  console.log(`Bb D F with flats -> ${flats.fullName}`);

  // preferFlats false -> the same notes are spelled A#
  // meaning the root is spelled A# instead of Bb because the user prefers sharps visually. 
  // The chord is still the same, just spelled differently.
  const sharps = identifyChords(chord(...bFlatMajor), false)[0];
  assert(sharps.fullName === 'A#', `preferFlats false should name A#, got ${sharps.fullName}.`);
  console.log(`Bb D F with sharps -> ${sharps.fullName}`);

  // No preference set -> the default spelling picks the more common name for each
  // root: flat for this one (Bb), sharp for others (F#)
  const defaultFlat = identifyChords(chord(...bFlatMajor))[0];
  assert(defaultFlat.fullName === 'Bb', `The default spelling should name Bb, got ${defaultFlat.fullName}.`);
  const defaultSharp = identifyChords(chord('F#', 'A#', 'C#'))[0];
  assert(defaultSharp.fullName === 'F#', `The default spelling should name F#, got ${defaultSharp.fullName}.`);
  console.log(`no preference -> ${defaultFlat.fullName} and ${defaultSharp.fullName} (the more common name for each root)`);

  console.log('Naming and preference tests passed.\n');
}
