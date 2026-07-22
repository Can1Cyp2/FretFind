# d6 Issues:

A list of issues I found during and before d6. Some of these have a clear fix, some are open questions I am still working through.

## 1. Keyboard covers the progression name field:
When naming a progression (in the Progressions sheet, or the header Save flow), the keyboard pops up and covers the name input on both Android and iOS. The sheet does not move up to make room, so I cannot see what I am typing.

Likely fix: the sheet needs to shift up (or the input needs to scroll into view) when the keyboard opens, the same way most apps handle a text field near the bottom of the screen. React Native has `KeyboardAvoidingView` for this which I will likely try, so this should be a fix rather than a redesign.

Done: The `KeyboardAvoidingView` worked to fix it, I wrapped the whole Progressions sheet in one (inside its Modal, around the overlay), so when the keyboard opens the entire sheet shifts up instead of being covered. The one platform detail: iOS and Android move their windows differently, so the behaviour prop is set per platform ('padding' on iOS, which pads the bottom by the keyboard height, and 'height' on Android, which shrinks the view instead). This covers both text inputs in the sheet, the save name box and renaming a saved progression

## 2. A button to load a chords' notes onto the fretboard from 'Chords That Fit':
I want a button on the right side of each chord in the 'Chords That Fit' list, next to the ones not already in the progression, that loads that chords notes onto the fretboard so users can see and explore where it is played.

The issue I see is that a chord can be played more than one way on the fretboard and I have not built the feature that shows multiple voicings of a chord yet. Until that exists, I do not want to hardcode a single fixed shape for every chord, since that will not scale and will need to be redone once voicings are added. However, when I add the chord shapes feature, I will need to properly handle multiple voicings, in terms of this feature especially.

For now, the plan is to work out the most common playable shape without hardcoding anything: find the notes of the chord positioned as low on the neck as possible, so the shape favours playability near the nut the way most real chord shapes do. This will not always be the ideal shape, but it should be a reasonable default. 

I am marking this as an ongoing issue rather than solving it fully now, since the right long-term answer depends on the voicing feature that has not been built yet, and I do not want to spend the time hardcoding something that will be thrown away.


## 3. ERROR: Text strings must be rendered within a Text component:
I am seeing this error in the console:

```txt
 ERROR  Text strings must be rendered within a <Text> component.
```

I do not know why this is happening yet and have to look deeply in it yet.


## 4. The app got laggy after adding audio:
After adding the audio playback, everything started feeling laggy: the audio lags behind the tap when it plays, and the app itself lags when selecting a note, even when clearing one which does not play any sound at all.


## 5. Chords That Fit needs more explanation, not just the chord list:
Right now 'Chords That Fit' shows the matching keys and the chords that belong to them, but it does not explain why any of it matters. 

I want to add some education here so someone without theory background can actually learn something instead of just seeing an unexplained list of roman numerals:
- Why the chords in a key fit together in the first place.
- Typical progressions and what mood or feeling they tend to create.
- How the key type (major vs minor, and eventually other modes) tends to relate to certain moods, vibes, or genres.
- What the roman numerals themselves mean (I, IV, vi, and so on), since right now they are shown with no explanation at all.

I think the info dot and popup pattern already used in the chord detail view is the right fit here too, I can reuse those features. Put small 'i' buttons next to the relevant section that open a short plain language explanation, consistent with how the rest of the app already teaches theory. Some of this might also just sit as static text on the screen itself where a popup would be overkill, but I will see upon testing what works best.

## 6. Users need an explanation of how to use the app, especially progressions:
Even though I have tried to make the app understandable to a new player, some of the newer features, especially the progression builder, are not obvious just from looking at them. Someone could tap around and technically figure it out, but they might not realize the best way to use it (for example, that a progression can be saved and reloaded, or that Chords That Fit exists to help them find the next chord).

I want to add an explanation somewhere in the Settings screen that walks through how the app works and how to get the most out of it, aimed at someone opening it for the first time. This is separate from the interval and chord theory explanations already in the app, this is about learning the app's features and workflow, not music theory.
