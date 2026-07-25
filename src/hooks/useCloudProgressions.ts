import { useCallback, useEffect, useState } from 'react';
import { ProgressionChord, SavedProgression } from '../types';
import { describeError } from '../services/supabase';
import {
  fetchCloudProgressions,
  saveCloudProgression,
  renameCloudProgression,
  deleteCloudProgression,
} from '../services/cloudProgressions';

export function useCloudProgressions(isSignedIn: boolean) {
  const [cloudProgressions, setCloudProgressions] = useState<SavedProgression[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // The last thing that went wrong shown in the sheet so a failed save is not silent:
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isSignedIn) {
      setCloudProgressions([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      setCloudProgressions(await fetchCloudProgressions());
    } catch (e) {
      setError(describeError(e));
    }
    setIsLoading(false);
  }, [isSignedIn]);

  // Load on sign in, clear on sign out
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Saves the current progression to the cloud
  const saveToCloud = useCallback(
    async (name: string, chords: ProgressionChord[]): Promise<string | null> => {
      if (!isSignedIn) return 'Sign in first to save to the cloud.';
      if (chords.length === 0) return 'There is nothing in the progression to save.';
      setError(null);
      try {
        const saved = await saveCloudProgression(name.trim() || 'Untitled Progression', chords);
        setCloudProgressions(prev => [saved, ...prev]);
        return null;
      } catch (e) {
        const message = describeError(e);
        setError(message);
        return message;
      }
    },
    [isSignedIn],
  );


  const renameInCloud = useCallback(async (id: string, name: string) => {
    setCloudProgressions(prev => prev.map(p => (p.id === id ? { ...p, name } : p)));
    try {
      await renameCloudProgression(id, name);
    } catch (e) {
      setError(describeError(e));
      refresh();
    }
  }, [refresh]);

  const deleteFromCloud = useCallback(async (id: string) => {
    setCloudProgressions(prev => prev.filter(p => p.id !== id));
    try {
      await deleteCloudProgression(id);
    } catch (e) {
      setError(describeError(e));
      refresh();
    }
  }, [refresh]);

  return {
    cloudProgressions,
    isLoading,
    error,
    refresh,
    saveToCloud,
    renameInCloud,
    deleteFromCloud,
  };
}
