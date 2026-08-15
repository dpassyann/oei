# Guide de production vidéo — pour quelqu'un sans expérience vidéo

Ce guide part du principe qu'aucune compétence vidéo préalable n'est nécessaire. L'objectif
n'est pas la perfection technique mais la clarté du message et une qualité minimale honnête
(son propre, image stable, lisible).

## 1. Matériel minimal viable

Budget total réaliste : **80-150 CHF** pour tout l'équipement, réutilisable indéfiniment.

- **Caméra** : un smartphone récent (moins de 4 ans d'âge) suffit largement. Filmer en
  **1080p à 30 images/seconde minimum** (idéalement 4K si le stockage le permet, ça donne de
  la marge au montage). Toujours filmer en **format portrait (vertical) séparément** si la
  vidéo est aussi destinée à Instagram/YouTube Shorts — ne pas se contenter de recadrer un
  paysage, la composition change.
- **Micro** : un micro-cravate (lavalier) USB-C ou Lightning, environ **30-50 CHF** (marques
  courantes : Boya, Rode Lavalier Go, Comica). Le son est le critère n°1 de perception de
  qualité — une vidéo filmée au smartphone avec un bon micro paraît professionnelle ; une
  vidéo tournée en 4K avec le micro intégré du téléphone paraît amateur.
- **Éclairage** : lumière naturelle en priorité — se placer face à une fenêtre (jamais dos à
  la fenêtre, ça crée un contre-jour qui assombrit le visage). Si le tournage a lieu en
  intérieur sans bonne lumière naturelle, un anneau lumineux LED USB bon marché (15-25 CHF)
  posé face à soi suffit largement.
- **Trépied/support** : un trépied de bureau ou une pince smartphone souple type "Gorillapod"
  (15-20 CHF) — l'image doit être **parfaitement stable**, jamais tenue à la main pour du
  contenu institutionnel (le tremblement casse immédiatement la crédibilité).

## 2. Structure d'un script court efficace

Toute vidéo, quelle que soit sa durée, suit la même architecture :

1. **Hook (0-5 secondes)** : la phrase ou l'image la plus forte de la vidéo, en premier —
   jamais un générique/logo d'intro qui retarde le message (les 3 premières secondes décident
   si la personne reste). Poser une question, une affirmation contre-intuitive, ou un chiffre
   marquant.
2. **Problème → Solution → Appel à l'action** :
   - Problème : la situation actuelle (le paradoxe de la profession non reconnue).
   - Solution : ce que l'OEI propose concrètement.
   - Appel à l'action : ce que la personne qui regarde doit faire ensuite (lire le Livre
     Blanc, visiter le site, rejoindre le mouvement).
3. **Durée cible selon le canal** :
   - 60-90 secondes pour les formats courts (Reels Instagram, Shorts YouTube, X vidéo) :
     un seul message, pas de digression.
   - 3-5 minutes pour la vidéo longue YouTube "posée" : on peut développer un peu plus, mais
     toujours revenir à l'architecture ci-dessus sans s'égarer dans des détails secondaires.

## 3. Conseils de montage simple

Logiciels gratuits recommandés :
- **CapCut** (mobile et desktop) : le plus simple pour débuter, idéal pour les formats
  courts, sous-titres automatiques intégrés de bonne qualité.
- **DaVinci Resolve** (desktop, gratuit) : plus complet, recommandé si la vidéo longue
  YouTube nécessite un montage plus soigné (transitions, étalonnage couleur simple pour
  uniformiser la palette bleu nuit/doré de la marque à l'image).

Règles simples à appliquer systématiquement :
- **Sous-titres toujours ajoutés**, dans les deux langues nécessaires (FR + EN a minima) :
  d'une part pour l'accessibilité (public malentendant), d'autre part parce qu'une grande
  partie du visionnage sur mobile se fait **sans son** (réseaux sociaux, transports en
  commun). Une vidéo sans sous-titres perd une part significative de son audience potentielle
  dès les premières secondes.
- **Couper les silences et les hésitations** ("euh", pauses trop longues) — un montage un peu
  plus serré que le naturel de la parole donne une impression de rythme et de maîtrise.
- **Ajouter un habillage minimal aux couleurs de marque** : bandeau de titre en bas d'écran en
  bleu nuit avec texte doré, logo bouclier/globe en filigrane discret en coin d'écran — cohérent
  avec les gabarits de `assets/`.
- **Miniature avec visage + texte contrasté** : toujours inclure un visage humain (le
  visionnage est statistiquement bien meilleur qu'avec un visuel purement graphique), avec un
  texte court et très lisible (3-5 mots max, gros caractères, fort contraste blanc/doré sur
  fond bleu nuit) — voir le gabarit `assets/miniature-youtube-generique.svg` comme point de
  départ, à personnaliser par vidéo.

## 4. SEO YouTube basique

- **Titre** : inclure le mot-clé principal en début de titre (ex. "Reconnaissance de la
  profession informatique : le Livre Blanc de l'OEI expliqué en 4 minutes"), rester sous 60
  caractères pour ne pas être tronqué dans les résultats de recherche.
- **Description** : les 2-3 premières lignes sont les plus importantes (affichées avant le
  "voir plus") — y placer le message clé et le lien vers le site avec UTM. Ajouter ensuite :
  - un résumé de 3-4 phrases,
  - des **timestamps** ("chapitres") si la vidéo dépasse 3 minutes (ex. `0:00 Introduction`,
    `0:45 Le paradoxe`, `2:10 Ce que propose l'OEI`, `3:30 Comment participer`) — YouTube les
    affiche automatiquement comme chapitres cliquables, ce qui améliore la durée de
    visionnage moyenne.
  - les liens utiles (site, Livre Blanc, réseaux sociaux).
- **Tags** : quelques mots-clés pertinents (`OEI`, `The IT Order`, `profession informatique`,
  `reconnaissance IT`, `Livre Blanc`, `IT profession recognition`, `White Paper`) — impact SEO
  aujourd'hui plus limité qu'avant mais toujours pris en compte marginalement par l'algorithme.

## 5. Adapter le ton aux trois thématiques

- **Vidéo 01 — Livre Blanc** : ton **calme et institutionnel**. Plan fixe ou léger mouvement,
  voix posée, peu ou pas de musique (ou musique très discrète en fond), montage sobre. On
  peut alterner face caméra et plans B-roll (pages du PDF qui défilent, couverture du
  document). C'est le contenu le plus "sérieux" des trois, il doit inspirer confiance et
  légitimité.
- **Vidéo 02 — Site web** : format **démo écran** (screen recording du site en navigation
  réelle, voix off en parallèle ou incrustation face caméra en petit cadre coin d'écran type
  "picture-in-picture"). Montrer concrètement les sections déjà en ligne (Livre Blanc, réseau
  neuronal), rythme un peu plus dynamique que la vidéo 01, musique de fond plus présente mais
  toujours discrète.
- **Vidéo 03 — Appel à participation** : la plus **incarnée et personnelle** des trois. Visage
  caméra en gros plan, ton chaleureux et direct, comme si on parlait à une seule personne (pas
  à "une audience"). C'est le format qui convertit le mieux en inscriptions/adhésions —
  privilégier l'authenticité (quelques imperfections assumées) à la perfection formelle qui
  peut paraître froide sur ce sujet précis.
