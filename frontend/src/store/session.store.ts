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

/** The signed-in user as the screens need it. */
export interface SessionUser {
  userId: string;
  employeeCode: string;
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

/** Session store (memory only; nothing is persisted). */
export const useSessionStore = create<SessionState>((set) => ({
  status: 'signedOut',
  user: null,
  signIn: (user) => set({ status: 'signedIn', user }),
  signOut: () => set({ status: 'signedOut', user: null }),
}));
