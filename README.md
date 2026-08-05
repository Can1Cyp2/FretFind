# FretFind - Reverse Guitar Chord Finder

FretFind is a React Native and Expo app for identifying guitar chords from the notes selected on a virtual fretboard. Instead of starting with a chord name, it works in reverse: you enter a fretboard shape, and the app identifies the possible chord names and explains the theory behind the result.

It is aimed at self-taught guitarists who can hold a shape without knowing what it is called, and those who do not know what key they are playing in. Everything the app teaches is explained in plain language rather than in vocabulary you would already need a teacher to have given you.

Mobile only, portrait only, and fully functional offline.

## Features

**Interactive fretboard:** Six strings, frets 0 to 22. Tap a fret to select a note, tap again to clear it, or use the 'O' button at the nut to fill every empty string with its open note. Tapping a note plays it and a chord can be strummed.

**Reverse chord identification:** Selected notes are matched against 31 chord types in real time, covering triads, power chords, suspended, sixth, seventh, added tone (example: Cadd9) and extended chords (example: Cmaj7). 

Results are ranked best first and graded:
- `Perfect`: every essential note is present with nothing extra.
- `Partial`: every essential note is present, but one is missing or one extra note is added.
- `Weak`: only about half the essential notes are present.

Inversions and slash chords are detected by comparing the lowest sounding note against the root, so C, E and G with E in the bass is named C/E.

**Chord breakdown:** Tapping a result explains it: the notes, the formula as interval chips colour coded by whether each note is essential, every interval with its full name and the note it lands on, and the voicing when the lowest note is not the root. Every section has an information button with a plain language explanation.

**Chord shapes:** For any chord, the app generates ways it can actually be played in the current tuning, ranked by how playable they are (usually putting the most common shapes first), and any shape can be loaded straight onto the fretboard. Nothing is hardcoded, so the shapes are correct in every tuning.

**Tunings:** Nine presets (Standard, Drop D, Half Step Down, Full Step Down, Drop C, Open G, Open D, Open E, DADGAD) plus a custom tuning builder. Custom tunings are saved on the device and can be renamed and deleted.

**Progression builder:** Collect up to 12 chords into a progression, each one remembering the exact fretboard shape it was played as, so tapping it later puts that shape back. Progressions can be named, reordered, saved and reloaded.

**Chords That Fit:** The app works out which key the progression most likely lives in, without asking, then shows the seven chords that key is built from with their roman numerals, an explanation of what each numeral does, and the chord progressions that recur in real songs written out in that key.

**Audio:** Plucked string synthesis generated on the device, with no audio files shipped. Notes and strummed chords are played back with a volume control.

**Optional account** Signing in is optional and only adds cloud saved progressions. Nothing in the chord matching, audio, tunings or progression builder touches the network.

## Getting started

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run start
```

Then open the project on a physical device or emulator through Expo Go, or through a development build. There is no web version.

### Optional: accounts
Cloud saved progressions need Supabase keys in a `.env.local` file at the project root:

```txt
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Without them the app runs normally with the account features hidden, which is intended.

## Scripts
| Script                     | What it does                                                        |
| -------------------------- | --------------------------------------------------------------------|
| `npm run start`            | Starts the Expo development server                                   |
| `npm run android`          | Builds and runs on a connected Android device or emulator            |
| `npm run ios`              | Builds and runs on iOS                                               |
-
| `npm run test:chords`      | Chord matcher tests: every chord type, edge cases, and note spelling |
| `npm run test:voicings`    | Shape generator tests, sweeping thousands of generated shapes        |
| `npm run test:edge-cases`  | Added tone and extended chord tests across all nine tunings          |
| `npm run test:mock`        | The original controller tests from the first deliverable             |
-
| `npm run mock:progression` | Prints the first deliverables proof of concept from hardcoded data  |
| `npm run build:aab`        | Builds a release Android App Bundle for the Play Store               |
| `npm run build:apk`        | Builds a release APK for direct install                              |

The tests are plain TypeScript compiled and run in Node, so they need no device and no test runner. Each one prints what it checked.

## Testing

Four test suites, 703 lines in total, all in `src/tests/`. They run from the console and print their results, so the output doubles as evidence of what was checked.

**`test:chords`, the chord matcher.** Known input against known correct output. One case for every one of the 31 chord types, with the roots varied so the matcher is shown to work from any root rather than only from C. Then the edge cases: too few notes, duplicate notes, first and second inversions, the ambiguous Am7 against C6 pair, a cluster of notes that should produce no perfect match, the two note power chord, and a chord missing its optional fifth. Then note spelling: sharps, flats, and the default.

**`test:voicings`, the shape generator.** Rather than checking specific answers, this generates shapes and asserts rules that have to hold for all of them: every shape contains its chord's essential notes, no shape needs more than four fingers, and no shape stretches further than four frets. 2976 shapes are checked. It also confirms the top ranked shape for C, Em, G, Am, D, Cmaj7 and A5 is the open shape a beginner learns first.

The most important check in the suite is that the same chord returns different frets in different tunings: D major comes back as `[x x 0 2 3 2]` in Standard and `[0 0 0 2 3 2]` in Drop D. That is what proves the shapes are generated rather than looked up.

**`test:edge-cases`, the added tone and extended chords:** That optional notes really are dropped where expected (149 of 180 root and chord type combinations drop one), that busier chords still use enough strings for their note count (1440 shapes), that the dominant 11th can find a shape without its clashing third at every root, and that all of it holds across all nine preset tunings.

**`test:mock`, the controllers.** The three controller classes from the first deliverable, a simple proof of concept that the app could be built. The tests are the same as in the first deliverable and they are still useful for confirming that the controllers still work after the engine was rewritten to be more testable.

**Device testing.** The app is in closed testing on Google Play with 28 daily testers using it on their own devices. That testing revealed small screen layout problems and the touch targets that were too small, neither of which appeared on the development devices.

## How the code is organised

The project is layered, and the layering was purposeful: the engine does not import anything from the interface, which is what lets the chord logic be tested from a console with no device attached, and what stops a failure in the optional backend from reaching the chord matching.

```txt
App.tsx                  the screen, and the one place the selected notes live

src/
  types/                 the shared data shapes (notes, tunings, chords, matches, progressions)
  constants/             data tables: chord formulas, scales, tunings, theory explanations
  engine/                the logic, no interface code and no dependencies on React
    chordMatcher.ts        notes in, ranked chord names out
    keyMatcher.ts          progression in, likely key and its chords out
    voicingGenerator.ts    chord plus tuning in, playable shapes out
    chordNamer.ts          formatting chord and note names
    noteUtils.ts           intervals and pitch class arithmetic
  audio/                 tone synthesis and playback
  hooks/                 state that persists: progressions, tunings, settings, account
  services/              the Supabase client and cloud saved progressions
  controllers/           the original controller classes from the first deliverable
  components/            the interface, grouped by area
    Fretboard/             the board, fret rows, tuning and strum buttons
    Results/               the result list and the chord breakdown sheet
    Progression/           the progression strip and its sheets
    common/                shared sheets and controls
  styles/                colours and shared styles
  tests/                 the four test suites

documents/               planning, progress and issue documents for every deliverable
```

Data flows one way: The selected notes live in `App.tsx` and are passed down to the components, so the fretboard and the results can never disagree about what is selected. Chord types, scales and tunings are data tables that the engine reads rather than logic written into it, so adding a chord type is adding a row rather than changing the matcher.

## Tech stack

| Area               | Tool                                                          |
| ------------------ | ------------------------------------------------------------- |
| App framework      | React Native 0.81                                             |
| Tooling            | Expo SDK 54                                                   |
| Language           | TypeScript                                                     |
| Audio              | `expo-av`, with tones generated in app                         |
| Local storage      | `@react-native-async-storage/async-storage`                    |
| Safe areas         | `react-native-safe-area-context`                                |
| Backend (optional) | Supabase (SQL), authentication and Postgres with row level security |

## Documentation

Everything in `documents/`:

- `progress.md`: the running progress report, one section per deliverable (through d1 to d8).
- `3.final_project_report.md`: the final report covering the whole project.
- `1.early-mid_project-status-report.md` and `2.mid_project-status-report.md`: the two status reports.
- `d1-may27-jun8/` through `d8-jul31-aug4/`: individual deliverable plan files, issue files and screenshots of major milestone progress.
- `todo_future.md`: work deliberately left for after the project, because I ran out of time. It is a list of features that I would like to code in the future to keep the project going.

## License
FretFind is licensed under the Apache License 2.0 with the Commons Clause restriction. Commercial use, selling the software, or using it to provide paid services requires explicit permission from the project owner.
