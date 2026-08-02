# Prompt de développement — Serveur mock API autonome

*Document destiné à être transmis à un agent de développement pour planifier et implémenter un serveur mock HTTP autonome pour le frontend OEI, en s'inspirant de deux implémentations de référence déjà utilisées par le porteur du projet.*

## 1. Objectif

Le frontend `frontend/oei-web` a déjà un mécanisme de mock **intégré à l'application** (chaque port DDD — `ContentRepositoryPort`, `LeadCapturePort`, `StatsPort`, etc. — a un adapter mock qui retourne des données de démonstration directement en TypeScript, sans requête HTTP). Ce mécanisme reste la valeur par défaut (`RuntimeConfig.dataSource === 'mock'`).

Il manque un **second niveau de mock, complémentaire** : un **serveur HTTP autonome** qui simule fidèlement le futur backend Spring Boot — mêmes routes, mêmes formats de réponse JSON, même contrat OpenAPI (`frontend/oei-web/openapi/oei-api.yaml`). Ce serveur sert à :

- Tester réellement la couche HTTP et les adapters `*ApiAdapter` (mode `dataSource: 'api'`) sans dépendre d'un vrai backend Spring Boot qui n'existe pas encore.
- Garder le contrat OpenAPI et son implémentation « simulée » en parfaite synchronisation, au fur et à mesure que de nouvelles fonctionnalités sont ajoutées côté frontend.
- **Accélérer radicalement l'implémentation du vrai backend plus tard** : une fois que le mode mock HTTP est complet (toutes les routes du contrat ont une implémentation simulée qui fonctionne), construire le vrai backend Spring Boot devient une traduction mécanique route par route (même contrat, même forme de réponse) plutôt qu'une conception à partir de rien.

## 2. Références déjà utilisées par le porteur du projet

Deux implémentations existantes à prendre comme modèle (lire leur code avant de commencer, ne pas réinventer un style différent) :

1. **`/Users/ydeungoue/projects/aegis/frontend/aegis-dashboard/mock`** — serveur Node **zéro dépendance** (`http` natif, pas de framework), très simple, sert `/config` + quelques routes REST via un tableau de routes `[méthode, regex, handler]`. Le plus minimaliste des deux.
2. **`/Users/ydeungoue/projects/iap/iap-apps-ui/mock`** — serveur **Express + TypeScript**, plus structuré : un routeur par ressource (`routes/agents.ts`, `routes/runs.ts`, etc.), middlewares (`cors`, `morgan` pour les logs, corrélation de requêtes), mode `SERVE_STATIC` qui sert aussi le build Angular compilé (pour simuler exactement la façon dont Spring Boot servirait les fichiers statiques + l'API depuis le même port). Documenté par un `README.md` clair listant chaque route.

**Consigne du porteur de projet : privilégier la simplicité et l'explicite avant tout.** Recommandation : suivre le style Express + TypeScript d'`iap-apps-ui` (un routeur par ressource, lisible et facile à étendre à chaque nouvelle route du contrat OpenAPI) mais en gardant le minimum de dépendances nécessaires (`express`, `cors` ; `morgan` optionnel pour les logs de dev) — ne pas répliquer toute la complexité d'`iap-apps-ui` (pas besoin de `multer`/upload de fichiers tant qu'aucune fonctionnalité ne l'exige réellement).

## 3. Emplacement et structure proposée

```
frontend/oei-web/mock/
├── package.json          (express, cors ; scripts dev/build/start)
├── tsconfig.json
├── src/
│   ├── index.ts           (bootstrap Express, sert /config + monte les routeurs)
│   ├── data/               (fixtures JSON/TS par ressource)
│   └── routes/
│       ├── config.ts       (GET /config → { dataSource: 'api', apiBaseUrl: '/api/v1' })
│       ├── content.ts      (GET /content/:lang/:slug)
│       ├── leads.ts        (POST /leads)
│       ├── stats.ts        (GET /stats)
│       ├── domains.ts      (GET /domains)
│       ├── news.ts         (GET /news)
│       └── partners.ts     (GET /partners, GET /partners/:id)
└── README.md               (liste des routes, comment le lancer, comment l'étendre)
```

Un routeur = une ressource = un fichier — pour qu'ajouter une route corresponde exactement à ajouter un chemin dans `openapi/oei-api.yaml` puis son routeur miroir ici.

## 4. Fonctionnement

- Port dédié (proposition : `8090`, à vérifier libre sur la machine avant de fixer définitivement — voir la convention déjà établie de vérifier les ports occupés par le projet `aegis` avant d'en choisir un nouveau).
- `pnpm dev` (hot-reload via `ts-node-dev`, comme les deux références).
- Le `proxy.conf.json` du frontend Angular peut être étendu (ou un profil de proxy alternatif ajouté) pour rediriger `/api` et `/config` vers ce serveur mock quand on veut tester le mode `dataSource: 'api'` en conditions réelles, sans toucher au reste de la configuration.
- Chaque route répond avec des données de démonstration **clairement fictives**, cohérentes avec les mêmes règles d'honnêteté déjà appliquées ailleurs dans le projet (pas de faux chiffres de membres, pas de fausses actualités présentées comme réelles).

## 5. Méthode de travail recommandée

1. Démarrer avec les routes déjà définies dans `openapi/oei-api.yaml` aujourd'hui (`/content/{lang}/{slug}`) et celles en cours d'ajout (`/leads`, `/stats`, `/domains`, `/news`, `/partners` — cf. `.prompt/plan/01-home-page-dynamique.md`).
2. À chaque nouvelle fonctionnalité frontend qui ajoute un port DDD, ajouter **en même temps** : (a) le chemin dans le contrat OpenAPI, (b) le routeur mock correspondant ici.
3. Une fois ce serveur mock complet et stable, l'implémentation du vrai backend Spring Boot (plan séparé, à écrire) peut suivre le même contrat quasi route par route, ce qui raccourcit considérablement le travail de conception côté backend.

## 6. Prochaine étape (mentionnée par le porteur du projet)

Une fois ce document validé, l'intention est de lancer plusieurs agents de développement **en parallèle**, un par plan déjà rédigé dans `.prompt/plan/` (home page dynamique, espace membre, serveur mock API) — à condition que les plans ne touchent pas aux mêmes fichiers en même temps (le risque de conflit entre agents travaillant en parallèle sur des zones qui se recoupent, ex. `app.config.ts` modifié par plusieurs plans, est à gérer explicitement avant de paralléliser réellement l'exécution).
