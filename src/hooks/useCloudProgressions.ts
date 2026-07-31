import { useCallback, useEffect, useState } from 'react';
import { ProgressionChord, SavedProgression } from '../types';
import { describeError } from '../services/supabase';
import {
  fetchCloudProgressions,
  saveCloudProgression,
  renameCloudProgression,
  deleteCloudProgression,
  deleteCloudProgressions,
} from '../services/cloudProgressions';

export function useCloudProgressions(isSignedIn: boolean) {
  const [cloudProgressions, setCloudProgressions] = useState<SavedProgression[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // The last thing that went wrong shown in the sheet so a failed save is not silent:
  const [error, setError] = useState<string | null>(null);

  /* How many requests are in the air right now. Talking to the account is the one
     part of the app that is not instant, and while it waits the app can look like it
     has simply stopped. (As of d7 it does freeze and I am not 100% sure why) */
  const [activeRequests, setActiveRequests] = useState(0);

  // Runs one piece of cloud work while counting it, so anything showing a spinner knows about it without every single action having to remember to say so
  const track = useCallback(async <T>(work: () => Promise<T>): Promise<T> => {
    setActiveRequests(n => n + 1);
    try {
      return await work();
    } finally {
      setActiveRequests(n => n - 1);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!isSignedIn) {
      setCloudProgressions([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      setCloudProgressions(await track(fetchCloudProgressions));
    } catch (e) {
      setError(describeError(e));
    }
    setIsLoading(false);
  }, [isSignedIn, track]);

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
        const saved = await track(() =>
          saveCloudProgression(name.trim() || 'Untitled Progression', chords),
        );
        setCloudProgressions(prev => [saved, ...prev]);
        return null;
      } catch (e) {
        const message = describeError(e);
        setError(message);
        return message;
      }
    },
    [isSignedIn, track],
  );


  const renameInCloud = useCallback(async (id: string, name: string) => {
    setCloudProgressions(prev => prev.map(p => (p.id === id ? { ...p, name } : p)));
    try {
      await track(() => renameCloudProgression(id, name));
    } catch (e) {
      setError(describeError(e));
      refresh();
    }
  }, [refresh, track]);

  const deleteFromCloud = useCallback(async (id: string) => {
    setCloudProgressions(prev => prev.filter(p => p.id !== id));
    try {
      await track(() => deleteCloudProgression(id));
    } catch (e) {
      setError(describeError(e));
      refresh();
    }
  }, [refresh, track]);

  /* Removes several at once, for transferring a batch back to the phone. Gives back
     an error message rather than only showing it here, since the caller needs to
     know whether the account side actually went through before it tells the user
     the transfer worked. */
  const deleteManyFromCloud = useCallback(
    async (ids: string[]): Promise<string | null> => {
      if (ids.length === 0) return null;
      const removing = new Set(ids);
      setCloudProgressions(prev => prev.filter(p => !removing.has(p.id)));
      try {
        await track(() => deleteCloudProgressions(ids));
        return null;
      } catch (e) {
        const message = describeError(e);
        setError(message);
        // Put the list back to whatever the server actually has, so the sheet is not
        // left showing them as gone when they are still up there
        refresh();
        return message;
      }
    },
    [refresh, track],
  );

  return {
    cloudProgressions,
    isLoading,
    isBusy: activeRequests > 0, // True whenever anything at all is talking to the account right now
    error,
    refresh,
    saveToCloud,
    renameInCloud,
    deleteFromCloud,
    deleteManyFromCloud,
  };
}
