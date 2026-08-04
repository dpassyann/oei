import { firstValueFrom } from 'rxjs';
import { CertificationMockAdapter } from './certification-mock.adapter';

describe('CertificationMockAdapter', () => {
  it('givenSeededCertification_whenListCertifications_thenReturnsDemoCertificationForDemoMember', async () => {
    const adapter = new CertificationMockAdapter();
    const certifications = await firstValueFrom(adapter.listCertifications());
    expect(certifications).toHaveLength(1);
    expect(certifications[0].id).toBe('demo-cert-1');
    expect(certifications[0].memberId).toBe('demo-member-1');
    expect(certifications[0].status).toBe('VALIDATED');
  });

  it('givenExistingCertification_whenGetCertification_thenReturnsIt', async () => {
    const adapter = new CertificationMockAdapter();
    const certification = await firstValueFrom(adapter.getCertification('demo-cert-1'));
    expect(certification.name).toBe('AWS Certified Solutions Architect');
  });

  it('givenDeclarationWithoutRecognizedMatch_whenDeclareCertification_thenStaysDeclaredNeverAutoValidated', async () => {
    const adapter = new CertificationMockAdapter();
    const declared = await firstValueFrom(
      adapter.declareCertification({ name: 'Custom Certification', issuingOrganization: 'Acme' }),
    );
    expect(declared.status).toBe('DECLARED');
    expect(declared.validatedBy).toBeUndefined();
    expect(declared.memberId).toBe('demo-member-1');
  });

  it('givenDeclarationMatchingAutoValidateRecognizedCertification_whenDeclareCertification_thenAutoValidates', async () => {
    const adapter = new CertificationMockAdapter();
    const declared = await firstValueFrom(
      adapter.declareCertification({
        name: 'AWS Certified Solutions Architect',
        issuingOrganization: 'Amazon Web Services',
        recognizedCertificationId: 'rc-1',
      }),
    );
    expect(declared.status).toBe('VALIDATED');
    expect(declared.validatedBy).toBe('system-auto-validation');
  });

  it('givenDeclarationMatchingNonAutoValidateRecognizedCertification_whenDeclareCertification_thenStaysDeclared', async () => {
    const adapter = new CertificationMockAdapter();
    const declared = await firstValueFrom(
      adapter.declareCertification({
        name: 'PMP',
        issuingOrganization: 'PMI',
        recognizedCertificationId: 'rc-2',
      }),
    );
    expect(declared.status).toBe('DECLARED');
  });

  it('givenCatalog_whenListRecognizedCertifications_thenReturnsSeededEntries', async () => {
    const adapter = new CertificationMockAdapter();
    const recognized = await firstValueFrom(adapter.listRecognizedCertifications());
    expect(recognized).toHaveLength(2);
    expect(recognized.map((entry) => entry.id)).toEqual(['rc-1', 'rc-2']);
  });
});
