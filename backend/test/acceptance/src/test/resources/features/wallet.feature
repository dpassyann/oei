# language: fr
Fonctionnalité: Émission d'un pass Wallet
  En tant que membre de l'OEI
  Je veux obtenir un pass Apple Wallet
  Afin de présenter mon adhésion depuis mon téléphone

  Scénario: Un membre obtient un pass Wallet mocké
    Étant donné que je suis authentifié en tant que membre de démonstration
    Quand je demande un pass Apple Wallet
    Alors le pass est émis avec le statut "MOCKED"
    Et le pass est explicitement marqué comme simulé
