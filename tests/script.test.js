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

test("setStatusFilter preserves unsubmitted searchInput text and discards stale concurrent fetch results", async () => {
    const els = createMockDom();
    let resolveSlowFetch;
    let callCount = 0;

    global.fetch = (url) => {
        callCount++;
        if (callCount === 1) {
            return new Promise((resolve) => {
                resolveSlowFetch = () =>
                    resolve({
                        ok: true,
                        status: 200,
                        json: async () => ({
                            info: { next: null },
                            results: [{ id: 99, name: "Stale Slow Character", status: "Alive", species: "Human", origin: { name: "Earth" }, location: { name: "Earth" }, image: "", episode: [] }]
                        })
                    });
            });
        }
        return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
                info: { next: null },
                results: [{ id: 1, name: "Fresh Dead Rick", status: "Dead", species: "Human", origin: { name: "Earth" }, location: { name: "Earth" }, image: "", episode: [] }],
                urlCalled: url
            })
        });
    };

    delete require.cache[require.resolve("../script.js")];
    const app = require("../script.js");

    // User types "Rick" in searchInput without submitting form, then clicks status filter
    els.searchInput.value = "Rick";
    const firstPromise = app.setStatusFilter("alive");
    assert.equal(els.searchInput.value, "Rick");
    assert.equal(app.getState().nameFilter, "Rick");

    // User immediately switches to "dead" before the first request resolves
    const secondPromise = app.setStatusFilter("dead");
    await secondPromise;

    // Now the stale first request resolves late
    resolveSlowFetch();
    await firstPromise;

    // Only the second ("Fresh Dead Rick") result should remain in allCharacters
    assert.equal(app.getState().allCharacters.length, 1);
    assert.equal(app.getState().allCharacters[0].name, "Fresh Dead Rick");
});


