import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { InstitutionPublicPage } from '../../model/institution/institution-public-page';

// Page publique institutionnelle — `GET /api/public/v1/institutions/{slug}` (et les
// publications/opportunités publiées associées, déjà incluses dans `InstitutionPublicPage`
// côté mock ; le backend futur les expose via 2 endpoints séparés mais le port les regroupe
// pour simplifier la consommation côté page).
export interface InstitutionPublicPort {
  getPublicInstitution(slug: string): Observable<InstitutionPublicPage>;
}

export const INSTITUTION_PUBLIC_PORT = new InjectionToken<InstitutionPublicPort>('InstitutionPublicPort');
