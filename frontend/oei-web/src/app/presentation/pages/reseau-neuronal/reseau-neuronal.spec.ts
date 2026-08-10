import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ReseauNeuronal } from './reseau-neuronal';
import { I18nService } from '../../i18n/i18n.service';
import { NETWORK_GRAPH_PORT } from '../../../domain/port/network/network-graph.port';

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => key,
  translateList: () => [],
};

// Empty (but responsive) fake — the tests here only exercise the page's own chrome logic, not
// `NetworkCanvas`'s progressive loading (see `network-canvas.spec.ts` for that), so `listDomains`
// resolving to an empty array is enough to let the component tree render without errors.
const FAKE_NETWORK_GRAPH_PORT = {
  listDomains: () => of([]),
  listTopicsAndCertifications: () => of({ topics: [], certifications: [] }),
  listExperts: () => of({ items: [], total: 0 }),
};

describe('ReseauNeuronal', () => {
  function configure(): void {
    TestBed.configureTestingModule({
      imports: [ReseauNeuronal],
      providers: [
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: NETWORK_GRAPH_PORT, useValue: FAKE_NETWORK_GRAPH_PORT },
      ],
    });
  }

  it('givenComponent_whenCreated_thenRendersCanvasAndBrand', () => {
    configure();
    const fixture = TestBed.createComponent(ReseauNeuronal);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('oei-network-canvas')).toBeTruthy();
    expect(compiled.querySelector('oei-network-breadcrumb')).toBeTruthy();
  });

  it('givenSearchQuery_whenTypingLessThanTwoChars_thenNoResults', () => {
    configure();
    const fixture = TestBed.createComponent(ReseauNeuronal);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as { results: () => readonly unknown[] };

    expect(component.results().length).toBe(0);
  });
});
