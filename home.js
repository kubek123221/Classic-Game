// home.js
import {
    auth, db,
    signOut,
    onAuthStateChanged,
    collection, getDocs,
    doc, getDoc
} from './firebase-config.js';

// ==================== Pomocnik DOM ====================
function el(id) { return document.getElementById(id); }

function safeSetText(id, value) {
    const node = el(id);
    if (node) node.textContent = value;
}

// ==================== Auth ====================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const snap = await getDoc(doc(db, "users", user.uid));
            if (snap.exists()) {
                const data = snap.data();
                const currentUser = {
                    uid:      user.uid,
                    email:    user.email,
                    username: data.username,
                    stats:    data.stats
                };
                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                safeSetText('username', data.username);

                const loginBtn = el('loginBtn');
                if (loginBtn) {
                    loginBtn.textContent = t('logout');
                    loginBtn.onclick = logout;
                }

                loadUserStats(currentUser);
            }
        } catch (err) {
            console.error('Błąd pobierania danych użytkownika:', err);
        }
    } else {
        localStorage.removeItem('currentUser');
        safeSetText('username', t('guest'));

        const loginBtn = el('loginBtn');
        if (loginBtn) {
            loginBtn.textContent = t('login');
            loginBtn.onclick = () => { window.location.href = 'login.html'; };
        }

        resetStats();
    }
});

function resetStats() {
    ['tictactoe-wins', 'tictactoe-points', 'battleship-wins', 'battleship-points']
        .forEach(id => safeSetText(id, 0));
}

async function logout() {
    try {
        await signOut(auth);
        localStorage.removeItem('currentUser');
        window.location.reload();
    } catch (err) {
        console.error('Błąd wylogowania:', err);
    }
}

// ==================== Statystyki ====================
function loadUserStats(user) {
    const stats = user.stats || {};

    safeSetText('tictactoe-wins',   stats.tictactoeWins   || 0);
    safeSetText('tictactoe-points', stats.tictactoePoints || 0);

    const bs = stats.battleship || {};
    safeSetText('battleship-wins',   bs.wins   || 0);
    safeSetText('battleship-points', bs.points || 0);
}

// ==================== Ranking ====================
async function loadLeaderboard() {
    const container = el('leaderboard');
    if (!container) return;

    container.innerHTML = `<p class="leaderboard-loading">${t('loadingLeaderboard') || 'Ładowanie...'}</p>`;

    try {
        const snap  = await getDocs(collection(db, "users"));
        const users = [];

        snap.forEach(docSnap => {
            const d     = docSnap.data();
            const total = (d.stats?.tictactoePoints || 0) + (d.stats?.battleship?.points || 0);
            users.push({ username: d.username, totalPoints: total });
        });

        users.sort((a, b) => b.totalPoints - a.totalPoints);
        container.innerHTML = '';

        if (users.length === 0) {
            container.innerHTML = `<p class="leaderboard-empty">${t('noPlayers')}</p>`;
            return;
        }

        users.slice(0, 10).forEach((u, i) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            // Klasa medalu dla top 3
            if (i < 3) item.classList.add(`rank-${i + 1}`);
            item.innerHTML = `
                <span class="rank">${i + 1}</span>
                <span class="player-name">${escapeHTML(u.username)}</span>
                <span class="player-points">${u.totalPoints} ${t('points')}</span>
            `;
            container.appendChild(item);
        });

    } catch (err) {
        console.error('Błąd rankingu:', err);
        container.innerHTML = '<p class="leaderboard-error">⚠️ Błąd ładowania rankingu</p>';
    }
}

// Sanityzacja — zapobiegamy XSS w nazwie użytkownika
function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ==================== Tłumaczenia ====================
function updatePageTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.getAttribute('data-i18n'));
    });

    // Odśwież tekst przycisku logowania
    const loginBtn    = document.getElementById('loginBtn');
    const currentUser = localStorage.getItem('currentUser');
    if (loginBtn) {
        loginBtn.textContent = currentUser ? t('logout') : t('login');
    }

    loadLeaderboard();
}

// ==================== Init ====================
document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
    updatePageTranslations();
});

window.updatePageTranslations = updatePageTranslations;

