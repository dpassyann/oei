import { Service } from '@angular/core';
import { NewsPort } from '../../domain/port/news.port';
import { NewsItem } from '../../domain/model/news-item';

// Note: aucune actualité réelle n'a encore été publiée. On renvoie un tableau vide plutôt que
// d'inventer des articles de démonstration, afin que le composant Home affiche le même état
// honnête ("aucune actualité publiée pour le moment") que la page /actualites existante.
// `lang` is accepted (unused for now) to keep the port/adapter contract consistent with the
// other section adapters (stats/domains/partners) once real news content exists per language.
@Service()
export class NewsMockAdapter implements NewsPort {
  async getLatestNews(_limit: number, _lang: string): Promise<NewsItem[]> {
    return [];
  }
}
