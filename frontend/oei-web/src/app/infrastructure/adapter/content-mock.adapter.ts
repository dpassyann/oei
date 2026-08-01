import { Injectable } from '@angular/core';
import { ContentRepositoryPort } from '../../domain/port/content-repository.port';
import { createDocument, Document } from '../../domain/model/document';

const FIXTURES: Record<string, { title: string; body: string }> = {
  fr: {
    title: 'Nous construisons la confiance numérique de demain.',
    body: "Éthique. Compétence. Responsabilité. Pour une informatique au service de l'humain et de la société.",
  },
  en: {
    title: "We are building tomorrow's digital trust.",
    body: 'Ethics. Competence. Responsibility. For technology that serves people and society.',
  },
};

@Injectable({ providedIn: 'root' })
export class ContentMockAdapter implements ContentRepositoryPort {
  async getHomeContent(lang: string): Promise<Document> {
    const fixture = FIXTURES[lang];
    if (fixture) {
      return createDocument({ slug: 'home', lang, title: fixture.title, body: fixture.body, isFallback: false });
    }
    const fallback = FIXTURES['en'];
    return createDocument({ slug: 'home', lang: 'en', title: fallback.title, body: fallback.body, isFallback: true });
  }
}
