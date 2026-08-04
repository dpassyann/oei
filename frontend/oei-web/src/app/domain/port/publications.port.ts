import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Publication } from '../model/publication';

export interface PublicationsPort {
  getPublications(lang: string): Observable<Publication[]>;
}

export const PUBLICATIONS_PORT = new InjectionToken<PublicationsPort>('PublicationsPort');
