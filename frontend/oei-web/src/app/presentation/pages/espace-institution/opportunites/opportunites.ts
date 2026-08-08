import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { InstitutionOpportunitiesApplicationService } from '../../../../application/service/institution-opportunities-application.service';
import { InstitutionOpportunityType } from '../../../../domain/model/institution/institution-opportunity';
import { I18nService } from '../../../i18n/i18n.service';

const OPPORTUNITY_TYPES: readonly InstitutionOpportunityType[] = [
  'JOB',
  'INTERNSHIP',
  'MENTORING',
  'PRO_BONO',
  'WORKING_GROUP',
  'CALL_FOR_EXPERTS',
];

@Component({
  selector: 'oei-institution-opportunities',
  imports: [FormsModule],
  templateUrl: './opportunites.html',
  styleUrl: './opportunites.scss',
})
export class InstitutionOpportunitiesPage {
  private readonly opportunitiesService = inject(InstitutionOpportunitiesApplicationService);
  protected readonly i18n = inject(I18nService);

  protected readonly opportunityTypes = OPPORTUNITY_TYPES;

  private readonly refreshTrigger = signal(0);

  protected readonly newTitle = signal('');
  protected readonly newDescription = signal('');
  protected readonly newType = signal<InstitutionOpportunityType>('JOB');
  protected readonly newExpiresAt = signal('');

  private readonly opportunitiesResource = rxResource({
    params: () => this.refreshTrigger(),
    stream: () => this.opportunitiesService.listOpportunities(),
  });

  protected readonly opportunities = computed(() => this.opportunitiesResource.value() ?? []);

  protected createOpportunity(): void {
    const title = this.newTitle().trim();
    const description = this.newDescription().trim();
    if (!title || !description) {
      return;
    }
    const expiresAt = this.newExpiresAt().trim();
    this.opportunitiesService
      .createOpportunity({
        type: this.newType(),
        title,
        description,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      })
      .subscribe(() => {
        this.newTitle.set('');
        this.newDescription.set('');
        this.newExpiresAt.set('');
        this.refreshTrigger.update((value) => value + 1);
      });
  }

  protected close(id: string): void {
    this.opportunitiesService.closeOpportunity(id).subscribe(() => this.refreshTrigger.update((value) => value + 1));
  }
}
