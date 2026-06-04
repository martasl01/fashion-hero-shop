# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project config

PROJECT: **FashionHero - Panel sellera z widgetem na dashboardzie**

ROLE: Budujesz prototyp panelu sellera FashionHero, który testuje, czy sprzedawcy chcą korzystać z konkretnych rekomendacji ws. sprzedaży zamiast analizować dashboardy.

### Cel aplikacji

FashionHero to marketplace modowy dla niezależnych sprzedawców. Prototyp dotyczy wyłącznie panelu sprzedawcy: pokazuje konkretne akcje na ten tydzień, które mogą poprawić marżę lub ograniczyć stray. Użytkownikiem jest sprzedawca, który wie, że powinien coś zmienić w sprzedaży, ale nie wie co konkretnie zrobić. Opiera się na intuicji, nie używa profesjonalnej nomenklatury takiej jak GMV.

### Wytyczne designu

- Panel seller-facing, nie landing page i nie sklep dla kupujących.
- Styl: czysty, decyzyjny, B2B e-commerce, z naciskiem na liczby i jasne CTA.
- Layout: dashboard sprzedawcy z hierarchią opartą o jedną dominującą akcję na ekranie.
- Używaj istniejących komponentów z aplikacji, by zachować spójność designu. Nie buduj custom UI gdy istnieje komponent w projekcie.

### Styl kodu

- TypeScript strictly - żadnych typów any
- Używaj istniejących komponentów i wzorców z codebase zamiast tworzyć nowe od zera

### Reguły domenowe

- Sprzedawcy to niezależne sklepy, nie pracownicy FashionHero
- Polityka zwrotów: darmowe zwroty w ciągu 14 dni (FashionHero płaci ~15 PLN za zwrot)
- Średnia wartość zamówienia: ~200 PLN. Średnia prowizja: ~44 PLN.

### Granice

ALWAYS:

- Używaj prostego języka: „co zrobić teraz", nie „analiza rentowności".
- Dodawaj stany ładowania i błędów dla operacji asynchronicznych
- Pokazuj empty states (nie zepsute layouty) gdy brakuje danych
- Zachowuj istniejącą funkcjonalność przy dodawaniu nowych feature'ów
- Używaj istniejących komponentów UI

ASK FIRST:

- Przed modyfikacją autentykacji użytkowników
- Przed dodaniem nowej biblioteki lub zależności
- Przed zmianą struktury bazy danych
- Przed zmianą nawigacji lub layoutu strony

NEVER:

- Nie buduj pełnego dashboardu analitycznego sprzedawcy
- Nie uzupełniaj pozostałych zakładek w panelu sprzedawcy
- Nie hardcoduj cen ani logiki biznesowej która powinna być w bazie danych
- Nie usuwaj ani nie modyfikuj istniejących feature'ów, komponentów ani styli, chyba że użytkownik o to poprosi
- Nie zmieniaj istniejącego kodu, który nie jest bezpośrednio związany z aktualnym zadaniem

## Commands

```bash
npm run dev      # dev server (localhost:3000)
npm run build    # production build
npm run lint     # ESLint
```

No test suite is configured.

## Architecture

This is a **Next.js 16 App Router** e-commerce storefront (React 19, TypeScript strict) cloning the visual design of [allbirds.com](https://www.allbirds.com). See `TARGET.md` for scope.

### Data layer

All product data is **hardcoded** — no backend or API. The single source of truth lives in:

- `src/data/products.ts` — `Product[]` array
- `src/data/collections.ts` — `Collection[]` array
- `src/data/sellers.ts` — `Seller[]` array

Types are defined in `src/types/index.ts` and `src/types/seller.ts`. Any "database" change means editing these files.

### State management — React Context only

`Shell` (`src/components/shell.tsx`) wraps the whole app in four providers, nested in this order:

```
AuthProvider → CartProvider → WishlistProvider → QuickViewProvider
```

Each provider exposes a custom hook (`useCart`, `useWishlist`, etc.). All state is in-memory and resets on page reload. There is no persistence layer.

### Routing

| Route | Page |
|---|---|
| `/` | Home — hero carousel + sections |
| `/collections/[slug]` | PLP — filtered product grid |
| `/products/[slug]` | PDP — image gallery + add-to-cart |
| `/checkout`, `/account`, `/wishlist`, `/about` | Stub pages |

### Component hierarchy

- **`src/components/sections/`** — homepage-only blocks (`hero-carousel`, `product-carousel`, `promo-tiles`, `category-row`, `feature-story`, `value-props`)
- **`src/components/`** — shared layout and feature components (`header`, `footer`, `cart-drawer`, `product-card`, `product-grid`, `filter-bar`, `filter-sidebar`, `mega-menu`, `search-modal`, `quick-view-modal`, `image-gallery`, etc.)
- **`src/components/ui/`** — shadcn/ui primitives (currently only `button.tsx`)

### Styling

Tailwind CSS v4 with a **warm, cream-based palette** inspired by Allbirds. Custom design tokens (oklch / hex) are declared in `src/app/globals.css` under `@theme inline`. Key tokens: `--color-cream`, `--color-charcoal`, `--color-warm-gray`. Use `cn()` from `src/lib/utils.ts` for conditional class merging.

## Business context

Product documents (PRD, feature specs) live in `context/` — this folder is local-only and not committed to Git:
- `context/prd.md` — main product requirements
- `context/features/<feature-name>.md` — per-feature specs

Read the relevant file when a task touches product scope, feature behavior, or business decisions. To load a file into the session, reference it in your prompt with `@context/prd.md`.

## Code conventions

- TypeScript strict — no `any`
- Named exports, PascalCase components, camelCase utils
- Tailwind utility classes only — no inline styles
- 2-space indentation, mobile-first responsive
- Read `node_modules/next/dist/docs/` before using any Next.js API — this is Next.js 16, which differs from training data

## Multi-agent work

When spawning Claude Code agent teams, each teammate must work in its own worktree branch. The orchestrator merges all branches at the end and resolves conflicts with full context of the goals and outcomes.
