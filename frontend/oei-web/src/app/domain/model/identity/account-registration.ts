import { SupportedLanguage } from '../document';

// Mirrors the OpenAPI `AccountRegistration` schema (`openapi/oei-api.yaml`,
// `POST /api/public/v1/accounts`). Account creation is free — no cotisation is collected
// nor required at this step (see `MembershipFeePort` for the separate, optional cotisation
// payment flow).
export interface AccountRegistration {
  readonly email: string;
  readonly locale: SupportedLanguage;
  readonly country: string;
  readonly consentAccepted: boolean;
  readonly oidcSubject?: string;
}
