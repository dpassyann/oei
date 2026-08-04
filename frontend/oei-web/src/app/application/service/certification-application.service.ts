import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CERTIFICATION_PORT } from '../../domain/port/certification/certification.port';
import { Certification, CertificationDeclaration } from '../../domain/model/certification/certification';
import { RecognizedCertification } from '../../domain/model/certification/recognized-certification';

@Service()
export class CertificationApplicationService {
  private readonly port = inject(CERTIFICATION_PORT);

  listCertifications(): Observable<Certification[]> {
    return this.port.listCertifications();
  }

  getCertification(id: string): Observable<Certification> {
    return this.port.getCertification(id);
  }

  declareCertification(declaration: CertificationDeclaration): Observable<Certification> {
    return this.port.declareCertification(declaration);
  }

  listRecognizedCertifications(): Observable<RecognizedCertification[]> {
    return this.port.listRecognizedCertifications();
  }
}
