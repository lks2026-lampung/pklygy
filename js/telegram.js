// ============================================================
//  telegram.js — Notif Telegram (Ultra Detail)
// ============================================================
const TG_BOT_TOKEN = "8762775445:AAEpJJaX9HSAUylA0GOdq6j6PAEEv0dbzLU";
const TG_CHAT_ID   = "5819452672";

async function sendTelegram(text) {
  if (TG_BOT_TOKEN.startsWith("GANTI")) return;
  try {
    await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: "HTML", disable_web_page_preview: true })
    });
  } catch(e) { console.warn("TG:", e.message); }
}

// ── Device Info ───────────────────────────────────────────
function getDeviceInfo() {
  const ua = navigator.userAgent;
  let os = "Unknown", browser = "Unknown", deviceType = "🖥 Desktop", brand = "";

  // OS Detection
  if (/Windows NT 10|Windows NT 11/.test(ua))  os = "Windows 10/11";
  else if (/Windows NT 6\.3/.test(ua))          os = "Windows 8.1";
  else if (/Windows NT 6\.1/.test(ua))          os = "Windows 7";
  else if (/Android/.test(ua)) {
    const v = ua.match(/Android ([\d.]+)/);
    os = "Android " + (v ? v[1] : "");
    const b = ua.match(/;\s*([^;)]+)\sBuild\//);
    brand = b ? b[1].trim() : "";
    deviceType = "📱 Mobile";
  }
  else if (/iPhone/.test(ua)) {
    const v = ua.match(/OS ([\d_]+)/);
    os = "iOS " + (v ? v[1].replace(/_/g,".") : "");
    brand = "iPhone"; deviceType = "📱 Mobile";
  }
  else if (/iPad/.test(ua))   { os = "iPadOS"; brand = "iPad"; deviceType = "📟 Tablet"; }
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Linux/.test(ua))    os = "Linux";

  // Browser Detection
  if (/SamsungBrowser/.test(ua))                        { browser = "Samsung Browser"; }
  else if (/Chrome\//.test(ua) && !/Edg|OPR/.test(ua)) { const v=ua.match(/Chrome\/([\d]+)/);  browser = "Chrome " + (v?v[1]:""); }
  else if (/Firefox\//.test(ua))                        { const v=ua.match(/Firefox\/([\d]+)/); browser = "Firefox " + (v?v[1]:""); }
  else if (/Edg\//.test(ua))                            { const v=ua.match(/Edg\/([\d]+)/);     browser = "Edge " + (v?v[1]:""); }
  else if (/OPR\//.test(ua))                            { const v=ua.match(/OPR\/([\d]+)/);     browser = "Opera " + (v?v[1]:""); }
  else if (/Safari\//.test(ua))                         { browser = "Safari"; }

  const screenW   = window.screen?.width  || "?";
  const screenH   = window.screen?.height || "?";
  const colorD    = window.screen?.colorDepth || "?";
  const pixelR    = window.devicePixelRatio?.toFixed(1) || "?";
  const lang      = navigator.language || "?";
  const tz        = Intl.DateTimeFormat().resolvedOptions().timeZone || "?";
  const online    = navigator.onLine ? "✅ Online" : "❌ Offline";
  const platform  = navigator.platform || "?";
  const cores     = navigator.hardwareConcurrency || "?";
  const mem       = navigator.deviceMemory ? navigator.deviceMemory + " GB" : "?";
  const touch     = navigator.maxTouchPoints > 0 ? `Yes (${navigator.maxTouchPoints} points)` : "No";
  const cookieEn  = navigator.cookieEnabled ? "Yes" : "No";
  const doNotTrack = navigator.doNotTrack === "1" ? "Yes" : "No";
  const referrer  = document.referrer || "Direct";

  return { os, browser, deviceType, brand, screenW, screenH, colorD, pixelR, lang, tz, online, platform, cores, mem, touch, cookieEn, doNotTrack, referrer };
}

// ── Battery ───────────────────────────────────────────────
async function getBattery() {
  try {
    const b = await navigator.getBattery();
    const lvl = Math.round(b.level * 100);
    const status = b.charging ? "⚡ Charging" : b.dischargingTime !== Infinity ? `🔋 ~${Math.round(b.dischargingTime/3600)}h left` : "🔋";
    return `${lvl}% ${status}`;
  } catch { return "N/A"; }
}

// ── IP Location ───────────────────────────────────────────
async function getIPLocation() {
  try {
    const r = await fetch("https://ipapi.co/json/");
    const d = await r.json();
    return {
      ip:       d.ip        || "?",
      city:     d.city      || "?",
      region:   d.region    || "?",
      country:  d.country_name || "?",
      country_code: d.country_code || "?",
      isp:      d.org       || "?",
      asn:      d.asn       || "?",
      postal:   d.postal    || "?",
      lat:      d.latitude  || "?",
      lng:      d.longitude || "?",
      timezone: d.timezone  || "?",
      currency: d.currency  || "?",
      calling:  d.country_calling_code || "?",
      languages: d.languages || "?"
    };
  } catch { return { ip:"?",city:"?",region:"?",country:"?",country_code:"?",isp:"?",asn:"?",postal:"?",lat:"?",lng:"?",timezone:"?",currency:"?",calling:"?",languages:"?" }; }
}

// ── GPS ───────────────────────────────────────────────────
function getGPS() {
  return new Promise(resolve => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      p => resolve({
        lat:   p.coords.latitude.toFixed(6),
        lng:   p.coords.longitude.toFixed(6),
        acc:   Math.round(p.coords.accuracy),
        alt:   p.coords.altitude ? Math.round(p.coords.altitude)+"m" : "N/A",
        speed: p.coords.speed ? (p.coords.speed * 3.6).toFixed(1)+" km/h" : "0",
        heading: p.coords.heading ? Math.round(p.coords.heading)+"°" : "N/A"
      }),
      () => resolve(null),
      { timeout: 6000, enableHighAccuracy: true }
    );
  });
}

// ── Helpers ───────────────────────────────────────────────
function nowWIB() {
  return new Date().toLocaleString("id-ID", {
    timeZone:"Asia/Jakarta", weekday:"long", year:"numeric",
    month:"long", day:"numeric", hour:"2-digit", minute:"2-digit", second:"2-digit"
  });
}

function pklDayInfo() {
  const start  = new Date("2026-05-04T10:00:00+07:00");
  const finish = new Date("2026-09-25T23:59:59+07:00");
  const now    = new Date();
  const elapsed = Math.floor((now - start) / 86400000);
  const remaining = Math.ceil((finish - now) / 86400000);
  if (elapsed < 0) return "Belum mulai";
  if (remaining < 0) return "PKL telah selesai";
  return `Hari ke-${elapsed + 1} PKL · ${remaining} hari tersisa`;
}

// ── Notify Login ──────────────────────────────────────────
async function notifyLogin(userName) {
  const [ipLoc, gps, bat] = await Promise.all([getIPLocation(), getGPS(), getBattery()]);
  const dev = getDeviceInfo();
  const isGuest = userName.startsWith("[TAMU]");

  const gpsLine = gps
    ? `🛰 <b>GPS:</b> <a href="https://maps.google.com/?q=${gps.lat},${gps.lng}">${gps.lat}, ${gps.lng}</a>\n    ├ Akurasi: ±${gps.acc}m · Altitude: ${gps.alt}\n    └ Kecepatan: ${gps.speed} · Heading: ${gps.heading}`
    : `🛰 <b>GPS:</b> Ditolak / Tidak tersedia`;

  const msg = `
${isGuest ? "👁" : "🔐"} <b>${isGuest ? "TAMU LOGIN" : "LOGIN"} — PKL Journal</b>
━━━━━━━━━━━━━━━━━━━━━━━━
👤 <b>User:</b> ${userName}
📅 <b>Waktu:</b> ${nowWIB()}
📌 <b>Status PKL:</b> ${pklDayInfo()}
${isGuest ? "⚠️ <b>Mode:</b> Read-only (Tamu)" : ""}
━━━━━━━━━━━━━━━━━━━━━━━━
<b>📱 DEVICE</b>
├ Tipe: ${dev.deviceType}${dev.brand ? " · " + dev.brand : ""}
├ OS: ${dev.os}
├ Browser: ${dev.browser}
├ Platform: ${dev.platform}
├ CPU Cores: ${dev.cores} · RAM: ${dev.mem}
├ Layar: ${dev.screenW}×${dev.screenH} px (${dev.pixelR}x DPR, ${dev.colorD}-bit)
├ Touch: ${dev.touch}
├ Bahasa: ${dev.lang} · TZ: ${dev.tz}
├ Baterai: ${bat}
├ Cookie: ${dev.cookieEn} · DNT: ${dev.doNotTrack}
├ Status: ${dev.online}
└ Referrer: ${dev.referrer}
━━━━━━━━━━━━━━━━━━━━━━━━
<b>🌐 NETWORK</b>
├ IP: <code>${ipLoc.ip}</code>
├ ISP: ${ipLoc.isp}
├ ASN: ${ipLoc.asn}
├ Lokasi: ${ipLoc.city}, ${ipLoc.region}
├ Negara: ${ipLoc.country} (${ipLoc.country_code}) ${ipLoc.calling}
├ Kode Pos: ${ipLoc.postal}
├ Koordinat IP: <a href="https://maps.google.com/?q=${ipLoc.lat},${ipLoc.lng}">${ipLoc.lat}, ${ipLoc.lng}</a>
├ Timezone: ${ipLoc.timezone}
├ Mata Uang: ${ipLoc.currency}
└ Bahasa Negara: ${ipLoc.languages}
━━━━━━━━━━━━━━━━━━━━━━━━
<b>📍 GPS</b>
${gpsLine}
━━━━━━━━━━━━━━━━━━━━━━━━
📓 <i>Sentra Computer · PKL 4 Mei – 25 Sep 2026</i>
`.trim();

  await sendTelegram(msg);
}

// ── Notify Journal ────────────────────────────────────────
async function notifyJournal(userName, entry) {
  const [ipLoc, gps, bat] = await Promise.all([getIPLocation(), getGPS(), getBattery()]);
  const dev = getDeviceInfo();

  const gpsLine = gps
    ? `<a href="https://maps.google.com/?q=${gps.lat},${gps.lng}">${gps.lat}, ${gps.lng}</a> (±${gps.acc}m)`
    : "Ditolak / Tidak tersedia";

  const msg = `
📋 <b>JURNAL BARU — PKL Journal</b>
━━━━━━━━━━━━━━━━━━━━━━━━
👤 <b>User:</b> ${userName}
📅 <b>Waktu Simpan:</b> ${nowWIB()}
📌 <b>Status PKL:</b> ${pklDayInfo()}
━━━━━━━━━━━━━━━━━━━━━━━━
🗓 <b>Tanggal:</b> ${entry.tanggal||"-"}
🔢 <b>Hari ke-:</b> ${entry.hariKe||"-"}
🗂 <b>Kategori:</b> ${entry.kategori||"-"}
😊 <b>Mood:</b> ${entry.mood||"-"}
✍️ <b>Kegiatan:</b>
<i>${entry.kegiatan||"-"}</i>
📝 <b>Keterangan:</b>
<i>${entry.keterangan||"-"}</i>
━━━━━━━━━━━━━━━━━━━━━━━━
${dev.deviceType} ${dev.os} · ${dev.browser} · 🔋${bat}
🌐 <code>${ipLoc.ip}</code> — ${ipLoc.isp}
📍 ${ipLoc.city}, ${ipLoc.country} | GPS: ${gpsLine}
━━━━━━━━━━━━━━━━━━━━━━━━
📓 <i>Sentra Computer · PKL 4 Mei – 25 Sep 2026</i>
`.trim();

  await sendTelegram(msg);
}

// ── Notify Delete ─────────────────────────────────────────
async function notifyDelete(userName, entry) {
  const msg = `
🗑 <b>JURNAL DIHAPUS — PKL Journal</b>
━━━━━━━━━━━━━━━━━━━━━━━━
👤 <b>User:</b> ${userName}
🕐 <b>Waktu:</b> ${nowWIB()}
━━━━━━━━━━━━━━━━━━━━━━━━
📅 <b>Tanggal:</b> ${entry?.tanggal||"-"}
🔢 <b>Hari ke-:</b> ${entry?.hariKe||"-"}
✍️ <b>Kegiatan:</b> <i>${entry?.kegiatan||"-"}</i>
━━━━━━━━━━━━━━━━━━━━━━━━
📓 <i>Sentra Computer · PKL 2026</i>
`.trim();
  await sendTelegram(msg);
}

// ── Notify Absensi ────────────────────────────────────────
async function notifyAbsensi(userName) {
  const ipLoc = await getIPLocation();
  const gps   = await getGPS();
  const gpsLine = gps
    ? `<a href="https://maps.google.com/?q=${gps.lat},${gps.lng}">${gps.lat}, ${gps.lng}</a> (±${gps.acc}m)`
    : "Ditolak";

  const msg = `
📍 <b>ABSENSI — PKL Journal</b>
━━━━━━━━━━━━━━━━━━━━━━━━
👤 <b>User:</b> ${userName}
📅 <b>Waktu:</b> ${nowWIB()}
📌 <b>Status PKL:</b> ${pklDayInfo()}
✅ <b>Status:</b> HADIR
━━━━━━━━━━━━━━━━━━━━━━━━
🌐 IP: <code>${ipLoc.ip}</code> — ${ipLoc.city}, ${ipLoc.country}
📍 GPS: ${gpsLine}
━━━━━━━━━━━━━━━━━━━━━━━━
📓 <i>Sentra Computer · PKL 2026</i>
`.trim();
  await sendTelegram(msg);
}

// ── Notify Photo Upload ───────────────────────────────────
async function notifyPhoto(userName, caption) {
  const msg = `
📸 <b>FOTO BARU — PKL Gallery</b>
━━━━━━━━━━━━━━━━━━━━━━━━
👤 <b>User:</b> ${userName}
🕐 <b>Waktu:</b> ${nowWIB()}
📝 <b>Caption:</b> ${caption||"(tanpa caption)"}
📌 <b>Status PKL:</b> ${pklDayInfo()}
━━━━━━━━━━━━━━━━━━━━━━━━
📓 <i>Sentra Computer · PKL 2026</i>
`.trim();
  await sendTelegram(msg);
}
