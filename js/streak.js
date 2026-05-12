// streak.js — Streak counter + push notif + reminder

const STREAK_BADGES = [
  { days:3,   emoji:"🌱", label:"Pemula",          color:"#16a34a" },
  { days:7,   emoji:"🔥", label:"Seminggu Penuh",   color:"#dc2626" },
  { days:14,  emoji:"⚡", label:"2 Minggu Kuat",    color:"#d97706" },
  { days:21,  emoji:"💪", label:"3 Minggu Juara",   color:"#7c3aed" },
  { days:30,  emoji:"🏆", label:"30 Hari Legend",   color:"#b45309" },
  { days:50,  emoji:"👑", label:"50 Hari Master",   color:"#dc2626" },
  { days:100, emoji:"🌟", label:"100 Hari PKL God", color:"#dc2626" },
];

async function calculateStreak(userName) {
  return new Promise(resolve => {
    journalRef().orderByChild("createdAt").once("value", snap => {
      const userDates = new Set();
      snap.forEach(c => {
        const d = c.val();
        if (d.userName === userName && d.tanggal) userDates.add(d.tanggal);
      });
      if (!userDates.size) { resolve({ current:0, longest:0, total:0 }); return; }

      const sorted = Array.from(userDates).sort();
      let longest = 1, temp = 1;
      for (let i=1; i<sorted.length; i++) {
        const diff = (new Date(sorted[i]) - new Date(sorted[i-1])) / 86400000;
        if (diff === 1) { temp++; longest = Math.max(longest, temp); }
        else temp = 1;
      }

      // Current streak
      const today     = new Date(); today.setHours(0,0,0,0);
      const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
      const lastDay   = new Date(sorted[sorted.length-1]); lastDay.setHours(0,0,0,0);

      let current = 0;
      if (lastDay >= yesterday) {
        current = 1;
        for (let i=sorted.length-2; i>=0; i--) {
          if ((new Date(sorted[i+1]) - new Date(sorted[i])) / 86400000 === 1) current++;
          else break;
        }
      }

      resolve({ current, longest: Math.max(longest, current), total: userDates.size });
    });
  });
}

function getBadge(streak) {
  let badge = null;
  for (const b of STREAK_BADGES) { if (streak >= b.days) badge = b; }
  return badge;
}

function renderStreakCard(data, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const badge = getBadge(data.current);
  el.innerHTML = `
    <div class="streak-wrap">
      <div>
        <div class="streak-num">${data.current}</div>
        <div class="streak-info">
          <div class="streak-label">Hari berturut-turut</div>
          <div class="streak-sub">Terpanjang: ${data.longest} hari · Total aktif: ${data.total} hari</div>
        </div>
      </div>
      ${badge ? `
      <div class="streak-badge">
        <div class="sb-emoji">${badge.emoji}</div>
        <div class="sb-label">${badge.label}</div>
      </div>` : ""}
    </div>
    ${data.current === 0 ? `<div style="margin-top:10px;font-size:12px;color:var(--text-3);">⚠️ Streak putus! Isi jurnal hari ini untuk mulai lagi.</div>` : ""}
  `;
}

// Push notif
async function requestNotifPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  return (await Notification.requestPermission()) === "granted";
}

function scheduleReminderNotif(userName) {
  if (!("Notification" in window)) return;
  const now    = new Date();
  const target = new Date(); target.setHours(17,0,0,0);
  if (now >= target) target.setDate(target.getDate()+1);
  const msLeft = target - now;
  setTimeout(async () => {
    const todayStr = new Date().toISOString().slice(0,10);
    journalRef().orderByChild("tanggal").equalTo(todayStr).once("value", snap => {
      let filled = false;
      snap.forEach(c => { if (c.val().userName === userName) filled = true; });
      if (!filled && Notification.permission === "granted") {
        new Notification("📓 PKL Journal Reminder", {
          body: `Hei ${userName}! Jangan lupa isi jurnal PKL hari ini! 🔥`,
          tag: "pkl-reminder"
        });
      }
      scheduleReminderNotif(userName);
    });
  }, msLeft);
}

function scheduleTelegramReminder(userName) {
  const now    = new Date();
  const target = new Date(); target.setHours(17,0,0,0);
  if (now >= target) target.setDate(target.getDate()+1);
  setTimeout(() => {
    const todayStr = new Date().toISOString().slice(0,10);
    journalRef().orderByChild("tanggal").equalTo(todayStr).once("value", snap => {
      let filled = false;
      snap.forEach(c => { if (c.val().userName === userName) filled = true; });
      if (!filled) {
        sendTelegram(`⏰ <b>REMINDER — PKL Journal</b>\n\n👤 <b>${userName}</b> belum isi jurnal hari ini!\n📅 ${new Date().toLocaleDateString("id-ID",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}\n\n<i>Segera buka PKL Journal dan catat kegiatanmu! 📓</i>`);
      }
      scheduleTelegramReminder(userName);
    });
  }, target - now);
}

async function initNotifications(userName) {
  const granted = await requestNotifPermission();
  if (granted) scheduleReminderNotif(userName);
  scheduleTelegramReminder(userName);
}

// Weekly digest — Jumat jam 16:00
function scheduleWeeklyDigest(userName) {
  const now    = new Date();
  const target = new Date();
  // Next Friday 16:00
  const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7;
  target.setDate(now.getDate() + daysUntilFriday);
  target.setHours(16,0,0,0);
  setTimeout(() => {
    sendWeeklyDigest();
    scheduleWeeklyDigest(userName);
  }, target - now);
}

async function sendWeeklyDigest() {
  // Kumpulkan data minggu ini
  const now  = new Date();
  const mon  = new Date(now); mon.setDate(now.getDate() - now.getDay() + 1); mon.setHours(0,0,0,0);
  const USERS_LIST = [
    { uid:"user_shandy",  name:"Shandy" },
    { uid:"user_sabrina", name:"Sabrina" },
    { uid:"user_fahri",   name:"Fahri" },
  ];

  journalRef().once("value", async snap => {
    const stats = {};
    USERS_LIST.forEach(u => stats[u.uid] = { entries:0, days:new Set() });
    snap.forEach(c => {
      const d = c.val();
      if (d.createdAt >= mon.getTime() && stats[d.uid]) {
        stats[d.uid].entries++;
        if (d.tanggal) stats[d.uid].days.add(d.tanggal);
      }
    });

    const lines = USERS_LIST.map(u => {
      const s = stats[u.uid];
      return `👤 <b>${u.name}:</b> ${s.entries} entri · ${s.days.size} hari`;
    }).join("\n");

    await sendTelegram(`📊 <b>WEEKLY DIGEST — PKL Journal</b>\n\n📅 Minggu ini (${mon.toLocaleDateString("id-ID")} – ${now.toLocaleDateString("id-ID")})\n\n${lines}\n\n📓 <i>Sentra Computer · PKL 2026</i>`);
  });
}
