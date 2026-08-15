# language: fr
Fonctionnalité: Workflow de publication CMS
  En tant qu'administrateur OEI
  Je veux faire passer un contenu de brouillon à publié
  Afin de publier un article validé sur le site public

  # The workflow has three sequential review gates once submitted (see
  # ContentWorkflowStatus's Javadoc): IN_REVIEW -> LEGAL_REVIEW -> GOVERNANCE_REVIEW ->
  # APPROVED. Each "approve" call advances exactly one gate regardless of the reviewer
  # role recorded on it, so reaching APPROVED requires three approvals in total: an
  # initial editorial review, then the named legal and governance reviews.
  Scénario: Un contenu passe du brouillon à la publication
    Étant donné que je suis authentifié en tant qu'administrateur
    Et j'ai créé un contenu brouillon de type "ARTICLE" intitulé "Retour d'expérience migration cloud"
    Et j'ai ajouté une version en français avec le corps "Contenu de démonstration."
    Quand je soumets le contenu pour revue
    Et j'enregistre une approbation éditoriale
    Et j'enregistre une approbation légale
    Et j'enregistre une approbation de gouvernance
    Et je publie le contenu
    Alors le contenu a le statut "PUBLISHED"
