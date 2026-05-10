// ============================================================
//  streak.js — Streak counter + badges + push notif reminder
// ============================================================

const STREAK_BADGES = [
  { days: 3,   emoji: "🌱", label: "Pemula",       color: "#26a69a" },
  { days: 7,   emoji: "🔥", label: "Seminggu Penuh", color: "#ff6600" },
  { days: 14,  emoji: "⚡", label: "2 Minggu Kuat", color: "#ff4da6" },
  { days: 21,  emoji: "💪", label: "3 Minggu Juara", color: "#ab47bc" },
  { days: 30,  emoji: "🏆", label: "30 Hari Legend", color: "#ffd700" },
  { days: 50,  emoji: "👑", label: "50 Hari Master", color: "#ff8f00" },
  { days: 100, emoji: "🌟", label: "100 Hari PKL God", color: "#e91e8c" },
];

// Hitung streak dari data journal shared
async function calculateStreak(userName) {
  return new Promise(resolve => {
    journalRef().orderByChild("createdAt").once("value", snap => {
      const userDates = new Set();
      snap.forEach(c => {
        const d = c.val();
        if (d.userName === userName && d.tanggal) userDates.add(d.tanggal);
      });

      if (userDates.size === 0) { resolve({ current: 0, longest: 0, total: 0 }); return; }

      const sorted = Array.from(userDates).sort();
      let current = 1, longest = 1, temp = 1;

      for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i-1]);
        const curr = new Date(sorted[i]);
        const diff = (curr - prev) / 86400000;
        if (diff === 1) { temp++; longest = Math.max(longest, temp); }
        else temp = 1;
      }

      // Cek apakah streak masih aktif (hari ini atau kemarin)
      const lastDate = new Date(sorted[sorted.length - 1]);
      const today    = new Date(); today.setHours(0,0,0,0);
      const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
      const lastDay  = new Date(lastDate); lastDay.setHours(0,0,0,0);

      if (lastDay >= yesterday) {
        // Hitung current streak mundur dari hari terakhir
        current = 1;
        for (let i = sorted.length - 2; i >= 0; i--) {
          const a = new Date(sorted[i+1]); const b = new Date(sorted[i]);
          if ((a - b) / 86400000 === 1) current++;
          else break;
        }
      } else {
        current = 0; // streak putus
      }

      resolve({ current, longest: Math.max(longest, current), total: userDates.size });
    });
  });
}

function getBadge(streak) {
  let badge = null;
  for (const b of STREAK_BADGES) {
    if (streak >= b.days) badge = b;
  }
  return badge;
}

function renderStreakCard(data, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const badge = getBadge(data.current);
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
      <div style="text-align:center;min-width:80px;">
        <div style="font-family:var(--font-horror);font-size:42px;color:var(--red2);line-height:1;">${data.current}</div>
        <div style="font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-3);margin-top:4px;">Streak Saat Ini</div>
      </div>
      <div style="width:1px;height:50px;background:var(--border);flex-shrink:0;"></div>
      <div style="text-align:center;min-width:70px;">
        <div style="font-family:var(--font-horror);font-size:32px;color:var(--amber);line-height:1;">${data.longest}</div>
        <div style="font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-3);margin-top:4px;">Terpanjang</div>
      </div>
      <div style="width:1px;height:50px;background:var(--border);flex-shrink:0;"></div>
      <div style="text-align:center;min-width:70px;">
        <div style="font-family:var(--font-horror);font-size:32px;color:var(--green);line-height:1;">${data.total}</div>
        <div style="font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-3);margin-top:4px;">Hari Aktif</div>
      </div>
      ${badge ? `
      <div style="margin-left:auto;text-align:center;">
        <div style="font-size:32px;">${badge.emoji}</div>
        <div style="font-size:10px;color:${badge.color};font-weight:600;margin-top:4px;">${badge.label}</div>
      </div>` : ""}
    </div>
    ${data.current === 0 ? `<div style="margin-top:12px;font-size:11px;color:var(--text-3);">⚠️ Streak putus! Isi jurnal hari ini untuk mulai lagi.</div>` : ""}
  `;
}

// ── Push Notification Reminder ────────────────────────────
async function requestNotifPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function scheduleReminderNotif(userName) {
  if (!("Notification" in window)) return;

  const now    = new Date();
  const target = new Date();
  target.setHours(17, 0, 0, 0); // jam 17:00

  // Kalau sudah lewat jam 5, set besok
  if (now >= target) target.setDate(target.getDate() + 1);

  const msLeft = target - now;

  setTimeout(async () => {
    // Cek apakah sudah isi jurnal hari ini
    const todayStr = new Date().toISOString().slice(0,10);
    journalRef().orderByChild("tanggal").equalTo(todayStr).once("value", snap => {
      let userFilled = false;
      snap.forEach(c => { if (c.val().userName === userName) userFilled = true; });

      if (!userFilled && Notification.permission === "granted") {
        new Notification("📓 PKL Journal Reminder", {
          body: `Hei ${userName}! Jangan lupa isi jurnal PKL hari ini ya! 🔥`,
          icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📓</text></svg>",
          badge: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📓</text></svg>",
          tag: "pkl-reminder",
          requireInteraction: false
        });
      }

      // Schedule lagi untuk besok
      scheduleReminderNotif(userName);
    });
  }, msLeft);
}

// Telegram reminder — kirim pesan jam 17:00 kalau belum isi
function scheduleTelegramReminder(userName) {
  const now    = new Date();
  const target = new Date();
  target.setHours(17, 0, 0, 0);
  if (now >= target) target.setDate(target.getDate() + 1);
  const msLeft = target - now;

  setTimeout(() => {
    const todayStr = new Date().toISOString().slice(0,10);
    journalRef().orderByChild("tanggal").equalTo(todayStr).once("value", snap => {
      let userFilled = false;
      snap.forEach(c => { if (c.val().userName === userName) userFilled = true; });

      if (!userFilled) {
        const msg = `⏰ <b>REMINDER — PKL Journal</b>\n\n👤 <b>${userName}</b> belum mengisi jurnal hari ini!\n📅 ${new Date().toLocaleDateString("id-ID",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}\n\n<i>Segera buka PKL Journal dan catat kegiatanmu hari ini! 📓</i>`;
        sendTelegram(msg);
      }
      scheduleTelegramReminder(userName);
    });
  }, msLeft);
}

// Init semua notif
async function initNotifications(userName) {
  const granted = await requestNotifPermission();
  if (granted) scheduleReminderNotif(userName);
  scheduleTelegramReminder(userName);
}
