import { Service } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  AdminCertificationCatalogInput,
  AdminCertificationCatalogPort,
} from '../../domain/port/admin/admin-certification-catalog.port';
import { createRecognizedCertification, RecognizedCertification } from '../../domain/model/certification/recognized-certification';
import {
  addRecognizedCertificationToCatalog,
  findRecognizedCertificationInCatalog,
  listRecognizedCertificationsCatalog,
  updateRecognizedCertificationInCatalog,
} from './certification-catalog-demo-data';

@Service()
export class AdminCertificationCatalogMockAdapter implements AdminCertificationCatalogPort {
  list(): Observable<RecognizedCertification[]> {
    return of([...listRecognizedCertificationsCatalog()]);
  }

  create(input: AdminCertificationCatalogInput): Observable<RecognizedCertification> {
    const id = `rc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const created = createRecognizedCertification({ id, ...input });
    addRecognizedCertificationToCatalog(created);
    return of(created);
  }

  update(id: string, input: AdminCertificationCatalogInput): Observable<RecognizedCertification> {
    const existing = findRecognizedCertificationInCatalog(id);
    if (!existing) {
      return throwError(() => new Error(`Recognized certification "${id}" not found.`));
    }
    const updated = createRecognizedCertification({ id, ...input });
    updateRecognizedCertificationInCatalog(id, updated);
    return of(updated);
  }
}
