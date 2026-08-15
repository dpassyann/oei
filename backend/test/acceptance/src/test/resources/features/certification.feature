# language: fr
Fonctionnalité: Déclaration de certification
  En tant que membre de l'OEI
  Je veux déclarer une certification que j'ai obtenue
  Afin qu'elle apparaisse sur mon profil

  Scénario: Un membre déclare une certification
    Étant donné que je suis authentifié en tant que membre de démonstration
    Quand je déclare la certification "AWS Certified Solutions Architect" délivrée par "Amazon"
    Alors la certification est enregistrée avec le statut "DECLARED"
    Et je retrouve cette certification dans la liste de mes certifications
