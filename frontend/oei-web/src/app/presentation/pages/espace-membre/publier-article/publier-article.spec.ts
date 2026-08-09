import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { PublierArticle } from './publier-article';
import { ArticleSubmissionApplicationService } from '../../../../application/service/article-submission-application.service';
import { MembershipApplicationService } from '../../../../application/service/membership-application.service';
import { I18nService } from '../../../i18n/i18n.service';
import { ArticleSubmission } from '../../../../domain/model/article/article-submission';
import { Membership, MembershipStatus } from '../../../../domain/model/membership/membership';

const INTERFACE_STRINGS: Record<string, string> = {
  'espaceMembre.publier.title': 'Proposer un article',
  'espaceMembre.publier.intro': 'Rédigez votre article, il sera relu avant publication.',
  'espaceMembre.publier.fields.title': 'Titre',
  'espaceMembre.publier.fields.body': 'Contenu',
  'espaceMembre.publier.fields.bodyHint': 'Texte simple ou markdown.',
  'espaceMembre.publier.fields.coverImageUrl': "Image de couverture (optionnel)",
  'espaceMembre.publier.fields.coverImageUrlHint': 'URL de l’image.',
  'espaceMembre.publier.submit': 'Soumettre',
  'espaceMembre.publier.submitting': 'Envoi en cours…',
  'espaceMembre.publier.submitAnother': 'Proposer un autre article',
  'espaceMembre.publier.error': "L'envoi a échoué.",
  'espaceMembre.publier.pending.title': 'En attente de modération',
  'espaceMembre.publier.pending.body': 'Votre article a été transmis et sera publié après validation.',
  'espaceMembre.publier.mySubmissions.title': 'Mes propositions',
  'espaceMembre.publier.mySubmissions.empty': 'Vous n’avez encore soumis aucun article.',
  'espaceMembre.publier.status.pending': 'En attente',
  'espaceMembre.publier.status.approved': 'Publié',
  'espaceMembre.publier.status.rejected': 'Refusé',
  'espaceMembre.publier.submitBlocked': "La soumission d'article n'est pas disponible avec votre statut d'adhésion actuel.",
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

function buildSubmission(overrides: Partial<ArticleSubmission> = {}): ArticleSubmission {
  return {
    id: 'sub-1',
    title: 'Mon article',
    body: 'Corps de l’article.',
    authorId: 'demo-member-1',
    status: 'pending',
    submittedAt: '2026-08-01T09:00:00Z',
    ...overrides,
  };
}

function membershipFixture(status: MembershipStatus = 'ACTIVE'): Membership {
  return { memberId: 'demo-member-1', tier: 'SILVER', status, startedAt: '2026-01-01T00:00:00Z' };
}

describe('PublierArticle', () => {
  let submitSpy: ReturnType<typeof vi.fn>;
  let listMineSpy: ReturnType<typeof vi.fn>;

  function configure(mine: ArticleSubmission[] = [], membershipStatus: MembershipStatus = 'ACTIVE') {
    submitSpy = vi.fn((draft) => of(buildSubmission(draft)));
    listMineSpy = vi.fn(() => of(mine));

    TestBed.configureTestingModule({
      imports: [PublierArticle],
      providers: [
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: ArticleSubmissionApplicationService, useValue: { submit: submitSpy, listMine: listMineSpy } },
        {
          provide: MembershipApplicationService,
          useValue: { getMembership: () => of(membershipFixture(membershipStatus)) },
        },
      ],
    });
  }

  it('givenNoPriorSubmissions_whenRendered_thenShowsEmptyHistory', async () => {
    configure([]);
    const fixture = TestBed.createComponent(PublierArticle);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Vous n’avez encore soumis aucun article.');
  });

  it('givenValidDraft_whenSubmitted_thenShowsPendingModerationBannerAndResetsForm', async () => {
    configure([]);
    const fixture = TestBed.createComponent(PublierArticle);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component['draftModel'].set({ title: 'Titre test', body: 'Corps test', coverImageUrl: '' });
    component['submit']();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(submitSpy).toHaveBeenCalledWith({ title: 'Titre test', body: 'Corps test', coverImageUrl: undefined });
    expect(component['submitted']()).toBe(true);
    expect(compiled.textContent).toContain('En attente de modération');
  });

  it('givenEmptyTitle_whenSubmitCalled_thenDoesNotCallService', () => {
    configure([]);
    const fixture = TestBed.createComponent(PublierArticle);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component['draftModel'].set({ title: '', body: 'Corps', coverImageUrl: '' });
    component['submit']();

    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('givenServiceFails_whenSubmitted_thenShowsErrorAndStaysInFormMode', async () => {
    submitSpy = vi.fn(() => throwError(() => new Error('boom')));
    listMineSpy = vi.fn(() => of([]));
    TestBed.configureTestingModule({
      imports: [PublierArticle],
      providers: [
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: ArticleSubmissionApplicationService, useValue: { submit: submitSpy, listMine: listMineSpy } },
        { provide: MembershipApplicationService, useValue: { getMembership: () => of(membershipFixture()) } },
      ],
    });
    const fixture = TestBed.createComponent(PublierArticle);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component['draftModel'].set({ title: 'Titre', body: 'Corps', coverImageUrl: '' });
    component['submit']();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(component['submitted']()).toBe(false);
    expect(compiled.querySelector('.oei-publier__error')).toBeTruthy();
  });

  it('givenPriorSubmissions_whenRendered_thenListsThemWithStatus', async () => {
    configure([buildSubmission({ status: 'approved', title: 'Article publié' })]);
    const fixture = TestBed.createComponent(PublierArticle);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Article publié');
    expect(compiled.textContent).toContain('Publié');
  });

  it('givenExpiredMembership_whenRendered_thenDisablesSubmissionAndShowsExplicitMessage', async () => {
    configure([], 'EXPIRED');
    const fixture = TestBed.createComponent(PublierArticle);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-publier__submit-blocked')).toBeTruthy();
    expect(compiled.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(true);
  });

  it('givenExpiredMembership_whenSubmitCalledDirectly_thenDoesNotCallService', async () => {
    configure([], 'EXPIRED');
    const fixture = TestBed.createComponent(PublierArticle);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component['draftModel'].set({ title: 'Titre', body: 'Corps', coverImageUrl: '' });
    component['submit']();

    expect(submitSpy).not.toHaveBeenCalled();
  });
});
