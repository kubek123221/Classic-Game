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
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const messageEl = document.getElementById('loginMessage');
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        messageEl.textContent = t('loginSuccess');
        messageEl.style.color = '#00ff88';
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        messageEl.textContent = t('loginError');
        messageEl.style.color = '#ff4444';
    }
});

// Obsługa rejestracji
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const messageEl = document.getElementById('registerMessage');
    
    if (username.length < 3) {
        messageEl.textContent = t('usernameTooShort');
        messageEl.style.color = '#ff4444';
        return;
    }
    
    if (password.length < 4) {
        messageEl.textContent = t('passwordTooShort');
        messageEl.style.color = '#ff4444';
        return;
    }
    
    if (password !== passwordConfirm) {
        messageEl.textContent = t('passwordMismatch');
        messageEl.style.color = '#ff4444';
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.some(u => u.username === username)) {
        messageEl.textContent = t('usernameTaken');
        messageEl.style.color = '#ff4444';
        return;
    }
    
    const newUser = {
        username: username,
        password: password,
        stats: {
            tictactoeWins: 0,
            tictactoePoints: 0,
            tictactoeLosses: 0,
            tictactoeDraws: 0
        },
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    messageEl.textContent = t('registerSuccess');
    messageEl.style.color = '#00ff88';
    
    document.getElementById('registerForm').reset();
    
    setTimeout(() => {
        showTab('login');
    }, 2000);
});

// Aktualizacja tłumaczeń
function updatePageTranslations() {
    // Aktualizuj teksty
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });
    
    // Aktualizuj placeholdery
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key);
    });
}

// Inicjalizacja
document.addEventListener('DOMContentLoaded', () => {
    updatePageTranslations();
});