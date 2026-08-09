# Logging infrastructure

Structured, correlation-aware logging for OEI's Angular frontend, so a user's journey can be
traced end-to-end (browser console today, a real log-collection backend later) — see
`.prompt/plan/final/00-AWS-DEPLOYMENT-AND-DEVOPS-PROMPT.md`, section "Logs": *"JSON stdout
avec correlationId/requestId. Ne jamais logger tokens, mots de passe, CV complets ou
secrets."*

## Where this comes from

The pattern is ported from `iap-apps-ui`'s `projects/iap-common/src/lib/logger` and
`src/lib/interceptors/correlation`, another Pictet/OEI-adjacent Angular project's existing
logging mechanism (`IapLoggerService` + `CorrelationService` +
`correlationInterceptor`/`loggerErrorInterceptor`) — reused rather than reinvented so a
future merge of practices across projects stays plausible. **No npm dependency on
`iap-common` was introduced**: that library is not published as a reusable package across
projects, and only the *pattern* was ported, adapted to OEI's actual stack and simplified.

## What was kept

- A dedicated correlation-ID concept, generated as a UUID (or a timestamp+random fallback
  where `crypto.randomUUID` is unavailable), attached to every log line and propagated to the
  backend via an HTTP header (`X-Correlation-Id`, vs. IAP's `X-Correlation-ID` — kept
  logically identical, casing aside).
- A functional `HttpInterceptorFn` (not an `HttpInterceptor` class) that stamps outgoing
  requests and logs the request/response/error — same idea as IAP's
  `correlationInterceptor` + `loggerErrorInterceptor`, merged into one interceptor here since
  OEI doesn't need them decoupled.
- Skipping cross-origin requests (e.g. Keycloak's `/protocol/openid-connect/...` endpoints):
  adding a custom header to them would trigger a CORS preflight they're not configured for —
  copied verbatim from IAP's `correlation.interceptor.ts` comment.
- A single log level per call (`debug`/`info`/`warn`/`error`) with a `context` string and a
  `meta` bag, mirroring `IapLoggerService.log(level, message, extra)`.

## What was simplified/adapted, and why

- **No `ngx-logger` dependency.** IAP wraps `NGXLogger`, a third-party logging library. OEI
  has no such dependency installed and the deployment target ("Logs" requirement) only asks
  for JSON on stdout — which the browser console already gives us via `console.*` once the
  message is a JSON string. `LoggingService` writes `JSON.stringify(entry)` straight to
  `console.debug/info/warn/error`, no intermediate library.
- **Correlation ID is per-navigation, not per-request.** IAP's `CorrelationService.next()` is
  called once per outgoing HTTP request, so two calls made while a user is looking at the
  same page get *different* IDs. OEI's `CorrelationService` instead mints a new ID on every
  Angular Router `NavigationStart` (see its constructor) and every HTTP call made while the
  user stays on that page/journey shares it — closer to "suivre de bout en bout les
  interactions utilisateur" (an end-to-end *user journey*, not a single request-response
  pair). `renew()` is still exposed for the rare case a caller wants to force a new ID outside
  of navigation.
- **No `@Log()` method decorator, no `LoggerRef` global mutable singleton.** IAP's
  `log.decorator.ts` + `logger.ref.ts` let *any* method anywhere opt into entry/exit logging
  via a decorator backed by a module-level mutable reference to the last-constructed logger
  instance. That pattern doesn't fit Angular 22's DI-first, no-NgModule style used across this
  app (`inject()` everywhere) and adds indirection this project doesn't need yet — every log
  call site in OEI is explicit: `inject(LoggingService)` and a direct `.info(...)`/`.error(...)`
  call.
- **No `IapLoggerModule.forRoot(...)`, no `LOGGER_OPTIONS` injection token, no NgModule at
  all.** `LoggingService` and `CorrelationService` are plain `@Service()`-annotated classes
  (this app's `providedIn: 'root'`-equivalent, see `infrastructure/config/runtime-config.ts`
  for the same pattern) — no module to import, no options object to configure at bootstrap.
  The only wiring needed is `httpLoggingInterceptor` added to `provideHttpClient(withFetch(),
  withInterceptors([httpLoggingInterceptor]))` in `app.config.ts`.
- **Sensitive-field redaction is new** (IAP's version does not filter log content — its
  `loggerErrorInterceptor` only logs `status`/`message`/`url`/`method`, so the question never
  came up there). OEI's HTTP interceptor also logs request/response *bodies* to make the
  end-to-end trace actually useful (`rxResource`/one-shot submissions carry meaningful
  payloads), which makes redaction mandatory per the "Logs" requirement. See
  `sensitive-data.filter.ts`.
- **No remote log shipping (Loki or otherwise).** IAP's `LoggerOptions.lokiEnabled`/`lokiUrl`
  are not ported — OEI currently has no log-collection backend, and stdout/console is
  sufficient at this stage (see "Extending" below for how to add one later).

## Files

- `log-entry.ts` — the `LogEntry`/`LogLevel` shapes.
- `correlation.service.ts` — mints/renews the per-navigation correlation ID.
- `sensitive-data.filter.ts` — `redactSensitiveData(value)`: recursively redacts fields whose
  *name* matches a known-sensitive pattern (`token`, `password`, `secret`, `authorization`,
  `credential`, and OEI-domain-specific ones: `cv`, `curriculum`, `resume`, `coverLetter`,
  `profileBody`, `fullProfile`), and additionally redacts/truncates by *value* — a JWT-shaped
  string (`xxx.yyy.zzz`) is redacted wherever it appears, and any string over 300 characters
  (e.g. a CV body logged under an innocuous key) is truncated to `[TRUNCATED n chars]` rather
  than logged verbatim. Non-plain objects (`FormData`, `File`, `Date`, class instances) are
  replaced by an opaque `[ClassName]` marker instead of being walked, to avoid an accidental
  leak through an unexpected shape.
- `logging.service.ts` — `LoggingService.debug/info/warn/error(message, meta?, context?)`,
  builds a `LogEntry` (always redacting `meta`) and writes it as one JSON line per the
  matching `console.*` method.
- `http-logging.interceptor.ts` — `httpLoggingInterceptor`, wired in `app.config.ts`. Stamps
  same-origin requests with `X-Correlation-Id` and logs the outgoing request, the response
  (status + duration + redacted body), and any error (status/statusText + redacted error
  body) — then always rethrows the error so existing `catchError` handling in application
  services (`LeadCaptureApplicationService`, `NewsletterApplicationService`, ...) is
  unaffected.

## Where it is wired in today

- `app.config.ts` — `provideHttpClient(withFetch(), withInterceptors([httpLoggingInterceptor]))`,
  added last so it only *observes* existing HTTP calls, it doesn't change their behavior.
- `presentation/auth/keycloak-auth.service.ts` — logs `login()`/`register()`/`logout()` flow
  starts (`info`), and subscribes to `OAuthService.events` to log every `*_error`/`*error*`
  event Keycloak's `angular-oauth2-oidc` client can emit (`token_error`,
  `discovery_document_load_error`, `session_error`, ...) as `error` — the event's `reason`
  goes through the same redaction as everything else, so a token that ends up inside an
  `OAuthErrorEvent.reason` is never logged in full.
- `application/service/lead-capture-application.service.ts` and
  `application/service/newsletter-application.service.ts` — the two form-submission flows
  with an actual backend call (the static `contact` page has no submission — it is a
  `mailto:` link — and there is no "publier un article" page yet, so neither was
  instrumented). Both log a start/success/failure `info`/`warn`/`error` line, deliberately
  *never* including the submitted email address (PII, not needed to trace the journey) — only
  the outcome and, on rejection, the non-PII reason.

Deliberately **not** instrumented everywhere: most `*-api.adapter.ts` files have no explicit
logging call of their own — `httpLoggingInterceptor` already covers every HTTP call they make
transparently, which is the point of putting the hook at the interceptor level rather than
duplicating it into every adapter.

## Extending towards a real log-collection backend

Today every entry is one `JSON.stringify(...)` line passed to `console.*` — nothing more.
To ship logs to a real backend later (Loki, an OTel collector, a custom `/logs` ingestion
endpoint, ...), the natural seam is `LoggingService.write()` (private today): replace or
complement the `console.*` call with, e.g., a batched `HttpClient.post('/logs', entries)` (use
a *different*, non-intercepted client or explicitly bypass `httpLoggingInterceptor` for that
endpoint to avoid recursively logging the act of logging), flushed on an interval or via
`navigator.sendBeacon` on page unload. `CorrelationService` already gives you the join key
(`correlationId`) to reconcile frontend and backend logs for the same request — the backend
only needs to read the `X-Correlation-Id` header this app already sends and echo/log it under
the same name, exactly as IAP's real backend presumably already does for `X-Correlation-ID`.
