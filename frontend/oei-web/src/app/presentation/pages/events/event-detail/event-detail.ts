import { Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { form, FormField, required } from '@angular/forms/signals';
import { EventApplicationService } from '../../../../application/service/event-application.service';
import { EventRegistrationApplicationService } from '../../../../application/service/event-registration-application.service';
import { EventFeedApplicationService } from '../../../../application/service/event-feed-application.service';
import { EventPhotoConsentApplicationService } from '../../../../application/service/event-photo-consent-application.service';
import { KeycloakAuthService } from '../../../auth/keycloak-auth.service';
import { I18nService } from '../../../i18n/i18n.service';
import { EventComment } from '../../../../domain/model/event/event-comment';

interface FeedPostDraftFields {
  text: string;
  photoUrl: string;
}

const EMPTY_POST_DRAFT: FeedPostDraftFields = { text: '', photoUrl: '' };

// `/events/:slug` — hero, programme, speakers, lieu, horaires, CTA "Participer" and the live
// feed, per both spec docs. The feed only ever accepts new posts/comments within the event's own
// window (`EventFeedApplicationService.isFeedOpen`/`isCommentsOpen`); outside it, everything here
// renders read-only, matching "Après l'événement : feed en lecture seule".
@Component({
  selector: 'oei-event-detail',
  imports: [RouterLink, DatePipe, FormField],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.scss',
})
export class EventDetail {
  protected readonly i18n = inject(I18nService);
  protected readonly keycloakAuth = inject(KeycloakAuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventApplicationService);
  private readonly registrationService = inject(EventRegistrationApplicationService);
  private readonly feedService = inject(EventFeedApplicationService);
  private readonly photoConsentService = inject(EventPhotoConsentApplicationService);

  protected readonly isConnected = computed(() => this.keycloakAuth.isAuthenticated());

  private readonly slug = computed(() => this.route.snapshot.paramMap.get('slug') ?? '');

  private readonly eventResource = rxResource({
    params: () => this.slug(),
    stream: ({ params }) => this.eventService.getBySlug(params),
  });
  protected readonly event = computed(() => this.eventResource.value());
  protected readonly isLoading = computed(() => this.eventResource.isLoading());

  private readonly registrationResource = rxResource({
    params: () => (this.isConnected() ? this.event()?.id : undefined),
    stream: ({ params }) => this.registrationService.getMyRegistration(params!),
  });
  protected readonly isRegistered = computed(() => this.registrationResource.hasValue() && !!this.registrationResource.value());

  protected readonly registering = signal(false);
  protected readonly unregistering = signal(false);

  private readonly feedPostsResource = rxResource({
    params: () => this.event()?.id,
    stream: ({ params }) => this.feedService.listPosts(params!),
  });
  protected readonly posts = computed(() => this.feedPostsResource.value() ?? []);

  protected readonly isFeedOpen = computed(() => {
    const event = this.event();
    return !!event && this.feedService.isFeedOpen(event);
  });

  protected readonly isCommentsOpen = computed(() => {
    const event = this.event();
    return !!event && this.feedService.isCommentsOpen(event);
  });

  // Comments/posting are further restricted to members who actually registered `GOING` — a
  // visitor or a non-attending member can read the feed but never write to it (spec:
  // "Commentaires réservés aux membres ayant participé").
  protected readonly canParticipateInFeed = computed(() => this.isConnected() && this.isRegistered() && this.isFeedOpen());

  private readonly photoConsentResource = rxResource({
    params: () => (this.isConnected() ? this.event()?.id : undefined),
    stream: ({ params }) => this.photoConsentService.hasConsented(params!),
  });
  protected readonly hasPhotoConsent = computed(() => this.photoConsentResource.value() === true);

  protected readonly postSubmitting = signal(false);
  protected readonly postError = signal(false);
  private readonly postDraftModel = signal<FeedPostDraftFields>({ ...EMPTY_POST_DRAFT });
  protected readonly postForm = form(this.postDraftModel, (path) => {
    required(path.text);
  });

  // Comments render inline under each post (LinkedIn-style), not behind a click — so every
  // post's comments are fetched as soon as it appears in the feed, keyed by post id.
  protected readonly commentsByPost = signal<Record<string, EventComment[]>>({});
  protected readonly commentDraftByPost = signal<Record<string, string>>({});
  protected readonly commentSubmittingPostId = signal<string | null>(null);
  private readonly loadedCommentPostIds = new Set<string>();

  constructor() {
    effect(() => {
      const event = this.event();
      if (!event) {
        return;
      }
      for (const post of this.posts()) {
        if (this.loadedCommentPostIds.has(post.id)) {
          continue;
        }
        this.loadedCommentPostIds.add(post.id);
        this.feedService.listComments(event.id, post.id).subscribe((comments) => {
          this.commentsByPost.update((current) => ({ ...current, [post.id]: comments }));
        });
      }
    });
  }

  protected commentsFor(postId: string): EventComment[] {
    return this.commentsByPost()[postId] ?? [];
  }

  protected commentDraftFor(postId: string): string {
    return this.commentDraftByPost()[postId] ?? '';
  }

  protected setCommentDraft(postId: string, text: string): void {
    this.commentDraftByPost.update((current) => ({ ...current, [postId]: text }));
  }

  protected submitComment(postId: string): void {
    const event = this.event();
    const text = this.commentDraftFor(postId).trim();
    if (!event || !text || this.commentSubmittingPostId()) {
      return;
    }
    this.commentSubmittingPostId.set(postId);
    this.feedService.addComment(event.id, { postId, text }).subscribe({
      next: (comment) => {
        this.commentSubmittingPostId.set(null);
        this.setCommentDraft(postId, '');
        this.commentsByPost.update((current) => ({
          ...current,
          [postId]: [...(current[postId] ?? []), comment],
        }));
      },
      error: () => this.commentSubmittingPostId.set(null),
    });
  }

  protected register(): void {
    const event = this.event();
    if (!event || this.registering()) {
      return;
    }
    this.registering.set(true);
    this.registrationService.register(event.id).subscribe({
      next: () => {
        this.registering.set(false);
        this.registrationResource.reload();
      },
      error: () => this.registering.set(false),
    });
  }

  // Mirrors `register()`, per the design feedback that "Participer" behaves like a "like"
  // toggle: clicking it again while registered withdraws the registration instead of opening a
  // separate confirmation flow.
  protected unregister(): void {
    const event = this.event();
    if (!event || this.unregistering()) {
      return;
    }
    this.unregistering.set(true);
    this.registrationService.unregister(event.id).subscribe({
      next: () => {
        this.unregistering.set(false);
        this.registrationResource.reload();
      },
      error: () => this.unregistering.set(false),
    });
  }

  protected giveConsent(): void {
    const event = this.event();
    if (!event) {
      return;
    }
    this.photoConsentService.giveConsent(event.id).subscribe(() => this.photoConsentResource.reload());
  }

  protected submitPost(): void {
    const event = this.event();
    const draft = this.postDraftModel();
    if (!event || this.postSubmitting() || !draft.text.trim()) {
      return;
    }
    // A photo can only be attached once consent has been given for this event — the text-only
    // path always stays available, matching "distinguer le consentement... de l'inscription".
    const photoUrl = draft.photoUrl.trim() && this.hasPhotoConsent() ? draft.photoUrl.trim() : undefined;
    this.postSubmitting.set(true);
    this.postError.set(false);
    this.feedService.createPost(event.id, { text: draft.text, photoUrl }).subscribe({
      next: () => {
        this.postSubmitting.set(false);
        this.postDraftModel.set({ ...EMPTY_POST_DRAFT });
        this.feedPostsResource.reload();
      },
      error: () => {
        this.postSubmitting.set(false);
        this.postError.set(true);
      },
    });
  }

  protected likePost(postId: string): void {
    const event = this.event();
    if (!event) {
      return;
    }
    this.feedService.likePost(event.id, postId).subscribe(() => this.feedPostsResource.reload());
  }
}
