import { InjectionToken } from '@angular/core';
import { Document } from '../model/document';

export interface ContentRepositoryPort {
  getHomeContent(lang: string): Promise<Document>;
}

export const CONTENT_REPOSITORY_PORT = new InjectionToken<ContentRepositoryPort>('ContentRepositoryPort');
