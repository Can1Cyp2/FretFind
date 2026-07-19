# d6 Issues:

A list of issues I found during and before d6. Some of these have a clear fix, some are open questions I am still working through.

## 1. Keyboard covers the progression name field:
When naming a progression (in the Progressions sheet, or the header Save flow), the keyboard pops up and covers the name input on both Android and iOS. The sheet does not move up to make room, so I cannot see what I am typing.

Likely fix: the sheet needs to shift up (or the input needs to scroll into view) when the keyboard opens, the same way most apps handle a text field near the bottom of the screen. React Native has `KeyboardAvoidingView` for this which I will likely try, so this should be a fix rather than a redesign.

## 2. A button to load a chords' notes onto the fretboard from 'Chords That Fit':
I want a button on the right side of each chord in the 'Chords That Fit' list, next to the ones not already in the progression, that loads that chords notes onto the fretboard so users can see and explore where it is played.

The catch is that a chord can be played more than one way on the fretboard and I have not built the feature that shows multiple voicings of a chord yet. Until that exists, I do not want to hardcode a single fixed shape for every chord, since that will not scale and will need to be redone once voicings are added.

For now, the plan is to work out the most common playable shape without hardcoding anything: find the notes of the chord positioned as low on the neck as possible, so the shape favours playability near the nut the way most real chord shapes do. This will not always be the ideal shape, but it should be a reasonable default. 

I am marking this as an ongoing issue rather than solving it fully now, since the right long-term answer depends on the voicing feature that has not been built yet, and I do not want to spend the time hardcoding something that will be thrown away.


