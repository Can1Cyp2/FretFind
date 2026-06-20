# May 27 - June 8 Test Plan (d1):

This file explains the current mock tests for the first FretFind deliverable. The main project progress is still tracked in `documents/progress.md`, this file only explains the test behaviour and results, plus the current scope of the project, and how this test fits into the larger project.

## What The Tests Cover

The current test file is:
```txt
src/tests/basicControllers.mock.test.ts
```
It tests the three basic controller classes needed for the June 8 skeleton.

## Test 1: FretboardInteractionController

Purpose:
- Confirm the app can accept a hardcoded fret selection.
- Confirm the controller can return the selected note names.
- Showcase basic logic for how fret selections will be processed and stored, plus how the results will be returned.

Mock input:
```txt
String 5 fret 3 -> C
String 4 fret 2 -> E
String 3 fret 0 -> G
String 2 fret 1 -> C
String 1 fret 0 -> E
```

Expected result:

```txt
C - E - G - C - E
```

## Test 2: ChordAnalysisController

Purpose:

- Confirm the selected mock notes are identified as C major.
- Confirm the result is marked as a perfect match.
- Confirm the basic formula is returned.

Expected result:

```txt
Best match: C
Quality: perfect
Formula: 1 - 3 - 5
```

## Test 3: ProgressionController

Purpose:

- Confirm the controller can explain one hardcoded candidate chord inside one hardcoded progression.
- Confirm `Em` fits the mock `C - Am - F - G` progression.
- Confirm the result includes at least one reason and warning.

Expected result:

```txt
Progression: C - Am - F - G
Candidate chord: Em
Fits: yes
```

## How The Tests Work

The tests use simple hard coded notes. If a test fails, the script throws an error and the command fails.

The tests are intentionally small for this first deliverable and is only a skeleton. The goal is to prove the basic interaction between three classes, and showcase how the logic will work.

Run the tests:

```bash
npm run test:mock
```


## How The Files Interact

The mock flow uses six small files:

```txt
src/mockData.ts
  -> provides hardcoded fret selections, progression, and candidate chord

src/controllers/FretboardInteractionController.ts
  -> stores the mock fret selections
  -> returns selected note names

src/controllers/ChordAnalysisController.ts
  -> receives selected note names
  -> returns the hardcoded C major result

src/controllers/ProgressionController.ts
  -> receives C - Am - F - G and Em
  -> returns a hardcoded explanation that Em can fit

src/tests/basicControllers.mock.test.ts
  -> checks each controller separately with assertions

src/scripts/mockProgression.ts
  -> runs the same mock flow and prints the output in the console
```

The test flow is:

```txt
mockData
  -> FretboardInteractionController
  -> selected notes
  -> ChordAnalysisController
  -> chord result

mockData
  -> ProgressionController
  -> progression result
```

The console script flow is:

```txt
mockData
  -> three controllers
  -> formatted console output
```

## Checklist

- [x] Create `FretboardInteractionController`.
- [x] Create `ChordAnalysisController`.
- [x] Create `ProgressionController`.
- [x] Add hardcoded mock fret data.
- [x] Test fret selections returning selected notes.
- [x] Test C major chord identification.
- [x] Test chord Em fitting the C - Am - F - G progression.
- [x] Add a console script to print the mock result.
- [x] Basic logic outline for June 8 deliverable.
