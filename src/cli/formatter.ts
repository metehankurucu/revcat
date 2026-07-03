import { RevenueCatApiError } from "../client/errors.ts";

export function output(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

export function outputError(error: unknown): void {
  console.error(JSON.stringify(buildErrorEnvelope(error), null, 2));
  process.exit(1);
}

/**
 * Builds the machine-actionable error envelope. For a RevenueCat v2 API error it
 * includes the spec fields (type, param, doc_url, retryable, backoff_ms, status);
 * for any other error it stays a minimal { error, message }.
 */
export function buildErrorEnvelope(error: unknown): Record<string, unknown> {
  if (error instanceof RevenueCatApiError) {
    const envelope: Record<string, unknown> = {
      error: error.name,
      message: error.apiError.message,
      status: error.statusCode,
    };
    if (error.type !== undefined) envelope.type = error.type;
    if (error.param !== undefined && error.param !== null) envelope.param = error.param;
    if (error.docUrl !== undefined) envelope.doc_url = error.docUrl;
    if (error.apiError.retryable !== undefined) envelope.retryable = error.retryable;
    if (error.backoffMs !== undefined) envelope.backoff_ms = error.backoffMs;
    return envelope;
  }
  if (error instanceof Error) {
    return { error: error.name, message: error.message };
  }
  return { error: "UnknownError", message: String(error) };
}
