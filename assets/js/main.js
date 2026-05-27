const pokemonList = document.getElementById("pokemonList");
const loadMoreButton = document.getElementById("loadMoreButton");
const searchInput = document.getElementById("pokemonSearch");
const themeToggle = document.getElementById("themeToggle");
const modal = document.getElementById("pokemonModal");

const maxRecords = 151;
const limit = 12;
let offset = 0;
let allLoadedPokemons = [];


themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark-mode") ? "dark" : "light",
  );
});

if (localStorage.getItem("theme") === "dark")
  document.body.classList.add("dark-mode");


const getFavorites = () =>
  JSON.parse(localStorage.getItem("favPokemons") || "[]");
const toggleFavorite = (id) => {
  let favs = getFavorites();
  favs = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
  localStorage.setItem("favPokemons", JSON.stringify(favs));


  const term = searchInput.value.toLowerCase();
  const listToRender = allLoadedPokemons.filter((p) =>
    p.name.toLowerCase().includes(term),
  );
  renderPokemons(listToRender);
};


function convertPokemonToLi(pokemon) {
  const isFav = getFavorites().includes(pokemon.number);
  return `
        <li class="pokemon ${pokemon.type}" onclick="openDetail(${pokemon.number})">
            <span class="number">#${pokemon.number}</span>
            <span class="name">${pokemon.name}</span>
            <div class="detail">
                <ol class="types">
                    ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join("")}
                </ol>
                <img src="${pokemon.photo}" alt="${pokemon.name}">
            </div>
            <button class="fav-btn ${isFav ? "active" : ""}" onclick="event.stopPropagation(); toggleFavorite(${pokemon.number})">
                ♥
            </button>
        </li>
    `;
}

function renderPokemons(list) {
  pokemonList.innerHTML = list.map(convertPokemonToLi).join("");
}

function loadPokemonItems(offset, limit) {
  pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
    allLoadedPokemons = [...allLoadedPokemons, ...pokemons];
    renderPokemons(allLoadedPokemons);
  });
}

loadPokemonItems(offset, limit);

loadMoreButton.addEventListener("click", () => {
  offset += limit;
  if (offset + limit >= maxRecords) {
    loadPokemonItems(offset, maxRecords - offset);
    loadMoreButton.parentElement.removeChild(loadMoreButton);
  } else {
    loadPokemonItems(offset, limit);
  }
});

// --- Busca Real-time ---
searchInput.addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  const filtered = allLoadedPokemons.filter((p) =>
    p.name.toLowerCase().includes(term),
  );
  renderPokemons(filtered);
});

// --- Modal de Detalhes ---
async function openDetail(id) {
  const pokemon =
    allLoadedPokemons.find((p) => p.number === id) ||
    (await pokeApi.getPokemonById(id));
  const modalBody = document.getElementById("modalBody");

  modalBody.innerHTML = `
        <div class="modal-header ${pokemon.type}">
            <button class="close-modal" onclick="closeModal()">X</button>
            <h2>${pokemon.name}</h2>
            <span>#${pokemon.number}</span>
            <img src="${pokemon.photo}" alt="${pokemon.name}">
        </div>
        <div class="modal-info">
            <div class="stats-grid">
                <div><strong>Peso:</strong> ${pokemon.weight / 10}kg</div>
                <div><strong>Altura:</strong> ${pokemon.height / 10}m</div>
                <div><strong>Exp Base:</strong> ${pokemon.baseExp}</div>
            </div>
            <h3>Stats</h3>
            ${pokemon.stats
              .map(
                (s) => `
                <div class="stat-bar">
                    <span>${s.name}</span>
                    <div class="bar-bg"><div class="bar-fill" style="width: ${Math.min(s.base, 100)}%"></div></div>
                </div>
            `,
              )
              .join("")}
        </div>
    `;
  modal.style.display = "flex";
}

function closeModal() {
  modal.style.display = "none";
}
window.onclick = (e) => {
  if (e.target == modal) closeModal();
};
