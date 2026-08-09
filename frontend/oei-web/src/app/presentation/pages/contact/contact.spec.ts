import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Contact } from './contact';
import { MarkdownDocumentApplicationService } from '../../../application/service/markdown-document-application.service';
import { I18nService } from '../../i18n/i18n.service';
import { createDocument } from '../../../domain/model/document';
import { CONTACT_PORT } from '../../../domain/port/contact.port';

const INTERFACE_STRINGS: Record<string, string> = {
  'contact.title': 'Contact',
  'contact.bodyPrefix': 'Pour toute question, écrivez-nous à',
  'contact.note': 'Vous pouvez aussi nous écrire directement via le formulaire ci-dessous.',
  'contact.form.fields.name': 'Nom',
  'contact.form.fields.email': 'Email',
  'contact.form.fields.subject': 'Sujet',
  'contact.form.fields.message': 'Message',
  'contact.form.submit': 'Envoyer',
  'contact.form.submitting': 'Envoi en cours…',
  'contact.form.success': 'Votre message a bien été envoyé. Nous vous répondrons dans les meilleurs délais.',
  'contact.form.sendAnother': 'Envoyer un autre message',
  'contact.form.error': "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
  'contact.institutional.heading': 'Contact institutionnel',
  'contact.institutional.loading': 'Chargement…',
  'contact.institutional.fallbackNotice':
    'Traduction non disponible pour le moment — version française affichée en attendant.',
  'contact.contribute.heading': 'Contribuer au corpus',
  'contact.contribute.loading': 'Chargement…',
  'contact.contribute.fallbackNotice':
    'Traduction non disponible pour le moment — version française affichée en attendant.',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

const INSTITUTIONAL_MARKDOWN = [
  "## À qui s'adresse cette page",
  '',
  "Cette page s'adresse aux interlocuteurs institutionnels de l'OEI.",
].join('\n');

const CONTRIBUTE_MARKDOWN = [
  '## Un Livre blanc pensé pour être corrigé',
  '',
  'Le Livre blanc de l\'OEI est aujourd\'hui dans sa version 3.1.',
].join('\n');

function fakeMarkdownDocuments() {
  return {
    getMarkdownDocument: (path: string) => {
      const body = path.includes('contact-institutionnel')
        ? INSTITUTIONAL_MARKDOWN
        : CONTRIBUTE_MARKDOWN;
      return of(
        createDocument({ slug: path, lang: 'fr', title: '', body, isFallback: false }),
      );
    },
  };
}

function fakeContactPort(options?: { fails?: boolean }) {
  return {
    submit: () => (options?.fails ? throwError(() => new Error('failed')) : of(undefined)),
  };
}

describe('Contact', () => {
  it('givenComponent_whenCreated_thenRendersHeadingMailtoLinkAndFormNote', () => {
    TestBed.configureTestingModule({
      imports: [Contact],
      providers: [
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: MarkdownDocumentApplicationService, useValue: fakeMarkdownDocuments() },
        { provide: CONTACT_PORT, useValue: fakeContactPort() },
      ],
    });
    const fixture = TestBed.createComponent(Contact);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('Contact');
    const link = compiled.querySelector<HTMLAnchorElement>('.oei-page__link');
    expect(link?.getAttribute('href')).toMatch(/^mailto:/);
    expect(compiled.querySelector('.oei-page__note')?.textContent).toContain('formulaire ci-dessous');
  });

  function fillAndSubmit(compiled: HTMLElement): void {
    const [nameInput, emailInput] = compiled.querySelectorAll<HTMLInputElement>(
      '.oei-contact-form__field input',
    );
    const messageInput = compiled.querySelector<HTMLTextAreaElement>('.oei-contact-form__field textarea');
    nameInput.value = 'Ada Lovelace';
    nameInput.dispatchEvent(new Event('input'));
    emailInput.value = 'ada@example.com';
    emailInput.dispatchEvent(new Event('input'));
    messageInput!.value = 'Bonjour, ceci est un message de test.';
    messageInput!.dispatchEvent(new Event('input'));
    compiled.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
  }

  it('givenValidForm_whenSubmitted_thenCallsPortAndShowsSuccess', async () => {
    const submit = vi.fn().mockReturnValue(of(undefined));
    TestBed.configureTestingModule({
      imports: [Contact],
      providers: [
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: MarkdownDocumentApplicationService, useValue: fakeMarkdownDocuments() },
        { provide: CONTACT_PORT, useValue: { submit } },
      ],
    });
    const fixture = TestBed.createComponent(Contact);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    fillAndSubmit(compiled);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        message: 'Bonjour, ceci est un message de test.',
      }),
    );
    expect(compiled.querySelector('.oei-contact-form__success')?.textContent).toContain('bien été envoyé');
  });

  it('givenPortFails_whenSubmitted_thenShowsError', async () => {
    TestBed.configureTestingModule({
      imports: [Contact],
      providers: [
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: MarkdownDocumentApplicationService, useValue: fakeMarkdownDocuments() },
        { provide: CONTACT_PORT, useValue: fakeContactPort({ fails: true }) },
      ],
    });
    const fixture = TestBed.createComponent(Contact);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    fillAndSubmit(compiled);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.querySelector('.oei-contact-form__error')?.textContent).toContain('erreur');
  });

  it('givenDocumentsLoad_whenCreated_thenRendersBothInstitutionalAndContributeBlocks', async () => {
    TestBed.configureTestingModule({
      imports: [Contact],
      providers: [
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: MarkdownDocumentApplicationService, useValue: fakeMarkdownDocuments() },
        { provide: CONTACT_PORT, useValue: fakeContactPort() },
      ],
    });
    const fixture = TestBed.createComponent(Contact);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const blocks = compiled.querySelectorAll('.oei-contact-block');
    expect(blocks.length).toBe(2);
    expect(blocks[0].textContent).toContain('Contact institutionnel');
    expect(blocks[0].textContent).toContain("interlocuteurs institutionnels de l'OEI");
    expect(blocks[1].textContent).toContain('Contribuer au corpus');
    expect(blocks[1].textContent).toContain('version 3.1');
  });
});
