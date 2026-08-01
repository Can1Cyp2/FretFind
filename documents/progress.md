# FretFind Progress Report

# Deliverable 1 (d1): Basic Project Outline

Date range: May 27, 2026 - June 8, 2026

This document is the main progress tracker for the project. It keeps track of the current deliverables, for this one: document the project direction, define the basic API/classes, create a tiny hardcoded proof of concept, and verify it with a few simple tests.

## Project Purpose

FretFind is a React Native and Expo app for reverse guitar chord finding. Instead of searching for a chord name first, the user selects notes on a virtual fretboard and the app identifies the chord being played.

The larger project goal is to help guitarists learn:

- Fretboard navigation and note recognition.
- Chord construction.
- Intervals and chord formulas.
- Inversions and slash chords.
- Alternate tunings.
- How chords fit into progressions.

## Deliverable 1 Timeline

| Date           | Deliverable                  | Status   | Output                                                            |
| -------------- | ---------------------------- | -------- | ----------------------------------------------------------------- |
| May 27, 2026   | Project outline and scope    | Complete | Project purpose, core features, and future architecture direction |
| May 28, 2026   | Planning document            | Complete | `documents/progress.md`                                         |
| June 1-8, 2026 | API/class contract           | Complete | Basic controller and mock data shapes                             |
| June 1-8, 2026 | Functionality definition     | Complete | Plain-language chord and progression behavior                     |
| June 1-8, 2026 | Architecture decision        | Complete | Controller-focused skeleton                                       |
| June 1-8, 2026 | Prototype classes            | Complete | Three basic controller classes                                    |
| June 1-8, 2026 | Proof of concept             | Complete | Hardcoded C major and progression flow                            |
| June 1-8, 2026 | Mock test and console script | Complete | `npm run test:mock` and `npm run mock:progression`            |
| June 1-8, 2026 | README, License, wireframes  | Complete | Root docs plus wireframes in this progress report                 |

## Current Scope

The full project will eventually have an expanded directory structure (currently empty folders, not listed below), this deliverable only adds files for what is needed right now.

Current implementation files:

```txt
src/
  controllers/
    FretboardInteractionController.ts
    ChordAnalysisController.ts
    ProgressionController.ts
  mockData.ts
  scripts/
    mockProgression.ts
  tests/
    basicControllers.mock.test.ts
```

Supporting files:

```txt
README.md
LICENSE
documents/progress.md
tsconfig.mock.json
```

## API And Class Contract

The current "API" is local TypeScript only. There is no server and no real backend yet.

### Mock Data

```ts
type FretSelection = {
  string: number;
  fret: number;
  note: string;
};
```

The current mock shape is an open C major chord:

```txt
C - E - G - C - E
```

The current mock progression is:

```txt
C - Am - F - G
```

The current candidate chord is:

```txt
Em
```

### Controller Classes:

`FretboardInteractionController`

```ts
selectFrets(selections: FretSelection[]): FretSelection[]
getSelectedNotes(): string[]
```

`ChordAnalysisController`

```ts
identifyChord(selectedNotes: string[]): ChordAnalysisResult
```

`ProgressionController`

```ts
analyzeProgression(
  progression: string[],
  candidateChord: string
): ProgressionAnalysisResult
```

## Functionality Definition

The proof of concept does three basic things:

1. Stores a hardcoded fret selection.
2. Reads the selected note names.
3. Identifies `C - E - G - C - E` as a C major chord.
4. Explains that `Em` can fit inside `C - Am - F - G`.

The logic is intentionally hardcoded. This is only meant to prove the shape of the interaction before building the full engine.

## Proof Of Concept Output

Expected chord result:

```txt
Selected notes: C - E - G - C - E
Best match: C
Quality: perfect
Formula: 1 - 3 - 5
Explanation: The selected notes contain C, E, and G, which form a C major triad.
```

Expected progression result:

```txt
Progression: C - Am - F - G
Candidate chord: Em
Fits: yes
Summary: Em can work inside this C major progression.
```

#### Output: Verification passed, the output matches the expected results above. Screenshot of output can be found in file: `\documents\may27-jun8\Output_Screenshot.png`

## Testing

The mock test checks:

1. `FretboardInteractionController` returns `C - E - G - C - E`.
2. `ChordAnalysisController` identifies the result as `C`.
3. `ChordAnalysisController` marks the match as `perfect`.
4. `ProgressionController` says `Em` fits the mock progression.
5. `ProgressionController` returns at least one reason.

Run:

```bash
npm run test:mock
```

Print the mock result:

```bash
npm run mock:progression
```

## Wireframes

Text version of wireframes for simplicity but I will add photo mockups in a seperate document.

### Fretboard And Result

```txt
[FretFind]

Selected frets:
String 5 fret 3 -> C
String 4 fret 2 -> E
String 3 fret 0 -> G
String 2 fret 1 -> C
String 1 fret 0 -> E

[Analyze]

Result:
C major
Formula: 1 - 3 - 5
```

### Progression Explanation

```txt
[Progression]

[ C] -> [ Am ] -> [ F ] -> [G]

Candidate chord: Em

Result:
Em can fit inside this C major progression.

Reasons (in the future, this will be more detailed and educational, so a simpler explanation, with a more in depth one available as well):
- Em belongs naturally to the C major key area.
- Em shares E and G with C.
- Shared tones can make chord movement sound smoother.
```

## Done By June 8, 2026 checklist (checkmarks indicate complete, X marks incomplete):

- [X] The project purpose and features are documented. (found in `documents/progress.md`)
- [X] The API contract is drafted. (found in `documents/progress.md`)
- [X] The functionality is defined in plain language. (found in `documents/progress.md`)
- [X] The architecture decision is documented. (found in `documents/progress.md`)
- [X] The first controller class skeletons are written. (found in `src/controllers/`)
- [X] One proof-of-concept flow is implemented. (found in `src/scripts/mockProgression.ts`)
- [X] Mock test data verifies the proof of concept. (found in `src/tests/basicControllers.mock.test.ts`)
- [X] A console script prints the mock result. (found in `src/scripts/mockProgression.ts`)
- [X] README, License, and wireframes are added. (found in `README.md`, `LICENSE`, `documents/progress.md`, `documents/may27-jun8/wireframe_and_mindmap-C_Chord`)

---

# Deliverable 2 (d2): ore Functionality Outline and Fretboard Prototype

Date range: June 8, 2026 - June 19, 2026

Complete the core technical design, define the data structures for notes, pitch classes, and fretboard positions, and implement a first interactive fretboard prototype. The full plan and output for this deliverable is in `documents/d2-jun8-jun19/d2-June19th_plan.md`

## What This Deliverable Covers

The June 19 goal is the base app outline: the core technical design completed, the data structures for notes, pitch classes, fretboard positions, intervals, and chord formulas defined, and a first interactive fretboard prototype implemented.

The work so far has the goal to create the basic outline of the app:

- A fretboard you can interact with
- Core note and fretboard data structures
- Intervals and chord formulas (Not done yet, but the data structures are defined for these. The implementation of the logic for these is planned for the next deliverable, as I realized it might be better to code this in a different way than I originally planned, so I want to give myself more time to think about the best way to implement this)

The current screen has the following features:

- A vertical guitar fretboard, 6 strings, frets 0 to 22.
- Tap a fret to select the note on that string.
- Tap the same fret again to clear it.
- Tap the 'o' button at the nut to fill every empty string with its open note.

## Deliverable 2 Timeline

| Date            | Deliverable                                                   | Status      | Output                                                                          |
| --------------- | ------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------- |
| June 8-15, 2026 | Core technical design                                         | Complete    | Note and fretboard data structures defined                                      |
| June 8-19, 2026 | Data structures for notes, pitch classes, fretboard positions | Complete    | `src/types/index.ts`, `src/constants/notes.ts`, `src/engine/noteUtils.ts` |
| June 8-19, 2026 | Tuning data structure and standard tuning                     | Complete    | `src/constants/tunings.ts`                                                    |
| June 8-19, 2026 | Interactive fretboard prototype                               | Complete    | `src/components/Fretboard/`                                                   |
| June 8-15, 2026 | Fretboard styling                                             | Complete    | `src/styles/colors.ts`, `src/styles/fretboardStyles.ts`                     |
| June 8-15, 2026 | App screen wiring                                             | Complete    | `App.tsx`                                                                     |
| June 8-15, 2026 | Plan and output document                                      | Complete    | `documents/d2-jun8-jun19/d2-June19th_plan.md`                                 |
| June 8-19, 2026 | Prototype screenshots                                         | Complete    | Three images in`documents/d2-jun8-jun19/`                                     |
| June 8-19, 2026 | Interval data structures                                      | Pushed back | Planned for the next deliverable                                                |
| June 8-19, 2026 | Chord formula data structures                                 | Pushed back | Planned for the next deliverable                                                |

## Current Scope: (d2)

This deliverable adds the first on screen files for the interactive fretboard. The full project will still grow into more folders later, this deliverable only adds what is needed for the base app outline.

I wanted a solid foundation for the app, so I do not need to think about the core implementation details such as the fretboard model or the note data structures while building the rest of the app. This way, I can focus on building the more complicated core features and screens without needing to worry about how the underlying interactions and data works, as that will already be defined.

Current implementation files:

```txt
App.tsx
src/
  types/
    index.ts
  constants/
    notes.ts
    tunings.ts
  engine/
    noteUtils.ts
  styles/
    colors.ts 
    fretboardStyles.ts
  components/
    Fretboard/
      Fretboard.tsx
      FretRow.tsx
      FretNumber.tsx
      FretMarker.tsx
      StringLabels.tsx
```

Supporting files:

```txt
documents/d2-jun8-jun19/d2-June19th_plan.md
documents/d2-jun8-jun19/img1-Fretboard.JPG
documents/d2-jun8-jun19/img2-Fretboard-Scrollable.JPG
documents/d2-jun8-jun19/img3-C_chord_shape-selected.JPG
```

## Interactive Fretboard Prototype

Style:
Although this is my first attempt at the fretboard design, I wanted to make it look as good as possible. The design is inspired by the clean, modern aesthetic of a guitar, in addition to modern apps. It has a dark background and bright accent colours for the notes. The fret markers have a subtle 3D effect with shadows and highlights to make them look like real frets. The open string labels are positioned above the nut for easy reference.

I had originally planned to make the fretboard look like a basic outline, similar to my wireframes, but I found that it was easier to design the fretboard with a more polished styling, as this will likely be the easier part of this project. I may change this design later, but I wanted to make it look as good as possible for this first version.

Purpose:

- Show a guitar fretboard on screen with 6 strings and 22 frets.
- Let the user tap any fret to select the note on that string.
- Let the user tap the same fret again to clear that string.
- Show the open string note names above the board, and the note name on each selected fret. (users will be able to change tunings later, but for now this is just the standard E A D G B E tuning)

Behaviour:

```txt
Tap a string and fret -> that string shows the selected note
Tap the same fret      -> that string is cleared
O button at the nut    -> fills every empty string with its open note
```

Each string keeps at most one selected fret at a time, which matches how a finger holds one position per string.
Though, you could make chords that do not have realistic spacing for a finger, such as on the A string on the 1st fret, and the B string on the 9th fret, which is a valid chord but not one that a player could easily play. This is something to consider for future versions, but for now the user can make any combination of notes as playability is not the focus of this deliverable, or the app in general. The initial input is up to the user.

## Data Structures Defined

The core data model for notes and the fretboard:

```ts
type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11; // a note without its octave
type NoteName = 'C' | 'C#' | 'Db' | ... | 'B';                     // written note names
type StringIndex = 0 | 1 | 2 | 3 | 4 | 5;                          // which string (low E to high E)
type FretNumber = number;                                          // which fret

interface FretSelection {   // one tapped fretboard position
  stringIndex: StringIndex;
  fret: FretNumber;
  pitchClass: PitchClass;
}

interface Tuning {          // the open (unfretted) note of each string
  id: string;
  name: string;
  notes: PitchClass[];
  noteNames: NoteName[];
  isPreset: boolean;
}
```

Supporting constants and helpers:

```txt
PITCH_CLASS_TO_SHARP / PITCH_CLASS_TO_FLAT -> note name for each pitch class (Changing from # to b)
TOTAL_FRETS = 22, NUM_STRINGS = 6          -> fretboard size
STANDARD_TUNING                            -> default E A D G B E tuning
getPitchClassAtFret(open, fret)            -> the pitch class at a fret
pitchClassToName(pitchClass, preferFlats)  -> the name for a pitch class
```

These cover notes, pitch classes, and fretboard positions. Intervals and chord formulas are not defined yet and are the remaining work for this deliverable.

## How The Files Interact (d2)

The fretboard uses a small set of files:

```txt
src/types/index.ts
  -> defines PitchClass, NoteName, StringIndex, FretSelection, Tuning

src/constants/notes.ts
  -> note name tables, total frets, number of strings

src/constants/tunings.ts
  -> the standard tuning

src/engine/noteUtils.ts
  -> works out the pitch class at a fret and its note name

src/styles/colors.ts and src/styles/fretboardStyles.ts
  -> colours and layout for the fretboard. The file name is in american english for consistency with general app formatting.

src/components/Fretboard/...
  -> the on screen fretboard and its parts
```

The fretboard component tree is:

```txt
Fretboard
  -> StringLabels (open string names at the top)
  -> FretNumber   (fret numbers and the open notes button)
  -> FretRow      (one row per fret: strings, inlays, tap targets)
       -> FretMarker (the tappable dot that shows a selected note)
```

The interaction flow is:

```txt
user taps a fret
  -> FretMarker reports the press
  -> Fretboard updates the selection for that string
  -> getPitchClassAtFret works out the note
  -> the fret shows the selected note name
```

## App Entry (d2)

The app screen is wired in `App.tsx`:

- screen title
- Fretboard

There is no audio, chord result, or progression on screen yet. This deliverable is only the interactive fretboard and the data model behind it.

## Screenshots

Screenshots of the interactive fretboard prototype are in `documents/d2-jun8-jun19/`:
img1-Fretboard.JPG               -> the fretboard on the main screen
img2-Fretboard-Scrollable.JPG    -> the fretboard scrolled to show more frets
img3-C_chord_shape-selected.JPG  -> a C chord shape selected on the fretboard

## Done By June 19, 2026 checklist (checkmarks indicate complete, X marks incomplete):

- [X] Define the note and pitch class data structures. (found in `src/types/index.ts`, `src/constants/notes.ts`)
- [X] Define the fretboard position data structures. (found in `src/types/index.ts`)
- [X] Define a tuning data structure and the standard tuning. (found in `src/types/index.ts`, `src/constants/tunings.ts`)
- [X] Add the note name tables and fretboard size constants. (found in `src/constants/notes.ts`)
- [X] Add helpers for the pitch class at a fret and its note name. (found in `src/engine/noteUtils.ts`)
- [X] Build the interactive fretboard prototype with tap to select. (found in `src/components/Fretboard/`)
- [X] Wire the fretboard into the main app screen. (found in `App.tsx`)

The following checklist items will be pushed back past June 19. The end goal for d2 was to have the fretboard and data model done by June 19th, with intervals and chord formulas to be added in the next deliverable. As I realized it might be easier to code this in a different way.

- [ ] Define the interval data structures.
- [ ] Define the chord formula data structures.

---

# Deliverable 3 (d3): Chord Matching and Mid-Project Status Report

Date range: June 19, 2026 - July 3, 2026

Goal: Add the interval and chord formula data structures that were pushed back from d2, implement the reverse chord matching engine, and show the matching chords live under the fretboard. The full plan for this deliverable is in `documents/d3-jun19-jul3/d3-July3rd_plan.md`, and the mid-project status report is in `documents/early-mid_project-status-report.md`

## What This Deliverable Covers

The July 3 goal is the early-mid-project stage: the app prototype lets you select notes on the fretboard and then show the matching chords in real time, including the more difficult theory such as common triads and seventh chords. This deliverable also includes a mid-project status report.

The work for this deliverable had three parts:

- Add the interval and chord formula data structures (the part that was left over from d2).
- Add the reverse chord matching, so the app can name the chord from the notes you tap.
- Show the matching chords live under the fretboard, and write the mid-project status report.

The current screen has the following features:

- Everything from d2 (the interactive fretboard with tap to select).
- A results panel under the fretboard that names the matching chords in real time.
- Each result shows the chord name, the notes that make it up, the chord type, and a perfect or partial indicator as colour coded.
- Inversions and slash chords are recognized and named, for example C/E when the E is the lowest note of a C major shape.

## Deliverable 3 Timeline

| Date                                  | Deliverable                                          | Status                                      | Output                                                                      |
| ------------------------------------- | ---------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------- |
| June 19-24, 2026                      | Plan document                                        | Complete                                    | `documents/d3-jun19-jul3/d3-July3rd_plan.md`                              |
| June 24-July 3, 2026                  | Interval and chord formula data structures           | Complete                                    | `src/types/index.ts`, `src/engine/noteUtils.ts`                         |
| June 24-July 3, 2026                  | Chord formula table                                  | Complete                                    | `src/constants/chords.ts`                                                 |
| June 24-July 3, 2026                  | Reverse chord matching engine                        | Complete                                    | `src/engine/chordMatcher.ts`                                              |
| June 24-July 3, 2026                  | Chord naming helper                                  | Complete                                    | `src/engine/chordNamer.ts`                                                |
| June 24-July 3, 2026                  | Live results panel                                   | Complete                                    | `src/components/Results/`, `src/styles/resultStyles.ts`                 |
| June 24-July 3, 2026                  | Selection state shared between fretboard and results | Complete                                    | `App.tsx`, `src/components/Fretboard/Fretboard.tsx`                     |
| July 3, 2026                          | Mid-project status report                            | Complete                                    | `documents/early-mid_project-status-report.md`                            |
| June 28-July 3 - Now: July 10th, 2026 | Coded tests for the matcher                          | Pushed back, though I perfomed manual tests | Planned for the next deliverable, in`src/tests/d3-chord-matcher-tests.ts` |

## Current Scope: (d3)

This deliverable adds the main technical component of the project: the reverse chord matching. The matching was written so that the chord table and the matching logic are separate, meaning new chord types can be added later as table rows without rewriting any logic.

New implementation files:

```txt
src/
  constants/
    chords.ts
  engine/
    chordMatcher.ts
    chordNamer.ts
  styles/
    resultStyles.ts
  components/
    Results/
      ResultsPanel.tsx
      ChordResultCard.tsx
```

Changed files:

```txt
App.tsx                                -> holds the selected notes, runs the matcher, shows the results
src/types/index.ts                     -> adds the chord data types
src/constants/notes.ts                 -> adds the default note spelling used when naming chords
src/engine/noteUtils.ts                -> adds the interval helpers
src/components/Fretboard/Fretboard.tsx -> takes the selected notes as props instead of owning them
```

Supporting files:

```txt
documents/d3-jun19-jul3/d3-July3rd_plan.md
documents/early-mid_project-status-report.md
```

## Reverse Chord Matching

Normally you pick a chord name first and then look up the notes. This app works the other way around: you pick the notes and it works out the chord. That is the reverse part, and thus the main technical idea of the project.

The matching works in these steps:

1. Collect the notes. Every tapped fret has a pitch class (the note without its octave). Repeated notes are ignored, so two C notes count as one C, as this is irrelevant to the chord type.
2. Try every note as the root. A chord is named after its root note (the note it is built from). The app does not know the root yet, so it tries all twelve notes as a possible root, one at a time.
3. Measure the gaps. For each possible root, the app measures the distance from the root up to every selected note. These distances are called intervals, and they are counted in semitones (one fret is one semitone).
4. Compare against the chord formulas. Each chord type has a formula, which is the set of intervals that make it up. A major chord is the root, the major third (4), and the perfect fifth (7). If the gaps match a formula, we have found a possible chord.
5. Score and rank. Many chords can fit the same notes, so each match is given a score. Matches that have all the important notes, the root as the lowest note, and no extra notes score higher. The app sorts the matches from best to worst and shows the strongest ones first.

A match is marked perfect when all the essential notes of the chord are present and nothing extra is added. It is marked partial when most of the essential notes are there but one is missing or one extra note is added. The app also notices when the lowest note is not the root, which means the chord is an inversion or a slash chord (the same chord, but with a different note in the bass).

Example: tapping C, E, and G gives the gaps 0, 4, and 7 from C. That matches the major formula exactly: the intervals 0, 4, and 7 and theory wise that is the major chord, which is 1 3 5 in terms of scale degrees, so the best match is C major.

The chord formula table currently covers: the common triads (major, minor, diminished, augmented), power chords, suspended chords (sus2, sus4), sixth chords, and the seventh chords (dominant 7th, major 7th, minor 7th, minor major 7th, diminished 7th, half-diminished 7th, augmented 7th, 7sus4, 7sus2). Extended and altered chords are planned for the next deliverable.

## Data Structures Defined (d3)

The chord data model:

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
  score: number;                // used to rank the matches against each othe
  // (plus detail fields such as the matched, missing, and extra notes)
}
```

Supporting constants and helpers:

```txt
CHORD_TYPES               -> the table of chord formulas, one entry per chord type
DEFAULT_ROOT_SPELLING     -> the more common name for each root note (F# rather than Gb, and so on)
interval(from, to)        -> the gap in semitones between two notes
computeIntervalSet(...)   -> the set of gaps from a root to a group of notes
intervalToName(semitones) -> the short interval name (R, b3, 3, 5, b7, and so on)
intervalToFullName(...)   -> the long interval name (Root, Minor 3rd, Perfect 5th)
formatChordName(...)      -> builds the readable chord name, for example 'Cmaj7' or 'C/E'
getNotesInChord(...)      -> the actual note names in a chord, from its root and formula
```

## How The Files Interact (d3)

The chord matching uses a small set of files:

```txt
src/constants/chords.ts
  -> the table of chord formulas (every chord type and its intervals

src/engine/chordMatcher.ts
  -> the reverse matching logic that turns selected notes into chord matches

src/engine/chordNamer.ts
  -> builds the readable chord name from a root note and a chord symbol

src/components/Results/ResultsPanel.tsx
  -> shows the matching chords live, under the fretboard

src/components/Results/ChordResultCard.tsx
  -> one row in the results: a chord name, its notes, and a perfect or partial badge

src/styles/resultStyles.ts
  -> colours and layout for the results area
```

The interaction flow is:

```txt
user taps a fret
  -> the fretboard reports the press to App.tsx
  -> App.tsx updates the selection for that string
  -> the chord matcher tries every root against every chord formula
  -> the matches are scored and ranked
  -> the results panel shows the list, best match first
```

The selected notes now live in `App.tsx` instead of inside the fretboard, so the fretboard and the results share one source of truth and always agree with each other.

## Real-Time Results

The matching runs every time the selection changes, so the results update the moment a note is tapped or cleared. There is no analyze button to press.

```txt
fewer than 2 notes -> a short hint is shown (a single note is not a chord)
2 or more notes    -> a ranked list of matching chords, best match first
clearing notes     -> the list updates straight away
```

## Mid-Project Status Report

The mid-project status report for this deliverable is in `documents/early-mid_project-status-report.md`. It is an extension of this progress file that sums up where the project stands at this early to mid stage: what is done, what is still left, the issues faced, the issues that remain, the issues I expect later on, and how I plan to deal with them.

## Sources

Sources I used for the music theory and the matching logic:

- Defining intervals (Music Stack Exchange): https://music.stackexchange.com/questions/60771/defining-intervals
- Music theory video (YouTube): https://www.youtube.com/watch?v=dXg8eCHNaTE
- Playing notes (Code.org Maker Toolkit): https://studio.code.org/docs/concepts/maker-toolkit/playing-notes/
- The book: "Music: A Mathematical Offering" by Dave Benson specifically the chapter on "Chords and Scales" including Chapters 5 (p. 153-200), 6 (p.200-232) and 9 (p. 296-306, 310-324, and 332-336) which cover the theory of chords, intervals, and scales in depth. Simplifying the the theory to essentially math, as in intervals and chord formulas, which formed the main idea behind the matching logic. The book also has a lot of other music theory and math content that I may use later in the project.

For future development (audio playback, when I play notes using my own midi sounds):

- How to calculate the frequency of a given note (Reddit r/musictheory): https://www.reddit.com/r/musictheory/comments/j3q0i3/how_can_you_calculate_the_frequency_of_a_given/

## Done By July 3, 2026 checklist (checkmarks indicate complete, X marks incomplete):

- [X] Add the interval and chord formula data structures. (found in `src/types/index.ts`, `src/engine/noteUtils.ts`)
- [X] Add the chord formula table for the triads and seventh chords (and more). (found in `src/constants/chords.ts`)
- [X] Add the reverse chord matching engine. (found in `src/engine/chordMatcher.ts`)
- [X] Add the chord naming helper. (found in `src/engine/chordNamer.ts`)
- [X] Show the matching chords live under the fretboard. (found in `src/components/Results/`)
- [X] Move the selection state up so the fretboard and the results share it. (found in `App.tsx`)
- [X] Write the early-mid-project status report. (found in `documents/early-mid_project-status-report.md`)
- [X] Update the progress file with everything done this deliverable. (found in `documents/progress.md`)

The following checklist item will be pushed back past July 3. I verified the matching logic by hand this deliverable (C major, Cmaj7, C7, Am, and the C/E inversion all name correctly), but the real runnable tests are still to be written.

- [ ] Add coded tests for the chord matcher. (planned for the next deliverable, in `src/tests/d3-chord-matcher-tests.ts`)

---

# Deliverable 4 (d4): Chord Matcher Tests

Date range: July 3, 2026 - July 10, 2026

Added coded test cases for the chord matcher, replacing the manual checks I did in d3. The full plan for this deliverable is in `documents/d4-jul3-jul10/d4-July10th_plan.md`

## What This Deliverable Covers

The July 10 goal in the plan had three parts: the coded tests, small refinements (octaves, sharp and flat preference, an adjustable results table), and the App Store and Google Play Store profiles.

Important note: after speaking with the course instructor (both the formal and informal supervisors), I am focusing more on app features, refinement, and testing rather than the store approval all (but specifically this) deliverable. So the store profiles are not a mandatory requirement here, though I was still able to complete them, and the actual focus for this deliverable ended up being the tests.

The tests were the main goal, the coded tests were pushed back from d3, and they are now complete.

## Deliverable 4 Timeline

| Date            | Deliverable                               | Status                                        | Output                                                          |
| --------------- | ----------------------------------------- | --------------------------------------------- | --------------------------------------------------------------- |
| July 3-4, 2026  | Plan document                             | Complete                                      | `documents/d4-jul3-jul10/d4-July10th_plan.md`                 |
| July 3-9, 2026  | Chord matcher test file, every chord type | Complete                                      | `src/tests/d4-chord-matcher-tests.ts`                         |
| July 5-9, 2026  | Edge case tests                           | Complete                                      | `src/tests/d4-chord-matcher-tests.ts`                         |
| July 5-9, 2026  | Naming and preference tests               | Complete                                      | `src/tests/d4-chord-matcher-tests.ts`                         |
| July 5-9, 2026  | test:chords script                        | Complete                                      | `package.json`                                                |
| July 9, 2026    | Test output screenshot                    | Complete                                      | `documents/d4-jul3-jul10/d4-ChordMatchingTestOutput.png`      |
| July 10, 2026   | Show octaves switch                       | (Code complete, but not in UI) UI Pushed back | Planned for d5                                                  |
| July 10, 2026   | Sharp or flat preference switch           | (Code complete, but not in UI) UI Pushed back | Planned for d5                                                  |
| July 10, 2026   | Adjustable results table                  | (Code complete, but not in UI) UI Pushed back | Planned for d5                                                  |
| July 4-10, 2026 | App Store / Google Play Store profiles    | Complete                                      | Not mandatory this deliverable, but still completed basic setup |

## Current Scope: (d4)

This deliverable adds one new file and one small script addition, everything this deliverable is testing and verifying the d3 logic rather than adding new production code. The only other small note is that I added the app store and google play store profiles, and connected them to the project, seen in app.json.

New files:
src/tests/d4-chord-matcher-tests.ts

Changed files:
package.json - adds the test:chords script for easy running

Other files:

```txt
documents/d4-jul3-jul10/d4-July10th_plan.md
documents/d4-jul3-jul10/d4-ChordMatchingTestOutput.png
documents/d4-jul3-jul10/d4-img1-F_Chord.JPG
documents/d4-jul3-jul10/d4-img2-Em_Chord.JPG
documents/d4-jul3-jul10/d4-img3-C_Chord_Ebass.JPG
```

## Chord Matcher Tests

The tests are plain TypeScript, so they compile and run in the console the same way the d1 mock tests do. If a check fails, the script throws an error and the command fails.

The tests cover three things:

1. Every chord type in the formula table: One known example each, with the roots varied on purpose (C, Am, Bdim, Faug, E5, Dsus2, Asus4, G6, Em6, G7, Cmaj7, Dm7, CmMaj7, Bdim7, F#m7b5, Caug7, E7sus4, A7sus2), to show the matcher works from any root, not just C.
   (Images in the d4 folder show the app naming an F chord, an Em chord, and a C/E inversion, matching and adding onto the test cases to reveal how the matcher works in the app itself)
2. Edge cases:
   fewer than 2 notes       -> no matches are returned
   duplicate notes           -> repeats count once (the open C shape still names C)
   inversions / slash chords -> C major with E in the bass names C/E (1st inversion), G major with D in the bass names G/D (2nd inversion)
   ambiguous shapes          -> Am7 and C6 share the same four notes, Am7 ranks first with A in the bass, C6/A is still listed
   no sensible match         -> a tight note cluster returns no perfect matches instead of a wrong answer
   two note power chord    -> C and G alone name C5 (meaning the fifth is essential but the third is not, its a power chord)
   missing optional notes    -> C and E alone still name C as perfect, since the fifth is not essential
3. Naming and preference handling (preferFlats is not in the UI yet, these tests verify the code behind it before the switch is added):
   preferFlats true  -> Bb D F names Bb
   preferFlats false -> the same notes name A#
   no preference     -> falls back to the more common name for each root (Bb, F#)

Each check prints its case and result to the console, so the output is verification.

Run:

```bash
npm run test:chords
```

## Screenshots

Screenshots for this deliverable are in `documents/d4-jul3-jul10/` both the console test output and the app itself matching chords on real fretboard shapes:
d4-ChordMatchingTestOutput.png -> the full test:chords run, every check passing in the console
d4-img1-F_Chord.JPG            -> the app naming an F chord shape on the fretboard
d4-img2-Em_Chord.JPG           -> the app naming an Em chord shape on the fretboard
d4-img3-C_Chord_Ebass.JPG      -> C major shape with E in the bass: C/E

## Small Refinements and Store Profiles

None of these were reached this deliverable. The octaves switch, the sharp and flat preference switch, and the adjustable results table are pushed to d5. The App Store and Google Play Store profiles are no longer a mandatory part of this deliverable, per the instructor, so I did not spend time on them this round.

## Done By July 10, 2026 checklist (checkmarks indicate complete, X marks incomplete):

- [X] Add the chord matcher test file with one example of every chord type in the table. (found in `src/tests/d4-chord-matcher-tests.ts`)
- [X] Add the edge case tests (too few notes, duplicates, inversions, ambiguous shapes, no match, power chord, missing optional notes). (found in `src/tests/d4-chord-matcher-tests.ts`)
- [X] Add the naming preference tests (sharps, flats, and the default spelling). (found in `src/tests/d4-chord-matcher-tests.ts`)
- [X] Add the test:chords script and confirm the whole run passes. (found in `package.json`)
- [X] Add images of the tests being run (both console and UI) and output of the correct results.
- [x]Set up the App Store and Google Play app profiles and fill out the forms.

The following checklist items are pushed back past July 10 to d5:

In the UI (the code is already written so that the logic works with these preferences, but the switches are not in the UI):

- [ ] Add the show octaves switch.
- [ ] Add the sharp or flat preference switch.
- [ ] Make the results table adjustable.

---

# Deliverable 5 (d5): Expanded Chords, Theory Breakdown, Refinements and Mid-Project Report

Date range: July 10, 2026 - July 17, 2026

Expanded the chord table with the added tone chords and extended chords, added the music theory breakdown display for a tapped chord, finished the small refinements pushed forward from d4, and wrote the comprehensive mid-project report. The full plan for this deliverable is in `documents/d5-jul10-jul17/d5-July17th_plan.md`, and the mid-project report is in `documents/mid_project-status-report.md`

## What This Deliverable Covers

The July 17 goal from the contract consists of expanded chord identification and the music theory breakdown display. On top of that, this deliverable picked up tasks pushed from d4 (the options switches), and the mid-project report since this deliverable lines up with the halfway point of the project.

The refinements were done first, then the new d5 work.

The current screen has the following features:

- Everything from d3/d4 (the interactive fretboard with live chord results).
- An Options button in the header that opens a settings sheet with two switches: note spelling (sharps or flats) and octave labels (E2 instead of just E).
- The results panel height is adjustable by dragging the handle at the top, snapping to a small, medium or large size.
- The matcher now recognizes the added-tone chords (add9, madd9, add11, 6/9, m6/9) and the common extended chords (9, maj9, m9, 11, m11, 13, m13, maj13).
- Results are now graded in three tiers instead of two: perfect (green), partial (amber), and weak (red) for the weaker guesses.
- Tapping a result opens the theory breakdown for that chord: its notes, its formula as interval names, every interval with its full name and the note it lands on, and the voicing when it is an inversion or a slash chord. Every section and every interval can be tapped for a short plain-language explanation.

## Deliverable 5 Timeline

| Date             | Deliverable                                                   | Status   | Output                                                   |
| ---------------- | ------------------------------------------------------------- | -------- | -------------------------------------------------------- |
| July 10, 2026    | Plan document                                                 | Complete | `documents/d5-jul10-jul17/d5-July17th_plan.md`         |
| July 10-12, 2026 | Show octaves switch and sharp or flat switch (pushed from d4) | Complete | `src/components/common/SettingsModal.tsx`, `App.tsx` |
| July 10-12, 2026 | Adjustable results table (pushed from d4)                     | Complete | `src/components/Results/ResultsPanel.tsx`              |
| July 11-13, 2026 | Added-tone and extendd chord formulas                         | Complete | `src/constants/chords.ts`                              |
| July 11-13, 2026 | Weak match grade (third tier below partial)                   | Complete | `src/engine/chordMatcher.ts`                           |
| July 13-14, 2026 | A test case for each new chord type                           | Complete | `src/tests/d4-chord-matcher-tests.ts`                  |
| July 14-16, 2026 | Music theory breakdown display                                | Complete | `src/components/Results/ChordDetailModal.tsx`          |
| July 14-16, 2026 | Plain-language theory explanations                            | Complete | `src/constants/musicTheory.ts`                         |
| July 10-15, 2026 | Mid-project report                                            | Complete | `documents/mid_project-status-report.md`               |

## Current Scope: (d5)

This deliverable mostly builds on top of the work that is already there: the chord expansion is table rows (no matching logic changed), the options switches flip props that already was implemented through the code, and the breakdown display reads from the match data the engine already produces.

New files:

```txt
src/
  constants/
    musicTheory.ts
  styles/
    commonStyles.ts
  components/
    common/
      SettingsModal.tsx
      InfoTooltip.tsx
    Results/
      ChordDetailModal.tsx
```

Changed files:

```txt
App.tsx                           -> the header with the Options button, the preference state
src/types/index.ts                -> octaves on the tuning, the weak match grade
src/constants/tunings.ts          -> open string octaves and the open string MIDI helper
src/constants/chords.ts           -> the added-tone and extended chord formulas
src/engine/chordMatcher.ts        -> the weak grade classification and scoring
src/styles/colors.ts             -> the weak match colours
src/styles/resultStyles.ts        -> drag handle, weak badge, and detail view styles
src/components/Fretboard/Fretboard.tsx   -> passes the octave data into the labels and markers
src/components/Results/ResultsPanel.tsx  -> adjustable height, opens the detail view
src/components/Results/ChordResultCard.tsx -> tappable, weak badge
src/tests/d4-chord-matcher-tests.ts      -> a test case for each new chord type, the weak grade test
```

## Expanded Chord Identification

The matcher already works from a table of formulas, so the expansion was adding rows: the five added-tone chords and the eight common extended chords, each with its essential intervals. Because extended chords have five, six, or seven notes and a guitarist usually cannot hold all of them at once, their essentials leave out the fifth and the lower extensions, so a common four note voicing still names the full chord, which is realistic to theory.

One thing I found while writing the tests: a bare root + 11th + b7 is the exact same notes as a 7sus4 (the 11th and the 4th are the same pitch class), so the dominant 11th needs its 9th present to name as an 11th. That is not a bug, the notes really are the same, I just needed to figure out how to handle the naming, the simpler reading wins the ranking.

I also split the old partial grade into two: partial now means every essential note is there (or nearly, for the big chords), and weak means only about half of them made it. Weak shows in red so a shakier guess is told apart from a close one at a glance.

Each new chord type got a coded test case (one verified example per formula), and the whole run passes: 31 chord types, the edge cases, and the naming preferences.

## Music Theory Breakdown Display

Tapping a result now opens a detail sheet for that chord. It shows the match grade, the notes as chips, the formula as colour coded interval chips (tapped notes, essential missing, optional missing), every interval listed with its full name and the actual note it lands on, and the voicing when the lowest note is not the root. Each section heading has a little 'i' button, and every interval can be tapped, both open a short plain-language explanation from `src/constants/musicTheory.ts`, written for someone who does not know any theory, this is the more educational base of the app.

## Done By July 17, 2026 checklist (checkmarks indicate complete):

- [X] Add the show octaves switch. (found in `src/components/common/SettingsModal.tsx`, `src/constants/tunings.ts`)
- [X] Add the sharp or flat preference switch. (found in `src/components/common/SettingsModal.tsx`,`App.tsx`)
- [X] Make the results table adjustable. (found in `src/components/Results/ResultsPanel.ts`)
- [X] Add the added-tone and common extended chord formulas to the chord table. (found in `src/constants/chords.ts`)
- [X] Add the weak match grade below perfect and partial. (in `src/engine/chordMatcher.ts`, `src/styles/colors.ts`)
- [X] Add a test case for each new chord type and confirm the whole run passes. (found in `src/tests/d4-chord-matcher-tests.ts`)
- [X] Add the music theory breakdown display for a tapped chord. (found in `src/components/Results/ChordDetailModal.tsx`)
- [X] Add the plain-language theory explanations. (found in `src/constants/musicTheory.ts`, `src/components/common/InfoTooltip.tsx`)
- [X] Write the comprehensive mid-project report (found in `documents/mid_project-status-report.md`)
- [X] Update the progress file with everything done this deliverable. (found in `documents/progress.md`)

---

# Deliverable 6 (d6): Audio Playback, Progression Builder, and Backend Groundwork

Date range: July 17, 2026 - July 24, 2026

Covers the work done for this deliverable: the chord progression builder, the 'Chords That Fit' key suggestions, the header rework, and audio playback. The full plan is in `documents/d6-jul17-jul24/d6-July24th_plan.md`, and issues found along the way (with their fixes) are tracked in `documents/d6-jul17-jul24/d6-issues.md`

## What This Deliverable Covers:

The current screen has the following features on top of d5:

- Tapping a fret plays that note out loud, and a strum button appears once two or more notes are selected, playing them low string to high string like a real strum.
- A chord progression builder: add a matched chord to a strip, reorder it, tap a pill to recall its fretboard shape and clear it.
- Progressions can be saved on the device with a name, loaded back, renamed, and deleted.
- A 'Chords That Fit' view under the progression strip: it works out which musical key the progression most likely sits in, and shows the other chords that belong to that key, with the ones already used marked.
- The header was reworked: a Progressions button (opens the saved progressions sheet) with a Save button attached to it, next to the existing Options button.

## Current Scope:

New files:

```txt
src/audio/
  toneGenerator.ts       -> builds a playable tone from a note number
  notePlayer.ts          -> plays a single note or a strum, caches sounds
src/components/Fretboard/StrumButton.tsx

src/hooks/useProgression.ts
src/components/Progression/
  ProgressionBar.tsx, ProgressionChordPill.tsx, ProgressionManager.tsx, FitChordsModal.tsx
src/constants/scales.ts
src/engine/keyMatcher.ts
src/styles/progressionStyles.ts
```

Changed files: `App.tsx` (progression state, header), `src/components/Fretboard/Fretboard.tsx` and `FretRow.tsx` (audio taps, and a performance fix so a tap only redraws its own fret row instead of all 23), `src/components/Results/` (add to progression buttons), `src/components/common/SettingsModal.tsx`, `src/styles/commonStyles.ts`, `src/types/index.ts` (progression and key/scale types).

## How The Audio Was Made

React Native has no built in way to make a sound out of nothing, so in the app I built my own, step by step:

1. **Turn the fret into a note number:** Every fret already had a MIDI style number since d5 (the open string number plus the fret), so this step was already done.
2. **Turn the note number into a frequency:** Using equal temperament: A4 is fixed at 440 Hz, and every semitone away from it multiplies the frequency by the twelfth root of two. This is the standard tuning system a guitar already uses.
3. **Draw the actual sound wave:** The code walks through the tone sample by sample and works out where the wave should be at that instant (a sine wave), then adds two quieter copies an octave and an octave-and-a-fifth up so it has some body instead of sounding like a flat electronic beep. A fade multiplies the whole thing down over time, so it sounds like a plucked string losing energy instead of a buzzer, and the very end fades to true silence so it does not click when it stops.
4. **Package it into a real (.wav) sound file:** The samples are wrapped in a plain WAV file header, byte by byte, then turned into one long line of text (base64) that the phone's audio player can load directly, no separate file needed.
5. **Play it:** The player (`expo-av`) loads that line of text like any other sound file. Each note's sound is generated once and reused after that, so repeat notes are instant. A strum plays each note a little after the one before it, low string to high string, the way a pick actually crosses the strings.

Along the way, tapping notes got noticeably laggy, and the strum had a clicking, cutting in and out sound. Both are now fixed, documented with their causes in `documents/d6-jul17-jul24/d6-issues.md`.

Source: *Music: A Mathematical Offering* by Dave Benson (Equal tempered scales, p.377) and (Frequency and MIDI chart, p.379). This is the exact formula used in `midiNoteToFrequency` in `src/audio/toneGenerator.ts`.

**July 24th (last minute d6 update), The clicking/cutting issue:** Each note only ever had one sound loaded for it, and playing that note again just restarted that same sound from the beginning. So if a note was still ringing and got triggered again, either by tapping it a second time or by a strum touching the same note twice, it got chopped off mid ring, which is what made the clicking sound. Although sometimes there was still a clicking noise, and I am not sure why, my theory is that it was processing or triggering twice, because the audio files itself sounded fine when tested in isolation. The ultimate fix was to stop restarting the one shared sound. Now every time a note plays, a brand new copy of its sound is made on the spot, it starts right away and quietly unloads itself once it finishes ringing. That way playing a note never cuts off a copy of itself that is still going, so notes can ring over each other the way real guitar strings do when you strum. The audio playback sounds more realistic now, the clicking noise is gone, and the playback is still (essentially) instant.

I wish I had the time to add real guitar sounds, a real audio sound for each note, but that is a much bigger project and I do not have the time to complete it in this deliverable timeline. This audio improvement I made for the end of d6 is much closer to a real guitar sound than the simple sine wave I had before, and it is still a playable tone that is good enough for this app and for myself.

## How 'Chords That Fit' Was Made

The app does not ask the user what key they are in, since most self-taught players would not know. Instead it reuses the same brute force idea as the reverse chord matcher itself: try every possibility and score how well it explains what is already there, then the best score wins. `src/engine/keyMatcher.ts` does this in a few steps:

1. **Define what a key actually is, as data:** A key is just a starting note (the tonic) plus a pattern of gaps: major is `[0, 2, 4, 5, 7, 9, 11]` semitones up from the tonic, natural minor is `[0, 2, 3, 5, 7, 8, 10]`. Stacking every third note of that pattern gives the seven chords the key is built from (in major: major, minor, minor, major, major, minor, diminished, the familiar I ii iii IV V vi vii° pattern), stored as lookup tables in `src/constants/scales.ts` rather than written out by hand for all 24 keys.
2. **Try every key against the progression:** There are only 24 real candidates (12 tonic notes, major or minor), so a simple loop checks all of them. For each chord already in the progression, the code checks whether that chord's root note even belongs to the candidate key's scale, and whether the chord's actual quality (major, minor, or diminished, worked out from its symbol) matches the quality that key would naturally put on that scale degree. (Almost instant)
3. **Score and rank:** A chord that matches a key exactly (right root and right quality) scores higher than one that only shares a root note with it. The scores are added up per key, the keys are sorted best first, and the top one becomes the default, the same 'best match rises to the top' approach the chord matcher already uses.
4. **Turn the winning key back into chords:** Once a key is picked, its seven scale degree chords (with their roman numerals) are generated straight from the same interval table used to rank it, and cross checked against the current progression so the ones already in use can be marked. Tapping one of these builds a normal `ChordMatch` object so it can reuse the exact same theory breakdown sheet a real fretboard match opens, rather than needing a second display built just for suggestions.

Because this rides on the same data shapes as the reverse chord matcher (chord symbols, pitch classes, `ChordMatch`), no new matching engine was needed, only the key and scale layer on top.

## Backend and Info Site

Two pieces of groundwork are done outside of the FretFind app's own code, but for the Backend implementation and publishing on app stores (Google and Apple):

- The FretFind-Info_Site (privacy policy, terms, account confirmation and password reset pages) is set up on its own repository and deployed to GitHub Pages ([github.com/Can1Cyp2/FretFind-Info_Site](https://github.com/Can1Cyp2/FretFind-Info_Site)), and I have verified it works. It is not merged into the app yet, the app does not link to or call it.
- The Supabase backend has account creation and sign in set up and working. Wiring this into the FretFind app itself (an account entry point in the UI, and opt-in cloud saved progressions) is still not done.

## Done So Far checklist (checkmarks indicate complete, X marks incomplete):

- [X] Add the tone generator and play a note when a fret is tapped. (found in `src/audio/`)
- [X] Add the strum button that plays the selected chord. (found in `src/components/Fretboard/StrumButton.tsx`)
- [X] Add the chord progression builder. (found in `src/hooks/useProgression.ts`, `src/components/Progression/`)
- [X] Add saved progressions on the device. (found in `src/components/Progression/ProgressionManager.tsx`)
- [X] Add the 'Chords That Fit' key/scale suggestions. (found in `src/components/Progression/FitChordsModal.tsx`, `src/engine/keyMatcher.ts`)
- [X] Revisit the header layout with the new controls. (found in `App.tsx`)
- [X] Set up the backend for accounts (create account, sign in). (Supabase project, not yet wired into the app's UI)

Hopefully I can add some this last minute, or it will be pushed to d7, per the plan:

- [X] Add opt-in cloud saving and loading for progressions, with RLS protections, and merge the info site and account entry point into the app. (At the last few hours of the day I was able to add this, but I have not been able to test the front-backend connection, plus for account deletion I simply direct users to the website, which is fine but not ideal, I may change this later)
- [ ] Fix the results panel scrollbar overlap - ((Actually upon closer inspection, it is not that big of an issue, so I may just leave it as is, it is not blocking anything and functions fine))
- [ ] Add the extra edge cases for the added-tone and extended chords and confirm the whole run passes.

---

# Deliverable 7 (d7): Alternate Tunings, Chord Voicings, and Cloud Fixes

Date range: July 24, 2026 - July 31, 2026

Covers alternate tunings, the chord voicings feature, the leftover education items from d6, and fixes to the cloud saved progressions and other perfomance issues. The full plan is in `documents/d7-jul24-jul31/d7-July31st_plan.md`, and the issues found along the way (with their fixes) are in `documents/d7-jul24-jul31/d7-issues.md`

## What This Deliverable Covers:
This deliverable was planned as a smaller one: alternate tunings as the main new feature, and the rest of the time on items pushed out of d6 rather than a big new chunk of the contract. That mostly stayed true, except the cloud fixes took far more of the week than I expected, along with what I thought was the issue which was fixing performance problems, which is beneficial in the long run but was not the original plan or issue causing the progressions file to freeze.

The current screen has the following features for d7 (on top of d6):
- A tuning fork button beside the fretboard opens a tuning popup: common tunings (Standard, Drop D, Half Step Down, Full Step Down, Drop C, Open G, Open D, Open E, DADGAD, etc.), plus a custom tuning builder that saves on the device and can rename and delete.
- The chord info popup has a Shapes section: the different ways that chord can actually be played in the current tuning, paged through one at a time as a diagram, with a button that loads the chosen one onto the fretboard so it can be heard and strummed.
- 'Chords That Fit' explains itself now instead of just listing roman numerals, so someone with no theory background can read why the chords in a key belong together.
- Cloud saved progressions no longer duplicate themselves and a progression lives in one place rather than two: once it is on the account it comes off the device list, with buttons to move it back either one at a time or all at once. (Eventually I want to add an icon and option to show if a progression that is in the cloud is downloaded for offline use, but that is future work not for the sake of this project)

The in-app walkthrough in Settings is started but not finished, so it is not in the list above. It carries over to the next deliverable (d8).

## Deliverable 7 Timeline
| Date             | Deliverable                                          | Status                          | Output                                                                     |
| ---------------- | ---------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------- |
| July 24, 2026    | Plan document                                        | Complete                        | `documents/d7-jul24-jul31/d7-July31st_plan.md`                            |
| July 24-26, 2026 | Common tunings list and tuning popup                 | Complete                        | `src/constants/tunings.ts`, `src/components/Fretboard/TuningModal.tsx` |
| July 24-26, 2026 | Custom tuning builder with local saving              | Complete                        | `src/hooks/useTunings.ts`                                                 |
| July 26-28, 2026 | Voicing generator                                    | Complete                        | `src/engine/voicingGenerator.ts`                                          |
| July 26-28, 2026 | Shapes section in the chord info popup               | Complete                        | `src/components/Results/VoicingBrowser.tsx`, `VoicingDiagram.tsx`       |
| July 28, 2026    | Voicing tests and the pushed-back edge case tests    | Complete                        | `src/tests/d7-voicing-tests.ts`, `src/tests/d7-edge-cases.ts`           |
| July 29, 2026    | 'Chords That Fit' theory explanations (d6 issue 5)   | Complete                        | `src/components/Progression/FitChordsModal.tsx`                           |
| July 31, 2026    | In-app walkthrough in Settings (d6 issue 6)          | Started, not finished           | Carried to the d8 deliverable                                            |
| July 29-31, 2026 | Cloud duplicate saves fix and device/cloud split     | Complete                        | `src/hooks/useAutoBackup.ts`, `src/services/cloudProgressions.ts`        |
| July 30-31, 2026 | Loading and error states for anything hitting cloud  | Complete                        | `src/components/Progression/ProgressionManager.tsx`                       |
| July 31, 2026    | Suggested chords saving with no shape (d7 issue 6)   | Complete                        | `src/components/Results/VoicingBrowser.tsx`, `ChordDetailModal.tsx`      |
| July 29-31, 2026 | App freezing on progression actions                  | Complete                        | `src/hooks/useProgression.ts` and others, (see below)                       |
| July 24-31, 2026 | Store submissions, screenshots, logo                 | Complete                        | Sent to both stores with the features up to d6                             |

## Current Scope: (d7)

New files:
```txt
src/hooks/useTunings.ts
src/components/Fretboard/TuningButton.tsx
src/components/Fretboard/TuningModal.tsx
src/engine/voicingGenerator.ts
src/components/Results/VoicingBrowser.tsx
src/components/Results/VoicingDiagram.tsx
src/components/common/WalkthroughModal.tsx
src/tests/d7-voicing-tests.ts
src/tests/d7-edge-cases.ts
```

Changed files:
```txt
App.tsx                                    -> the tuning state, loading a shape onto the fretboard, the cloud handlers
src/types/index.ts                         -> the ChordVoicing type, the restored from cloud flag
src/constants/tunings.ts                   -> the nine common tunings
src/constants/musicTheory.ts               -> the explanation behind the Shapes 'i' button
src/components/Fretboard/Fretboard.tsx     -> the tuning button, and memoized so it stops redrawing on unrelated changes
src/components/Results/ChordDetailModal.tsx, ResultsPanel.tsx -> the Shapes section, passing the tuning through
src/components/Progression/FitChordsModal.tsx        -> the theory explanations, suggested chords keeping their shape
src/components/Progression/ProgressionManager.tsx      -> the device button, loading states, the restored note
src/components/common/AccountModal.tsx, SettingsModal.tsx -> the transfer button, the walkthrough entry point
src/hooks/useProgression.ts, useAutoBackup.ts, useCloudProgressions.ts -> the cloud fixes below
src/services/cloudProgressions.ts, supabase.ts, src/hooks/useAuth.ts   -> the matching key and the request timeout
package.json                              -> the test:voicings and test:edge-cases scripts
```

## Alternate Tunings
 
The `Tuning` type was designed in d2 to hold more than one tuning, as I knew this was a feature that I wanted to add, but the fretboard had been hardcoded to standard ever since. This made it switchable: I made tuning presets for common tunings, a custom builder with a stepper per string and local saving the same way progressions already work.Switching tuning clears whatever is selected, since the same fret means a different note under a different tuning and leaving the old selection there would be saying something that is no longer true.

The one thing worth repeating here from the plan file is that the custom builder exposed a design mistake I made back in d2, where the octave of each string was bolted on as a separate array rather than derived from the note itself, so stepping a string down past the bottom of an octave got the wrong octave and therefore the wrong sound. (That is written up properly as issue 4 in the d7 issues file, since the lesson matters more than the fix did)


## Chord Voicings And Shapes
The app could only ever name the one shape the user happened to tap. Since the whole point is learning the fretboard, and a chord being playable in five different places is most of what makes the fretboard hard to learn, this was a real gap.

Now, nothing is hardcoded. Hardcoding would mean a table of six fret numbers for every chord type at every root, hundreds of rows that would all be wrong the moment the tuning changed, which d7 had just implemented. So the shapes are generated from the tuning using the same brute force and score approach the chord matcher and key matcher already use (which is almost instant): find where each chord note lives on each string, slide a four fret window up the neck, pick one note per string or mute it, throw out anything missing an essential note or needing more than four fingers, then score for playability. The full six step breakdown is in the plan file.

This also closed issue 2 from d6, which I had deliberately left open rather than hardcoding a single fixed shape per chord for the suggestions list. My instinct in that entry that shapes low on the neck should be favoured turned out to be right, it ended up as one of the scoring terms, which is a good sign that the approach is working as intended, however, I do find it misses out on common chord voicings which likely need to be hardcoded.

## Cloud Saved Progressions Rework

The cloud saving went in during the last few hours of d6 and had never really been used. Once it was, three separate problems showed up:

1. **Duplicates:** Deleting a progression from the account did not delete the device copy, so the next automatic backup pass saw a progression that was not on the account and uploaded it again. The account slowly refilled with copies of things I had deleted. The fix was to stop letting the same progression live in both places: once it is safely on the account, the device copy deletess. There is then nothing left sitting around for a later cloud delete to bring back.

2. **Getting it back:** Since a progression now leaves the device once it is backed up, there had to be a way back the other direction. Each cloud row has a device button that copies that one down while leaving the account copy alone. And Settings has a transfer button that moves everything down in one go and clears it off the account. Anything brought back to the device is flagged so the automatic backup leaves it alone, since the user purposefully moved it to be local, otherwise it would be pushed straight back up the moment it landed, and that flag is what the little note under those rows is explaining.

3. **Telling the two apart:** The check for whether something was already backed up used to be the progression name plus the shape of every chord. That now includes each chords name as well, so a match means all three of the progression name, every chord name, and every chord shape line up. Neither half is enough alone: the same name can be two different chords in two tunings and the same frets in two tunings sound as two different chords.

I also added a twelve second timeout to every request. Nothing in the client stops one on its own, so on a bad connection a request just sat there until the phone gave up, and everything waiting on it waited too. The account list would say it was loading forever and a tapped button would stay spinning, which is indistinguishable from the app being stuck. Failing after a sensible wait turns all of that into an error that can be shown and retried instead.

## The Freezing Problem

Separate from the above, the app was freezing on ordinary progression actions: saving, reordering, loading. I went at this several times and got it wrong more than once, first blaming render cost and then blaming the network, so it is worth writing down honestly.

The actual defect I eventually found is a real coding mistake rather than a performance one. `saveProgression` and `loadProgression` were each calling one lists setter from inside the other lists updater function, using an updater as a way to read the current value of the other list. React requires those updaters to be pure, and breaking that has two consequences that both fit the symptoms: it fires the "cannot update a component while rendering a different component" warning on every save and load, and in development React deliberately runs updaters twice to expose exactly this, which means every save was quietly saving two copies. That second part probably fed the duplicates as well. Both callbacks now read through refs and doone plain state update.

Alongside that I memoized the fretboard, the progression strip and the two progression sheets, and stopped the closed 'Chords That Fit' sheet re-ranking all 24 keys on every progression change.

The lesson I am taking from this one is that I spent too long guessing at causes that fit the symptom before actually reading the code that runs on the actions I was told were slow. Both of the wrong answers were plausible, which is exactly why neither was worth acting on without checking first. I do think I took the route of most probable, but should have accounted for the weird facts that did not fit that theory, and I should have read the code sooner. I will remember that for the next time.

## Testing

Two new test files this deliverable, both plain TypeScript run from the console like the existing ones.

The voicing tests check the generated shapes against ones I already know are right: the top shape for C, Em, G, Am, D, Cmaj7 and A5 has to be the exact open shape a beginner learns first, all 2976 generated shapes have to contain their chord's essential notes and fit a four fret stretch on four fingers or fewer, and the same chord in Standard and in Drop D has to come back with different frets, which is what proves the tuning is being read rather than a table looked up.

The edge case tests were leftover from d6. The added-tone and extended chords were never actually untested, since the voicing tests loop every chord type, they just had nothing checking what is specific to them: that at least one of them really does drop an optional note, that the busier ones come back using enough strings, that the dominant 11th can find a shape without its 3rd and that all of it still holds across all nine common tunings. I may want to test this with custom tunings too, but I think the nine common ones are enough for now, since they cover the most likely (realistic) edge cases.

```bash
npm run test:voicings
```

npm run test:edge-cases

## Done By July 31, 2026 checklist (checkmarks indicate complete, X marks incomplete):

- [X] Add the common tunings list. (found in `src/constants/tunings.ts`)
- [X] Add the tuning fork button and the tuning popup with switching. (found in `src/components/Fretboard/TuningButton.tsx`, `TuningModal.tsx`)
- [X] Add the custom tuning builder with local saving, renaming, and deleting. (found in `src/hooks/useTunings.ts`)
- [X] Clear the fretboard selection when the tuning changes. (found in `App.tsx`)
- [X] Add the voicing generator for the current tuning. (found in `src/engine/voicingGenerator.ts`)
- [X] Add the scrollable Shapes section, most common shape first, with the load button. (found in `src/components/Results/VoicingBrowser.tsx`, `VoicingDiagram.tsx`)
- [X] Make 'Chords That Fit' use the voicings, closing issue 2 from d6. (found in `src/components/Progression/FitChordsModal.tsx`)
- [X] Add the voicing tests and the pushed-back edge case tests, and confirm both runs pass. (found in `src/tests/d7-voicing-tests.ts`, `src/tests/d7-edge-cases.ts`)
- [X] Add the theory explanations to 'Chords That Fit', closing issue 5 from d6. (found in `src/components/Progression/FitChordsModal.tsx`) - I want to add more explanations in detail, which will be moved to d8 deliverable, but the main explanation is there and the issue is closed as of d7s expectations.
- [X] Fix the cloud progressions duplicating themselves, and stop a progression living on the device and the account at once. (found in `src/hooks/useAutoBackup.ts`)
- [X] Add a way to bring progressions back from the account, individually and all at once. (found in `src/components/Progression/ProgressionManager.tsx`, `src/components/common/AccountModal.tsx`)
- [X] Add loading and error states to everything that goes to the cloud, and a timeout so a request cannot hang forever. (found in `src/services/supabase.ts`, `src/components/Progression/ProgressionManager.tsx`)
- [X] Fix suggested chords going into the progression with no shape. (found in `src/components/Results/VoicingBrowser.tsx`, `ChordDetailModal.tsx`)
- [X] Fix the app freezing on progression actions. (found in `src/hooks/useProgression.ts`)
- [X] Send the app to both stores for review, with screenshots and a logo.
- [X] Update the progress file with everything done this deliverable. (found in `documents/progress.md`)

Not finished this deliverable:
- [ ] Add the in-app walkthrough of the app's features to Settings (issue 6 from d6). - I started on it but did not get it finished, so it carries to the next deliverable.
- [ ] Track down the "Text strings must be rendered within a `<Text>` component" error (issue 3 in `documents/d6-jul17-jul24/d6-issues.md`), which is still being logged, but have not found the cause yet. It is not blocking anything, but I would like to fix it before the next store submission (final before projects due date)

(Also, I would like to add more theory explanations to the Chords That Fit section, but what was done here is enough to close the checklist item for d7, so the rest more thorough explanations will be moved to d8, which is the last deliverable and has more time for polish and education features, as I had originally planned)