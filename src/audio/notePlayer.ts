/* Plays the tones.

  This is the one place the app touches the audio system:
  a single note when a fret is tapped, or a staggered run of notes when a chord is strummed.

   The expensive part of a note is generating its audio, so the generated files are
   cached by note and only ever made once. Playing is the opposite: every tap gets
   its own fresh copy of the sound, which starts immediately and throws itself away
   when it finishes ringing. That is what lets notes overlap the way real strings
   do. Tapping a note twice rings twice, and a strum never cuts into a note that is
   still sounding, because nothing is ever restarted, every play is a new sound.

   Every failure path is allowed on purpose, when a note fails to play it should not crash or interrupt the app. */

import { Audio } from 'expo-av';
import { generateToneWav, midiNoteToFrequency } from './toneGenerator';

// The generated audio for each note, keyed by MIDI note. Made once, replayed forever.
const toneCache = new Map<number, string>();
const MAX_TONES = 30;

// The copies currently ringing, so a runaway pile of them can be capped
const liveSounds = new Set<Audio.Sound>();
const MAX_LIVE_SOUNDS = 12;

let audioInitialized = false;

// The user's volume setting, from 0 (silent) to 1 (full). It is multiplied into
// every note, so the slider in Settings turns everything up or down together. The
// Settings screen calls setMasterVolume whenever the slider moves.
let masterVolume = 0.8;
export function setMasterVolume(value: number): void {
  masterVolume = Math.max(0, Math.min(1, value));
}

// One time audio setup: play even when the iOS silent switch is on (the user tapped a note so they expect to hear it, but I need to add a mute option),
// duck other audio on Android instead of cutting it off, and use the proper speaker
// rather than the little earpiece one
async function initAudio(): Promise<void> {
  if (audioInitialized) return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    audioInitialized = true;
  } catch {
    // If audio setup fails the app just stays silent, nothing breaks, no crash
  }
}

// The audio for a note: generated on its first use, straight from the cache after.
// The cache is capped, the oldest tone falls out first once it is full.
function getToneUri(midiNote: number): string {
  let uri = toneCache.get(midiNote);
  if (!uri) {
    uri = generateToneWav(midiNoteToFrequency(midiNote));
    toneCache.set(midiNote, uri);
    if (toneCache.size > MAX_TONES) {
      const oldestKey = toneCache.keys().next().value;
      if (oldestKey !== undefined) toneCache.delete(oldestKey);
    }
  }
  return uri;
}

// Generates a set of notes ahead of time, so their first real tap plays instantly
// instead of paying the one time generation cost right at the tap.
// The generating is spread out a moment apart, doing them all at once can freeze the app for a beat, so this is staggered:
export function preloadNotes(midiNotes: number[]): void {
  midiNotes.forEach((midiNote, i) => {
    setTimeout(() => {
      getToneUri(midiNote);
    }, 200 + i * 150);
  });
}

/* Starts one fresh copy of a note and lets it clean itself up: the copy unloads
   the moment it finishes ringing, with a fallback timer in case the finish signal
   never arrives (which can happen if the app is backgrounded mid note). If too
   many copies are ringing at once, the oldest one is dropped to make room, twelve
   overlapping notes is already more than a real guitar can do. */
async function startSound(midiNote: number, volume: number): Promise<void> {
  // The user's overall volume scales every note. At zero there is nothing to play,
  // so skip the work entirely rather than load a silent sound.
  const finalVolume = volume * masterVolume;
  if (finalVolume <= 0) return;

  await initAudio();
  const uri = getToneUri(midiNote);

  if (liveSounds.size >= MAX_LIVE_SOUNDS) {
    const oldest = liveSounds.values().next().value;
    if (oldest) {
      liveSounds.delete(oldest);
      oldest.unloadAsync().catch(() => {});
    }
  }

  const { sound } = await Audio.Sound.createAsync(
    { uri },
    // shouldPlay starts it in the same call that loads it, no second round trip.
    // The long progress interval matters: without it, every playing sound streams
    // status updates back to the app several times a second, which is wasted cpu.
    { shouldPlay: true, volume: finalVolume, progressUpdateIntervalMillis: 10000 },
  );
  liveSounds.add(sound);

  const cleanup = () => {
    if (liveSounds.has(sound)) {
      liveSounds.delete(sound);
      sound.unloadAsync().catch(() => {});
    }
  };
  sound.setOnPlaybackStatusUpdate(status => {
    if (status.isLoaded && status.didJustFinish) cleanup();
  });
  setTimeout(cleanup, 2500); // fallback, comfortably after the tone has fully rung out
}

// Plays one note (a fret tap)
export async function playNote(midiNote: number): Promise<void> {
  try {
    await startSound(midiNote, 0.9);
  } catch {
    // A failed note just stays silent
  }
}

// Strums a set of notes from the low string to the high string, a moment apart.
// 40ms between notes is about the speed of a relaxed strum on a real guitar
// (as per just testing the audio playback on the app and comparing it by ear to my real guitar)
// Each note is its own copy now, so doubled pitches in a chord shape simply ring
// twice like they do on a real guitar, nothing gets restarted or cut.
export function playStrum(
  midiNotes: number[],
  strumDelayMs: number = 40,
): void {
  // Strummed notes are played slightly quieter than a single tap, since six of them
  // ring together and would otherwise add up louder than intended
  midiNotes.forEach((midiNote, i) => {
    setTimeout(() => {
      startSound(midiNote, 0.75).catch(() => {});
    }, i * strumDelayMs);
  });
}
