/**
 * @file    session.store.ts
 * @module  Session
 *
 * @description
 * Who is signed in, for the screens. In plain words: holds the name-free facts about the session (user key, employee code, company) and whether the user is signed in. It holds no token.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-FE-02
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** The signed-in user as the screens need it. */
export interface SessionUser {
  userId: string;
  employeeCode: string;
  /** Name as in the user record, when the sign-in gave it. */
  name?: string;
  /** Team or department of the user, when the sign-in or the who-am-I call gave it. */
  team?: string;
  companyCode: string;
}

interface SessionState {
  /** signedIn after a successful sign-in; signedOut otherwise. */
  status: 'signedOut' | 'signedIn';
  user: SessionUser | null;
  /** Mark the user as signed in. */
  signIn: (user: SessionUser) => void;
  /** Clear the session. The API client also calls this when a refresh fails. */
  signOut: () => void;
}

/** Session store. The user is kept in the browser tab (session storage) so a reload still shows who is signed in; tokens are never stored here. */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      status: 'signedOut',
      user: null,
      signIn: (user) => set({ status: 'signedIn', user }),
      signOut: () => set({ status: 'signedOut', user: null }),
    }),
    { name: 'ams-session', storage: createJSONStorage(() => sessionStorage), partialize: (s) => ({ status: s.status, user: s.user }) },
  ),
);
