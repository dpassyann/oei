import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Certification, CertificationDeclaration } from '../../model/certification/certification';
import { RecognizedCertification } from '../../model/certification/recognized-certification';

export interface CertificationPort {
  listCertifications(): Observable<Certification[]>;
  getCertification(id: string): Observable<Certification>;
  declareCertification(declaration: CertificationDeclaration): Observable<Certification>;
  listRecognizedCertifications(): Observable<RecognizedCertification[]>;
}

export const CERTIFICATION_PORT = new InjectionToken<CertificationPort>('CertificationPort');
