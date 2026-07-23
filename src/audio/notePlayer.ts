/* Plays the tones. 

  This is the one place the app touches the audio system:
  a single note when a fret is tapped, or a staggered run of notes when a chord is strummed.

   The rough part of audio on a phone is loading a sound, not playing it.
   So instead of creating and destroying a sound on every tap, every note that
   gets played is loaded once and kept ready in memory, and later taps just replay it instantly. 
   The ready sounds are capped and the least recently played one is unloaded when the cap is hit, so memory stays usable.

   Every failure path is allowed on purpose, when a note fails to play it should not crash or interrupt the app. */

import { Audio } from 'expo-av';
import { generateToneWav, midiNoteToFrequency } from './toneGenerator';

// Sounds that are loaded and ready to replay instantly, keyed by MIDI note
// The map is kept in most recently used order, so when it is full the note that
// has not been played for the longest is the one unloaded to make room.
const soundCache = new Map<number, Promise<Audio.Sound>>();
const MAX_SOUNDS = 24;

let audioInitialized = false;

// One time audio setup: play even when the iOS silent switch is on (the user tapped a note so they expect to hear it, but I need to add mute option), 
// and other audio on Android instead of cutting it off
async function initAudio(): Promise<void> {
  if (audioInitialized) return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    audioInitialized = true;
  } catch {
    // If audio setup fails the app just stays silent, nothing breaks, no crash
  }
}

// The ready sound for a note. The first request generates the tone and loads it,
// every request after that gets the same loaded sound back instantly. 
// The cache stores the loading (not the finished sound), so two quick taps on a
// brand new note share one load instead of racing each other.
function getSound(midiNote: number): Promise<Audio.Sound> {
  let pending = soundCache.get(midiNote);
  if (pending) {
    // Refresh this nots spot in the map so it counts as recently played:
    soundCache.delete(midiNote);
    soundCache.set(midiNote, pending);
    return pending;
  }

  pending = (async () => {
    await initAudio();
    const uri = generateToneWav(midiNoteToFrequency(midiNote), 600);
    // The long progress interval matters: without it, every playing sound streams
    // status updates back to the app several times a second, which is wasted cpu
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { volume: 0.85, progressUpdateIntervalMillis: 10000 },
    );
    return sound;
  })();
  soundCache.set(midiNote, pending);

  // Over the cap: drop the least recently played note and free its native sound:
  if (soundCache.size > MAX_SOUNDS) {
    const oldestKey = soundCache.keys().next().value;
    if (oldestKey !== undefined) {
      const evicted = soundCache.get(oldestKey);
      soundCache.delete(oldestKey);
      evicted?.then(s => s.unloadAsync()).catch(() => {});
    }
  }

  return pending;
}

// Loads a set of notes ahead of time, so their first real tap plays instantly
// instead of paying the one time generate-and-load cost right at the tap.
// The loads are spread out a moment apart, generating them all at once can freeze the app for a beat, so this is staggered:
// (it also sounds better and realistic)
export function preloadNotes(midiNotes: number[]): void {
  midiNotes.forEach((midiNote, i) => {
    setTimeout(() => {
      getSound(midiNote).catch(() => {});
    }, 200 + i * 150);
  });
}

// Plays one note (a fret tap).
// Replaying restarts the tone from the beginning, and different notes are separate sounds, so notes tapped in quick succession
// ring over each other naturally, the way strings on a real guitar do.
export async function playNote(midiNote: number): Promise<void> {
  try {
    const sound = await getSound(midiNote);
    await sound.replayAsync();
  } catch {
    // A failed note just stays silent
  }
}

// Strums a set of notes from the low string to the high string. 
// All the sounds are readied first, then scheduled a milisecond apart, 
// Stagger between strings stays even instead of stretching whenever a note still has to load.
// 40ms between notes is about the speed of a relaxed strum on a real guitar 
// (as per just testing the audio playback on the app and comparing it by ear to my real guitar)
export async function playStrum(
  midiNotes: number[],
  strumDelayMs: number = 40,
): Promise<void> {
  // Some chord shapes land the exact same pitch on two strings. 
  // Each pitch has one shared sound, so playing it twice in one strum would restart it mid-ring and
  // audibly cut it off. So I am playing each distinct pitch once as it still sounds right, a doubled
  // unison adds nothing audible anyway. If this does become an issue on use, I will play it twice assuming no lag
  const distinctNotes = [...new Set(midiNotes)];
  try {
    const sounds = await Promise.all(distinctNotes.map(midiNote => getSound(midiNote)));
    sounds.forEach((sound, i) => {
      setTimeout(() => {
        sound.replayAsync().catch(() => {});
      }, i * strumDelayMs);
    });
  } catch {
    // A failed strum just stays silent
  }
}
