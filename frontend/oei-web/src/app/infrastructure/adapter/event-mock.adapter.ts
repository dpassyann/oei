import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EventPort } from '../../domain/port/event/event.port';
import { createEvent, Event } from '../../domain/model/event/event';

// Demonstration agenda: 5 events spanning every `/events` section (à la une, ouverts, historique)
// — clearly labelled "[Démonstration]", same "demo-data honesty" rule as
// `ArticleModerationMockAdapter`'s seed submissions. Dates are anchored around "today" so the
// featured/open/history split keeps making sense regardless of when this mock is loaded.
function buildSeedEvents(): Event[] {
  const now = Date.now();
  const days = (n: number) => new Date(now + n * 24 * 60 * 60 * 1000).toISOString();

  return [
    createEvent({
      id: 'event-demo-1',
      slug: 'colloque-ethique-ia-2026',
      title: '[Démonstration] Colloque annuel : Éthique et IA en entreprise',
      type: 'colloque',
      description:
        'Colloque de démonstration rassemblant experts et institutions autour des enjeux éthiques ' +
        "de l'intelligence artificielle en entreprise. Table ronde, ateliers et networking.",
      imageUrl: '/assets/news/appel-contribution.svg',
      location: { country: 'FR', city: 'Paris', venue: 'Maison des Associations, 12 rue de la République' },
      startAt: days(21),
      endAt: days(21),
      timezone: 'Europe/Paris',
      capacity: 150,
      registrationsCount: 42,
      visibility: 'public',
      organizers: ["Ordre International des Experts de l'Informatique"],
      languages: ['fr', 'en'],
      speakers: [
        { name: 'Dr. Amina Traoré', role: "Présidente, comité d'éthique OEI" },
        { name: 'Marc Lefèvre', role: 'DPO, groupe bancaire' },
      ],
      status: 'REGISTRATION_OPEN',
    }),
    createEvent({
      id: 'event-demo-2',
      slug: 'webinar-cybersecurite-pme',
      title: '[Démonstration] Webinar : Cybersécurité pour les PME',
      type: 'webinar',
      description:
        'Webinar de démonstration sur les bonnes pratiques de cybersécurité accessibles aux petites ' +
        'et moyennes entreprises, animé par des membres certifiés OEI.',
      location: { country: 'BE', onlineUrl: 'https://meet.example.org/oei-cybersecurite-pme' },
      startAt: days(7),
      endAt: days(7),
      timezone: 'Europe/Brussels',
      registrationsCount: 88,
      visibility: 'public',
      organizers: ['Groupe de travail Cybersécurité'],
      languages: ['fr'],
      speakers: [{ name: 'Sophie Nguyen', role: 'Experte cybersécurité certifiée OEI' }],
      status: 'REGISTRATION_OPEN',
    }),
    createEvent({
      id: 'event-demo-3',
      slug: 'meetup-informatique-verte-lyon',
      title: '[Démonstration] Meetup : Informatique verte à Lyon',
      type: 'meetup',
      description:
        "Rencontre informelle de démonstration entre membres autour de l'écoconception logicielle " +
        'et des retours de terrain.',
      location: { country: 'FR', city: 'Lyon', venue: 'Tiers-lieu La Ruche, 8 quai Rambaud' },
      startAt: days(3),
      endAt: days(3),
      timezone: 'Europe/Paris',
      capacity: 40,
      registrationsCount: 21,
      visibility: 'members',
      organizers: ['Antenne Lyon'],
      languages: ['fr'],
      status: 'PUBLISHED',
    }),
    createEvent({
      id: 'event-demo-4',
      slug: 'assemblee-generale-2025',
      title: '[Démonstration] Assemblée générale annuelle 2025',
      type: 'assemblee',
      description:
        "Bilan annuel de démonstration de l'Ordre International des Experts de l'Informatique : rapport moral, " +
        'rapport financier et élection du bureau.',
      location: { country: 'FR', city: 'Paris', venue: "Siège de l'OEI, 3 avenue de la Recherche" },
      startAt: days(-95),
      endAt: days(-95),
      timezone: 'Europe/Paris',
      registrationsCount: 210,
      visibility: 'members',
      organizers: ["Bureau de l'OEI"],
      languages: ['fr'],
      status: 'ENDED',
      summary:
        'Assemblée générale de démonstration : validation du rapport moral et financier, ' +
        'renouvellement de trois membres du bureau.',
      galleryImageUrls: ['/assets/news/appel-contribution.svg'],
    }),
    createEvent({
      id: 'event-demo-5',
      slug: 'ceremonie-remise-certifications-2025',
      title: '[Démonstration] Cérémonie de remise des certifications 2025',
      type: 'ceremonie',
      description:
        'Cérémonie de démonstration célébrant les membres nouvellement certifiés au cours de ' +
        "l'année écoulée.",
      location: { country: 'CH', city: 'Genève', venue: 'Palais des Congrès' },
      startAt: days(-200),
      endAt: days(-200),
      timezone: 'Europe/Zurich',
      registrationsCount: 130,
      visibility: 'public',
      organizers: ["Ordre International des Experts de l'Informatique"],
      languages: ['fr', 'en', 'de'],
      status: 'ARCHIVED',
      summary:
        'Cérémonie de démonstration : 47 nouvelles certifications remises, discours de la ' +
        'présidence sur les perspectives 2026.',
      galleryImageUrls: ['/assets/news/appel-contribution.svg'],
    }),
  ];
}

const seedEvents: readonly Event[] = buildSeedEvents();

@Service()
export class EventMockAdapter implements EventPort {
  listPublic(): Observable<Event[]> {
    return of([...seedEvents]);
  }

  getBySlug(slug: string): Observable<Event | undefined> {
    return of(seedEvents.find((event) => event.slug === slug));
  }
}
