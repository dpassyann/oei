# Éditer le Livre Blanc en version physique — plan d'action

*Réponse à ta demande du 2026-08-01 : couverture, protection intellectuelle, impression physique.*

Bonne nouvelle d'abord : le Livre Blanc complet existe déjà, rédigé par un agent en tâche de fond pendant qu'on travaillait sur l'infra/le frontend. Il est ici :

**`content/fr/200-WHITE-PAPERS/livre-blanc-complet.md`** (189 lignes, ~7500 mots, les 15 sections du plan directeur).

Tu n'as pas besoin de me le fournir — je l'ai déjà sous la main. Mais relis-le toi-même en premier : c'est toi l'auteur, et la première étape de protection (voir §2) part du principe que tu as réellement corrigé/adapté le texte, pas juste généré puis expédié tel quel.

---

## 1. Couverture — ce que je peux te livrer maintenant, et ce qui attend une vraie photo

Je ne peux pas générer un fichier image de couverture imprimable directement (pas d'outil de génération d'image/mise en page print dans mon environnement actuel). Ce que je peux te livrer tout de suite, c'est un **brief de couverture complet et exploitable** — texte, structure, palette exacte — que tu donnes tel quel à un graphiste freelance (Fiverr/Malt, 1-2 jours, 50-150 CHF) ou que tu montes toi-même dans Canva/Reedsy Book Editor (gratuit, gabarits de couverture inclus) en 30 minutes.

### Première de couverture

```
┌─────────────────────────────────────────┐
│  [fond bleu nuit #0a1e3f]                │
│                                           │
│         🛡️  (logo bouclier + globe,      │
│              même identité visuelle      │
│              que la maquette du site)    │
│                                           │
│   ORDRE DES EXPERTS INFORMATICIENS       │  ← petit, doré #e8a530, tout en capitales
│                                           │
│                                           │
│   LIVRE BLANC                            │  ← grand, blanc, gras
│                                           │
│   Pour une reconnaissance progressive    │  ← sous-titre, doré, italique
│   de la profession informatique          │
│                                           │
│                                           │
│                                           │
│   [Ton Nom / Prénom Nom]                 │  ← bas de page, blanc
│                                           │
└─────────────────────────────────────────┘
```
- Palette exacte : fond `#0a1e3f` (bleu nuit), accents `#e8a530` (doré), texte principal blanc.
- Typo suggérée : une serif élégante pour "LIVRE BLANC" (ex. Playfair Display, Georgia) + une sans-serif géométrique pour le reste (ex. Inter, Montserrat) — cohérent avec la maquette du site.
- Le logo bouclier+globe existe déjà comme référence visuelle (`.prompt/maquetteUI.png`) — à vectoriser proprement pour l'impression (demander au graphiste un export SVG/PDF haute résolution, pas juste un screenshot).

### Quatrième de couverture

```
┌─────────────────────────────────────────┐
│  [même fond bleu nuit]                   │
│                                           │
│  « Le logiciel est devenu un bien        │  ← citation extraite du manifeste
│  d'intérêt public. »                     │
│                                           │
│  [Texte de présentation — 80-120 mots,   │
│   voir proposition ci-dessous]           │
│                                           │
│                                           │
│  ┌──────┐                                │
│  │photo │  [Prénom Nom]                  │  ← photo N&B, cadre carré, ~4x4cm
│  │ N&B  │  [Titre/fonction professionnelle│
│  │ carré│   en une ligne]                │
│  └──────┘  [1-2 phrases de bio]          │
│                                           │
│  ISBN : [en attente — voir §3]           │
└─────────────────────────────────────────┘
```

**Proposition de texte de 4e de couverture** (à ajuster) :

> L'informatique est aujourd'hui l'un des domaines les plus normalisés techniquement — protocoles, standards, normes de sûreté — et pourtant, l'accès à la profession qui conçoit ces systèmes reste totalement libre, sans exigence de compétence certifiée ni de déontologie commune. Ce Livre Blanc pose les fondations d'un mouvement international visant à faire reconnaître progressivement la profession d'expert informaticien comme une profession à haute responsabilité. Compétence. Éthique. Responsabilité.

**Bio auteur — proposition de structure** (remplis les crochets, je ne connais pas ces détails) :

> **[Prénom Nom]** est [fonction professionnelle actuelle, ex. « architecte logiciel »], basé en Suisse. Fondateur du mouvement Ordre des Experts Informaticiens (OEI), il porte ce projet avec l'ambition de faire reconnaître la profession informatique à la hauteur de sa responsabilité réelle dans les systèmes critiques qui structurent nos sociétés.

Sur la mention IA : une ligne discrète en petits caractères en fin de 4e de couverture est une pratique honnête et de plus en plus attendue :
> *Rédaction assistée par intelligence artificielle, relue, corrigée et validée par l'auteur.*

C'est cohérent avec ta position (tu as corrigé/adapté, tu restes l'auteur) et ça anticipe une question qu'un juriste ou un éditeur te poserait de toute façon.

### Préface

Le Livre Blanc a déjà une section "1. Préface" à l'intérieur du document. Si tu veux une préface *distincte*, signée de ta main, plus personnelle (pourquoi toi, pourquoi maintenant, ton parcours) — dis-le-moi et je t'en prépare une ébauche séparée d'une page, à insérer avant la section 1 actuelle.

---

## 2. Protéger la paternité intellectuelle — avant de voir les avocats

Point important à comprendre d'abord : **le droit d'auteur naît automatiquement dès la création de l'œuvre**, en Suisse comme en France — pas besoin d'enregistrement pour que la protection existe juridiquement. Ce qui manque souvent, c'est la **preuve de date** (l'antériorité) en cas de litige. Voici les options concrètes, de la plus légère à la plus solide :

1. **Historique git** (déjà en place) : chaque commit du fichier `.md` est daté et horodaté. C'est déjà un début de preuve d'antériorité et de paternité, gratuit, déjà fait.
2. **WIPO PROOF** (Organisation Mondiale de la Propriété Intellectuelle, `wipo.int/wipoproof`) : service d'horodatage numérique international, tu déposes ton fichier, tu reçois un jeton d'horodatage cryptographique daté, reconnu internationalement. Coût modique (~20-30 CHF), en ligne, 10 minutes. **C'est probablement l'option la plus adaptée à ton profil** (mouvement à ambition internationale, tu n'es pas encore fixé sur une juridiction unique France/Suisse).
3. **Enveloppe Soleau électronique** (INPI, France, `inpi.fr`) : équivalent français, utile si tu penses finalement déposer l'association en France plutôt qu'en Suisse.
4. **Dépôt notarié ou chez un avocat** : plus lourd, plus cher, à réserver pour le moment où tu rencontres réellement des juristes — pas nécessaire avant.

**Recommandation concrète et rapide** : fais un dépôt WIPO PROOF du fichier `.md` du Livre Blanc dès qu'une version stable existe (même avant impression physique) — 20 minutes, protège la paternité et la date, sans attendre la rencontre avec les avocats.

Sur l'assistance IA et la paternité : c'est une zone encore mouvante juridiquement, qui varie par pays. En France et en Suisse (tradition de « droit d'auteur » centrée sur l'empreinte de la personnalité de l'auteur), une œuvre où l'humain a fait des choix créatifs réels (structure, corrections, angle, arbitrages) est généralement protégeable en tant qu'œuvre de l'auteur humain, même avec une assistance IA en amont — contrairement aux États-Unis où le Copyright Office est plus restrictif sur le contenu purement généré. C'est exactement le genre de question à poser explicitement à ton avocat/juriste quand tu les rencontreras — garde une trace de ton propre travail éditorial (versions successives, commentaires de relecture) comme preuve de ta contribution personnelle.

---

## 3. Générer le PDF et le livre physique — outils concrets

### Convertir le Markdown en PDF soigné

- **Pandoc + template LaTeX "Eisvogel"** (gratuit, open source) : la référence pour transformer un `.md` en PDF professionnel avec page de titre, table des matières, numérotation — commande type : `pandoc livre-blanc-complet.md -o livre-blanc.pdf --template eisvogel --toc`. Nécessite d'installer Pandoc + une distribution LaTeX (TeX Live) en local — je peux t'accompagner sur cette conversion si tu veux, une fois que le contenu est stabilisé.
- **Reedsy Book Editor** (`reedsy.com/write`, gratuit) : éditeur en ligne, tu colles/importes ton texte, il génère une mise en page pro exportable en PDF/EPUB, avec des gabarits de couverture inclus — probablement le plus simple pour toi, aucune installation.
- **Vellum** (Mac uniquement, payant ~200 USD une fois) : très utilisé par les auteurs auto-édités, rendu très soigné, export direct vers les formats attendus par les imprimeurs.

### Impression à la demande + envoi postal (2-3 exemplaires)

- **BoD — Books on Demand** (`bod.fr` / `bod.ch`) : acteur franco-germano-suisse, propose l'attribution d'ISBN en option, impression à la demande, livraison en Suisse rapide — **probablement le plus pertinent pour toi géographiquement**.
- **Lulu.com** : self-publishing historique, bonne qualité d'impression couverture rigide, expédition internationale, pas besoin de minimum de tirage (tu peux commander 2-3 exemplaires seulement).
- **Amazon KDP** (Kindle Direct Publishing) : gratuit pour publier, impression à la demande y compris couverture rigide, ISBN gratuit fourni par Amazon (ou tu apportes le tien), mais moins adapté si tu veux garder un contrôle éditorial fin sur la distribution (le livre devient listé publiquement sur Amazon par défaut, à moins de le mettre en mode privé/non listé selon les options).

### ISBN

- Tu n'as pas besoin d'être une maison d'édition pour obtenir un ISBN — un auto-éditeur peut en demander un directement.
- **Suisse** : agence ISBN suisse via `isbn.ch` (Base de données du livre suisse / SBVV).
- **France** : AFNIL (`afnil.org`).
- Alternative : plusieurs plateformes d'impression à la demande (BoD, Lulu) proposent un ISBN gratuit ou à coût réduit directement intégré à leur service — souvent plus simple que de passer par l'agence nationale toi-même, si tu n'as pas besoin d'être l'éditeur de référence à long terme.

---

## 4. Prochaines étapes concrètes, dans l'ordre

1. Relire/valider `content/fr/200-WHITE-PAPERS/livre-blanc-complet.md` (tu es l'auteur, c'est ta relecture qui compte).
2. Dépôt WIPO PROOF de cette version stabilisée (~20 min, ~20-30 CHF) — protège la paternité avant tout partage physique.
3. Me dire si tu veux une préface signée séparée, et me donner les infos bio réelles (nom, fonction, une phrase de parcours) pour finaliser le texte de 4e de couverture.
4. Choisir/commander une couverture (brief ci-dessus → graphiste ou Canva/Reedsy).
5. Conversion PDF (Pandoc/Eisvogel ou Reedsy Book Editor).
6. Commande de 2-3 exemplaires physiques via BoD (ou Lulu) pour distribution à ton directeur DSI, l'équipe juridique, EPFL, etc.

Dis-moi par quel point tu veux qu'on continue — je peux notamment préparer la préface séparée ou t'aider sur la conversion Pandoc dès que tu es prêt.
