// ============================================================
//  nav.js — Sidebar + helpers
// ============================================================

const QUOTES = [
  { text: "Jangan takut gagal. Ketakutan itulah yang harus kamu takutkan.", author: "— Aung San Suu Kyi" },
  { text: "Setiap ahli dulunya adalah pemula yang tidak menyerah.", author: "— Helen Hayes" },
  { text: "PKL bukan akhir belajar, ini awal dari segalanya.", author: "— Sentra Computer" },
  { text: "Kerja keras mengalahkan bakat saat bakat tidak bekerja keras.", author: "— Tim Notke" },
  { text: "Ilmu tanpa praktik seperti pohon tanpa buah.", author: "— Pepatah" },
  { text: "Disiplin adalah jembatan antara tujuan dan pencapaian.", author: "— Jim Rohn" },
  { text: "Teknologi adalah alat yang kuat di tangan yang tepat.", author: "— Sentra Computer" },
  { text: "Kegagalan adalah guru terbaik jika kamu mau mendengarkannya.", author: "— Anonim" },
  { text: "Semakin keras kamu bekerja, semakin beruntung kamu jadinya.", author: "— Gary Player" },
  { text: "Kesempatan tidak datang, ia diciptakan.", author: "— Chris Grosser" },
];

const MOTIVASI_PKL = [
  "💪 Hari ini lebih keras dari kemarin — kamu pasti bisa!",
  "🔥 Setiap kabel yang kamu pasang adalah pengalaman nyata!",
  "⚡ PKL bukan beban, PKL adalah investasi masa depanmu!",
  "🧠 Ilmu yang kamu dapat hari ini, berguna seumur hidup!",
  "🌟 Sentra Computer memilih kalian karena kalian layak!",
  "🚀 Masih ada waktu, masih ada kesempatan!",
  "💡 Error bukan akhir — itu tanda kamu sudah mencoba!",
  "🎯 Fokus pada proses, hasil pasti menyusul!",
  "🔧 Tangan terlatih dimulai dari praktek yang konsisten!",
  "⚙️ Satu hari PKL = satu langkah lebih dekat ke karir impian!",
];

function getRandomQuote()    { return QUOTES[Math.floor(Math.random() * QUOTES.length)]; }
function getRandomMotivasi() { return MOTIVASI_PKL[Math.floor(Math.random() * MOTIVASI_PKL.length)]; }

function renderSidebar(activePage) {
  const user = getSession() || { display:"?", avatar:"?", color:"#0066ff", isGuest: false };
  
  const allNavItems = [
    { href:"dashboard.html", icon:"⬡", label:"Dashboard",        id:"dashboard", guestOk: false },
    { href:"jurnal.html",    icon:"📓", label:"Jurnal Harian",    id:"jurnal",    guestOk: true },
    { href:"rekap.html",     icon:"📊", label:"Rekap & Statistik",id:"rekap",     guestOk: true },
    { href:"gallery.html",   icon:"📸", label:"Gallery PKL",      id:"gallery",   guestOk: true },
    { href:"absensi.html",   icon:"📍", label:"Absensi",          id:"absensi",   guestOk: false },
    { href:"semangat.html",  icon:"✨", label:"Dinding Semangat", id:"semangat",  guestOk: false },
    { href:"settings.html",  icon:"⚙", label:"Pengaturan",       id:"settings",  guestOk: false },
  ];

  const navItems = user.isGuest
    ? allNavItems.filter(n => n.guestOk)
    : allNavItems;

  const navHtml = navItems.map(n => `
    <a href="${n.href}" class="nav-item ${activePage === n.id ? "active" : ""}">
      <span class="icon">${n.icon}</span> ${n.label}
    </a>
  `).join("");

  const guestBadge = user.isGuest
    ? `<div style="background:rgba(0,170,255,.1);border:1px solid rgba(0,170,255,.3);border-radius:4px;padding:2px 8px;font-size:9px;color:var(--neon);letter-spacing:.1em;text-transform:uppercase;margin-top:2px;">Tamu</div>`
    : "";

  return `
  <div class="sidebar-overlay" id="sidebar-overlay" onclick="closeSidebar()"></div>
  <nav class="sidebar" id="sidebar">
    <div class="sidebar-logo">
      <div class="logo-top">PKL Journal</div>
      <div class="logo-sub">Sentra Computer · 2026</div>
    </div>
    <div class="sidebar-user">
      <div class="avatar" style="background:${user.color};">${user.avatar}</div>
      <div class="sidebar-user-info">
        <div class="name">${user.display}</div>
        ${guestBadge}
        ${!user.isGuest ? `<div class="role">Peserta PKL</div>` : ""}
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-label">Menu</div>
      ${navHtml}
    </nav>
    <div class="sidebar-bottom">
      <button class="btn-logout" onclick="logout()">⏻ &nbsp; ${user.isGuest ? "Keluar" : "Logout"}</button>
    </div>
  </nav>
  <button class="hamburger" id="hamburger" onclick="toggleSidebar()">☰</button>
  `;
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("sidebar-overlay").classList.toggle("show");
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebar-overlay").classList.remove("show");
}

function showToast(msg, type = "success") {
  let el = document.getElementById("toast");
  if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; document.body.appendChild(el); }
  const icons = { success:"✔", error:"✖", info:"ℹ" };
  el.innerHTML = `<span>${icons[type]||"ℹ"}</span> ${msg}`;
  el.className = `toast ${type}`;
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("show")));
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("show"), 3000);
}

function initPage(activePage) {
  const target = document.getElementById("sidebar-mount");
  if (target) target.innerHTML = renderSidebar(activePage);

  // Block guest from restricted pages
  const session = getSession();
  const restrictedPages = ["dashboard", "absensi", "semangat", "settings"];
  if (session && session.isGuest && restrictedPages.includes(activePage)) {
    window.location.href = "jurnal.html";
  }
}
