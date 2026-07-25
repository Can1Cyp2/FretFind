/* Builds the actual sound the app plays, from scratch (MIDI: Musical Instrument Digital Interface). React Native has no
   built-in way to synthesize audio, so this file computes the samples of a tone itself,
   wraps them in a WAV file header byte by byte, and gives the output as a data URI (base64)
   that the player can load like any normal audio file (which is almost instant)

   The tone is made with plucked string synthesis (the well known Karplus-Strong
   technique): a short burst of noise is fed into a loop the length of one wave
   cycle, and every pass around the loop it gets averaged and slightly quieter.
   That is physically close to what a real string does when plucked, the pluck is
   chaotic for an instant and settles into a ringing pitch as it loses energy,
   which is why this sounds like a string instead of an electronic beep.

   Most of my knowledge for this comes from the book and other sources referenced in the mid-project-status-report.md
   */

// The equal temperament formula: A4 (MIDI note 69) is fixed at 440 Hz, and every
// semitone away from it multiplies the frequency by the twelfth root of two.
// This is how any note number becomes a frequency the ear recognizes.
export function midiNoteToFrequency(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

// Writes plain text characters into the WAV header
// (the format expects labels like 'RIFF' and 'WAVE' at exact byte positions)
function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

// Turns the raw WAV bytes into base64,
// since React Native does not have a built-in encoder for array buffers, I did it manually as so:
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < len ? bytes[i + 1] : 0;
    const b2 = i + 2 < len ? bytes[i + 2] : 0;
    result += chars[b0 >> 2];
    result += chars[((b0 & 3) << 4) | (b1 >> 4)];
    result += i + 1 < len ? chars[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    result += i + 2 < len ? chars[b2 & 63] : '=';
  }
  return result;
}

// Generates one playable plucked note at the given frequency and returns it as a
// 'data:audio/wav;base64,...' URI, ready for the player to load.
// This costs less per sample than the sine wave approach I had before (averaging
// two numbers instead of computing three sines), so the sample rate can be a
// proper 22050 Hz and the note can ring for over a second without lagging the app.
export function generateToneWav(
  frequency: number,
  durationMs: number = 1200,
  sampleRate: number = 22050,
): string {
  const numSamples = Math.floor(sampleRate * durationMs / 1000);
  const samples = new Int16Array(numSamples);
  // Worked out first as plain floats, so the whole note can be measured and levelled
  // before it is turned into 16 bit audio
  const floats = new Float32Array(numSamples);

  /* The 'string' itself: a loop of numbers exactly one wave cycle long, filled with
     random noise. The noise is the energy of the pluck, all frequencies at once,
     the same way a real string is a chaotic mess the instant the pick lets go. It is
     lightly smoothed so the very first instant is not a harsh click. */
  const period = Math.max(2, Math.round(sampleRate / frequency));
  const line = new Float32Array(period);
  let previousNoise = 0;
  for (let i = 0; i < period; i++) {
    const noise = Math.random() * 2 - 1;
    line[i] = (noise + previousNoise) / 2;
    previousNoise = noise;
  }

  /* Each output sample is read off the loop, and the spot it came from is replaced
     with the average of itself and its neighbour, made slightly quieter. Averaging
     smooths the noise out a little more on every pass, so the highs die away first
     and the ringing pitch emerges, and the decay factor is the string losing energy.
     Low notes have longer loops so they ring longer, exactly like real strings.
     The loudest point is tracked as we go, so the whole note can be levelled after. */
  const decay = 0.998;
  const attackSamples = sampleRate * 0.002;
  const releaseSamples = sampleRate * 0.08;
  let index = 0;
  let peak = 0;
  for (let n = 0; n < numSamples; n++) {
    const current = line[index];
    const nextIndex = index + 1 === period ? 0 : index + 1;
    line[index] = decay * 0.5 * (current + line[nextIndex]);
    let value = current;

    // A tiny ramp in over the first couple of milliseconds, so the pluck starts
    // sharply but not as a pop
    if (n < attackSamples) {
      value *= n / attackSamples;
    }
    // And the last stretch ramps to true silence, so the file ending is never a click
    if (n > numSamples - releaseSamples) {
      value *= (numSamples - n) / releaseSamples;
    }

    floats[n] = value;
    const magnitude = Math.abs(value);
    if (magnitude > peak) peak = magnitude;
    index = nextIndex;
  }

  /* Levelling: the pluck starts from random noise, so every note comes out at a
     slightly different loudness and some land much hotter than others, which was
     the notes that blared. Scaling each note by its own loudest point sets them all
     to the same target level, so no note is louder than the next and none clips.
     The target is under 1.0 so there is a little headroom left. */
  const targetPeak = 0.85;
  const gain = peak > 0 ? targetPeak / peak : 0;
  for (let n = 0; n < numSamples; n++) {
    samples[n] = Math.round(Math.max(-1, Math.min(1, floats[n] * gain)) * 32767); // scale to 16 bit audio
  }

  // The 44 byte WAV header: the format, channel count, sample rate, and data length,
  // each at the exact byte position the WAV standard expects, then the samples:
  const dataLength = numSamples * 2;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);
  writeString(view, 0, 'RIFF'); // the RIFF chunk label
  view.setUint32(4, 36 + dataLength, true); // the RIFF chunk length
  writeString(view, 8, 'WAVE'); // the WAVE chunk label
  writeString(view, 12, 'fmt '); // the fmt chunk label
  view.setUint32(16, 16, true); // fmt chunk length
  view.setUint16(20, 1, true);  // plain uncompressed audio
  view.setUint16(22, 1, true);  // one channel (mono)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); // 2 bytes per sample
  view.setUint16(34, 16, true); // 16 bits per sample
  writeString(view, 36, 'data'); // the data chunk label
  view.setUint32(40, dataLength, true);

  for (let i = 0; i < numSamples; i++) { // the actual audio samples
    view.setInt16(44 + i * 2, samples[i], true);
  }

  return 'data:audio/wav;base64,' + arrayBufferToBase64(buffer); // the final URI (ready for the player to load)
}
