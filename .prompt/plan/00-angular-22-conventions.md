# Conventions de développement — Angular 22 « nouveau style »

*Document de référence pour tout développement frontend sur `frontend/oei-web`. À lire avant d'écrire du code Angular sur ce projet — s'applique à tous les plans listés dans `.prompt/plan/`.*

## Pourquoi ce document

Le porteur du projet a fourni une planche de référence (13 fonctionnalités Angular 22) qui doit être appliquée systématiquement. Un audit du code déjà écrit a montré des oublis (des services encore en `@Injectable` au lieu de `@Service()`) — ce document sert de check-list explicite pour éviter que ça se reproduise.

## 1. Signal Forms (stable)

Utiliser `signalForm` (`@angular/forms/signals`) plutôt que les Reactive Forms classiques pour tout nouveau formulaire.

```typescript
import { signalForm, Validators } from '@angular/forms';

interface Profile { name: string; email: string; birthDate: Date | null; }

const form = signalForm<Profile>({
  name: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
  birthDate: [null, Validators.date({ min: new Date(1900, 0, 1) })],
});

if (form.email().hasError('email')) {
  console.log('Adresse e-mail invalide');
}
```
**Vérifier avant usage** que `signalForm` existe bel et bien dans le `@angular/forms` installé (`grep` les `.d.ts`) — si absent dans la version installée, utiliser `FormGroup`/`ReactiveFormsModule` comme repli documenté (déjà fait pour le formulaire de téléchargement du Livre Blanc, qui utilise `[ngModel]`/`(ngModelChange)` en attendant).

## 2. OnPush par défaut

Ne plus déclarer `changeDetection: ChangeDetectionStrategy.OnPush` explicitement — c'est le comportement par défaut désormais. Les composants lisent des signals directement dans le template (`{{ user().name }}`).

## 3. Resource APIs (stable)

Pour les chargements asynchrones simples, préférer `resource`/`httpResource` (`@angular/core`) à un appel manuel RxJS/`fetch` + signal :

```typescript
import { resource, httpResource } from '@angular/core';

const userCount = resource({
  loader: async () => {
    const res = await fetch('/api/count');
    return res.json();
  },
});

const users = httpResource<User[]>({ url: () => '/api/users', method: 'GET' });
```
**Point d'audit** : les adapters `*ApiAdapter` du projet (`content-api.adapter.ts`, `stats-api.adapter.ts`, etc.) utilisent aujourd'hui `HttpClient.get(...).pipe(firstValueFrom)` plutôt que `httpResource`. À revisiter dans un futur passage de nettoyage — vérifier d'abord que `httpResource` convient au pattern DDD (le port retourne une `Promise`, pas un signal réactif de resource — à réconcilier avant de migrer).

## 4. Fetch par défaut pour HttpClient

`provideHttpClient()` utilise `fetch` par défaut désormais (déjà appliqué dans `app.config.ts` via `provideHttpClient(withFetch())`) :

```typescript
provideHttpClient(withFetch())   // comportement par défaut désormais
provideHttpClient(withNoFetch()) // pour revenir au XHR historique si nécessaire
```

## 5. Angular Aria (stable)

Pour toute nouvelle primitive d'interface nécessitant de l'accessibilité avancée (menus, dialogues, etc.), utiliser `provideAria()` (`@angular/cdk/a11y`) plutôt que réinventer la gestion clavier/focus à la main.

```typescript
import { provideAria } from '@angular/cdk/a11y';
// dans les providers de bootstrapApplication ou d'un composant
```
Pas encore utilisé sur ce projet — à introduire dès qu'un composant interactif complexe (menu déroulant, modale) est nécessaire.

## 6. `@Service()` au lieu de `@Injectable({ providedIn: 'root' })`

**Règle non négociable sur ce projet** : tout service (application, adapter d'infrastructure, service de présentation) doit utiliser `@Service()`, jamais `@Injectable({ providedIn: 'root' })`.

```typescript
import { Service, inject } from '@angular/core';

@Service()
export class LoggerService {
  private http = inject(HttpClient);
  log(message: string) { return this.http.post('/api/log', { message }); }
}
// équivalent à @Injectable({ providedIn: 'root' }) — mais c'est @Service() qu'on utilise ici.
```
**Vérifier avant chaque nouveau service** qu'il utilise bien `@Service()` — cette conversion a dû être appliquée rétroactivement une fois sur plusieurs adapters qui avaient été écrits en `@Injectable` par erreur (voir historique git, commit "convert remaining @Injectable services to @Service()"). Ne pas laisser cette régression se reproduire sur les prochains plans.

## 7. `injectAsync` pour l'injection paresseuse

Pour un service optionnel/lourd qu'on ne veut charger que si nécessaire :

```typescript
import { injectAsync } from '@angular/core';
import type AnalyticsService from './analytics.service';

const analytics = injectAsync<AnalyticsService | null>(() =>
  import('./analytics.service').then(m => m.AnalyticsService),
  { optional: true },
);

async function track(event: string) {
  const service = await analytics();
  service?.track(event);
}
```
Pas encore de cas d'usage sur ce projet (aucun service assez lourd pour justifier un lazy-load) — à garder en tête pour une future fonctionnalité coûteuse (ex. génération de PDF côté client, si jamais nécessaire).

## 8. `provideRouter` avec `paramsInheritanceStrategy: 'always'`

Déjà appliqué dans `app.config.ts` :
```typescript
provideRouter(routes, withRouterConfig({ paramsInheritanceStrategy: 'always' }))
```

## 9. Navigation API (hooks navigateur)

Utiliser `Router.navigating()` (signal) dans un `effect()` pour piloter un état UI global pendant une navigation (ex. classe CSS de chargement) :
```typescript
constructor() {
  effect(() => {
    if (this.router.navigating()) {
      document.body.classList.add('loading');
    } else {
      document.body.classList.remove('loading');
    }
  });
}
```
Pas encore utilisé — à introduire si un indicateur de chargement global devient nécessaire (site actuellement assez léger pour ne pas en avoir besoin tout de suite).

## 10-13. Conventions de templates

- **Commentaires dans les templates** autorisés (`<!-- commentaire -->`).
- **Spread syntax** dans les bindings : `[settings]="{ theme: 'dark', ...otherInputs }"`.
- **Arrow functions inline** dans les templates : `(click)="() => select(user())"` — à utiliser avec parcimonie (préférer une méthode nommée sur le composant quand la logique dépasse une ligne, pour la lisibilité et la testabilité).
- **`@for` strict** : `track` est **obligatoire**, jamais omis — déjà respecté partout sur ce projet (vérifié systématiquement en revue de code).

## Check-list avant de committer un nouveau composant/service

- [ ] Le service utilise `@Service()`, pas `@Injectable`.
- [ ] Le composant n'a pas de template/styles inline (`.ts` + `.html` + `.scss` + `.spec.ts`).
- [ ] Tout `@for` a un `track`.
- [ ] Toute API Angular 22 « récente » utilisée (Signal Forms, `resource`/`httpResource`, `injectAsync`, `provideAria`) a été vérifiée comme réellement présente dans la version installée avant usage — sinon, repli documenté vers l'équivalent stable, avec la raison explicitée en commentaire.
