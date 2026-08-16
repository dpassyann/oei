# language: fr
Fonctionnalité: Achat d'un produit de la boutique OEI
  En tant que membre de l'OEI
  Je veux acheter un produit du catalogue boutique et le payer par carte
  Afin de recevoir ma commande (impression/envoi mocké en V1)

  Scénario: Un membre achète un produit boutique et paie par carte
    Étant donné que je suis authentifié en tant que membre de démonstration
    Quand je commande 1 exemplaire du produit "Stylo OEI"
    Alors la commande est créée avec le statut "PENDING_PAYMENT"
    Quand je paie cette commande par carte
    Alors la commande passe au statut "PENDING_FULFILLMENT"
