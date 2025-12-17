const colors = {
    Alive: 'Green',
    Dead: 'Red',
    unknown: 'Gray'
};

var characterList = document.getElementById('characterList');
var pageText = document.getElementById('pageText');
var name, status, species, picture;
var page = 1;

// Filter state (driven by the two <select> dropdowns)
let currentStatus = '';
let currentSpecies = '';

function prevPage() {
    page--;
    pageText.innerHTML = 'Page ' + page;
    characterList.innerHTML = '';
    getRickAndMorty();
}

function nextPage() {
    page++;
    pageText.innerHTML = 'Page ' + page;
    characterList.innerHTML = '';
    getRickAndMorty();
}


const getRickAndMorty = async () => {
    characterList.innerHTML = '';
    for (var i = (11 * page) - 10; i <= page * 11; i++) {
        const response = await fetch('https://rickandmortyapi.com/api/character/' + i);
        const character = await response.json();

        // Apply dropdown filters (API returns Status with capital: Alive/Dead/unknown)
        if (currentStatus && character.status.toLowerCase() !== currentStatus.toLowerCase()) {
            continue;
        }
        if (currentSpecies && character.species !== currentSpecies) {
            continue;
        }

        characterList.innerHTML += `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card p-5 rounded-5 my-4 text-center shadow-sm">
            <div style="width: 200px; height: 200px; background-color: `+ colors[character.status] + `" class="rounded-circle mx-auto">
              <img class="rounded-5 w-100" src="`+ character.image + `">
            </div>
            <div class="h3 my-3" style="color: `+ colors[character.status] + `">
            ` + character.name + `
            </div>
            <div class="mt-3 px-5 d-flex flex-column align-items-center">
              <div class="rounded-4 p-3" style="background-color: `+ colors[character.status] + `">
                `+ character.id + `
              </div>
              <button class="btn btn-success mt-2" onclick="openModal(`+character.id+`)">
                    View Details
                </button>
            </div>
          </div>
        </div>
        `;
    }
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

document.getElementById("statusFilter").onchange = (e) => {
    currentStatus = e.target.value;
    page = 1;
    pageText.innerHTML = 'Page ' + page;
    characterList.innerHTML = '';
    getRickAndMorty();
};

document.getElementById("speciesFilter").onchange = (e) => {
    currentSpecies = e.target.value;
    page = 1;
    pageText.innerHTML = 'Page ' + page;
    characterList.innerHTML = '';
    getRickAndMorty();
};

getRickAndMorty();