// absensi.js — Absensi harian PKL

function getTodayStr() { return new Date().toISOString().slice(0,10); }

function todayLabel() {
  return new Date().toLocaleDateString("id-ID",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
}

async function checkAbsensiToday(uid) {
  const snap = await absensiRef().child(`${getTodayStr()}/${uid}`).once("value");
  return snap.exists();
}

async function doAbsensi(uid, userName) {
  const today   = getTodayStr();
  const timeStr = new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
  await absensiRef().child(`${today}/${uid}`).set({ userName, uid, tanggal:today, jam:timeStr, timestamp:Date.now() });
}

function loadAbsensiMonth(month, callback) {
  absensiRef().once("value", snap => {
    const data = {};
    snap.forEach(dateSnap => {
      if (!dateSnap.key.startsWith(month)) return;
      data[dateSnap.key] = {};
      dateSnap.forEach(u => { data[dateSnap.key][u.key] = u.val(); });
    });
    callback(data);
  });
}

function loadAbsensiAll(callback) {
  absensiRef().once("value", snap => {
    const data = {};
    snap.forEach(dateSnap => {
      data[dateSnap.key] = {};
      dateSnap.forEach(u => { data[dateSnap.key][u.key] = u.val(); });
    });
    callback(data);
  });
}

async function renderAbsensiStatus(uid, userName, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const sudah = await checkAbsensiToday(uid);
  if (sudah) {
    const snap = await absensiRef().child(`${getTodayStr()}/${uid}`).once("value");
    const d = snap.val();
    el.innerHTML = `
      <div class="absen-status-done">
        <span style="font-size:24px;">✅</span>
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--green);">Sudah Absen Hari Ini</div>
          <div style="font-size:11px;color:var(--text-3);margin-top:2px;">${todayLabel()} · Jam ${d?.jam||"-"}</div>
        </div>
      </div>`;
  } else {
    el.innerHTML = `
      <div class="absen-status-btn">
        <div>
          <div style="font-size:13px;font-weight:500;color:var(--text-2);">Belum absen hari ini</div>
          <div style="font-size:11px;color:var(--text-3);margin-top:2px;">${todayLabel()}</div>
        </div>
        <button class="btn btn-primary" id="btn-absen-now" onclick="handleAbsen()">📍 Absen Sekarang</button>
      </div>`;
  }
}

async function handleAbsen() {
  const session = getSession();
  if (!session) return;
  const btn = document.getElementById("btn-absen-now");
  if (btn) { btn.disabled=true; btn.innerHTML=`<span class="spinner"></span> Menyimpan...`; }
  try {
    await doAbsensi(session.uid, session.display);
    await notifyAbsensi(session.display);
    showToast(`Absensi ${session.display} berhasil! ✅`, "success");
    renderAbsensiStatus(session.uid, session.display, "absensi-status");
  } catch(e) {
    showToast("Gagal absen: "+e.message, "error");
    if (btn) { btn.disabled=false; btn.textContent="📍 Absen Sekarang"; }
  }
}
