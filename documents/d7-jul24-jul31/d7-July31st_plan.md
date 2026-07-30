# July 24 - July 31 (d7):

7th deliverable plan file, carries on from d6, which finished the audio playback, the progression builder, 'Chords That Fit', and the backend groundwork for accounts and cloud saved progressions.

## What This Deliverable Covers

This deliverable is smaller than the past few, but will still be significant. The main planned feature is alternate tunings, and the rest of the time goes to the items that got pushed out of d6 rather than a big new chunk of the contract, such as finishing backend integration, finishing playstore applications, final screenshots of apps, and refining features.

So the planned parts are (not including any additional fixes or features I make while working on the following):

- Add the ability to change the fretboard's tuning: a tuning fork button next to the fretboard, a popup with common tunings, and a custom tuning builder with local saving.
- Add chord voicings: the different shapes the same chord can be played as, scrollable inside the chord info popup, loadable onto the fretboard, and reused by the 'Chords That Fit' suggestions.
- Add the extra edge case tests for the added-tone and extended chords that got pushed from d6.
- Add more explanation to 'Chords That Fit' (why the chords in a key fit together, what the roman numerals mean), from issue 5 in `documents/d6-jul17-jul24/d6-issues.md`.
- Add a short in-app walkthrough of the app's features (especially the progression builder) in the Settings screen, from issue 6 in the same issues file.

## Alternate Tunings

Right now the fretboard is hardcoded to standard tuning (`STANDARD_TUNING` from `src/constants/tunings.ts`), even though the `Tuning` type was designed back in d2 to support more than one. This deliverable makes that switchable (finally).

The planned behaviour:
- A tuning fork button sits to the right of the fretboard, in line with the string label letters at the top, on the opposite side from the 'O' open notes button at the nut.
- Tapping it opens a popup listing common tunings (Standard, Drop D, Half Step Down, Full Step Down, Drop C, Open G, Open D, Open E, DADGAD), each showing its name and its open notes, styled to match the rest of the app's sheets.
- The popup also has a custom tuning builder: a stepper per string to pick its open note, and a name box, saved on the device the same way progressions already are.
- Custom tunings can be renamed and deleted from the same popup.
- Switching tuning clears whatever is currently selected on the fretboard, since the same fret means a different note under a different tuning, and leaving the old selection in place would say something no longer true.
- Saving is local only for now, the same as progressions were before the backend existed. Cloud saved tunings would follow the same account already set up in d6, so it is a natural later addition rather than a redesign, if I have the time to include it before the end of the project I will.

## Current Scope: (d7, tuning feature only so far)

New files:
src/hooks/useTunings.ts
  -> owns the current tuning, the preset list, and any custom tunings, persisted on the device

src/components/Fretboard/TuningButton.tsx
  -> the tuning fork button that floats beside the fretboard

src/components/Fretboard/TuningModal.tsx
  -> the tuning popup: the common tuning list, the custom tuning list, and the builder

Changed files:
```txt
src/constants/tunings.ts
  -> adds COMMON_TUNINGS (Standard plus the other eight presets)

src/components/Fretboard/Fretboard.tsx
  -> renders the tuning button, takes an onOpenTuning prop

App.tsx
  -> uses useTunings instead of the hardcoded STANDARD_TUNING, wires up the popup, clears the selection on a tuning change
```

## Chord Voicings And Shapes

Up to now the app only ever knows the one shape the user happened to tap. It can name that shape, explain it, and add it to a progression, but it cannot show any of the other ways the same chord gets played. That is a real gap, since the whole point of the app is learning the fretboard, and a chord being playable in five different places is most of what makes the fretboard hard to learn in the first place.

This is also what issue 2 in `documents/d6-jul17-jul24/d6-issues.md` was blocked on. I did not want to hardcode one fixed shape per chord for the 'Chords That Fit' list when the real answer was always going to be a voicing feature, so I left it open. This is that feature, so that issue gets closed by it rather than worked around.

The planned behaviour:
- The chord info popup gains a Voicings section, showing one shape at a time as a small fretboard diagram with the fret numbers and the muted strings marked.
- The shapes are scrollable, so the user can page through the different ways to play that chord, ordered with the most common and most playable first.
- Each voicing has a button that loads it straight onto the main fretboard, so the user can see it in place, hear it, and add it to a progression from there.
- Because the 'Chords That Fit suggestions already open the same info popup, they pick this up for free: a suggested chord that never came off the fretboard now has real shapes attached to it, so it can be loaded and strummed like any other chord.

How the shapes get worked out (no hardcoded shape tables):
Hardcoding shapes would mean a table of six fret numbers for every chord type at every root, which is hundreds of rows that would all be wrong the moment the tuning changes. Since d7 has just made the tuning changeable, that is not an option. So the shapes get generated from the tuning the same way everything else in the app already works:

1. **Find every place each chord note lives:** For each string, walk up the frets and note which ones land on a pitch class that belongs to the chord.This comes straight from the open string notes, so it follows whatever tuning is currently selected.
2. **Slide a window up the neck:** A real hand covers about four frets at once, so the search looks at one four fret window at a time, from the nut upward and only considers notes inside it (open strings always count since an open string needs no finger).
3. **Pick one note per string, or mute it:** Inside a window each string either plays one of its available chord notes or is left out. That gives a set of candidate shapes per position.
4. **Throw out the ones that are not really the chord:** A shape only counts if every essential interval of the chord is actually sounding. This reuses the same essential interval idea the matcher has used since d3, so a voicing can leave out a fifth but never the third that makes it major or minor
5. **Count the fingers, and throw out anything a hand cannot hold:** This is what decides whether a shape is real rather than only theoretically correct. Open strings cost no finger. Every fretted note costs one, except the index finger lying flat across the lowest fret of the shape, which is a barre and covers as many strings as it reaches. The barre only counts from the lowest fret, since the index has to sit under the other fingers rather than over them, and only when every string it crosses is sounding at that fret or higher, otherwise the finger would deaden a string that is meant to ring. Anything still needing more than four fingers is dropped outright rather than just ranked lower.
6. **Score for playability and rank:** Shapes score higher for having the root in the bass, using more strings, having a smaller fret span, sitting lower on the neck, and needing fewer fingers, with open strings a strong bonus since those shapes are both easier and the ones taught first. Best score first, so the shape a real player would reach for first is the one shown first.

On optional notes, since this is what makes the difference between a shape that is playable and one that is not: a shape only ever has to contain the chord's essential notes, never all of them. That is what the essential intervals in the chord table have meant since d3, and it matters more here than anywhere else in the app. A major chord needs its root and its third but not its fifth, so dropping the fifth to get a shape a hand can actually hold is the right trade, and the scoring only mildly prefers the fuller sounding version. The aim is to find ways to play the chord, not to cram in every note it could theoretically contain.

This is the same brute force and score approach the chord matcher and the key matcher already use, which keeps it consistent with how the rest of the app thinks, and means it works for every chord type in the table without any per chord special casing. It is almost instant on a modern phone, and the tests confirm it is returning the right shapes for the chords I already know how to play.

## Current Scope: (d7, voicings)

New files:
```txt
src/engine/voicingGenerator.ts
  -> works out and ranks the playable shapes for a chord in the current tuning

src/components/Results/VoicingBrowser.tsx
  -> the Shapes section in the chord info popup: the diagram, the paging, and the load button

src/components/Results/VoicingDiagram.tsx
  -> one shape drawn as a small fretboard diagram

src/tests/d7-voicing-tests.ts
  -> checks the generated shapes against the open shapes I already know how to play
```

Changed files:
src/types/index.ts
  -> adds the ChordVoicing type

src/constants/musicTheory.ts
  -> adds the plain-language explanation behind the Shapes section's 'i' button

src/components/Results/ChordDetailModal.tsx
  -> renders the voicing browser, passes the load action up

src/components/Results/ResultsPanel.tsx and src/components/Progression/FitChordsModal.tsx
  -> pass the tuning through and hand the loaded shape back to the app

App.tsx
  -> puts a loaded voicing onto the fretboard

package.json
  -> adds the test:voicings script

### Testing The Shapes
The risk with generating shapes rather than listing them is that the app confidently shows something no one would ever play, so my plan is the tests will check the generated shapes against ones I already know are right, the plan:

- The top ranked shape for C, Em, G, Am, D, Cmaj7 and A5 has to come out as the exact open shape a beginner learns first (for example C has to be `x 3 2 0 1 0`).
- Every shape for every chord type at every root has to contain all of that chord's essential notes and fit inside a four fret stretch. That is 2976 shapes checked.
- Every one of those shapes has to need four fingers or fewer, and the finger counting itself is checked against shapes whose real fingering I already know (open C comes out as three fingers, open Em as one because a single finger covers both notes, A5 as one).
- The list has to be ordered best first, and must not show the same fingering twice with strings dropped off the end, unless the fuller version genuinely costs more effort to hold.
- The same chord asked for in standard and in Drop D has to come back with different frets, which is what proves the tuning is really being read rather than a table being looked up.

Run: npm run test:voicings

### Edge Case Tests (added-tone and extended chords)

The tests above already loop every chord type in the table for the basic checks, so the
added-tone and extended chords (6ths, add9/add11, 6/9s, 9ths, 11ths, 13ths) were never
actually untested, they just were not tested for anything specific to them. This was the
one leftover item carried over from d6.

What was actually worth checking that the general loop does not:
- These are the only chords with real optional notes to drop, so at least one of them
  actually has to drop one somewhere, or the essential/optional split in the chord table
  would not be doing anything.
- The busier ones (13ths especially) need four essential notes at once, so they need to
  come back using at least that many strings.
- The dominant 11th deliberately leaves the 3rd out of its essentials, because it clashes
  with the 11th and real players drop it. This checks the generator can actually find a
  shape without it, not just that the rule allows it to.
- The extra notes make these the tightest fit for a tuning to still find a shape in, so
  they get checked against all 9 tunings, not just standard.
- The truncation filter (do not list a shape that is just a fuller shape with strings cut
  off) gets re-checked against Cmaj13 instead of C major, since it is the densest chord in
  the table and the most likely place for that filtering to miss something.

New file: `src/tests/d7-edge-cases.ts`
Changed: `package.json` (adds the test:edge-cases script)

Run: npm run test:edge-cases

## Leftover Education (not started yet)

Carried over from d6, planned for later in this deliverable:
- The theory explanations for 'Chords That Fit' (issue 5): why a keys chords fit together, what the roman numerals mean, and short notes on how major and minor tend to feel.
- A short walkthrough of the apps own features in the Settings screen (issue 6), separate from the music theory explanations already in the app (but share some info).

## Checklist

- [X] Add the common tunings list (found in `src/constants/tunings.ts`)
- [X] Add the tuning fork button next to the fretboard (so users can change tuning) (found in `src/components/Fretboard/TuningButton.tsx`, `src/components/Fretboard/Fretboard.tsx`)
- [X] Add the tuning popup with common tunings, and switching tunings (found in `src/components/Fretboard/TuningModal.tsx`)
- [X] Add the custom tuning builder with local saving, renaming, and deleting. (found in `src/hooks/useTunings.ts`, `src/components/Fretboard/TuningModal.tsx`)
- [X] Clear the fretboard selection when the tuning changes (I may change this or make it an option - that has not been decided yet). (found in `App.tsx`)

- [X] Add the voicing generator that works out the playable shapes for a chord in the current tuning. (found in `src/engine/voicingGenerator.ts`)
- [X] Add the scrollable voicings section to the chord info popup, most common shape first. (found in `src/components/Results/VoicingBrowser.tsx`, `VoicingDiagram.tsx`, `ChordDetailModal.tsx`, `ResultsPanel.tsx`)
- [X] Add the button that loads a voicing onto the fretboard. (found in `src/components/Results/VoicingBrowser.tsx`, `App.tsx`)
- [X] Make the 'Chords That Fit' suggestions use the voicings, so a suggested chord can be loaded and strummed (closes issue 2 in `documents/d6-jul17-jul24/d6-issues.md`). (found in `src/components/Progression/FitChordsModal.tsx`)

- [ ] Add the extra edge cases for the added-tone and extended chords and confirm the whole run passes. (found in `src/tests/d7-edge-cases.ts`)
- [X] Add the theory explanations to 'Chords That Fit'.
- [ ] Add the in-app walkthrough of the app's features to the Settings screen.
- [X] Add small tweaks and polish to the UI, such as fixing issues, giving feedback to the user on button presses, and making the app feel more finished.

- [ ] Sent app to both Google Play Store and Apple App Store for review, with the features up to d6.
- [ ] Made app screenshots for both Google Play Store and Apple App Store.
- [ ] Made a logo for the app.