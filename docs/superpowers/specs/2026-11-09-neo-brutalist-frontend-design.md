# Neo-Brutalist Frontend Redesign — Design Specification

## 1. Intent and Why

The current Rick and Morty character browser (`index.html`, `style.css`, `script.js`) fetches character data from the Rick and Morty REST API and renders cards with Bootstrap 5. However, first-time visitors land directly on a raw banner and two dropdowns without any introduction to what *Rick and Morty* is, the name search is hidden inside a hamburger offcanvas drawer, and the visual styling mixes default rounded Bootstrap utilities with dark backgrounds and low-contrast text (`#030303` page counter text on `#015D53`).

This redesign upgrades the project into a **modern, Neo-Brutalist, user-friendly, and professional** frontend using Bootstrap 5.3.8 and custom CSS design tokens:
1. **Orient the visitor immediately** with an editorial Neo-Brutalist introduction to the *Rick and Morty* television series and a prominent call-to-action button (`EXPLORE CHARACTERS ↓`) that scrolls directly to the character directory.
2. **Deliver an authentic Neo-Brutalist aesthetic** (thick `3px` solid `#000000` borders, crisp `0px` geometry, `6px 6px 0px` hard offset shadows, `Orbitron` display headers + monospace metadata stamps) balanced with generous whitespace, clear visual hierarchy, and high-contrast accessible typography.
3. **Make character discovery effortless** by exposing name search, status/species filters, quick-filter chips, random character discovery, result counts, and clear loading/empty states directly above the character grid.

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- Add a dedicated **Show Introduction Hero** ("Interdimensional Dossier" split layout) explaining what *Rick and Morty* is, paired with universe telemetry badges and a direct CTA button linking to the character section.
- Establish a cohesive **Portal Acid Dark** Neo-Brutalist design system in `style.css` layered cleanly on top of Bootstrap 5.3.8.
- Expose a **Unified Filter & Search Command Bar** directly above the character section while preserving all existing element IDs and filter functions (`setStatusFilter`, `setSpeciesFilter`, `openModal`, `openRandomModal`, `prevPage`, `nextPage`).
- Upgrade the **Character Cards (Option A: Full-Bleed Specimen Card)** to show `#ID` stamp, high-contrast status badge (`ALIVE`, `DEAD`, `UNKNOWN`), character portrait, name, `Species • Origin` subtitle, and a `VIEW DOSSIER →` button.
- Upgrade the **Character Modal (`#characterModal`)** into a **Classified Specimen Dossier** displaying Status, Species, Gender, Origin Dimension, Last Known Location, and Episode Count (`character.episode.length`).
- Handle loading states, empty search results (HTTP 404 from the Rick and Morty API), filter synchronization, and pagination totals (`Page X of Y`) cleanly and reliably.
- Provide an automated test suite (`tests/frontend.test.js` via Node's built-in `node --test`) verifying layout structure, design tokens, filtering, search, pagination, empty states, and modal rendering.

### Non-Goals
- Introducing a bundler, React/Vue framework, or npm build pipeline. The app must continue to run directly by opening `index.html` or serving static files.
- Adding backend servers or custom databases; all data continues to come from `https://rickandmortyapi.com/api/character`.

### Anti-Goals (What Would Make This a Failure Even If It Works)
- **Hostile/chaotic brutalism:** Cluttered text, illegible neon-on-neon contrast, jarring animations, or broken mobile layouts that sacrifice usability for style.
- **Hidden primary controls:** Forcing desktop users to open a side drawer just to search a character by name.
- **Silent failures on empty searches:** Leaving the grid blank or throwing uncaught console errors when a user searches a name that returns 404 from the API.

## 3. Constraints

- **Tech Stack:** HTML5, CSS3 (`style.css`), Vanilla JavaScript (`script.js`), Bootstrap `5.3.8` (CDN), Bootstrap Icons `1.13.1` (CDN), Google Fonts (`Orbitron`, `Open Sans`, `Space Mono`).
- **Existing Assets:** Must use existing local images in `images/` (`images/Rick_and_Morty_Logo.png`, `images/Rick_and_Morty_banner.webp`, `images/Madriaga_logo.svg`).
- **DOM Backward Compatibility:** Existing IDs (`#Home`, `#offcanvasNavbar`, `#searchForm`, `#searchInput`, `#statusFilter`, `#speciesFilter`, `#characterList`, `#characterModal`, `#modalName`, `#modalImage`, `#modalDetails`, `#pageText`, `#footer`) and global handlers (`prevPage()`, `nextPage()`, `openModal(id)`, `openRandomModal()`, `setStatusFilter(status)`, `setSpeciesFilter(species)`) must remain intact.

## 4. Confirmed User Decisions

1. **Top Show Introduction & CTA (`#Home` / `#aboutShow`):**
   - Uses **Layout A ("Interdimensional Dossier")** from the interactive mockup session:
     - **Left Column (`col-12 col-lg-7`):** Brutalist dossier box with a top classification tag (`DIMENSION C-137 // TELEVISION ARCHIVE`), headline (`WHAT IS RICK AND MORTY?`), show introduction paragraph describing Rick Sanchez and Morty Smith's interdimensional adventures and domestic chaos, three monospace metadata chips (`826+ CHARACTERS`, `INFINITE TIMELINES`, `LIVE API DB`), and a primary brutalist CTA button (`EXPLORE CHARACTERS ↓`) pointing to `#characterSection`.
     - **Right Column (`col-12 col-lg-5`):** Brutalist framed showcase containing `images/Rick_and_Morty_banner.webp` with a monospace frame label and hard offset neon shadow.
2. **Character Card & Modal Style (Option A):**
   - **Full-Bleed Specimen Card:** Edge-to-edge top image (`border-bottom: 3px solid #000`), floating `#ID` tag (top-left), floating status pill (top-right: `ALIVE` `#6ECB5A`, `DEAD` `#FF4D4D`, `UNKNOWN` `#A3BDB6`), uppercase bold name, monospace `Species • Origin` subtitle, and full-width `VIEW DOSSIER →` button.
   - **Classified Dossier Modal:** Dark brutalist modal with a black header bar, framed character image, status badge, and a 2-column structured metadata grid for `Species`, `Gender`, `Origin`, `Last Known Location`, and `Episode Appearances`.
3. **Visual Theme Tokens:**
   - **Portal Acid Dark:**
     - `--bg-canvas: #0b1412`
     - `--bg-surface: #12211e`
     - `--bg-card: #162925`
     - `--text-main: #f4f7f5`
     - `--text-muted: #a3bdb6`
     - `--accent-portal: #6ecb5a`
     - `--accent-lime: #d5ff9d`
     - `--accent-dead: #ff4d4d`
     - `--accent-unknown: #a3bdb6`
     - `--border-brutal: 3px solid #000000`
     - `--shadow-brutal-green: 6px 6px 0px #6ecb5a`
     - `--shadow-brutal-black: 4px 4px 0px #000000`

## 5. Builder Calls (Settled for Implementation)

- **Search & Filter Placement (Builder Call):** The primary `#searchForm` (`#searchInput`), `#statusFilter`, `#speciesFilter`, quick-filter badges, and a new `Reset Filters` button (`#resetFiltersBtn`) are placed in the inline **Filter Command Bar** at the top of `#characterSection` so they are immediately visible on all screen sizes. The offcanvas menu (`#offcanvasNavbar`) is retained for quick navigation links (`About Show`, `Character Directory`, `Random Specimen`, `API Docs`) and quick filter shortcuts so mobile/drawer navigation remains functional.
- **Pagination & Telemetry Bar (Builder Call):** Upgrade the pagination bar below `#characterList` so `#pageText` displays `Page X of Y` (or `Page 0 of 0` when empty), `#resultCountText` displays total matching specimens (e.g., `826 SPECIMENS FOUND`), and `Previous` / `Next` buttons visually disable when at the first or last page.
- **API Error / 404 Handling & Loading State (Builder Call):** In `fetchFilteredCharacters()`, check `response.ok` before parsing results; if the API returns 404 (no matching characters), stop pagination cleanly and render a Neo-Brutalist "NO SPECIMENS FOUND IN THIS TIMELINE" empty state card with a button to reset filters. While fetching, show a brutalist loading indicator in `#characterList`.
- **Module Export Guard for Testing (Builder Call):** At the bottom of `script.js`, export state and functions when `typeof module !== "undefined" && module.exports` so `node --test` can test all logic without a browser bundler.

