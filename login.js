// login.js
import {
    auth, db,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    doc, setDoc, getDoc,
    DEFAULT_STATS,
    serverTimestamp
} from './firebase-config.js';

// ==================== Rate limiting logowania ====================
const loginAttempts = { count: 0, lastAttempt: 0, lockedUntil: 0 };
const MAX_ATTEMPTS  = 5;
const LOCK_DURATION = 60_000; // 60 s

function checkRateLimit() {
    const now = Date.now();
    if (now < loginAttempts.lockedUntil) {
        const remaining = Math.ceil((loginAttempts.lockedUntil - now) / 1000);
        return { blocked: true, remaining };
    }
    // Resetuj licznik po 5 minutach bez prób
    if (now - loginAttempts.lastAttempt > 300_000) {
        loginAttempts.count = 0;
    }
    return { blocked: false };
}

function recordFailedAttempt() {
    loginAttempts.count++;
    loginAttempts.lastAttempt = Date.now();
    if (loginAttempts.count >= MAX_ATTEMPTS) {
        loginAttempts.lockedUntil = Date.now() + LOCK_DURATION;
        loginAttempts.count = 0;
    }
}

// ==================== Walidacja ====================
function validateUsername(username) {
    if (username.length < 3)          return t('usernameTooShort');
    if (!/^[\w\pL]+$/u.test(username)) return t('usernameInvalidChars');
    return null;
}

// ==================== Helpers UI ====================
function setMessage(elementId, text, ok) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = text;
    el.style.color = ok ? '#00ff88' : '#ff4444';
}

function setLoading(btn, loading) {
    btn.disabled = loading;
    btn.style.opacity = loading ? '0.7' : '1';
    btn.textContent = loading
        ? (btn.dataset.loadingText || '...')
        : (btn.dataset.originalText || btn.textContent);
}

// ==================== Przełączanie zakładek ====================
function showTab(tab) {
    const isLogin = tab === 'login';
    document.getElementById('loginForm').classList.toggle('active', isLogin);
    document.getElementById('registerForm').classList.toggle('active', !isLogin);

    document.querySelectorAll('.tab').forEach((t, i) => {
        t.classList.toggle('active', isLogin ? i === 0 : i === 1);
    });

    // Czyść komunikaty
    setMessage('loginMessage', '');
    setMessage('registerMessage', '');
}

// ==================== Logowanie ====================
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const rate = checkRateLimit();
    if (rate.blocked) {
        setMessage('loginMessage', `${t('loginTooManyAttempts')} (${rate.remaining}s)`, false);
        return;
    }

    const email    = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn      = e.target.querySelector('.submit-btn');

    btn.dataset.originalText = t('loginBtn');
    btn.dataset.loadingText  = '⏳';
    setLoading(btn, true);
    setMessage('loginMessage', '');

    try {
        const cred     = await signInWithEmailAndPassword(auth, email, password);
        const userSnap = await getDoc(doc(db, "users", cred.user.uid));

        if (!userSnap.exists()) throw new Error('user-doc-missing');

        const data = userSnap.data();
        localStorage.setItem('currentUser', JSON.stringify({
            uid:      cred.user.uid,
            email:    cred.user.email,
            username: data.username,
            stats:    data.stats || DEFAULT_STATS
        }));

        setMessage('loginMessage', t('loginSuccess'), true);
        loginAttempts.count = 0;

        setTimeout(() => { window.location.href = 'index.html'; }, 1000);

    } catch (err) {
        recordFailedAttempt();
        console.error('Login error:', err.code || err.message);

        const msg = {
            'auth/wrong-password':    t('loginError'),
            'auth/user-not-found':    t('loginError'),
            'auth/invalid-credential':t('loginError'),
            'auth/invalid-email':     t('invalidEmail'),
            'auth/too-many-requests': t('loginTooManyAttempts'),
        }[err.code] ?? t('loginError');

        setMessage('loginMessage', msg, false);
        setLoading(btn, false);
    }
});

// ==================== Rejestracja ====================
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username        = document.getElementById('registerUsername').value.trim();
    const email           = document.getElementById('registerEmail').value.trim();
    const password        = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const btn             = e.target.querySelector('.submit-btn');

    // Walidacja front-end
    const usernameError = validateUsername(username);
    if (usernameError) { setMessage('registerMessage', usernameError, false); return; }

    if (password.length < 6) {
        setMessage('registerMessage', t('passwordTooShort'), false);
        return;
    }

    if (password !== passwordConfirm) {
        setMessage('registerMessage', t('passwordMismatch'), false);
        return;
    }

    btn.dataset.originalText = t('registerBtn');
    btn.dataset.loadingText  = '⏳';
    setLoading(btn, true);
    setMessage('registerMessage', '');

    try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);

        await setDoc(doc(db, "users", cred.user.uid), {
            username,
            email,
            stats:     DEFAULT_STATS,
            createdAt: serverTimestamp()
        });

        setMessage('registerMessage', t('registerSuccess'), true);
        e.target.reset();
        setTimeout(() => showTab('login'), 1800);

    } catch (err) {
        console.error('Register error:', err.code || err.message);

        const msg = {
            'auth/email-already-in-use': t('emailAlreadyUsed'),
            'auth/invalid-email':        t('invalidEmail'),
            'auth/weak-password':        t('weakPassword'),
        }[err.code] ?? `Błąd: ${err.message}`;

        setMessage('registerMessage', msg, false);
        setLoading(btn, false);
    }
});

// ==================== Tłumaczenia ====================
function updatePageTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
}

document.addEventListener('DOMContentLoaded', updatePageTranslations);

window.showTab               = showTab;
window.updatePageTranslations = updatePageTranslations;
