# language: fr
Fonctionnalité: Consultation de l'adhésion
  En tant que membre de l'OEI
  Je veux consulter mon adhésion
  Afin de connaître mon niveau et mon statut d'adhésion actuels

  Scénario: Un membre consulte son adhésion
    Étant donné que je suis authentifié en tant que membre de démonstration
    Quand je consulte mon adhésion
    Alors la réponse indique le niveau d'adhésion "STANDARD"
    Et la réponse indique le statut d'adhésion "ACTIVE"
