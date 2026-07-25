/* Keeps the account copy up to date while auto backup is switched on (Without this turning auto backup on would 
only cover progressions saved from that moment on, and everything already saved on the phone would stay behind)

   So this watches the two lists and quietly uploads anything on the device that is
   not on the account yet. It runs when auto backup is turned on, when someone signs
   in, and whenever a new progression is saved. */

import { useEffect, useRef } from 'react';
import { SavedProgression } from '../types';
import { backupKey } from '../services/cloudProgressions';

interface Options {
  enabled: boolean;    // the auto backup switch
  isSignedIn: boolean;
  isCloudLoading: boolean;   // true while the account list is still being fetched
  savedProgressions: SavedProgression[];
  cloudProgressions: SavedProgression[];
  saveToCloud: (name: string, chords: SavedProgression['chords']) => Promise<string | null>;
}

export function useAutoBackup({
  enabled,
  isSignedIn,
  isCloudLoading,
  savedProgressions,
  cloudProgressions,
  saveToCloud,
}: Options) {
  /* Uploading changes the account list, which runs this again, so without a record of
     what is already on its way the same progression would be sent several times over.
     Keys are held rather than ids, so renaming a progression makes it a new thing to
     back up rather than being skipped forever */
  const inFlight = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Wait for the account list to arrive first, otherwise everything looks missing
    // and the whole device list would be uploaded a second time
    if (!enabled || !isSignedIn || isCloudLoading) return;

    const onAccount = new Set(cloudProgressions.map(backupKey));
    const pending = savedProgressions.filter(sp => {
      const key = backupKey(sp);
      return !onAccount.has(key) && !inFlight.current.has(key);
    });
    if (pending.length === 0) return;

    let cancelled = false;

    (async () => {
      for (const sp of pending) {
        if (cancelled) return;
        const key = backupKey(sp);
        inFlight.current.add(key);
        const error = await saveToCloud(sp.name, sp.chords);
        if (error) {
          /* Almost always this means there is no connection*/
          inFlight.current.delete(key);
          return;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, isSignedIn, isCloudLoading, savedProgressions, cloudProgressions, saveToCloud]);
}
