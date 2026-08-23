import { inject, Service } from '@angular/core';
import { RuntimeConfig } from '../config/runtime-config';

const LINKEDIN_OAUTH_STATE_KEY = 'oei_linkedin_oauth_state';

function isPlaceholderClientId(clientId: string): boolean {
  return clientId.toLowerCase().includes('placeholder');
}

type LinkedinCallbackResult =
  | { ok: true; code: string }
  | { ok: false; error: string };

@Service()
export class LinkedinOAuthService {
  private readonly runtimeConfig = inject(RuntimeConfig);

  startAuthorizationFlow(): void {
    const clientId = this.runtimeConfig.linkedinOAuthClientId().trim();
    if (!clientId || isPlaceholderClientId(clientId)) {
      throw new Error(
        'Configuration LinkedIn invalide: renseignez linkedinOAuthClientId avec une vraie valeur dans public/config.json (ou /config).',
      );
    }

    const state = crypto.randomUUID();
    sessionStorage.setItem(LINKEDIN_OAUTH_STATE_KEY, state);

    const authorizeUrl = new URL(this.runtimeConfig.linkedinOAuthAuthorizeUrl());
    authorizeUrl.searchParams.set('response_type', 'code');
    authorizeUrl.searchParams.set('client_id', clientId);
    authorizeUrl.searchParams.set('redirect_uri', this.runtimeConfig.linkedinOAuthRedirectUri());
    authorizeUrl.searchParams.set('scope', this.runtimeConfig.linkedinOAuthScope());
    authorizeUrl.searchParams.set('state', state);

    window.location.assign(authorizeUrl.toString());
  }

  parseCallback(searchParams: URLSearchParams): LinkedinCallbackResult {
    const error = searchParams.get('error');
    if (error) {
      const description = searchParams.get('error_description') ?? 'Erreur OAuth LinkedIn.';
      return { ok: false, error: description };
    }

    const code = searchParams.get('code')?.trim();
    const returnedState = searchParams.get('state')?.trim();
    const expectedState = sessionStorage.getItem(LINKEDIN_OAUTH_STATE_KEY)?.trim();
    sessionStorage.removeItem(LINKEDIN_OAUTH_STATE_KEY);

    if (!code) {
      return { ok: false, error: 'Callback LinkedIn invalide: code manquant.' };
    }
    if (!returnedState || !expectedState || returnedState !== expectedState) {
      return { ok: false, error: 'Callback LinkedIn invalide: state OAuth non valide.' };
    }

    return { ok: true, code };
  }
}

