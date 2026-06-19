# June 8 - June 19 Base App Outline (d2):

This file explains the current work for the second FretFind deliverable. The main project progress is still tracked in `documents/progress.md`, this file only explains what was built for the base app outline, the core data structures that were defined, and how this fits into the larger project.

## What This Deliverable Covers

The June 19 goal is the base app outline: the core technical design completed, the data structures for notes, pitch classes, fretboard positions, intervals, and chord formulas defined, and a first interactive fretboard prototype implemented.

The work so far has the goal to create the basic outline of the app: 
- A fretboard you can interact with
- Core note and fretboard 
- Intervals and chord (Not done yet, but the data structures are defined for these)

The current screen has the following features:
A vertical guitar fretboard, 6 strings, frets 0 to 22.
Tap a fret to select the note on that string.
Tap the same fret again to clear it.
Tap the 'o' button at the nut to fill every empty string with its open note.


## Interactive Fretboard Prototype:

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

## How The Files Interact

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
  -> colours and layout for the fretboard. The files are in american english for consistency with general app formatting.

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

## App Entry

The app screen is wired in `App.tsx`:

```txt
App
  -> screen title
  -> Fretboard
```

There is no audio, chord result, or progression on screen yet. This deliverable is only the interactive fretboard and the data model behind it.

## Checklist

- [x] Define the note and pitch class data structures.
- [x] Define the fretboard position data structures.
- [x] Define a tuning data structure and the standard tuning.
- [x] Add the note name tables and fretboard size constants.
- [x] Add helpers for the pitch class at a fret and its note name.
- [x] Build the interactive fretboard prototype with tap to select.
- [x] Wire the fretboard into the main app screen.

The following checklist items might be pushed back past June 19. The current goal is to have the fretboard and data model done by then, with intervals and chord formulas to be added in the next deliverable. As I realized it might be easier to code this in a different way.
- [ ] Define the interval data structures.
- [ ] Define the chord formula data structures.
