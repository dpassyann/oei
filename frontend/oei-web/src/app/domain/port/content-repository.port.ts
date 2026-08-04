import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Document } from '../model/document';

export interface ContentRepositoryPort {
  getHomeContent(lang: string): Observable<Document>;
}

export const CONTENT_REPOSITORY_PORT = new InjectionToken<ContentRepositoryPort>('ContentRepositoryPort');
