const colors = {
    Alive: "Green",
    Dead: "Red",
    unknown: "Gray",
};

const modalColor = {
    Alive: "#0f5a56",
    Dead: "#6c1c22ff",
    unknown: "#505050ff",
};

var characterList = document.getElementById("characterList");
var pageText = document.getElementById("pageText");
var name, status, species, picture;
var page = 1;

// Filter state (driven by the two <select> dropdowns)
let currentStatus = "";
let currentSpecies = "";
let nameFilter = "";

let allCharacters = [];

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
    allCharacters = [];
    let currentPage = 1;
    while (true) {
        let url = `https://rickandmortyapi.com/api/character/?page=` + currentPage + ``;
        if (currentStatus) url += `&status=` + currentStatus + ``;
        if (currentSpecies) url += `&species=` + currentSpecies + ``;
        if (nameFilter) url += `&name=` + encodeURIComponent(nameFilter) + ``;
        const response = await fetch(url);
        const data = await response.json();
        if (data.results) {
            allCharacters.push(...data.results);
        }
        if (!data.info || !data.info.next) break;
        currentPage++;
    }
};

const displayCharacters = () => {
    characterList.innerHTML = "";
    const start = (page - 1) * 12;
    const end = start + 12;
    const charactersToShow = allCharacters.slice(start, end);
    for (const character of charactersToShow) {
        characterList.innerHTML +=
        `<div class="col-12 col-md-6 col-lg-3">
            <div class="card rounded-5 my-4 text-center shadow-sm">
                <img class="rounded-top-5 img-fluid w-100" src="` + character.image +`">
                <div class="card-title my-3 text-white">
                        <div class= row align-items-center>
                            <div class="col-12">
                            <span class="p-2 badge rounded-circle" style="background-color: ` + colors[character.status] + `; width: 10px; height: 10px;">
                            </span> <b>` + character.name + `</b>
                            </div>
                                <div class="px-5 d-flex flex-column align-items-center">
                                    <button class="btn btn-outline-success w-100 my-2" onclick="openModal(` + character.id + `)">
                                        View Details
                                    </button>
                                </div>
                        </div>
                    </div>
            </div>
        </div>`;
    }
    pageText.innerHTML = "Page " + page;
};

async function openModal(id) {
    const res = await fetch(
        `https://rickandmortyapi.com/api/character/` + id + ``
    );
    const character = await res.json();

    document.getElementById("modalName").textContent = character.name;
    document.getElementById("modalImage").src = character.image;

    document.getElementById("modalDetails").innerHTML =
        `<strong>Status:</strong> ` + character.status + `<br>
        <strong>Species:</strong> ` + character.species + `<br>
        <strong>Gender:</strong> ` + character.gender + `<br>
        <strong>Origin:</strong> ` + character.origin.name + `<br>
        `;

    const modalContent = document.querySelector("#characterModal .modal-content");
    modalContent.classList.remove("bg-dark");
    modalContent.style.backgroundColor = modalColor[character.status];

    const modal = new bootstrap.Modal(document.getElementById("characterModal"));
    modal.show();
}

function setStatusFilter(status) {
    currentStatus = status.toLowerCase();
    page = 1;
    fetchFilteredCharacters().then(() => displayCharacters());
}

function setSpeciesFilter(species) {
    currentSpecies = species.toLowerCase();
    page = 1;
    fetchFilteredCharacters().then(() => displayCharacters());
}

function openRandomModal() {
    const randomId = Math.floor(Math.random() * 826) + 1;
    openModal(randomId);
}

document.getElementById("statusFilter").onchange = (e) => {
    currentStatus = e.target.value.toLowerCase();
    page = 1;
    fetchFilteredCharacters().then(() => displayCharacters());
};

document.getElementById("speciesFilter").onchange = (e) => {
    currentSpecies = e.target.value.toLowerCase();
    page = 1;
    fetchFilteredCharacters().then(() => displayCharacters());
};

document.getElementById("searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.querySelector("#searchForm input");
    nameFilter = input.value.trim();
    page = 1;
    fetchFilteredCharacters().then(() => displayCharacters());
});

fetchFilteredCharacters().then(() => displayCharacters());
