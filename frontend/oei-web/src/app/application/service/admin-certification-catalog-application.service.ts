import { Service, inject } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import {
  ADMIN_CERTIFICATION_CATALOG_PORT,
  AdminCertificationCatalogInput,
} from '../../domain/port/admin/admin-certification-catalog.port';
import { RecognizedCertification } from '../../domain/model/certification/recognized-certification';
import { AdminAuditService } from './admin-audit.service';

const ENTITY_TYPE = 'RecognizedCertification';

/**
 * Wraps `AdminCertificationCatalogPort` and journals every mutating action via `AdminAuditService`
 * (task brief §Audit), same pattern and rationale as `AdminInstitutionsApplicationService`: pages
 * under `/admin/certifications` never call the port directly, so a create/edit can never slip
 * through without an audit entry.
 */
@Service()
export class AdminCertificationCatalogApplicationService {
  private readonly port = inject(ADMIN_CERTIFICATION_CATALOG_PORT);
  private readonly auditService = inject(AdminAuditService);

  list(): Observable<RecognizedCertification[]> {
    return this.port.list();
  }

  create(input: AdminCertificationCatalogInput): Observable<RecognizedCertification> {
    return this.port.create(input).pipe(
      switchMap((created) =>
        this.auditService
          .log('CERTIFICATION_CATALOG_CREATE', { type: ENTITY_TYPE, id: created.id }, null, { name: created.name })
          .pipe(map(() => created)),
      ),
    );
  }

  update(before: RecognizedCertification, input: AdminCertificationCatalogInput): Observable<RecognizedCertification> {
    return this.port.update(before.id, input).pipe(
      switchMap((after) =>
        this.auditService
          .log(
            'CERTIFICATION_CATALOG_UPDATE',
            { type: ENTITY_TYPE, id: before.id },
            { name: before.name, oeiStatus: before.oeiStatus },
            { name: after.name, oeiStatus: after.oeiStatus },
          )
          .pipe(map(() => after)),
      ),
    );
  }
}
