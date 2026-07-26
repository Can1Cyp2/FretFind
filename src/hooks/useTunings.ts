/* Owns which tuning the fretboard is currently using, plus any custom tunings the
   user has built. Both are remembered on the device between launches, the same
   way useSettings and useProgression already do it.

   Saving to the cloud is planned for later, this only saves locally for now. */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PitchClass, Tuning } from '../types';
import { COMMON_TUNINGS, STANDARD_TUNING } from '../constants/tunings';
import { PITCH_CLASS_TO_SHARP } from '../constants/notes';

const CURRENT_TUNING_KEY = '@FretFind:currentTuningId';
const CUSTOM_TUNINGS_KEY = '@FretFind:customTunings';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function useTunings() {
  const [currentTuningId, setCurrentTuningId] = useState(STANDARD_TUNING.id);
  const [customTunings, setCustomTunings] = useState<Tuning[]>([]);

  // Stops the save effects below from running before storage has been read, which
  // would overwrite whatever was saved with the starting defaults
  const hasLoaded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const storedId = await AsyncStorage.getItem(CURRENT_TUNING_KEY);
        if (storedId) setCurrentTuningId(storedId);
        const storedCustom = await AsyncStorage.getItem(CUSTOM_TUNINGS_KEY);
        if (storedCustom) setCustomTunings(JSON.parse(storedCustom));
      } catch {
        // Unreadable storage just means starting on standard tuning with no customs
      }
      hasLoaded.current = true;
    })();
  }, []);

  useEffect(() => {
    if (!hasLoaded.current) return;
    AsyncStorage.setItem(CURRENT_TUNING_KEY, currentTuningId).catch(() => {});
  }, [currentTuningId]);

  useEffect(() => {
    if (!hasLoaded.current) return;
    AsyncStorage.setItem(CUSTOM_TUNINGS_KEY, JSON.stringify(customTunings)).catch(() => {});
  }, [customTunings]);

  // The actual tuning object the fretboard reads from, worked out from whichever
  // id is currently selected. Falls back to Standard if a custom tuning it was
  // pointed at ever got deleted, so the fretboard is never left without a tuning.
  const currentTuning = useMemo<Tuning>(() => {
    const found =
      COMMON_TUNINGS.find(t => t.id === currentTuningId) ??
      customTunings.find(t => t.id === currentTuningId);
    return found ?? STANDARD_TUNING;
  }, [currentTuningId, customTunings]);

  const selectTuning = useCallback((id: string) => {
    setCurrentTuningId(id);
  }, []);

  /* Builds a new custom tuning from six open string pitch classes and selects it
     straight away, so picking it in the popup shows the result immediately.

     The octave for each string has to come from the builder rather than being
     assumed here: it used to just copy Standard's octaves onto every custom tuning,
     which happened to still sound right for a small step in either direction, but
     broke as soon as a string was tuned far enough to actually cross into the next
     octave (whichever string that was would sound and label itself as if it were
     still in Standard's octave, up to a full octave off from what was actually
     picked). The builder works the real octave out from how each string was
     stepped, this just keeps it. */
  const addCustomTuning = useCallback((name: string, notes: PitchClass[], octaves: number[]) => {
    const tuning: Tuning = {
      id: generateId(),
      name: name.trim() || 'Custom Tuning',
      notes,
      noteNames: notes.map(pc => PITCH_CLASS_TO_SHARP[pc]),
      octaves,
      isPreset: false,
    };
    setCustomTunings(prev => [...prev, tuning]);
    setCurrentTuningId(tuning.id);
  }, []);

  const renameCustomTuning = useCallback((id: string, name: string) => {
    setCustomTunings(prev => prev.map(t => (t.id === id ? { ...t, name } : t)));
  }, []);

  // Deleting the tuning currently in use falls back to Standard, otherwise the
  // fretboard would be left pointing at a tuning that no longer exists
  const deleteCustomTuning = useCallback(
    (id: string) => {
      setCustomTunings(prev => prev.filter(t => t.id !== id));
      setCurrentTuningId(prev => (prev === id ? STANDARD_TUNING.id : prev));
    },
    [],
  );

  return {
    currentTuning,
    currentTuningId,
    presetTunings: COMMON_TUNINGS,
    customTunings,
    selectTuning,
    addCustomTuning,
    renameCustomTuning,
    deleteCustomTuning,
  };
}
