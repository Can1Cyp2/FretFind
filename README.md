# FretFind - Reverse Guitar Chord Finder

FretFind is a React Native and Expo project for identifying guitar chords from the notes a user selects on a virtual fretboard. Instead of starting with a chord name, the app works in reverse: the user enters a fretboard shape, and the app identifies possible chord names and explains the theory behind the result.


## Purpose

FretFind is intended to help guitarists and musicians:
- Identify chords from fretboard shapes.
- Understand how notes form chord structures.
- Learn interval roles such as root, third, fifth, and extensions.
- Recognize inversions and slash chords.
- Explore how tunings affect chord shapes.
- Build and explain chord progressions.

## Planned Features

### Interactive Fretboard

The app will include a 6-string, 22-fret virtual fretboard. Users will be able to tap notes on the fretboard and hear synthesized guitar-like audio feedback.

### Chord Identification

Selected notes will be sent to a chord matching engine. The engine will compare the selected pitch classes against chord definitions and return likely matches.

Planned match types:
- `Perfect`: all essential notes are present with no unexpected notes.
- `Partial`: useful matches where notes may be missing or extra intervals may be present.

### Chord Detail View

Chord results will include explanations showing:
- Chord name.
- Spelled notes.
- Interval formula.
- Bass note.
- Inversion or slash chord information.
- Why the chord matched the selected notes.

### Tunings

The app will support preset guitar tunings and a custom tuning editor. Changing the tuning updates the note detection across the fretboard.

### Progression Builder

Users will be able to save identified chords into a progression timeline. The app will explain how chords fit into a progression and why a chord may sound stable, tense, or unexpected.

## Current Deliverable Scope

The current work covers:
- Defining the frontend and backend/local controller API.
- Writing the first functionality definition.
- Choosing a controller-focused MVC-style architecture.
- Creating initial TypeScript class skeletons.
- Planning one proof-of-concept chord/progression analysis flow.
- Planning mock test data and a console script.
- Creating project documentation and wireframes.

See: documents/ and documents/progress.md

## Tech Stack

This repository currently uses:
| Area | Tool |
| ---  | ---  |
| App framework | React Native  |
| Tooling   | Expo              |
| Language  | TypeScript        |  
| Audio     | `expo-av`         |
| Local storage     | `@react-native-async-storage/async-storage` |
| Backend/Controller | Local TypeScript + PostgreSQL (Likely Supabase) |

The planned architecture avoids unnecessary dependencies where possible and uses React state patterns before utilizing heavier libraries.

## Planned Architecture

The app will use a controller-focused MVC-style structure:

- Model: typed data for frets, tunings, notes, chord matches, and progressions.
- View: React Native components such as the fretboard, result cards, tuning controls, and progression timeline.
- Controller: classes that coordinate user actions, chord analysis, progression behavior, and renderable output.

Planned high-level structure:

```txt
src/
  audio/
  components/
  constants/
  context/
  controllers/
  engine/
  hooks/
  styles/
  types/
  tests/
documents/
  ...
  progress.md
README.md
LICENSE
```

## Getting Started

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npm run start
```

Run platform targets:

```bash
npm run android
npm run ios
npm run web
```

## Available Scripts

```bash
npm run start
npm run android
npm run ios
npm run web
```

## Documentation

Project planning documents live in `documents/`.

Current core documents:
- `documents/progress.md`: progress report for each of the 2026 SU Term deliverable ranges.

## License
FretFind is licensed under the Apache License 2.0 with the Commons Clause restriction. Commercial use, selling the software, or using it to provide paid services requires explicit permission from the project owner.
