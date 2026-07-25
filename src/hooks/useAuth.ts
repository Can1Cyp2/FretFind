/* This hook cheks whether someone is signed in. It checks for an existing session
   when the app starts, then listens for sign ins and sign outs so the rest of the
   app always knows the current state without asking.

   An account is completely optional. Everything works signed out, an
   account only adds saving progressions to the cloud so they survive losing the
   phone and can be loaded on another device. */

import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isBackendConfigured, describeError } from '../services/supabase';

// Where the confirmation email sends people after they tap the link:
const CONFIRM_URL = 'https://can1cyp2.github.io/FretFind-Info_Site/confirm';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  // True until the first check finishes, so the UI does not flash 'signed out' for a moment before a stored session is found:
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Pick up a session left over from last time the app was open:
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    // From here on, the client tells us whenever the session changes:
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  /* The three actions below all return an error message string when something goes
     wrong, or null when it worked. That way the screen calling them can show the
     problem next to the form instead of each one inventing its own way to fail: */
  const signUp = useCallback(async (email: string, password: string): Promise<string | null> => {
    if (!supabase) return 'Accounts are not available in this build.';
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: CONFIRM_URL },
    });
    return error ? describeError(error) : null;
  }, []);
  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    if (!supabase) return 'Accounts are not available in this build.';
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return error ? describeError(error) : null;
  }, []);
  const signOut = useCallback(async (): Promise<string | null> => {
    if (!supabase) return null;
    const { error } = await supabase.auth.signOut();
    return error ? describeError(error) : null;
  }, []);

  
  return {
    session,
    user: session?.user ?? null,
    email: session?.user?.email ?? null,
    isSignedIn: session !== null,
    isLoading,
    isAvailable: isBackendConfigured,
    signUp,
    signIn,
    signOut,
  };
}
