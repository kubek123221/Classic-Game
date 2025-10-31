// login.js - Firebase version
import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, doc, setDoc, getDoc } from './firebase-config.js';

// Przełączanie między zakładkami
function showTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.tab');

    tabs.forEach(t => t.classList.remove('active'));

    if (tab === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        tabs[0].classList.add('active');
    } else {
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        tabs[1].classList.add('active');
    }
}

// Obsługa logowania
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const messageEl = document.getElementById('loginMessage');

    try {
        // Logowanie przez Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Pobierz dane użytkownika z Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            localStorage.setItem('currentUser', JSON.stringify({
                uid: user.uid,
                email: user.email,
                username: userData.username,
                stats: userData.stats || {
                    tictactoeWins: 0,
                    tictactoePoints: 0,
                    tictactoeLosses: 0,
                    tictactoeDraws: 0,
                    battleship: { 
                        wins: 0, 
                        losses: 0,
                        points: 0 
                    }
                }
            }));

            messageEl.textContent = t('loginSuccess');
            messageEl.style.color = '#00ff88';
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    } catch (error) {
        console.error('Login error:', error);
        if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            messageEl.textContent = t('loginError');
        } else if (error.code === 'auth/invalid-email') {
            messageEl.textContent = 'Nieprawidłowy format email!';
        } else if (error.code === 'auth/invalid-credential') {
            messageEl.textContent = 'Nieprawidłowy email lub hasło!';
        } else {
            messageEl.textContent = 'Błąd logowania: ' + error.message;
        }
        messageEl.style.color = '#ff4444';
    }
});

// Obsługa rejestracji
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const messageEl = document.getElementById('registerMessage');

    if (username.length < 3) {
        messageEl.textContent = t('usernameTooShort');
        messageEl.style.color = '#ff4444';
        return;
    }

    if (password.length < 6) {
        messageEl.textContent = 'Hasło musi mieć min. 6 znaków!';
        messageEl.style.color = '#ff4444';
        return;
    }

    if (password !== passwordConfirm) {
        messageEl.textContent = t('passwordMismatch');
        messageEl.style.color = '#ff4444';
        return;
    }

    try {
        // Rejestracja przez Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Zapisz dodatkowe dane w Firestore
        await setDoc(doc(db, "users", user.uid), {
            username: username,
            email: email,
            stats: {
                tictactoeWins: 0,
                tictactoePoints: 0,
                tictactoeLosses: 0,
                tictactoeDraws: 0,
                battleship: {
                    wins: 0,
                    losses: 0,
                    points: 0
                }
            },
            createdAt: new Date().toISOString()
        });

        messageEl.textContent = t('registerSuccess');
        messageEl.style.color = '#00ff88';

        document.getElementById('registerForm').reset();

        setTimeout(() => {
            showTab('login');
        }, 2000);
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 'auth/email-already-in-use') {
            messageEl.textContent = 'Ten email jest już zarejestrowany!';
        } else if (error.code === 'auth/invalid-email') {
            messageEl.textContent = 'Nieprawidłowy format email!';
        } else if (error.code === 'auth/weak-password') {
            messageEl.textContent = 'Hasło jest za słabe!';
        } else {
            messageEl.textContent = 'Błąd rejestracji: ' + error.message;
        }
        messageEl.style.color = '#ff4444';
    }
});

// Aktualizacja tłumaczeń
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

// Inicjalizacja
document.addEventListener('DOMContentLoaded', () => {
    updatePageTranslations();
});

// Export funkcji
window.showTab = showTab;
