// statki.js
import { auth, db, doc, getDoc, updateDoc, collection, getDocs } from './firebase-config.js';

// ==================== Stałe ====================
const BOARD_SIZE = 10;
const SHIPS = [
    { name: 'battleship', size: 4, count: 1, icon: '🚢' },
    { name: 'cruiser',    size: 3, count: 2, icon: '⛴️' },
    { name: 'destroyer',  size: 2, count: 3, icon: '🛥️' },
    { name: 'submarine',  size: 1, count: 4, icon: '⛵' }
];

// ==================== Stan gry ====================
let state = createFreshState();

function createFreshState() {
    return {
        mode:        null,
        phase:       'mode-selection',
        playerBoard: [],
        enemyBoard:  [],
        playerShips: [],
        enemyShips:  [],
        playerTurn:  true,
        opponent:    null,
        resultSaved: false,   // ← zapobiega podwójnemu zapisowi
        computerLastHit:      null,
        computerTargets:      [],
        stats: {
            playerHits:  0,
            playerMisses:0,
            enemyHits:   0,
            enemyMisses: 0,
            gamesWon:    0
        }
    };
}

// ==================== Init ====================
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    updatePageTranslations();

    const user = JSON.parse(localStorage.getItem('currentUser'));
    const nav  = document.getElementById('username-nav');
    if (nav && user) nav.textContent = user.username;
});

// ==================== Wybór trybu ====================
function selectMode(mode) {
    state.mode = mode;

    if (mode === 'bot') {
        showPanel('gamePanel');
        initGame();
    } else {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) { showToast(t('loginRequired'), 'error'); return; }
        showPanel('playerSearch');
    }
}

function backToModeSelection() {
    showPanel('gameModeSelection');
    state.mode = null;
}

function showPanel(id) {
    ['gameModeSelection','playerSearch','gamePanel'].forEach(p => {
        const el = document.getElementById(p);
        if (el) el.style.display = p === id ? 'block' : 'none';
    });
}

// ==================== Wyszukiwanie graczy ====================
let searchDebounce = null;

async function searchPlayers() {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(async () => {
        const input   = document.getElementById('searchInput').value.trim().toLowerCase();
        const results = document.getElementById('searchResults');
        if (!results) return;

        if (input.length < 2) { results.innerHTML = ''; return; }

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        results.innerHTML = '<div class="no-results">🔍 Szukam...</div>';

        try {
            const snap  = await getDocs(collection(db, "users"));
            const found = [];

            snap.forEach(d => {
                const data = d.data();
                if (
                    data.username.toLowerCase().includes(input) &&
                    data.email !== currentUser?.email
                ) found.push(data);
            });

            if (!found.length) {
                results.innerHTML = `<div class="no-results">${t('noPlayersFound')}</div>`;
                return;
            }

            results.innerHTML = '';
            found.slice(0, 5).forEach(u => {
                const bs  = u.stats?.battleship || {};
                const div = document.createElement('div');
                div.className = 'player-result';
                div.innerHTML = `
                    <div>
                        <div class="player-result-name">${escapeHTML(u.username)}</div>
                        <div class="player-result-stats">W: ${bs.wins||0} | L: ${bs.losses||0}</div>
                    </div>
                    <button class="btn-select-player" data-username="${escapeHTML(u.username)}">
                        ${t('backBtn').includes('Powrót') ? 'Wybierz' : 'Select'}
                    </button>
                `;
                div.querySelector('button').addEventListener('click', () => selectPlayer(u.username));
                results.appendChild(div);
            });
        } catch (err) {
            console.error('Błąd wyszukiwania:', err);
            results.innerHTML = '<div class="no-results">⚠️ Błąd wyszukiwania</div>';
        }
    }, 300);
}

function selectPlayer(username) {
    state.opponent = username;
    showPanel('gamePanel');

    const info = document.getElementById('opponentInfo');
    const name = document.getElementById('opponentName');
    if (info) info.style.display = 'block';
    if (name) name.textContent = username;

    initGame();
}

// ==================== Inicjalizacja gry ====================
function initGame() {
    state.playerBoard = createBoard();
    state.enemyBoard  = createBoard();
    state.playerShips = [];
    state.enemyShips  = [];
    state.phase       = 'setup';
    state.playerTurn  = true;
    state.resultSaved = false;
    state.computerLastHit   = null;
    state.computerTargets   = [];

    renderBoard('playerBoard', state.playerBoard, true,  false);
    renderBoard('enemyBoard',  state.enemyBoard,  false, false);

    updateStatus(t('clickAutoSetup'));
    resetShipLives();

    const title = document.getElementById('gameStatusTitle');
    if (title) title.textContent = t('setupPhase');
}

function createBoard() {
    return Array.from({ length: BOARD_SIZE }, () =>
        Array.from({ length: BOARD_SIZE }, () => ({ ship: null, hit: false, miss: false }))
    );
}

// ==================== Renderowanie planszy ====================
function renderBoard(elementId, board, isPlayer, canAttack) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = '';

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell    = document.createElement('div');
            const cellData= board[r][c];

            cell.className      = 'cell';
            cell.dataset.row    = r;
            cell.dataset.col    = c;

            if (cellData.hit && cellData.ship) {
                cell.classList.add(cellData.ship.sunk ? 'sunk' : 'hit');
                cell.innerHTML = '<span class="hit-marker">✕</span>';
            } else if (cellData.miss) {
                cell.classList.add('miss');
                cell.innerHTML = '<span class="miss-marker">○</span>';
            } else if (cellData.ship && isPlayer) {
                cell.classList.add('ship');
            }

            if (canAttack && !cellData.hit && !cellData.miss) {
                cell.classList.add('attackable');
                cell.addEventListener('click', () => handleAttack(r, c));
            }

            el.appendChild(cell);
        }
    }
}

// ==================== Rozmieszczanie statków ====================
function autoSetupShips() {
    state.playerShips = [];
    state.playerBoard = createBoard();
    let ok = true;

    for (const type of SHIPS) {
        for (let i = 0; i < type.count; i++) {
            const ship = tryPlaceRandom(state.playerBoard, type.size, type.name, type.icon);
            if (!ship) { ok = false; break; }
            ship.index = i;
            state.playerShips.push(ship);
        }
        if (!ok) break;
    }

    if (!ok) {
        updateStatus('⚠️ Nie udało się rozstawić. Spróbuj ponownie.');
        return;
    }

    renderBoard('playerBoard', state.playerBoard, true, false);

    const btn = document.getElementById('startBtn');
    if (btn) btn.disabled = false;

    updateStatus(t('shipsPlaced'));
}

function tryPlaceRandom(board, size, name, icon) {
    for (let attempt = 0; attempt < 200; attempt++) {
        const row  = Math.floor(Math.random() * BOARD_SIZE);
        const col  = Math.floor(Math.random() * BOARD_SIZE);
        const horiz= Math.random() > 0.5;
        if (canPlace(board, row, col, size, horiz)) {
            return placeShip(board, row, col, size, horiz, name, icon);
        }
    }
    return null;
}

function canPlace(board, row, col, size, horizontal) {
    if (horizontal ? col + size > BOARD_SIZE : row + size > BOARD_SIZE) return false;

    for (let i = 0; i < size; i++) {
        const r = horizontal ? row : row + i;
        const c = horizontal ? col + i : col;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                    if (board[nr][nc].ship) return false;
                }
            }
        }
    }
    return true;
}

function placeShip(board, row, col, size, horizontal, name, icon) {
    const ship = { name, size, icon, hits: 0, sunk: false, positions: [] };
    for (let i = 0; i < size; i++) {
        const r = horizontal ? row : row + i;
        const c = horizontal ? col + i : col;
        board[r][c].ship = ship;
        ship.positions.push({ row: r, col: c });
    }
    return ship;
}

// ==================== Start bitwy ====================
function startBattle() {
    if (!state.playerShips.length) {
        updateStatus(t('placeShipsFirst'));
        return;
    }

    // Rozstaw flotę wroga
    state.enemyShips = [];
    state.enemyBoard = createBoard();

    for (const type of SHIPS) {
        for (let i = 0; i < type.count; i++) {
            const ship = tryPlaceRandom(state.enemyBoard, type.size, type.name, type.icon);
            if (ship) { ship.index = i; state.enemyShips.push(ship); }
        }
    }

    state.phase = 'battle';

    const setup = document.getElementById('setupControls');
    const game  = document.getElementById('gameControls');
    if (setup) setup.style.display = 'none';
    if (game)  game.style.display  = 'flex';

    const title = document.getElementById('gameStatusTitle');
    if (title) title.textContent = t('battleInProgress');

    renderBoard('playerBoard', state.playerBoard, true,  false);
    renderBoard('enemyBoard',  state.enemyBoard,  false, true);
    updateStatus(t('yourTurn'));
}

// ==================== Atak gracza ====================
function handleAttack(row, col) {
    if (!state.playerTurn || state.phase !== 'battle') return;

    const cell = state.enemyBoard[row][col];
    if (cell.hit || cell.miss) return;

    if (cell.ship) {
        applyHit(state.enemyBoard, cell.ship, row, col, 'player');

        if (allSunk(state.enemyShips)) {
            renderBoard('enemyBoard', state.enemyBoard, false, false);
            updateStats();
            endGame(true);
            return;
        }
        // Trafienie → gracz strzela dalej
        updateStatus(cell.ship.sunk ? t('shipSunk') : t('hitSuccess'));
        renderBoard('enemyBoard', state.enemyBoard, false, true);
    } else {
        cell.miss = true;
        state.stats.playerMisses++;
        state.playerTurn = false;
        updateStatus(t('missedShot'));
        renderBoard('enemyBoard', state.enemyBoard, false, false);
        setTimeout(() => computerTurn(), 1000);
    }
    updateStats();
}

// ==================== Tura komputera ====================
function computerTurn() {
    if (state.phase !== 'battle') return;
    updateStatus(t('enemyTurn'));

    setTimeout(() => {
        const { row, col } = pickComputerCell();
        const cell = state.playerBoard[row][col];

        if (cell.ship) {
            applyHit(state.playerBoard, cell.ship, row, col, 'enemy');
            state.computerLastHit = { row, col };

            // Dodaj sąsiadów do kolejki celów
            if (!cell.ship.sunk) {
                addNeighbors(row, col);
            } else {
                // Statek zatopiony — czyść kolejkę
                state.computerLastHit   = null;
                state.computerTargets   = [];
            }

            renderBoard('playerBoard', state.playerBoard, true, false);
            updateStats();

            if (allSunk(state.playerShips)) {
                endGame(false);
                return;
            }

            const msg = cell.ship.sunk ? t('enemySunkShip') : t('enemyHit');
            updateStatus(msg);
            // Komputer trafia → strzela znowu
            setTimeout(() => computerTurn(), 1200);

        } else {
            cell.miss = true;
            state.stats.enemyMisses++;
            state.playerTurn = true;

            renderBoard('playerBoard', state.playerBoard, true, false);
            renderBoard('enemyBoard',  state.enemyBoard,  false, true);
            updateStats();
            updateStatus(t('enemyMissed'));
        }
    }, 900);
}

function pickComputerCell() {
    // Kontynuuj inteligentny atak
    while (state.computerTargets.length) {
        const t = state.computerTargets.shift();
        const c = state.playerBoard[t.row][t.col];
        if (!c.hit && !c.miss) return t;
    }
    // Losowy strzał z checksboardem (efektywniejszy)
    const free = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = state.playerBoard[r][c];
            if (!cell.hit && !cell.miss && (r + c) % 2 === 0) free.push({ row: r, col: c });
        }
    }
    // Fallback: wszystkie wolne pola jeśli checkerboard wyczerpany
    if (!free.length) {
        for (let r = 0; r < BOARD_SIZE; r++)
            for (let c = 0; c < BOARD_SIZE; c++) {
                const cell = state.playerBoard[r][c];
                if (!cell.hit && !cell.miss) free.push({ row: r, col: c });
            }
    }
    return free[Math.floor(Math.random() * free.length)];
}

function addNeighbors(row, col) {
    [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr, dc]) => {
        const nr = row + dr, nc = col + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            const cell = state.playerBoard[nr][nc];
            if (!cell.hit && !cell.miss) {
                // Nie dodawaj duplikatów
                if (!state.computerTargets.some(t => t.row === nr && t.col === nc)) {
                    state.computerTargets.push({ row: nr, col: nc });
                }
            }
        }
    });
}

// ==================== Helpers ====================
function applyHit(board, ship, row, col, side) {
    board[row][col].hit = true;
    ship.hits++;

    const prefix = side === 'player' ? 'enemy' : 'player';
    if (side === 'player') {
        state.stats.playerHits++;
    } else {
        state.stats.enemyHits++;
    }

    if (ship.hits >= ship.size) {
        ship.sunk = true;
        markSunkZone(board, ship);
    }

    updateShipLife(prefix, ship);
}

function markSunkZone(board, ship) {
    ship.positions.forEach(({ row, col }) => {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = row + dr, nc = col + dc;
                if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                    const c = board[nr][nc];
                    if (!c.ship && !c.miss) c.miss = true;
                }
            }
        }
    });
}

function allSunk(ships) {
    return ships.every(s => s.sunk);
}

// ==================== Życia statków ====================
// ID w HTML: player-ship-4, player-ship-3-0, player-ship-3-1 itd.
function updateShipLife(prefix, ship) {
    const id = ship.size === 4
        ? `${prefix}-ship-${ship.size}`
        : `${prefix}-ship-${ship.size}-${ship.index ?? 0}`;

    const container = document.getElementById(id);
    if (!container) return;

    const lives = container.querySelectorAll('.life');
    lives.forEach((life, i) => {
        if (i < ship.hits) {
            life.classList.remove('active');
            life.classList.add('lost');
        }
    });
}

function resetShipLives() {
    document.querySelectorAll('.life').forEach(l => {
        l.classList.remove('lost');
        l.classList.add('active');
    });
}

// ==================== Koniec gry ====================
function endGame(playerWon) {
    state.phase = 'ended';

    const title = document.getElementById('gameStatusTitle');
    if (playerWon) {
        updateStatus(t('youWon'));
        if (title) title.textContent = t('victory');
        state.stats.gamesWon++;
    } else {
        updateStatus(t('youLost'));
        if (title) title.textContent = t('defeat');
    }

    // Pokaż statki wroga po zakończeniu
    renderBoard('enemyBoard', state.enemyBoard, true, false);
    updateStats();

    if (!state.resultSaved) {
        state.resultSaved = true;
        saveGameResult(playerWon);
    }
}

function newGame() {
    const setup = document.getElementById('setupControls');
    const game  = document.getElementById('gameControls');
    const btn   = document.getElementById('startBtn');
    if (setup) setup.style.display = 'flex';
    if (game)  game.style.display  = 'none';
    if (btn)   btn.disabled = true;

    const gamesWon = state.stats.gamesWon;
    state = createFreshState();
    state.stats.gamesWon = gamesWon;

    initGame();
    updateStats();
}

// ==================== Statystyki ====================
function updateStats() {
    const s = state.stats;
    ['playerHits','playerMisses','enemyHits','gamesWon'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = s[id] ?? 0;
    });
}

function loadStats() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user?.stats?.battleship) {
        state.stats.gamesWon = user.stats.battleship.wins || 0;
    }
    updateStats();
}

// ==================== Zapis wyników ====================
async function saveGameResult(won) {
    const stored = localStorage.getItem('currentUser');
    if (!stored) return;

    const currentUser = JSON.parse(stored);
    if (!currentUser?.uid) return;

    try {
        const userRef  = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;

        const stats = { ...userSnap.data().stats };
        if (!stats.battleship) stats.battleship = { wins: 0, losses: 0, points: 0 };

        if (won) {
            stats.battleship.wins++;
            stats.battleship.points = (stats.battleship.points || 0) + 20;
        } else {
            stats.battleship.losses++;
            stats.battleship.points = (stats.battleship.points || 0) + 5;
        }

        await updateDoc(userRef, { stats });

        currentUser.stats = stats;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showToast(t('resultSaved'), 'success');

    } catch (err) {
        console.error('Błąd zapisu wyniku:', err);
    }
}

// ==================== UI helpers ====================
function updateStatus(text) {
    const el = document.getElementById('statusText');
    if (el) el.textContent = text;
}

function escapeHTML(str) {
    return String(str)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(msg, type = 'info') {
    let toast = document.getElementById('gameToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'gameToast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className   = `toast ${type}`;
    void toast.offsetWidth;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ==================== Tłumaczenia ====================
function updatePageTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
}

// ==================== Eksport ====================
window.selectMode             = selectMode;
window.backToModeSelection    = backToModeSelection;
window.searchPlayers          = searchPlayers;
window.selectPlayer           = selectPlayer;
window.autoSetupShips         = autoSetupShips;
window.startBattle            = startBattle;
window.newGame                = newGame;
window.updatePageTranslations = updatePageTranslations;
