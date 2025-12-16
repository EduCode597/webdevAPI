let currentPage = 1;
let currentStatus = "";
let currentSpecies = "";

async function fetchCharacters() {
    const url =
        `https://rickandmortyapi.com/api/character/?page=`+currentPage +`&status=`+currentStatus+`&species=`+currentSpecies;

    const res = await fetch(url);
    const data = await res.json();

    displayCharacters(data.results);
}

function displayCharacters(characters) {
    const container = document.getElementById("characterList");
    container.innerHTML = "";

    characters.forEach((character) => {
        const col = document.createElement("div");
        col.className = "col-md-3";

        col.innerHTML =
            `<div class="card p-2 m-3 shadow-sm text-white text-center">
                <img src="`+character.image+`" class="img-fluid m-2">
                <h5>`+character.name+`</h5>
                <button class="btn btn-outline-success mt-2" onclick="openModal(`+character.id+`)">
                    View Details
                </button>
            </div>`;

        container.appendChild(col);
    });
}

async function openModal(id) {
    const res = await fetch(
        `https://rickandmortyapi.com/api/character/` + id + ``
    );
    const character = await res.json();

    document.getElementById("modalName").textContent = character.name;
    document.getElementById("modalImage").src = character.image;

    document.getElementById("modalDetails").innerHTML =
        `<strong>Status:</strong> `+character.status+`<br>
        <strong>Species:</strong> `+character.species+`<br>
        <strong>Gender:</strong> `+character.gender+`<br>
        <strong>Origin:</strong> `+character.origin.name+`<br>
        `;

    const modal = new bootstrap.Modal(document.getElementById("characterModal"));
    modal.show();
}

// Pagination
document.getElementById("nextBtn").onclick = () => {
    currentPage++;
    document.getElementById("pageNum").textContent = currentPage;
    fetchCharacters();
};

document.getElementById("prevBtn").onclick = () => {
    if (currentPage > 1) {
        currentPage--;
        document.getElementById("pageNum").textContent = currentPage;
        fetchCharacters();
    }
};

// Filters
document.getElementById("statusFilter").onchange = (e) => {
    currentStatus = e.target.value;
    currentPage = 1;
    fetchCharacters();
};

document.getElementById("speciesFilter").onchange = (e) => {
    currentSpecies = e.target.value;
    currentPage = 1;
    fetchCharacters();
};

// Initial load
fetchCharacters();
