# Boutique OEI — architecture technique

*Section la plus importante de cette spec — exigence explicite et non négociable du porteur de projet. À relire intégralement avant de commencer l'implémentation.*

## 1. Nouveau module Maven `infrastructure/client`

Nouveau module, sibling de `infrastructure/persistence`, `infrastructure/security`, `infrastructure/wiring` :

```text
backend/
  infrastructure/
    pom.xml                 # parent infrastructure, <module>client</module> ajouté
    persistence/
    security/
    wiring/
    client/                 # NOUVEAU
      pom.xml
      src/main/java/global/oei/infrastructure/client/
        stripe/             # client Stripe généré + adapter handwritten
        paypal/              # client PayPal généré + adapter handwritten
        payment/             # PaymentProviderBinder (voir §2)
    mail/                   # NOUVEAU, voir 03-emails-transactionnels.md §3
```

Responsabilité : intégrer Stripe et PayPal via `RestClient` + interfaces `@HttpExchange`, **contract-first** — jamais de client HTTP écrit à la main sans contrat, jamais de DTO Stripe/PayPal qui fuit au-delà de ce module (mappés vers `domain-shared` avant de traverser le port `PaymentProviderPort`).

Dépend de `domain-shared` (implémente `PaymentProviderPort`), jamais de `domain-core`. Wiré depuis `infrastructure/wiring/OeiWiringConfiguration` comme tous les autres adapters.

## 2. Contract-first pour Stripe et PayPal

Suivre exactement le flux déjà en place pour les APIs inbound de ce projet (`application/web/src/main/resources/openapi/oei-api.yaml` + `openapi-generator-maven-plugin`), mais en sens outbound :

1. **Récupérer les specs OpenAPI officielles** de Stripe (`https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json`, publique) et PayPal (PayPal publie ses specs OpenAPI par produit — ex. Orders v2 API — sur son portail développeur) et les copier en local dans `infrastructure/client/src/main/resources/openapi/stripe-api.yaml` / `paypal-api.yaml`. Ces specs officielles sont **volumineuses** (des centaines d'endpoints) — **réduire à un sous-ensemble réel** contenant uniquement les opérations dont ce projet a besoin (créer une intention de paiement/charge, confirmer un paiement, rembourser — voir la liste précise ci-dessous), en retirant le reste du document pour garder le contrat maintenable et la génération rapide. Documenter en commentaire en tête de chaque fichier réduit qu'il s'agit d'un sous-ensemble de la spec officielle, avec la date/version de référence.
2. **Opérations Stripe nécessaires** (v1 charges/PaymentIntents — utiliser l'API PaymentIntents, plus moderne que l'ancienne Charges API) : créer un `PaymentIntent`, le confirmer, le récupérer (statut), créer un `Refund`.
3. **Opérations PayPal nécessaires** (Orders v2 API) : créer un `Order` PayPal (attention à la collision de nom avec le `Order` du domaine OEI — nommer le DTO généré/l'adapter sans ambiguïté, ex. package `global.oei.infrastructure.client.paypal` isolé), le capturer (`capture`), le récupérer, créer un remboursement (`refund` sur une capture).
4. **Génération.** `openapi-generator-maven-plugin`, exécuté dans `infrastructure/client/pom.xml`, avec `<library>spring-http-interface</library>` (génère des interfaces annotées `@HttpExchange`, consommées via `RestClient` + `HttpServiceProxyFactory`, pas `RestTemplate`/`WebClient`) — un `execution` par fournisseur (`inputSpec` différent, `apiPackage`/`modelPackage` différents pour éviter toute collision).
5. **Configuration RestClient.** Un `RestClient` par fournisseur (base URL sandbox par défaut en dev via variable d'environnement, ex. `OEI_STRIPE_API_BASE_URL`/`OEI_PAYPAL_API_BASE_URL`, bascule vers les URLs de production en prod), authentification par clé API (Stripe : `Authorization: Bearer <secret key>` en en-tête, injecté via un `ClientHttpRequestInterceptor` — jamais loggé) / OAuth2 client-credentials pour PayPal (PayPal exige un token OAuth2 préalable — soit un `RestClient` dédié à l'obtention du token avec cache/rafraîchissement simple, soit un intercepteur qui gère le refresh ; à garder aussi simple que possible en V1, pas de vraie librairie OAuth2 lourde si un simple cache in-memory avec expiration suffit).
6. **Handwritten adapter.** Chaque fournisseur a un adapter (`StripePaymentProviderAdapter`, `PaypalPaymentProviderAdapter`) qui implémente `PaymentProviderPort`, appelle l'interface `@HttpExchange` générée, mappe la réponse vers les types `domain-shared` (`Payment`, `PaymentStatus`), et traduit toute erreur HTTP/métier du fournisseur (codes d'erreur Stripe/PayPal documentés dans leurs specs) vers `PaymentFailureReason` (voir `02-paiement.md §4`) — jamais une exception brute du client généré qui fuit au-delà de l'adapter.

## 3. Pattern Enum Strategy + Binder — reproduction exacte du modèle IAP

Modèle de référence relu avant d'écrire cette spec (à ne jamais dupliquer/résumer de mémoire en implémentation — relire ces 3 fichiers directement avant de coder le pattern OEI) :

- `/Users/ydeungoue/projects/iap/iap-apps-platform/domain/shared/src/main/java/com/pictet/iap/domain/shared/common/model/SourceType.java`
- `/Users/ydeungoue/projects/iap/iap-apps-platform/domain/shared/src/main/java/com/pictet/iap/domain/shared/document/port/out/ingestion/InboundDownloadPort.java`
- `/Users/ydeungoue/projects/iap/iap-apps-platform/infrastructure/src/main/java/com/pictet/iap/infrastructure/adapter/document/extraction/binder/InboundDownloadBinder.java`

### 3.1 `PaymentMethod` (domain-shared, enum strategy)

```java
package global.oei.domain.shared.payment;

import lombok.Getter;
import lombok.Setter;

/**
 * Payment method chosen by a member at checkout. Delegates the actual charge/refund to a
 * {@link PaymentProviderPort} bound by {@code PaymentProviderBinder} (infrastructure-client)
 * at startup — no Spring/HTTP import here, this enum stays framework-agnostic like every
 * other domain-shared type.
 */
public enum PaymentMethod {

    CARD {
        @Override
        public Payment charge(final ChargeRequest request) {
            return getProviderPort().charge(request);
        }

        @Override
        public Payment refund(final Payment payment) {
            return getProviderPort().refund(payment);
        }
    },
    PAYPAL {
        @Override
        public Payment charge(final ChargeRequest request) {
            return getProviderPort().charge(request);
        }

        @Override
        public Payment refund(final Payment payment) {
            return getProviderPort().refund(payment);
        }
    };
    // Extensible: a future SEPA/wire-transfer method is a new enum constant + a new
    // PaymentProviderPort implementation, never a change to this abstract contract.

    @Getter
    @Setter
    private PaymentProviderPort providerPort;

    public abstract Payment charge(ChargeRequest request);

    public abstract Payment refund(Payment payment);
}
```

### 3.2 `PaymentProviderPort` (domain-shared, functional outbound port)

```java
package global.oei.domain.shared.payment;

/**
 * Outbound port — one implementation per {@link PaymentMethod} (Stripe for CARD, PayPal for
 * PAYPAL), bound at startup by {@code PaymentProviderBinder} in infrastructure-client.
 */
@FunctionalInterface
public interface PaymentProviderPort {

    /**
     * Declares the {@link PaymentMethod} handled by this port. Implementations must override
     * this explicitly — the default fails fast to make a missing declaration obvious at
     * startup binding time.
     */
    default PaymentMethod supportedPaymentMethod() {
        throw new UnsupportedOperationException("PaymentProviderPort must declare supportedPaymentMethod()");
    }

    Payment charge(ChargeRequest request);

    default Payment refund(final Payment payment) {
        throw new UnsupportedOperationException(supportedPaymentMethod() + " does not support refund()");
    }
}
```

(Note : `refund` a un défaut qui `throw`s plutôt que d'être toujours abstrait, au cas où un futur moyen de paiement V2 ne supporterait pas le remboursement direct — mais Stripe et PayPal supportent tous deux le remboursement, donc les deux adapters V1 l'implémentent réellement.)

### 3.3 `PaymentProviderBinder` (infrastructure-client, `@Component implements InitializingBean`)

```java
package global.oei.infrastructure.client.payment;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.payment.PaymentMethod;
import global.oei.domain.shared.payment.PaymentProviderPort;

/**
 * Binds each {@link PaymentProviderPort} to its {@link PaymentMethod} at startup.
 */
@Slf4j
@Component
public class PaymentProviderBinder implements InitializingBean {

    private final Map<PaymentMethod, PaymentProviderPort> portsByMethod;

    public PaymentProviderBinder(final List<PaymentProviderPort> ports) {
        portsByMethod = new EnumMap<>(PaymentMethod.class);
        ports.forEach(port -> portsByMethod.put(port.supportedPaymentMethod(), port));
    }

    @Override
    public void afterPropertiesSet() {
        portsByMethod.forEach(PaymentMethod::setProviderPort);
        log.info("PaymentProvider ports bound: {}/{}", portsByMethod.size(), PaymentMethod.values().length);

        for (final PaymentMethod method : PaymentMethod.values()) {
            if (!portsByMethod.containsKey(method)) {
                log.error("No PaymentProviderPort registered for PaymentMethod.{}", method);
            }
        }
    }
}
```

`StripePaymentProviderAdapter implements PaymentProviderPort` overrides `supportedPaymentMethod()` to return `CARD`; `PaypalPaymentProviderAdapter` overrides it to return `PAYPAL`. Both are plain `@Component` beans in `infrastructure/client`, picked up automatically by Spring component scanning from `application/web`'s composition root (same mechanism already used for every other adapter in this project) — no manual wiring needed beyond declaring the beans, `PaymentProviderBinder` does the enum binding at `afterPropertiesSet()`.

**Différence à noter avec le modèle IAP relu ci-dessus :** dans IAP, le binder vit dans le module `infrastructure` générique (`InboundDownloadBinder`). Ici, comme demandé explicitement, le binder vit dans `infrastructure-client` (le module qui possède les deux implémentations Stripe/PayPal) — cohérent puisque OEI a déjà plusieurs modules infrastructure distincts (`persistence`, `security`, `wiring`, et maintenant `client`), contrairement à IAP qui n'en a qu'un seul.

## 4. Modèle de domaine du store (domain-shared / domain-core)

### `domain-shared` (records + enums + ports, aucun import Spring/JPA)

- `ProductCategory` (voir `01-catalogue-produits.md §1`) : `id`, `code` (slug stable), `label`, `fulfillmentKind` (probablement un enum simple `PHYSICAL_GOODS`/`PRINT_AND_SHIP` si la distinction est utile ; sinon absente).
- `Product` : `id`, `categoryId`, `sku`, `name`, `description`, `unitPriceAmount` + `unitPriceCurrency` (ou un petit VO `Money` si le projet n'en a pas déjà un ailleurs — vérifier `MembershipFeePayment`/`amount` pour voir si un pattern `Money` existe déjà à réutiliser plutôt que dupliquer), `active`, `customizable`.
- `BusinessCardTemplate` : voir `01-catalogue-produits.md §3.1` pour la décision enum vs entité de référence.
- `BusinessCardCustomization` (record, value object porté par `OrderLine`) : voir `01-catalogue-produits.md §3.2`.
- `Order` (aggregate root) : `id`, `memberId` (nullable si achat sans compte est finalement autorisé, sinon non-null), `lines` (`List<OrderLine>`), `totalAmount`/`totalCurrency`, `status` (`OrderStatus`), `createdAt`, `paidAt` (nullable), méthodes riches : `Order.pay(Payment)` (transition `PENDING_PAYMENT` → `PAID`, invariant : refuse si déjà payé), `Order.markFulfillmentPending()` (transition `PAID` → `PENDING_FULFILLMENT`), `Order.cancel()`, `Order.refund()` — même style que `Content`/`ContentWorkflowStatus` déjà en place (state machine explicite avec `require(...)`/`requireOneOf(...)` guards, voir `domain/shared/src/main/java/global/oei/domain/shared/content/Content.java` pour le modèle exact à suivre).
- `OrderLine` : `id`, `orderId`, `productId`, `quantity`, `unitPriceAmountAtOrder` (capturé au moment de la commande, ne doit jamais varier si le prix catalogue change après coup), `businessCardCustomization` (nullable), `sourceReferenceId` (nullable, voir `01-catalogue-produits.md §2`).
- `OrderStatus` (enum simple, pas de enum strategy ici — pas de comportement polymorphe par statut au-delà des transitions déjà exprimées comme méthodes sur `Order`) : voir `02-paiement.md §2`.
- `Payment` : `id`, `orderId`, `paymentMethod` (`PaymentMethod`), `providerReference` (id Stripe/PayPal externe, pour rapprochement/support), `amount`/`currency`, `status` (`PaymentStatus`), `failureReason` (nullable, `PaymentFailureReason`), `createdAt`, `succeededAt` (nullable).
- `PaymentStatus`, `PaymentFailureReason` : enums simples, voir `02-paiement.md §2` et `§4`.
- `ChargeRequest` : record porté par l'appel à `PaymentMethod.charge(...)` — `orderId`, `amount`, `currency`, `memberId`, et tout champ spécifique nécessaire à l'initiation (ex. un token de carte déjà tokenisé côté frontend via Stripe.js — **le backend ne doit jamais recevoir/manipuler un numéro de carte brut**, seulement un token opaque déjà généré côté client, conformément aux exigences PCI-DSS standard de toute intégration Stripe).
- Ports : `ProductPort`, `OrderPort`, `PaymentPort` (persistence, `infrastructure/persistence`), `PaymentProviderPort` (voir §2/§3, `infrastructure/client`).

### `domain-core` (services/use cases avec règles métier réelles)

- `CreateOrderService` : calcule le total serveur, valide que chaque produit référencé est `active`, construit l'`Order` au statut `PENDING_PAYMENT`.
- `PayOrderService` : résout le `PaymentMethod`, appelle `.charge(...)`, transitionne l'`Order` selon le résultat, déclenche l'événement qui fera partir l'email de confirmation (voir `03-emails-transactionnels.md §3`).
- `RefundOrderService` : action admin, résout le `PaymentMethod` d'origine du paiement, appelle `.refund(...)`.

## 5. Endpoints OpenAPI (tag `store`, contract-first comme tout le reste)

Nouvelles opérations à ajouter dans `application/web/src/main/resources/openapi/oei-api.yaml` (ne pas casser les opérations existantes — ajouter un nouveau bloc de chemins, suivre exactement le style déjà en place dans ce fichier) :

- `PublicStoreApi` (public, sous `/api/public/v1/store/**`, à ajouter à `oei.security.public-urls` comme tous les autres endpoints publics) :
  - `GET /api/public/v1/store/products` — catalogue (liste, filtrable par catégorie).
  - `GET /api/public/v1/store/products/{id}` — détail produit.
  - `GET /api/public/v1/store/business-card-templates` — templates disponibles.
- `MemberStoreApi` (authentifié membre, sous `/api/member/v1/store/**`) :
  - `POST /api/member/v1/store/business-card-preview` — génère un `BusinessCardPreview` à partir d'une personnalisation en cours (voir `01-catalogue-produits.md §3.1` étape 3).
  - `POST /api/member/v1/store/orders` — crée une commande (`PENDING_PAYMENT`).
  - `GET /api/member/v1/store/orders` — historique des commandes du membre.
  - `GET /api/member/v1/store/orders/{id}` — détail d'une commande.
  - `POST /api/member/v1/store/orders/{id}/payments` — initie/confirme le paiement (reçoit le `PaymentMethod` + le token de paiement déjà tokenisé côté client).
- `AdminStoreApi` (authentifié admin, sous `/api/admin/v1/store/**`) :
  - `GET /api/admin/v1/store/orders` — vue admin de toutes les commandes (filtrable par statut, utile pour le suivi manuel du fulfillment mocké — c'est là que l'équipe OEI saura "quelles commandes sont en attente d'impression/envoi réel" tant que le fulfillment n'est pas automatisé).
  - `POST /api/admin/v1/store/orders/{id}/refund` — remboursement (voir `02-paiement.md §3`).

## 6. Tests — dès l'implémentation, pas après-coup

Pour chaque nouvelle opération/adapter introduit par ce chantier (norme déjà en place sur ce projet depuis plusieurs itérations) :

- Test Web MockMvc (`MockMvcBuilders.standaloneSetup(...)`, jamais `@WebMvcTest`) pour chaque nouveau `*Resource`.
- Test Testcontainers Postgres pour chaque nouvel adapter JPA (`ProductPersistenceAdapter`, `OrderPersistenceAdapter`, `PaymentPersistenceAdapter`).
- Test unitaire domaine (`domain-core`) pour chaque service avec règles métier réelles (`CreateOrderService`, `PayOrderService`, `RefundOrderService`) — mock du `PaymentProviderPort`/`EnumMap` de test pour ne jamais appeler un vrai Stripe/PayPal en test unitaire.
- Test d'intégration `PaymentProviderBinder` (sur le modèle d'`OeiWiringConfigurationTest` déjà en place) vérifiant que les deux `PaymentMethod` ont bien un port lié au démarrage.
- **Ne jamais appeler les vraies API Stripe/PayPal (même sandbox) depuis les tests automatisés** — utiliser WireMock ou un stub HTTP local pour simuler les réponses fournisseur dans les tests d'adapter (`StripePaymentProviderAdapterTest`, `PaypalPaymentProviderAdapterTest`), afin que `mvn clean verify` reste rapide, déterministe, et exécutable sans accès réseau/clé sandbox valide en CI.
- Cucumber : au moins un scénario métier "un membre achète un produit boutique et paie par carte, la commande passe en attente de fulfillment" (avec le `PaymentProviderPort` remplacé par un stub de test dans le contexte d'acceptance, suivant le même principe que `AcceptanceTestSecurityConfig` déjà en place pour l'auth).
