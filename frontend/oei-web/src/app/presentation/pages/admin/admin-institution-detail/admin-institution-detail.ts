import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { Observable } from 'rxjs';
import { AdminInstitutionsApplicationService } from '../../../../application/service/admin-institutions-application.service';
import { Institution } from '../../../../domain/model/institution/institution';
import { InstitutionWorkflowActionName } from '../../../../domain/model/institution/institution-workflow';
import { I18nService } from '../../../i18n/i18n.service';

/**
 * Institution admin detail page: current status, workflow action buttons gated by
 * `availableActions` (task brief point: "Approve/activate/suspend/revoke actions on an
 * institution detail/admin page"), and a mandatory reason field for revoke — enforced both here
 * (form validation) and in the pure domain function (`revoke()` throws on an empty reason).
 */
@Component({
  selector: 'oei-admin-institution-detail',
  imports: [FormsModule],
  templateUrl: './admin-institution-detail.html',
  styleUrl: './admin-institution-detail.scss',
})
export class AdminInstitutionDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly institutionsService = inject(AdminInstitutionsApplicationService);
  protected readonly i18n = inject(I18nService);

  protected readonly institutionId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? '')), { initialValue: '' });

  private readonly institutionResource = rxResource({
    params: () => this.institutionId() || undefined,
    stream: ({ params }) => this.institutionsService.getById(params as string),
  });

  protected readonly institution = computed(() => this.institutionResource.value());
  protected readonly notFound = computed(() => !this.institutionResource.isLoading() && !this.institution());

  protected readonly availableActions = computed<readonly InstitutionWorkflowActionName[]>(() => {
    const institution = this.institution();
    return institution ? this.institutionsService.availableActions(institution) : [];
  });

  protected readonly revokeReason = signal('');
  protected readonly showRevokeForm = signal(false);
  protected readonly revokeValidationError = signal(false);
  protected readonly actionError = signal(false);

  protected hasAction(action: InstitutionWorkflowActionName): boolean {
    return this.availableActions().includes(action);
  }

  approve(): void {
    this.runAction((institution) => this.institutionsService.approve(institution));
  }

  activate(): void {
    this.runAction((institution) => this.institutionsService.activate(institution));
  }

  suspend(): void {
    this.runAction((institution) => this.institutionsService.suspend(institution));
  }

  openRevokeForm(): void {
    this.showRevokeForm.set(true);
    this.revokeValidationError.set(false);
  }

  cancelRevoke(): void {
    this.showRevokeForm.set(false);
    this.revokeReason.set('');
  }

  confirmRevoke(): void {
    if (!this.revokeReason().trim()) {
      this.revokeValidationError.set(true);
      return;
    }
    this.revokeValidationError.set(false);
    this.runAction((institution) => this.institutionsService.revoke(institution, this.revokeReason().trim()));
    this.showRevokeForm.set(false);
    this.revokeReason.set('');
  }

  private runAction(call: (institution: Institution) => Observable<Institution>): void {
    const institution = this.institution();
    if (!institution) {
      return;
    }
    this.actionError.set(false);
    call(institution).subscribe({
      next: () => this.institutionResource.reload(),
      error: () => this.actionError.set(true),
    });
  }
}
