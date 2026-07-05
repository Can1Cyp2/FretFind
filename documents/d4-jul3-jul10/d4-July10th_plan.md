# July 3 - July 10 Chord Matcher Tests, Small Refinements, and Store Profiles (d4):

4th deliverable. The main project progress is tracked in `documents/progress.md`, this file only explains what is being built for this deliverable and how it fits into the larger project. It carries on from the d3 plan, which implemented the main chord matching logic and left the coded tests for the chord matcher as the next step.

Important Note: After speaking with the instructor, I am focusing more on app features, refinment and testing rather than the store approval. So the store profiles completion is not a mandatory requirement for the deliverable, but I will try to get it done if possible.

## What This Deliverable Covers

The July 10 goal has three parts:

- Add test cases for the chord matcher (tests that run and print outputs to verify the matching logic, replacing the manual checks I did last deliverable).
- Add small refinements such as octaves, sharp and flat symbols/preference handling, and an adjustable chord matching results table.
- Set up the App Store / Google Play Store app profiles for eventual publication on those app providers, and fill out the forms that detail app purpose, data handling information, and other application related information that these providers will require.
  - This step is not just for App submission on these platforms, but also to properly outline my app. These providers ensure that apps serve a purpose, and are properly outlined before approval on their platforms, so filling out these initial forms and such will either confirm my application plan is on the right path, or reveal things I may I have overlooked or not considered.

The tests were pushed back from d3, and the refinements are pulled ahead from the later interface milestone, because the props for octaves and flats already exist in the code and I want them verified by the tests before they get into the UI.

## Test Cases For The Chord Matcher:

The tests are in:

```txt
src/tests/d3-chord-matcher-tests.ts
```

It imports the engine and the constants (plain TypeScript, no on screen code), so it compiles and runs in the console the same way the d1 mock tests do.

The tests will cover three things:

1. One example of every chord type in the table. Each of the chord formulas (the triads, the power chord, the suspended chords, the sixth chords, and all the seventh chords) gets a known set of notes, and the test checks the matcher names it correctly as the best match with a perfect quality. For example C major from C E G, A minor from A C E, G7 from G B D F, and so on through the whole table.
2. Edge cases:

fewer than 2 notes        -> no matches are returned (a single note is not a chord)
duplicate notes           -> repeats count once (the open C shape has two Cs and two Es, still names C)
inversions / slash chords -> C major with E as the lowest note names C/E and is marked as an inversion
ambiguous shapes          -> Am7 and C6 contain the same four notes, both should appear, ranking picks the one whose root is in the bass
no sensible match         -> notes that fit nothing well return no perfect matches instead of a wrong answer
two note power chord      -> C and G alone name C5
missing optional notes    -> C and E alone still name C as perfect, because the fifth is not an essential note for the chord

3. Naming and preference handling (not implemented visually in the UI last deliverable, but the code exists)
   preferFlats true  -> the same notes name Bb instead of A#
   preferFlats false -> the same notes name A# instead of Bb
   default spelling  -> no preference set falls back to the more common name for each root

Each test prints its case and result to the console, so the output doubles as verification I can screenshot for the documents folder. If a test fails, the script throws an error and the command fails, the same behaviour as the d1 mock tests.

Run:

```bash
npm run test:chords
```

(a new script in `package.json`, thats following the same compile and run pattern as `npm run test:mock from d1`)

## Small Refinements

Octaves:
The fretboard and results already carry a showOctaves prop, but nothing computes the octave numbers yet. The octave of each note comes from the open string it is played on (standard tuning open strings are E2 A2 D3 G3 B3 E4) plus how many frets up the note is. This deliverable will add the open string octave numbers to the constants and a switch in the UI, so labels can show E2 instead of just E when the user wants them to show.

Sharp and flat preference:
The preferFlats prop already runs through the fretboard, the matcher, and the results, so the note names and chord names all follow it. This deliverable will add the user facing UI switch, so the user can flip between sharps (A#) and flats (Bb) at any time.

Adjustable results table:
The results panel is currently a fixed height under the fretboard. This deliverable makes it adjustable, so the user can give more room to the results when reading matches, or more room to the fretboard when tapping notes. This was flagged as a future screen space concern in the status report and is being handled now.

## Store Profiles

This part is paperwork rather than code: set up the app profiles on the App Store and the Google Play Store for eventual publication, and fill out the forms that detail the app purpose, data handling information, and the other application related information these providers require. The goal is to have the profiles ready early, because the app paperwork process will provide me with feedback on the app purpose and data handling, which will help me refine the app and its features. This step is not just for App submission on these platforms, but also to properly outline my app. These providers ensure that apps serve a purpose, and are properly outlined before approval on their platforms, so filling out these initial forms and such will either confirm my application plan is on the right path, or reveal things I may I have overlooked or not considered.

## New And Changed Files

New planned files:
src/tests/d3-chord-matcher-tests.ts
  -> the chord matcher tests: every chord type, the edge cases, and the naming preferences

Files likely needing changes:

```txt
package.json
  -> add the test:chords script

src/constants/tunings.ts
  -> add the octave numbers of the open strings for the standard tuning

App.tsx
  -> add the switches for octaves and sharps or flats, and the results panel size control

src/components/Results/ResultsPanel.tsx
  -> make the panel height adjustable

src/styles/resultStyles.ts
  -> styles for the size control and the adjustable heights
```

## Checklist

- [ ] Add the chord matcher test file with one example of every chord type in the table
- [ ] Add the edge case tests (too few notes, duplicates, inversions, ambiguous shapes, no match, power chord, missing optional notes).
- [ ] Add the naming preference tests (sharps, flats, and the default spelling).
- [ ] Add the test:chords script and confirm the whole run passes.
- [ ] Add the show octaves switch.
- [ ] Add the sharp or flat preference switch.
- [ ] Make the results table adjustable.
- [ ] Set up the App Store and Google Play app profiles and fill out the forms.
