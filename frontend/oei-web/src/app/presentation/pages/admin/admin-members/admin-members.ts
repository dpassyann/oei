import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AdminMembersApplicationService } from '../../../../application/service/admin-members-application.service';
import { AdminMemberSummary } from '../../../../domain/model/admin/admin-member';
import { I18nService } from '../../../i18n/i18n.service';

/**
 * Admin console members page (task brief §Membres): dues-status overview plus the four
 * operational actions the brief calls out — resync a payment, suspend/lift suspension, and set an
 * exceptional status. Fixes the previously-broken `/admin/members` sidebar link
 * (`AdminLayout`'s `NAV_ENTRIES` pointed here before this page existed).
 */
@Component({
  selector: 'oei-admin-members',
  imports: [FormsModule],
  templateUrl: './admin-members.html',
  styleUrl: './admin-members.scss',
})
export class AdminMembers {
  private readonly membersService = inject(AdminMembersApplicationService);
  protected readonly i18n = inject(I18nService);

  private readonly membersResource = rxResource({
    params: () => true,
    stream: () => this.membersService.list(),
  });

  protected readonly members = computed(() => this.membersResource.value() ?? []);

  protected readonly suspendingId = signal<string | null>(null);
  protected readonly suspendReason = signal('');
  protected readonly suspendValidationError = signal(false);
  protected readonly actionErrorId = signal<string | null>(null);
  protected readonly busyId = signal<string | null>(null);

  protected resyncPayment(member: AdminMemberSummary): void {
    this.runAction(member, () => this.membersService.resyncPayment(member));
  }

  protected liftSuspension(member: AdminMemberSummary): void {
    this.runAction(member, () => this.membersService.liftSuspension(member));
  }

  protected setExceptionalStatus(member: AdminMemberSummary, status: 'EXCEPTIONAL_FREE' | 'EXCEPTIONAL_HONORARY'): void {
    this.runAction(member, () => this.membersService.setExceptionalStatus(member, status));
  }

  protected startSuspend(member: AdminMemberSummary): void {
    this.suspendingId.set(member.id);
    this.suspendReason.set('');
    this.suspendValidationError.set(false);
  }

  protected cancelSuspend(): void {
    this.suspendingId.set(null);
    this.suspendReason.set('');
    this.suspendValidationError.set(false);
  }

  protected confirmSuspend(member: AdminMemberSummary): void {
    const reason = this.suspendReason().trim();
    if (!reason) {
      this.suspendValidationError.set(true);
      return;
    }
    this.suspendValidationError.set(false);
    this.runAction(member, () => this.membersService.suspend(member, reason));
    this.suspendingId.set(null);
    this.suspendReason.set('');
  }

  private runAction(member: AdminMemberSummary, call: () => Observable<AdminMemberSummary>): void {
    this.actionErrorId.set(null);
    this.busyId.set(member.id);
    call().subscribe({
      next: () => {
        this.busyId.set(null);
        this.membersResource.reload();
      },
      error: () => {
        this.busyId.set(null);
        this.actionErrorId.set(member.id);
      },
    });
  }
}
