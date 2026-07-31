/* Cloud saved progressions: 
   calls to the backend database.

   The server only ever returns rows belonging to the signed in user, RLS (row
   level security) is on for this table.
   The user id is never sent from the app, the server works it out from the session,
   so one user cannot get another users progressions. */

import { supabase, withTimeout } from './supabase';
import { ProgressionChord, SavedProgression } from '../types';

const TABLE = 'progressions';

/* A short fingerprint of one chord: what it is called and the shape it is actually
   held as, which frets on which strings.

   Both halves are needed and neither is enough on its own. Two chords can share a
   name and be completely different notes, most often because they were played in
   different tunings, so the name alone would call those the same. The other way
   round, the same frets in two different tunings sound as two different chords, so
   the shape alone would call those the same too. Together they only match when the
   chord really is the same chord played the same way. */
function chordFingerprint(chord: ProgressionChord): string {
  const name = `${chord.rootPitchClass}${chord.symbol}${chord.bassPitchClass ?? ''}`;
  const shape = chord.selections.map(s => (s ? `${s.stringIndex}.${s.fret}` : 'x')).join(',');
  return `${name}@${shape}`;
}

/* The phone and the server each make their own ids, so the same progression has a
   different id in each list and they cannot be matched that way. This builds a key
   out of what the user actually sees and played instead: the name, and the exact
   shape of every chord in it.

   It used to be just the name and how many chords were in it. That meant two
   completely different progressions that happened to share a name and length were treated as the same, 
   two attempts at the same idea in different tunings. Whichever one reached the account backend
   first silently blocked the other from ever being backed up, since as far as it could see it already looked backed up.
   
   This new revised keying on the actual frets fixes that: a different tuning means different
   frets even for a chord with the same name, so it now counts as a different
   progression rather than being folded into the one already on the account.

   d7 - the chords name is folded in alongside its shape as well, so a match
   now is made of three things: progression name, every chord name, and every chord
   shape line up. 
      The automatic backup only skips a progression when it finds that
      exact match on the account, so anything differing in any of the three still gets
      backed up rather than being mistaken for something already up there.

   Both the cloud button and the automatic backup use this, so they always agree on
   what is already backed up */
export function backupKey(progression: { name: string; chords: ProgressionChord[] }): string {
  return `${progression.name}::${progression.chords.map(chordFingerprint).join('|')}`;
}

// What one row looks like coming back from the server. The chords are stored as a
// single JSON column, since a progression is only ever read and written whole
interface ProgressionRow {
  id: string;
  name: string;
  chords: ProgressionChord[];
  created_at: string;
}

// Turns a server row into the same shape the app already uses everywhere else
// a cloud progression and a device progression are handled by the same code
function rowToSaved(row: ProgressionRow): SavedProgression {
  return {
    id: row.id,
    name: row.name,
    chords: row.chords,
    createdAt: new Date(row.created_at).getTime(),
  };
}

// Every progression the signed in user has saved, newest first:
export async function fetchCloudProgressions(): Promise<SavedProgression[]> {
  if (!supabase) return [];
  const { data, error } = await withTimeout(
    supabase
      .from(TABLE)
      .select('id, name, chords, created_at')
      .order('created_at', { ascending: false }),
  );
  if (error) throw error;
  return (data as ProgressionRow[]).map(rowToSaved);
}

// Saves a progression to the cloud and gives back the stored version, which carries the id the server assigned it
export async function saveCloudProgression(
  name: string,
  chords: ProgressionChord[],
): Promise<SavedProgression> {
  if (!supabase) throw new Error('Accounts are not available in this build.');
  
  // The user id is filled in by the server from the session, so it is not sent here
  const { data, error } = await withTimeout(
    supabase
      .from(TABLE)
      .insert({ name, chords })
      .select('id, name, chords, created_at')
      .single(),
  );
  if (error) throw error;
  return rowToSaved(data as ProgressionRow);
}

export async function renameCloudProgression(id: string, name: string): Promise<void> {
  if (!supabase) return;
  const { error } = await withTimeout(supabase.from(TABLE).update({ name }).eq('id', id));
  if (error) throw error;
}

export async function deleteCloudProgression(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await withTimeout(supabase.from(TABLE).delete().eq('id', id));
  if (error) throw error;
}

// Removes several in one request, used when transferring a batch back to the phone.
// One call rather than one per progression, so a transfer of a dozen is a single
// round trip instead of a dozen of them.
export async function deleteCloudProgressions(ids: string[]): Promise<void> {
  if (!supabase || ids.length === 0) return;
  const { error } = await withTimeout(supabase.from(TABLE).delete().in('id', ids));
  if (error) throw error;
}
