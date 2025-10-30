// Sprawdzanie czy użytkownik jest zalogowany
function checkLogin() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    if (user) {
        document.getElementById('username').textContent = user.username;
        document.getElementById('loginBtn').textContent = t('logout');
        document.getElementById('loginBtn').onclick = logout;
        
        // Wczytaj statystyki użytkownika
        loadUserStats(user);
    }
}

// Wylogowanie
function logout() {
    localStorage.removeItem('currentUser');
    window.location.reload();
}

// Wczytywanie statystyk użytkownika
function loadUserStats(user) {
    const stats = user.stats || { 
        tictactoeWins: 0, 
        tictactoePoints: 0,
        battleship: { wins: 0, points: 0 }
    };
    
    // Kółko i krzyżyk
    document.getElementById('tictactoe-wins').textContent = stats.tictactoeWins || 0;
    document.getElementById('tictactoe-points').textContent = stats.tictactoePoints || 0;
    
    // Statki
    const battleshipStats = stats.battleship || { wins: 0, points: 0 };
    document.getElementById('battleship-wins').textContent = battleshipStats.wins || 0;
    document.getElementById('battleship-points').textContent = battleshipStats.points || 0;
}

// Wczytywanie rankingu
function loadLeaderboard() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Sortowanie po łącznej liczbie punktów
    users.sort((a, b) => {
        const aPoints = (a.stats?.tictactoePoints || 0) + (a.stats?.battleship?.points || 0);
        const bPoints = (b.stats?.tictactoePoints || 0) + (b.stats?.battleship?.points || 0);
        return bPoints - aPoints;
    });
    
    const leaderboardDiv = document.getElementById('leaderboard');
    leaderboardDiv.innerHTML = '';
    
    users.slice(0, 10).forEach((user, index) => {
        const tictactoePoints = user.stats?.tictactoePoints || 0;
        const battleshipPoints = user.stats?.battleship?.points || 0;
        const totalPoints = tictactoePoints + battleshipPoints;
        
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        item.innerHTML = `
            <span class="rank">${index + 1}</span>
            <span class="player-name">${user.username}</span>
            <span class="player-points">${totalPoints} <span data-i18n="points">${t('points')}</span></span>
        `;
        leaderboardDiv.appendChild(item);
    });
    
    if (users.length === 0) {
        leaderboardDiv.innerHTML = `<p style="text-align: center; color: #666;" data-i18n="noPlayers">${t('noPlayers')}</p>`;
    }
}

// Aktualizacja tłumaczeń na stronie
function updatePageTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });
    
    // Specjalne przypadki
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        document.getElementById('username').textContent = user.username;
        document.getElementById('loginBtn').textContent = t('logout');
    } else {
        document.getElementById('username').textContent = t('guest');
        document.getElementById('loginBtn').textContent = t('login');
    }
    
    // Odśwież ranking
    loadLeaderboard();
}

// Inicjalizacja przy załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    checkLogin();
    loadLeaderboard();
    updatePageTranslations();
});