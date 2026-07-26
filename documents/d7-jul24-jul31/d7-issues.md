# d7 Issues (continuing from d6):

A list of issues I found during and before d7. Some of these have a clear fix, some are open questions I am still working through.

## 1. Autosave was sometimes treating a progression from a different tuning as one already backed up:
With auto backup switched on, a progression built in one tuning would sometimes never make it to the cloud, and the account would end up with what looked like the same progression saved over and over instead of the new one.

The cause was the key used to tell whether a device progression was already on the account. It was built from just the progressions name and how many chords were in it, which is not actually enough to tell two progressions apart: the same name and chord count can easily happen twice without meaning to, especially two attempts at the same idea played in different tunings. Whichever one reached the account first made the key look taken, so the second one was silently treated as already backed up and never uploaded, even though its actual chords (different frets, since the tuning was different) were nothing like the first.

Done: the key is now built from the actual shape of every chord in the progression, which string and fret each note came from, rather than just the name and count. A different tuning means different frets even when the chord names line up, so two progressions only count as the same now if they genuinely are, and both a manual cloud save and autosave use this same key so they always agree on what is already backed up.

## 2. Keyboard covers the tuning name field:
The same issue as d6 issue 1, this time in the tuning popup: naming a new custom tuning, or renaming an existing one, the keyboard opened over the input with nothing shifting up to make room for it.

Done: same fix as d6, the popup is wrapped in a `KeyboardAvoidingView` so it shifts up when the keyboard opens. One wrapper covers both text fields, since they both live in the same popup.

## 3. The tuning and strum buttons ran off the screen on some smaller Android devices:
Both buttons float past the right edge of the fretboard by a fixed amount, relying on whatever margin was left over from centering the board on the screen. That margin was more than enough on a wide screen, but the boards width was capped rather than scaled down, so on a narrower phone the board grew to fill nearly the whole screen and had little to no margin for the buttons so they ended up clipped by the edge of the screen.

Done: the boards width calculation now checks whether the screen is narrow enough for this to actually happen. Only then does it shrink the board by exactly the amount the buttons need and hand that space back as a reserved margin, guaranteeing they fit. On a screen wide enough to already have room to spare, which is most phones, nothing changes and the board stays centered exactly as it was before.

## 4. Octaves were bolted on after the fact, and the custom tuning bug above is the cost of that:
Not a bug but a design mistake I made a while back that only actually caused a problem now.

Octave display was not part of the original plan for how a tuning is represented, I added it as an option later once I decided showing "E2" instead of just "E" would be useful. At that point every tuning already just had a `notes` array (the pitch classes, C to B as 0 to 11, no memory of which octave), so rather than rethinking that, I bolted a second `octaves` array on next to it, one fixed number per string, and treated the two as if they would always agree with each other.

For the nine built-in tunings that was never actually tested by anything, since none of them happen to move a string far enough to cross into a different octave from Standard, so it looked correct by coincidence and I did not think about it again until building the custom tuning feature this deliverable.

The real case: the custom tuning builder let a string be stepped down note by note, E to D# to D and so on, by moving a pitch class up or down and wrapping it at 0 to 11. Nothing about that wrap knew it had crossed from one octave into the last one below it, because the octave was never actually derived from anything, it was just copied from Standard onto every custom tuning regardless of what was picked. Step the low E string down five semitones and it should land on B1, an octave and a bit below where it started. Instead it landed on "B", still carrying Standard tunings fixed octave of 2, which is B2, a note almost a full octave higher than the one actually chosen. The label was wrong and, since the same octave number is what the fretboard and the audio use to work out the real pitch to play, the sound was wrong too.

The fix (in issue 1 of the d7 plan, the octave fix for tunings) had to work backwards from that mistake: turn each strings note and octave back into one absolute semitone count, step that instead of the bare note, then split it back into a note and an octave afterwards. That is the right way to do it, but it only exists because the data was split into two loosely connected fields to begin with. If a tuning had stored one real number per string from the start, the same absolute semitone count the fix uses now, a note and an octave are just that one number read two different ways, there would have been nothing to fall out of sync in the first place and the custom tuning builder would never have been able to produce a wrong octave.

Lesson for next time: when a later feature turns out to need information a data shape does not carry (here, which octave a note is actually in), that is worth treating as a sign the shape itself is incomplete, not just a reason to bolt an extra field on next to it and hope the two stay in agreement.
