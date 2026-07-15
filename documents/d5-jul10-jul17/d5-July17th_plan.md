# July 10 - July 17 Expanded Chords, Theory Breakdown, Refinements, and Mid-Project Report (d5):

5th deliverable plan file. It carries on from d4, which finished the coded chord matcher tests and pushed the small refinements forward to here.

This deliverable lines up with the halfway point of the project, so alongside the app work it will include a full, formal mid-project report that builds on the early-mid report from d3.

## What This Deliverable Covers

The July 17 goal from the contract is the expanded chord identification and the music theory breakdown display. On top of that, this deliverable picks up the small refinements that were pushed forward from d4, and adds a mid-project report.

So the four parts are:

- Expand the chord identification: add the added-tone chords and the common extended chords to the chord table.
- Add music theory breakdown display: a detail view for a chord that explains its formula, its intervals, and which notes are essential.
- Finish the small refinements pushed forward from d4: the show octaves switch, the sharp and flat preference switch, and the adjustable results table.
- Write mid-project report.

The chord matching engine, the naming, the tests, and the note and fretboard data structures are all already done, so most of this deliverable is building on top of the work rather than starting anything from scratch, but I do suspect new files for the theory breakdown display and the mid-project report later in the deliverable.

## Expanded Chord Identification

The matcher already works from a table of chord formulas, and it tries every formula against the tapped notes, so expanding the chords is mostly a matter of adding rows to the table. No matching logic has to change.

The contract originally asks for added-tone chords and common extended chords. Right now, inversions, enharmonic equivalents, duplicate notes, and suspended chords are already handled from d3, I am continuing this idea after speaking with my instructors to now add:

```txt
Added-tone chords:
  add9   -> 0, 2, 4, 7        (a major triad with the 9th added, no 7th)
  madd9  -> 0, 2, 3, 7        (a minor triad with the 9th added)
  add11  -> 0, 4, 5, 7      (a major triad with the 11th added)
  6/9    -> 0, 2, 4, 7, 9   (a major 6th chord with the 9th added)
  m6/9   -> 0, 2, 3, 7, 9    (a minor 6th chord with the 9th added)

Extended chords:
  9      -> 0, 2, 4, 7, 10   (a dominant 7th with the 9th added)
  maj9   -> 0, 2, 4, 7, 11   (a major 7th with the 9th added)
  m9     -> 0, 2, 3, 7, 10   (a minor 7th with the 9th added)
  11     -> 0, 2, 4, 5, 7, 10 (a dominant 9th with the 11th added)
  m11    -> 0, 2, 3, 5, 7, 10
  13     -> 0, 2, 4, 5, 7, 9, 10
  m13    -> 0, 2, 3, 5, 7, 9, 10
  maj13  -> 0, 2, 4, 5, 7, 9, 11
```

Each new formula also gets its essential intervals (the notes that must be present for it to count as that chord) the same as the existing table, because the extended chords have five, six, or seven notes and a guitarist usually cannot hold all of them at once, their essential intervals leave out the fifth and sometimes lower tones, so a common four note voicing still names the full chord. The matcher already has the leeway for chords of five or more notes, so this fits the logic that is already there.

Each new chord type also gets a test case added to `src/tests/d4-chord-matcher-tests.ts`, one verified example per formula.

## Music Theory Breakdown Display

Right now tapping a result does nothing, it just shows the chord name, its notes, and the perfect or partial badge. This deliverable adds a detail view that opens when a result is tapped, and explains the theory behind the chord in plain language:

- The notes of the chord.
- The formula, shown as interval names (R, 3, 5, b7, and so on) with the essential notes marked apart from the optional ones.
- The intervals listed out with their full names (Root, Major 3rd, Perfect 5th, Minor 7th) and the note each one lands on
- The voicing, when the chord is an inversion or a slash chord (which note is in the bass).
- Short plain-language explanations for the chord and for each interval, so someone who does not know theory can still learn from it.

The interval helpers for this (intervalToName and intervalToFullName) were already added in d3, so the naming side is ready. This deliverable adds the explanation text and the detail view itself.

## Small Refinements (pushed forward from d4)

These carry over from the d4 plan, where they were pushed back so the tests could be finished first. The props for all of them already run through the code, only the switches are missing:

- Show octaves: add the open string octave numbers to the constants (standard tuning is E2 A2 D3 G3 B3 E4) and a switch in the UI, so labels can show E2 instead of just E.
- Sharp and flat preference: add the switch so the user can flip between sharps (A#) and flats (Bb) at any time, the preferFlats prop already flows through the fretboard, the matcher, and the results.
- Adjustable results table: make the results panel height adjustable, so the user can give more room to the results or to the fretboard.

## Mid-Project Report

This is the formal centrepiece of the deliverable. It is saved with the encompassing progress files as `documents/mid_project-status-report.md`, and it builds on the early-mid report from d3 (`documents/early-mid_project-status-report.md`). It is essentially an expansion on the early report, but more thorough.

Planned sections:

- Overview: a short abstract of the project and where it stands at the halfway point.
- Purpose: a fuller version of why this app exists, written around my own experience of learning guitar self-taught, knowing the chord shapes but never knowing which notes I was actually playing or why they worked, which is the exact gap the app fills.
- Current project outline: the revised deliverable roadmap, so the report reflects the plan I am actually following, not just the original contract dates.
- Technical design: a summary of the reverse chord matcher, the main technical idea of the project.
- What is complete and what remains.
- Testing summary: the coded chord matcher tests from d4 as evidence the logic is correct.
- Citations: for each source, the exact idea I took from it and the file or logic it shaped, reviewed properly rather than listed loosely like I did previously.
- Issues faced, issues foreseen, and challenges so far.
- Closing: that I am beginning d5 now, and the plan for the future. The report does not go into d5 detail beyond this.

## Revised Project Outline Up To d5:

The outline I am actually following, which shifts some contract items around but keeps the same end date:

d1 (May 27 - Jun 8) : Basic project outline, plan, mock proof of concept        [done]
d2 (Jun 8 - Jun 19) : Base app outline, interactive fretboard prototype         [done]
d3 (Jun 19 - Jul 3) : Reverse chord matching, live results, early-mid report    [done]
d4 (Jul 3 - Jul 10) : Coded chord matcher tests                                 [done]
d5 (Jul 10 - Jul 17): Expanded chords, theory breakdown display, refinements,
                      comprehensive mid-project report                          [this one]
... (Continues in the mid-project report in a more thorough manner)

The App Store and Google Play Store profiles are still optional and can be set up in the background, per the instructor, they are no longer a hard requirement of any single deliverable. Though, I have set up the profiles and connected them to the app, as seen in app.json.

## New And Changed Files

New planned files:

```txt
documents/mid_project-status-report.md
  -> the comprehensive mid-project report

src/components/Results/ChordDetailModal.tsx (or similar)
  -> the music theory breakdown detail view for a tapped chord

src/constants/musicTheory.ts
  -> the plain-language explanations for the chord notes, the formula, and each interval
```

File that I see needing changes:
src/constants/chords.ts
  -> add the added-tone and extended chord formulas
src/tests/d4-chord-matcher-tests.ts
  -> add a test case for each new chord type

src/constants/tunings.ts
  -> add the octave numbers of the open strings for the standard tuning

App.tsx
  -> add the switches for octaves and sharps or flats and the results panel size control

src/components/Results/ResultsPanel.tsx and ChordResultCard.tsx
  -> open the detail view when a result is tapped, and make the panel height adjustable

src/styles/resultStyles.ts
  -> styles for the detail view, the switches and the adjustable heights

## Checklist

The refinements pushed forward from d4 come first, since they were already due before the new d5 work, then the expanded chords and the theory breakdown, then the report.

- [X] Add the show octaves switch.
- [X] Add the sharp or flat preference switch.
- [X] Make the results table adjustable.
- [X] Add the added-tone chord formulas to the chord table (9th chords, 11th chords, 6/9 chords, and such)
- [X] Add the common extended chord formulas to the chord table (9th, 11th, 13th, and their minor and major variants)
- [X] Add a third match grade (weak, in red) below perfect and partial for weaker matches, so results are graded in three tiers instead of two.
- [X] Add a test case for each new chord type and confirm the whole run passes.
- [ ] Add the music theory breakdown display for a tapped chord.
- [ ] Add the plain-language theory explanations.
- [ ] Write the comprehensive mid-project report.
- [ ] Update the progress file with everything done this deliverable.
