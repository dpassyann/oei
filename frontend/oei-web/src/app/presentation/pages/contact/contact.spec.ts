import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Contact } from './contact';
import { MarkdownDocumentApplicationService } from '../../../application/service/markdown-document-application.service';
import { I18nService } from '../../i18n/i18n.service';
import { createDocument } from '../../../domain/model/document';

const INTERFACE_STRINGS: Record<string, string> = {
  'contact.title': 'Contact',
  'contact.bodyPrefix': 'Pour toute question, écrivez-nous à',
  'contact.note': 'Un formulaire de contact dédié est prévu dans une prochaine version du site.',
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

describe('Contact', () => {
  it('givenComponent_whenCreated_thenRendersHeadingMailtoLinkAndFormPlannedNote', () => {
    TestBed.configureTestingModule({
      imports: [Contact],
      providers: [
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: MarkdownDocumentApplicationService, useValue: fakeMarkdownDocuments() },
      ],
    });
    const fixture = TestBed.createComponent(Contact);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('Contact');
    const link = compiled.querySelector<HTMLAnchorElement>('.oei-page__link');
    expect(link?.getAttribute('href')).toMatch(/^mailto:/);
    expect(compiled.querySelector('.oei-page__note')?.textContent).toContain('formulaire de contact');
  });

  it('givenDocumentsLoad_whenCreated_thenRendersBothInstitutionalAndContributeBlocks', async () => {
    TestBed.configureTestingModule({
      imports: [Contact],
      providers: [
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: MarkdownDocumentApplicationService, useValue: fakeMarkdownDocuments() },
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
