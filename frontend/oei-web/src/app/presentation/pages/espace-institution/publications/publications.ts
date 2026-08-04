import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InstitutionPublicationsApplicationService } from '../../../../application/service/institution-publications-application.service';
import { InstitutionPublicationType, PUBLICATION_WORKFLOW_STEPS } from '../../../../domain/model/institution/institution-publication';
import { I18nService } from '../../../i18n/i18n.service';

const PUBLICATION_TYPES: readonly InstitutionPublicationType[] = [
  'OPINION',
  'EXPERIENCE_REPORT',
  'CIO_DECISION',
  'STUDY',
  'REPORT',
  'EVENT',
  'TRAINING',
  'OPPORTUNITY',
];

@Component({
  selector: 'oei-institution-publications',
  imports: [RouterLink, FormsModule],
  templateUrl: './publications.html',
  styleUrl: './publications.scss',
})
export class InstitutionPublicationsPage {
  private readonly publicationsService = inject(InstitutionPublicationsApplicationService);
  protected readonly i18n = inject(I18nService);

  protected readonly publicationTypes = PUBLICATION_TYPES;
  protected readonly workflowSteps = PUBLICATION_WORKFLOW_STEPS;

  private readonly refreshTrigger = signal(0);

  protected readonly newTitle = signal('');
  protected readonly newBody = signal('');
  protected readonly newType = signal<InstitutionPublicationType>('OPINION');

  private readonly publicationsResource = rxResource({
    params: () => this.refreshTrigger(),
    stream: () => this.publicationsService.listPublications(),
  });

  protected readonly publications = computed(() => this.publicationsResource.value() ?? []);

  protected createPublication(): void {
    const title = this.newTitle().trim();
    const body = this.newBody().trim();
    if (!title || !body) {
      return;
    }
    this.publicationsService.createPublication({ type: this.newType(), title, body }).subscribe(() => {
      this.newTitle.set('');
      this.newBody.set('');
      this.refreshTrigger.update((value) => value + 1);
    });
  }

  protected submit(id: string): void {
    this.publicationsService.submitPublication(id).subscribe(() => this.refreshTrigger.update((value) => value + 1));
  }
}
