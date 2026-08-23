import { Service, computed, signal } from '@angular/core';

export type DataSource = 'mock' | 'api';

export interface OeiRuntimeConfig {
  dataSource: DataSource;
  apiBaseUrl: string;
  hideEspaceMembre: boolean;
  linkedinOAuthAuthorizeUrl: string;
  linkedinOAuthClientId: string;
  linkedinOAuthRedirectUri: string;
  linkedinOAuthScope: string;
}

const STORAGE_KEY = 'oei-data-source';
const CONFIG_URL = '/config';
const DEFAULT_LINKEDIN_AUTHORIZE_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const DEFAULT_LINKEDIN_SCOPE = 'openid profile email';

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
  private readonly hideEspaceMembreSignal = signal<boolean>(this.resolveHideEspaceMembre());
  private readonly linkedinOAuthAuthorizeUrlSignal = signal<string>(this.resolveLinkedinOAuthAuthorizeUrl());
  private readonly linkedinOAuthClientIdSignal = signal<string>(this.resolveLinkedinOAuthClientId());
  private readonly linkedinOAuthRedirectUriSignal = signal<string>(this.resolveLinkedinOAuthRedirectUri());
  private readonly linkedinOAuthScopeSignal = signal<string>(this.resolveLinkedinOAuthScope());

  readonly dataSource = this.dataSourceSignal.asReadonly();
  readonly apiBaseUrl = this.apiBaseUrlSignal.asReadonly();
  readonly hideEspaceMembre = this.hideEspaceMembreSignal.asReadonly();
  readonly linkedinOAuthAuthorizeUrl = this.linkedinOAuthAuthorizeUrlSignal.asReadonly();
  readonly linkedinOAuthClientId = this.linkedinOAuthClientIdSignal.asReadonly();
  readonly linkedinOAuthRedirectUri = this.linkedinOAuthRedirectUriSignal.asReadonly();
  readonly linkedinOAuthScope = this.linkedinOAuthScopeSignal.asReadonly();
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
      if (typeof config.hideEspaceMembre === 'boolean') {
        this.hideEspaceMembreSignal.set(config.hideEspaceMembre);
      }
      if (typeof config.linkedinOAuthAuthorizeUrl === 'string' && config.linkedinOAuthAuthorizeUrl.length > 0) {
        this.linkedinOAuthAuthorizeUrlSignal.set(config.linkedinOAuthAuthorizeUrl);
      }
      if (typeof config.linkedinOAuthClientId === 'string' && config.linkedinOAuthClientId.length > 0) {
        this.linkedinOAuthClientIdSignal.set(config.linkedinOAuthClientId);
      }
      if (typeof config.linkedinOAuthRedirectUri === 'string' && config.linkedinOAuthRedirectUri.length > 0) {
        this.linkedinOAuthRedirectUriSignal.set(config.linkedinOAuthRedirectUri);
      }
      if (typeof config.linkedinOAuthScope === 'string' && config.linkedinOAuthScope.length > 0) {
        this.linkedinOAuthScopeSignal.set(config.linkedinOAuthScope);
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

  private resolveHideEspaceMembre(): boolean {
    if (typeof window !== 'undefined' && typeof window.__OEI_CONFIG__?.hideEspaceMembre === 'boolean') {
      return window.__OEI_CONFIG__.hideEspaceMembre;
    }
    return false;
  }

  private resolveLinkedinOAuthAuthorizeUrl(): string {
    if (typeof window !== 'undefined' && window.__OEI_CONFIG__?.linkedinOAuthAuthorizeUrl) {
      return window.__OEI_CONFIG__.linkedinOAuthAuthorizeUrl;
    }
    return DEFAULT_LINKEDIN_AUTHORIZE_URL;
  }

  private resolveLinkedinOAuthClientId(): string {
    if (typeof window !== 'undefined' && window.__OEI_CONFIG__?.linkedinOAuthClientId) {
      return window.__OEI_CONFIG__.linkedinOAuthClientId;
    }
    return '';
  }

  private resolveLinkedinOAuthRedirectUri(): string {
    if (typeof window !== 'undefined' && window.__OEI_CONFIG__?.linkedinOAuthRedirectUri) {
      return window.__OEI_CONFIG__.linkedinOAuthRedirectUri;
    }
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/espace-membre/smart-onboarding/linkedin/callback`;
    }
    return '/espace-membre/smart-onboarding/linkedin/callback';
  }

  private resolveLinkedinOAuthScope(): string {
    if (typeof window !== 'undefined' && window.__OEI_CONFIG__?.linkedinOAuthScope) {
      return window.__OEI_CONFIG__.linkedinOAuthScope;
    }
    return DEFAULT_LINKEDIN_SCOPE;
  }
}
