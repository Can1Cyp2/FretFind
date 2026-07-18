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

| Date | Deliverable | Status | Output |
| --- | --- | --- | --- |
| May 27, 2026 | Project outline and scope | Complete | Project purpose, core features, and future architecture direction |
| May 28, 2026 | Planning document | Complete | `documents/progress.md` |
| June 1-8, 2026 | API/class contract | Complete | Basic controller and mock data shapes |
| June 1-8, 2026 | Functionality definition | Complete | Plain-language chord and progression behavior |
| June 1-8, 2026 | Architecture decision | Complete | Controller-focused skeleton |
| June 1-8, 2026 | Prototype classes | Complete | Three basic controller classes |
| June 1-8, 2026 | Proof of concept | Complete | Hardcoded C major and progression flow |
| June 1-8, 2026 | Mock test and console script | Complete | `npm run test:mock` and `npm run mock:progression` |
| June 1-8, 2026 | README, License, wireframes | Complete | Root docs plus wireframes in this progress report |

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
- [x] The project purpose and features are documented. (found in `documents/progress.md`)
- [x] The API contract is drafted. (found in `documents/progress.md`)
- [x] The functionality is defined in plain language. (found in `documents/progress.md`)
- [x] The architecture decision is documented. (found in `documents/progress.md`)

- [x] The first controller class skeletons are written. (found in `src/controllers/`)
- [x] One proof-of-concept flow is implemented. (found in `src/scripts/mockProgression.ts`)
- [x] Mock test data verifies the proof of concept. (found in `src/tests/basicControllers.mock.test.ts`)
- [x] A console script prints the mock result. (found in `src/scripts/mockProgression.ts`)
- [x] README, License, and wireframes are added. (found in `README.md`, `LICENSE`, `documents/progress.md`, `documents/may27-jun8/wireframe_and_mindmap-C_Chord`)









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

| Date | Deliverable | Status | Output |
| --- | --- | --- | --- |
| June 8-15, 2026 | Core technical design | Complete | Note and fretboard data structures defined |
| June 8-19, 2026 | Data structures for notes, pitch classes, fretboard positions | Complete | `src/types/index.ts`, `src/constants/notes.ts`, `src/engine/noteUtils.ts` |
| June 8-19, 2026 | Tuning data structure and standard tuning | Complete | `src/constants/tunings.ts` |
| June 8-19, 2026 | Interactive fretboard prototype | Complete | `src/components/Fretboard/` |
| June 8-15, 2026 | Fretboard styling | Complete | `src/styles/colors.ts`, `src/styles/fretboardStyles.ts` |
| June 8-15, 2026 | App screen wiring | Complete | `App.tsx` |
| June 8-15, 2026 | Plan and output document | Complete | `documents/d2-jun8-jun19/d2-June19th_plan.md` |
| June 8-19, 2026 | Prototype screenshots | Complete | Three images in `documents/d2-jun8-jun19/` |
| June 8-19, 2026 | Interval data structures | Pushed back | Planned for the next deliverable |
| June 8-19, 2026 | Chord formula data structures | Pushed back | Planned for the next deliverable |

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
- [x] Define the note and pitch class data structures. (found in `src/types/index.ts`, `src/constants/notes.ts`)
- [x] Define the fretboard position data structures. (found in `src/types/index.ts`)
- [x] Define a tuning data structure and the standard tuning. (found in `src/types/index.ts`, `src/constants/tunings.ts`)
- [x] Add the note name tables and fretboard size constants. (found in `src/constants/notes.ts`)
- [x] Add helpers for the pitch class at a fret and its note name. (found in `src/engine/noteUtils.ts`)
- [x] Build the interactive fretboard prototype with tap to select. (found in `src/components/Fretboard/`)
- [x] Wire the fretboard into the main app screen. (found in `App.tsx`)

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

| Date | Deliverable | Status | Output |
| --- | --- | --- | --- |
| June 19-24, 2026 | Plan document | Complete | `documents/d3-jun19-jul3/d3-July3rd_plan.md` |
| June 24-July 3, 2026 | Interval and chord formula data structures | Complete | `src/types/index.ts`, `src/engine/noteUtils.ts` |
| June 24-July 3, 2026 | Chord formula table | Complete | `src/constants/chords.ts` |
| June 24-July 3, 2026 | Reverse chord matching engine | Complete | `src/engine/chordMatcher.ts` |
| June 24-July 3, 2026 | Chord naming helper | Complete | `src/engine/chordNamer.ts` |
| June 24-July 3, 2026 | Live results panel | Complete | `src/components/Results/`, `src/styles/resultStyles.ts` |
| June 24-July 3, 2026 | Selection state shared between fretboard and results | Complete | `App.tsx`, `src/components/Fretboard/Fretboard.tsx` |
| July 3, 2026 | Mid-project status report | Complete | `documents/early-mid_project-status-report.md` |
| June 28-July 3 - Now: July 10th, 2026 | Coded tests for the matcher | Pushed back, though I perfomed manual tests | Planned for the next deliverable, in `src/tests/d3-chord-matcher-tests.ts` |

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
- [x] Add the interval and chord formula data structures. (found in `src/types/index.ts`, `src/engine/noteUtils.ts`)
- [x] Add the chord formula table for the triads and seventh chords (and more). (found in `src/constants/chords.ts`)
- [x] Add the reverse chord matching engine. (found in `src/engine/chordMatcher.ts`)
- [x] Add the chord naming helper. (found in `src/engine/chordNamer.ts`)
- [x] Show the matching chords live under the fretboard. (found in `src/components/Results/`)
- [x] Move the selection state up so the fretboard and the results share it. (found in `App.tsx`)
- [x] Write the early-mid-project status report. (found in `documents/early-mid_project-status-report.md`)
- [x] Update the progress file with everything done this deliverable. (found in `documents/progress.md`)

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

| Date | Deliverable | Status | Output |
| --- | --- | --- | --- |
| July 3-4, 2026 | Plan document | Complete | `documents/d4-jul3-jul10/d4-July10th_plan.md` |
| July 3-9, 2026 | Chord matcher test file, every chord type | Complete | `src/tests/d4-chord-matcher-tests.ts` |
| July 5-9, 2026 | Edge case tests | Complete | `src/tests/d4-chord-matcher-tests.ts` |
| July 5-9, 2026 | Naming and preference tests | Complete | `src/tests/d4-chord-matcher-tests.ts` |
| July 5-9, 2026 | test:chords script | Complete | `package.json` |
| July 9, 2026 | Test output screenshot | Complete | `documents/d4-jul3-jul10/d4-ChordMatchingTestOutput.png` |
| July 10, 2026 | Show octaves switch | (Code complete, but not in UI) UI Pushed back | Planned for d5 |
| July 10, 2026 | Sharp or flat preference switch | (Code complete, but not in UI) UI Pushed back  | Planned for d5 |
| July 10, 2026 | Adjustable results table | (Code complete, but not in UI) UI Pushed back  | Planned for d5 |
| July 4-10, 2026 | App Store / Google Play Store profiles | Complete| Not mandatory this deliverable, but still completed basic setup |

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
- [x] Add the chord matcher test file with one example of every chord type in the table. (found in `src/tests/d4-chord-matcher-tests.ts`)
- [x] Add the edge case tests (too few notes, duplicates, inversions, ambiguous shapes, no match, power chord, missing optional notes). (found in `src/tests/d4-chord-matcher-tests.ts`)
- [x] Add the naming preference tests (sharps, flats, and the default spelling). (found in `src/tests/d4-chord-matcher-tests.ts`)
- [x] Add the test:chords script and confirm the whole run passes. (found in `package.json`)
- [x] Add images of the tests being run (both console and UI) and output of the correct results.
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

| Date | Deliverable | Status | Output |
| --- | --- | --- | --- |
| July 10, 2026 | Plan document | Complete | `documents/d5-jul10-jul17/d5-July17th_plan.md` |
| July 10-12, 2026 | Show octaves switch and sharp or flat switch (pushed from d4) | Complete | `src/components/common/SettingsModal.tsx`, `App.tsx` |
| July 10-12, 2026 | Adjustable results table (pushed from d4) | Complete | `src/components/Results/ResultsPanel.tsx` |
| July 11-13, 2026 | Added-tone and extendd chord formulas | Complete | `src/constants/chords.ts` |
| July 11-13, 2026 | Weak match grade (third tier below partial) | Complete | `src/engine/chordMatcher.ts` |
| July 13-14, 2026 | A test case for each new chord type | Complete | `src/tests/d4-chord-matcher-tests.ts` |
| July 14-16, 2026 | Music theory breakdown display | Complete | `src/components/Results/ChordDetailModal.tsx` |
| July 14-16, 2026 | Plain-language theory explanations | Complete | `src/constants/musicTheory.ts` |
| July 10-15, 2026 | Mid-project report | Complete | `documents/mid_project-status-report.md` |

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

## Done By July 17, 2026 checklist (checkmarks indicate complete, X marks incomplete):
- [x] Add the show octaves switch. (found in `src/components/common/SettingsModal.tsx`, `src/constants/tunings.ts`)
- [x] Add the sharp or flat preference switch. (found in `src/components/common/SettingsModal.tsx`,`App.tsx`)
- [x] Make the results table adjustable. (found in `src/components/Results/ResultsPanel.ts`)
- [x] Add the added-tone and common extended chord formulas to the chord table. (found in `src/constants/chords.ts`)
- [x] Add the weak match grade below perfect and partial. (in `src/engine/chordMatcher.ts`, `src/styles/colors.ts`)
- [x] Add a test case for each new chord type and confirm the whole run passes. (found in `src/tests/d4-chord-matcher-tests.ts`)
- [x] Add the music theory breakdown display for a tapped chord. (found in `src/components/Results/ChordDetailModal.tsx`)
- [x] Add the plain-language theory explanations. (found in `src/constants/musicTheory.ts`, `src/components/common/InfoTooltip.tsx`)
- [x] Write the comprehensive mid-project report (found in `documents/mid_project-status-report.md`)
- [x] Update the progress file with everything done this deliverable. (found in `documents/progress.md`)