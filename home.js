// home.js
import { auth, db, signOut, onAuthStateChanged, collection, getDocs, doc, getDoc } from './firebase-config.js';

function safeT(key) {
    return typeof t === 'function' ? t(key) : key;
}

onAuthStateChanged(auth, async (user) => {
    const usernameEl = document.getElementById('username');
    const loginBtn = document.getElementById('loginBtn');

    if (user) {
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const currentUser = {
                    uid: user.uid,
                    email: user.email,
                    username: userData.username,
                    stats: userData.stats || {}
                };
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                if (usernameEl) usernameEl.textContent = userData.username;
                if (loginBtn) {
                    loginBtn.textContent = safeT('logout');
                    loginBtn.onclick = logout;
                }
                loadUserStats(currentUser);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    } else {
        localStorage.removeItem('currentUser');
        if (usernameEl) usernameEl.textContent = safeT('guest');
        if (loginBtn) {
            loginBtn.textContent = safeT('login');
            loginBtn.onclick = () => window.location.href = 'login.html';
        }
        resetStats();
    }
});

async function logout() {
    try {
        await signOut(auth);
        localStorage.removeItem('currentUser');
        window.location.reload();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

function resetStats() {
    const ids = ['tictactoe-wins', 'tictactoe-points', 'battleship-wins', 'battleship-points'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '0';
    });
}

function loadUserStats(user) {
    const stats = user.stats || {};
    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val || 0;
    };
    set('tictactoe-wins', stats.tictactoeWins);
    set('tictactoe-points', stats.tictactoePoints);
    set('battleship-wins', stats.battleship?.wins);
    set('battleship-points', stats.battleship?.points);
}

async function loadLeaderboard() {
    const leaderboardDiv = document.getElementById('leaderboard');
    if (!leaderboardDiv) return;
    leaderboardDiv.innerHTML = '<p class="loading-text">⏳ Ładowanie rankingu...</p>';

    try {
        const snapshot = await getDocs(collection(db, "users"));
        const users = [];

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const tPoints = data.stats?.tictactoePoints || 0;
            const bPoints = data.stats?.battleship?.points || 0;
            users.push({
                username: data.username,
                totalPoints: tPoints + bPoints,
                tictactoeWins: data.stats?.tictactoeWins || 0,
                battleshipWins: data.stats?.battleship?.wins || 0
            });
        });

        users.sort((a, b) => b.totalPoints - a.totalPoints);
        leaderboardDiv.innerHTML = '';

        if (users.length === 0) {
            leaderboardDiv.innerHTML = `<p class="empty-text">${safeT('noPlayers')}</p>`;
            return;
        }

        users.slice(0, 10).forEach((user, index) => {
            const medals = ['🥇', '🥈', '🥉'];
            const medal = medals[index] || `${index + 1}`;
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.style.animationDelay = `${index * 0.05}s`;
            item.innerHTML = `
                <span class="rank">${medal}</span>
                <span class="player-name">${user.username}</span>
                <div class="player-meta">
                    <span class="game-wins">⭕ ${user.tictactoeWins} | 🚢 ${user.battleshipWins}</span>
                    <span class="player-points">${user.totalPoints} ${safeT('points')}</span>
                </div>
            `;
            leaderboardDiv.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        leaderboardDiv.innerHTML = '<p class="error-text">❌ Błąd ładowania rankingu</p>';
    }
}

function updatePageTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = safeT(key);
    });
    loadLeaderboard();
}

window.updatePageTranslations = updatePageTranslations;

document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
});
