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
    assert.match(html, /container-fluid/);
    assert.doesNotMatch(html, /container-xl/);

    const requiredIds = [
        "Home", "offcanvasNavbar", "characterSection", "searchForm",
        "searchInput", "statusFilter", "speciesFilter", "resetFiltersBtn",
        "resultCountText", "characterList", "characterModal", "modalName",
        "modalImage", "modalDetails", "pageText", "footer",
        "prevPageBtn", "nextPageBtn"
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
    assert.match(css, /\.specimen-media-col\b/);
    assert.match(css, /\.specimen-id-strip\b/);
    assert.match(css, /\.specimen-meta-grid\b/);
});

