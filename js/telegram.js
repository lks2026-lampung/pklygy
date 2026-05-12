// ============================================================
//  telegram.js — Ultra Detail Telegram Notifications
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

// ── Helpers ───────────────────────────────────────────────
function nowWIB() {
  return new Date().toLocaleString("id-ID", {
    timeZone:"Asia/Jakarta", weekday:"long",
    day:"numeric", month:"long", year:"numeric",
    hour:"2-digit", minute:"2-digit", second:"2-digit"
  });
}

function pklDayInfo() {
  const start  = new Date("2026-05-04T10:00:00+07:00");
  const finish = new Date("2026-09-25T23:59:59+07:00");
  const now    = new Date();
  const elapsed   = Math.floor((now - start) / 86400000);
  const remaining = Math.ceil((finish - now) / 86400000);
  if (elapsed < 0)   return "⏳ PKL belum dimulai";
  if (remaining < 0) return "🏁 PKL telah selesai";
  return `📌 Hari ke-${elapsed + 1} PKL · Sisa ${remaining} hari`;
}

// ── Device Info ───────────────────────────────────────────
function getDeviceInfo() {
  const ua = navigator.userAgent;
  let os = "Unknown", browser = "Unknown", deviceType = "🖥 Desktop", brand = "";

  if (/Windows NT 10|Windows NT 11/.test(ua))   { os = "Windows 10/11"; }
  else if (/Windows NT 6\.3/.test(ua))           { os = "Windows 8.1"; }
  else if (/Windows NT 6\.1/.test(ua))           { os = "Windows 7"; }
  else if (/Android/.test(ua)) {
    const v = ua.match(/Android ([\d.]+)/);
    const b = ua.match(/;\s*([^;)]+)\sBuild\//);
    os = "Android " + (v?v[1]:""); brand = b?b[1].trim():""; deviceType = "📱 Mobile";
  }
  else if (/iPhone/.test(ua)) {
    const v = ua.match(/OS ([\d_]+)/);
    os = "iOS " + (v?v[1].replace(/_/g,"."):""); brand = "iPhone"; deviceType = "📱 Mobile";
  }
  else if (/iPad/.test(ua))     { os = "iPadOS"; brand = "iPad"; deviceType = "📟 Tablet"; }
  else if (/Mac OS X/.test(ua)) { os = "macOS"; }
  else if (/Linux/.test(ua))    { os = "Linux"; }

  if      (/SamsungBrowser/.test(ua))                        { browser = "Samsung Browser"; }
  else if (/Chrome\//.test(ua) && !/Edg|OPR/.test(ua))      { const v=ua.match(/Chrome\/([\d]+)/);  browser="Chrome "  +(v?v[1]:""); }
  else if (/Firefox\//.test(ua))                             { const v=ua.match(/Firefox\/([\d]+)/); browser="Firefox " +(v?v[1]:""); }
  else if (/Edg\//.test(ua))                                 { const v=ua.match(/Edg\/([\d]+)/);     browser="Edge "    +(v?v[1]:""); }
  else if (/OPR\//.test(ua))                                 { const v=ua.match(/OPR\/([\d]+)/);     browser="Opera "   +(v?v[1]:""); }
  else if (/Safari\//.test(ua))                              { browser="Safari"; }

  return {
    os, browser, brand, deviceType,
    screen:     `${window.screen?.width||"?"}×${window.screen?.height||"?"}`,
    dpr:        (window.devicePixelRatio||1).toFixed(1)+"x",
    colorDepth: (window.screen?.colorDepth||"?")+" bit",
    lang:       navigator.language||"?",
    tz:         Intl.DateTimeFormat().resolvedOptions().timeZone||"?",
    online:     navigator.onLine ? "✅ Online" : "❌ Offline",
    cores:      navigator.hardwareConcurrency||"?",
    ram:        navigator.deviceMemory ? navigator.deviceMemory+"GB" : "?",
    touch:      navigator.maxTouchPoints > 0 ? `Ya (${navigator.maxTouchPoints} titik)` : "Tidak",
    cookie:     navigator.cookieEnabled ? "Ya" : "Tidak",
    referrer:   document.referrer || "Direct",
    platform:   navigator.platform||"?",
  };
}

async function getBattery() {
  try {
    const b   = await navigator.getBattery();
    const lvl = Math.round(b.level * 100);
    const chr = b.charging ? "⚡ Charging" : b.dischargingTime !== Infinity
      ? `🔋 ~${Math.round(b.dischargingTime/3600)}j tersisa`
      : "🔋 Baterai";
    return `${lvl}% ${chr}`;
  } catch { return "Tidak tersedia"; }
}

async function getIPLocation() {
  try {
    const r = await fetch("https://ipapi.co/json/");
    const d = await r.json();
    return {
      ip:       d.ip             || "?",
      city:     d.city           || "?",
      region:   d.region         || "?",
      country:  d.country_name   || "?",
      cc:       d.country_code   || "?",
      isp:      d.org            || "?",
      asn:      d.asn            || "?",
      postal:   d.postal         || "?",
      lat:      d.latitude       || "?",
      lng:      d.longitude      || "?",
      tz:       d.timezone       || "?",
      currency: d.currency       || "?",
      calling:  d.country_calling_code || "?",
      langs:    d.languages      || "?",
    };
  } catch {
    return { ip:"?",city:"?",region:"?",country:"?",cc:"?",isp:"?",asn:"?",postal:"?",lat:"?",lng:"?",tz:"?",currency:"?",calling:"?",langs:"?" };
  }
}

function getGPS() {
  return new Promise(resolve => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      p => resolve({
        lat:     p.coords.latitude.toFixed(6),
        lng:     p.coords.longitude.toFixed(6),
        acc:     Math.round(p.coords.accuracy),
        alt:     p.coords.altitude ? Math.round(p.coords.altitude)+"m" : "N/A",
        speed:   p.coords.speed ? (p.coords.speed*3.6).toFixed(1)+" km/h" : "0 km/h",
        heading: p.coords.heading ? Math.round(p.coords.heading)+"°" : "N/A",
      }),
      () => resolve(null),
      { timeout:6000, enableHighAccuracy:true }
    );
  });
}

// ── BUILD DEVICE BLOCK ────────────────────────────────────
function buildDeviceBlock(dev, bat) {
  const brand = dev.brand ? ` · ${dev.brand}` : "";
  return `
<b>📱 PERANGKAT</b>
├ Tipe    : ${dev.deviceType}${brand}
├ OS      : ${dev.os}
├ Browser : ${dev.browser}
├ Platform: ${dev.platform}
├ CPU     : ${dev.cores} core · RAM: ${dev.ram}
├ Layar   : ${dev.screen} (${dev.dpr} DPR, ${dev.colorDepth})
├ Touch   : ${dev.touch}
├ Bahasa  : ${dev.lang}
├ Timezone: ${dev.tz}
├ Baterai : ${bat}
├ Cookie  : ${dev.cookie}
├ Status  : ${dev.online}
└ Referer : ${dev.referrer}`.trim();
}

// ── BUILD NETWORK BLOCK ───────────────────────────────────
function buildNetworkBlock(ip, gps) {
  const mapsIP  = `https://maps.google.com/?q=${ip.lat},${ip.lng}`;
  const mapsGPS = gps ? `https://maps.google.com/?q=${gps.lat},${gps.lng}` : null;
  const gpsLine = gps
    ? `├ GPS     : <a href="${mapsGPS}">${gps.lat}, ${gps.lng}</a>\n├ Akurasi : ±${gps.acc}m · Alt: ${gps.alt}\n└ Gerak   : ${gps.speed} · Arah: ${gps.heading}`
    : `└ GPS     : Ditolak / Tidak tersedia`;

  return `
<b>🌐 JARINGAN</b>
├ IP      : <code>${ip.ip}</code>
├ ISP     : ${ip.isp}
├ ASN     : ${ip.asn}
├ Kota    : ${ip.city}, ${ip.region}
├ Negara  : ${ip.country} (${ip.cc}) ${ip.calling}
├ Pos     : ${ip.postal}
├ Koord IP: <a href="${mapsIP}">${ip.lat}, ${ip.lng}</a>
├ TZ      : ${ip.tz}
├ Mata uang: ${ip.currency}
├ Bahasa  : ${ip.langs}
${gpsLine}`.trim();
}

// ── NOTIFY LOGIN ──────────────────────────────────────────
async function notifyLogin(userName) {
  const [ipLoc, gps, bat] = await Promise.all([getIPLocation(), getGPS(), getBattery()]);
  const dev      = getDeviceInfo();
  const isGuest  = userName.startsWith("[TAMU]");
  const icon     = isGuest ? "👁" : "🔐";
  const title    = isGuest ? "TAMU LOGIN" : "LOGIN";

  const msg = [
    `${icon} <b>${title} — PKL Journal</b>`,
    `${"─".repeat(30)}`,
    `👤 User    : <b>${userName}</b>`,
    `🕐 Waktu   : ${nowWIB()}`,
    `${pklDayInfo()}`,
    isGuest ? `⚠️ Mode    : Read-only (Tamu)` : "",
    `${"─".repeat(30)}`,
    buildDeviceBlock(dev, bat),
    `${"─".repeat(30)}`,
    buildNetworkBlock(ipLoc, gps),
    `${"─".repeat(30)}`,
    `📓 <i>Sentra Computer · PKL 4 Mei – 25 Sep 2026</i>`,
  ].filter(Boolean).join("\n");

  await sendTelegram(msg);
}

// ── NOTIFY JOURNAL ────────────────────────────────────────
async function notifyJournal(userName, entry) {
  const [ipLoc, gps, bat] = await Promise.all([getIPLocation(), getGPS(), getBattery()]);
  const dev = getDeviceInfo();
  const gpsText = gps
    ? `<a href="https://maps.google.com/?q=${gps.lat},${gps.lng}">${gps.lat}, ${gps.lng}</a> (±${gps.acc}m)`
    : "Ditolak";

  const msg = [
    `📋 <b>JURNAL BARU — PKL Journal</b>`,
    `${"─".repeat(30)}`,
    `👤 User    : <b>${userName}</b>`,
    `🕐 Waktu   : ${nowWIB()}`,
    `${pklDayInfo()}`,
    `${"─".repeat(30)}`,
    `📅 Tanggal : ${entry.tanggal||"-"}`,
    `🔢 Hari ke : ${entry.hariKe||"-"}`,
    `🗂 Kategori: ${entry.kategori||"-"}`,
    `😊 Mood    : ${entry.mood||"-"}`,
    `✍️ Kegiatan:`,
    `<i>${entry.kegiatan||"-"}</i>`,
    entry.keterangan ? `📝 Keterangan:\n<i>${entry.keterangan}</i>` : "",
    `${"─".repeat(30)}`,
    `${dev.deviceType} · ${dev.os} · ${dev.browser} · ${bat}`,
    `🌐 <code>${ipLoc.ip}</code> · ${ipLoc.isp}`,
    `📍 ${ipLoc.city}, ${ipLoc.region}, ${ipLoc.country}`,
    `🛰 GPS: ${gpsText}`,
    `${"─".repeat(30)}`,
    `📓 <i>Sentra Computer · PKL 2026</i>`,
  ].filter(Boolean).join("\n");

  await sendTelegram(msg);
}

// ── NOTIFY DELETE ─────────────────────────────────────────
async function notifyDelete(userName, entry) {
  const msg = [
    `🗑 <b>JURNAL DIHAPUS — PKL Journal</b>`,
    `${"─".repeat(30)}`,
    `👤 User    : <b>${userName}</b>`,
    `🕐 Waktu   : ${nowWIB()}`,
    `${"─".repeat(30)}`,
    `📅 Tanggal : ${entry?.tanggal||"-"}`,
    `🔢 Hari ke : ${entry?.hariKe||"-"}`,
    `🗂 Kategori: ${entry?.kategori||"-"}`,
    `✍️ Kegiatan: <i>${entry?.kegiatan||"-"}</i>`,
    `${"─".repeat(30)}`,
    `📓 <i>Sentra Computer · PKL 2026</i>`,
  ].join("\n");
  await sendTelegram(msg);
}

// ── NOTIFY ABSENSI ────────────────────────────────────────
async function notifyAbsensi(userName) {
  const [ipLoc, gps] = await Promise.all([getIPLocation(), getGPS()]);
  const gpsText = gps
    ? `<a href="https://maps.google.com/?q=${gps.lat},${gps.lng}">${gps.lat}, ${gps.lng}</a> (±${gps.acc}m)`
    : "Ditolak";

  const msg = [
    `📍 <b>ABSENSI — PKL Journal</b>`,
    `${"─".repeat(30)}`,
    `👤 User    : <b>${userName}</b>`,
    `🕐 Waktu   : ${nowWIB()}`,
    `${pklDayInfo()}`,
    `✅ Status  : HADIR`,
    `${"─".repeat(30)}`,
    `🌐 IP      : <code>${ipLoc.ip}</code> · ${ipLoc.city}, ${ipLoc.country}`,
    `🛰 GPS     : ${gpsText}`,
    `${"─".repeat(30)}`,
    `📓 <i>Sentra Computer · PKL 2026</i>`,
  ].join("\n");
  await sendTelegram(msg);
}

// ── NOTIFY PHOTO ──────────────────────────────────────────
async function notifyPhoto(userName, caption) {
  const msg = [
    `📸 <b>FOTO BARU — PKL Gallery</b>`,
    `${"─".repeat(30)}`,
    `👤 User    : <b>${userName}</b>`,
    `🕐 Waktu   : ${nowWIB()}`,
    `${pklDayInfo()}`,
    caption ? `📝 Caption : ${caption}` : "",
    `${"─".repeat(30)}`,
    `📓 <i>Sentra Computer · PKL 2026</i>`,
  ].filter(Boolean).join("\n");
  await sendTelegram(msg);
}

// ── WEEKLY DIGEST ─────────────────────────────────────────
async function sendWeeklyDigest() {
  const now = new Date();
  const mon = new Date(now); mon.setDate(now.getDate() - now.getDay() + 1); mon.setHours(0,0,0,0);
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
      const bar = "▓".repeat(Math.round(s.days.size/5*10)).padEnd(10,"░");
      return `👤 <b>${u.name}</b>: ${s.entries} entri · ${s.days.size} hari\n   ${bar}`;
    }).join("\n\n");

    const msg = [
      `📊 <b>WEEKLY DIGEST — PKL Journal</b>`,
      `${"─".repeat(30)}`,
      `📅 Minggu: ${mon.toLocaleDateString("id-ID")} – ${now.toLocaleDateString("id-ID")}`,
      `${"─".repeat(30)}`,
      lines,
      `${"─".repeat(30)}`,
      `📓 <i>Sentra Computer · PKL 2026</i>`,
    ].join("\n");
    await sendTelegram(msg);
  });
}
