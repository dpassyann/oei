import { Component, DestroyRef, computed, effect, inject, input, output, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import { ProfileImportApplicationService } from '../../../../application/service/profile-import-application.service';
import { MembershipEntitlementService } from '../../../../application/service/membership-entitlement.service';
import { LinkedinOAuthService } from '../../../../infrastructure/auth/linkedin-oauth.service';
import { I18nService } from '../../../i18n/i18n.service';
import { ProfileImport, PROCESSING_STEP_LABELS } from '../../../../domain/model/profile/profile-import';
import { ProfessionalProfile } from '../../../../domain/model/profile/professional-profile';

export type SmartOnboardingStep =
  | 'SOURCE_SELECTION'      // Choose: LinkedIn or CV
  | 'LINKEDIN_BASIC'        // LinkedIn OAuth (basic identity)
  | 'CV_UPLOAD'             // File upload with consent
  | 'ENTITLEMENT_CHECK'     // Check AI_CV_IMPORT entitlement
  | 'PAYMENT_REQUIRED'      // Non-member: €2.90 payment
  | 'PROCESSING'            // Async AI processing
  | 'REVIEW'                // Review extracted draft
  | 'COMPLETED';            // Profile created

const CONSENT_VERSION = '1.0';
const SMART_CV_IMPORT_PRICE = 2.90;
const SMART_CV_IMPORT_CURRENCY = 'EUR';

// Polling interval for import status (ms)
const POLLING_INTERVAL_MS = 2000;
const PROFILE_IMPORT_TERMINAL_STATUS_SET: ReadonlySet<ProfileImport['status']> = new Set([
  'REVIEW_REQUIRED',
  'FAILED',
  'EXPIRED',
]);

@Component({
  selector: 'oei-smart-onboarding',
  templateUrl: './smart-onboarding.html',
  styleUrl: './smart-onboarding.scss',
  providers: [MembershipEntitlementService],
})
export class SmartOnboarding {
  private readonly importService = inject(ProfileImportApplicationService);
  private readonly entitlements = inject(MembershipEntitlementService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly linkedinOAuth = inject(LinkedinOAuthService);
  protected readonly i18n = inject(I18nService);

  /** Emitted when onboarding completes successfully. */
  readonly completed = output<void>();
  readonly initialSource = input<'CV' | 'LINKEDIN' | undefined>(undefined);

  protected readonly price = SMART_CV_IMPORT_PRICE;
  protected readonly currency = SMART_CV_IMPORT_CURRENCY;

  protected readonly step = signal<SmartOnboardingStep>('SOURCE_SELECTION');
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly consentAccepted = signal(false);
  protected readonly currentImport = signal<ProfileImport | null>(null);
  protected readonly draft = signal<ProfessionalProfile | null>(null);
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  /** True if the member has the AI_CV_IMPORT entitlement (active membership). */
  protected readonly hasAiCvImportEntitlement = computed(() =>
    this.entitlements.has('AI_CV_IMPORT'),
  );
  protected readonly membershipLoadFailed = computed(() => this.entitlements.loadFailed());

  protected readonly processingLabel = computed(() => {
    const imp = this.currentImport();
    if (!imp) return '';
    return imp.processingStepLabel ?? PROCESSING_STEP_LABELS[imp.status] ?? '';
  });

  protected readonly isProcessingComplete = computed(() => {
    const imp = this.currentImport();
    return imp?.status === 'REVIEW_REQUIRED';
  });

  private startedFromInitialSource = false;

  constructor() {
    this.consumeLinkedinCallbackResult();
    effect(() => {
      if (this.startedFromInitialSource || this.step() !== 'SOURCE_SELECTION') {
        return;
      }
      const source = this.initialSource();
      if (source === 'CV') {
        this.startedFromInitialSource = true;
        this.selectCv();
      } else if (source === 'LINKEDIN') {
        this.startedFromInitialSource = true;
        this.selectLinkedIn();
      }
    });
  }

  // ── Step navigation ────────────────────────────────────────────────────

  protected selectLinkedIn(): void {
    this.error.set(null);
    this.step.set('LINKEDIN_BASIC');
  }

  protected selectCv(): void {
    this.error.set(null);
    this.selectedFile.set(null);
    this.consentAccepted.set(false);
    if (this.membershipLoadFailed()) {
      this.error.set(`Impossible de vérifier votre adhésion pour le moment. Réessayez dans quelques secondes.`);
      return;
    }
    if (this.hasAiCvImportEntitlement()) {
      this.step.set('CV_UPLOAD');
    } else {
      this.step.set('ENTITLEMENT_CHECK');
    }
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile.set(file);
  }

  protected proceedToPayment(): void {
    this.error.set(null);
    this.step.set('PAYMENT_REQUIRED');
  }

  protected simulatePayment(): void {
    // V1: Mock payment — in production this would redirect to the PSP hosted page.
    // After payment confirmation (webhook), the AI_CV_IMPORT entitlement is granted.
    // For the mock, we proceed directly.
    this.step.set('CV_UPLOAD');
  }

  protected startCvImport(): void {
    if (this.submitting()) {
      return;
    }
    const file = this.selectedFile();
    if (!file || !this.consentAccepted()) {
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    this.currentImport.set(null);
    this.draft.set(null);

    this.importService.initiateCvImport(file, CONSENT_VERSION).subscribe({
      next: (imp) => {
        this.currentImport.set(imp);
        this.submitting.set(false);
        this.step.set('PROCESSING');
        this.startPolling(imp.id);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(this.normalizeImportError(err));
      },
    });
  }

  protected loadDraftAndReview(): void {
    const imp = this.currentImport();
    if (!imp) return;
    this.submitting.set(true);

    this.importService.getImportDraft(imp.id).subscribe({
      next: (draft) => {
        this.draft.set(draft);
        this.submitting.set(false);
        this.step.set('REVIEW');
      },
      error: () => {
        this.submitting.set(false);
        this.error.set('Impossible de charger le brouillon extrait.');
      },
    });
  }

  protected confirmImport(): void {
    const imp = this.currentImport();
    if (!imp) return;
    this.submitting.set(true);

    this.importService.confirmImport(imp.id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.step.set('COMPLETED');
      },
      error: () => {
        this.submitting.set(false);
        this.error.set('Erreur lors de la confirmation du profil.');
      },
    });
  }

  protected finishLinkedIn(): void {
    if (this.submitting()) {
      return;
    }
    this.error.set(null);
    try {
      this.linkedinOAuth.startAuthorizationFlow();
    } catch (err) {
      const message = err instanceof Error ? err.message : `Impossible de demarrer la connexion LinkedIn.`;
      this.error.set(message);
    }
  }

  protected navigateToProfile(): void {
    this.completed.emit();
    this.router.navigate(['/espace-membre/profil']);
  }

  protected navigateToManualOnboarding(): void {
    this.router.navigate(['/espace-membre/inscription']);
  }

  // ── Private helpers ────────────────────────────────────────────────────

  private startPolling(importId: string): void {
    interval(POLLING_INTERVAL_MS)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => this.importService.getImport(importId)),
        takeWhile(
          (imp) => !PROFILE_IMPORT_TERMINAL_STATUS_SET.has(imp.status),
          true, // emit the terminal value too
        ),
      )
      .subscribe({
        next: (imp) => {
          this.currentImport.set(imp);
          if (imp.status === 'REVIEW_REQUIRED') {
            this.loadDraftAndReview();
          } else if (imp.status === 'FAILED' || imp.status === 'EXPIRED') {
            this.error.set(`L'import a échoué. Veuillez réessayer.`);
            this.step.set('CV_UPLOAD');
          }
        },
        error: () => {
          this.error.set(`Impossible de suivre l'avancement de l'import.`);
          this.step.set('CV_UPLOAD');
        },
      });
  }

  private normalizeImportError(error: unknown): string {
    if (typeof error === 'object' && error !== null) {
      const backendError = error as { status?: number; error?: { detail?: string } };
      if (backendError.status === 402) {
        return `Votre adhésion n'inclut pas encore l'import CV intelligent.`;
      }
      if (backendError.error?.detail) {
        return backendError.error.detail;
      }
    }
    return `Une erreur est survenue lors de l'import.`;
  }

  private consumeLinkedinCallbackResult(): void {
    const query = this.route.snapshot.queryParamMap;
    const imported = query.get('linkedin') === 'success';
    const callbackError = query.get('linkedinError');
    if (!imported && !callbackError) {
      return;
    }

    if (imported) {
      this.error.set(null);
      this.step.set('COMPLETED');
    } else if (callbackError) {
      this.error.set(callbackError);
      this.step.set('LINKEDIN_BASIC');
    }

    this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: {},
    });
  }
}

