import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InstitutionAffiliationsApplicationService } from '../../../../application/service/institution-affiliations-application.service';
import { InstitutionInvitationsApplicationService } from '../../../../application/service/institution-invitations-application.service';
import { INSTITUTION_ROLES, InstitutionRole } from '../../../../domain/model/institution/institution-role';
import { I18nService } from '../../../i18n/i18n.service';

@Component({
  selector: 'oei-institution-members',
  imports: [RouterLink, FormsModule],
  templateUrl: './membres.html',
  styleUrl: './membres.scss',
})
export class InstitutionMembers {
  private readonly affiliationsService = inject(InstitutionAffiliationsApplicationService);
  private readonly invitationsService = inject(InstitutionInvitationsApplicationService);
  protected readonly i18n = inject(I18nService);

  protected readonly institutionRoles = INSTITUTION_ROLES;

  // Incrémenté après chaque action (invite/approve/reject/end) pour forcer le rechargement des
  // ressources — pattern `rxResource` sans état de service mutable exposé au composant.
  private readonly refreshTrigger = signal(0);

  protected readonly inviteEmail = signal('');
  protected readonly inviteRole = signal<InstitutionRole>('READER');

  private readonly membersResource = rxResource({
    params: () => this.refreshTrigger(),
    stream: () => this.affiliationsService.listMembers(),
  });

  private readonly requestsResource = rxResource({
    params: () => this.refreshTrigger(),
    stream: () => this.affiliationsService.listAffiliationRequests(),
  });

  protected readonly members = computed(() => this.membersResource.value() ?? []);
  protected readonly pendingRequests = computed(
    () => (this.requestsResource.value() ?? []).filter((affiliation) => affiliation.status === 'PENDING'),
  );

  protected sendInvitation(): void {
    const email = this.inviteEmail().trim();
    if (!email) {
      return;
    }
    this.invitationsService
      .createInvitation({ email, role: this.inviteRole() })
      .subscribe(() => {
        this.inviteEmail.set('');
        this.refreshTrigger.update((value) => value + 1);
      });
  }

  protected approve(id: string): void {
    this.affiliationsService.approveAffiliation(id).subscribe(() => this.refreshTrigger.update((value) => value + 1));
  }

  protected reject(id: string): void {
    this.affiliationsService.rejectAffiliation(id).subscribe(() => this.refreshTrigger.update((value) => value + 1));
  }

  protected endAffiliation(id: string): void {
    this.affiliationsService.endAffiliation(id).subscribe(() => this.refreshTrigger.update((value) => value + 1));
  }
}
