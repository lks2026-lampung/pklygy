// ============================================================
//  absensi.js — Absensi harian PKL
// ============================================================

function getTodayStr() {
  return new Date().toISOString().slice(0,10);
}

function todayDateLabel() {
  return new Date().toLocaleDateString("id-ID", {
    weekday:"long", year:"numeric", month:"long", day:"numeric"
  });
}

// Check apakah user sudah absen hari ini
async function checkAbsensiToday(uid) {
  const today = getTodayStr();
  return new Promise(resolve => {
    absensiRef().child(`${today}/${uid}`).once("value", snap => resolve(snap.exists()));
  });
}

// Simpan absensi
async function doAbsensi(uid, userName) {
  const today = getTodayStr();
  const now   = new Date();
  const timeStr = now.toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit", second:"2-digit" });

  await absensiRef().child(`${today}/${uid}`).set({
    userName,
    uid,
    tanggal:   today,
    jam:       timeStr,
    timestamp: Date.now()
  });
}

// Load rekap absensi semua user untuk 1 bulan
function loadAbsensiMonth(month, callback) {
  // month format: "2026-05"
  absensiRef().once("value", snap => {
    const data = {};
    snap.forEach(dateSnap => {
      const date = dateSnap.key;
      if (!date.startsWith(month)) return;
      data[date] = {};
      dateSnap.forEach(userSnap => {
        data[date][userSnap.key] = userSnap.val();
      });
    });
    callback(data);
  });
}

// Load semua absensi untuk summary
function loadAbsensiAll(callback) {
  absensiRef().once("value", snap => {
    const data = {};
    snap.forEach(dateSnap => {
      data[dateSnap.key] = {};
      dateSnap.forEach(userSnap => {
        data[dateSnap.key][userSnap.key] = userSnap.val();
      });
    });
    callback(data);
  });
}

// Render status absensi hari ini
async function renderAbsensiStatus(uid, userName, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const sudahAbsen = await checkAbsensiToday(uid);

  if (sudahAbsen) {
    const snap = await absensiRef().child(`${getTodayStr()}/${uid}`).once("value");
    const d    = snap.val();
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:rgba(38,166,154,0.08);border:1px solid rgba(38,166,154,0.3);border-radius:var(--radius);">
        <span style="font-size:24px;">✅</span>
        <div>
          <div style="font-size:13px;color:var(--green);font-weight:600;">Sudah Absen Hari Ini</div>
          <div style="font-size:11px;color:var(--text-3);margin-top:2px;">${todayDateLabel()} · Jam ${d?.jam || "-"}</div>
        </div>
      </div>`;
  } else {
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
        <div style="flex:1;">
          <div style="font-size:13px;color:var(--text-2);">Belum absen hari ini</div>
          <div style="font-size:11px;color:var(--text-3);margin-top:2px;">${todayDateLabel()}</div>
        </div>
        <button class="btn btn-primary" id="btn-absen" onclick="handleAbsen()">
          📍 Absen Sekarang
        </button>
      </div>`;
  }
}

async function handleAbsen() {
  const user = getSession();
  if (!user) return;
  const btn = document.getElementById("btn-absen");
  if (btn) { btn.disabled = true; btn.textContent = "Menyimpan..."; }

  try {
    await doAbsensi(user.uid, user.display);
    showToast(`Absensi ${user.display} berhasil! ✅`, "success");

    // Notif telegram
    const msg = `📍 <b>ABSENSI — PKL Journal</b>\n\n👤 <b>${user.display}</b>\n📅 ${todayDateLabel()}\n🕐 Jam: ${new Date().toLocaleTimeString("id-ID")}\n✅ <b>Hadir</b>\n\n<i>Sentra Computer · PKL 2026</i>`;
    sendTelegram(msg);

    // Re-render
    renderAbsensiStatus(user.uid, user.display, "absensi-status");
  } catch(e) {
    showToast("Gagal absen: " + e.message, "error");
    if (btn) { btn.disabled = false; btn.textContent = "📍 Absen Sekarang"; }
  }
}
