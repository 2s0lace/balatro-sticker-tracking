// ========================================================================
// PLIK: scripts/main.js (OSTATECZNA, DZIAŁAJĄCA WERSJA ZE WSZYSTKIM)
// ========================================================================

// --- ZMIENNE GLOBALNE ---
let currentSaveData = null;
let currentSortMode = 'default'; // Możliwe wartości: 'default', 'alpha', 'stake'

// Hierarchia stawek do sortowania
const STAKE_HIERARCHY = { stake_gold: 8, stake_orange: 7, stake_purple: 6, stake_blue: 5, stake_black: 4, stake_green: 3, stake_red: 2, stake_white: 1 };
const SORTED_STAKES = Object.keys(STAKE_HIERARCHY);

const STAKES = [
    { id: 'stake_white', color: '#FFFFFF' }, { id: 'stake_red', color: '#ff5454' },
    { id: 'stake_green', color: '#54ff54' }, { id: 'stake_black', color: '#444444' },
    { id: 'stake_blue', color: '#5454ff' }, { id: 'stake_purple', color: '#ff54ff' },
    { id: 'stake_orange', color: '#ffb454' }, { id: 'stake_gold', color: '#ffd700' },
];

// --- GŁÓWNA LOGIKA PO ZAŁADOWANIU STRONY ---
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadDataFromLocalStorage();
});

// --- PRZYPISANIE WSZYSTKICH EVENTÓW ---
function setupEventListeners() {
    // Przycisk "Sprawdź" jest w HTML, więc jego funkcja musi być globalna
    window.processSaveFile = function() {
        const jsonInput = document.getElementById('jsonInput').value;
        if (!jsonInput) { alert('Proszę wkleić dane z pliku save.json!'); return; }
        try {
            currentSaveData = JSON.parse(jsonInput);
            localStorage.setItem('balatroSave', JSON.stringify(currentSaveData));
            renderJokers();
        } catch (error) {
            alert('Błąd w danych JSON.'); console.error(error);
        }
    }

    // Wyszukiwarka
    document.getElementById('search-input').addEventListener('input', renderJokers);

    // Filtry rzadkości
    document.querySelectorAll('.filter-btn[data-rarity]').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn[data-rarity]').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderJokers();
        });
    });

    // Sortowanie (3 tryby)
    const sortButton = document.getElementById('sort-btn');
    sortButton.addEventListener('click', () => {
        if (currentSortMode === 'default') {
            currentSortMode = 'alpha';
            sortButton.classList.add('active');
            sortButton.textContent = 'Sorted A-Z';
        } else if (currentSortMode === 'alpha') {
            currentSortMode = 'stake';
            sortButton.textContent = 'Sorted by Stake';
        } else {
            currentSortMode = 'default';
            sortButton.classList.remove('active');
            sortButton.textContent = 'Sort by...';
        }
        renderJokers();
    });

  // --- NOWA LOGIKA DLA PRZYCISKÓW STAWEK (MULTI-SELECT) ---
const stakeFilterButtons = document.querySelectorAll('.stake-btn');
stakeFilterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const stake = button.dataset.stake;
        
        if (stake === 'all') {
            // Jeśli kliknięto "All Stakes", odznacz inne i zaznacz tylko ten
            stakeFilterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        } else {
            // Jeśli kliknięto kolor, odznacz "All Stakes"
            document.querySelector('.stake-btn[data-stake="all"]').classList.remove('active');
            // I przełącz stan klikniętego przycisku (zaznacz/odznacz)
            button.classList.toggle('active');
        }

        // Jeśli żaden kolor nie jest zaznaczony, automatycznie zaznacz "All"
        const anyActive = document.querySelector('.stake-btn[data-stake]:not([data-stake="all"]).active');
        if (!anyActive) {
            document.querySelector('.stake-btn[data-stake="all"]').classList.add('active');
        }

        renderJokers();
    });
});
// Domyślnie aktywny "All Stakes"
document.querySelector('.stake-btn[data-stake="all"]').classList.add('active');


    // Ctrl+F
    document.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
            event.preventDefault();
            document.getElementById('search-input').focus();
        }
    });
}

// --- FUNKCJE RENDERUJĄCE I POMOCNICZE ---
function loadDataFromLocalStorage() {
    const savedDataString = localStorage.getItem('balatroSave');
    if (savedDataString) {
        try {
            currentSaveData = JSON.parse(savedDataString);
            document.getElementById('jsonInput').value = JSON.stringify(currentSaveData, null, 2);
            renderJokers();
        } catch (e) {
            localStorage.removeItem('balatroSave');
        }
    }
}

function getHighestStakeScore(jokerId) {
    const jokerUsage = currentSaveData.joker_usage;
    const userJokerData = jokerUsage ? jokerUsage[jokerId] : null;
    if (userJokerData && userJokerData.wins_by_key) {
        for (const stake of SORTED_STAKES) {
            if (userJokerData.wins_by_key[stake]) return STAKE_HIERARCHY[stake];
        }
    }
    return 0;
}

// W pliku scripts/main.js

function openJokerModal(jokerId) {
    const jokerInfo = JOKER_DATA[jokerId];
    const userJokerData = currentSaveData.joker_usage ? currentSaveData.joker_usage[jokerId] : null;

    // Wypełnianie danych (nazwa, rzadkość, obrazek - bez zmian)
    document.getElementById('modal-joker-name').textContent = jokerInfo.name;
    document.getElementById('modal-joker-rarity').textContent = jokerInfo.rarity || 'Unknown';
    const imageContainer = document.getElementById('modal-joker-image');
    imageContainer.innerHTML = ''; 
    if (Array.isArray(jokerInfo.pos)) {
        const bgLayer = document.createElement('div'); bgLayer.className = 'joker-layer joker-bg'; bgLayer.style.backgroundPosition = jokerInfo.pos[0]; imageContainer.appendChild(bgLayer);
        const fgLayer = document.createElement('div'); fgLayer.className = 'joker-layer joker-fg'; fgLayer.style.backgroundPosition = jokerInfo.pos[1]; imageContainer.appendChild(fgLayer);
    } else {
        const fgLayer = document.createElement('div'); fgLayer.className = 'joker-layer joker-fg'; fgLayer.style.backgroundPosition = jokerInfo.pos; imageContainer.appendChild(fgLayer);
    }

    // Wypełnianie statystyk (win rate itp. - bez zmian)
    if (userJokerData) {
        let totalWins = userJokerData.wins_by_key ? Object.values(userJokerData.wins_by_key).reduce((sum, count) => sum + (count || 0), 0) : 0;
        let totalLosses = userJokerData.losses_by_key ? Object.values(userJokerData.losses_by_key).reduce((sum, count) => sum + (count || 0), 0) : 0;
        const totalGames = totalWins + totalLosses;
        const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
        document.getElementById('modal-win-rate').textContent = `${winRate}%`;
        document.getElementById('modal-total-wins').textContent = totalWins;
        document.getElementById('modal-total-games').textContent = totalGames;
    } else {
        document.getElementById('modal-win-rate').textContent = '-%';
        document.getElementById('modal-total-wins').textContent = '-';
        document.getElementById('modal-total-games').textContent = '-';
    }

    // --- NOWA LOGIKA TWORZENIA NAKLEJEK W MODALU ---
    const modalStakesContainer = document.getElementById('modal-joker-stakes');
    modalStakesContainer.innerHTML = ''; // Zawsze czyścimy stare naklejki

    STAKES.forEach(stake => {
        const sticker = document.createElement('div');
        sticker.className = 'sticker';
        sticker.style.backgroundColor = stake.color;
        
        // Sprawdzamy, czy Joker jest odblokowany i ma zaliczoną tę stawkę
        if (userJokerData && userJokerData.wins_by_key && userJokerData.wins_by_key[stake.id]) {
            sticker.classList.add('completed');
        }
        
        modalStakesContainer.appendChild(sticker);
    });
    // --- KONIEC NOWEJ LOGIKI ---

    // Pokaż modal (bez zmian)
    document.getElementById('joker-modal-overlay').style.display = 'block';
}
function renderJokers() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    if (!currentSaveData) return;

    const rarityFilter = document.querySelector('.filter-btn[data-rarity].active').dataset.rarity;
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const stakeFilter = document.querySelector('.stake-btn.active').dataset.stake;
    const jokerUsage = currentSaveData.joker_usage;

    let jokerIds = Object.keys(JOKER_DATA);

    if (currentSortMode === 'alpha') {
        jokerIds.sort((a, b) => JOKER_DATA[a].name.localeCompare(JOKER_DATA[b].name));
    } else if (currentSortMode === 'stake') {
        jokerIds.sort((a, b) => getHighestStakeScore(b) - getHighestStakeScore(a));
    }

    for (const jokerId of jokerIds) {
        const jokerInfo = JOKER_DATA[jokerId];
        const userJokerData = jokerUsage ? jokerUsage[jokerId] : null;

        if (rarityFilter !== 'all' && jokerInfo.rarity !== rarityFilter) continue;
        if (searchTerm && !jokerInfo.name.toLowerCase().includes(searchTerm)) continue;
        if (stakeFilter !== 'all') {
            if (!userJokerData || !userJokerData.wins_by_key || !userJokerData.wins_by_key[stakeFilter]) continue;
        }

        const card = document.createElement('div');
        card.className = 'joker-card';
        card.addEventListener('click', () => openJokerModal(jokerId));

        if (jokerUsage && jokerUsage[jokerId]) {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'joker-image-container';
            if (Array.isArray(jokerInfo.pos)) {
                const bgLayer = document.createElement('div'); bgLayer.className = 'joker-layer joker-bg'; bgLayer.style.backgroundPosition = jokerInfo.pos[0]; imageContainer.appendChild(bgLayer);
                const fgLayer = document.createElement('div'); fgLayer.className = 'joker-layer joker-fg'; fgLayer.style.backgroundPosition = jokerInfo.pos[1]; imageContainer.appendChild(fgLayer);
            } else {
                const fgLayer = document.createElement('div'); fgLayer.className = 'joker-layer joker-fg'; fgLayer.style.backgroundPosition = jokerInfo.pos; imageContainer.appendChild(fgLayer);
            }
            card.appendChild(imageContainer);
            const nameHeader = document.createElement('h3');
            nameHeader.textContent = jokerInfo.name;
            card.appendChild(nameHeader);
        } else {
            card.innerHTML = `<div class="joker-image-container"></div><h3>${jokerInfo.name}</h3><p>(Zablokowany)</p>`;
            card.style.opacity = '0.3';
        }
        resultsDiv.appendChild(card);
    }
}