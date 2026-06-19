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