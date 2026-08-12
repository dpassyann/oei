import { describe, expect, it } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { NetworkGraphMockAdapter } from './network-graph-mock.adapter';
import { NETWORK_SALARY_INSIGHT_CANDIDATE_COUNTRIES } from '../../domain/model/network/network-salary-insight.model';

describe('NetworkGraphMockAdapter', () => {
  it('givenDomains_whenListDomains_thenReturnsAllNineDemoDomains', async () => {
    const adapter = new NetworkGraphMockAdapter();

    const domains = await firstValueFrom(adapter.listDomains());

    expect(domains.length).toBe(9);
  });

  describe('getSalaryInsight', () => {
    it('givenFirstCandidateCountry_whenGetSalaryInsight_thenResolvesRangeAboveThreshold', async () => {
      const adapter = new NetworkGraphMockAdapter();
      const [domain] = await firstValueFrom(adapter.listDomains());
      const [firstCountry] = NETWORK_SALARY_INSIGHT_CANDIDATE_COUNTRIES;

      const insight = await firstValueFrom(adapter.getSalaryInsight('domain', domain.id, firstCountry));

      expect(insight).toBeDefined();
      expect(insight!.sampleSize).toBeGreaterThanOrEqual(5);
      expect(insight!.country).toBe(firstCountry);
      expect(insight!.low).toBeLessThanOrEqual(insight!.high);
    });

    it('givenSecondCandidateCountry_whenGetSalaryInsight_thenResolvesUndefinedBelowThreshold', async () => {
      const adapter = new NetworkGraphMockAdapter();
      const [domain] = await firstValueFrom(adapter.listDomains());
      const secondCountry = NETWORK_SALARY_INSIGHT_CANDIDATE_COUNTRIES[1];

      const insight = await firstValueFrom(adapter.getSalaryInsight('domain', domain.id, secondCountry));

      expect(insight).toBeUndefined();
    });

    it('givenNoCountry_whenGetSalaryInsight_thenResolvesCountryAgnosticAggregate', async () => {
      const adapter = new NetworkGraphMockAdapter();
      const [domain] = await firstValueFrom(adapter.listDomains());

      const insight = await firstValueFrom(adapter.getSalaryInsight('domain', domain.id));

      expect(insight).toBeDefined();
      expect(insight!.country).toBeUndefined();
      expect(insight!.sampleSize).toBeGreaterThanOrEqual(5);
    });

    it('givenUnknownNodeId_whenGetSalaryInsight_thenResolvesUndefined', async () => {
      const adapter = new NetworkGraphMockAdapter();

      const insight = await firstValueFrom(adapter.getSalaryInsight('domain', 'd-does-not-exist'));

      expect(insight).toBeUndefined();
    });

    it('givenTopicOrCertificationNode_whenGetSalaryInsight_thenAlsoResolves', async () => {
      const adapter = new NetworkGraphMockAdapter();
      const [domain] = await firstValueFrom(adapter.listDomains());
      const { topics, certifications } = await firstValueFrom(adapter.listTopicsAndCertifications(domain.id));

      const topicInsight = await firstValueFrom(adapter.getSalaryInsight('topic', topics[0].id));
      expect(topicInsight).toBeDefined();

      if (certifications.length > 0) {
        const certInsight = await firstValueFrom(adapter.getSalaryInsight('certification', certifications[0].id));
        expect(certInsight).toBeDefined();
      }
    });
  });
});
