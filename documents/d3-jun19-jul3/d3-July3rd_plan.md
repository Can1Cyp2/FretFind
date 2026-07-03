# June 19 - July 3 Chord Matching (d3):

This file explains the current work for the 3rd deliverable. The main project progress is tracked in `documents/progress.md`, this file only explains what is being built for the chord matching feature, the data structures that will be added, and how this fits into the larger project. It carries on from the d2 plan, which left the interval and chord formula data structures as the next step.

## What This Deliverable Covers

The July 3 goal is the early-mid-project stage: the app prototype should let you select notes on the fretboard and then show the matching chords in real time, including the more difficult theory such as common triads and seventh chords. This deliverable also includes a mid-project status report.

The work for this deliverable has three parts:

- Add the interval and chord formula data structures (the part that was left over from d2).
- Add the reverse chord matching, so the app can name the chord from the notes you tap.
- Show the matching chords live under the fretboard, and write the mid-project status report.

## How Reverse Chord Matching Works

Normally you pick a chord name first and then look up the notes. This app works the other way around: you pick the notes and it works out the chord. That is the reverse part, and thus the main technical idea of the project.

The matching will work in these steps:

1. Collect the notes. Every tapped fret has a pitch class (the note without its octave). Repeated notes are ignored, so two C notes count as one C, as this is irrelavant to the chord type.
2. Try every note as the root. A chord is named after its root note (the note it is built from). The app does not know the root yet, so it tries all twelve notes as a possible root, one at a time.
3. Measure the gaps. For each possible root, the app measures the distance from the root up to every selected note. These distances are called intervals, and they are counted in semitones (one fret is one semitone). For example, from C up to E is 4 semitones, and from C up to G is 7 semitones.
4. Compare against the chord formulas. Each chord type has a formula, which is (simply put:) the set of intervals that make it up. A major chord is the root, the major third (4), and the perfect fifth (7). If the gaps we measured match a formula, we have found a possible chord. More specifically, a major chord is the 1st 3rdd and 5th notes of the major scale, so the app can also check if the selected notes match the major scale formula.
5. Score and rank. Many chords can fit the same notes, so each match is given a score. Matches that have all the important notes, the root as the lowest note, and no extra notes score higher. The app sorts the matches from best to worst and shows the strongest ones first.

A match is marked perfect when all the important notes of the chord are present and nothing extra is added, these important parts are the root, the third, and the fifth of the major scale as example. It is marked partial when most of the important notes are there but one is missing or one extra note is added. The app can also notice when the lowest note is not the root, which means the chord is an inversion or a slash chord (the same chord, but with a different note in the bass).

Example: tapping C, E, and G gives the gaps 0, 4, and 7 from C. That matches the major formula exactly, so the best match is C major.

- I will add coded examples as real tests that will run and provide outputs to verify correct logic.

## Data Structures To Add

These were planned in the d2 deliverable and are being added now: the interval and chord formula data structures.

```ts
type ChordCategory =          // a rough grouping for each chord type
  | 'triad' | 'seventh' | 'extended' | 'suspended'
  | 'added_tone' | 'altered' | 'power' | 'other';

type MatchQuality = 'perfect' | 'partial'; // how well the notes fit the chord

interface ChordType {           // the formula for one kind of chord
  name: string;                 // full name, for example 'Major 7th'
  symbol: string;               // short symbol, for example 'maj7'
  intervals: number[];          // every note of the chord, as gaps from the root
  essentialIntervals: number[]; // the notes that must be there for it to count
  category: ChordCategory;      // triad, seventh, and so on
}

interface ChordMatch {          // one chord the app thinks the notes could be
  rootName: NoteName;           // the root note name
  fullName: string;             // the full chord name, for example 'Cmaj7'
  chordType: ChordType;         // which formula matched
  matchQuality: MatchQuality;   // perfect or partial
  isInversion: boolean;         // true when the lowest note is not the root
  score: number;                // used to rank the matches against each other
  // (plus detail fields such as the matched, missing, and extra notes)
}
```

Supporting helpers:
interval(from, to)        -> the gap in semitones between two notes
computeIntervalSet(...)   -> the set of gaps from a root to a group of notes
intervalToName(semitones) -> the short interval name (R, b3, 3, 5, b7, and so on)
intervalToFullName(...)   -> the long interval name (Root, Minor 3rd, Perfect 5th)

The chord formulas live in a table, one entry per chord type. The first version covers the common triads (major, minor, diminished, augmented), power chords, suspended chords, sixth chords, and the seventh chords (dominant 7th, major 7th, minor 7th, and so on), with room to add the extended and altered chords later.

## New And Changed Files

New planned files:

```txt
src/constants/chords.ts
  -> the table of chord formulas (every chord type and its intervals)

src/engine/chordMatcher.ts
  -> the reverse matching logic that turns selected notes into chord matches

src/engine/chordNamer.ts
  -> builds the readable chord name from a root note and a chord symbol

src/components/Results/ResultsPanel.tsx
  -> shows the matching chords live, under the fretboard

src/components/Results/ChordResultCard.tsx
  -> one row in the results: a chord name, its notes, and a perfect or partial badge
```

Files likely needing changes:

```txt
src/types/index.ts
  -> add the ChordCategory, ChordType, MatchQuality, and ChordMatch types

src/constants/notes.ts
  -> add the default note spelling used when naming chords

src/engine/noteUtils.ts
  -> add the interval helpers (the gap between two notes, and the interval names)

src/components/Fretboard/Fretboard.tsx
  -> take the selected notes as props, so the screen can share them with the results

App.tsx
  -> hold the selected notes, work out the chord matches, and show the results panel
```

The selected notes currently work inside the Fretboard component. To show results next to the fretboard, the selection state will passes down to the fretboard and also feeds it to the chord matcher. This keeps one source of truth for what is selected, so the fretboard and the results always agree with each other.

The results panel will show the matches live, so the user sees the chord names live, as soon as they tap a note.

## Real-Time Behaviour

The matching runs every time the selection changes, so the results update the moment a note is tapped or cleared. There is no analyze button to press.

fewer than 2 notes -> a short hint is shown (a single note is not a chord)
2 or more notes    -> a ranked list of matching chords, best match first
clearing notes     -> the list updates straight away

## What Stays Out For Now

To keep this deliverable focused on basic real-time matching, these are left for later deliverables:

- Audio playback for the selected notes or chords.
- The chord progression builder.
- The full chord detail view with alternate fingerings and deeper theory explanations.
- The tuning selector (the app stays in the standard E A D G B E tuning for now).

The idea of this deliverable is to code everything in such a way that it can be extended later, so the above features can be added without having to rewrite the core logic. Only the core logic has been implemented so far, and remains a prototype of the final product. The next deliverable will expand on this by adding the things listed above, and more.

## Mid-Project Status Report

This deliverable will also include a mid-project status report, that will be saved next to the progress file as `documents/early-mid_project-status-report.md`. It is an extension of the progress file that sums up where the project stands at this early to mid stage: what is done, what is still left, the challenges faced, any problems that remain, the problems I expect later on, and how I plan to deal with them.

It is essentially a rewritten outline of the progress made so far, and what is next, essentially an addition to the outline written in the original contract.

## Checklist

- [X] Add the interval and chord formula data structures (ChordType, ChordMatch, and the helpers).
- [X] Add the chord formula table for the triads and seventh chords (and more).
- [X] Add the reverse chord matching engine.
- [X] Add the chord naming helper.
- [X] Show the matching chords live under the fretboard.
- [X] Move the selection state up so the fretboard and the results share it.
- [ ] Write the early-mid-project status report.
- [ ] Update the progress file with everything done this deliverable.
