# July 31 - August 4 (d8):

The 8th and final deliverable plan file, which finished alternate tunings, chord voicings, and the cloud saved progressions rework.

## What This Deliverable Covers
This is the last deliverable, and it is the shorted (only four days) because the course end date. There is no new features planned. The contracts original plan for d8 is still staying mostly as stated, final deliverable and the published app, so my time will go to those things, plus finishing the few things still open, one small piece of UI I want in before the final build and the final documentation.

I am deliberately not starting anything new here. Anything I still want to add that does not fit in this scope is written down in `documents/todo_future.md` instead so that I can focus on polishing and finishing the app rather than starting new features which were not or are not crucial to the final product.

So the planned parts are:
- (from d7) finish the in-app walkthrough in the Settings screen (and originally mentioned in issue 6 in `documents/d6-jul17-jul24/d6-issues.md`).
- Add a clear button for the fretboards notes, kept clearly separate from the progressions Clear button.
- Track down the "Text strings must be rendered within a `<Text>` component" error (issue 3 in `documents/d6-jul17-jul24/d6-issues.md`), which has been logged since d6 and I still have not found (but honestly have not looked hard enough because it has not caused any actual problems).
- Check over the 'Chords That Fit' explanations on devices, ensure they fit well on different screen sizes, and fill in whatever is still not clear, especially for new guitar players, or those new to music theory.
- Final documentation: the final report (which will be essentially a large outline and summary of my project, which I will use almost as a rough draft for my presentation), including the testing summary, user and setup instructions (updated README).
- Get the final build to both stores, with everything up to d8 in it rather than the d6 build currently under review.

## The Clear Fretboard Button

There is no way to clear the whole fretboard in one go right now. Clearing means tapping every selected note off one at a time, which is tedious, and it is the thing a user wants most often after finishing with one chord and moving to the next.

The one real risk is confusing it with the Clear button on the progression strip, which throws away the entire progression and asks for confirmation first. Those two doing very different things while sitting near each other on the same screen and being called the same thing would be a bad mistake to make. So I am planning to place the fretboard one so that it is visually distinct and clearly attached to the fretboard rather than to the progressions.

The planned behaviour:
- The button floats above the results panel, on the left of the fretboard, which is the opposite side from the strum button and keeps it away from the progression strip's Clear entirely.
- It only shows when there is actually something selected to clear, the same way the strum button only shows once there are enough notes for a chord.
- Clearing the fretboard does not touch the progression, and does not need a confirmation, since a fretboard selection takes seconds to rebuild and nothing is lost. That is also part of what keeps it distinct from the progression Clear, which does ask. After clearing, the fretboard is empty and before the user selects any more notes, retapping the button should allow an undo of the last clear to restore the previous chord. I will need an undo icon to show that.

Though the issue I am thinking of is on the placement, there is a known issue/constraint here alread:. Issue 3 in `documents/d7-jul24-jul31/d7-issues.md` was exactly this problem for the tuning and strum buttons: on narrower Android phones the board grows to fill the screen and leaves no margin for a floating button, so the boards width calculation now reserves space for them only when the screen is actually narrow enough to need it. A button on the left side has the same problem in mirror image.

I am thinking (but may change as I test on a real device):
- First choice is the left of the fretboard, above the results panel.
- If it does not fit there on smaller screens once the board is shifted right to make room, then move it to the right side, in the  gap between the tuning button at the top and the strum button at the bottom, instead of reserving margin on both sides and squeezing the board from both directions.

## Leftover Items From d7

**Informational App walkthrough:** Started in d7 but not finished. It is a step by stepexplanation of the apps own features in the Settings screen, aimed at someone opening FretFind for the first time and separate from the music theory explanations already in the app. The progression builder is the part that needs it most, since it is the most complicated part of the app, saving, reloading and 'Chords That Fit' are not obvious from looking at the screen.

**The `<Text>` error:** Logged in the console since d6 and still not tracked down. It is not blocking anything and nothing visibly breaks, which is why it has surpassed two deliverables. I would like the app to be error free before the final build.

**The 'Chords That Fit' explanations:** The key, roman numeral, mood and common progression explanations need to be added. Then testing my implementation (this is only the plan for now:) is left is reading it all on a real screen and checking it holds up: whether the sheet is now too long to scroll comfortably, whether the roman numeral badges are tappable, and whether anything reads as nonsense to someone who does not already know the answer.

## Final Documentation:
The written side of the project, which will likely be a decent chunk of the next four days of the deliverable:
- The final report, drawing on `documents/progress.md` and the per deliverable plan and issue files rather than being written from scratch.
- A testing summary: what the three test files cover, what they do not, and what was tested by hand on a device because tests are not sufficient.
- User and setup instructions: how to run the app from source and what a user actually does with it.
- documents/progress.md for d8

The final presentation is not part of this deliverable. That is d9 (which isnt not an official deliverable, at least in terms of coding, but is the final part of the course). I will be using the final report as a rough draft for that presentation, so it will be written with that in mind.

## Store Submission

Both stores currently have the d6 build under review. The final build needs to go up with everything from d7 and d8 in it: tunings, voicings, the cloud rework and whatever lands this deliverable. Approval timing is not in my control, so this goes in as early in the four days as it can rather than at the end. So far, I have successfully got 16 people to test the app so far (as of August 1st 2026)

## Current Scope: (d8, planned)

New files:
src/components/Fretboard/ClearButton.tsx
  -> the floating clear button for the fretboard

Changed files:
```txt
src/components/Fretboard/Fretboard.tsx
  -> renders the clear button, takes an onClearSelections prop
src/styles/fretboardStyles.ts
  -> the left side placement, and the narrow screen fallback if it is needed
App.tsx
  -> clears the selection, keeping it away from the progression state entirely
src/components/common/WalkthroughModal.tsx
  -> finishing the walkthrough
src/components/Progression/FitChordsModal.tsx
  -> whatever the explanations still need after reading them on a device
documents/progress.md
  -> d8 entry
```

## Checklist

- [X] Add the clear fretboard button, and confirm it fits on a narrow screen or move it between the tuning and strum buttons.
- [X] Small device fixes (based on feedback from testing): 
  - [X] Fix the tuning button on small screens (issue 3 in d7).
  - [X] Fix the strum button on small screens (issue 4 in d7)
  - [X] Fix 'X' and similar text in buttons from not properly appearing on small screens
- [X] Finish the in-app walkthrough in the Settings screen, closing issue 6 from d6.
- [ ] Resolve the "Text strings must be rendered within a `<Text>` component" error, closing issue 3 from d6.
- [ ] Implement and verify the 'Chords That Fit' explanations, test on various device.
- [ ] Confirm all three test files still pass on the final build.
- [ ] Write the final report.
- [ ] Write the testing summary and Write the user and setup instructions (README).
- [ ] Send the final build to both stores, with everything up to d8 in it. Including updating any store listing information that has changed since the original build.
- [ ] Update the progress file with everything done this deliverable and a small outro for the course (different from the final report).
