````md
# Prompt Claude Code — Remplissage des pages d'expertise OEI

# Contexte

Le site OEI possède déjà :

- une Home Page ;
- une page À propos ;
- une page Livre Blanc ;
- une page Déontologie ;
- une page Ressources ;
- une page Actualités ;
- une architecture multilingue FR / EN.

Il reste à compléter les pages d'expertise accessibles depuis la navigation principale.

Ces pages sont des pages institutionnelles et éditoriales.

Elles doivent :

- être riches en contenu ;
- être optimisées SEO ;
- être internationalisées ;
- être compatibles CMS ;
- utiliser le même composant de navigation longue page que la page À propos et le Livre Blanc ;
- être alimentées par du contenu statique dans un premier temps ;
- pouvoir être enrichies dynamiquement dans le futur.

---

# Règles UX communes

Toutes les pages doivent partager le même modèle.

## Structure

```text
Hero
 ↓
Introduction
 ↓
Sommaire sticky
 ↓
Sections
 ↓
Ressources associées
 ↓
Actualités associées
 ↓
CTA contribution
```

## Navigation

Utiliser :

```text
LongPageSectionNavigationComponent
```

Fonctionnalités :

- sticky navigation ;
- ancres ;
- scroll fluide ;
- section active ;
- support mobile ;
- support clavier ;
- deep links.

Exemple :

```text
/cybersecurity#governance
/cybersecurity#risk-management
```

---

# Internationalisation

Tous les contenus doivent exister :

- Français
- Anglais

L'anglais devient la langue de référence.

Organisation :

```text
content/
├── fr/
└── en/
```

---

# CTA commun

En bas de chaque page :

```text
Contribuer à cette thématique
```

Le CTA permet plus tard :

- proposer un article ;
- proposer une ressource ;
- proposer un événement ;
- proposer une mise à jour.

Pour la V1 :

rediriger vers le formulaire de contact.

---

# Page 1 — Cybersecurity

Route :

```text
/cybersecurity
```

Icône :

```text
Shield
```

Titre :

```text
Cybersecurity
```

Sous-titre :

```text
Protecting digital infrastructures, critical systems and public trust.
```

Sections :

## Introduction

Pourquoi la cybersécurité est devenue un enjeu sociétal.

## Threat Landscape

- ransomware ;
- espionnage ;
- attaques étatiques ;
- supply chain ;
- cloud threats ;
- AI threats.

## Security by Design

- secure development ;
- DevSecOps ;
- zero trust ;
- IAM ;
- secrets management.

## Governance

- ISO 27001 ;
- NIST ;
- DORA ;
- NIS2 ;
- réglementations internationales.

## Skills & Careers

- SOC ;
- pentest ;
- architecture sécurité ;
- GRC ;
- cloud security.

## OEI Position

Position de l’OEI sur la responsabilité des experts.

---

# Page 2 — Artificial Intelligence

Route :

```text
/artificial-intelligence
```

Icône :

```text
Brain
```

Titre :

```text
Artificial Intelligence
```

Sections :

## Introduction

## Machine Learning

## Generative AI

## Responsible AI

- biais ;
- transparence ;
- explicabilité ;
- gouvernance.

## AI Safety

## AI and Society

## Future Skills

## OEI Position

---

# Page 3 — Continuous Learning

Route :

```text
/continuous-learning
```

Icône :

```text
GraduationCap
```

Titre :

```text
Continuous Learning
```

Sections :

## Why Lifelong Learning Matters

## Certifications

## Academic Education

## Professional Training

## Self Learning

## Mentorship

## Knowledge Sharing

## OEI Position

---

# Page 4 — Architecture & Quality

Route :

```text
/architecture-quality
```

Icône :

```text
Building2
```

Titre :

```text
Architecture & Quality
```

Sections :

## Software Architecture

## Enterprise Architecture

## Cloud Architecture

## Quality Engineering

## Testing Strategies

## Observability

## Technical Debt

## OEI Position

---

# Page 5 — Green IT

Route :

```text
/green-it
```

Icône :

```text
Leaf
```

Titre :

```text
Green IT
```

Sections :

## Introduction

## Digital Carbon Footprint

## Sustainable Software

## Energy Efficiency

## Infrastructure Optimization

## Cloud Sustainability

## Measurement & Metrics

## OEI Position

---

# Page 6 — Data Protection

Route :

```text
/data-protection
```

Icône :

```text
Database
```

Titre :

```text
Data Protection
```

Sections :

## Why Data Matters

## Privacy by Design

## GDPR

## International Regulations

## Data Governance

## Data Classification

## Data Retention

## OEI Position

---

# Page 7 — Critical Software

Route :

```text
/critical-software
```

Icône :

```text
Activity
```

Titre :

```text
Critical Software Systems
```

Sections :

## Definition

## Aviation

## Healthcare

## Finance

## Energy

## Public Services

## Reliability Engineering

## Safety Standards

## Incident Analysis

## OEI Position

---

# Page 8 — Ethics & Society

Route :

```text
/ethics-society
```

Icône :

```text
Scale
```

Titre :

```text
Ethics & Society
```

Sections :

## Why Ethics Matters

## Public Interest Software

## Human Rights

## Accessibility

## Inclusion

## Algorithmic Fairness

## Professional Responsibility

## Future Challenges

## OEI Position

---

# Ressources associées

Chaque page affiche en bas :

```text
Related Resources
```

Exemples :

- Livre Blanc ;
- Code de Déontologie ;
- Guides ;
- Études ;
- Rapports.

Ces données doivent venir du backend plus tard.

Pour la V1 :

mock data.

---

# Actualités associées

Bloc :

```text
Related News
```

Filtré par thématique.

Exemples :

```text
Cybersecurity News
AI News
Green IT News
```

Backend plus tard.

Mock data en V1.

---

# SEO

Chaque page doit avoir :

- title ;
- description ;
- keywords ;
- OpenGraph ;
- Twitter Cards ;
- canonical URL ;
- JSON-LD.

---

# Accessibilité

Respecter :

- WCAG ;
- navigation clavier ;
- contraste ;
- lecteurs d'écran ;
- ancres accessibles.

---

# Livrables

Créer :

```text
/pages
├── Cybersecurity
├── ArtificialIntelligence
├── ContinuousLearning
├── ArchitectureQuality
├── GreenIT
├── DataProtection
├── CriticalSoftware
└── EthicsSociety
```

Créer également :

```text
content/
├── fr/
│   ├── cybersecurity.md
│   ├── ai.md
│   ├── learning.md
│   ├── architecture.md
│   ├── green-it.md
│   ├── data-protection.md
│   ├── critical-software.md
│   └── ethics.md
│
└── en/
    ├── cybersecurity.md
    ├── ai.md
    ├── learning.md
    ├── architecture.md
    ├── green-it.md
    ├── data-protection.md
    ├── critical-software.md
    └── ethics.md
```

Le contenu doit être rédigé avec un ton institutionnel international, cohérent avec le Livre Blanc OEI et la vision d'une profession informatique responsable, compétente et tournée vers l'intérêt général.
````

Je te conseille d’ajouter également une neuvième page que je considère presque aussi importante que la cybersécurité :

```text
Standards & Professional Practices
```

Elle deviendrait la page où l’OEI explique :

* ISO ;
* IEEE ;
* ACM ;
* Open Source ;
* RFC ;
* OWASP ;
* OpenAPI ;
* Architecture Decision Records ;
* documentation ;
* revues de code ;
* qualité logicielle ;
* gouvernance technique.

Cette page ferait le lien direct entre ton Livre Blanc et l’idée centrale de l’OEI : non pas réglementer la technologie, mais promouvoir l’adoption de standards professionnels communs à l’échelle internationale.
