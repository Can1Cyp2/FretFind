# Future Work

Things I would like FretFind to do that are not going to fit in this project timeline. Some of these are ideas I had while building and wrote down as ideas, some are limitations I hit and decided to live with for the sake of the project timeline, and some are places where I know the compromise I made is not the best possible answer but works well enough for now.

Nothing here is required for the project to be finished. This is the list of issues I want to fix, features I will implement, and improvements I would work on after the current project is complete.

## Fretboard and navigation

**Scroll the fretboard to the chord when a progression chord is tapped:**
Tapping a pill in the progression strip already loads that chords shape onto the fretboard, but if the shape sits high on the neck the user has to scroll down to find it. It should scroll there on its own so the shape is visible the moment it loads. The fretboard already scrolls vertically and the shape knows its own lowest and highest fret (`lowestFret` and `highestFret` on `ChordVoicing`), so this is mostly a matter of measuring a row height and scrolling to it, not entirely new logic. And the height of fretboard should be constant across devices.I want the scrolling to be animated to fit the professional feel I have been aiming for with the app.

## Chord shapes

**Recognize the conventionally taught shapes:**
This is issue 5 in `documents/d7-jul24-jul31/d7-issues.md`. The voicing generator scores shapes on what a hand can physically hold, which is not the same thing as what a guitarist actually expects. Bm is the clearest case: the app ranks a legitimate open voicing above the barre shape at fret 2 that every chord chart calls Bm. Fixing this properly means the app having some idea of which shapes are conventionally taught, separate from which are easiest to hold, and that means at least partially hardcoding that knowledge. This is definitely worth implementing, but too big to do well in the time left for the project and doing it poorly would mean ruining what works well with the chords algorithm already.

**More scale types and modes:**
'Chords That Fit' only knows major and natural minor. Those two cover most of what a learner will run into, which is why they were the ones worth having first, but the modes (dorian, mixolydian and the rest) are where a lot of the more interesting chord relationships live, and harmonic minor in particular would explain the borrowed major V that shows up constantly in minor key songs. The scale data in `src/constants/scales.ts` is already keyed by scale type, so adding more is mostly a matter of adding entries and explanations rather than reworking anything. But would take to long to learn about then add for this project timeline, so it is a future improvement.

## Audio

**Real recorded guitar samples:**
The current tone is plucked string synthesis (Karplus-Strong), which I am happy with and is way better than the sine wave technique it replaced. But it is still synthesis, fake sound. Recording every string at every fret on a real guitar and playing back the samples would sound properly like a guitar rather than like a good imitation of one. That is a big job on its own, both to record and to ship, since it would add a lot of audio to the app bundle.

## Accounts and saving

**Share progressions with other users:**
Noted in the d6 plan. A user could send a progression to someone else, or publish one, rather than progressions only ever being their own. The account system that would need to sit underneath it already exists, so this is more of a product question than a technical one: it would need backend code around who can access what, and a UI for sharing and receiving progressions. It is a big enough feature that it would be a deliverable on its own, so it is not in the current timeline.

**Cloud saved tunings:**
Custom tunings save on the device only, and progressions already sync to the account, so tunings should follow the same pattern. This would be an .addition rather than a redesign. It just did not make the cut for the project, it is not necessary.

**Show which cloud progressions are downloaded for offline use:**
Progressions live on either on the device or on the account rather than both, it would help to see at a glance which account progressions are also available offline, with an option to keep a chosen one on the phone. The restored from cloud flag already tracks something close to this, so the data is mostly there but I think a refined version of this feature would be beneficial. I was thinking of a small icon on the saved progression, but that would be a lot of icons to show and might be visually overwhelming. Though, this is a later improvement rather than a necessary one.

## Testing

**Run the voicing sweep against custom tunings:**
The voicing and edge case tests cover nine common tunings, which I decided was enough because they cover the realistic cases. A custom tuning can be anything at all though, including tunings no guitar would ever actually be in, so sweeping the generator against randomly built ones would be a better test of whether it holds up on inputs I did not think of.

**Sentry error reporting:**
I think adding something like Sentry would greatly help in reporting errors. It would be good to have it so that if a user runs into a crash or other error it can be reported back to me for fixing.
