/**
 * @file    errors.ts
 * @module  ApiClient
 *
 * @description
 * The one error type the screens see from the API. In plain words: it carries the error code, the message and a map of field messages that a form can show next to each field.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-FE-02
 */
import axios from 'axios';

/** Failure body of every API call (Foundation section 3.1). */
interface FailureBody {
  error?: { code?: string; message?: string; fields?: { field: string; message: string }[] };
}

/**
 * A failed API call.
 *
 * In plain words: `status` is the HTTP status (0 when the server could not be reached), `code` is the UPPER_SNAKE code, and `fields` maps field name to message.
 */
export class ApiError extends Error {
  constructor(
    /** HTTP status; 0 when there was no answer. */
    readonly status: number,
    /** Error code from the API, or NETWORK_ERROR. */
    readonly code: string,
    message: string,
    /** Field name to message, for forms. */
    readonly fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Turn anything thrown by Axios into an ApiError.
 *
 * In plain words: the screens never have to look inside an Axios error.
 *
 * @param err What was thrown
 * @returns The ApiError (the same one if it already is one)
 */
export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  const response = axios.isAxiosError(err) ? err.response : (err as { response?: { status: number; data: unknown } })?.response;
  if (!response) return new ApiError(0, 'NETWORK_ERROR', 'The server could not be reached. Check your connection and try again.');
  const body = (response.data ?? {}) as FailureBody;
  const fields = Object.fromEntries((body.error?.fields ?? []).map((f) => [f.field, f.message]));
  return new ApiError(response.status, body.error?.code ?? 'ERROR', body.error?.message ?? 'Something went wrong.', fields);
}
