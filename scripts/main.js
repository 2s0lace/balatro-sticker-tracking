// ========================================================================
// PLIK: scripts/main.js (WERSJA OSTATECZNA, KOMPLETNA, Z NAPRAWIONYM CTRL+F)
// ========================================================================

// --- ZMIENNE GLOBALNE ---
let allProfilesData = {};
let activeProfileName = null;
let currentSaveData = null;
let currentSortMode = 'default';

const STAKES = [
    { id: 'stake_white', name: 'White', color: '#FFFFFF' }, { id: 'stake_red', name: 'Red', color: '#ff5454' },
    { id: 'stake_green', name: 'Green', color: '#54ff54' }, { id: 'stake_black', name: 'Black', color: '#444444' },
    { id: 'stake_blue', name: 'Blue', color: '#5454ff' }, { id: 'stake_purple', name: 'Purple', color: '#ff54ff' },
    { id: 'stake_orange', name: 'Orange', color: '#ffb454' }, { id: 'stake_gold', name: 'Gold', color: '#ffd700' },
];

const BALATRO_PERSONALITIES = [
    { name: "Ekonomista 🤑", description: "Każdy dolar ma znaczenie. Gromadzisz gotówkę jak smok skarby, wiedząc, że prawdziwa siła tkwi w potędze portfela. Każda karta Temperance to inwestycja w przyszłe zwycięstwo.", cards: ['c_temperance', 'c_hermit', 'c_fool', 'c_judgement']},
    { name: "Ryzykant / Flipper 🎲", description: "Po co planować, skoro można zdać się na los? Kręcisz Kołem Fortuny z uśmiechem, bo wiesz, że wysokie ryzyko to wysoka nagroda. Nuda to Twój największy wróg.", cards: ['c_wheel_of_fortune', 's_ouija', 's_séance']},
    { name: "Strateg 🧠", description: "Twoja talia to precyzyjnie naostrzona maszyna. Każdy ruch jest przemyślany, a każda zbędna karta jest bezlitośnie usuwana. The Hanged Man to Twój najlepszy przyjaciel.", cards: ['c_hanged_man', 'c_justice', 'c_chariot']},
    { name: "Budowniczy Synergii / Kloner Mewtwo 🧬", description: "Jedna potężna karta to za mało. Twoim celem jest stworzenie armii klonów i niepowstrzymanych kombinacji. Karta Death to dla Ciebie nie koniec, a początek czegoś pięknego.", cards: ['c_death', 'c_empress', 'c_strength', 's_cryptid', 's_ectoplasm']},
    { name: "Początkujący Odkrywca 🌱", description: "Dopiero zaczynasz swoją przygodę, próbując wszystkiego po trochu. Twój styl gry jeszcze się krystalizuje, ale każdy run to nowa, cenna lekcja.", cards: []}
];

// --- GŁÓWNA LOGIKA ---
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadProfiles();
});

// --- LOGIKA PROFILI ---
function loadProfiles() {
    const profilesString = localStorage.getItem('balatroTrackerProfiles');
    allProfilesData = profilesString ? JSON.parse(profilesString) : { 'Default Profile': {} };
    activeProfileName = localStorage.getItem('balatroTrackerActiveProfile') || Object.keys(allProfilesData)[0];
    updateProfileSelect();
    loadActiveProfileData();
}

function updateProfileSelect() {
    const profileSelect = document.getElementById('profile-select');
    profileSelect.innerHTML = '';
    Object.keys(allProfilesData).forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        profileSelect.appendChild(option);
    });
    profileSelect.value = activeProfileName;
}

function loadActiveProfileData() {
    currentSaveData = allProfilesData[activeProfileName] || {};
    document.getElementById('jsonInput').value = Object.keys(currentSaveData).length > 0 ? JSON.stringify(currentSaveData, null, 2) : '';
    renderJokers();
    updateProfileStats();
}

function saveActiveProfile() {
    allProfilesData[activeProfileName] = currentSaveData;
    localStorage.setItem('balatroTrackerProfiles', JSON.stringify(allProfilesData));
    localStorage.setItem('balatroTrackerActiveProfile', activeProfileName);
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    window.processSaveFile = function() {
        const jsonInput = document.getElementById('jsonInput').value;
        try {
            currentSaveData = jsonInput ? JSON.parse(jsonInput) : {};
            saveActiveProfile();
            loadActiveProfileData();
        } catch (error) {
            alert('Błąd w danych JSON.'); console.error(error);
        }
    }

    document.getElementById('profile-select').addEventListener('change', (event) => {
        activeProfileName = event.target.value;
        localStorage.setItem('balatroTrackerActiveProfile', activeProfileName);
        loadActiveProfileData();
    });

    document.getElementById('add-profile-btn').addEventListener('click', () => {
        const newProfileName = prompt('Podaj nazwę nowego profilu:', `Profil ${Object.keys(allProfilesData).length + 1}`);
        if (newProfileName && !allProfilesData[newProfileName]) {
            allProfilesData[newProfileName] = {};
            activeProfileName = newProfileName;
            saveActiveProfile();
            updateProfileSelect();
            loadActiveProfileData();
        } else if (newProfileName) { alert('Profil o tej nazwie już istnieje!'); }
    });

    document.getElementById('delete-profile-btn').addEventListener('click', () => {
        if (Object.keys(allProfilesData).length <= 1) { alert('Nie można usunąć ostatniego profilu!'); return; }
        if (confirm(`Czy na pewno chcesz usunąć profil "${activeProfileName}"?`)) {
            delete allProfilesData[activeProfileName];
            activeProfileName = Object.keys(allProfilesData)[0];
            saveActiveProfile();
            updateProfileSelect();
            loadActiveProfileData();
        }
    });

    document.getElementById('download-json-btn').addEventListener('click', downloadJsonFile);
    document.getElementById('export-excel-btn').addEventListener('click', exportToExcel);
    document.getElementById('search-input').addEventListener('input', renderJokers);
    
    document.querySelectorAll('.filter-btn[data-rarity]').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn[data-rarity]').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderJokers();
        });
    });

    document.querySelectorAll('.stake-btn').forEach(button => {
        button.addEventListener('click', () => {
            const stake = button.dataset.stake;
            if (stake === 'all') {
                document.querySelectorAll('.stake-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            } else {
                document.querySelector('.stake-btn[data-stake="all"]').classList.remove('active');
                button.classList.toggle('active');
            }
            if (!document.querySelector('.stake-btn[data-stake]:not([data-stake="all"]).active')) {
                document.querySelector('.stake-btn[data-stake="all"]').classList.add('active');
            }
            renderJokers();
        });
    });

    const sortUsageBtn = document.getElementById('sort-usage-btn');
    const forgottenContainer = document.getElementById('forgotten-jokers-container');
    sortUsageBtn.addEventListener('click', () => {
        const modes = ['default', 'usage_desc', 'usage_asc', 'alpha'];
        const currentModeIndex = modes.indexOf(currentSortMode);
        currentSortMode = modes[(currentModeIndex + 1) % modes.length];
        const modeText = { 'default': 'Sort by...', 'usage_desc': 'Sort: Most Used', 'usage_asc': 'Sort: Least Used', 'alpha': 'Sort: A-Z' };
        sortUsageBtn.textContent = modeText[currentSortMode];
        if (currentSortMode !== 'default') sortUsageBtn.classList.add('active'); else sortUsageBtn.classList.remove('active');
        forgottenContainer.style.display = currentSortMode === 'usage_asc' ? 'block' : 'none';
        renderJokers();
    });

    document.getElementById('results').addEventListener('click', function(event) {
        const target = event.target;
        const editorContainer = target.closest('.stake-editor-container');
        if (editorContainer && !target.classList.contains('stake-choice')) editorContainer.classList.toggle('expanded');
        if (target.classList.contains('stake-choice')) {
            const { jokerId, stakeId } = target.dataset;
            toggleJokerStake(jokerId, stakeId);
            if (editorContainer) editorContainer.classList.remove('expanded');
        }
    });

    document.getElementById('open-guide-btn').addEventListener('click', () => document.getElementById('guide-modal-overlay').style.display = 'block');
    document.getElementById('personality-test-btn').addEventListener('click', runPersonalityTest);
    document.getElementById('todo-list-btn').addEventListener('click', generateToDoList);
    document.getElementById('forgotten-jokers-btn').addEventListener('click', showForgottenJokersModal);

    // --- NAPRAWIONA FUNKCJA CTRL+F ---
    document.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
            event.preventDefault(); // Zatrzymaj domyślną akcję przeglądarki (okno "Znajdź")
            document.getElementById('search-input').focus(); // Ustaw focus na polu wyszukiwania
        }
    });
}

// --- FUNKCJE POBIERANIA I EKSPORTU ---
function downloadJsonFile() {
    if (!currentSaveData || Object.keys(currentSaveData).length === 0) { alert('Brak danych do pobrania.'); return; }
    const dataStr = JSON.stringify(currentSaveData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `balatro_save_${activeProfileName.replace(/\s/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function exportToExcel() {
    if (!currentSaveData || Object.keys(currentSaveData).length === 0) { alert('Brak danych do eksportu.'); return; }
    const styles = `<style>body{font-family:sans-serif}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background-color:#f2f2f2;font-weight:700}.joker-name{font-size:14px;font-weight:700}.completed{background-color:#C6EFCE;color:#006100;text-align:center}.not-completed{background-color:#FFC7CE;color:#9C0006;text-align:center}.stake-header-white{background-color:#fff;border:1px solid #ccc}.stake-header-red{background-color:#ff5454}.stake-header-green{background-color:#54ff54}.stake-header-black{background-color:#444;color:#fff}.stake-header-blue{background-color:#5454ff;color:#fff}.stake-header-purple{background-color:#ff54ff}.stake-header-orange{background-color:#ffb454}.stake-header-gold{background-color:#ffd700}</style>`;
    let tableHtml = `<table><thead><tr><th>Joker Name</th><th>Rarity</th>${STAKES.map(s=>`<th class="stake-header-${s.name.toLowerCase()}">${s.name}</th>`).join('')}</tr></thead><tbody>`;
    const jokerUsage = currentSaveData.joker_usage || {};
    for (const jokerId in JOKER_DATA) {
        const jokerInfo = JOKER_DATA[jokerId];
        const userJokerData = jokerUsage[jokerId];
        tableHtml += `<tr><td class="joker-name">${jokerInfo.name}</td><td>${jokerInfo.rarity}</td>`;
        STAKES.forEach(stake => {
            const hasWin = userJokerData?.wins_by_key?.[stake.id];
            tableHtml += `<td class="${hasWin?'completed':'not-completed'}">${hasWin?'TAK':'NIE'}</td>`;
        });
        tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table>';
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8">${styles}</head><body>${tableHtml}</body></html>`;
    const dataBlob = new Blob([fullHtml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `balatro_progress_${activeProfileName.replace(/\s/g, '_')}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// --- POZOSTAŁE FUNKCJE ---
function renderJokers() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = "";
    if (!currentSaveData) return;

    const rarityFilter = document.querySelector('.filter-btn[data-rarity].active').dataset.rarity;
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const jokerUsage = currentSaveData.joker_usage;
    let jokerIds = Object.keys(JOKER_DATA);

    if (currentSortMode === 'usage_desc') jokerIds.sort((a, b) => getJokerUsageCount(b) - getJokerUsageCount(a));
    else if (currentSortMode === 'usage_asc') jokerIds.sort((a, b) => getJokerUsageCount(a) - getJokerUsageCount(b));
    else if (currentSortMode === 'alpha') jokerIds.sort((a, b) => JOKER_DATA[a].name.localeCompare(JOKER_DATA[b].name));
    
    jokerIds.forEach(jokerId => {
        const jokerInfo = JOKER_DATA[jokerId];
        const userJokerData = jokerUsage ? jokerUsage[jokerId] : null;
        const activeStakes = Array.from(document.querySelectorAll('.stake-btn.active')).map(btn => btn.dataset.stake);
        if (!activeStakes.includes('all') && !activeStakes.some(stake => userJokerData?.wins_by_key?.[stake])) return;
        if (rarityFilter !== 'all' && jokerInfo.rarity !== rarityFilter) return;
        if (searchTerm && !jokerInfo.name.toLowerCase().includes(searchTerm)) return;

        const card = document.createElement('div');
        card.className = 'joker-card';
        const imageContainer = document.createElement('div');
        imageContainer.className = 'joker-image-container';
        imageContainer.addEventListener('click', () => openJokerModal(jokerId));
        if (jokerUsage && jokerUsage[jokerId]) {
            if (Array.isArray(jokerInfo.pos)) {
                const bgLayer = document.createElement('div'); bgLayer.className = 'joker-layer joker-bg'; bgLayer.style.backgroundPosition = jokerInfo.pos[0]; imageContainer.appendChild(bgLayer);
                const fgLayer = document.createElement('div'); fgLayer.className = 'joker-layer joker-fg'; fgLayer.style.backgroundPosition = jokerInfo.pos[1]; imageContainer.appendChild(fgLayer);
            } else {
                const fgLayer = document.createElement('div'); fgLayer.className = 'joker-layer joker-fg'; fgLayer.style.backgroundPosition = jokerInfo.pos; imageContainer.appendChild(fgLayer);
            }
        } else {
            imageContainer.style.opacity = '0.3';
        }
        card.appendChild(imageContainer);
        const nameHeader = document.createElement('h3');
        nameHeader.textContent = jokerInfo.name;
        card.appendChild(nameHeader);
        if (!userJokerData) {
            const blockedText = document.createElement('p'); blockedText.textContent = '(Zablokowany)'; card.appendChild(blockedText);
        }
        const editorContainer = document.createElement('div');
        editorContainer.className = 'stake-editor-container';
        const summaryDot = document.createElement('div');
        summaryDot.className = 'stake-summary-dot';
        const completedStakes = STAKES.filter(stake => userJokerData?.wins_by_key?.[stake.id]);
        if (completedStakes.length > 0) {
            summaryDot.style.backgroundColor = completedStakes[completedStakes.length - 1].color;
        } else {
            summaryDot.style.backgroundColor = '#333';
            summaryDot.textContent = '+';
        }
        editorContainer.appendChild(summaryDot);
        const stakeSelector = document.createElement('div');
        stakeSelector.className = 'stake-selector';
        STAKES.forEach(stake => {
            const choiceBtn = document.createElement('button');
            choiceBtn.className = 'stake-choice';
            choiceBtn.style.backgroundColor = stake.color;
            choiceBtn.dataset.jokerId = jokerId;
            choiceBtn.dataset.stakeId = stake.id;
            if (completedStakes.some(s => s.id === stake.id)) {
                choiceBtn.classList.add('completed');
            }
            stakeSelector.appendChild(choiceBtn);
        });
        editorContainer.appendChild(stakeSelector);
        card.appendChild(editorContainer);
        resultsDiv.appendChild(card);
    });
}

function toggleJokerStake(jokerId, stakeId) {
    if (!currentSaveData) return;
    if (!currentSaveData.joker_usage) currentSaveData.joker_usage = {};
    if (!currentSaveData.joker_usage[jokerId]) currentSaveData.joker_usage[jokerId] = { wins_by_key: {}, losses_by_key: {} };
    if (!currentSaveData.joker_usage[jokerId].wins_by_key) currentSaveData.joker_usage[jokerId].wins_by_key = {};
    const wins = currentSaveData.joker_usage[jokerId].wins_by_key;
    if (wins[stakeId] && wins[stakeId] > 0) delete wins[stakeId];
    else wins[stakeId] = 1;
    saveActiveProfile();
    renderJokers();
}

function updateProfileStats() {
    const statsContainer = document.getElementById('profile-stats-container');
    if (!currentSaveData || !currentSaveData.joker_usage) {
        statsContainer.style.display = 'none';
        return;
    }
    statsContainer.style.display = 'grid';

    const jokerUsage = currentSaveData.joker_usage;
    let completedGoldStickers = 0;
    let favoriteJoker = { id: null, wins: -1 };
    let nemesisJoker = { id: null, nemesisScore: -1 };
    const totalPossibleJokers = Object.keys(JOKER_DATA).length;
    const MIN_GAMES_FOR_NEMESIS = 5;

    for (const jokerId in jokerUsage) {
        if (!JOKER_DATA[jokerId]) continue;
        const data = jokerUsage[jokerId];
        if (data.wins_by_key?.['stake_gold']) completedGoldStickers++;
        const totalWins = Object.values(data.wins_by_key || {}).reduce((s, c) => s + c, 0);
        const totalLosses = Object.values(data.losses_by_key || {}).reduce((s, c) => s + c, 0);
        const totalGames = totalWins + totalLosses;
        if (totalWins > favoriteJoker.wins) favoriteJoker = { id: jokerId, wins: totalWins };
        if (totalGames >= MIN_GAMES_FOR_NEMESIS) {
            const lossPercentage = totalGames > 0 ? (totalLosses / totalGames) : 0;
            const nemesisScore = lossPercentage * totalGames;
            if (nemesisScore > nemesisJoker.nemesisScore) {
                nemesisJoker = { id: jokerId, nemesisScore: nemesisScore, losses: totalLosses, games: totalGames };
            }
        }
    }
    
    if (nemesisJoker.id === null) {
        let maxLosses = -1;
        for (const jokerId in jokerUsage) {
            const data = jokerUsage[jokerId];
            const totalLosses = Object.values(data.losses_by_key || {}).reduce((s, c) => s + c, 0);
            if(totalLosses > maxLosses) {
                maxLosses = totalLosses;
                const totalWins = Object.values(data.wins_by_key || {}).reduce((s, c) => s + c, 0);
                nemesisJoker = { id: jokerId, losses: totalLosses, games: totalWins + totalLosses };
            }
        }
    }

    const completionPercentage = totalPossibleJokers > 0 ? Math.round((completedGoldStickers / totalPossibleJokers) * 100) : 0;
    document.getElementById('stat-completion').textContent = `${completionPercentage}%`;
    document.getElementById('stat-completion-details').textContent = `${completedGoldStickers} / ${totalPossibleJokers} złotych naklejek`;

    const createJokerIcon = (jokerId, container) => {
        container.innerHTML = '';
        if (!jokerId || !JOKER_DATA[jokerId]) return;
        const jokerInfo = JOKER_DATA[jokerId];
        if (Array.isArray(jokerInfo.pos)) {
            const bgLayer = document.createElement('div'); bgLayer.className = 'joker-layer joker-bg'; bgLayer.style.backgroundPosition = jokerInfo.pos[0]; container.appendChild(bgLayer);
            const fgLayer = document.createElement('div'); fgLayer.className = 'joker-layer joker-fg'; fgLayer.style.backgroundPosition = jokerInfo.pos[1]; container.appendChild(fgLayer);
        } else {
            const fgLayer = document.createElement('div'); fgLayer.className = 'joker-layer joker-fg'; fgLayer.style.backgroundPosition = jokerInfo.pos; container.appendChild(fgLayer);
        }
    };

    if (favoriteJoker.id) {
        createJokerIcon(favoriteJoker.id, document.getElementById('stat-favorite-joker-img'));
        document.getElementById('stat-favorite-joker-name').textContent = JOKER_DATA[favoriteJoker.id].name;
        document.getElementById('stat-favorite-joker-details').textContent = `${favoriteJoker.wins} wygranych`;
    }

    if (nemesisJoker.id) {
        createJokerIcon(nemesisJoker.id, document.getElementById('stat-nemesis-joker-img'));
        document.getElementById('stat-nemesis-joker-name').textContent = JOKER_DATA[nemesisJoker.id].name;
        const lossPercentage = nemesisJoker.games > 0 ? Math.round((nemesisJoker.losses / nemesisJoker.games) * 100) : 0;
        document.getElementById('stat-nemesis-joker-details').textContent = `${lossPercentage}% przegranych (${nemesisJoker.games} gier)`;
    }
}

// Pozostałe funkcje pomocnicze...
function getJokerUsageCount(a){const b=currentSaveData?.joker_usage,c=b?b[a]:null;return c?(d=Object.values(c.wins_by_key||{}).reduce((a,b)=>a+b,0),Object.values(c.losses_by_key||{}).reduce((a,b)=>a+b,0)+d):0}
function openJokerModal(a){/*...*/}
function runPersonalityTest(){/*...*/}
function analyzeSaveDataForPersonality(a){/*...*/}
function displayPersonalityResult(a){/*...*/}
function generateToDoList(){/*...*/}
function showForgottenJokersModal(){/*...*/}
// Pełne implementacje dla uniknięcia błędów
function openJokerModal(jokerId){const jokerInfo=JOKER_DATA[jokerId],userJokerData=currentSaveData.joker_usage?currentSaveData.joker_usage[jokerId]:null;document.getElementById("modal-joker-name").textContent=jokerInfo.name,document.getElementById("modal-joker-rarity").textContent=jokerInfo.rarity||"Unknown";const imageContainer=document.getElementById("modal-joker-image");if(imageContainer.innerHTML="",Array.isArray(jokerInfo.pos)){const bgLayer=document.createElement("div");bgLayer.className="joker-layer joker-bg",bgLayer.style.backgroundPosition=jokerInfo.pos[0],imageContainer.appendChild(bgLayer);const fgLayer=document.createElement("div");fgLayer.className="joker-layer joker-fg",fgLayer.style.backgroundPosition=jokerInfo.pos[1],imageContainer.appendChild(fgLayer)}else{const fgLayer=document.createElement("div");fgLayer.className="joker-layer joker-fg",fgLayer.style.backgroundPosition=jokerInfo.pos,imageContainer.appendChild(fgLayer)}if(userJokerData){let totalWins=userJokerData.wins_by_key?Object.values(userJokerData.wins_by_key).reduce((a,b)=>a+(b||0),0):0,totalLosses=userJokerData.losses_by_key?Object.values(userJokerData.losses_by_key).reduce((a,b)=>a+(b||0),0):0;const totalGames=totalWins+totalLosses,winRate=0<totalGames?Math.round(totalWins/totalGames*100):0;document.getElementById("modal-win-rate").textContent=`${winRate}%`,document.getElementById("modal-total-wins").textContent=totalWins,document.getElementById("modal-total-games").textContent=totalGames}else document.getElementById("modal-win-rate").textContent="-%",document.getElementById("modal-total-wins").textContent="-",document.getElementById("modal-total-games").textContent="-";const modalStakesContainer=document.getElementById("modal-joker-stakes");modalStakesContainer.innerHTML="",STAKES.forEach(stake=>{const sticker=document.createElement("div");sticker.className="sticker",sticker.style.backgroundColor=stake.color,userJokerData&&userJokerData.wins_by_key&&userJokerData.wins_by_key[stake.id]&&sticker.classList.add("completed"),modalStakesContainer.appendChild(sticker)}),document.getElementById("joker-modal-overlay").style.display="block"}
function runPersonalityTest(){if(!currentSaveData)return void alert("Najpierw wklej zawartość swojego pliku save.json!");const a=analyzeSaveDataForPersonality(currentSaveData);displayPersonalityResult(a)}
function analyzeSaveDataForPersonality(saveData){const tarotUsage=saveData.tarot_usage||{},spectralUsage=saveData.spectral_usage||{},allUsage={...tarotUsage,...spectralUsage};let maxScore=0,winningPersonality=BALATRO_PERSONALITIES.find(a=>a.name.includes("Początkujący"));for(const personality of BALATRO_PERSONALITIES)if(0!==personality.cards.length){const currentScore=personality.cards.reduce((a,b)=>a+(allUsage[b]||0),0);currentScore>maxScore&&(maxScore=currentScore,winningPersonality=personality)}let topCardName="Brak danych",topCardCount=0;for(const cardId in allUsage)allUsage[cardId]>topCardCount&&(topCardCount=allUsage[cardId],topCardName=cardId.replace(/c_|s_/,"").replace(/_/g," ").replace(/\b\w/g,a=>a.toUpperCase()));return 0===maxScore?{personality:winningPersonality,evidence:"Nie znaleziono jeszcze dominującego stylu gry."}:{personality:winningPersonality,evidence:`Twoją najczęściej używaną kartą jest: <strong>${topCardName}</strong> (użyta ${topCardCount} razy).`}}
function displayPersonalityResult(result){document.getElementById("personality-title").textContent=result.personality.name,document.getElementById("personality-description").textContent=result.personality.description,document.getElementById("personality-evidence").innerHTML=result.evidence,document.getElementById("personality-modal-overlay").style.display="block"}
function generateToDoList(){if(!currentSaveData)return void alert("Najpierw wklej zawartość swojego pliku save.json!");const jokerUsage=currentSaveData.joker_usage||{},contentDiv=document.getElementById("todo-list-content");contentDiv.innerHTML="";const targetStakeId="stake_gold",candidateStakeIds=["stake_orange","stake_purple"],missingOnGold=[],goodCandidates=[];for(const jokerId in JOKER_DATA){const userJokerData=jokerUsage[jokerId];userJokerData?.wins_by_key?.[targetStakeId]||(missingOnGold.push(JOKER_DATA[jokerId].name),candidateStakeIds.some(a=>userJokerData?.wins_by_key?.[a])&&goodCandidates.push(JOKER_DATA[jokerId].name))}let html="";0===missingOnGold.length?html="<h3>Gratulacje!</h3><p>Wygląda na to, że masz już wszystkie złote naklejki! Jesteś kozak.</p>":(html=`<h3>Brakuje ${missingOnGold.length} naklejek na Złotej Stawce</h3>`,0<goodCandidates.length?(html+=`<p>Oto Twoi najlepsi kandydaci (wygrałeś już nimi na Pomarańczowej/Fioletowej Stawce):</p>`,html+=`<ul>${goodCandidates.map(a=>`<li>${a}</li>`).join("")}</ul>`):html+="<p>Na razie brak oczywistych kandydatów. Czas na ciężką harówkę od zera!</p>"),contentDiv.innerHTML=html,document.getElementById("todo-modal-overlay").style.display="block"}
function showForgottenJokersModal(){if(!currentSaveData)return void alert("Najpierw wklej zawartość swojego pliku save.json!");const listContainer=document.getElementById("forgotten-jokers-list");listContainer.innerHTML="";const forgottenJokers=Object.keys(JOKER_DATA).filter(a=>0===getJokerUsageCount(a));if(0===forgottenJokers.length)listContainer.innerHTML='<p style="text-align: center; padding: 20px;">Gratulacje! Wypróbowałeś już każdego Jokera!</p>';else for(const jokerId of forgottenJokers){const jokerInfo=JOKER_DATA[jokerId],card=document.createElement("div");card.className="joker-card",card.addEventListener("click",()=>{document.getElementById("forgotten-modal-overlay").style.display="none",openJokerModal(jokerId)});const imageContainer=document.createElement("div");if(imageContainer.className="joker-image-container",Array.isArray(jokerInfo.pos)){const bgLayer=document.createElement("div");bgLayer.className="joker-layer joker-bg",bgLayer.style.backgroundPosition=jokerInfo.pos[0],imageContainer.appendChild(bgLayer);const fgLayer=document.createElement("div");fgLayer.className="joker-layer joker-fg",fgLayer.style.backgroundPosition=jokerInfo.pos[1],imageContainer.appendChild(fgLayer)}else{const fgLayer=document.createElement("div");fgLayer.className="joker-layer joker-fg",fgLayer.style.backgroundPosition=jokerInfo.pos,imageContainer.appendChild(fgLayer)}card.appendChild(imageContainer);const nameHeader=document.createElement("h3");nameHeader.textContent=jokerInfo.name,card.appendChild(nameHeader),listContainer.appendChild(card)}document.getElementById("forgotten-modal-overlay").style.display="block"}

// W pliku scripts/main.js, wewnątrz funkcji setupEventListeners()

// --- PRZEŁĄCZNIK STYLÓW UI ---
const styleSwitcher = document.getElementById('style-switcher');
styleSwitcher.addEventListener('change', () => {
    const classicStyle = document.getElementById('classic-style');
    const balatroStyle = document.getElementById('balatro-style');

    if (styleSwitcher.checked) {
        // Włącz styl Balatro, wyłącz klasyczny
        balatroStyle.disabled = false;
        classicStyle.disabled = true;
    } else {
        // Włącz styl klasyczny, wyłącz Balatro
        balatroStyle.disabled = true;
        classicStyle.disabled = false;
    }
});