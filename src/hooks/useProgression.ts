/* The chord progression: the strip of chords the user is building,
   and the named progressions saved on the device. 
   
   Loads both from device storage when the app starts and writes them back whenever they change, 
   so a progression stays when someone closes the app.
   
   App.tsx uses this once and passes the pieces down as props, the same way the note selections work. */

import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChordMatch, FretSelection, ProgressionChord, SavedProgression } from '../types';

// Where the progressions live in device storage (iOS and Android have separate sandboxes, so this is set to the app)
const PROGRESSION_KEY = '@FretFind:progression';
const SAVED_PROGRESSIONS_KEY = '@FretFind:savedProgressions';

// A progression is capped (12 chords is a long loop and often users wont reach this many)
export const MAX_PROGRESSION_LENGTH = 12;

// get ids so always target the right chord even when the same chord is added twice:
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function useProgression() {
  const [progression, setProgression] = useState<ProgressionChord[]>([]);
  const [savedProgressions, setSavedProgressions] = useState<SavedProgression[]>([]);

  // True once stored data has been read, so the persist effects below do not run first and wipe the storage with the empty starting state
  const hasLoaded = useRef(false);

  // Load both from device storage once when the app starts:
  useEffect(() => {
    (async () => {
      try {
        const progressionJson = await AsyncStorage.getItem(PROGRESSION_KEY);
        if (progressionJson) setProgression(JSON.parse(progressionJson));
        const savedJson = await AsyncStorage.getItem(SAVED_PROGRESSIONS_KEY);
        if (savedJson) setSavedProgressions(JSON.parse(savedJson));
      } catch {
        // Storage being unreadable just means starting fresh
      }
      hasLoaded.current = true;
    })();
  }, []);

  // write the working progression back whenever it changes (removed entirely when cleared)
  useEffect(() => {
    if (!hasLoaded.current) return;
    if (progression.length > 0) {
      AsyncStorage.setItem(PROGRESSION_KEY, JSON.stringify(progression)).catch(() => {});
    } else {
      AsyncStorage.removeItem(PROGRESSION_KEY).catch(() => {});
    }
  }, [progression]);

  // Same for the saved progressions
  useEffect(() => {
    if (!hasLoaded.current) return;
    if (savedProgressions.length > 0) {
      AsyncStorage.setItem(SAVED_PROGRESSIONS_KEY, JSON.stringify(savedProgressions)).catch(() => {});
    } else {
      AsyncStorage.removeItem(SAVED_PROGRESSIONS_KEY).catch(() => {});
    }
  }, [savedProgressions]);

  // Add a matched chord to the progression, keeping the exact fretboard shape it was played as, so tapping its pill later can put the shape back
  const addChord = useCallback((match: ChordMatch, currentSelections: (FretSelection | null)[]) => {
    setProgression(prev => {
      if (prev.length >= MAX_PROGRESSION_LENGTH) return prev;
      const chord: ProgressionChord = {
        id: generateId(),
        fullName: match.fullName,
        rootPitchClass: match.rootPitchClass,
        symbol: match.chordType.symbol,
        bassPitchClass: match.bassPitchClass,
        matchQuality: match.matchQuality,
        selections: [...currentSelections],
      };
      return [...prev, chord];
    });
  }, []);

  const removeChord = useCallback((id: string) => {
    setProgression(prev => prev.filter(c => c.id !== id));
  }, []);

  // Move a chord one spot left or right in the strip:
  const reorderChord = useCallback((fromIndex: number, toIndex: number) => {
    setProgression(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const clearProgression = useCallback(() => {
    setProgression([]);
  }, []);

  // Keep the current progression under a name, so the user can start a new one without losing this one
  const saveProgression = useCallback((name: string) => {
    setProgression(current => {
      if (current.length > 0) {
        const saved: SavedProgression = {
          id: generateId(),
          name: name.trim() || 'Untitled Progression',
          chords: [...current],
          createdAt: Date.now(),
        };
        setSavedProgressions(prev => [...prev, saved]);
      }
      return current;
    });
  }, []);

  // Load a saved progression back into the strip (replacing what is there):
  const loadProgression = useCallback((id: string) => {
    setSavedProgressions(saved => {
      const found = saved.find(p => p.id === id);
      if (found) setProgression([...found.chords]);
      return saved;
    });
  }, []);

  const deleteSavedProgression = useCallback((id: string) => {
    setSavedProgressions(prev => prev.filter(p => p.id !== id));
  }, []);

  const renameSavedProgression = useCallback((id: string, name: string) => {
    setSavedProgressions(prev => prev.map(p => (p.id === id ? { ...p, name } : p)));
  }, []);

  return {
    progression,
    savedProgressions,
    addChord,
    removeChord,
    reorderChord,
    clearProgression,
    saveProgression,
    loadProgression,
    deleteSavedProgression,
    renameSavedProgression,
    isFull: progression.length >= MAX_PROGRESSION_LENGTH,
  };
}
