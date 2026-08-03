# Architecture decision: RxJS end-to-end, `rxResource` at the edge

This project's frontend data flow follows one rule, applied uniformly across every
port/adapter/service/component in `domain/`, `application/` and `infrastructure/`:

> **Ports, adapters and application services return RxJS `Observable`s. Components consume
> them through `rxResource()` (from `@angular/core/rxjs-interop`), never through raw
> `httpResource()` and never through `Promise`/`async`-`await`.**

## Why not literally `httpResource()`

The initial instruction was "Observable de bout en bout (RxJS) mais en utilisant
`httpResource`". Taken literally this is a contradiction: `httpResource()` (from
`@angular/common/http`, confirmed present in the installed `@angular/common@22.1.0` at
`node_modules/@angular/common/types/http.d.ts`) is a **signal-native** primitive. Its loader
takes a `HttpResourceRequest` (a URL/method/params/body descriptor) and returns a
`ResourceRef<T>` — a signal, not an `Observable`. It does not accept an `Observable` as input
and does not expose one as output. A port that returns `Observable<T>` cannot be wired
directly into `httpResource()`.

## What we used instead: `rxResource()`

`node_modules/@angular/core/types/rxjs-interop.d.ts` (Angular 22.1.0, confirmed by direct
inspection of the installed package — not assumed from training data) declares:

```ts
interface RxResourceOptions<T, R> extends BaseResourceOptions<T, R> {
  stream: (params: ResourceLoaderParams<R>) => Observable<T>;
}
declare function rxResource<T, R>(opts: RxResourceOptions<T, R> & { defaultValue: NoInfer<T> }): ResourceRef<T>;
declare function rxResource<T, R>(opts: RxResourceOptions<T, R>): ResourceRef<T | undefined>;
```

`rxResource` is `@publicApi 22.0` — i.e. it is new in exactly the Angular version this project
targets (`^22.1.0`). It is the "`httpResource`-shaped" resource whose `stream` loader is an
`Observable`, which is what makes "Observable de bout en bout ... en utilisant `httpResource`"
coherent in practice: the *resource ergonomics* of `httpResource` (a signal-based
`ResourceRef` reactive to a `params` signal, auto-registered with Angular's `PendingTasks` so
zoneless change detection and `ComponentFixture.whenStable()` wait for it) are obtained via
`rxResource`, while the actual HTTP call underneath is a plain RxJS `Observable` produced by
`HttpClient` (or `of(...)` for mock adapters) all the way from the adapter up to the
component.

This was verified directly against the installed package, not assumed:
- `grep -rn "pendingTasks" node_modules/@angular/core/fesm2022/_resource-chunk.mjs` shows
  `resource()`/`rxResource()` register themselves with `PendingTasks` internally
  (`this.pendingTasks = injector.get(PendingTasks)` / `this.pendingTasks.add()`), which is why
  `Home`'s constructor no longer needs to manually wrap each data load in
  `PendingTasks.run(...)` the way the previous Promise-based implementation did.

## The resulting layering

- **`domain/port/*.ts`**: every method returns `Observable<T>` (e.g.
  `StatsPort.getHomeStats(lang: string): Observable<Stat[]>`).
- **`infrastructure/adapter/*-api.adapter.ts`**: use `HttpClient.get<T>(...)` (RxJS
  `Observable`, injected via `inject(HttpClient)`), not `fetch()`/`Promise`. `HttpClient`
  already surfaces non-2xx responses as an `Observable` error (`HttpErrorResponse`), so there
  is no need for the manual `if (!response.ok) throw ...` check the previous `fetch()`-based
  adapters had.
- **`infrastructure/adapter/*-mock.adapter.ts`**: use `of(...)` (and `throwError(...)` for the
  "not found" case) to stay `Observable`-shaped without a real backend.
- **`application/service/*.ts`**: pass the `Observable` through (optionally `.pipe(map(...))`
  to reshape into a DTO); never `await`s a port, never returns a `Promise`.
- **`presentation/pages/home/home.ts`**: each section (`content`, `stats`, `domainAreas`,
  `latestNews`, `partnerList`) is a `rxResource({ params: () => this.i18n.currentLang(),
  stream: ({ params }) => this.service.getX(params) })`. Because `params` is the `i18n`
  signal, changing the language automatically reloads every section — the manual
  `effect(() => { ... loadContent(lang); loadSections(lang); })` +
  `Promise.all([...])` orchestration from the previous implementation is gone; `rxResource`
  does the re-fetch-on-param-change and pending-task bookkeeping itself. `computed(...)`
  wrappers around each resource's `.value()` keep the exact same public field names/types
  (`title`, `stats`, `domainAreas`, etc.) that `home.html` already binds to, so the template
  did not need to change.
- **One-shot actions** (`LeadCapturePort.submit`, consumed from `ressources.ts`'s submit
  button) are also `Observable`-returning, but are *subscribed* imperatively from the
  component's event handler rather than wrapped in a `resource` — they are not a
  signal-driven "load", just an RxJS-shaped fire-and-handle-response action.

## Practical consequence for mock vs. API adapters

Both `*-mock.adapter.ts` and `*-api.adapter.ts` implement the same `Observable`-returning port
interface, so `app.config.ts`'s `RuntimeConfig.isMock()` switch keeps working unchanged — the
two adapter families are interchangeable at the type level exactly as before, just with
`Observable<T>` instead of `Promise<T>`.
