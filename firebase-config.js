// firebase-config.js
import { initializeApp }                        from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey:            "AIzaSyA60ODhMotjNx6CCDX5CNUmY6fo6ZA0UGo",
    authDomain:        "classic-game-57952.firebaseapp.com",
    projectId:         "classic-game-57952",
    storageBucket:     "classic-game-57952.firebasestorage.app",
    messagingSenderId: "421242489961",
    appId:             "1:421242489961:web:aee4c1b86e10183e75e6f8",
    measurementId:     "G-T5B258C8S9"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// Domyślna struktura statystyk — używana przy rejestracji i jako fallback
const DEFAULT_STATS = {
    tictactoeWins:   0,
    tictactoeLosses: 0,
    tictactoeDraws:  0,
    tictactoePoints: 0,
    battleship: {
        wins:   0,
        losses: 0,
        points: 0
    }
};

export {
    auth,
    db,
    DEFAULT_STATS,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    updateDoc,
    serverTimestamp
};
