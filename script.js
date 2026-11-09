const colors = {
    Alive: "Green",
    Dead: "Red",
    unknown: "Gray",
};

const modalColor = {
    Alive: "#12211e",
    Dead: "#2a1215",
    unknown: "#1c2221",
};

const statusStampClass = {
    alive: "status-alive",
    dead: "status-dead",
    unknown: "status-unknown",
};

var characterList = document.getElementById("characterList");
var pageText = document.getElementById("pageText");
var resultCountText = document.getElementById("resultCountText");
var name, status, species, picture;
var page = 1;

let currentStatus = "";
let currentSpecies = "";
let nameFilter = "";
let activeRequestId = 0;

let allCharacters = [];

const characterModalElement = document.getElementById("characterModal");
const characterModal =
    characterModalElement && typeof bootstrap !== "undefined" && bootstrap.Modal
        ? bootstrap.Modal.getOrCreateInstance(characterModalElement)
        : null;

if (characterModalElement && characterModalElement.addEventListener) {
    characterModalElement.addEventListener("hidden.bs.modal", () => {
        document.body.classList.remove("modal-open");
        document.body.style.removeProperty("padding-right");
        document.querySelectorAll(".modal-backdrop").forEach((backdrop) => backdrop.remove());
    });
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatSpecimenId(id) {
    const numericId = Number(id) || 0;
    return "#" + String(numericId).padStart(3, "0");
}

function syncFilterControls() {
    const statusSelect = document.getElementById("statusFilter");
    if (statusSelect) statusSelect.value = currentStatus;

    const speciesSelect = document.getElementById("speciesFilter");
    if (speciesSelect) speciesSelect.value = currentSpecies;

    const searchInputEl = document.getElementById("searchInput");
    if (searchInputEl) searchInputEl.value = nameFilter;
}

function prevPage() {
    if (page > 1) {
        page--;
        displayCharacters();
    }
}

function nextPage() {
    const totalPages = Math.ceil(allCharacters.length / 12);
    if (page < totalPages) {
        page++;
        displayCharacters();
    }
}

const fetchFilteredCharacters = async () => {
    const reqId = ++activeRequestId;
    const fetchedResults = [];
    allCharacters = [];
    let currentPage = 1;
    const statusSnapshot = currentStatus;
    const speciesSnapshot = currentSpecies;
    const nameSnapshot = nameFilter;

    if (characterList) {
        characterList.innerHTML = `
            <div class="col-12">
                <div class="brutal-box p-5 text-center">
                    <span class="mono-badge badge-lime mb-2">PORTAL SCAN IN PROGRESS</span>
                    <h3 class="font-display m-0">FETCHING MULTIVERSE SPECIMENS...</h3>
                </div>
            </div>`;
    }

    while (true) {
        let url = `https://rickandmortyapi.com/api/character/?page=` + currentPage;
        if (statusSnapshot) url += `&status=` + encodeURIComponent(statusSnapshot);
        if (speciesSnapshot) url += `&species=` + encodeURIComponent(speciesSnapshot);
        if (nameSnapshot) url += `&name=` + encodeURIComponent(nameSnapshot);

        try {
            const response = await fetch(url);
            if (reqId !== activeRequestId) {
                return false;
            }
            if (!response || !response.ok) {
                break;
            }
            const data = await response.json();
            if (reqId !== activeRequestId) {
                return false;
            }
            if (data && Array.isArray(data.results)) {
                fetchedResults.push(...data.results);
            }
            if (!data || !data.info || !data.info.next) {
                break;
            }
            currentPage++;
        } catch (_err) {
            break;
        }
    }

    if (reqId === activeRequestId) {
        allCharacters = fetchedResults;
        return true;
    }
    return false;
};

const displayCharacters = () => {
    if (!characterList) return;
    characterList.innerHTML = "";

    const totalCount = allCharacters.length;
    const totalPages = Math.ceil(totalCount / 12);

    if (resultCountText) {
        resultCountText.textContent = `${totalCount} ${totalCount === 1 ? "SPECIMEN" : "SPECIMENS"} FOUND`;
    }

    const prevBtn = document.getElementById("prevPageBtn");
    const nextBtn = document.getElementById("nextPageBtn");

    if (totalCount === 0) {
        characterList.innerHTML = `
            <div class="col-12">
                <div class="brutal-box p-5 text-center">
                    <span class="mono-badge mb-3">ERROR 404 // TIMELINE EMPTY</span>
                    <h3 class="font-display mb-2">NO SPECIMENS FOUND IN THIS TIMELINE</h3>
                    <p class="text-muted mb-4">No characters matched your current search or telemetry filters.</p>
                    <button type="button" class="btn-brutal-primary" onclick="resetFilters()">
                        RESET ALL FILTERS
                    </button>
                </div>
            </div>`;
        if (pageText) {
            pageText.textContent = "Page 0 of 0";
        }
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        return;
    }

    if (page > totalPages) page = totalPages;
    if (page < 1) page = 1;

    const start = (page - 1) * 12;
    const end = start + 12;
    const charactersToShow = allCharacters.slice(start, end);

    let cardsHtml = "";
    for (const character of charactersToShow) {
        const normalizedStatus = String(character.status || "unknown").toLowerCase();
        const stampClass = statusStampClass[normalizedStatus] || "status-unknown";
        const statusLabel = String(character.status || "UNKNOWN").toUpperCase();
        const idTag = formatSpecimenId(character.id);
        const safeName = escapeHtml(character.name || "Unknown Specimen");
        const safeSpecies = escapeHtml(character.species || "Unknown");
        const safeOrigin = escapeHtml(character.origin?.name || "unknown");
        const safeImage = escapeHtml(character.image || "");
        const numericId = Number(character.id) || 1;

        cardsHtml += `
        <div class="col-12 col-sm-6 col-lg-3">
            <article class="specimen-card">
                <div class="specimen-media">
                    <img src="${safeImage}" alt="${safeName}" loading="lazy" />
                    <span class="specimen-id-badge">${idTag}</span>
                    <span class="status-stamp ${stampClass}">${escapeHtml(statusLabel)}</span>
                </div>
                <div class="specimen-body">
                    <div>
                        <h3 class="specimen-name">${safeName}</h3>
                        <div class="specimen-meta">${safeSpecies} • ${safeOrigin}</div>
                    </div>
                    <button type="button" class="btn-brutal-primary w-100" onclick="openModal(${numericId})">
                        VIEW DOSSIER &rarr;
                    </button>
                </div>
            </article>
        </div>`;
    }

    characterList.innerHTML = cardsHtml;

    if (pageText) {
        pageText.textContent = `Page ${page} of ${totalPages}`;
    }
    if (prevBtn) prevBtn.disabled = page <= 1;
    if (nextBtn) nextBtn.disabled = page >= totalPages;
};

async function openModal(id) {
    try {
        const res = await fetch(
            `https://rickandmortyapi.com/api/character/` + encodeURIComponent(id)
        );
        if (!res || !res.ok) return;
        const character = await res.json();

        const idTag = formatSpecimenId(character.id);
        const modalNameEl = document.getElementById("modalName");
        if (modalNameEl) {
            modalNameEl.textContent = `CLASSIFIED DOSSIER // ${character.name} (${idTag})`;
        }

        const modalImageEl = document.getElementById("modalImage");
        if (modalImageEl) {
            modalImageEl.src = character.image || "";
            modalImageEl.alt = character.name || "Character portrait";
        }

        const normalizedStatus = String(character.status || "unknown").toLowerCase();
        const stampClass = statusStampClass[normalizedStatus] || "status-unknown";
        const episodeCount = Array.isArray(character.episode) ? character.episode.length : 0;

        const modalDetailsEl = document.getElementById("modalDetails");
        if (modalDetailsEl) {
            modalDetailsEl.innerHTML = `
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 pb-2 border-bottom-brutal">
                    <span class="mono-badge">${idTag}</span>
                    <span class="status-stamp position-static ${stampClass}">${escapeHtml(String(character.status || "UNKNOWN").toUpperCase())}</span>
                </div>
                <div class="dossier-grid">
                    <div class="dossier-cell">
                        <span class="dossier-cell-label">Species</span>
                        <div class="dossier-cell-value">${escapeHtml(character.species || "Unknown")}</div>
                    </div>
                    <div class="dossier-cell">
                        <span class="dossier-cell-label">Gender</span>
                        <div class="dossier-cell-value">${escapeHtml(character.gender || "Unknown")}</div>
                    </div>
                    <div class="dossier-cell">
                        <span class="dossier-cell-label">Origin Dimension</span>
                        <div class="dossier-cell-value">${escapeHtml(character.origin?.name || "unknown")}</div>
                    </div>
                    <div class="dossier-cell">
                        <span class="dossier-cell-label">Last Known Location</span>
                        <div class="dossier-cell-value">${escapeHtml(character.location?.name || "unknown")}</div>
                    </div>
                    <div class="dossier-cell dossier-cell-wide">
                        <span class="dossier-cell-label">Television Archive Appearances</span>
                        <div class="dossier-cell-value text-lime">Featured in ${episodeCount} ${episodeCount === 1 ? "Episode" : "Episodes"}</div>
                    </div>
                </div>
            `;
        }

        const modalContent = document.querySelector("#characterModal .modal-content");
        if (modalContent) {
            modalContent.classList.remove("bg-dark");
            modalContent.style.backgroundColor = modalColor[character.status] || modalColor.unknown;
        }

        if (characterModal) {
            characterModal.show();
        }
    } catch (_err) {
        // Ignore network errors on modal fetch
    }
}

async function setStatusFilter(statusVal) {
    const searchInputEl = document.getElementById("searchInput");
    if (searchInputEl && typeof searchInputEl.value === "string") {
        nameFilter = searchInputEl.value.trim();
    }
    currentStatus = String(statusVal || "").toLowerCase();
    page = 1;
    syncFilterControls();
    const isLatest = await fetchFilteredCharacters();
    if (isLatest !== false) displayCharacters();
}

async function setSpeciesFilter(speciesVal) {
    const searchInputEl = document.getElementById("searchInput");
    if (searchInputEl && typeof searchInputEl.value === "string") {
        nameFilter = searchInputEl.value.trim();
    }
    currentSpecies = String(speciesVal || "").toLowerCase();
    page = 1;
    syncFilterControls();
    const isLatest = await fetchFilteredCharacters();
    if (isLatest !== false) displayCharacters();
}

async function resetFilters() {
    currentStatus = "";
    currentSpecies = "";
    nameFilter = "";
    page = 1;
    syncFilterControls();
    const isLatest = await fetchFilteredCharacters();
    if (isLatest !== false) displayCharacters();
}

function openRandomModal() {
    const randomId = Math.floor(Math.random() * 826) + 1;
    openModal(randomId);
}

const statusFilterEl = document.getElementById("statusFilter");
if (statusFilterEl) {
    statusFilterEl.onchange = (e) => {
        setStatusFilter(e.target.value);
    };
}

const speciesFilterEl = document.getElementById("speciesFilter");
if (speciesFilterEl) {
    speciesFilterEl.onchange = (e) => {
        setSpeciesFilter(e.target.value);
    };
}

const searchFormEl = document.getElementById("searchForm");
if (searchFormEl && searchFormEl.addEventListener) {
    searchFormEl.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.querySelector("#searchForm input") || document.getElementById("searchInput");
        nameFilter = input && input.value ? input.value.trim() : "";
        page = 1;
        fetchFilteredCharacters().then(() => displayCharacters());
    });
}

function getState() {
    return {
        page,
        currentStatus,
        currentSpecies,
        nameFilter,
        allCharacters,
    };
}

function setStateForTest(partial) {
    if (Object.prototype.hasOwnProperty.call(partial, "page")) page = partial.page;
    if (Object.prototype.hasOwnProperty.call(partial, "currentStatus")) currentStatus = partial.currentStatus;
    if (Object.prototype.hasOwnProperty.call(partial, "currentSpecies")) currentSpecies = partial.currentSpecies;
    if (Object.prototype.hasOwnProperty.call(partial, "nameFilter")) nameFilter = partial.nameFilter;
    if (Object.prototype.hasOwnProperty.call(partial, "allCharacters")) allCharacters = partial.allCharacters;
}

if (typeof window !== "undefined" && typeof module === "undefined") {
    fetchFilteredCharacters().then(() => displayCharacters());
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        colors,
        modalColor,
        escapeHtml,
        formatSpecimenId,
        prevPage,
        nextPage,
        fetchFilteredCharacters,
        displayCharacters,
        openModal,
        openRandomModal,
        setStatusFilter,
        setSpeciesFilter,
        resetFilters,
        getState,
        setStateForTest,
    };
}
