# Communication réseaux sociaux — OEI / The IT Order

Ce dossier contient toute la stratégie et le contenu prêt à publier pour lancer la présence
de l'**OEI — Ordre International des Experts de l'Informatique** (EN : *International Order
of Information Technology Experts*) sur les réseaux sociaux. Domaine public de référence :
**`theitorder.global`**.

Ce document couvre tout ce qui est **commun** aux cinq réseaux traités (LinkedIn, X/Twitter,
Facebook, Instagram, YouTube). Chaque réseau a ensuite son propre dossier avec ses spécificités
(`linkedin/`, `x-twitter/`, `facebook/`, `instagram/`, `youtube/`).

---

## 1. Positionnement de marque

**Phrase de positionnement (à garder en tête à chaque publication) :**

> L'OEI construit, avec la profession elle-même, la reconnaissance que le métier
> d'informaticien mérite depuis longtemps — standards, éthique, transparence, réseau.

En anglais :

> OEI is building — with the profession itself — the recognition the computing profession
> has long deserved: standards, ethics, transparency, network.

**Ton éditorial** : professionnel mais humain. On parle à des pairs, pas à des prospects.
On assume une posture de mouvement fondateur honnête sur son propre stade d'avancement
(voir §6), jamais dans le survendu ni le jargon corporate creux ("synergie", "disruptif",
"révolutionnaire"). On préfère la phrase claire, le fait vérifiable, la question ouverte
qui invite à réagir en commentaire. On assume aussi une pointe de fierté légitime : ce que
construit l'OEI est rare et ambitieux, ce n'est pas un énième blog RH.

**Audiences cibles** (par ordre de priorité au lancement) :
1. Professionnels IT expérimentés (développeurs, architectes, ingénieurs, RSSI, tech leads)
   sensibles aux enjeux de reconnaissance de leur métier et d'éthique professionnelle.
2. Décideurs et DSI susceptibles de soutenir ou de citer la démarche.
3. Institutions, associations professionnelles, écoles/universités d'informatique.
4. Futurs membres de l'OEI (candidats à l'adhésion, contributeurs au Livre Blanc, bénévoles).

## 2. Identité visuelle commune

- **Bleu nuit** : `#0a1e3f` (fond dominant, quasi noir-bleuté).
- **Doré** : `#e8a530` (logo, accents, traits, CTA).
- **Blanc** : `#ffffff` (texte sur fond bleu nuit).
- **Typographies** : titres en serif institutionnel (*Playfair Display*, à défaut Georgia/Times
  New Roman) ; texte courant en sans-serif (*Inter* ou *Montserrat*, à défaut Arial/Helvetica).
  Ce sont exactement les polices utilisées dans les SVG existants du site
  (`frontend/oei-web/public/assets/livre-blanc/couverture-oei.svg`).
- **Motif graphique** : un bouclier stylisé contenant un globe terrestre traversé de lignes de
  circuit imprimé (symbole recognition + numérique + international). Ce motif est repris du
  logo officiel (`frontend/oei-web/public/assets/logo-icon.svg`) et de la couverture du Livre
  Blanc. Toujours réutiliser ce même motif sur les visuels sociaux plutôt qu'en inventer un
  nouveau — c'est ce qui crée la reconnaissance visuelle inter-réseaux.
- Les gabarits vectoriels de départ pour chaque réseau sont dans `assets/` (voir §7).

## 3. Hashtags de marque (à utiliser systématiquement)

Ces hashtags accompagnent **toutes** les publications, en plus des hashtags spécifiques à
chaque post (voir les fichiers `post-0X-*.md` de chaque réseau) :

| Hashtag | Usage |
|---|---|
| `#OEI` | Acronyme de marque, toujours présent |
| `#TheITOrder` | Nom de marque anglais, identique sur toutes les plateformes |
| `#ReconnaissanceIT` | Reconnaissance de la profession (FR) |
| `#TechRecognition` | Équivalent EN |
| `#ProfessionInformatique` | Ancrage métier (FR) |
| `#DigitalTrust` | Confiance numérique / infrastructures critiques (EN) |
| `#EthiqueNumerique` | Éthique et déontologie (FR) — sans accent dans le tag pour compatibilité |

Recommandation : ne pas dépasser 3-5 hashtags de marque + 1-3 hashtags spécifiques au post
sur LinkedIn/Facebook/Instagram ; sur X, se limiter à 2-3 hashtags au total (culture de
la plateforme, lisibilité du tweet).

## 4. Convention de lien et UTM

Toujours pointer vers `theitorder.global` (jamais une IP, un lien raccourci opaque sans
marque, ou un ancien nom de domaine). Deux cas :

- Lien générique vers le site : `https://theitorder.global`
- Lien vers une page précise (ex. Livre Blanc) : `https://theitorder.global/livre-blanc`

**Principe UTM** : on ajoute systématiquement des paramètres `utm_*` pour savoir, dans les
outils d'analytics, quel réseau et quelle campagne ont amené le visiteur. Format retenu :

```
?utm_source=<reseau>&utm_medium=social&utm_campaign=<campagne>
```

- `utm_source` : `linkedin`, `x`, `facebook`, `instagram`, `youtube`.
- `utm_medium` : toujours `social` (constant, sert à isoler le canal "réseaux sociaux" dans
  les rapports, par opposition à `email`, `search`, etc.).
- `utm_campaign` : nom de la campagne en cours, ex. `lancement`, `livre-blanc`, `site-web`,
  `appel-participation`. Reprendre le même nom de campagne sur tous les réseaux pour pouvoir
  comparer leur performance sur un même sujet.

Exemple complet pour le post "Livre Blanc" publié sur LinkedIn :

```
https://theitorder.global/livre-blanc?utm_source=linkedin&utm_medium=social&utm_campaign=livre-blanc
```

Chaque fichier `post-0X-*.md` indique déjà le lien avec UTM prêt à copier-coller.

## 5. Fréquence de publication recommandée

Rythme réaliste de lancement, à ajuster selon les retours (engagement, temps disponible) :

| Période | LinkedIn | X | Facebook | Instagram | YouTube |
|---|---|---|---|---|---|
| Semaines 1-4 (lancement) | 2-3 posts/semaine | 4-6 posts/semaine (dont reprises en thread) | 2 posts/semaine | 2 posts/semaine (post + 1 story) | 1 vidéo toutes les 2 semaines |
| Mois 2-3 (montée en cadence) | 3-4 posts/semaine | 1 post/jour | 3 posts/semaine | 3-4 posts/semaine + stories régulières | 1 vidéo/semaine |
| Rythme de croisière (à partir du mois 4) | 3-5 posts/semaine | 1-2 posts/jour | 3-4 posts/semaine | 4-5 posts/semaine | 1-2 vidéos/semaine |

Mieux vaut publier moins mais régulièrement (et de qualité) que de démarrer fort puis
s'essouffler après deux semaines — les algorithmes de toutes ces plateformes pénalisent
l'irrégularité plus qu'un rythme modeste mais constant.

## 6. Règle éditoriale multilingue

- **Chaque publication doit exister au minimum en français ET en anglais.** Le site est
  multilingue (fr/en/es/de/it/pt) et l'ambition de l'OEI est internationale dès le départ.
- Sur LinkedIn, Facebook et X : publier deux posts distincts (un par langue) plutôt qu'un
  post bilingue dans le même message, sauf exception justifiée (annonce très courte). Cela
  évite les posts à rallonge et permet de mesurer l'engagement par langue.
- Sur Instagram : légende bilingue possible dans un seul post (FR puis EN séparés par une
  ligne de séparation `— — —`), car le format visuel prime sur le texte.
- Sur YouTube : sous-titres FR et EN obligatoires sur chaque vidéo (voir
  `youtube/guide-production-video.md`), description bilingue.
- **Espagnol, allemand, italien, portugais** : pertinents dès que la communauté grandit
  (le site existe déjà dans ces langues). Recommandation : les introduire à partir du
  mois 3-4, en commençant par l'espagnol (portée internationale la plus large après l'anglais)
  puis l'allemand (marché DACH, proximité du siège du mouvement). Ne pas les activer dès le
  lancement pour ne pas diluer l'effort éditorial avant d'avoir trouvé son rythme en FR/EN.

## 7. Honnêteté sur l'état du site — règle absolue

Le site `theitorder.global` est **en cours de construction**. Ne jamais écrire ou laisser
entendre qu'il est "disponible", "terminé" ou "complet". Formulation à utiliser
systématiquement (à adapter mais à garder dans cet esprit) :

> FR : « Le site theitorder.global est en cours de construction — plusieurs sections sont
> déjà accessibles : le Livre Blanc complet, la présentation du mouvement, le réseau neuronal
> des membres... D'autres arrivent dans les prochaines semaines. »
>
> EN : « The theitorder.global website is under construction — several sections are already
> live: the full White Paper, the presentation of the movement, the members' neural network...
> More are coming in the following weeks. »

Cette transparence est cohérente avec la culture du projet (voir le statut du Livre Blanc :
mouvement fondateur assumé comme tel, jamais un ordre professionnel légal auto-proclamé) et
constitue en réalité un argument de crédibilité : on construit sous les yeux de la communauté,
on ne survend pas.

## 8. Gabarits visuels (`assets/`)

Les fichiers suivants sont des **gabarits SVG éditables**, dessinés à la main dans la même
palette et le même motif (bouclier/globe/circuits) que les visuels déjà utilisés sur le site :

| Fichier | Usage | Dimensions |
|---|---|---|
| `avatar-oei.svg` | Avatar/photo de profil, décliné sur tous les réseaux | 512×512 (carré) |
| `banniere-linkedin.svg` | Bannière de page LinkedIn | 1584×396 |
| `banniere-x.svg` | Bannière de profil X/Twitter | 1500×500 |
| `banniere-facebook.svg` | Photo de couverture Page Facebook | 820×312 |
| `miniature-youtube-generique.svg` | Gabarit de miniature vidéo YouTube | 1280×720 |

**Comment les convertir en PNG** (la plupart des plateformes n'acceptent pas le SVG en upload
direct pour avatars/bannières) :

1. **Le plus rapide, sans rien installer** : ouvrir le fichier `.svg` dans un navigateur
   (Chrome/Firefox/Safari), faire un clic droit → « Enregistrer sous » n'exporte pas toujours
   en PNG propre — préférer un des convertisseurs en ligne gratuits type
   [cloudconvert.com](https://cloudconvert.com/svg-to-png) ou [svgtopng.com](https://svgtopng.com)
   en réglant la largeur/hauteur exactement sur les dimensions cibles indiquées ci-dessus (pas
   de mise à l'échelle automatique, pour éviter le flou).
2. **Pour un contrôle plus fin (texte, retouches)** : importer le SVG dans
   [Figma](https://figma.com) (gratuit) ou [Inkscape](https://inkscape.org) (gratuit,
   open-source), ajuster si besoin, puis « Exporter » en PNG à la résolution exacte.
3. Ces gabarits sont volontairement simples (formes vectorielles, pas d'image bitmap) pour
   rester éditables facilement — n'hésite pas à ajuster les textes d'accroche selon les
   campagnes en cours tout en gardant la palette et le motif du bouclier/globe intacts.

## 8bis. Nom de marque et cohérence inter-plateformes

Nom d'organisation officiel à utiliser dans les bios/à-propos : **« OEI — The IT Order »**
(EN) / **« OEI — Ordre International des Experts de l'Informatique »** (FR), les deux formes
étant acceptables selon le champ (voir `creation-compte.md` de chaque réseau pour le détail
champ par champ). Handle cible identique partout : voir chaque `creation-compte.md` pour le
détail et les variantes de repli.

## 9. Arborescence de ce dossier

```
social/
├── README.md                          # ce fichier — tout ce qui est commun
├── assets/                            # gabarits SVG (voir §8)
├── linkedin/
├── x-twitter/
├── facebook/
├── instagram/
└── youtube/
```

Chaque dossier réseau contient : `creation-compte.md` (comment créer le compte),
`calendrier-et-timing.md` (meilleurs jours/heures + calendrier de lancement 3 semaines),
et trois posts prêts à publier (`post-01-livre-blanc.md`, `post-02-site-web.md`,
`post-03-appel-a-participation.md`). Le dossier `youtube/` contient en plus
`guide-production-video.md` et trois scripts vidéo (`video-01-*.md`, `video-02-*.md`,
`video-03-*.md`).
