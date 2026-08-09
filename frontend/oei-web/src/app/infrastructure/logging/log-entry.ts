export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** One structured, JSON-serializable log line — the shape every sink (console today,
 * a collection backend tomorrow) receives. See `README.md` for the "why". */
export interface LogEntry {
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly message: string;
  readonly correlationId: string;
  /** Logical origin of the log line, e.g. 'HttpLoggingInterceptor', 'KeycloakAuthService'. */
  readonly context?: string;
  /** Arbitrary structured metadata — always passed through `redactSensitiveData` first. */
  readonly meta?: Record<string, unknown>;
}
