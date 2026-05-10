// ============================================================
//  firebase.js — Ganti config ini dengan punya kamu!
//  Firebase Console → Project Settings → Your Apps → Config
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyCzlConfJL_37nl2jxdUAqMItCXh6wDrFk",
  authDomain: "sentra-pkl-dbdd0.firebaseapp.com",
  databaseURL: "https://sentra-pkl-dbdd0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sentra-pkl-dbdd0",
  storageBucket: "sentra-pkl-dbdd0.firebasestorage.app",
  messagingSenderId: "385972220042",
  appId: "1:385972220042:web:2b1f5042824735fccbfd73"
};

firebase.initializeApp(firebaseConfig);
const db      = firebase.database();
const storage = firebase.storage();

function journalRef()   { return db.ref(`journals/shared`); }
function absensiRef()   { return db.ref(`absensi`); }
function streakRef(uid) { return db.ref(`streaks/${uid}`); }
function galleryRef()   { return db.ref(`gallery`); }
