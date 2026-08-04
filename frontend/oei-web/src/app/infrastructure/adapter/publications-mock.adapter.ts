import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PublicationsPort } from '../../domain/port/publications.port';
import { Publication } from '../../domain/model/publication';

// Note: aucune publication réelle n'a encore été mise en ligne. On renvoie un tableau vide
// plutôt que d'inventer des articles/rapports/événements de démonstration, afin que la page
// `/publications` affiche le même état honnête ("aucune publication pour le moment") que la
// page `/actualites` et la section actualités de la home (voir `NewsMockAdapter`). `lang` est
// accepté (inutilisé pour l'instant) pour garder le contrat de port cohérent avec les autres
// adaptateurs mock une fois qu'un vrai contenu existera par langue.
@Service()
export class PublicationsMockAdapter implements PublicationsPort {
  getPublications(_lang: string): Observable<Publication[]> {
    return of([]);
  }
}
