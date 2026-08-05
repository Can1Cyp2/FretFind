# FretFind Early-Mid Project Status Report

Deliverable 3 (d3): early-Mid-Project Status Report
Report date: July 3, 2026
Covers: May 27, 2026 - July 3, 2026

This report is an extension of `documents/progress.md`. The progress file tracks each deliverable in detail as it happens, this report steps back and sums up where the whole project stands at this early to mid stage: what I have done, what still needs to be implemented, the issues I faced, the issues that are still there, the issues I see facing in the future, and how I plan to overcome them.

## Where The Project Stands

At this stage the app is a working prototype of the core idea. You can tap notes on a virtual guitar fretboard and the app names the matching chords in real time, ranked from best match to worst.

This includes even the harder theory that I was unsure of being able to finish by the July 3rd milestone: common triads, seventh chords, suspended chords, and even inversions and slash chords (when the lowest note is not the root, in simple terms the bass note is different).

The current screen, top to bottom:

- The FretFind title.
- The interactive fretboard (6 strings, frets 0 to 22, scrollable, tap to select notes and tap again to clear).
- The live results panel (updates the moment a note is tapped or cleared, no analyze button).

The project is on schedule against the contract milestones. The one item that moved was the interval and chord formula data structures were pushed from d2 into d3, which has now been completed, so nothing is behind.

## What I Have Done

| Deliverable               | Date range       | What was built                                                                                                                                                 |
| ------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| d1: Basic Project Outline | May 27 - June 8  | Project purpose and scope, basic controller class skeletons, a hardcoded proof of concept (C major and a progression), mock tests, README, License, wireframes |
| d2: Base App Outline      | June 8 - June 19 | Core data structures for notes, pitch classes, fretboard positions, and tunings, plus the interactive fretboard prototype with its full styling.               |
| d3: Chord Matching        | June 19 - July 3 | Interval and chord formula data structures, the chord formula table, the reverse chord matching engine, the chord naming helper, and the live results panel    |

The main technical piece is the reverse chord matcher.
	It collects the tapped notes, tries every one of the twelve notes as a possible root, measures the gaps (intervals) from that root to every selected note, compares those gaps against a table of chord formulas, then scores and ranks the matches. Matches are marked perfect when every essential note is present and nothing extra is added, or partial when the fit is close but not exact.

Test cases are to be added in the next deliverable / this one if I am able to add thorough cases by tomorrow (July 3rd). I have tested the app myself to ensure basic functionality, and it correctly names C major, Cmaj7, C7, Am, and the C/E inversion. The next step is to add coded tests that run and print outputs to verify the matching logic.

## What Still Needs To Be Implemented

Mapped against the remaining contract milestones:

- By July 10: App Store and Google Play app profiles, with the forms for app purpose and data handling. Test cases for the chord matcher (real tests that run and print outputs to verify the matching logic, replacing the manual checks I did this deliverable).
- By July 17: the expanded chord identification (extended chords such as 9ths, 11ths, and 13ths, added tone chords, altered chords, suspended chords, etc.), better enharmonic handling, and the full music theory breakdown display (formulas, interval explanations, and voicing details for each match).
- By July 24: audio playback for selected notes and chords, the chord progression builder, and user interface refinement. Settings for showing octaves and preferring flats also (the code already carries these as props, only the switches are missing, meaning the UI elements are not yet implemented, I am waiting for the thorough test cases to be completed to ensure full proper functionality before I implement them into the UI).
- By July 31 - August 4: the tuning selector and alternate tunings, draft and final documentation, the testing summary, and the store submissions.

Also, still to do from my d3 plan: coded tests for the chord matcher (real tests that run and print outputs to verify the matching logic, replacing the manual checks I did this deliverable). This will likely overlap to the next deliverable. 
    - Found in: 'FretFind\src\tests\d3-chord-matcher-tests.ts'.

## Issues I Faced (Resolved)

1. Expo Go version mismatch: the project was set up on a newer Expo SDK than the Expo Go app on my phone could run, so the app refused to load and the store had no newer Expo Go to download. Fix: aligned the project to Expo SDK 54, which my phone runs. 
Lesson: check the SDK against the Expo Go version before setting up.

2. Blocked npm installs: security software on my machine inspects HTTPS traffic, so npm could not verify certificates (UNABLE_TO_VERIFY_LEAF_SIGNATURE) and installs would hang. 
Fix: set NODE_OPTIONS=--use-system-ca permanently, which tells Node to trust the Windows certificate store. Installs work normally now.

3. Stale bundler cache: the Metro bundler kept asking for an old icon file that no longer existed in the project. 
Fix: cleared the cache and started with `npx expo start -c`.

4. Shared selection state: the selected notes originally lived inside the Fretboard component, so the new results panel could not see them. Fix: moved the selection state up to `App.tsx`, which passes it down to the fretboard and feeds it to the matcher. One source of truth, so the fretboard and the results always agree.

5. I had a few issues in figuring out the best way to implement the reverse chord matching logic, but after a few iterations I settled on the current approach, which is working well. The main idea is to try every note as the root, measure the gaps (intervals) from that root to every selected note, and compare those gaps against a table of chord formulas. The matches are scored and ranked, and the best matches are shown first. 
This is better than the alternatives I considered, which were to try chord formulas against the selected notes (common ones first, and so on based on a root) (which would be slower and more complex), or to try every possible chord name (which would be even slower and more complex). The current approach is simple, fast, and works well.

- Overall my issues were mostly small environmental problems, and the main technical challenge was the reverse chord matching logic, which is now complete and working.

## Issues Still There
- Ranking judgment calls: the same notes can be more than one chord (for example Am7 and C6 contain the exact same four notes). The scoring handles this by favouring simpler and more common chords, but the weights are my own judgment and will need tuning as more chord types are added. Also, the app does not know the musical key, so it cannot know which chord is more likely in context. When the app is mostly complete, I would like to revisit the scoring, as in when the theory breakdown display is built.
- Enharmonic spelling: the default spelling table picks the more common name for each note (F# rather than Gb, and so on), but the truly correct name depends on the musical key, which the app does not know. It is good enough for now, and I will revisit when the theory breakdown display is built.
- No coded tests for the matcher yet: I verified the matching logic by hand this deliverable (C major, Cmaj7, C7, Am, and the C/E inversion all name correctly), but the real runnable tests are still to be written.

## Issues I See Facing In The Future, And How I Plan To Overcome Them

- Audio playback: I plan to generate my own midi style sounds rather than use recorded samples, which means working out the frequency of each note from its number. The maths for this is well documented (each semitone multiplies the frequency by the twelfth root of two), so the plan is a small tone generator that computes the frequency from the note and octave. See the sources section in `documents/progress.md`.
- Store approval timelines: (Though this is not an important aspect of the project, after discussing the project with the instructor, I will focus on testing, refinement, and featuers rather than the App Store approval process. Though, I would still like to submit the app for approval.) The review times are outside my control, so the plan is to set up the store profiles early (the July 10 milestone) and submit the final build well before August 4, hoping slow approval does not matter too much.
- Growing chord table: the matcher tries every root against every formula. That is small work now, and it stays small because the table only grows by tens of entries, but the matcher was deliberately written so that adding chord types only means adding table rows, never rewriting the logic.
- Screen space: the fretboard and the results panel now share one screen, and both need sufficient room. The plan is to make the results panel collapsible or draggable when the interface refinement milestone comes, so the user can choose what to focus on.

## Changes To Technical Milestones

- The interval and chord formula data structures moved from d2 (June 19) into d3, because I realized partway through d2 that they were better coded together with the matching logic rather than ahead of it, and I needed time to figure out the best way to code the chord formula and matching logic so that is efficient, and integrates well with the future features. They are complete now, so the project is caught up with the original contract timeline.

- I am hoping to still be able to be able to upload the app to the playstores, but this is subject to the approval times. After speaking with the instructor, I am focusing more on app features, refinment and testing rather than the store approval. So, I am guiding the milestones to focus on the app features and testing, and the store approval is a bonus if it happens in time. The store approval is not a requirement for the final deliverable, but I will try to get it done if possible.

The next steps in the milestone as per the contract are as follows, with the dates, deliverables and any future revisions I see needed to the milestones:

d4 - By July 10th, 2026:
Set up App Store / Google Play Store app profiles for eventual publication on those app providers. Fill out forms that detail app purpose, data handling information, and other application related information that these providers will require.
Revised: 
Add test cases for the chord matcher (real tests that run and print outputs to verify the matching logic, replacing the manual checks I did this deliverable). Add small refinements such as octaves, sharp and flat symbols/preference handling, and adjustable chord matching results table. Set up App Store / Google Play Store app profiles for eventual publication on those app providers. Fill out forms that detail app purpose, data handling information, and other application related information that these providers will require. 

d5 - By July 17, 2026:
Expanded chord-identification system completed, including support for inversions, enharmonic equivalents, duplicate notes, suspended chords, added-tone chords, and common extended chords. Music theory breakdown display/information completed.

d6 - By July 24, 2026:
Audio playback and chord progression builder implemented. User interface refined. Testing begins for accuracy, edge cases, and usability.
Revised:
Audio playback and chord progression builder implemented. User interface refined, meaning bug fixes, visual improvements and usability enhancements. The backend will be completed with account logging in and chord progression saving to cloud storage. Testing begins for the more difficult notes implemented last milestone (d5) for accuracy, edge cases, and usability.

d7 - By July 31, 2026:
Draft final documentation completed. Main implementation completed except for minor fixes, polish, and final testing. Send the final version of the app to the App Store and Google Play Store, for full testability. 
Revised:
Draft final documentation completed. Main implementation completed except for minor fixes, polish, and final testing. Send the final version of the app to the App Store and Google Play Store, for full testability. If this is not possible, I will request friends, family and other volunteers to test the app on their own devices, and report back any issues they find. I will also request that they test the app on both iOS and Android devices, so that I can ensure that the app works well on both platforms.

d8 - By August 4, 2026:
Final project deliverables completed and submitted, including source code, documentation/report, testing summary, and user/setup instructions. Plus published app on the iOS App Store and Android Google Play Store (subject to timing of app approval from these providers).

d9 - Around the scheduled EECS4080 seminar date (not yet published):
Final poster prepared and presented according to EECS4080 requirements.



- No other changes to the milestones so far. The remaining milestones stand as written above. If there are future changes needed, I will document them in the next progress reports.
