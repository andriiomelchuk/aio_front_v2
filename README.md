# AIO Frontend V2

**A modular Next.js / React / TypeScript portfolio project**

[English](#english) · [Deutsch](#deutsch)

---

## English

### About the project

AIO Frontend V2 is a frontend-focused demonstration application built to explore modern React and Next.js development. The public repository includes an e-commerce interface, administration screens, and additional interactive UI examples.

**Status:** Work in progress — portfolio/demo application, **not a production-ready commerce or authentication system**.

### Features represented in the source

- Product and category catalog, filtering and sorting
- Product variants, wishlist and product comparison
- Shopping cart with quantity, price and discount calculations
- Checkout forms and order data preparation
- Account-related screens and administrative interfaces (products, orders, users and operational modules)
- Additional GitHub- and movie-related interactive pages
- Responsive UI and automated test scenarios

These are areas implemented or represented in the codebase; not every workflow has been independently verified as operational end-to-end.

### Tech stack

| Area | Technologies |
| --- | --- |
| Framework | Next.js, React, TypeScript |
| State management | Redux Toolkit, React Redux |
| Forms and validation | React Hook Form, Zod |
| UI and styling | Tailwind CSS, styled-components, Lucide React |
| Drag and drop | dnd-kit |
| Testing | Vitest, Playwright |

### Project structure

```text
src/
├── app/          # Next.js routes and layouts
├── entities/     # Domain entities and models
├── features/     # Feature-specific UI and logic
├── widgets/      # Larger interface blocks
├── shared/       # Shared API layer, state, hooks and UI
├── components/   # Additional application components
└── lib/          # Utilities and integrations
```

### Run locally

Use a Node.js version supported by this project's Next.js release and install npm dependencies:

```bash
git clone https://github.com/andriiomelchuk/aio_front_v2.git
cd aio_front_v2
npm ci
npm run dev
```

Open http://localhost:3000.

```bash
npm run lint       # Static linting
npm run test       # Vitest unit tests
npm run build      # Next.js production build
npm run test:e2e   # Playwright browser tests
```

The Playwright configuration requests the Chrome browser channel and starts the development server. E2E scenarios may require suitable browser installation and demonstration data. Passing tests or a successful deployment are **not** claimed here.

### Testing approach

Examples include unit tests for cart totals and order-data generation, plus browser tests for checkout, administration flows, and responsive layouts. Desktop and mobile viewport configurations are present.

### Demo and security limitations

The public version includes browser-local account/session and demonstration data. **Client-side authorization checks are UI demonstrations, not real security boundaries.** Development credentials present in source/tests are **demo-only**, must never protect a real service, and should not be reused. A production deployment would require trusted server-side authentication, authorization and validation of prices, inventory and orders. Do not use the demo with sensitive or real customer data.

This repository should be evaluated as a frontend code sample; it makes no claim about the architecture or implementation of any other project.

**Developer:** [Andrii Omelchuk](https://github.com/andriiomelchuk)  
**LinkedIn:** [andrii-omelchuk-dev](https://www.linkedin.com/in/andrii-omelchuk-dev/)

---

## Deutsch

### Über das Projekt

AIO Frontend V2 ist eine Frontend-Demonstrationsanwendung, mit der moderne React- und Next.js-Entwicklung praktisch umgesetzt wird. Das öffentliche Repository enthält eine E-Commerce-Oberfläche, Verwaltungsansichten und weitere interaktive UI-Beispiele.

**Status:** In Entwicklung – Portfolio-/Demoanwendung, **keine produktionsreife Shop- oder Authentifizierungslösung**.

### Funktionsbereiche im Quellcode

- Produkt- und Kategorienkatalog mit Filtern und Sortierung
- Produktvarianten, Wunschliste und Produktvergleich
- Warenkorb mit Mengen-, Preis- und Rabattberechnung
- Checkout-Formulare und Aufbereitung von Bestelldaten
- Benutzeroberflächen für Konten und Administration (Produkte, Bestellungen, Benutzer und weitere Bereiche)
- Zusätzliche interaktive Beispiele zu GitHub und Filmen
- Responsive Oberflächen und automatisierte Testszenarien

Diese Bereiche sind im Code vorhanden bzw. angelegt. Nicht jeder Ablauf wurde unabhängig Ende-zu-Ende auf seine Funktionsfähigkeit geprüft.

### Technologien

| Bereich | Technologien |
| --- | --- |
| Framework | Next.js, React, TypeScript |
| State Management | Redux Toolkit, React Redux |
| Formulare und Validierung | React Hook Form, Zod |
| UI und Styling | Tailwind CSS, styled-components, Lucide React |
| Drag & Drop | dnd-kit |
| Tests | Vitest, Playwright |

### Projektstruktur

```text
src/
├── app/          # Next.js-Routen und Layouts
├── entities/     # Fachliche Modelle und Entitäten
├── features/     # Funktionen und zugehörige Logik
├── widgets/      # Größere UI-Bereiche
├── shared/       # Gemeinsame API-Schicht, State, Hooks und UI
├── components/   # Weitere Anwendungskomponenten
└── lib/          # Hilfsfunktionen und Integrationen
```

### Lokal starten

Eine mit der verwendeten Next.js-Version kompatible Node.js-Version wird vorausgesetzt.

```bash
git clone https://github.com/andriiomelchuk/aio_front_v2.git
cd aio_front_v2
npm ci
npm run dev
```

Die Anwendung unter http://localhost:3000 öffnen.

```bash
npm run lint       # Statische Codeprüfung
npm run test       # Vitest-Unit-Tests
npm run build      # Next.js-Produktions-Build
npm run test:e2e   # Playwright-Browsertests
```

Playwright verwendet laut Konfiguration den Chrome-Kanal und startet einen lokalen Entwicklungsserver. Für die E2E-Tests können eine passende Browserinstallation und Demodaten erforderlich sein. Es wird nicht behauptet, dass sämtliche Tests erfolgreich durchlaufen oder ein Deployment erfolgt ist.

### Testansatz

Das Repository enthält unter anderem Unit-Tests für Warenkorbsummen und Bestelldaten sowie Browser-Tests für Checkout, Administrationsabläufe und responsive Layouts. Konfigurationen für Desktop- und Mobilansichten sind vorhanden.

### Einschränkungen der Demo und Sicherheit

Die öffentliche Version verwendet teilweise browserlokale Konto-, Sitzungs- und Demodaten. **Clientseitige Berechtigungsprüfungen demonstrieren UI-Verhalten und sind keine wirksame Sicherheitsgrenze.** Im Code und in Tests enthaltene Entwicklerzugänge sind **ausschließlich Demozugänge**. Sie dürfen keine echten Dienste schützen oder wiederverwendet werden. Ein produktiver Einsatz erfordert serverseitige Authentifizierung, Autorisierung und die Prüfung von Preisen, Lagerbestand und Bestellungen. Für die Demo dürfen keine echten sensiblen Kundendaten verwendet werden.

Das Repository dient als Frontend-Codebeispiel; es macht keine Aussagen zur Architektur oder Implementierung anderer Projekte.

**Entwickler:** [Andrii Omelchuk](https://github.com/andriiomelchuk)  
**LinkedIn:** [andrii-omelchuk-dev](https://www.linkedin.com/in/andrii-omelchuk-dev/)
