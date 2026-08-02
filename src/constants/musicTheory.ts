/* The plain-language music theory explanations for the chord detail view:

   the texts behind the 'i' buttons and the interval explanations.
   They are written for someone who does not know theory,
   essentially, the way I wish these ideas were explained to me when I was learning:
   short, and no jargon, saying what it means.

   The second half of this file is the same idea for the 'Chords That Fit' sheet:
   what a key is, what the roman numerals actually mean, how major and minor tend to
   feel, and the chord orders that keep turning up in real songs. Before this, that
   sheet showed roman numerals with no explanation of them anywhere, which is not
   much use to the exact person the sheet is meant to help. */

import { ScaleType } from '../types';

// What the Notes section means:
export const NOTES_INFO =
  'These are the notes that make up this chord. Each one is a pitch class, a note name without an octave, so every C on the fretboard counts as the same note here. Together they give the chord its sound and its name.';

// What the Formula section means:
export const FORMULA_INFO =
  'The formula is the recipe for this type of chord. Each symbol is a distance up from the root note (R is the root itself, 3 is a major third above it, b7 a minor seventh, and so on). The pattern of distances is what makes a major chord major and a minor chord minor, no matter which note it starts from.';

// What the Intervals section means:
export const INTERVALS_INFO =
  'An interval is the distance between the root and another note, counted in semitones (one semitone = one fret on the guitar). Chords are built from intervals, so understanding them shows why a chord sounds the way it does, and how to build it anywhere on the neck.';

// What the Voicing section means (only shown for inversions and slash chords):
export const VOICING_INFO =
  'The voicing describes which note of the chord ended up lowest. When the root is the lowest note, the chord is in root position. When another chord note is lowest it is an inversion, and in a name like C/E the note after the slash is the bass note. The chord itself does not change, only the flavour of how it sits.';

// What the Shapes section means (the different ways the same chord can be played):
export const SHAPES_INFO =
  'The same chord can be played in several places on the neck. Every one of these shapes contains the notes of this chord, they just use different strings and different frets, so they sound a little higher, lower, or fuller than each other. The first shape is usually the one players learn first, since it sits near the nut and uses open strings. These are worked out for your current tuning, so they change if you change it.';

// -----------------------------------------------------------------------------
// The 'Chords That Fit' explanations:

// What a key is and the actual reason its chords belong together:
export const KEYS_INFO =
  'A key is a set of seven notes that a song mostly stays inside, named after its home note. Every chord in the list below is built only from those same seven notes, which is the real reason they fit together: they share almost all of their notes with each other, so moving between them never introduces a note that sounds foreign. That is also why a chord from outside the key stands out so much when you use one on purpose.';

// How the two key types tend to feel, and where each gets used:
export const KEY_TYPE_INFO =
  'Major and minor are the two patterns of gaps between those seven notes, and the pattern is what creates the mood. Major keys have a major third above the home note, which sounds bright, settled and resolved, and they carry most pop, rock, country and folk. Minor keys have a minor third instead, one fret lower, which sounds darker, heavier or sadder, and they carry most metal, a lot of rap and electronic music, and film music that wants tension. Nothing forces this, plenty of cheerful songs are in minor keys and plenty of devastating ones are in major, but it is the tendency you will hear most.';

// What the roman numerals mean, which is the part that had no explanation at all:
export const NUMERALS_INFO =
  'The roman numerals number the seven chords of a key, counting up from the home chord. I is built on the first note of the key, ii on the second, and so on up to vii. The case tells you the chord quality: uppercase means a major chord (I, IV, V), lowercase means a minor chord (ii, iii, vi), and a little circle means diminished (vii°). The point of numbering them instead of naming them is that the numbers work in every key. I to V to vi to IV means the same journey whether you play it in C or in F sharp, so learning a progression by its numbers means learning it everywhere at once.';

// What the common progressions section is showing:
export const PROGRESSIONS_INFO =
  'These are orders of chords that keep turning up in real songs, written in the numbers above so they work in any key. They are common because of what the chords do rather than habit: the home chord (I or i) sounds settled, chords further from home build tension, and the fifth chord (V or v) pulls hardest back toward home. A progression is mostly just a route away from home and back, and these are the routes that have worn the deepest grooves. The chord names shown are what each one becomes in the key you have selected.';

/* What each of the seven chords of a key does in order.   
   Split by key type because the numerals and their jobs are different in a minor key to a major key, 
   they are not just relabelled. Tapping a numeral in the list opens the matching one of these. */
export const DEGREE_EXPLANATIONS: Record<ScaleType, string[]> = {
  major: [
    'I is the home chord, the one the key is named after. It sounds settled and finished, which is why so many songs both start and end on it. Everything else in the key is heard in relation to this chord.',
    'ii is a minor chord built on the second note. It is the classic setup chord: it leads very naturally into V, and the ii to V to I move is the backbone of jazz and a lot of pop.',
    'iii is a minor chord built on the third note. It is the least used of the seven, because it shares most of its notes with both I and vi and so can sound like a softer version of either. Used deliberately it adds a wistful colour.',
    'IV is a major chord built on the fourth note. It sounds like stepping away from home into open air, warm and lifting rather than tense. It is the other most common chord after I and V, and it very often leads back home directly.',
    'V is a major chord built on the fifth note, and it creates the strongest pull back to I of anything in the key. That pull is what makes an ending feel like an ending. Adding a seventh to it (V7) makes the pull stronger still.',
    'vi is a minor chord built on the sixth note, and it is the darker side of the same key. It shares two of its three notes with I, so it feels like home in a minor mood, which is why swapping I for vi is the easiest way to make a bright progression sound bittersweet.',
    'vii° is a diminished chord built on the seventh note. It is tense and unstable and rarely used on its own, mostly appearing as a passing chord on the way somewhere else, since it wants to resolve to I almost as hard as V does.',
  ],
  minor: [
    'i is the home chord of a minor key, and it is minor itself. It sounds settled but dark, so a minor key can feel resolved and heavy at the same time, which major keys cannot really do.',
    'ii° is a diminished chord built on the second note. It is tense and unstable, so it turns up far less than the others and usually only as a step on the way to v.',
    'III is a major chord built on the third note, and it is the brightest chord in a minor key. It is the home chord of the relative major, so leaning on it is how a minor song can open up into something hopeful without leaving the key.',
    'iv is a minor chord built on the fourth note. It is the minor key version of stepping away from home, and it sounds sombre and inward where the major key IV sounds like open air.',
    'v is a minor chord built on the fifth note. It pulls back toward home, but far more gently than a major key V does. Songs often replace it with a major V borrowed from outside the key exactly to get that stronger pull back.',
    'VI is a major chord built on the sixth note, and it is warm and lifting against the minor backdrop. It is the most common way a minor progression gets some light into it.',
    'VII is a major chord built on the seventh note. It sounds strong and driving rather than tense, and it leads back to i very naturally. The VII to i move is most of why minor key rock and metal sounds the way it does.',
  ],
};

/* The chord orders that keep turning up, by key type. Degrees are indexes into the
   seven chords of the key, so the sheet can turn them into both roman numerals and
   the real chord names for whichever key is selected. */
export interface CommonProgression {
  degrees: number[];
  name: string;
  feel: string;
}

export const COMMON_PROGRESSIONS: Record<ScaleType, CommonProgression[]> = {
  major: [
    {
      degrees: [0, 4, 5, 3],
      name: 'The four chord song',
      feel: 'Uplifting but with a catch in it, thanks to the minor vi in the middle. Probably the most used progression in modern pop and rock, to the point that it is a running joke how many hits share it. It works because it leaves home, darkens, then lifts back without ever sounding unresolved.',
    },
    {
      degrees: [5, 3, 0, 4],
      name: 'The same four chords, starting sadder',
      feel: 'Exactly the same chords as above rotated to start on the minor vi, which flips the mood from bright to melancholy while keeping the pull of the original. Very common in ballads and in choruses that need to feel like a lift when they finally reach I.',
    },
    {
      degrees: [0, 3, 4],
      name: 'The three chord trick',
      feel: 'The oldest and plainest route there is: home, away, tension, home. Blues, rock and roll, country, punk and folk are built on it. Every chord is major so it sounds direct and unfussy, with no ambiguity anywhere in it.',
    },
    {
      degrees: [0, 5, 3, 4],
      name: 'Doo-wop',
      feel: 'Nostalgic and sweet, the sound of fifties and early sixties pop, and still everywhere in slow ballads. The vi arriving straight after I is what gives it that immediate wistful drop before IV and V carry it home.',
    },
    {
      degrees: [1, 4, 0],
      name: 'The jazz turnaround',
      feel: 'The smoothest way home in the whole key, and the phrase most jazz is assembled from. Each chord moves its root down by a fifth into the next, so it feels like falling naturally rather than jumping. Also common in soul, bossa nova and R&B.',
    },
  ],
  minor: [
    {
      degrees: [0, 5, 2, 6],
      name: 'Epic Sound',
      feel: 'Dark but heroic rather than sad, since three of its four chords are major. This is the sound of film trailers, game soundtracks and stadium rock, because it feels like it is building toward something the whole way round.',
    },
    {
      degrees: [0, 5, 6],
      name: 'Anthemic minor',
      feel: 'Driving and defiant. The two major chords lift hard against the minor home chord, and the VII leading back to i is what gives rock and metal a lot of its momentum. Short enough to loop without tiring out.',
    },
    {
      degrees: [0, 3, 4],
      name: 'Traditional minor',
      feel: 'All three chords minor, so it is the bleakest of these and the most old sounding. Folk songs, sea shanties and minor key blues live here. Swapping the last chord for a major V is the single most common way to make it pull harder toward home.',
    },
    {
      degrees: [0, 6, 5],
      name: 'The descent',
      feel: 'Walks downward step by step away from home, which sounds like sinking or resignation. Common in rock ballads and in anything that wants to feel like it is winding down rather than building up.',
    },
  ],
};

// One short explanation per interval, keyed by its size in semitones (0 to 11).
// The bigger extension numbers land on the same notes (the 9th is the 2nd an octave up, 
// the 11th is the 4th, the 13th is the 6th), so those are covered here too:
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
