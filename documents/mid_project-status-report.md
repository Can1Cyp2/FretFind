# FretFind Mid-Project Status Report

Deliverable 5 (d5): Mid-Project Status Report
Report date: July 11, 2026
Covers: May 27, 2026 - July 10, 2026

__This is the formal mid-project report for FretFind__
It builds on the early-mid project status report submitted in the July 3 deliverable (`documents/early-mid_project-status-report.md`) and on the detailed per-deliverable tracking in `documents/progress.md`. Where a section from the early-mid report is still accurate, its text is carried over so the two reports stay consistent, and this report expands on it with the fuller detail expected at the halfway point of the project.

## Overview
FretFind is a mobile application built with React Native and Expo, that identifies guitar chords in reverse. 

Instead of searching for a chord by name and then looking up its notes, the user selects the notes they are playing on an interactive fretboard, and the app works out the chord or chords those notes form, in real time.

This report marks the mid-point of the project. At this stage the core of the application is complete and working: the interactive fretboard, the reverse chord-matching engine, real-time chord results, and a full suite of coded tests that verify the matching logic. The remaining half of the project expands the range of recognized chords, presents the underlying music theory to the user, adds audio and a chord progression builder, and adds a backend for user accounts and cloud saved progressions.

<!-- ----------------------------------------------------------------------- -->
## Purpose:
### Personal Background
I first learned guitar five years ago on my own, with no teacher, no plan, and no structure to follow. I completely taught myself. I started the way most people do: I found songs I liked, looked up their tabs and chord charts, learned the chord shapes, followed the tab instructions, and played the songs I enjoyed. After a few years I had a comfortable handle on the basic chord shapes and could play most of the songs I wanted to.

Eventually I wanted to understand more than just shapes, so I began trying to learn music theory. I was lost, and had no idea where to start. I tried watching YouTube videos, I tried talking to people I knew who played guitar, began playing piano (a more simple instrument for understanding music theory) and very little of it made sense to me. For a long time I gave up on the theory and kept playing chords purely by shape, without understanding the purpose behind them.

Fast forward, a year to two later: within the last year I started to understand music theory in a new way. After enough years on the instrument I had begun to feel how the fretboard worked without being able to name it: Some notes sounded better with others, and others not so much. Some chords together sounded sorrowful, others sounded joyous, and some had a melencholic tone. I then translated this knowledge into a deeper understanding: notes in certain areas would form certain chords, notes that were not in the underlying scale would make what I was playing sound off, and some notes sounded better together than others when sharing a chord shape. I could hear all of this, but I could not explain why until I looked closer at the theory.

The core problem was simple. As someone who began guitar by themselves, I did not know which notes I was playing, and I had no easy way to know which notes I was playing, and thus which chords I was forming beyond memorizing shapes. What I went through is common for new guitarists like myself, I knew the shape, not the notes, and definitely not the theory behind them. 

That gap is the reason for this app. What took me five years to learn, I want to make available to anyone who is self-taught and wants to understand the music they are playing.

### App Purpose
FretFind closes that gap by working the same direction a self-taught player actually plays. Instead of asking the user to already know a chord's name and then find its shape, the user taps the notes they are already playing on a virtual fretboard, and the app tells them what those notes are and what chord they form. It names the chord, shows the individual notes, and, from this deliverable onward, explains the theory behind it in plain language: the formula, the intervals, and which notes are essential.

However, the app is not just useful for new players. It is also useful for more experienced players who want to understand theory deeper. Or, if you already know the theory, but need some creative inspiration, the chord progression builder and audio playback will let you experiment with new chords and progressions, and hear how they sound together. Helping musicians not just understand music, but also create it.

The main goals are to:
1. Turn the by-feel knowledge that a self-taught player builds up into something they can actually see and name. 
2. A guitarist who only knows shapes can use FretFind to discover the names of the chords they already play, understand why those chords sound the way they do, and slowly build a real understanding of the fretboard, intervals, and chord construction.
3. An experienced player can use FretFind to explore new chords and progressions, and hear how they sound together.

Ultimately it is aimed at self-taught learners, guitar students, songwriters, and anyone who can already play but wants to finally understand what they are playing.

## Current Project Outline

The outline below is the plan I am actually following. It shifts some items from the original contract around, and adds a backend (see the backend section), while keeping the same final end date.

| Deliverable | Dates                           | Focus                                                                                                | Status     |
| ----------- |-------------------------------- | ---------------------------------------------------------------------------------------------------  | -----------|
| d1          | May 27 - Jun 8                   | Basic project outline, plan, mock proof of concept                                                   | Done        |
| d2          | Jun 8 - Jun 19                   | Base app outline, interactive fretboard prototype                                                    | Done        |
| d3          | Jun 19 - Jul 3                   | Reverse chord matching, live results, early-mid report                                               | Done        |
| d4          | Jul 3 - Jul 10                   | Coded chord matcher tests                                                                            | Done        |
| d5          | Jul 10 - Jul 17                  | Expanded chords, theory breakdown display, refinements, this report                                  | In progress |
| d6          | Jul 17 - Jul 24                  | Audio playback, chord progression builder, backend (accounts and cloud save), UI refinement, testing | Planned     |
| d7          | Jul 24 - Jul 31                  | Draft final documentation, polish, final testing, store submission                                   | Planned     |
| d8          | Jul 31 - Aug 4                   | Final deliverables, published app                                                                    | Planned     |
| d9          | Seminar date (not yet published) | Final poster prepared and presented                                                                  | Planned     |

The detailed, previously revised descriptions of the remaining deliverables are carried over from the early-mid report and listed in the "What Remains To Be Implemented" section below, so the plan for the next deliverables are stated in full.

## Technical Design

The main technical component of the project is the reverse chord matcher. 

It works in five steps:
1. It collects the tapped notes as pitch classes (a note without its octave) and removes duplicates.
2. It finds the bass note, the lowest string that has a selection.
3. It tries all twelve notes as a possible root, one at a time.
4. For each candidate root, it measures the interval (the distance in semitones) from the root to every selected note, and compares that set of intervals against a table of chord formulas.
5. It scores every possible match and sorts them from best to worst.

A chord formula is stored as the set of intervals that make it up, together with the essential intervals that must be present for the chord to count. Because the formulas and the matching logic are kept separate, new chord types are added simply by adding rows to the table, with no change to the matching code. This is the design decision that makes the expanded chords in the current deliverable a low-risk addition.

Matches are marked perfect when every essential note is present and nothing extra is added, and partial when the fit is close but not exact. The matcher also detects inversions and slash chords, by checking whether the bass note is something other than the root.

## What Is Complete

Through deliverables d1 to d4, the following is done and verified:

| Deliverable               | Date range       | What was built                                                                                                                                                                       |
| ------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| d1: Basic Project Outline | May 27 - June 8  | Project purpose and scope, basic controller class skeletons, a hardcoded proof of concept (C major and a progression), mock tests, README, License, wireframes                       |
| d2: Base App Outline      | June 8 - June 19 | Core data structures for notes, pitch classes, fretboard positions, and tunings, plus the interactive fretboard prototype with its full styling                                      |
| d3: Chord Matching        | June 19 - July 3 | Interval and chord formula data structures, the chord formula table, the reverse chord matching engine, the chord naming helper, and the live results panel                          |
| d4: Chord Matcher Tests   | July 3 - July 10 | Coded tests for every chord type, the edge cases, and the naming preferences, run with`npm run test:chords`, plus screenshots of passing runs and the app naming real chord shapes |

In app terms, the working prototype currently:
- Shows an interactive 6 string, 22 fret guitar fretboard.
- Lets the user tap notes to select them, and tap again to clear them.
- Names the matching chords in real time, ranked best to worst with perfect or partial badges.
- Recognises triads, power chords, suspended chords, sixth chords, seventh chords, inversions, and slash chords.
- Handles duplicate notes and enharmonic spelling (sharps and flats).
- Is backed by a full suite of coded tests that verify every chord type, the edge cases, and the naming preferences, all passing.

I want to note that the partial ranking of a chord is varied, the app will in the future include weaker partial matches as weak, because it is less likely that a chord is being played if it is missing more than one essential note. The current implementation is a larger encompassing placeholder, as it is unlikely the user will utilize partial matches unless progression building or simply finding bizare chord variations.

## What Remains To Be Implemented

The detailed descriptions below are the previously revised outline carried over from the early-mid report, so the plan for the remaining deliverables is stated in full.

d5 - By July 17, 2026 (the current deliverable):
Expanded chord-identification system completed, including support for inversions, enharmonic equivalents, duplicate notes, suspended chords, added-tone chords, and common extended chords. Music theory breakdown display/information completed.

d6 - By July 24, 2026:
Audio playback and chord progression builder implemented. User interface refined, meaning bug fixes, visual improvements and usability enhancements. The backend will be completed with account logging in and chord progression saving to cloud storage. Testing begins for the more difficult notes implemented last milestone (d5) for accuracy, edge cases, and usability. 
- Implement the backend, including account creation and login, and cloud saved progressions. The front-end and back-end will be integrated so that the app works as a single application, but may be mixed into the d7 deliverable if time is tight.

d7 - By July 31, 2026:
Finish backend implementation. Draft final documentation completed. Main implementation completed except for minor fixes, polish, and final testing. Send the final version of the app to the App Store and Google Play Store, for full testability. If this is not possible, I will request friends, family and other volunteers to test the app on their own devices, and report back any issues they find. I will also request that they test the app on both iOS and Android devices, so that I can ensure that the app works well on both platforms.

d8 - By August 4, 2026:
Final project deliverables completed and submitted, including source code, documentation/report, testing summary, and user/setup instructions. Plus published app on the iOS App Store and Android Google Play Store (subject to timing of app approval from these providers).

d9 - Around the scheduled EECS4080 seminar date (not yet published):
Final poster prepared and presented according to EECS4080 requirements.

## Backend Plan
A backend was not part of my original project plan. After discussing the project with my instructor, they suggested adding a backend, so the project includes a server side and data storage component alongside the front-end app. I am adopting that suggestion, and it is scheduled as part of deliverable d6.

The plan:
- Provider: Supabase, which provides authentication and a hosted database together, and which I have worked with before.
- Account profiles: users can create an account and sign in. An account is optional, the app works fully without one, so a casual user is never forced to sign up just to use the chord matching.
- Cloud saved progressions: once the chord progression builder is in place, a signed-in user can save their chord progressions to the cloud and load them back later, on any device. Saving is opt-in, so a user's progressions stay on their device unless they choose to save them.

Because the backend is a distinct piece of work, the deliverable that adds it (d6) also covers merging it with the existing front-end. I believe keeping the accounts and the cloud save optional allows users to secure their data and does not distract from the core reverse chord matching, which is the heart of the project, it does not ever depend on a network connection or a login so it is optional.

## Testing Summary
The chord matcher is covered by coded tests in `src/tests/d4-chord-matcher-tests.ts` , run with `npm run test:chords`. The tests are plain TypeScript that go into the engine directly, so they run in the console and print their results, and a failing check throws an error and fails the run. 

They cover three areas:
- Every chord type in the table, one known example each, with the roots varied so the matcher is shown to work from any root and not just from C.
- Edge cases: too few notes, duplicate notes, first and second inversions, ambiguous shapes (Am7, versus C6), a note cluster that should produce no perfect match, the two-note power chord, and a chord missing its optional fifth.
- Naming and preference handling: sharps, flats, and the default spelling.

The full suite passes. A screenshot of a passing run, along with screenshots of the app naming real chord shapes, is in documents/d4-jul3-jul10/. These coded tests replace the manual checks I relied on in d3.

## Citations

The following sources informed specific parts of the implementation. For each one, the exact idea I took from it and where it was used:
- Defining intervals (Music Stack Exchange): the definition of an interval as the distance in semitones between two notes, named by its size and quality (for example a minor third is three semitones and a perfect fifth is seven). This is the exact model I used in the interval helper in `src/engine/noteUtils.ts` and by the whole matcher, which represents every chord as a set of these semitone intervals measured from a root.
      *https://music.stackexchange.com/questions/60771/*

- Music: A Mathematical Offering, by Dave Benson (chapters 5, 6, and 9): the mathematical treatment of scales, intervals, and chords, which grounds the decision to represent chords numerically as interval patterns rather than as note names. This knowledge exists in the chord formula table in `src/constants/chords.ts` and the interval based comparison in `src/engine/chordMatcher.ts`.
      *https://www.google.ca/books/edition/Music_A_Mathematical_Offering/Ko1NsIq4qLIC?hl=en&gbpv=0*

- A music theory video (YouTube): general background on chord and interval construction while I was first learning the theory. I used it more as background learning than as a direct source, but it helped me understand the theory and how to represent it in code.
      *https://www.youtube.com/watch?v=dXg8eCHNaTE*

For the audio playback planned in a later deliverable, I have found these sources that I believe will be useful for implementing the tone generator and note to frequency playback:
- Playing notes (Code.org Maker Toolkit): a note-playing method that takes a note name and octave (for example "C4" or "D#5") rather than a raw frequency. This matches how the app already represents a note as a pitch class plus an octave, and is the model I plan to follow for playing selected notes.
      *https://studio.code.org/docs/concepts/maker-toolkit/playing-notes/*

- Calculating the frequency of a note (Reddit): the standard equal-temperament formula, where each semitone multiplies the frequency by the twelfth root of two, with A4 fixed at 440 Hz. This is the math the planned tone generator will likely use to turn a note into a sound.
      *https://www.reddit.com/r/musictheory/comments/j3q0i3/how_can_you_calculate_the_frequency_of_a_given/*


## Issues I Faced (Resolved):
1. Expo Go version mismatch: the project was set up on a newer Expo SDK than the Expo Go app on my phone could run, so the app would not load and the store had no newer Expo Go to download. Fix: aligned the project to Expo SDK 54, which my phone runs. Lesson: check the SDK against the Expo Go version before setting up.
2. Blocked npm installs: security software on my machine inspects traffic, so npm could not verify certificates (UNABLE_TO_VERIFY_LEAF_SIGNATURE) and installs would hang. (This is a specific issue to my machine and anti-virus software, but not a general problem I have experienced many times before, so it set me back a bit.)
   Fix: Tell Node to trust the npm / Windows certificate store. Installs work normally now.
3. Stale bundler cache: the Metro bundler kept erroring, asking for an old icon file that no longer existed in the project, due to building the project from a template "npx create-expo-app@latest --template default@sdk-57".
   Fix: cleared the cache and started with `npx expo start -c`.
4. Shared selection state: the selected notes originally lived inside the Fretboard component, so the new results panel could not see them. Fix: moved the selection state up to `App.tsx`, which passes it down to the fretboard and feeds it to the matcher. One area so the fretboard and the results always agree.
5. I had a few issues in figuring out the best way to implement the reverse chord matching logic, but after a few iterations I settled on the current approach, which is working well. The main idea is to try every note as the root (testing the lowest first as that is often the correct case), measure the gaps (intervals) from that root to every selected note, and compare those gaps against a table of chord formulas. The matches are scored and ranked, and the best matches are shown first.
   This is better than the alternatives I considered, which were to try chord formulas against the selected notes (common ones first, and so on based on a root) (which would be slower and more complex), or to try every possible chord name (which would be even slower and more complex). The current approach is simple, fast, and works well. Although the logic is not specific to guitar, it is a good fit for the app, and allows expansion of other instrument types to be added later.

- Overall my issues were mostly small environmental problems, and the main technical challenge was the reverse chord matching logic, which is now complete and working.

## Issues Still There:
- Ranking judgment calls: the same notes can be more than one chord (for example Am7 and C6 contain the exact same four notes). The scoring handles this by favouring simpler and more common chords, but the weights are my own judgment and will need tuning as more chord types are added. Also, the app does not know the musical key, so it cannot know which chord is more likely in context. When the app is mostly complete, I would like to revisit the scoring, as in when the theory breakdown display is built. 
- Partial matches: the current implementation of partial matches is a large encompassing placeholder, as it is unlikely the user will utilize partial matches unless progression building or simply finding bizarre chord variations. I would like to revisit the partial match scoring when the theory breakdown display is built, and add weaker partial matches as weak, because it is less likely that a chord is being played if it is missing more than one essential note.
- Enharmonic spelling: the default spelling table picks the more common name for each note (F# rather than Gb, and so on), but the truly correct name depends on the musical key, which the app does not know. It is good enough for now, and I will revisit when the theory breakdown display is built.
- Settings placement: the note spelling and octave label preferences are now in the UI (as of d5), but placement is constrained. The options live in a bottom sheet that opens from an "⚙ Options" button in the header, which keeps them accessible but not always visible on the main screen. I left the button in the top right corner for now but as the header gains more controls (tuning selector, progression manager, etc.), I will need to revisit the header layout to ensure all controls stay reachable and the title stays centered. The preference switches themselves work well, but finding them requires a deliberate tap rather than a one-glance setting, and that may affect discoverability and ease of use for the user.
- Results panel scrollbar: the results panel has a scrollbar on the right side to show there is more content below, but the scrollbar overlaps the result card padding due to the panel layout. I can either adjust the padding to leave room for the bar, or remove the scrollbar entirely. Keeping the bar provides useful feedback that there are more chords to scroll through, but removing it would clean up the visual layout and remove the overlap. This tradeoff is unresolved for now.

## Issues I See Facing In The Future, And How I Plan To Overcome Them:

- Audio playback: I plan to generate my own midi style sounds rather than use recorded samples, which means working out the frequency of each note from its number. The math for this is well documented (each semitone multiplies the frequency by the twelfth root of two), so the plan is a small tone generator that computes the frequency from the note and octave. See the sources/citation section in `documents/progress.md`.
- Store approval timelines: (Though this is not an important aspect of the project, after discussing the project with the instructor, I will focus on testing, refinement, and featuers rather than the App Store approval process. Though, I would still like to submit the app for approval.) The review times are outside my control, so the plan is to set up the store profiles early (the July 10 milestone) and submit the final build well before August 4, hoping slow approval does not matter too much.
- Growing chord table: the matcher tries every root against every formula. That is less work now and it stays small because the table only grows by tens of entries, but the matcher was deliberately written so that adding chord types only means adding table rows, never rewriting the logic.
- Screen space: the fretboard and the results panel now share one screen, and both need sufficient room. The plan is to make the results panel collapsible or draggable when the interface refinement milestone comes, so the user can choose what to focus on.
- Backend integration: the backend is new to the plan, so the risk is letting it worsen the core app. The plan is to keep accounts and cloud save optional and separate, so the reverse chord matching never depends on them, and to lean on Supabase (backend service with SQL) to host a free backend for me. I will need to refresh my SQL knowledge to implement the backend, but I have done it before so I am not too unfamiliar with it.

## Challenges So Far:
The largest technical challenge was the reverse chord matcher itself: deciding how to turn a set of tapped notes into a ranked list of named chords, and doing it in a way that stays fast and simple as more chord types are added. I went through a few approaches before settling on trying every note as a root and comparing intervals against a formula table.

The remaining challenges so far have been environmental rather than conceptual: an Expo SDK mismatch with my phone, a anti-virus certificate inspection problem that blocked package installs, and a stale bundler cache. Each is documented above and each is resolved.

The current overall challenge going forward is presenting the theory clearly to a beginner in the music theory breakdown display, and adding the backend cleanly without letting the core app depend on it.

## Closing
At this mid-point: the core of FretFind is built, tested, and working: a user can tap notes they are playing on a virtual 22-fret fretboard and immediately see what chords they form. The remaining deliverables expand the range of recognized chords, explain the theory behind each chord, add sound and a chord progression builder and add an optional backend for accounts and cloud saved progressions.

I am beginning deliverable d5 now and the outline above sets out the plan for the deliverables that follow, through to the final submission and the seminar poster. Any further changes to that plan will be documented in the progress file and in the reports that follow (as needed).
