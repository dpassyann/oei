import { Component } from '@angular/core';

@Component({
  selector: 'oei-nos-missions',
  templateUrl: './nos-missions.html',
  styleUrl: './nos-missions.scss',
})
export class NosMissions {
  protected readonly commitments: readonly string[] = [
    "Définir ce qu'est un expert informaticien, par niveau de compétence et de responsabilité.",
    'Proposer un code de déontologie commun, inspiré des professions à haute responsabilité.',
    "Construire, avec des partenaires académiques, un cadre de certification indépendant des éditeurs commerciaux.",
    'Défendre une exigence de formation continue tout au long de la carrière.',
    "Documenter et publier l'état réel de la profession — rémunérations, tendances, ruptures technologiques.",
    'Devenir un interlocuteur crédible des universités, des entreprises et, à terme, des pouvoirs publics.',
  ];
}
