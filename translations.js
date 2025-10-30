// translations.js - System tłumaczeń dla wszystkich języków

const translations = {
    // ==================== POLSKI ====================
    pl: {
        // Navbar
        logo: '🎮 Klasyczne Gry',
        guest: 'Gość',
        login: 'Zaloguj się',
        logout: 'Wyloguj',
        
        // Strona główna
        heroTitle: 'Witaj w świecie klasycznych gier!',
        heroSubtitle: 'Zagraj w legendarne gry, zdobywaj punkty i rywalizuj z przyjaciółmi',
        
        // Karty gier
        available: 'Dostępne',
        comingSoon: 'Wkrótce',
        playNow: 'Zagraj teraz →',
        soonText: 'Już niedługo!',
        wins: 'wygranych',
        points: 'pkt',
        
        // Nazwy gier
        tictactoe: 'Kółko i Krzyżyk',
        tictactoeDesc: 'Klasyczna gra strategiczna. Ułóż trzy symbole w rzędzie i wygraj!',
        hangman: 'Wisielec',
        hangmanDesc: 'Odgadnij hasło zanim skończą się próby. Sprawdź swoją wiedzę!',
        battleship: 'Statki',
        battleshipDesc: 'Strategiczna bitwa morska. Zatop flotę przeciwnika!',
        
        // Ranking
        leaderboard: '🏆 Ranking Graczy',
        noPlayers: 'Brak graczy w rankingu',
        
        // Footer
        footer: '© 2025 Klasyczne Gry | Stworzone z ❤️ dla miłośników retro gier',
        
        // Login
        welcome: '🎮 Witaj!',
        loginSubtitle: 'Zaloguj się lub utwórz nowe konto',
        loginTab: 'Logowanie',
        registerTab: 'Rejestracja',
        username: 'Nazwa użytkownika',
        password: 'Hasło',
        confirmPassword: 'Powtórz hasło',
        loginBtn: 'Zaloguj się',
        registerBtn: 'Zarejestruj się',
        backToHome: '← Powrót',
        
        // Placeholder
        enterUsername: 'Wpisz swoją nazwę',
        enterPassword: 'Wpisz hasło',
        chooseUsername: 'Wybierz nazwę użytkownika',
        choosePassword: 'Wybierz hasło (min. 4 znaki)',
        repeatPassword: 'Powtórz hasło',
        
        // Komunikaty logowania
        loginSuccess: 'Logowanie udane! Przekierowanie...',
        loginError: 'Błędna nazwa użytkownika lub hasło!',
        registerSuccess: 'Rejestracja udana! Możesz się zalogować.',
        usernameTooShort: 'Nazwa użytkownika musi mieć min. 3 znaki!',
        passwordTooShort: 'Hasło musi mieć min. 4 znaki!',
        passwordMismatch: 'Hasła nie są identyczne!',
        usernameTaken: 'Ta nazwa użytkownika jest już zajęta!',
        
        // Kółko i Krzyżyk
        tictactoeTitle: '⭕ Kółko i Krzyżyk ❌',
        tictactoeSubtitle: 'Klasyczna gra dla dwóch graczy',
        backToMenu: '← Powrót do menu',
        twoPlayers: '👥 2 Graczy',
        vsBot: '🤖 Gra z Botem',
        selectDifficulty: 'Wybierz poziom trudności:',
        easy: '😊 Łatwy',
        normal: '😐 Normalny',
        hard: '😈 Trudny',
        playerXStarts: 'Gracz X zaczyna!',
        playerTurn: 'Ruch gracza',
        yourMove: 'Twój ruch (X)',
        botThinking: '🤔 Bot myśli...',
        youVsBot: 'Ty (X) vs Bot (O) - Poziom:',
        newGame: 'Nowa Gra',
        winsX: 'Wygrane X',
        draws: 'Remisy',
        winsO: 'Wygrane O',
        playerWins: 'Gracz',
        wins2: 'wygrywa!',
        youWin: 'Wygrałeś!',
        botWins: 'Bot wygrywa!',
        draw: '🤝 Remis! 🤝',
        
        // Poziomy trudności
        diffEasy: 'Łatwy',
        diffNormal: 'Normalny',
        diffHard: 'Trudny',
        
        // Statki
        battleshipTitle: '🚢 Statki 🎯',
        battleshipSubtitle: 'Zatop flotę przeciwnika!',
        yourFleet: '🚢 Twoja flota',
        enemyFleet: '💀 Flota wroga',
        cruiser: 'Krążownik',
        destroyer: 'Niszczyciel',
        submarine: 'Łódź',
        setupPhase: 'Rozmieść swoje statki!',
        clickAutoSetup: 'Kliknij "Rozstaw automatycznie" lub ustaw ręcznie',
        autoSetup: '🎲 Rozstaw automatycznie',
        rotate: '🔄 Obróć statek',
        startBattle: '⚔️ Rozpocznij bitwę!',
        yourBoard: 'Twoja plansza',
        enemyBoard: 'Plansza wroga',
        ship: 'Statek',
        hit: 'Trafiony',
        miss: 'Pudło',
        sunk: 'Zatopiony',
        yourHits: 'Twoje trafienia',
        yourMisses: 'Twoje pudła',
        enemyHits: 'Trafienia wroga',
        gamesWon: 'Wygrane gry',
        shipsPlaced: 'Statki ustawione! Kliknij "Rozpocznij bitwę"',
        placeShipsFirst: 'Najpierw rozstaw statki!',
        yourTurn: 'Twoja tura - kliknij na planszę wroga!',
        enemyTurn: 'Tura przeciwnika...',
        hitSuccess: '💥 Trafiony! Strzelaj dalej!',
        missedShot: '💦 Pudło! Kolej przeciwnika',
        shipSunk: '🔥 Zatopiony! Kontynuuj atak!',
        enemyHit: '💥 Przeciwnik trafił twój statek!',
        enemyMissed: '💦 Przeciwnik spudłował!',
        enemySunkShip: '💀 Przeciwnik zatopił twój statek!',
        youWon: '🎉 ZWYCIĘSTWO! Zatopiłeś całą flotę wroga! 🎉',
        youLost: '💀 PORAŻKA! Twoja flota została zatopiona! 💀',
        horizontal: 'Poziomo',
        vertical: 'Pionowo'
    },
    
    // ==================== ANGIELSKI ====================
    en: {
        // Navbar
        logo: '🎮 Classic Games',
        guest: 'Guest',
        login: 'Log In',
        logout: 'Log Out',
        
        // Home page
        heroTitle: 'Welcome to the world of classic games!',
        heroSubtitle: 'Play legendary games, earn points and compete with friends',
        
        // Game cards
        available: 'Available',
        comingSoon: 'Coming Soon',
        playNow: 'Play now →',
        soonText: 'Coming soon!',
        wins: 'wins',
        points: 'pts',
        
        // Game names
        tictactoe: 'Tic Tac Toe',
        tictactoeDesc: 'Classic strategy game. Align three symbols in a row and win!',
        hangman: 'Hangman',
        hangmanDesc: 'Guess the word before you run out of tries. Test your knowledge!',
        battleship: 'Battleship',
        battleshipDesc: 'Strategic naval battle. Sink the enemy fleet!',
        
        // Leaderboard
        leaderboard: '🏆 Player Rankings',
        noPlayers: 'No players in ranking',
        
        // Footer
        footer: '© 2025 Classic Games | Made with ❤️ for retro game lovers',
        
        // Login
        welcome: '🎮 Welcome!',
        loginSubtitle: 'Log in or create a new account',
        loginTab: 'Login',
        registerTab: 'Register',
        username: 'Username',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        loginBtn: 'Log In',
        registerBtn: 'Register',
        backToHome: '← Back',
        
        // Placeholder
        enterUsername: 'Enter your username',
        enterPassword: 'Enter password',
        chooseUsername: 'Choose username',
        choosePassword: 'Choose password (min. 4 characters)',
        repeatPassword: 'Repeat password',
        
        // Messages
        loginSuccess: 'Login successful! Redirecting...',
        loginError: 'Invalid username or password!',
        registerSuccess: 'Registration successful! You can log in now.',
        usernameTooShort: 'Username must be at least 3 characters!',
        passwordTooShort: 'Password must be at least 4 characters!',
        passwordMismatch: 'Passwords do not match!',
        usernameTaken: 'This username is already taken!',
        
        // Tic Tac Toe
        tictactoeTitle: '⭕ Tic Tac Toe ❌',
        tictactoeSubtitle: 'Classic game for two players',
        backToMenu: '← Back to menu',
        twoPlayers: '👥 2 Players',
        vsBot: '🤖 Play vs Bot',
        selectDifficulty: 'Select difficulty level:',
        easy: '😊 Easy',
        normal: '😐 Normal',
        hard: '😈 Hard',
        playerXStarts: 'Player X starts!',
        playerTurn: 'Player',
        yourMove: 'Your move (X)',
        botThinking: '🤔 Bot is thinking...',
        youVsBot: 'You (X) vs Bot (O) - Level:',
        newGame: 'New Game',
        winsX: 'X Wins',
        draws: 'Draws',
        winsO: 'O Wins',
        playerWins: 'Player',
        wins2: 'wins!',
        youWin: 'You Win!',
        botWins: 'Bot wins!',
        draw: '🤝 Draw! 🤝',
        
        // Difficulty levels
        diffEasy: 'Easy',
        diffNormal: 'Normal',
        diffHard: 'Hard',
        
        // Battleship
        battleshipTitle: '🚢 Battleship 🎯',
        battleshipSubtitle: 'Sink the enemy fleet!',
        yourFleet: '🚢 Your Fleet',
        enemyFleet: '💀 Enemy Fleet',
        cruiser: 'Cruiser',
        destroyer: 'Destroyer',
        submarine: 'Submarine',
        setupPhase: 'Place your ships!',
        clickAutoSetup: 'Click "Auto Setup" or place manually',
        autoSetup: '🎲 Auto Setup',
        rotate: '🔄 Rotate Ship',
        startBattle: '⚔️ Start Battle!',
        yourBoard: 'Your Board',
        enemyBoard: 'Enemy Board',
        ship: 'Ship',
        hit: 'Hit',
        miss: 'Miss',
        sunk: 'Sunk',
        yourHits: 'Your Hits',
        yourMisses: 'Your Misses',
        enemyHits: 'Enemy Hits',
        gamesWon: 'Games Won',
        shipsPlaced: 'Ships placed! Click "Start Battle"',
        placeShipsFirst: 'Place your ships first!',
        yourTurn: 'Your turn - click on enemy board!',
        enemyTurn: 'Enemy turn...',
        hitSuccess: '💥 Hit! Shoot again!',
        missedShot: '💦 Miss! Enemy turn',
        shipSunk: '🔥 Sunk! Continue attack!',
        enemyHit: '💥 Enemy hit your ship!',
        enemyMissed: '💦 Enemy missed!',
        enemySunkShip: '💀 Enemy sunk your ship!',
        youWon: '🎉 VICTORY! You sunk the entire enemy fleet! 🎉',
        youLost: '💀 DEFEAT! Your fleet has been sunk! 💀',
        horizontal: 'Horizontal',
        vertical: 'Vertical'
    },
    
    // ==================== NIEMIECKI ====================
    de: {
        // Navbar
        logo: '🎮 Klassische Spiele',
        guest: 'Gast',
        login: 'Anmelden',
        logout: 'Abmelden',
        
        // Home page
        heroTitle: 'Willkommen in der Welt der klassischen Spiele!',
        heroSubtitle: 'Spiele legendäre Spiele, sammle Punkte und trete gegen Freunde an',
        
        // Game cards
        available: 'Verfügbar',
        comingSoon: 'Demnächst',
        playNow: 'Jetzt spielen →',
        soonText: 'Bald verfügbar!',
        wins: 'Siege',
        points: 'Pkt',
        
        // Game names
        tictactoe: 'Tic Tac Toe',
        tictactoeDesc: 'Klassisches Strategiespiel. Reihe drei Symbole auf und gewinne!',
        hangman: 'Galgenmännchen',
        hangmanDesc: 'Errate das Wort, bevor die Versuche ausgehen. Teste dein Wissen!',
        battleship: 'Schiffe Versenken',
        battleshipDesc: 'Strategische Seeschlacht. Versenke die feindliche Flotte!',
        
        // Leaderboard
        leaderboard: '🏆 Spieler-Rangliste',
        noPlayers: 'Keine Spieler in der Rangliste',
        
        // Footer
        footer: '© 2025 Klassische Spiele | Erstellt mit ❤️ für Retro-Spiel-Liebhaber',
        
        // Login
        welcome: '🎮 Willkommen!',
        loginSubtitle: 'Melde dich an oder erstelle ein neues Konto',
        loginTab: 'Anmeldung',
        registerTab: 'Registrierung',
        username: 'Benutzername',
        password: 'Passwort',
        confirmPassword: 'Passwort bestätigen',
        loginBtn: 'Anmelden',
        registerBtn: 'Registrieren',
        backToHome: '← Zurück',
        
        // Placeholder
        enterUsername: 'Gib deinen Benutzernamen ein',
        enterPassword: 'Gib dein Passwort ein',
        chooseUsername: 'Wähle einen Benutzernamen',
        choosePassword: 'Wähle ein Passwort (mind. 4 Zeichen)',
        repeatPassword: 'Wiederhole das Passwort',
        
        // Messages
        loginSuccess: 'Anmeldung erfolgreich! Weiterleitung...',
        loginError: 'Ungültiger Benutzername oder Passwort!',
        registerSuccess: 'Registrierung erfolgreich! Du kannst dich jetzt anmelden.',
        usernameTooShort: 'Benutzername muss mindestens 3 Zeichen haben!',
        passwordTooShort: 'Passwort muss mindestens 4 Zeichen haben!',
        passwordMismatch: 'Passwörter stimmen nicht überein!',
        usernameTaken: 'Dieser Benutzername ist bereits vergeben!',
        
        // Tic Tac Toe
        tictactoeTitle: '⭕ Tic Tac Toe ❌',
        tictactoeSubtitle: 'Klassisches Spiel für zwei Spieler',
        backToMenu: '← Zurück zum Menü',
        twoPlayers: '👥 2 Spieler',
        vsBot: '🤖 Gegen Bot',
        selectDifficulty: 'Wähle Schwierigkeitsgrad:',
        easy: '😊 Leicht',
        normal: '😐 Normal',
        hard: '😈 Schwer',
        playerXStarts: 'Spieler X beginnt!',
        playerTurn: 'Spieler',
        yourMove: 'Dein Zug (X)',
        botThinking: '🤔 Bot denkt nach...',
        youVsBot: 'Du (X) vs Bot (O) - Stufe:',
        newGame: 'Neues Spiel',
        winsX: 'X Siege',
        draws: 'Unentschieden',
        winsO: 'O Siege',
        playerWins: 'Spieler',
        wins2: 'gewinnt!',
        youWin: 'Du gewinnst!',
        botWins: 'Bot gewinnt!',
        draw: '🤝 Unentschieden! 🤝',
        
        // Difficulty levels
        diffEasy: 'Leicht',
        diffNormal: 'Normal',
        diffHard: 'Schwer',
        
        // Battleship
        battleshipTitle: '🚢 Schiffe Versenken 🎯',
        battleshipSubtitle: 'Versenke die feindliche Flotte!',
        yourFleet: '🚢 Deine Flotte',
        enemyFleet: '💀 Feindliche Flotte',
        cruiser: 'Kreuzer',
        destroyer: 'Zerstörer',
        submarine: 'U-Boot',
        setupPhase: 'Platziere deine Schiffe!',
        clickAutoSetup: 'Klicke "Auto-Aufstellung" oder platziere manuell',
        autoSetup: '🎲 Auto-Aufstellung',
        rotate: '🔄 Schiff drehen',
        startBattle: '⚔️ Schlacht beginnen!',
        yourBoard: 'Dein Spielfeld',
        enemyBoard: 'Gegnerisches Spielfeld',
        ship: 'Schiff',
        hit: 'Treffer',
        miss: 'Daneben',
        sunk: 'Versenkt',
        yourHits: 'Deine Treffer',
        yourMisses: 'Deine Fehlschüsse',
        enemyHits: 'Gegnerische Treffer',
        gamesWon: 'Gewonnene Spiele',
        shipsPlaced: 'Schiffe platziert! Klicke "Schlacht beginnen"',
        placeShipsFirst: 'Platziere zuerst deine Schiffe!',
        yourTurn: 'Dein Zug - klicke auf das gegnerische Spielfeld!',
        enemyTurn: 'Gegnerzug...',
        hitSuccess: '💥 Treffer! Schieße weiter!',
        missedShot: '💦 Daneben! Gegner ist dran',
        shipSunk: '🔥 Versenkt! Angriff fortsetzen!',
        enemyHit: '💥 Gegner hat dein Schiff getroffen!',
        enemyMissed: '💦 Gegner hat verfehlt!',
        enemySunkShip: '💀 Gegner hat dein Schiff versenkt!',
        youWon: '🎉 SIEG! Du hast die gesamte feindliche Flotte versenkt! 🎉',
        youLost: '💀 NIEDERLAGE! Deine Flotte wurde versenkt! 💀',
        horizontal: 'Horizontal',
        vertical: 'Vertikal'
    }
};

// Obecny język (domyślnie polski)
let currentLanguage = localStorage.getItem('language') || 'pl';

// Funkcja pobierająca tłumaczenie
function t(key) {
    return translations[currentLanguage][key] || key;
}

// Funkcja zmiany języka
function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    
    // Aktualizuj aktywny przycisk
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    // Przeładuj tłumaczenia na stronie
    updatePageTranslations();
}

// Funkcja aktualizująca tłumaczenia (będzie nadpisana w każdym pliku)
function updatePageTranslations() {
    console.log('Updating translations to:', currentLanguage);
}

// Inicjalizacja przy załadowaniu
document.addEventListener('DOMContentLoaded', () => {
    // Ustaw aktywny język na przyciskach
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === currentLanguage) {
            btn.classList.add('active');
        }
    });
});