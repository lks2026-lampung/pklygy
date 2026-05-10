// ============================================================
//  journal.js — CRUD Jurnal PKL
// ============================================================

const MOOD_MAP = {
  produktif: { emoji: "🔥", label: "Produktif" },
  seru:      { emoji: "⚡", label: "Seru Banget" },
  belajar:   { emoji: "🧠", label: "Banyak Belajar" },
  biasa:     { emoji: "😐", label: "Biasa Aja" },
  lelah:     { emoji: "😴", label: "Lelah" }
};

let editingKey = null;

async function saveEntry(uid, data) {
  const ref = journalRef();
  if (editingKey) {
    await ref.child(editingKey).update({ ...data, updatedAt: Date.now() });
    editingKey = null;
  } else {
    await ref.push({ ...data, createdAt: Date.now(), updatedAt: Date.now() });
  }
}

async function deleteEntry(uid, key) {
  await journalRef().child(key).remove();
}

function loadEntries(uid, filterMonth, filterKat, callback) {
  journalRef().orderByChild("createdAt").on("value", snap => {
    const entries = [];
    snap.forEach(child => {
      const d = child.val();
      const okMonth = !filterMonth || (d.tanggal||"").startsWith(filterMonth);
      const okKat   = !filterKat   || d.kategori === filterKat;
      if (okMonth && okKat) entries.unshift({ key: child.key, ...d });
    });
    callback(entries);
  });
}

function countEntries(uid, cb) { journalRef().once("value", s => cb(s.numChildren())); }

function weekStreak(uid, cb) {
  const now = new Date(), day = now.getDay()===0?7:now.getDay();
  const mon = new Date(now - (day-1)*86400000); mon.setHours(0,0,0,0);
  journalRef().once("value", snap => {
    const days = new Set();
    snap.forEach(c => {
      const d = c.val();
      if (d.uid !== uid) return;
      const ts = d.createdAt;
      if(ts>=mon.getTime()){ const dt=new Date(ts); days.add(`${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`); }
    });
    cb(days.size);
  });
}

function buildEntryRow(e, i, currentUid) {
  const mood = MOOD_MAP[e.mood] || { emoji: "❓", label: "-" };
  const isOwn = e.uid === currentUid;
  const USER_COLORS = { user_shandy:"#cc0000", user_sabrina:"#8844aa", user_fahri:"#1a6699" };
  const nameColor = USER_COLORS[e.uid] || "var(--text-2)";
  return `
  <tr class="entry-row" data-key="${e.key}">
    <td class="td-num">${i}</td>
    <td class="td-date">${e.tanggal||"-"}</td>
    <td class="td-hari">${e.hariKe||"-"}</td>
    <td style="white-space:nowrap;"><span style="color:${nameColor};font-weight:600;font-size:11px;">${e.nama||"-"}</span></td>
    <td class="td-kat"><span class="badge badge-${(e.kategori||"lainnya").toLowerCase()}">${e.kategori||"-"}</span></td>
    <td class="td-kegiatan">${escHtml(e.kegiatan||"")}</td>
    <td class="td-ket">${escHtml(e.keterangan||"-")}</td>
    <td class="td-mood" title="${mood.label}">${mood.emoji}</td>
    <td class="td-actions">
      ${isOwn ? `
        <button class="btn-icon btn-edit" onclick="startEdit('${e.key}')" title="Edit">✏️</button>
        <button class="btn-icon btn-del"  onclick="confirmDelete('${e.key}')" title="Hapus">🗑️</button>
      ` : `<span style="color:var(--text-3);font-size:10px;">—</span>`}
    </td>
  </tr>`;
}

function escHtml(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function startEdit(key) {
  const uid = getSession().uid;
  journalRef(uid).child(key).once("value", snap => {
    const d = snap.val(); editingKey = key;
    document.getElementById("f-tanggal").value    = d.tanggal||"";
    document.getElementById("f-hariKe").value     = d.hariKe||"";
    document.getElementById("f-kegiatan").value   = d.kegiatan||"";
    document.getElementById("f-keterangan").value = d.keterangan||"";
    setChip("kat-chips",  d.kategori);
    setChip("mood-chips", d.mood);
    document.getElementById("form-title").textContent = "✏️ Edit Entri";
    document.getElementById("btn-submit").textContent = "Simpan Perubahan";
    document.getElementById("btn-cancel-edit").style.display = "inline-flex";
    document.getElementById("jurnal-form").scrollIntoView({ behavior:"smooth" });
    updateCharCount();
  });
}

function cancelEdit() {
  editingKey = null;
  document.getElementById("jurnal-form").reset();
  document.getElementById("form-title").textContent = "☠ Tambah Kegiatan";
  document.getElementById("btn-submit").textContent = "Simpan Jurnal";
  document.getElementById("btn-cancel-edit").style.display = "none";
  updateCharCount();
}

function setChip(groupId, value) {
  document.querySelectorAll(`#${groupId} .chip`).forEach(c => c.classList.toggle("active", c.dataset.value===value));
}

function getChip(groupId) {
  const a = document.querySelector(`#${groupId} .chip.active`);
  return a ? a.dataset.value : null;
}

function updateCharCount() {
  const ta = document.getElementById("f-kegiatan");
  const el = document.getElementById("char-count");
  if (ta && el) el.textContent = (ta.value||"").length;
}

function confirmDelete(key) {
  if (confirm("Hapus entri ini? Data hilang selamanya...")) {
    const session = getSession();
    const uid = session.uid;
    // Ambil data dulu untuk notif telegram
    journalRef().child(key).once("value", snap => {
      const d = snap.val();
      deleteEntry(uid, key).then(() => {
        // Notif telegram
        const msg = `🗑 <b>JURNAL DIHAPUS — PKL Journal</b>\n\n👤 <b>${session.display}</b>\n📅 ${d?.tanggal||"-"} · Hari ke-${d?.hariKe||"-"}\n✍️ ${d?.kegiatan||"-"}\n🕐 ${new Date().toLocaleString("id-ID",{timeZone:"Asia/Jakarta"})}\n\n<i>Sentra Computer · PKL 2026</i>`;
        sendTelegram(msg);
      });
    });
  }
}
