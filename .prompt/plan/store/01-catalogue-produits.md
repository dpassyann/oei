# Boutique OEI — catalogue de produits

## 1. Catégorie de produit — modèle générique, pas un enum fermé

**Décision structurante :** `ProductCategory` ne doit **pas** être un enum Java fermé aux 2-3 catégories de la V1 (goodie, carte de visite, impression papier). Ce serait reproduire l'erreur inverse du pattern Enum Strategy (qui, lui, est légitime quand le jeu de stratégies est fermé et porté par le domaine — voir `04-architecture-technique.md §2`) : ici, la V2 (attaché-case, t-shirts, et au-delà) est explicitement annoncée par le porteur de projet, donc le jeu n'est **pas** fermé.

Modèle retenu :

- `ProductCategory` est une **entité de référence** (catalogue de catégories), pas un enum — table `product_category` (code technique stable type `slug`, libellé, et un champ `fulfillmentKind` qui distingue au moins `PHYSICAL_GOODS` (goodies, attaché-case, t-shirts…) de `PRINT_AND_SHIP` (carte de visite imprimée, CV papier, Livre Blanc papier) si le comportement de fulfillment diffère assez pour le justifier — sinon un seul type suffit et cette distinction peut être simplement deux valeurs de catégorie).
- `Product` référence sa `ProductCategory` par id, porte : `id`, `categoryId`, `sku`, `name`, `description`, `unitPrice` (montant + devise), `active` (permet de retirer un produit du catalogue sans le supprimer), `customizable` (booléen — vrai pour la carte de visite, faux pour un stylo).
- Catalogue V1 attendu (données de démo à seeder, jamais de vraies données commerciales) :
  - Goodie : "Stylo OEI" (catégorie `goodies`, non personnalisable).
  - Carte de visite personnalisée (catégorie `business-card`, `customizable=true`).
  - Impression + envoi CV (catégorie `print-cv`, non personnalisable en tant que produit — la personnalisation est déjà celle du CV numérique existant, voir §3).
  - Impression + envoi Livre Blanc (catégorie `print-whitepaper`, non personnalisable).
- Extensibilité V2 : ajouter une nouvelle catégorie ("attaché-case", "t-shirt") est une insertion Liquibase de données (une ligne `product_category` + une ou plusieurs lignes `product`), **jamais** une migration de schéma ni un changement de code Java — c'est le test décisif que le modèle est bien ouvert.

## 2. Cas particulier : produits non personnalisables réutilisant un existant numérique

- **Impression + envoi CV papier** : le produit ne stocke pas un nouveau contenu — au moment de la commande, il référence le `Cv` existant du membre (`domain/shared/src/main/java/global/oei/domain/shared/cv/Cv.java`, déjà modélisé et rendu en PDF mocké ailleurs dans ce backend). La ligne de commande (`OrderLine`) porte une référence optionnelle `sourceReferenceId` (ex. l'id du CV) en plus du `productId`, pour ce cas et le suivant.
- **Impression + envoi Livre Blanc papier** : produit "catalogue" simple sans référence membre (le contenu est le même pour tout le monde) — `sourceReferenceId` reste `null`.

## 3. Carte de visite — parcours de personnalisation détaillé

C'est le produit le plus riche fonctionnellement de la V1 ; il mérite un modèle dédié : `BusinessCardCustomization` (value object, pas une entité séparée — il vit à l'intérieur de l'`OrderLine` qui le porte, un membre peut personnaliser plusieurs jeux de cartes différemment dans la même commande ou des commandes différentes).

### 3.1 Étapes du parcours

1. **Choix du template.** Un petit nombre de templates visuels prédéfinis (même philosophie que les templates de CV : "mieux vaut 2-3 templates réellement soignés qu'une bibliothèque quelconque" — voir `.prompt/plan/02-espace-membre.md §1.2`). `BusinessCardTemplate` — catalogue de référence simple (id, nom, aperçu), pas un enum fermé non plus si on anticipe l'ajout de nouveaux templates sans redéploiement, mais peut rester un enum si le porteur de projet confirme un nombre de templates réellement figé pour la durée du projet (à trancher en implémentation selon combien de gabarits visuels existent réellement — si c'est piloté par des assets graphiques déposés par un designer, préférer une entité de référence comme `ProductCategory`).
2. **Champs personnalisables — pré-remplis depuis le profil membre.** Ne jamais demander une resaisie manuelle de ce qui existe déjà :
   - Nom affiché, titre/fonction, email, téléphone — pré-remplis depuis `Member`/`ProfessionalProfile` (le membre peut les surcharger localement pour la carte sans modifier son profil global — ce sont des copies au moment de la personnalisation, pas des références live).
   - QR code — réutilise le même mécanisme que la carte professionnelle numérique déjà existante (`DigitalBusinessCard`, `domain/shared/src/main/java/global/oei/domain/shared/publicprofile/DigitalBusinessCard.java`) plutôt que d'en réinventer un.
   - Palier de membre (Standard/Silver/Gold) — habillage visuel automatique selon le principe déjà en place ailleurs dans le site (cf. thèmes par palier).
3. **Preview live.** Le endpoint de personnalisation (`POST/PUT` sur la ressource de personnalisation, voir `04-architecture-technique.md §5`) renvoie un objet `BusinessCardPreview` — en V1, un rendu HTML côté serveur (même filière que le CV : construire en HTML d'abord) exposé via une URL de preview, pas un rendu PDF/image généré à chaque frappe clavier (coûteux, inutile) — le rendu final imprimable n'est produit qu'à la validation de commande.
4. **Validation.** Le membre valide sa personnalisation → elle est figée dans l'`OrderLine` (`BusinessCardCustomization` complet, immuable une fois la commande passée — toute nouvelle envie de personnalisation crée une nouvelle commande, pas une modification a posteriori d'une commande déjà passée).

### 3.2 Modèle `BusinessCardCustomization` (value object)

Champs a minima : `templateId`, `displayName`, `title`, `email`, `phone` (nullable), `qrCodeUrl` (généré, pas saisi), `membershipTierAtOrder` (capturé au moment de la commande — ne doit pas changer rétroactivement si le membre change de palier après coup).

## 4. Fulfillment — posture explicitement mockée en V1

Pour **tous** les produits de la V1 (goodies, carte de visite imprimée, CV papier, Livre Blanc papier) : aucun appel réel à un imprimeur ou transporteur. Une commande dont le paiement a réussi passe au statut `OrderStatus.PENDING_FULFILLMENT` et y reste — pas de simulation d'expédition automatique, pas de fausse date de livraison. Ceci doit être documenté explicitement dans le Javadoc de `Order`/`OrderStatus` (même exigence que `WalletPass.mocked()` et le rendu CV), afin qu'aucun développeur futur ni aucun utilisateur ne puisse croire par erreur qu'un vrai processus d'impression a été déclenché.

V2 (hors périmètre de cette implémentation, mais à ne pas fermer dans le modèle) : un futur `FulfillmentProviderPort` pourrait suivre exactement le même pattern Enum Strategy + Binder que `PaymentProviderPort` (voir `04-architecture-technique.md §2`) le jour où un vrai partenaire imprimeur/logistique est branché — inutile de le construire maintenant, mais le nommage `PENDING_FULFILLMENT` (plutôt qu'un nom couplé au mock, type `MOCK_PENDING`) garde cette porte ouverte sans code mort.
