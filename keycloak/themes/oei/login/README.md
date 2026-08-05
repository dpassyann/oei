# Thème de login OEI — enregistrement Keycloak natif

## Contexte

La page Angular `/inscription` (formulaire maison) a été supprimée. La création de compte se
fait désormais via l'écran d'enregistrement natif de Keycloak (`kc_action=REGISTER`, déclenché
par `KeycloakAuthService.register()` côté frontend). Ce thème `oei/login` porte les champs
métier OEI additionnels sur ce formulaire natif :

- **`country`** (pays) — liste déroulante statique ISO 3166-1 (247 entrées), pas d'input texte
  libre ni d'appel à une API externe.
- **`consentAccepted`** (consentement) — case à cocher obligatoire.

## Approche choisie : User Profile déclaratif (pas d'override `register.ftl`)

Keycloak 25 (voir `infra/docker-compose.yml`, image `quay.io/keycloak/keycloak:25.0`) supporte
nativement le **User Profile déclaratif** depuis la version 24 (disponible sans feature flag
preview). C'est l'approche retenue plutôt que dupliquer/override le template FreeMarker
`register.ftl` : plus maintenable (aucune duplication du markup PatternFly du thème de base
`keycloak`), et les champs personnalisés sont automatiquement rendus sur **tous** les
formulaires pertinents (inscription, mise à jour de profil) sans code de template dupliqué.

La configuration vit dans `keycloak/realm-export/oei-realm.json`, sous
`components["org.keycloak.userprofile.UserProfileProvider"][0].config["kc.user.profile.config"]`
(chaîne JSON — c'est le format standard d'export de realm pour le User Profile déclaratif ;
c'est l'équivalent de ce que produirait `PUT /admin/realms/oei/users/profile`). Elle définit :

- `country` : `inputType: select`, `validations.options.options` = les 247 codes ISO 3166-1,
  `required.roles: [user]` (obligatoire à l'inscription).
- `consentAccepted` : `inputType: multiselect-checkboxes` avec une unique option `"accepted"`
  (pattern standard Keycloak pour une case à cocher unique dans le User Profile déclaratif),
  également `required.roles: [user]`.

## i18n : labels en français

Le realm était auparavant sans configuration d'internationalisation explicite (mono-locale de
fait, sans `internationalizationEnabled`). Ce changement active proprement :

```json
"internationalizationEnabled": true,
"supportedLocales": ["fr"],
"defaultLocale": "fr"
```

... et ce thème (`theme.properties` : `locales=fr`) charge
`messages/messages_fr.properties`, qui définit :

- `country=Pays` et `consentAccepted=...` (labels des champs, via `displayName: "${country}"` /
  `"${consentAccepted}"` dans la config User Profile) ;
- `country.<CODE>=<Nom français>` pour chacun des 247 codes ISO 3166-1 (ex. `country.FR=France`)
  — c'est la convention Keycloak standard de résolution des labels d'options `select` : la clé
  de message est `<nomAttribut>.<valeurOption>`.

Aucun appel réseau : la liste est entièrement statique, générée une fois dans ce commit.

## Charte graphique

Les nouveaux widgets (`<select>` PatternFly 4 pour `country`, groupe de checkboxes PatternFly 4
pour `consentAccepted`) réutilisent les règles CSS déjà en place dans `resources/css/oei.css`
(`.pf-c-form-control`, `.pf-c-check__label`) — pas de style ad hoc : mêmes couleurs
(`--oei-navy`, `--oei-gold`), mêmes espacements que le reste du formulaire de login/inscription.

## Tester en local

1. Le thème est monté en volume dans le conteneur Keycloak (voir `infra/docker-compose.yml`) :
   `../keycloak/themes/oei:/opt/keycloak/themes/oei`. Toute modification de fichiers CSS/
   properties sous ce dossier est donc immédiatement visible sur le disque du conteneur.
2. **Le realm, lui, n'est importé qu'une fois** (`--import-realm` au démarrage de Keycloak ne
   réimporte pas un realm déjà existant en base). Comme ce changement modifie
   `oei-realm.json` (ajout du User Profile déclaratif + config i18n), il faut recréer le realm
   pour que les changements prennent effet en local :

   ```bash
   cd infra
   docker compose down                 # ou : docker compose stop keycloak postgres
   docker volume rm oei_postgres-data   # supprime aussi les autres realms/données de test locales
   docker compose up -d postgres keycloak
   ```

   (Alternative moins destructive : appliquer la config User Profile a posteriori via l'API
   admin — `PUT /admin/realms/oei/users/profile` avec le contenu de
   `kc.user.profile.config` — ou via la console Admin, onglet *Realm settings → User profile*,
   sans toucher au volume Postgres.)

3. Redémarrage simple du conteneur Keycloak seul (sans recréer le realm) suffit pour toute
   modification ultérieure de CSS/`.properties` dans ce thème :

   ```bash
   docker compose restart keycloak
   ```

   Keycloak en mode `start-dev` recharge les thèmes à chaud dans la plupart des cas ; en cas de
   doute (cache de thème), un restart du conteneur force le rechargement.

4. Ouvrir <http://localhost:8081/realms/oei/protocol/openid-connect/registrations?client_id=oei-frontend&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A4300%2F&scope=openid>
   ou, plus simplement, lancer le frontend (`pnpm start` dans `frontend/oei-web`, sur
   `http://localhost:4300`) et cliquer sur "Rejoignez le mouvement" en étant déconnecté : ça
   redirige désormais vers l'écran d'enregistrement Keycloak natif avec les champs Pays et
   consentement.
