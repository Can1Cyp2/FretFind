# July 17 - July 24 Audio Playback, Progression Builder, Backend, and Refinement (d6):

6th deliverable plan file. It carries on from d5, which finished the expanded chords, the theory breakdown display, the refinements pushed from d4, and the comprehensive mid-project report.

## What This Deliverable Covers

The July 24 goal from the contract is the audio playback and the chord progression builder, with the user interface refined (bug fixes, visual improvements, and usability enhancements) and testing beginning for the more difficult chords implemented in d5. On top of that, this deliverable adds the backend that was brought into the plan after speaking with my instructor: optional accounts and cloud saved progressions through Supabase.

So the four parts are:
- Add audio playback: a small tone generator that plays my own midi style sounds, so tapping a note plays it and a selected chord can be strummed.
- Add the chord progression builder: build a progression out of the matched chords, rearrange it, and save it.
- Add the backend: optional account creation and login, and opt-in cloud saving for progressions, merged cleanly with the front-end.
- Refine the UI: fix the issues logged in the mid-project report (I may need to write a specific issues file), and further test the added-tone and extended chords for accuracy, edge cases, and usability.

The backend is the largest unknown of the four, so as stated in the mid-project report it may spill into d7. No core functionality is dependent on a backend, so it is not that critical to rush.

## Audio Playback
I plan to generate my own midi style sounds rather than use recorded samples. I may implement audio files later, but I know that given the project/course time frame this isnt very realistic. The math for this is well documented (see the sources in `documents/progress.md`): each semitone multiplies the frequency by the twelfth root of two, with A4 fixed at 440 Hz, so a small tone generator can compute the frequency of any note from its number. The book "A Mathematical Offering" by Dave Benson has helped me figure out the math and code to implement it.

The planned behaviour:
- Tapping a fret plays that note, so the fretboard is heard as well as seen.
- A strum button appears when two or more notes are selected, and plays the selected notes from the low string to the high string, like how you would realistically strum a chord.
- The theory breakdown and the progression builder can reuse the same player, so a chord can be heard anywhere it is shown.

The app already represents every fretted note as a note with octave number (the open string MIDI numbers were added in d5 for the octave labels), so it will not be difficult to implement: the note the user taps maps will go straight to a frequency to play audio.


## Chord Progression Builder

Right now a matched chord can only be looked at. This deliverable makes it usable for writing music: the user can add a matched chord to a progression, see the progression (all the chords), and manage it (delete, re-arrange, play, find other best fitting chords based on key/scale).

The planned behaviour:
- An add button on a chord result (and in the theory breakdown) puts that chord, with its current fretboard shape, into the progression.
- The progression is shown as a horizontal strip, with each chord as a small pill. Tapping a 'pill' can recall its shape onto the fretboard, and the strip can be reordered and cleared.
- Progressions can be saved on the device with a name, and loaded back later so the user can keep more than one.
- With the audio playback in place, a progression can be played back chord by chord to hear how it sounds. Helping musicians not just understand music, but also create it.

## Backend (Accounts and Cloud Saved Progressions)

The plan from the mid-project report, now scheduled:
- Backend: Supabase, which helps provides authentication and a hosted database together. I will need to refresh my SQL knowledge, but I have coded in it before so I am not too unfamiliar with it. Also to note, supabase is free.
- Account profiles: users can create an account and sign in. An account is optional, the app works fully without one, so a casual user is never forced to sign up just to use the chord matching.
- Cloud saved progressions: a user signed-in can save their progressions to the cloud and load them back later, on any device. Saving is opt-in, so a user's progressions stay on their device unless they choose to save them.
- (Eventually, I would like to add a feature to share progressions with other users, but that is not in the scope of this deliverable or likely the project as a whole)

Merging it with the front-end means: an account entry point in the UI (likely inside the Options sheet (but I have not decided yet)), the progression manager gaining a cloud section next to the device section, and the app treating the cloud as an extra place to save rather than a requirement. If the backend runs long it moves to d7, without changing anything else in this deliverable.


## UI Refinement and Testing

The mid-project report logged open issues, and this deliverable I am planning refinements for:
- Results panel scrollbar: the scrollbar overlaps the result card padding on the right side. Either the padding changes to leave room for the bar, or the bar goes.
- Settings placement: the header gains more controls this deliverable (the progression and possibly account entry), so the header layout will get revisited so all controls stay reachable and the title stays.
- General bug fixes, visual improvements, and usability enhancements as they come up while testing.

Plus:
- More coded edge cases for the added-tone and extended chords (ambiguous voicings like the 11th against 7sus4, inversions of the big chords, and the maximum six note selections).
- Usability checks on the each iOS and Android device: whether the weak grade reads clearly, whether the big chords rank sensibly against their simpler readings, and whether the theory breakdown explains them well.


## New And Changed Files

New planned files:
src/audio/toneGenerator.ts
  -> turns a note into a playable tone using the equal temperament formula

src/audio/notePlayer.ts
  -> plays a single note or strums a set of notes

src/components/Fretboard/StrumButton.tsx (or similar)
-> the strum button that appears when a chord is selected

src/components/Progression/ProgressionBar.tsx and ProgressionManager.tsx (or similar)
  -> the progression strip and the saved progressions view

src/services/supabase.ts (or similar)
  -> the backend client, account calls, cloud progression calls


Files that I see needing changes:

App.tsx
  -> wire in the progression strip and the audio on fret taps

components/Results/ResultsPanel.tsx, ChordResultCard.tsx, ChordDetailModal.tsx
  -> the add to progression buttons, and playing a chord from the detail view

src/components/common/SettingsModal.tsx
  -> the account entry point (sign up, sign in, sign out)

src/styles/resultStyles.ts and commonStyles.ts
  -> styles for the progression strip, the strum button, and the scrollbar padding fix

src/tests/d4-chord-matcher-tests.ts
  -> the extra edge cases for the d5 chords

## Checklist

- [X] Add the tone generator and play a note when a fret is tapped.
- [X] Add the strum button that plays the selected chord.
- [X] Add the chord progression builder (add a matched chord, reorder, recall a chord shape, clear chords)
- [X] Add saved progressions on the device (later on cloud, but wanted to implement local first to ensure it works), allows users to save, load and delete.
- [X] Add the 'chords that fit' button in the progression popup: a key/scale selector (defaults to the best matching key) showing the chords that belong to that key with the ones already in the progression noted.
- [ ] Set up the backend for accounts (create account, sign in, sign out).
- [ ] Add opt-in cloud saving and loading for progressions, with RLS protections
- [ ] Fix the results panel scrollbar overlap.
- [X] Revisit the header layout with the new controls (discussed further in detail in the mid-report).
- [ ] Add the extra edge cases for the added-tone and extended chords and confirm the whole run passes.
