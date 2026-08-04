import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { CertificationApplicationService } from './certification-application.service';
import { CERTIFICATION_PORT, CertificationPort } from '../../domain/port/certification/certification.port';
import { createCertification } from '../../domain/model/certification/certification';

describe('CertificationApplicationService', () => {
  function setup(fakePort: CertificationPort) {
    TestBed.configureTestingModule({ providers: [{ provide: CERTIFICATION_PORT, useValue: fakePort }] });
    return TestBed.inject(CertificationApplicationService);
  }

  it('givenPortReturnsCertification_whenGetCertification_thenForwardsIdAndReturnsIt', async () => {
    const expected = createCertification({
      id: 'cert-1',
      memberId: 'demo-member-1',
      name: 'AWS Certified Solutions Architect',
      issuingOrganization: 'Amazon Web Services',
      status: 'VALIDATED',
    });
    let receivedId: string | undefined;
    const service = setup({
      listCertifications: () => of([]),
      getCertification: (id) => {
        receivedId = id;
        return of(expected);
      },
      declareCertification: () => of(expected),
      listRecognizedCertifications: () => of([]),
    });
    const certification = await firstValueFrom(service.getCertification('cert-1'));
    expect(receivedId).toBe('cert-1');
    expect(certification).toEqual(expected);
  });

  it('givenDeclaration_whenDeclareCertification_thenForwardsDeclarationAndReturnsResult', async () => {
    const declaration = { name: 'PMP', issuingOrganization: 'PMI' };
    const expected = createCertification({
      id: 'cert-2',
      memberId: 'demo-member-1',
      name: 'PMP',
      issuingOrganization: 'PMI',
      status: 'DECLARED',
    });
    let receivedDeclaration: unknown;
    const service = setup({
      listCertifications: () => of([]),
      getCertification: () => {
        throw new Error('not used');
      },
      declareCertification: (decl) => {
        receivedDeclaration = decl;
        return of(expected);
      },
      listRecognizedCertifications: () => of([]),
    });
    const certification = await firstValueFrom(service.declareCertification(declaration));
    expect(receivedDeclaration).toEqual(declaration);
    expect(certification).toEqual(expected);
  });
});
