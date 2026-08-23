import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';
import { MemberBootstrapApplicationService } from './member-bootstrap-application.service';
import { MemberBootstrap, ProfileStatus } from '../../domain/model/profile/member-bootstrap';

@Injectable({ providedIn: 'root' })
export class MemberOnboardingFlowService {
  private readonly bootstrapService = inject(MemberBootstrapApplicationService);

  private readonly bootstrapSignal = signal<MemberBootstrap | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly failedSignal = signal(false);

  readonly bootstrap = this.bootstrapSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly failed = this.failedSignal.asReadonly();
  readonly profileStatus = computed<ProfileStatus | null>(() => this.bootstrapSignal()?.profileStatus ?? null);
  readonly needsOnboarding = computed(() => {
    const status = this.profileStatus();
    return status === 'ONBOARDING_REQUIRED' || status === 'ONBOARDING_IN_PROGRESS';
  });

  refresh() {
    this.loadingSignal.set(true);
    this.failedSignal.set(false);
    return this.bootstrapService.getBootstrap().pipe(
      tap((bootstrap) => this.bootstrapSignal.set(bootstrap)),
      map(() => true),
      catchError(() => {
        this.failedSignal.set(true);
        return of(true);
      }),
      tap(() => this.loadingSignal.set(false)),
    );
  }
}

