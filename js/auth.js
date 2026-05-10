// ============================================================
//  auth.js — Simple login, guest support
// ============================================================

const USERS = {
  shandy:  { password: "pkl2026", display: "Shandy",  uid: "user_shandy",  color: "#0066ff", avatar: "S",  isGuest: false },
  sabrina: { password: "pkl2026", display: "Sabrina", uid: "user_sabrina", color: "#6644ff", avatar: "Sa", isGuest: false },
  fahri:   { password: "pkl2026", display: "Fahri",   uid: "user_fahri",   color: "#0044cc", avatar: "F",  isGuest: false }
};

async function loginUser(username, password) {
  const u = USERS[username.toLowerCase()];
  if (!u) throw new Error("Username tidak ditemukan.");
  try {
    const snap = await db.ref(`passwords/${username.toLowerCase()}`).once("value");
    const savedPw  = snap.val();
    const activePw = savedPw || u.password;
    if (activePw !== password) throw new Error("Password salah.");
  } catch(e) {
    if (e.message === "Password salah.") throw e;
    if (u.password !== password) throw new Error("Password salah.");
  }
  return u;
}

function setSession(user) {
  sessionStorage.setItem("pkl_session", JSON.stringify({
    username: Object.keys(USERS).find(k => USERS[k].uid === user.uid) || "guest",
    display:  user.display,
    uid:      user.uid,
    color:    user.color,
    avatar:   user.avatar,
    isGuest:  user.isGuest || false
  }));
}

function getSession() {
  try { return JSON.parse(sessionStorage.getItem("pkl_session")); }
  catch { return null; }
}

function requireSession() {
  const s = getSession();
  if (!s) window.location.href = "index.html";
  return s;
}

function requireNonGuest() {
  const s = requireSession();
  if (s && s.isGuest) window.location.href = "jurnal.html";
  return s;
}

function logout() {
  sessionStorage.removeItem("pkl_session");
  window.location.href = "index.html";
}
