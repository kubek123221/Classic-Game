// kolko-i-krzyzyk.js
import { auth, db, doc, getDoc, updateDoc } from './firebase-config.js';

// ==================== Stan gry ====================
let board          = Array(9).fill('');
let currentPlayer  = 'X';
let gameActive     = true;
let gameMode       = 'pvp';
let botDifficulty  = 'easy';
let sessionStats   = { xWins: 0, oWins: 0, draws: 0 };
let currentResult  = null; // 'win' | 'loss' | 'draw'
let botPending     = false; // blokuje klik gracza podczas ruchu bota

const WIN_CONDITIONS = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];

// ==================== Elementy DOM ====================
const cells       = document.querySelectorAll('.cell');
const gameInfoEl  = document.getElementById('gameInfoText');
const diffSelector= document.getElementById('difficultySelector');

cells.forEach(cell => cell.addEventListener('click', handleCellClick));

// ==================== Tryb i trudność ====================
function setGameMode(mode) {
    gameMode = mode;

    document.querySelectorAll('.mode-btn').forEach(btn => {
        const isCurrent = (mode === 'pvp' && btn.dataset.mode === 'pvp')
                       || (mode === 'bot' && btn.dataset.mode === 'bot');
        btn.classList.toggle('active', isCurrent);
    });

    diffSelector.style.display = mode === 'bot' ? 'block' : 'none';
    resetGame();
}

function setDifficulty(difficulty) {
    botDifficulty = difficulty;

    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.difficulty === difficulty);
    });

    resetGame();
}

// ==================== Info o turze ====================
function updateGameInfo() {
    if (!gameInfoEl) return;
    if (gameMode === 'bot') {
        const names = { easy: t('diffEasy'), normal: t('diffNormal'), hard: t('diffHard') };
        gameInfoEl.textContent = `${t('youVsBot')} ${names[botDifficulty]}`;
    } else {
        gameInfoEl.textContent = t('playerXStarts');
    }
}

// ==================== Klik gracza ====================
function handleCellClick(e) {
    const index = parseInt(e.currentTarget.getAttribute('data-index'), 10);

    if (!gameActive || botPending || board[index] !== '') return;

    makeMove(index, currentPlayer);

    // Jeśli gra dalej aktywna i tryb bot — ruch bota
    if (gameActive && gameMode === 'bot' && currentPlayer === 'O') {
        scheduleBotMove();
    }
}

// ==================== Wykonaj ruch ====================
function makeMove(index, player) {
    board[index] = player;

    const cell = cells[index];
    cell.textContent = player;
    cell.classList.add('taken', player.toLowerCase());
    // Animacja pop-in
    cell.style.animation = 'none';
    requestAnimationFrame(() => { cell.style.animation = 'popIn 0.3s ease'; });

    const winner = checkWinner();

    if (winner && winner !== 'draw') {
        // Ktoś wygrał
        highlightWinner();
        gameActive = false;

        let msg;
        if (gameMode === 'bot') {
            msg = player === 'X' ? `🎉 ${t('youWin')}` : `🤖 ${t('botWins')}`;
        } else {
            msg = `🎉 ${t('playerWins')} ${player} ${t('wins2')}`;
        }
        if (gameInfoEl) gameInfoEl.textContent = msg;

        sessionStats[player === 'X' ? 'xWins' : 'oWins']++;
        currentResult = player === 'X' ? 'win' : 'loss';
        updateSessionStats();
        scheduleFirebaseSave();
        return;
    }

    if (winner === 'draw') {
        gameActive = false;
        if (gameInfoEl) gameInfoEl.textContent = t('draw');
        sessionStats.draws++;
        currentResult = 'draw';
        updateSessionStats();
        scheduleFirebaseSave();
        return;
    }

    // Zmień gracza
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

    if (gameMode === 'bot') {
        if (gameInfoEl) gameInfoEl.textContent = currentPlayer === 'X' ? t('yourMove') : t('botThinking');
    } else {
        if (gameInfoEl) gameInfoEl.textContent = `${t('playerTurn')} ${currentPlayer}`;
    }
}

// ==================== Bot ====================
function scheduleBotMove() {
    botPending = true;
    if (gameInfoEl) gameInfoEl.textContent = t('botThinking');

    setTimeout(() => {
        if (!gameActive) { botPending = false; return; }

        const move = getBotMove();
        if (move !== -1) makeMove(move, 'O');

        botPending = false;

        // Po ruchu bota, jeśli gra wciąż trwa
        if (gameActive && gameInfoEl) {
            gameInfoEl.textContent = t('yourMove');
        }
    }, 600);
}

function getBotMove() {
    switch (botDifficulty) {
        case 'easy':   return botEasy();
        case 'normal': return Math.random() < 0.5 ? botHard() : botEasy();
        case 'hard':   return botHard();
        default:       return botEasy();
    }
}

function botEasy() {
    const free = board.map((v, i) => v === '' ? i : null).filter(i => i !== null);
    return free.length ? free[Math.floor(Math.random() * free.length)] : -1;
}

function botHard() {
    let best = -Infinity, bestMove = -1;
    for (let i = 0; i < 9; i++) {
        if (board[i] !== '') continue;
        board[i] = 'O';
        const score = minimax(board, 0, false);
        board[i] = '';
        if (score > best) { best = score; bestMove = i; }
    }
    return bestMove;
}

function minimax(b, depth, isMax) {
    const result = checkWinner();
    if (result === 'O')    return 10 - depth;
    if (result === 'X')    return depth - 10;
    if (result === 'draw') return 0;

    if (isMax) {
        let best = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (b[i] !== '') continue;
            b[i] = 'O';
            best = Math.max(best, minimax(b, depth + 1, false));
            b[i] = '';
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < 9; i++) {
            if (b[i] !== '') continue;
            b[i] = 'X';
            best = Math.min(best, minimax(b, depth + 1, true));
            b[i] = '';
        }
        return best;
    }
}

// ==================== Sprawdzanie ====================
function checkWinner() {
    for (const [a, b, c] of WIN_CONDITIONS) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    if (board.every(v => v !== '')) return 'draw';
    return null;
}

function highlightWinner() {
    for (const [a, b, c] of WIN_CONDITIONS) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            cells[a].classList.add('winner');
            cells[b].classList.add('winner');
            cells[c].classList.add('winner');
            return;
        }
    }
}

// ==================== Zapis do Firebase ====================
function scheduleFirebaseSave() {
    // Małe opóźnienie żeby animacja zdążyła się pokazać
    setTimeout(saveGameResult, 600);
}

async function saveGameResult() {
    const stored = localStorage.getItem('currentUser');
    if (!stored) {
        showToast(t('resultNotSaved'), 'info');
        return;
    }

    const currentUser = JSON.parse(stored);
    if (!currentUser?.uid) return;

    try {
        const userRef  = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;

        const stats = { ...userSnap.data().stats };

        if (currentResult === 'win') {
            stats.tictactoeWins   = (stats.tictactoeWins   || 0) + 1;
            stats.tictactoePoints = (stats.tictactoePoints || 0) + 10;
        } else if (currentResult === 'loss') {
            stats.tictactoeLosses = (stats.tictactoeLosses || 0) + 1;
            stats.tictactoePoints = (stats.tictactoePoints || 0) + 2;
        } else if (currentResult === 'draw') {
            stats.tictactoeDraws  = (stats.tictactoeDraws  || 0) + 1;
            stats.tictactoePoints = (stats.tictactoePoints || 0) + 5;
        }

        await updateDoc(userRef, { stats });

        currentUser.stats = stats;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showToast(t('resultSaved'), 'success');

    } catch (err) {
        console.error('Błąd zapisu wyniku:', err);
    } finally {
        currentResult = null;
    }
}

// ==================== Reset ====================
function resetGame() {
    board         = Array(9).fill('');
    currentPlayer = 'X';
    gameActive    = true;
    botPending    = false;
    currentResult = null;

    cells.forEach(cell => {
        cell.textContent = '';
        cell.className   = 'cell';
        cell.style.animation = '';
    });

    updateGameInfo();
}

// ==================== Statystyki sesji ====================
function updateSessionStats() {
    const el = id => document.getElementById(id);
    if (el('xWins'))  el('xWins').textContent  = sessionStats.xWins;
    if (el('oWins'))  el('oWins').textContent  = sessionStats.oWins;
    if (el('draws'))  el('draws').textContent  = sessionStats.draws;
}

// ==================== Toast ====================
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
    // Wymuś reflow
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
    updateGameInfo();
}

// ==================== Init ====================
document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('currentUser');
    const navUsername = document.getElementById('username-nav');
    if (navUsername && user) {
        navUsername.textContent = JSON.parse(user).username;
    }

    // Ustaw data-mode i data-difficulty na przyciskach
    document.querySelectorAll('.mode-btn').forEach(btn => {
        if (btn.textContent.includes('2') || btn.getAttribute('data-i18n') === 'twoPlayers') {
            btn.dataset.mode = 'pvp';
        } else {
            btn.dataset.mode = 'bot';
        }
    });
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        const onclick = btn.getAttribute('onclick') || '';
        btn.dataset.difficulty = onclick.includes('easy')   ? 'easy'
                               : onclick.includes('normal') ? 'normal'
                               : 'hard';
    });

    updateGameInfo();
    updatePageTranslations();
});

window.setGameMode            = setGameMode;
window.setDifficulty          = setDifficulty;
window.resetGame              = resetGame;
window.updatePageTranslations = updatePageTranslations;
