import { Service, computed, signal } from '@angular/core';

export type DataSource = 'mock' | 'api';

export interface OeiRuntimeConfig {
  dataSource: DataSource;
  apiBaseUrl: string;
}

const STORAGE_KEY = 'oei-data-source';
const CONFIG_URL = '/config';

declare global {
  interface Window {
    __OEI_CONFIG__?: Partial<OeiRuntimeConfig>;
  }
}

// Note: `@Service()` is used instead of `@Injectable({ providedIn: 'root' })`.
// It is confirmed present and stable (@publicApi) in the installed @angular/core
// (see node_modules/@angular/core/types/core.d.ts), and its default overload
// `(options?: { autoProvided?: true })` auto-provides the class exactly like
// `providedIn: 'root'`, making it a drop-in replacement.
@Service()
export class RuntimeConfig {
  private readonly dataSourceSignal = signal<DataSource>(this.resolveDataSource());
  private readonly apiBaseUrlSignal = signal<string>(this.resolveApiBaseUrl());

  readonly dataSource = this.dataSourceSignal.asReadonly();
  readonly apiBaseUrl = this.apiBaseUrlSignal.asReadonly();
  readonly isMock = computed(() => this.dataSourceSignal() === 'mock');

  async load(): Promise<void> {
    try {
      const response = await fetch(CONFIG_URL, { headers: { Accept: 'application/json' } });
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
        return;
      }
      const config = (await response.json()) as Partial<OeiRuntimeConfig>;
      if (typeof config.apiBaseUrl === 'string' && config.apiBaseUrl.length > 0) {
        this.apiBaseUrlSignal.set(config.apiBaseUrl);
      }
      if (!this.hasLocalOverride() && (config.dataSource === 'mock' || config.dataSource === 'api')) {
        this.dataSourceSignal.set(config.dataSource);
      }
    } catch {
      // Hors ligne / pas de serveur / réponse non JSON → on garde les valeurs par défaut.
    }
  }

  setDataSource(source: DataSource): void {
    this.dataSourceSignal.set(source);
    try {
      localStorage.setItem(STORAGE_KEY, source);
    } catch {
      // localStorage indisponible (mode privé, etc.) — pas bloquant.
    }
  }

  private hasLocalOverride(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  }

  private resolveDataSource(): DataSource {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'mock' || stored === 'api') {
        return stored;
      }
    } catch {
      // ignore
    }
    const injected = typeof window !== 'undefined' ? window.__OEI_CONFIG__?.dataSource : undefined;
    return injected === 'api' ? 'api' : 'mock';
  }

  private resolveApiBaseUrl(): string {
    if (typeof window !== 'undefined' && window.__OEI_CONFIG__?.apiBaseUrl) {
      return window.__OEI_CONFIG__.apiBaseUrl;
    }
    return '/api/v1';
  }
}
