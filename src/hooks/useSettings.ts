/* This hook owns the user preferences and remembers them between app launches. In a local storage
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@FretFind:settings';

interface Settings {
  showOctaves: boolean;  // note labels include the octave number (E2 instead of just E)
  preferFlats: boolean;  // notes are spelt with flats (Bb) instead of sharps (A#)
  autoBackup: boolean;   // saving a progression also copies it to the account
  volume: number;     // audio volume from 0 (silent) to 1(full)
}

const DEFAULTS: Settings = {
  showOctaves: false,
  preferFlats: false,
  autoBackup: false,
  volume: 0.8,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  // Stops the save below from running before the stored values have been read,
  // which would write the defaults over whatever the user had picked
  const hasLoaded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_KEY);
        if (stored) {
          // Spread over the defaults so a settings file saved by an older version, from before a preference existed, 
          // still loads instead of coming back undefined
          setSettings({ ...DEFAULTS, ...JSON.parse(stored) });
        }
      } catch {
        // Unreadable storage just means starting on the defaults
      }
      hasLoaded.current = true;
    })();
  }, []);

  useEffect(() => {
    if (!hasLoaded.current) return;
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings]);

  const toggleOctaves = useCallback(() => {
    setSettings(prev => ({ ...prev, showOctaves: !prev.showOctaves }));
  }, []);

  const togglePreferFlats = useCallback(() => {
    setSettings(prev => ({ ...prev, preferFlats: !prev.preferFlats }));
  }, []);

  const toggleAutoBackup = useCallback(() => {
    setSettings(prev => ({ ...prev, autoBackup: !prev.autoBackup }));
  }, []);

  const setVolume = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(1, value));  // Kept inside 0 to 1 so a stray value from the slider cannot break playback

    setSettings(prev => ({ ...prev, volume: clamped }));
  }, []);

  return {
    showOctaves: settings.showOctaves,
    preferFlats: settings.preferFlats,
    autoBackup: settings.autoBackup,
    volume: settings.volume,
    toggleOctaves,
    togglePreferFlats,
    toggleAutoBackup,
    setVolume,
  };
}
