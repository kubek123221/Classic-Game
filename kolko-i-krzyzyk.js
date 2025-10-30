// Zmienne gry
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'pvp'; // 'pvp' lub 'bot'
let botDifficulty = 'easy'; // 'easy', 'normal', 'hard'
let stats = { xWins: 0, oWins: 0, draws: 0 };
let currentGameResult = null;

// Warunki wygranej
const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rzędy
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // kolumny
    [0, 4, 8], [2, 4, 6]              // przekątne
];

// Pobieranie elementów
const cells = document.querySelectorAll('.cell');
const gameInfo = document.querySelector('.game-info');
const difficultySelector = document.getElementById('difficultySelector');

// Dodawanie event listenerów do komórek
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

// Zmiana trybu gry
function setGameMode(mode) {
    gameMode = mode;
    
    const buttons = document.querySelectorAll('.mode-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if ((mode === 'pvp' && btn.getAttribute('data-i18n') === 'twoPlayers') ||
            (mode === 'bot' && btn.getAttribute('data-i18n') === 'vsBot')) {
            btn.classList.add('active');
        }
    });
    
    if (mode === 'bot') {
        difficultySelector.style.display = 'block';
    } else {
        difficultySelector.style.display = 'none';
    }
    
    resetGame();
    updateGameInfo();
}

// Zmiana poziomu trudności
function setDifficulty(difficulty) {
    botDifficulty = difficulty;
    
    const buttons = document.querySelectorAll('.difficulty-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        const btnDiff = btn.getAttribute('onclick').includes('easy') ? 'easy' :
                       btn.getAttribute('onclick').includes('normal') ? 'normal' : 'hard';
        if (btnDiff === difficulty) {
            btn.classList.add('active');
        }
    });
    
    resetGame();
    updateGameInfo();
}

// Aktualizacja informacji o grze
function updateGameInfo() {
    const gameInfoText = document.getElementById('gameInfoText');
    
    if (gameMode === 'bot') {
        const difficultyNames = {
            'easy': t('diffEasy'),
            'normal': t('diffNormal'),
            'hard': t('diffHard')
        };
        gameInfoText.textContent = `${t('youVsBot')} ${difficultyNames[botDifficulty]}`;
    } else {
        gameInfoText.textContent = t('playerXStarts');
    }
}

// Obsługa kliknięcia w komórkę
function handleCellClick(e) {
    const index = e.target.getAttribute('data-index');

    if (board[index] !== '' || !gameActive) {
        return;
    }

    makeMove(index, currentPlayer);

    if (!gameActive) {
        setTimeout(() => saveGameResult(), 500);
        return;
    }

    if (gameMode === 'bot' && currentPlayer === 'O' && gameActive) {
        gameActive = false;
        const gameInfoText = document.getElementById('gameInfoText');
        gameInfoText.textContent = t('botThinking');
        
        setTimeout(() => {
            if (gameActive === false) {
                botMove();
                if (gameActive === false && !checkWin() && !board.every(cell => cell !== '')) {
                    gameActive = true;
                }
                if (!gameActive && currentGameResult) {
                    setTimeout(() => saveGameResult(), 500);
                }
            }
        }, 700);
    }
}

// Wykonanie ruchu
function makeMove(index, player) {
    board[index] = player;
    const cell = cells[index];
    cell.textContent = player;
    cell.classList.add('taken', player.toLowerCase());

    cell.style.animation = 'none';
    setTimeout(() => {
        cell.style.animation = 'popIn 0.3s ease';
    }, 10);

    const gameInfoText = document.getElementById('gameInfoText');

    // Sprawdzenie wygranej
    if (checkWin()) {
        let winnerText;
        if (gameMode === 'bot') {
            winnerText = player === 'X' ? `🎉 ${t('youWin')} 🎉` : `🎉 ${t('botWins')} 🎉`;
        } else {
            winnerText = `🎉 ${t('playerWins')} ${player} ${t('wins2')} 🎉`;
        }
        
        gameInfoText.textContent = winnerText;
        gameActive = false;
        stats[player === 'X' ? 'xWins' : 'oWins']++;
        currentGameResult = player === 'X' ? 'win' : 'loss';
        updateStats();
        return;
    }

    // Sprawdzenie remisu
    if (board.every(cell => cell !== '')) {
        gameInfoText.textContent = t('draw');
        gameActive = false;
        stats.draws++;
        currentGameResult = 'draw';
        updateStats();
        return;
    }

    // Zmiana gracza
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    
    if (gameMode === 'bot') {
        if (currentPlayer === 'X') {
            gameInfoText.textContent = t('yourMove');
        }
    } else {
        gameInfoText.textContent = `${t('playerTurn')} ${currentPlayer}`;
    }
}

// ============= ALGORYTMY BOTA =============

function botMove() {
    let move = -1;
    
    switch(botDifficulty) {
        case 'easy':
            move = botMoveEasy();
            break;
        case 'normal':
            move = botMoveNormal();
            break;
        case 'hard':
            move = botMoveHard();
            break;
    }
    
    if (move !== -1) {
        makeMove(move, 'O');
    }
}

function botMoveEasy() {
    const availableCells = board.map((cell, index) => cell === '' ? index : null).filter(i => i !== null);
    if (availableCells.length > 0) {
        return availableCells[Math.floor(Math.random() * availableCells.length)];
    }
    return -1;
}

function botMoveNormal() {
    if (Math.random() < 0.5) {
        return botMoveHard();
    } else {
        return botMoveEasy();
    }
}

function botMoveHard() {
    let bestScore = -Infinity;
    let bestMove = -1;
    
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    
    return bestMove;
}

function minimax(board, depth, isMaximizing) {
    let result = checkWinner();
    if (result !== null) {
        if (result === 'O') return 10 - depth;
        if (result === 'X') return depth - 10;
        if (result === 'draw') return 0;
    }
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinner() {
    for (let condition of winConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    
    if (board.every(cell => cell !== '')) {
        return 'draw';
    }
    
    return null;
}

function checkWin() {
    for (let condition of winConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            cells[a].classList.add('winner');
            cells[b].classList.add('winner');
            cells[c].classList.add('winner');
            return true;
        }
    }
    return false;
}

// Zapisywanie wyniku gry
function saveGameResult() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    
    if (userIndex === -1) return;

    if (!users[userIndex].stats) {
        users[userIndex].stats = {
            tictactoeWins: 0,
            tictactoePoints: 0,
            tictactoeLosses: 0,
            tictactoeDraws: 0
        };
    }

    if (currentGameResult === 'win') {
        users[userIndex].stats.tictactoeWins++;
        users[userIndex].stats.tictactoePoints += 10;
    } else if (currentGameResult === 'loss') {
        users[userIndex].stats.tictactoeLosses++;
        users[userIndex].stats.tictactoePoints += 2;
    } else if (currentGameResult === 'draw') {
        users[userIndex].stats.tictactoeDraws++;
        users[userIndex].stats.tictactoePoints += 5;
    }

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
    
    currentGameResult = null;
}

// Reset gry
function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    currentGameResult = null;
    
    updateGameInfo();
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken', 'x', 'o', 'winner');
        cell.style.animation = '';
    });
}

// Aktualizacja statystyk
function updateStats() {
    document.getElementById('xWins').textContent = stats.xWins;
    document.getElementById('oWins').textContent = stats.oWins;
    document.getElementById('draws').textContent = stats.draws;
}

// Aktualizacja tłumaczeń
function updatePageTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });
    
    updateGameInfo();
}

// Inicjalizacja
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.stats) {
        console.log('Zalogowany jako:', currentUser.username);
        console.log('Punkty:', currentUser.stats.tictactoePoints);
    }
    updateGameInfo();
    updatePageTranslations();
});