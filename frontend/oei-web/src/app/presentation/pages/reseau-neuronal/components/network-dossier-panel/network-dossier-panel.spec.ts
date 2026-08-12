import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { NetworkDossierPanel } from './network-dossier-panel';
import { I18nService } from '../../../../i18n/i18n.service';
import { NETWORK_GRAPH_PORT } from '../../../../../domain/port/network/network-graph.port';
import { NetworkNode } from '../../../../../domain/model/network/network-render-graph';
import { NetworkSalaryInsight } from '../../../../../domain/model/network/network-salary-insight.model';

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => key,
  translateList: () => [],
};

function certNode(): NetworkNode {
  return {
    id: 'c-demo',
    kind: 'cert',
    label: 'AWS Solutions Architect',
    x: 0,
    y: 0,
    r: 9,
    ph: 0,
    _dx: 0,
    _dy: 0,
    dom: 'd-cloud',
    topic: 't-cloud-0',
    provider: 'AWS',
    prereq: 'Aucun',
    desc: 'Description',
    comps: [],
    valid: '3 ans',
    expCount: 0,
  };
}

function domainNode(): NetworkNode {
  return { id: 'd-cloud', kind: 'domain', label: 'Cloud', x: 0, y: 0, r: 26, ph: 0, _dx: 0, _dy: 0, sat: [] };
}

describe('NetworkDossierPanel', () => {
  function configure(getSalaryInsight: () => Observable<NetworkSalaryInsight | undefined>) {
    TestBed.configureTestingModule({
      imports: [NetworkDossierPanel],
      providers: [
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        {
          provide: NETWORK_GRAPH_PORT,
          useValue: { getSalaryInsight },
        },
      ],
    });
  }

  it('givenRangeAvailable_whenCertificationSelected_thenShowsSalaryRange', async () => {
    const getSalaryInsight = vi.fn(() =>
      of({ low: 90000, high: 130000, currency: 'CHF', period: 'YEAR' as const, sampleSize: 8, country: 'Suisse' }),
    );
    configure(getSalaryInsight);
    const fixture = TestBed.createComponent(NetworkDossierPanel);
    fixture.componentRef.setInput('node', certNode());
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-network-dossier-panel__salary-range')?.textContent).toContain('90000');
    expect(compiled.querySelector('.oei-network-dossier-panel__salary-range')?.textContent).toContain('130000');
    expect(compiled.querySelector('.oei-network-dossier-panel__salary-empty')).toBeFalsy();
    expect(getSalaryInsight).toHaveBeenCalledWith('certification', 'c-demo', undefined);
  });

  it('givenPoolBelowThreshold_whenDomainSelected_thenShowsInsufficientDataMessage', async () => {
    configure(() => of(undefined));
    const fixture = TestBed.createComponent(NetworkDossierPanel);
    fixture.componentRef.setInput('node', domainNode());
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-network-dossier-panel__salary-empty')).toBeTruthy();
    expect(compiled.querySelector('.oei-network-dossier-panel__salary-range')).toBeFalsy();
  });

  it('givenExpertNode_whenRendered_thenDoesNotQuerySalaryInsight', async () => {
    const getSalaryInsight = vi.fn(() => of(undefined));
    configure(getSalaryInsight);
    const fixture = TestBed.createComponent(NetworkDossierPanel);
    fixture.componentRef.setInput('node', {
      id: 'e-1',
      kind: 'expert',
      label: 'Jane Dupont',
      x: 0,
      y: 0,
      r: 6.5,
      ph: 0,
      _dx: 0,
      _dy: 0,
      role: 'CTO',
      company: 'Nexa',
      country: 'France',
      level: 'II',
      score: 800,
      certs: [],
      badges: [],
      journey: [],
    } as NetworkNode);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(getSalaryInsight).not.toHaveBeenCalled();
  });
});
