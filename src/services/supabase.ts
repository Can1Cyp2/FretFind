/* The connection to the backend */

import 'react-native-url-polyfill/auto';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isBackendConfigured = Boolean(url && publishableKey);

export const supabase: SupabaseClient | null = isBackendConfigured
  ? createClient(url as string, publishableKey as string, {
      auth: {
        // The session is kept in the same device storage the progressions use, a signed in user stays signed in after closing the app
        storage: AsyncStorage,
        persistSession: true,
        autoRefreshToken: true,
        // This is for websites that get the login token back in the address bar. A phone app never does, so it is switched off
        detectSessionInUrl: false,
      },
    })
  : null;

// Sessions expire, so the client quietly renews them in the background. 
// only while the app is actually on, so the renewing is stopped when the app goes to the background
if (supabase) {
  AppState.addEventListener('change', state => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

/* How long to give a request before deciding the connection is not there:*/
const REQUEST_TIMEOUT_MS = 12000;

/* Gives up on a request that takes too long: */
export async function withTimeout<T>(work: PromiseLike<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Network request failed')), REQUEST_TIMEOUT_MS);
  });
  try {
    return await Promise.race([Promise.resolve(work), timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// Shows user the error in a friendly way:
export function describeError(error: unknown): string {
  const raw = extractMessage(error).trim();
  const lower = raw.toLowerCase();

  if (!raw || lower === '{}' || lower === 'undefined' || lower === 'null') {
    return 'Something went wrong. Please try again.';
  }
  if (raw === 'Failed to fetch' || raw === 'Network request failed' || raw === 'Load failed') {
    return 'Could not reach the server. Check your connection and try again.';
  }
  if (lower.includes('invalid login credentials')) {
    return 'That email or password is not right.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please confirm your email address first, check your inbox for the link.';
  }
  if (lower.includes('already registered')) {
    return 'There is already an account with that email. Try signing in instead.';
  }
  return raw;
}

function extractMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (!error || typeof error !== 'object') return '';
  const record = error as Record<string, unknown>;
  for (const key of ['message', 'error_description', 'msg', 'error']) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return '';
}
