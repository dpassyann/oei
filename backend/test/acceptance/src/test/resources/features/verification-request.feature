# language: fr
Fonctionnalité: Soumission d'une demande de vérification
  En tant que membre de l'OEI
  Je veux soumettre une demande de vérification de mon identité
  Afin que le staff OEI puisse valider mon profil

  Scénario: Un membre soumet une demande de vérification d'identité
    Étant donné que je suis authentifié en tant que membre de démonstration
    Quand je soumets une demande de vérification de type "IDENTITY"
    Alors la demande de vérification est enregistrée avec le statut "PENDING"
    Et je retrouve cette demande dans la liste de mes demandes de vérification
