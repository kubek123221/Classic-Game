// home.js - Firebase version
import { auth, db, signOut, onAuthStateChanged, collection, getDocs, doc, getDoc } from './firebase-config.js';

// Sprawdzanie czy użytkownik jest zalogowany
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            // Pobierz dane użytkownika z Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const currentUser = {
                    uid: user.uid,
                    email: user.email,
                    username: userData.username,
                    stats: userData.stats
                };
                
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                document.getElementById('username').textContent = userData.username;
                document.getElementById('loginBtn').textContent = t('logout');
                document.getElementById('loginBtn').onclick = logout;
                
                loadUserStats(currentUser);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    } else {
        localStorage.removeItem('currentUser');
        document.getElementById('username').textContent = t('guest');
        document.getElementById('loginBtn').textContent = t('login');
        document.getElementById('loginBtn').onclick = () => window.location.href = 'login.html';
        
        // Reset statystyk
        document.getElementById('tictactoe-wins').textContent = 0;
        document.getElementById('tictactoe-points').textContent = 0;
        document.getElementById('battleship-wins').textContent = 0;
        document.getElementById('battleship-points').textContent = 0;
    }
});

// Wylogowanie
async function logout() {
    try {
        await signOut(auth);
        localStorage.removeItem('currentUser');
        window.location.reload();
    } catch (error) {
        console.error('Logout error:', error);
    }
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

// Wczytywanie rankingu z Firebase
async function loadLeaderboard() {
    const leaderboardDiv = document.getElementById('leaderboard');
    leaderboardDiv.innerHTML = '<p style="text-align: center; color: #aaa;">Ładowanie rankingu...</p>';

    try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const users = [];

        usersSnapshot.forEach((doc) => {
            const data = doc.data();
            const tictactoePoints = data.stats?.tictactoePoints || 0;
            const battleshipPoints = data.stats?.battleship?.points || 0;
            const totalPoints = tictactoePoints + battleshipPoints;
            
            users.push({
                username: data.username,
                totalPoints: totalPoints
            });
        });

        // Sortowanie po łącznej liczbie punktów
        users.sort((a, b) => b.totalPoints - a.totalPoints);

        leaderboardDiv.innerHTML = '';

        users.slice(0, 10).forEach((user, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <span class="rank">${index + 1}</span>
                <span class="player-name">${user.username}</span>
                <span class="player-points">${user.totalPoints} <span data-i18n="points">${t('points')}</span></span>
            `;
            leaderboardDiv.appendChild(item);
        });

        if (users.length === 0) {
            leaderboardDiv.innerHTML = `<p style="text-align: center; color: #666;" data-i18n="noPlayers">${t('noPlayers')}</p>`;
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        leaderboardDiv.innerHTML = '<p style="text-align: center; color: #ff4444;">Błąd ładowania rankingu</p>';
    }
}

// Aktualizacja tłumaczeń na stronie
function updatePageTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });

    // Odśwież ranking
    loadLeaderboard();
}

// Inicjalizacja przy załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
    updatePageTranslations();
});
