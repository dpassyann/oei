import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { form, FormField, required } from '@angular/forms/signals';
import { EventProposalApplicationService } from '../../../../application/service/event-proposal-application.service';
import { EventProposal } from '../../../../domain/model/event/event-proposal';
import { EventType } from '../../../../domain/model/event/event';
import { I18nService } from '../../../i18n/i18n.service';

interface EventProposalDraftFields {
  title: string;
  description: string;
  type: EventType;
  startAt: string;
  endAt: string;
  timezone: string;
  country: string;
  city: string;
  venue: string;
  onlineUrl: string;
  imageUrl: string;
}

const EMPTY_DRAFT: EventProposalDraftFields = {
  title: '',
  description: '',
  type: 'meetup',
  startAt: '',
  endAt: '',
  timezone: 'Europe/Paris',
  country: '',
  city: '',
  venue: '',
  onlineUrl: '',
  imageUrl: '',
};

export const EVENT_TYPES: readonly EventType[] = [
  'meetup',
  'colloque',
  'conference',
  'webinar',
  'workshop',
  'assemblee',
  'ceremonie',
  'networking',
];

// Member-facing event proposal form (docs "03-EVENTS-FEED-MODERATION-V2.md" §"Proposition
// membre") — mirrors `PublierArticle`'s pattern (Signal Forms draft + submission + "mes
// propositions" history) exactly. Submitting here only ever creates a proposal awaiting
// moderation (`MODERATOR_REVIEW` once the simulated AI precheck has run, see
// `EventProposalMockAdapter`) — it never publishes an event directly. That decision is a CMS
// concern built separately, see `presentation/pages/cms/cms-events-moderation/`.
@Component({
  selector: 'oei-proposer-evenement',
  imports: [FormField],
  templateUrl: './proposer-evenement.html',
  styleUrl: './proposer-evenement.scss',
})
export class ProposerEvenement {
  private readonly eventProposalService = inject(EventProposalApplicationService);
  protected readonly i18n = inject(I18nService);
  protected readonly eventTypes = EVENT_TYPES;

  protected readonly proposalsResource = rxResource({
    stream: () => this.eventProposalService.listMine(),
  });
  protected readonly proposals = computed<EventProposal[]>(() => this.proposalsResource.value() ?? []);

  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly submitError = signal(false);

  private readonly draftModel = signal<EventProposalDraftFields>({ ...EMPTY_DRAFT });
  protected readonly proposalForm = form(this.draftModel, (path) => {
    required(path.title);
    required(path.description);
    required(path.startAt);
    required(path.endAt);
    required(path.country);
  });

  protected submit(): void {
    if (this.submitting()) {
      return;
    }
    const draft = this.draftModel();
    if (!draft.title.trim() || !draft.description.trim() || !draft.startAt || !draft.endAt || !draft.country.trim()) {
      return;
    }
    // "Lieu physique OU lien Meetup/visio" — at least one of the two must be filled, otherwise
    // the moderator would have no way to know where the event actually happens.
    if (!draft.venue.trim() && !draft.onlineUrl.trim()) {
      this.submitError.set(true);
      return;
    }
    this.submitting.set(true);
    this.submitError.set(false);
    this.eventProposalService
      .submit({
        title: draft.title,
        description: draft.description,
        type: draft.type,
        startAt: draft.startAt,
        endAt: draft.endAt,
        timezone: draft.timezone,
        country: draft.country,
        city: draft.city || undefined,
        venue: draft.venue || undefined,
        onlineUrl: draft.onlineUrl || undefined,
        imageUrl: draft.imageUrl || undefined,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.submitted.set(true);
          this.draftModel.set({ ...EMPTY_DRAFT });
          this.proposalsResource.reload();
        },
        error: () => {
          this.submitting.set(false);
          this.submitError.set(true);
        },
      });
  }

  protected submitAnother(): void {
    this.submitted.set(false);
  }
}
