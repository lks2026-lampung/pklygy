// nav.js — Sidebar + Bottom Nav + Toast + Helpers

const QUOTES = [
  { text: "Jangan takut gagal. Ketakutan itulah yang harus kamu takutkan.", author: "— Aung San Suu Kyi" },
  { text: "Setiap ahli dulunya adalah pemula yang tidak menyerah.", author: "— Helen Hayes" },
  { text: "PKL bukan akhir belajar, ini awal dari segalanya.", author: "— Sentra Computer" },
  { text: "Kerja keras mengalahkan bakat saat bakat tidak bekerja keras.", author: "— Tim Notke" },
  { text: "Ilmu tanpa praktik seperti pohon tanpa buah.", author: "— Pepatah" },
  { text: "Disiplin adalah jembatan antara tujuan dan pencapaian.", author: "— Jim Rohn" },
  { text: "Kegagalan adalah guru terbaik jika kamu mau mendengarkannya.", author: "— Anonim" },
  { text: "Kesempatan tidak datang, ia diciptakan.", author: "— Chris Grosser" },
  { text: "Semakin keras kamu bekerja, semakin beruntung kamu jadinya.", author: "— Gary Player" },
  { text: "Teknologi adalah alat yang kuat di tangan yang tepat.", author: "— Sentra Computer" },
];

const MOTIVASI = [
  "💪 Hari ini lebih keras dari kemarin — kamu pasti bisa!",
  "🔥 Setiap kabel yang kamu pasang adalah pengalaman nyata!",
  "⚡ PKL bukan beban, PKL adalah investasi masa depanmu!",
  "🧠 Ilmu yang kamu dapat hari ini berguna seumur hidup!",
  "🌟 Sentra Computer memilih kalian karena kalian layak!",
  "🚀 Masih ada waktu, masih ada kesempatan — jangan menyerah!",
  "💡 Error bukan akhir — itu tanda kamu sudah mencoba!",
  "🎯 Fokus pada proses, hasil pasti menyusul!",
  "🔧 Tangan terlatih dimulai dari praktik yang konsisten!",
  "⚙️ Satu hari PKL = satu langkah lebih dekat ke karir impian!",
  "✨ Kamu lebih kuat dari yang kamu kira!",
  "🏆 Setiap hari hadir adalah kemenangan kecil yang berarti!",
];

function getRandomQuote()    { return QUOTES[Math.floor(Math.random() * QUOTES.length)]; }
function getRandomMotivasi() { return MOTIVASI[Math.floor(Math.random() * MOTIVASI.length)]; }
function escHtml(s) {
  return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

// ── Nav config ────────────────────────────────────────────
const ALL_NAV = [
  { href:"dashboard.html", icon:"⬡", label:"Dashboard",        id:"dashboard", guestOk:false, bnShow:true },
  { href:"jurnal.html",    icon:"📓", label:"Jurnal",           id:"jurnal",    guestOk:true,  bnShow:true },
  { href:"absensi.html",   icon:"📍", label:"Absensi",          id:"absensi",   guestOk:false, bnShow:true },
  { href:"gallery.html",   icon:"📸", label:"Gallery",          id:"gallery",   guestOk:true,  bnShow:true },
  { href:"rekap.html",     icon:"📊", label:"Rekap",            id:"rekap",     guestOk:true,  bnShow:true },
  { href:"semangat.html",  icon:"✨", label:"Semangat",         id:"semangat",  guestOk:false, bnShow:false },
  { href:"games.html",     icon:"🎮", label:"Games",            id:"games",     guestOk:false, bnShow:false },
  { href:"settings.html",  icon:"⚙",  label:"Pengaturan",       id:"settings",  guestOk:false, bnShow:false },
];

function renderSidebar(activePage) {
  const user    = getSession() || { display:"?", avatar:"?", color:"#dc2626", isGuest:false };
  const navItems = user.isGuest ? ALL_NAV.filter(n => n.guestOk) : ALL_NAV;
  const bnItems  = navItems.filter(n => n.bnShow).slice(0, 5);

  const sideNav = navItems.map(n => `
    <a href="${n.href}" class="nav-item ${activePage===n.id?"active":""}">
      <span class="ni-icon">${n.icon}</span> ${n.label}
    </a>`).join("");

  const bottomNav = bnItems.map(n => `
    <a href="${n.href}" class="bn-item ${activePage===n.id?"active":""}">
      <span class="bn-icon">${n.icon}</span>${n.label}
    </a>`).join("");

  const guestBadge = user.isGuest
    ? `<div class="guest-badge">TAMU</div>` : "";

  return `
  <div class="drawer-overlay" id="drawer-overlay" onclick="closeSidebar()"></div>

  <nav class="sidebar" id="sidebar">
    <div class="sidebar-brand">
      <div class="brand-logo">
        <div class="brand-icon">📓</div>
        <div>
          <div class="brand-name">PKL Journal</div>
        </div>
      </div>
      <div class="brand-sub">Sentra Computer · 2026</div>
    </div>
    <div class="sidebar-user">
      <div class="user-avatar" style="background:${user.color};">
        ${user.avatar}
        <div class="online-dot"></div>
      </div>
      <div class="user-info">
        <div class="name">${user.display}</div>
        ${guestBadge}
        ${!user.isGuest ? `<div class="role">Peserta PKL</div>` : ""}
      </div>
    </div>
    <div class="sidebar-nav">
      <div class="nav-section-label">Menu</div>
      ${sideNav}
    </div>
    <div class="sidebar-bottom">
      <button class="btn-logout" onclick="logout()">⏻ &nbsp; ${user.isGuest?"Keluar":"Logout"}</button>
    </div>
  </nav>

  <!-- Topbar mobile -->
  <div class="topbar" id="topbar">
    <button class="hamburger" onclick="toggleSidebar()">☰</button>
    <div class="topbar-logo">PKL Journal</div>
    <div class="topbar-user" style="background:${user.color};">${user.avatar}</div>
  </div>

  <!-- Bottom nav mobile -->
  <nav class="bottom-nav">
    <div class="bottom-nav-inner">${bottomNav}</div>
  </nav>

  <!-- Shoutbox FAB (non-guest only) -->
  ${!user.isGuest ? `
  <button class="shoutbox-fab" id="shoutbox-fab" onclick="toggleShoutbox()" title="Live Chat">💬</button>
  <div class="shoutbox" id="shoutbox">
    <div class="shoutbox-head">
      💬 Live Chat
      <button onclick="toggleShoutbox()" style="background:none;border:none;color:#fff;cursor:pointer;font-size:16px;">✕</button>
    </div>
    <div class="shoutbox-msgs" id="shoutbox-msgs">
      <div style="text-align:center;font-size:11px;color:var(--text-3);padding:20px 0;">Belum ada pesan...</div>
    </div>
    <div class="shoutbox-input">
      <input type="text" id="shout-input" placeholder="Ketik pesan..." maxlength="120"
             onkeydown="if(event.key==='Enter')sendShout()">
      <button class="btn btn-primary btn-sm" onclick="sendShout()">Kirim</button>
    </div>
  </div>` : ""}

  <!-- Toast container -->
  <div class="toast-container" id="toast-container"></div>
  `;
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("drawer-overlay").classList.toggle("open");
}
function closeSidebar() {
  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("drawer-overlay")?.classList.remove("open");
}

// ── Toast ─────────────────────────────────────────────────
function showToast(msg, type="success", duration=3000) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const icons = { success:"✓", error:"✕", info:"ℹ" };
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]||"ℹ"}</span> ${msg}`;
  container.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

// ── Shoutbox ──────────────────────────────────────────────
function toggleShoutbox() {
  const box = document.getElementById("shoutbox");
  const fab = document.getElementById("shoutbox-fab");
  if (!box) return;
  const open = box.classList.toggle("open");
  if (fab) fab.style.display = open ? "none" : "flex";
  if (open) loadShouts();
}

function loadShouts() {
  const user = getSession();
  if (!user) return;
  db.ref("shoutbox").orderByChild("ts").limitToLast(30).on("value", snap => {
    const msgs = [];
    snap.forEach(c => msgs.push({ key:c.key, ...c.val() }));
    const el = document.getElementById("shoutbox-msgs");
    if (!el) return;
    if (!msgs.length) {
      el.innerHTML = `<div style="text-align:center;font-size:11px;color:var(--text-3);padding:20px 0;">Belum ada pesan...</div>`;
      return;
    }
    el.innerHTML = msgs.map(m => `
      <div class="shout-msg ${m.uid===user.uid?"mine":""}">
        <span class="sm-author">${escHtml(m.name)}</span>
        <span class="sm-time">${formatTime(m.ts)}</span>
        <div class="sm-text">${escHtml(m.text)}</div>
      </div>`).join("");
    el.scrollTop = el.scrollHeight;
  });
}

async function sendShout() {
  const user  = getSession();
  const input = document.getElementById("shout-input");
  if (!user || !input) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  await db.ref("shoutbox").push({ name:user.display, uid:user.uid, text, ts:Date.now() });
  // Keep only last 100 messages
  db.ref("shoutbox").orderByChild("ts").once("value", snap => {
    const keys = []; snap.forEach(c => keys.push(c.key));
    if (keys.length > 100) keys.slice(0, keys.length-100).forEach(k => db.ref(`shoutbox/${k}`).remove());
  });
}

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit" });
}

// ── Init page ─────────────────────────────────────────────
function initPage(activePage) {
  const mount = document.getElementById("sidebar-mount");
  if (mount) mount.innerHTML = renderSidebar(activePage);

  // Block guest from restricted pages
  const session = getSession();
  const restricted = ["dashboard","absensi","semangat","games","settings"];
  if (session?.isGuest && restricted.includes(activePage)) {
    window.location.href = "jurnal.html";
  }

  // Status online
  if (session && !session.isGuest) {
    updateOnlineStatus(session);
  }
}

// ── Online presence ───────────────────────────────────────
function updateOnlineStatus(user) {
  const ref = db.ref(`online/${user.uid}`);
  ref.set({ name:user.display, uid:user.uid, color:user.color, avatar:user.avatar, ts:Date.now() });
  ref.onDisconnect().remove();
  // Refresh every 60s
  setInterval(() => ref.update({ ts:Date.now() }), 60000);
}

// ── Confetti ──────────────────────────────────────────────
function launchConfetti(count=60) {
  const colors = ["#dc2626","#ef4444","#f59e0b","#10b981","#3b82f6","#8b5cf6","#ec4899","#ffffff"];
  for (let i=0; i<count; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.cssText = `
      left:${Math.random()*100}vw;
      top:-10px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      width:${6+Math.random()*8}px;
      height:${6+Math.random()*8}px;
      border-radius:${Math.random()>0.5?"50%":"2px"};
      animation-delay:${Math.random()*0.5}s;
      animation-duration:${2+Math.random()*2}s;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}
