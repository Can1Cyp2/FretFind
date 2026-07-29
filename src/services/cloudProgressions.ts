/* Cloud saved progressions: 
   calls to the backend database.

   The server only ever returns rows belonging to the signed in user, RLS (row
   level security) is on for this table.
   The user id is never sent from the app, the server works it out from the session,
   so one user cannot get another users progressions. */

import { supabase } from './supabase';
import { ProgressionChord, SavedProgression } from '../types';

const TABLE = 'progressions';

// A short fingerprint of one chords actual shape, which frets are held on which
// strings, not just its name. Two chords can share a name and still be completely
// different notes (most often because they were played in different tunings)
function chordFingerprint(chord: ProgressionChord): string {
  return chord.selections.map(s => (s ? `${s.stringIndex}.${s.fret}` : 'x')).join(',');
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
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, name, chords, created_at')
    .order('created_at', { ascending: false });
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
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ name, chords })
    .select('id, name, chords, created_at')
    .single();
  if (error) throw error;
  return rowToSaved(data as ProgressionRow);
}

export async function renameCloudProgression(id: string, name: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from(TABLE).update({ name }).eq('id', id);
  if (error) throw error;
}

export async function deleteCloudProgression(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
