# Neo-Brutalist Rick and Morty Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Rick and Morty character browser (`index.html`, `style.css`, `script.js`) into a modern, user-friendly Neo-Brutalist application with a dedicated show introduction hero, a direct CTA to the character directory, an inline search/filter command bar, upgraded specimen cards and dossier modal, and automated tests.

**Architecture:** A static HTML5 + Bootstrap 5.3.8 + custom CSS token architecture (`style.css`) paired with a modular, dependency-free Vanilla JS controller (`script.js`). DOM structure in `index.html` preserves all existing IDs while adding the Split Dossier Hero (`#aboutShow`), inline Filter Command Bar (`#characterSection`), and telemetry/pagination controls. `script.js` guards browser auto-initialization and CommonJS exports so Node's built-in test runner (`node --test`) can verify DOM rendering, API pagination, 404 empty states, and modal population without external dependencies.

**Tech Stack:** HTML5, CSS3 (Custom Properties / Neo-Brutalist Tokens), Bootstrap 5.3.8, Bootstrap Icons 1.13.1, Google Fonts (`Orbitron`, `Open Sans`, `Space Mono`), Vanilla JavaScript (ES2022), Node.js `node:test` + `node:assert/strict`.

**Spec:** `docs/superpowers/specs/2026-11-09-neo-brutalist-frontend-design.md`

## Global Constraints

- Tech Stack: HTML5, CSS3 (`style.css`), Vanilla JavaScript (`script.js`), Bootstrap `5.3.8` (CDN), Bootstrap Icons `1.13.1` (CDN), Google Fonts (`Orbitron`, `Open Sans`, `Space Mono`).
- Existing Assets: Use local images in `images/` (`images/Rick_and_Morty_Logo.png`, `images/Rick_and_Morty_banner.webp`, `images/Madriaga_logo.svg`).
- DOM Backward Compatibility: Preserve existing IDs (`#Home`, `#offcanvasNavbar`, `#searchForm`, `#searchInput`, `#statusFilter`, `#speciesFilter`, `#characterList`, `#characterModal`, `#modalName`, `#modalImage`, `#modalDetails`, `#pageText`, `#footer`) and global handlers (`prevPage()`, `nextPage()`, `openModal(id)`, `openRandomModal()`, `setStatusFilter(status)`, `setSpeciesFilter(species)`).
- Design Tokens (`style.css`): `--bg-canvas: #0b1412`, `--bg-surface: #12211e`, `--bg-card: #162925`, `--text-main: #f4f7f5`, `--text-muted: #a3bdb6`, `--accent-portal: #6ecb5a`, `--accent-lime: #d5ff9d`, `--accent-dead: #ff4d4d`, `--accent-unknown: #a3bdb6`, `--border-brutal: 3px solid #000000`, `--shadow-brutal-green: 6px 6px 0px #6ecb5a`, `--shadow-brutal-black: 4px 4px 0px #000000`.

## Review Focus

1. **Non-existent character search returning HTTP 404 from API:** `fetchFilteredCharacters()` must check `!response.ok` (such as 404 when no character matches `nameFilter`), stop fetching cleanly without throwing, set `allCharacters = []`, and render the Neo-Brutalist empty state in `#characterList` with `Page 0 of 0` in `#pageText`.
2. **Desynchronized filter UI controls when clicking quick-filter badges or Reset:** Calling `setStatusFilter(status)`, `setSpeciesFilter(species)`, or `resetFilters()` must synchronize the `<select id="statusFilter">`, `<select id="speciesFilter">`, and `<input id="searchInput">` values so the visible controls always match the active query.
3. **Pagination boundary clicks (`prevPage` on page 1, `nextPage` on last page or empty list):** Must clamp `page` within `[1, totalPages]` and never render blank pages or negative page numbers.
4. **Missing nested properties in API character payload during modal/card render:** `openModal(id)` and `displayCharacters()` must safely read `character.origin?.name`, `character.location?.name`, and `Array.isArray(character.episode) ? character.episode.length : 0` without throwing if optional fields are missing.
5. **XSS / HTML breakage in character names or origins:** Character fields rendered into template strings (`character.name`, `character.species`, `character.origin.name`) must be HTML-escaped via `escapeHtml(str)` before interpolation.

---

### Task 1: HTML Layout Structure & Neo-Brutalist Design System (`index.html` & `style.css`)

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Create: `tests/layout.test.js`

**Interfaces:**
- Produces:
  - Semantic sections in `index.html`:
    - Top Brutalist Navbar (`#Home`) with brand logo, desktop quick links (`#aboutShow`, `#characterSection`), random specimen button, and mobile/drawer toggle (`#offcanvasNavbar`).
    - Split Introduction Hero (`#aboutShow`): left column dossier card explaining what *Rick and Morty* is, universe stat badges (`826+ CHARACTERS`, `INFINITE TIMELINES`, `LIVE API DB`), and primary CTA `<a href="#characterSection" id="exploreCharactersBtn" class="btn-brutal-primary">EXPLORE CHARACTERS ↓</a>`; right column framed portal banner (`images/Rick_and_Morty_banner.webp`).
    - Character Directory Section (`#characterSection`): inline Filter Command Bar containing `#searchForm` (`#searchInput`), `#statusFilter`, `#speciesFilter`, quick-filter buttons, `#resetFiltersBtn`, and `#resultCountText`, followed by `<div class="row g-4" id="characterList"></div>`.
    - Upgraded Classified Dossier Modal (`#characterModal` with `#modalName`, `#modalImage`, `#modalDetails`) and Pagination Bar (`#prevPageBtn`, `#nextPageBtn`, `#pageText`).
  - Neo-Brutalist CSS rules and custom properties in `style.css`.

- [ ] **Step 1: Write the failing layout and CSS token test in `tests/layout.test.js`**

```javascript
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const htmlPath = path.join(__dirname, "..", "index.html");
const cssPath = path.join(__dirname, "..", "style.css");

test("index.html contains show introduction hero, explore CTA button, and preserved interactive IDs", () => {
    const html = fs.readFileSync(htmlPath, "utf8");
    assert.match(html, /id="aboutShow"/);
    assert.match(html, /What is Rick and Morty\?/i);
    assert.match(html, /id="exploreCharactersBtn"/);
    assert.match(html, /href="#characterSection"/);

    const requiredIds = [
        "Home", "offcanvasNavbar", "characterSection", "searchForm",
        "searchInput", "statusFilter", "speciesFilter", "resetFiltersBtn",
        "resultCountText", "characterList", "characterModal", "modalName",
        "modalImage", "modalDetails", "pageText", "footer"
    ];
    for (const id of requiredIds) {
        assert.match(html, new RegExp(`id="${id}"`), `Missing #${id}`);
    }
});

test("style.css defines Portal Acid Dark Neo-Brutalist custom properties and component classes", () => {
    const css = fs.readFileSync(cssPath, "utf8");
    assert.match(css, /--bg-canvas:\s*#0b1412/i);
    assert.match(css, /--accent-portal:\s*#6ecb5a/i);
    assert.match(css, /--border-brutal:\s*3px solid #000000/i);
    assert.match(css, /\.brutal-box\b/);
    assert.match(css, /\.btn-brutal-primary\b/);
    assert.match(css, /\.specimen-card\b/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/layout.test.js`
Expected: FAIL with `AssertionError: The input did not match the regular expression /id="aboutShow"/`

- [ ] **Step 3: Implement the Neo-Brutalist layout in `index.html` and token system in `style.css`**

Update `index.html` to include Google Font `Space+Mono:wght@400;700`, the `#aboutShow` 2-column Split Dossier Hero with the *Rick and Morty* show synopsis and `<a href="#characterSection" id="exploreCharactersBtn" class="btn-brutal-primary">EXPLORE CHARACTERS ↓</a>`, the `#characterSection` inline Filter Command Bar (housing `#searchForm`, `#searchInput`, `#statusFilter`, `#speciesFilter`, quick-filter badges, `#resetFiltersBtn`, and `#resultCountText`), the `#characterList` grid container, the `#characterModal` dossier dialog, pagination bar (`#prevPageBtn`, `#nextPageBtn`, `#pageText`), and Neo-Brutalist `#footer`.
Update `style.css` with the `--bg-canvas`, `--bg-surface`, `--bg-card`, `--accent-portal`, `--accent-lime`, `--border-brutal`, and `--shadow-brutal-*` variables plus styles for `.brutal-box`, `.btn-brutal-primary`, `.btn-brutal-secondary`, `.specimen-card`, `.status-stamp`, `.dossier-modal`, and responsive breakpoints.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/layout.test.js`
Expected: PASS (2 passing tests)

- [ ] **Step 5: Commit**

```bash
git add index.html style.css tests/layout.test.js
git commit -m "feat(ui): build neo-brutalist show intro hero, command bar, and style tokens"
```

---

### Task 2: Specimen Cards, Classified Dossier Modal, Filter Sync & Error-Safe API Controller (`script.js`)

**Files:**
- Modify: `script.js`
- Create: `tests/script.test.js`

**Interfaces:**
- Consumes: DOM IDs from Task 1 (`#searchForm`, `#searchInput`, `#statusFilter`, `#speciesFilter`, `#resetFiltersBtn`, `#resultCountText`, `#characterList`, `#characterModal`, `#modalName`, `#modalImage`, `#modalDetails`, `#pageText`, `#prevPageBtn`, `#nextPageBtn`).
- Produces (global browser functions + CommonJS exports for tests):
  - `escapeHtml(value: unknown) -> string`
  - `fetchFilteredCharacters() -> Promise<void>`
  - `displayCharacters() -> void`
  - `openModal(id: number | string) -> Promise<void>`
  - `openRandomModal() -> void`
  - `setStatusFilter(status: string) -> Promise<void>`
  - `setSpeciesFilter(species: string) -> Promise<void>`
  - `resetFilters() -> Promise<void>`
  - `prevPage() -> void`
  - `nextPage() -> void`
  - `getState() -> { page: number, currentStatus: string, currentSpecies: string, nameFilter: string, allCharacters: Array<object> }`
  - `setStateForTest(partial: object) -> void`

- [ ] **Step 1: Write the failing controller tests in `tests/script.test.js`**

```javascript
const test = require("node:test");
const assert = require("node:assert/strict");

function createMockDom() {
    const elements = {};
    const makeEl = (id) => ({
        id,
        innerHTML: "",
        textContent: "",
        value: "",
        src: "",
        disabled: false,
        style: { removeProperty() {} },
        classList: { add() {}, remove() {}, toggle() {} },
        addEventListener() {},
        querySelector: () => ({ value: "", classList: { remove() {} }, style: {} }),
    });
    [
        "characterList", "pageText", "resultCountText", "characterModal",
        "modalName", "modalImage", "modalDetails", "statusFilter",
        "speciesFilter", "searchForm", "searchInput", "resetFiltersBtn",
        "prevPageBtn", "nextPageBtn"
    ].forEach((id) => { elements[id] = makeEl(id); });

    global.document = {
        getElementById: (id) => elements[id] || null,
        querySelector: (sel) => {
            if (sel === "#searchForm input" || sel === "#searchInput") return elements.searchInput;
            return makeEl(sel);
        },
        querySelectorAll: () => [],
        body: makeEl("body"),
    };
    global.bootstrap = {
        Modal: { getOrCreateInstance: () => ({ show() {} }) }
    };
    return elements;
}

test("displayCharacters renders Specimen Card Style A with escaped fields, ID badge, status stamp, Species • Origin, and pagination totals", () => {
    const els = createMockDom();
    delete require.cache[require.resolve("../script.js")];
    const app = require("../script.js");

    app.setStateForTest({
        page: 1,
        allCharacters: [
            {
                id: 1,
                name: "Rick <Sanchez>",
                status: "Alive",
                species: "Human",
                gender: "Male",
                origin: { name: "Earth (C-137)" },
                location: { name: "Citadel of Ricks" },
                image: "https://example.com/rick.jpeg",
                episode: ["ep1", "ep2"]
            }
        ]
    });

    app.displayCharacters();
    assert.match(els.characterList.innerHTML, /#001/);
    assert.match(els.characterList.innerHTML, /Rick &lt;Sanchez&gt;/);
    assert.match(els.characterList.innerHTML, /ALIVE/i);
    assert.match(els.characterList.innerHTML, /Human\s*•\s*Earth \(C-137\)/);
    assert.match(els.characterList.innerHTML, /VIEW DOSSIER/i);
    assert.equal(els.pageText.textContent, "Page 1 of 1");
    assert.match(els.resultCountText.textContent, /1 SPECIMEN/i);
});

test("fetchFilteredCharacters handles HTTP 404 empty search cleanly and renders empty state with Page 0 of 0", async () => {
    const els = createMockDom();
    global.fetch = async () => ({
        ok: false,
        status: 404,
        json: async () => ({ error: "There is nothing here" })
    });

    delete require.cache[require.resolve("../script.js")];
    const app = require("../script.js");

    app.setStateForTest({ nameFilter: "nonexistent_xyz", page: 1 });
    await app.fetchFilteredCharacters();
    app.displayCharacters();

    assert.equal(app.getState().allCharacters.length, 0);
    assert.match(els.characterList.innerHTML, /NO SPECIMENS FOUND/i);
    assert.equal(els.pageText.textContent, "Page 0 of 0");
    assert.match(els.resultCountText.textContent, /0 SPECIMENS/i);
});

test("setStatusFilter, setSpeciesFilter, and resetFilters synchronize select and input values and clamp pagination", async () => {
    const els = createMockDom();
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            info: { next: null },
            results: Array.from({ length: 15 }, (_, i) => ({
                id: i + 1,
                name: `Char ${i + 1}`,
                status: "Alive",
                species: "Alien",
                gender: "Unknown",
                origin: { name: "Space" },
                location: { name: "Space" },
                image: "https://example.com/c.jpg",
                episode: []
            }))
        })
    });

    delete require.cache[require.resolve("../script.js")];
    const app = require("../script.js");

    await app.setStatusFilter("alive");
    assert.equal(els.statusFilter.value, "alive");
    assert.equal(els.pageText.textContent, "Page 1 of 2");

    app.prevPage(); // stays at 1
    assert.equal(app.getState().page, 1);
    app.nextPage(); // advances to 2
    assert.equal(app.getState().page, 2);
    app.nextPage(); // clamps at 2
    assert.equal(app.getState().page, 2);

    els.searchInput.value = "Rick";
    await app.resetFilters();
    assert.equal(els.statusFilter.value, "");
    assert.equal(els.speciesFilter.value, "");
    assert.equal(els.searchInput.value, "");
    assert.equal(app.getState().page, 1);
});

test("openModal populates Classified Dossier Modal with Status, Species, Gender, Origin, Last Known Location, and Episode Count", async () => {
    const els = createMockDom();
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            id: 2,
            name: "Morty Smith",
            status: "Alive",
            species: "Human",
            gender: "Male",
            origin: { name: "unknown" },
            location: { name: "Citadel of Ricks" },
            image: "https://example.com/morty.jpeg",
            episode: ["e1", "e2", "e3"]
        })
    });

    delete require.cache[require.resolve("../script.js")];
    const app = require("../script.js");

    await app.openModal(2);
    assert.match(els.modalName.textContent, /Morty Smith/i);
    assert.match(els.modalName.textContent, /#002/);
    assert.equal(els.modalImage.src, "https://example.com/morty.jpeg");
    assert.match(els.modalDetails.innerHTML, /Citadel of Ricks/);
    assert.match(els.modalDetails.innerHTML, /3 Episodes/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/script.test.js`
Expected: FAIL with `TypeError: app.setStateForTest is not a function`

- [ ] **Step 3: Implement the upgraded Neo-Brutalist controller in `script.js`**

Update `script.js` to implement:
- `escapeHtml(value)` for safe string interpolation.
- `formatSpecimenId(id)` returning `#` + 3-digit zero-padded ID (`#001`).
- `fetchFilteredCharacters()` with loading state rendering in `#characterList`, `try/catch` + `if (!response.ok) break;` so HTTP 404 empty searches resolve cleanly with `allCharacters = []`.
- `displayCharacters()` rendering Specimen Card Style A (`#ID` stamp, status stamp with `ALIVE` / `DEAD` / `UNKNOWN` styling, portrait, escaped name, `Species • Origin` subtitle, `VIEW DOSSIER →` button), updating `#pageText` (`Page X of Y` or `Page 0 of 0`), `#resultCountText` (`N SPECIMEN(S) FOUND`), and `#prevPageBtn` / `#nextPageBtn` disabled states, or rendering the Neo-Brutalist empty state card with a Reset Filters button when `allCharacters.length === 0`.
- `openModal(id)` populating `#modalName` (`CLASSIFIED DOSSIER // NAME (#ID)`), `#modalImage`, and `#modalDetails` with the 2-column dossier metadata grid (`Status`, `Species`, `Gender`, `Origin Dimension`, `Last Known Location`, `Episode Appearances`).
- `setStatusFilter(status)`, `setSpeciesFilter(species)`, and `resetFilters()` synchronizing `#statusFilter`, `#speciesFilter`, and `#searchInput` DOM values.
- CommonJS export block (`if (typeof module !== "undefined" && module.exports)`) and automatic initial load when running in a browser (`typeof window !== "undefined"`).

- [ ] **Step 4: Run full test suite to verify all tests pass**

Run: `node --test tests/*.test.js`
Expected: PASS (6 passing tests across `tests/layout.test.js` and `tests/script.test.js`)

- [ ] **Step 5: Commit**

```bash
git add script.js tests/script.test.js
git commit -m "feat(app): implement specimen cards, dossier modal, filter sync, and tests"
```

