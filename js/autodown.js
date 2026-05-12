// autodown.js — Auto redirect + Changelog popup

const PKL_END       = new Date("2026-09-25T23:59:59+07:00");
const CHANGELOG_VER = "v2.0"; // bump this on every update to re-show popup

// ── Auto redirect ─────────────────────────────────────────
function checkPKLEnd() {
  const now = new Date();
  if (now >= PKL_END) {
    if (!window.location.pathname.endsWith("goodbye.html")) {
      window.location.replace("goodbye.html");
    }
    return;
  }
  const msLeft = PKL_END - now;
  if (msLeft < 86400000) {
    setTimeout(() => {
      if (!window.location.pathname.endsWith("goodbye.html"))
        window.location.replace("goodbye.html");
    }, msLeft + 1000);
  }
}
checkPKLEnd();
setInterval(checkPKLEnd, 60000);

// ── H-7 / H-3 / H-1 banner ───────────────────────────────
function checkCountdownBanner() {
  const now  = new Date();
  const diff = Math.ceil((PKL_END - now) / 86400000);
  const key  = `pkl_banner_${diff}`;
  if (![7,3,1].includes(diff)) return;
  if (localStorage.getItem(key)) return;
  if (document.getElementById("countdown-banner")) return;

  const msgs = {
    7: { text:"⏳ H-7 menuju akhir PKL! Semangat, hampir sampai!", color:"#d97706" },
    3: { text:"⚡ H-3 lagi! Manfaatkan waktu yang tersisa sebaik mungkin!", color:"#dc2626" },
    1: { text:"🔥 BESOK adalah hari terakhir PKL! Berikan yang terbaik!", color:"#991b1b" },
  };
  const m = msgs[diff];

  const banner = document.createElement("div");
  banner.id = "countdown-banner";
  banner.style.cssText = `
    position:fixed;top:0;left:0;right:0;z-index:9990;
    background:${m.color};color:#fff;
    padding:10px 16px;font-size:13px;font-weight:600;
    display:flex;align-items:center;justify-content:space-between;
    gap:10px;animation:slideDown .3s ease;
  `;
  banner.innerHTML = `
    <span>${m.text}</span>
    <button onclick="this.closest('#countdown-banner').remove();localStorage.setItem('${key}','1')"
      style="background:rgba(255,255,255,.2);border:none;color:#fff;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:12px;">✕</button>
  `;
  document.body.prepend(banner);
}

// ── Changelog popup ───────────────────────────────────────
const CHANGELOG = [
  { ver:"v2.0", date:"Mei 2026", changes:[
    "🎨 UI/UX dirombak total — tema Red & White Japan-inspired",
    "📱 Full responsive mobile dengan bottom navigation",
    "🎮 Halaman Games: Quiz TKJ+RPL, PKL Bingo, Spin Wheel, Nasib PKL, Roast Generator, Siapa Paling...",
    "💬 Live Chat / Shoutbox antar user",
    "🟢 Status online realtime",
    "💬 Komentar di setiap entri jurnal",
    "📊 Rekap per-user dengan word cloud & mood timeline",
    "✉️ Surat untuk diri sendiri (terbuka 25 September)",
    "📅 Pengaturan hari libur custom (settings)",
    "🔥 Voting 'Hari Ini Gimana' dengan grafik mingguan",
    "⏰ Countdown jam istirahat & jam pulang di dashboard",
    "🖼 Gallery: delete foto, slideshow otomatis, nama+caption tampil",
    "📸 Foto hari ini di dashboard",
    "🎓 PKL Yearbook di settings",
    "📊 Weekly digest otomatis ke Telegram setiap Jumat",
    "📣 Notif Telegram lebih rapi dan detail",
    "👁 Guest login (read-only) — wajib input nama",
    "🗑 Notif Telegram saat jurnal dihapus",
    "🔢 Fix hitungan hari kerja PKL (sudah akurat)",
  ]}
];

function showChangelogIfNeeded() {
  // Skip for guest
  const session = typeof getSession === "function" ? getSession() : null;
  if (!session || session.isGuest) return;

  const seenKey = `pkl_changelog_seen_${CHANGELOG_VER}`;
  if (localStorage.getItem(seenKey)) return;

  // Delay sedikit biar halaman render dulu
  setTimeout(() => {
    const overlay = document.createElement("div");
    overlay.id = "changelog-overlay";
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:9995;
      background:rgba(0,0,0,.6);backdrop-filter:blur(4px);
      display:flex;align-items:center;justify-content:center;padding:20px;
      animation:fadeIn .3s;
    `;

    const cl = CHANGELOG[0];
    const changesList = cl.changes.map(c=>`
      <div style="display:flex;gap:8px;padding:5px 0;border-bottom:1px solid var(--border);font-size:12px;color:var(--text-2);">
        <span style="flex-shrink:0;">${c.split(" ")[0]}</span>
        <span>${c.substring(c.indexOf(" ")+1)}</span>
      </div>`).join("");

    overlay.innerHTML = `
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:20px;
                  padding:24px;width:100%;max-width:460px;max-height:85vh;overflow-y:auto;
                  box-shadow:0 20px 60px rgba(0,0,0,.3);animation:scaleIn .3s;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
          <div style="width:36px;height:36px;background:var(--red);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;">🚀</div>
          <div>
            <div style="font-size:16px;font-weight:800;color:var(--text);">Update ${cl.ver}</div>
            <div style="font-size:11px;color:var(--text-3);">${cl.date}</div>
          </div>
          <div style="margin-left:auto;">
            <span style="background:var(--red);color:#fff;border-radius:99px;padding:3px 10px;font-size:10px;font-weight:700;">NEW</span>
          </div>
        </div>
        <div style="font-size:13px;color:var(--text-3);margin-bottom:14px;">Yang baru di PKL Journal:</div>
        <div style="margin-bottom:16px;">${changesList}</div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <button onclick="closeChangelog(false)"
            style="flex:1;padding:10px;background:var(--red);color:#fff;border:none;border-radius:8px;
                   font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font);">
            🎉 Keren, siap!
          </button>
        </div>
        <div style="margin-top:10px;text-align:center;">
          <label style="font-size:11px;color:var(--text-3);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;text-transform:none;letter-spacing:0;">
            <input type="checkbox" id="dont-show-again" style="width:14px;height:14px;cursor:pointer;">
            Jangan tampilkan lagi untuk update ini
          </label>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    overlay.addEventListener("click", e => { if(e.target===overlay) closeChangelog(false); });
  }, 800);
}

function closeChangelog(forceHide) {
  const overlay = document.getElementById("changelog-overlay");
  if (!overlay) return;
  const dontShow = document.getElementById("dont-show-again");
  if (forceHide || (dontShow && dontShow.checked)) {
    localStorage.setItem(`pkl_changelog_seen_${CHANGELOG_VER}`, "1");
  }
  overlay.style.animation = "fadeOut .2s";
  setTimeout(() => overlay.remove(), 200);
}

// Init when DOM ready
document.addEventListener("DOMContentLoaded", () => {
  checkCountdownBanner();
  showChangelogIfNeeded();
});
