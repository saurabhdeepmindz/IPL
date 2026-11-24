/**
 * @file    queryClient.ts
 * @module  Lib
 *
 * @description
 * The shared TanStack Query client and its defaults. In plain words: how long fetched data is kept and when it is retried.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @subtask ST-ADM01-000-FE-01
 */
import { QueryClient } from '@tanstack/react-query';

/**
 * Global TanStack Query client with sensible production defaults.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes — data stays fresh
      gcTime: 1000 * 60 * 30, // 30 minutes — cache garbage collection
      retry: 2, // Retry failed requests twice
      refetchOnWindowFocus: false, // Don't refetch on window focus (UX improvement)
      refetchOnReconnect: true, // Refetch when reconnecting
    },
    mutations: {
      retry: 0, // Don't retry mutations
    },
  },
});
