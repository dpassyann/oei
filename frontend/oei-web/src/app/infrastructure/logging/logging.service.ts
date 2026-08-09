import { Service, inject } from '@angular/core';
import { CorrelationService } from './correlation.service';
import { LogEntry, LogLevel } from './log-entry';
import { redactSensitiveData } from './sensitive-data.filter';

/**
 * Structured (JSON stdout / console) logger, adapted and simplified from `iap-common`'s
 * `IapLoggerService` — see `README.md` in this directory for what changed and why.
 *
 * Every entry is a single JSON line (matching the deployment requirement — see
 * `.prompt/plan/final/00-AWS-DEPLOYMENT-AND-DEVOPS-PROMPT.md`, "Logs") carrying the current
 * navigation's `correlationId` (`CorrelationService`), and `meta` is always redacted via
 * `redactSensitiveData` before serialization — callers do not need to remember to scrub
 * tokens/passwords/CV bodies themselves.
 */
@Service()
export class LoggingService {
  private readonly correlation = inject(CorrelationService);

  debug(message: string, meta?: Record<string, unknown>, context?: string): void {
    this.write('debug', message, meta, context);
  }

  info(message: string, meta?: Record<string, unknown>, context?: string): void {
    this.write('info', message, meta, context);
  }

  warn(message: string, meta?: Record<string, unknown>, context?: string): void {
    this.write('warn', message, meta, context);
  }

  error(message: string, meta?: Record<string, unknown>, context?: string): void {
    this.write('error', message, meta, context);
  }

  /** Builds and emits the JSON entry. Exposed mainly so tests can assert on the exact shape. */
  buildEntry(level: LogLevel, message: string, meta?: Record<string, unknown>, context?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId: this.correlation.value(),
      context,
      meta: meta ? (redactSensitiveData(meta) as Record<string, unknown>) : undefined,
    };
  }

  private write(level: LogLevel, message: string, meta?: Record<string, unknown>, context?: string): void {
    const entry = this.buildEntry(level, message, meta, context);
    const line = JSON.stringify(entry);
    switch (level) {
      case 'debug':
        console.debug(line);
        break;
      case 'info':
        console.info(line);
        break;
      case 'warn':
        console.warn(line);
        break;
      case 'error':
        console.error(line);
        break;
    }
  }
}
