# language: fr
# Il n'existe pas, dans cette itération, d'opération permettant à un membre de déclarer sa
# propre compensation individuelle via l'API (seul le jeu de données de démonstration
# alimente compensation_declaration, voir 0004-demo-members-and-compensation.sql) : ce
# scénario consulte donc directement le jeu de données de démonstration déjà chargé plutôt
# que de déclarer puis vérifier.
Fonctionnalité: Transparence salariale anonymisée du réseau professionnel
  En tant que visiteur du site public
  Je veux consulter une fourchette salariale anonymisée par domaine d'expertise
  Afin de comparer ma rémunération sans jamais exposer une déclaration individuelle

  Scénario: Le seuil d'anonymisation est atteint pour le domaine "ia"
    Étant donné les déclarations de compensation de démonstration pour le domaine "ia"
    Quand je consulte l'insight salarial du domaine "ia"
    Alors j'obtiens une fourchette salariale basée sur au moins 5 échantillons

  Scénario: Le seuil d'anonymisation n'est pas atteint pour un domaine inconnu
    Étant donné qu'aucune déclaration de compensation n'existe pour le domaine "domaine-inexistant"
    Quand je consulte l'insight salarial du domaine "domaine-inexistant"
    Alors aucune fourchette salariale n'est retournée
