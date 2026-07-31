/* Keeps the account copy up to date while auto backup is switched on (without this
   turning auto backup on would only cover progressions saved from that moment on,
   and everything already saved on the phone would stay behind).

   Once something is safely on the account, the device does not keep its own copy
   any more, cloud becomes the one home for it rather than both places at once. So
   this watches the two lists and does two things: quietly uploads anything on the
   device that is not on the account yet, and removes the device copy of anything
   that already is (whether this same effect just uploaded it, the cloud button
   backed it up manually, or it was already sitting in both places from before this
   existed). It runs when auto backup is turned on, when someone signs in, and
   whenever a new progression is saved.

   This is also what fixes the account picking up duplicates: previously, deleting a
   progression from the account left the device copy behind, and the very next run
   of this effect saw it as 'not backed up yet' and quietly re-uploaded it. Removing
   the device copy the moment it lands on the account means there is nothing left
   sitting around for a later cloud side delete to accidentally bring back.

   A progression restored back down from the cloud on purpose is marked
   restoredFromCloud and is skipped entirely here, otherwise it would look like a new
   device progression and get pushed straight back up the moment it lands.

   It reports what it is doing back out (uploading right now, how many are still
   waiting, and whether the last attempt failed) so the Progressions sheet can
   actually show that instead of the work happening invisibly. */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SavedProgression } from '../types';
import { backupKey } from '../services/cloudProgressions';

interface Options {
  enabled: boolean;    // the auto backup switch
  isSignedIn: boolean;
  isCloudLoading: boolean;   // true while the account list is still being fetched
  savedProgressions: SavedProgression[];
  cloudProgressions: SavedProgression[];
  saveToCloud: (name: string, chords: SavedProgression['chords']) => Promise<string | null>;
  onBackedUp: (ids: string[]) => void; // removes device progressions once their copies are safely on the account
}

export interface AutoBackupStatus {
  isBackingUp: boolean;      // true while an upload is actually in progress
  pendingCount: number;      // how many device progressions still need to go up
  backupError: string | null; // why the last attempt stopped, almost always no connection
  retryBackup: () => void;   // tries again after a failure, from the button in the sheet
}

export function useAutoBackup({
  enabled,
  isSignedIn,
  isCloudLoading,
  savedProgressions,
  cloudProgressions,
  saveToCloud,
  onBackedUp,
}: Options): AutoBackupStatus {
  /* Uploading changes the account list, which runs this again, so without a record of
     what is already on its way the same progression would be sent several times over.
     Keys are held rather than ids, so renaming a progression makes it a new thing to
     back up rather than being skipped forever */
  const inFlight = useRef<Set<string>>(new Set());

  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupError, setBackupError] = useState<string | null>(null);

  /* The retry button: (clearing the error to try again) */
  const retryBackup = useCallback(() => setBackupError(null), []);

  // Which device progressions are not on the account yet, and which are already there and so no longer need their device copy. 
  // Worked out in one place so the effect below and the pending count the sheet shows cant disagree:
  const { pending, alreadyOnAccount } = useMemo(() => {
    const onAccount = new Set(cloudProgressions.map(backupKey));
    const pendingList: SavedProgression[] = [];
    const doneList: SavedProgression[] = [];
    for (const sp of savedProgressions) {
      // A restored copy is meant to live on the device on purpose, even though the same content is also on the account, so it counts as neither
      if (sp.restoredFromCloud) continue;
      if (onAccount.has(backupKey(sp))) doneList.push(sp);
      else pendingList.push(sp);
    }
    return { pending: pendingList, alreadyOnAccount: doneList };
  }, [savedProgressions, cloudProgressions]);

  /* Clearing out the device copies of things already on the account. 
     This is its own effect and goes through the batch remover in one call because doing it one
     progression at a time meant a separate state update and a separate write to device storage for each */
  useEffect(() => {
    if (!enabled || !isSignedIn || isCloudLoading) return;
    if (alreadyOnAccount.length === 0) return;
    onBackedUp(alreadyOnAccount.map(sp => sp.id));
  }, [enabled, isSignedIn, isCloudLoading, alreadyOnAccount, onBackedUp]);

  // The uploads themselves:
  useEffect(() => {
    /* Every way out of this effect without starting an upload puts the spinner back
       down first. A run that gets replaced part way through leaves its own flag set
       (it cannot know whether the run replacing it is carrying on the work), so
       whichever run decides there is nothing left to do is the one that has to
       clear it, otherwise the sheet sits there saying it is backing up forever. */
    const stop = () => setIsBackingUp(false);

    // Wait for the account list to arrive first, otherwise everything looks missing and the whole device list would be uploaded a second time
    if (!enabled || !isSignedIn || isCloudLoading) return stop();

    /* Once an attempt has failed, sit until the retry button says otherwise.

       Without this the effect would be tried again on every single change to either list, and with no connection each of those attempts
       hangs until the phone's own network timeout gives up on it */
    if (backupError) return stop();

    const toSend = pending.filter(sp => !inFlight.current.has(backupKey(sp)));
    if (toSend.length === 0) return stop();

    let cancelled = false;
    setIsBackingUp(true);

    (async () => {
      // Collected up and removed in one go at the end, for the same reason as above:
      const uploaded: string[] = [];
      try {
        for (const sp of toSend) {
          if (cancelled) return;
          const key = backupKey(sp);
          inFlight.current.add(key);
          const error = await saveToCloud(sp.name, sp.chords);
          if (error) {
            /* Almost always this means there is no connection. Stop rather than
               working through the rest and failing on every one, and say so, the
               retry button picks it back up. */
            inFlight.current.delete(key);
            if (!cancelled) setBackupError(error);
            return;
          }
          // Now safely on the account, so the device copy has done its job
          uploaded.push(sp.id);
        }
        if (!cancelled) setBackupError(null);
      } finally {
        if (!cancelled) setIsBackingUp(false);
        if (uploaded.length > 0) onBackedUp(uploaded);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, isSignedIn, isCloudLoading, pending, saveToCloud, onBackedUp, backupError]);

  /* Held still between renders. This gets handed to the Progressions sheet, which
     skips redrawing while what it is given has not changed, and a fresh object every
     render would mean it never once got to do that. */
  return useMemo(
    () => ({ isBackingUp, pendingCount: pending.length, backupError, retryBackup }),
    [isBackingUp, pending.length, backupError, retryBackup],
  );
}
