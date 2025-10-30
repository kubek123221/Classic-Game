// statki.js - Pełna implementacja gry w statki

// Stałe gry
const BOARD_SIZE = 10;
const SHIPS = [
    { name: 'battleship', size: 4, count: 1, icon: '🚢' },
    { name: 'cruiser', size: 3, count: 2, icon: '⛴️' },
    { name: 'destroyer', size: 2, count: 3, icon: '🛥️' },
    { name: 'submarine', size: 1, count: 4, icon: '⛵' }
];

// Stan gry
let gameState = {
    mode: null, // 'bot' lub 'online'
    phase: 'mode-selection', // 'mode-selection', 'player-search', 'setup', 'battle', 'ended'
    playerBoard: [],
    enemyBoard: [],
    playerShips: [],
    enemyShips: [],
    playerTurn: true,
    opponent: null,
    stats: {
        playerHits: 0,
        playerMisses: 0,
        enemyHits: 0,
        enemyMisses: 0,
        gamesWon: 0
    },
    computerLastHit: null,
    computerTargets: [],
    computerHitDirection: null
};

// Inicjalizacja przy załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    updatePageTranslations();
});

// ==================== WYBÓR TRYBU GRY ====================

function selectMode(mode) {
    gameState.mode = mode;
    
    if (mode === 'bot') {
        // Rozpocznij grę z botem
        document.getElementById('gameModeSelection').style.display = 'none';
        document.getElementById('gamePanel').style.display = 'block';
        initGame();
    } else if (mode === 'online') {
        // Pokaż panel wyszukiwania gracza
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert(t('loginRequired') || 'Musisz być zalogowany, aby grać online!');
            return;
        }
        document.getElementById('gameModeSelection').style.display = 'none';
        document.getElementById('playerSearch').style.display = 'block';
    }
}

function backToModeSelection() {
    document.getElementById('playerSearch').style.display = 'none';
    document.getElementById('gamePanel').style.display = 'none';
    document.getElementById('gameModeSelection').style.display = 'block';
    gameState.mode = null;
}

// ==================== WYSZUKIWANIE GRACZY ====================

function searchPlayers() {
    const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();
    const searchResults = document.getElementById('searchResults');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (searchInput.length < 2) {
        searchResults.innerHTML = '';
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchInput) && 
        user.username !== currentUser.username
    );
    
    if (filteredUsers.length === 0) {
        searchResults.innerHTML = `<div class="no-results" data-i18n="noPlayersFound">Nie znaleziono graczy</div>`;
        return;
    }
    
    searchResults.innerHTML = '';
    filteredUsers.slice(0, 5).forEach(user => {
        const battleshipStats = user.stats?.battleship || { wins: 0, losses: 0 };
        const resultDiv = document.createElement('div');
        resultDiv.className = 'player-result';
        resultDiv.innerHTML = `
            <div>
                <div class="player-result-name">${user.username}</div>
                <div class="player-result-stats">Wygrane: ${battleshipStats.wins} | Przegrane: ${battleshipStats.losses}</div>
            </div>
            <button class="btn-select-player" onclick="selectPlayer('${user.username}')">Wybierz</button>
        `;
        searchResults.appendChild(resultDiv);
    });
}

function selectPlayer(username) {
    gameState.opponent = username;
    document.getElementById('playerSearch').style.display = 'none';
    document.getElementById('gamePanel').style.display = 'block';
    document.getElementById('opponentInfo').style.display = 'block';
    document.getElementById('opponentName').textContent = username;
    initGame();
}

// ==================== INICJALIZACJA GRY ====================

function initGame() {
    gameState.playerBoard = createEmptyBoard();
    gameState.enemyBoard = createEmptyBoard();
    gameState.playerShips = [];
    gameState.enemyShips = [];
    gameState.phase = 'setup';
    gameState.playerTurn = true;
    gameState.computerLastHit = null;
    gameState.computerTargets = [];
    gameState.computerHitDirection = null;
    
    renderBoard('playerBoard', gameState.playerBoard, true, false);
    renderBoard('enemyBoard', gameState.enemyBoard, false, false);
    
    updateStatusText(t('clickAutoSetup'));
    resetShipLives();
}

function createEmptyBoard() {
    const board = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        board[i] = [];
        for (let j = 0; j < BOARD_SIZE; j++) {
            board[i][j] = {
                ship: null,
                hit: false,
                miss: false
            };
        }
    }
    return board;
}

// ==================== RENDEROWANIE PLANSZY ====================

function renderBoard(elementId, board, isPlayer, canAttack) {
    const boardElement = document.getElementById(elementId);
    boardElement.innerHTML = '';
    
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            const cellData = board[i][j];
            
            // Wyświetl stan komórki
            if (cellData.hit && cellData.ship) {
                cell.classList.add('hit');
                cell.innerHTML = '<span class="hit-marker">✕</span>';
            } else if (cellData.miss) {
                cell.classList.add('miss');
                cell.innerHTML = '<span class="miss-marker">○</span>';
            } else if (cellData.ship && isPlayer) {
                cell.classList.add('ship');
            }
            
            // Dodaj event listener dla ataku
            if (canAttack && !cellData.hit && !cellData.miss) {
                cell.addEventListener('click', () => handleAttack(i, j));
                cell.classList.add('attackable');
            }
            
            boardElement.appendChild(cell);
        }
    }
}

// ==================== ROZMIESZCZANIE STATKÓW ====================

function autoSetupShips() {
    gameState.playerShips = [];
    gameState.playerBoard = createEmptyBoard();
    
    let allShipsPlaced = true;
    
    SHIPS.forEach(shipType => {
        for (let i = 0; i < shipType.count; i++) {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 100) {
                const row = Math.floor(Math.random() * BOARD_SIZE);
                const col = Math.floor(Math.random() * BOARD_SIZE);
                const horizontal = Math.random() > 0.5;
                
                if (canPlaceShip(gameState.playerBoard, row, col, shipType.size, horizontal)) {
                    const ship = placeShip(gameState.playerBoard, row, col, shipType.size, horizontal, shipType.name, shipType.icon);
                    ship.index = i; // Indeks dla wielu statków tego samego typu
                    gameState.playerShips.push(ship);
                    placed = true;
                }
                attempts++;
            }
            
            if (!placed) {
                allShipsPlaced = false;
            }
        }
    });
    
    if (!allShipsPlaced) {
        updateStatusText('Nie udało się rozmieścić wszystkich statków. Spróbuj ponownie.');
        return;
    }
    
    renderBoard('playerBoard', gameState.playerBoard, true, false);
    document.getElementById('startBtn').disabled = false;
    updateStatusText(t('shipsPlaced'));
}

function canPlaceShip(board, row, col, size, horizontal) {
    // Sprawdź czy statek mieści się na planszy
    if (horizontal) {
        if (col + size > BOARD_SIZE) return false;
    } else {
        if (row + size > BOARD_SIZE) return false;
    }
    
    // Sprawdź czy pola są wolne (wraz z otoczeniem)
    for (let i = 0; i < size; i++) {
        const r = horizontal ? row : row + i;
        const c = horizontal ? col + i : col;
        
        // Sprawdź pole i jego otoczenie
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const newRow = r + dr;
                const newCol = c + dc;
                if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                    if (board[newRow][newCol].ship) return false;
                }
            }
        }
    }
    
    return true;
}

function placeShip(board, row, col, size, horizontal, name, icon) {
    const ship = {
        name: name,
        size: size,
        hits: 0,
        positions: [],
        icon: icon,
        sunk: false
    };
    
    for (let i = 0; i < size; i++) {
        const r = horizontal ? row : row + i;
        const c = horizontal ? col + i : col;
        board[r][c].ship = ship;
        ship.positions.push({ row: r, col: c });
    }
    
    return ship;
}

// ==================== ROZPOCZĘCIE BITWY ====================

function startBattle() {
    if (gameState.playerShips.length === 0) {
        updateStatusText(t('placeShipsFirst'));
        return;
    }
    
    // Rozstaw statki wroga
    gameState.enemyShips = [];
    gameState.enemyBoard = createEmptyBoard();
    
    SHIPS.forEach(shipType => {
        for (let i = 0; i < shipType.count; i++) {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 100) {
                const row = Math.floor(Math.random() * BOARD_SIZE);
                const col = Math.floor(Math.random() * BOARD_SIZE);
                const horizontal = Math.random() > 0.5;
                
                if (canPlaceShip(gameState.enemyBoard, row, col, shipType.size, horizontal)) {
                    const ship = placeShip(gameState.enemyBoard, row, col, shipType.size, horizontal, shipType.name, shipType.icon);
                    ship.index = i;
                    gameState.enemyShips.push(ship);
                    placed = true;
                }
                attempts++;
            }
        }
    });
    
    gameState.phase = 'battle';
    document.getElementById('setupControls').style.display = 'none';
    document.getElementById('gameControls').style.display = 'flex';
    
    renderBoard('playerBoard', gameState.playerBoard, true, false);
    renderBoard('enemyBoard', gameState.enemyBoard, false, true);
    
    updateStatusText(t('yourTurn'));
    document.getElementById('gameStatusTitle').textContent = t('battleInProgress') || 'Bitwa trwa!';
}

// ==================== ATAK GRACZA ====================

function handleAttack(row, col) {
    if (!gameState.playerTurn || gameState.phase !== 'battle') return;
    
    const cell = gameState.enemyBoard[row][col];
    
    if (cell.hit || cell.miss) return;
    
    if (cell.ship) {
        // Trafienie!
        cell.hit = true;
        cell.ship.hits++;
        gameState.stats.playerHits++;
        
        updateShipLife('enemy', cell.ship);
        
        if (cell.ship.hits >= cell.ship.size) {
            // Statek zatopiony!
            cell.ship.sunk = true;
            markSunkShip(gameState.enemyBoard, cell.ship);
            updateStatusText(t('shipSunk'));
            
            setTimeout(() => {
                if (checkWin(gameState.enemyShips)) {
                    endGame(true);
                } else {
                    updateStatusText(t('yourTurn'));
                }
            }, 1500);
        } else {
            updateStatusText(t('hitSuccess'));
        }
        
        // Gracz trafia - może strzelać dalej
    } else {
        // Pudło
        cell.miss = true;
        gameState.stats.playerMisses++;
        updateStatusText(t('missedShot'));
        gameState.playerTurn = false;
        
        setTimeout(() => {
            if (gameState.mode === 'bot') {
                computerTurn();
            } else {
                // Tryb online - tu byłaby logika multiplayer
                updateStatusText(t('opponentTurn'));
            }
        }, 1000);
    }
    
    renderBoard('enemyBoard', gameState.enemyBoard, false, gameState.playerTurn);
    updateStats();
}

// ==================== TURA KOMPUTERA ====================

function computerTurn() {
    if (gameState.phase !== 'battle') return;
    
    updateStatusText(t('enemyTurn'));
    
    setTimeout(() => {
        let row, col;
        let validMove = false;
        
        // Inteligentny AI
        if (gameState.computerTargets.length > 0) {
            // Kontynuuj atak w okolicy trafienia
            const target = gameState.computerTargets.shift();
            row = target.row;
            col = target.col;
            validMove = true;
        } else if (gameState.computerLastHit) {
            // Znajdź cele wokół ostatniego trafienia
            const { row: lastRow, col: lastCol } = gameState.computerLastHit;
            const directions = [
                { row: -1, col: 0 },
                { row: 1, col: 0 },
                { row: 0, col: -1 },
                { row: 0, col: 1 }
            ];
            
            directions.forEach(dir => {
                const newRow = lastRow + dir.row;
                const newCol = lastCol + dir.col;
                if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                    const targetCell = gameState.playerBoard[newRow][newCol];
                    if (!targetCell.hit && !targetCell.miss) {
                        gameState.computerTargets.push({ row: newRow, col: newCol });
                    }
                }
            });
            
            if (gameState.computerTargets.length > 0) {
                const target = gameState.computerTargets.shift();
                row = target.row;
                col = target.col;
                validMove = true;
            }
        }
        
        // Jeśli brak celów - losowy strzał
        if (!validMove) {
            let attempts = 0;
            do {
                row = Math.floor(Math.random() * BOARD_SIZE);
                col = Math.floor(Math.random() * BOARD_SIZE);
                attempts++;
            } while ((gameState.playerBoard[row][col].hit || gameState.playerBoard[row][col].miss) && attempts < 100);
        }
        
        const cell = gameState.playerBoard[row][col];
        
        if (cell.ship) {
            // Trafienie!
            cell.hit = true;
            cell.ship.hits++;
            gameState.stats.enemyHits++;
            gameState.computerLastHit = { row, col };
            
            updateShipLife('player', cell.ship);
            
            if (cell.ship.hits >= cell.ship.size) {
                // Statek zatopiony!
                cell.ship.sunk = true;
                markSunkShip(gameState.playerBoard, cell.ship);
                gameState.computerLastHit = null;
                gameState.computerTargets = [];
                updateStatusText(t('enemySunkShip'));
                
                setTimeout(() => {
                    if (checkWin(gameState.playerShips)) {
                        endGame(false);
                    } else {
                        computerTurn();
                    }
                }, 1500);
            } else {
                updateStatusText(t('enemyHit'));
                setTimeout(() => computerTurn(), 1000);
            }
        } else {
            // Pudło
            cell.miss = true;
            gameState.stats.enemyMisses++;
            updateStatusText(t('enemyMissed'));
            gameState.playerTurn = true;
            
            setTimeout(() => {
                updateStatusText(t('yourTurn'));
            }, 1000);
        }
        
        renderBoard('playerBoard', gameState.playerBoard, true, false);
        renderBoard('enemyBoard', gameState.enemyBoard, false, gameState.playerTurn);
        updateStats();
    }, 1000);
}

// ==================== POMOCNICZE FUNKCJE ====================

function markSunkShip(board, ship) {
    ship.positions.forEach(pos => {
        const cell = board[pos.row][pos.col];
        // Oznacz pola wokół zatopionego statku jako pudła
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const newRow = pos.row + dr;
                const newCol = pos.col + dc;
                if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                    const surroundCell = board[newRow][newCol];
                    if (!surroundCell.ship && !surroundCell.miss) {
                        surroundCell.miss = true;
                    }
                }
            }
        }
    });
}

function checkWin(ships) {
    return ships.every(ship => ship.sunk);
}

function updateShipLife(player, ship) {
    const prefix = player === 'player' ? 'player' : 'enemy';
    const elementId = `${prefix}-ship-${ship.size}${ship.index !== undefined ? '-' + ship.index : ''}`;
    const element = document.getElementById(elementId);
    
    if (element) {
        const lives = element.querySelectorAll('.life');
        lives.forEach((life, index) => {
            if (index < ship.hits) {
                life.classList.remove('active');
                life.classList.add('lost');
            }
        });
    }
}

function resetShipLives() {
    document.querySelectorAll('.life').forEach(life => {
        life.classList.remove('lost');
        life.classList.add('active');
    });
}

function endGame(playerWon) {
    gameState.phase = 'ended';
    
    if (playerWon) {
        updateStatusText(t('youWon'));
        document.getElementById('gameStatusTitle').textContent = t('victory') || '🎉 ZWYCIĘSTWO! 🎉';
        gameState.stats.gamesWon++;
        saveGameResult(true);
    } else {
        updateStatusText(t('youLost'));
        document.getElementById('gameStatusTitle').textContent = t('defeat') || '💀 PORAŻKA! 💀';
        saveGameResult(false);
    }
    
    // Pokaż wszystkie statki wroga
    renderBoard('enemyBoard', gameState.enemyBoard, true, false);
    updateStats();
    saveStats();
}

function newGame() {
    gameState.stats.playerHits = 0;
    gameState.stats.playerMisses = 0;
    gameState.stats.enemyHits = 0;
    gameState.stats.enemyMisses = 0;
    
    document.getElementById('setupControls').style.display = 'flex';
    document.getElementById('gameControls').style.display = 'none';
    document.getElementById('startBtn').disabled = true;
    
    initGame();
}

// ==================== STATYSTYKI ====================

function updateStats() {
    document.getElementById('playerHits').textContent = gameState.stats.playerHits;
    document.getElementById('playerMisses').textContent = gameState.stats.playerMisses;
    document.getElementById('enemyHits').textContent = gameState.stats.enemyHits;
    document.getElementById('gamesWon').textContent = gameState.stats.gamesWon;
}

function loadStats() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.stats && currentUser.stats.battleship) {
        gameState.stats.gamesWon = currentUser.stats.battleship.wins || 0;
    }
    updateStats();
}

function saveStats() {
    // Statystyki są zapisywane w saveGameResult
}

function saveGameResult(won) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    
    if (userIndex === -1) return;

    if (!users[userIndex].stats) {
        users[userIndex].stats = {};
    }
    
    if (!users[userIndex].stats.battleship) {
        users[userIndex].stats.battleship = {
            wins: 0,
            losses: 0,
            points: 0
        };
    }

    if (won) {
        users[userIndex].stats.battleship.wins++;
        users[userIndex].stats.battleship.points += 20;
    } else {
        users[userIndex].stats.battleship.losses++;
        users[userIndex].stats.battleship.points += 5;
    }

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
}

// ==================== UI ====================

function updateStatusText(text) {
    document.getElementById('statusText').textContent = text;
}

function updatePageTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key);
    });
}