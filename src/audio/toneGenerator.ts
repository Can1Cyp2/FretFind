/* Builds the actual sound the app plays, from scratch (MIDI: Musical Instrument Digital Interface). React Native has no
   built-in way to synthesize audio, so this file computes the samples of a tone itself, 
   wraps them in a WAV file header byte by byte, and gives the output as a data URI (base64) 
   that the player can load like any normal audio file (which is almost instant)

   The tone is a sine wave at the note's frequency with two quieter harmonics
   stacked on top and a fading envelope, which is what makes it sound like a
   plucked string instead of a flat beep. 
   
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

// Generates one playable tone at the given frequency and returns it as a
// 'data:audio/wav;base64,...' URI, ready for the player to load.
// The sample rate is kept low on purpose: it halves the math and the data size
// (this loop runs on the apps single JS thread, so cheaper means less lag), and
// 11025 Hz still covers the highest harmonic of the highest fret with room to spare 
export function generateToneWav(
  frequency: number,
  durationMs: number = 400,
  sampleRate: number = 11025,
): string {
  const numSamples = Math.floor(sampleRate * durationMs / 1000);
  const amplitude = 0.4;
  const samples = new Int16Array(numSamples);

  // The tone is still quietly ringing when the file ends, and stopping a wave mid-swing makes an audible click. 
  // So the last stretch of the tone ramps down to true silence, and the ending becomes faded instead of a cut.
  const releaseSamples = Math.floor(sampleRate * 0.08); // the final 80ms
  const releaseStart = numSamples - releaseSamples;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // The envelope fades the tone out over time, like a real string losing energy after the pluck:
    const envelope = Math.exp(-4.0 * t);
    // The fundamental is the note itself. The harmonics are the same note an octave up
    // and an octave-and-a-fifth up, mixed in quietly to give the tone some body, since a lone sine wave sounds thin and electronic
    const fundamental = Math.sin(2 * Math.PI * frequency * t);
    const harmonic2 = 0.3 * Math.sin(2 * Math.PI * frequency * 2 * t);
    const harmonic3 = 0.1 * Math.sin(2 * Math.PI * frequency * 3 * t);
    let value = amplitude * envelope * (fundamental + harmonic2 + harmonic3);

    // Inside the final stretch: scale down linearly so the very last sample is zero:
    if (i >= releaseStart) {
      value *= (numSamples - i) / releaseSamples;
    }

    samples[i] = Math.round(Math.max(-1, Math.min(1, value)) * 32767); // the valid range and scale to 16 bit audio
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

  return 'data:audio/wav;base64,' + arrayBufferToBase64(buffer); // the final URI(ready for the player to load)
}
