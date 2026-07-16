/* The plain-language music theory explanations for the chord detail view.
   These are the texts behind the little 'i' buttons and the tappable interval
   chips. They are written for someone who does not know theory, the way I wish
   these ideas were explained to me when I was learning: short, and no jargon
   without saying what it means. */

// What the Notes section means
export const NOTES_INFO =
  'These are the notes that make up this chord. Each one is a pitch class, a note name without an octave, so every C on the fretboard counts as the same note here. Together they give the chord its sound and its name.';

// What the Formula section means
export const FORMULA_INFO =
  'The formula is the recipe for this type of chord. Each symbol is a distance up from the root note (R is the root itself, 3 is a major third above it, b7 a minor seventh, and so on). The pattern of distances is what makes a major chord major and a minor chord minor, no matter which note it starts from.';

// What the Intervals section means
export const INTERVALS_INFO =
  'An interval is the distance between the root and another note, counted in semitones (one semitone = one fret on the guitar). Chords are built from intervals, so understanding them shows why a chord sounds the way it does, and how to build it anywhere on the neck.';

// What the Voicing section means (only shown for inversions and slash chords)
export const VOICING_INFO =
  'The voicing describes which note of the chord ended up lowest. When the root is the lowest note, the chord is in root position. When another chord note is lowest it is an inversion, and in a name like C/E the note after the slash is the bass note. The chord itself does not change, only the flavour of how it sits.';

// One short explanation per interval, keyed by its size in semitones (0 to 11).
// The bigger extension numbers land on the same notes (the 9th is the 2nd an
// octave up, the 11th is the 4th, the 13th is the 6th), so those are covered here too.
export const INTERVAL_EXPLANATIONS: Record<number, string> = {
  0: 'The Root (R) is the note the chord is named after and built from. Every other note in the chord is measured as a distance up from this one. In a C major chord, the root is C.',
  1: 'The Minor 2nd (b2) is one semitone (one fret) above the root. It is the crunchiest, most dissonant interval, and shows up in some jazz voicings and Spanish flavoured sounds.',
  2: 'The Major 2nd (2) is two semitones above the root. In chords it usually appears as the 9th (the same note an octave up). It replaces the 3rd in sus2 chords, and gives add9 chords their bright, open sound.',
  3: 'The Minor 3rd (b3) is three semitones above the root, and it is what makes a chord minor. This one interval is the difference between a chord sounding sad or dark instead of bright. Every minor and diminished chord has it.',
  4: 'The Major 3rd (3) is four semitones above the root, and it is what makes a chord major. It gives the bright, happy, settled character. Every major, dominant, and augmented chord has it.',
  5: 'The Perfect 4th (4) is five semitones above the root. In chords it usually appears as the 11th (the same note an octave up). It replaces the 3rd in sus4 chords, giving that floating, unresolved feel that wants to land back on the 3rd.',
  6: 'The Tritone (b5) is six semitones above the root, exactly half of an octave. It is the most unstable, tense interval, and it is the signature sound inside diminished and dominant 7th chords. That tension pulling toward a resolution is a big part of why chord progressions feel like they move.',
  7: 'The Perfect 5th (5) is seven semitones above the root, and the most stable interval after the octave. It adds power and fullness, which is why power chords are just the root and the 5th. It is in almost every chord, and it is also the note a chord can most easily do without.',
  8: 'Eight semitones above the root is either an Augmented 5th (#5) or a Minor 6th (b6) depending on the chord. As a #5 it is what makes augmented chords sound bright but unsettled.',
  9: 'The Major 6th (6) is nine semitones above the root. It is the defining note of 6th chords, and in the bigger extended chords it appears as the 13th (the same note an octave up). It adds a warm, jazzy sweetness.',
  10: 'The Minor 7th (b7) is ten semitones above the root. It is the key note in dominant 7th and minor 7th chords, adding the bluesy tension that wants to resolve. It is one of the most common notes added on top of a plain triad.',
  11: 'The Major 7th (7) is eleven semitones above the root, one semitone under the octave. It gives maj7 chords their lush, dreamy sound, common in jazz, R&B, and neo soul.',
};
