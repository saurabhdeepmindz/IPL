/**
 * @file    page.tsx
 * @module  App
 *
 * @description
 * Home route. In plain words: sends the visitor to the sign-in page.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @subtask ST-ADM01-000-FE-01
 */
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
}
