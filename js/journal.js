// journal.js — CRUD Jurnal PKL
const MOOD_MAP = {
  produktif:{emoji:"🔥",label:"Produktif"},
  seru:     {emoji:"⚡",label:"Seru Banget"},
  belajar:  {emoji:"🧠",label:"Banyak Belajar"},
  biasa:    {emoji:"😐",label:"Biasa Aja"},
  lelah:    {emoji:"😴",label:"Lelah"}
};

let editingKey = null;

async function saveEntry(uid, data) {
  const ref = journalRef();
  if (editingKey) {
    await ref.child(editingKey).update({...data, updatedAt:Date.now()});
    editingKey = null;
  } else {
    await ref.push({...data, createdAt:Date.now(), updatedAt:Date.now()});
  }
}

async function deleteEntry(uid, key) { await journalRef().child(key).remove(); }

function loadEntries(uid, filterMonth, filterKat, callback) {
  journalRef().orderByChild("createdAt").on("value", snap => {
    const entries = [];
    snap.forEach(child => {
      const d = child.val();
      const okMonth = !filterMonth || (d.tanggal||"").startsWith(filterMonth);
      const okKat   = !filterKat   || d.kategori === filterKat;
      if (okMonth && okKat) entries.unshift({key:child.key, ...d});
    });
    callback(entries);
  });
}

function countEntries(uid, cb) {
  journalRef().once("value", s => {
    let count = 0;
    s.forEach(c => { if(c.val().uid===uid) count++; });
    cb(count);
  });
}

function weekStreak(uid, cb) {
  const now = new Date(), day = now.getDay()===0?7:now.getDay();
  const mon = new Date(now-(day-1)*86400000); mon.setHours(0,0,0,0);
  journalRef().once("value", snap => {
    const days = new Set();
    snap.forEach(c => {
      const v = c.val();
      if(v.uid===uid && v.createdAt>=mon.getTime()) {
        const d=new Date(v.createdAt);
        days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
      }
    });
    cb(days.size);
  });
}

function startEdit(key) {
  const session = getSession();
  journalRef().child(key).once("value", snap => {
    const d = snap.val();
    editingKey = key;
    document.getElementById("f-tanggal").value    = d.tanggal||"";
    document.getElementById("f-hariKe").value     = d.hariKe||"";
    document.getElementById("f-kegiatan").value   = d.kegiatan||"";
    document.getElementById("f-keterangan").value = d.keterangan||"";
    setChip("kat-chips",  d.kategori);
    setChip("mood-chips", d.mood);
    document.getElementById("form-title").textContent  = "Edit Kegiatan";
    document.getElementById("btn-submit").textContent  = "Simpan Perubahan";
    document.getElementById("btn-cancel-edit").style.display = "inline-flex";
    document.getElementById("jurnal-form").scrollIntoView({behavior:"smooth"});
    updateCharCount();
  });
}

function cancelEdit() {
  editingKey = null;
  const form = document.getElementById("jurnal-form");
  if (form) form.reset();
  const ft = document.getElementById("form-title");
  if (ft) ft.textContent = "Tambah Kegiatan";
  const bs = document.getElementById("btn-submit");
  if (bs) bs.textContent = "Simpan Jurnal";
  const bc = document.getElementById("btn-cancel-edit");
  if (bc) bc.style.display = "none";
  updateCharCount();
}

function setChip(groupId, value) {
  document.querySelectorAll(`#${groupId} .chip`).forEach(c => c.classList.toggle("on", c.dataset.value===value));
}

function getChip(groupId) {
  const a = document.querySelector(`#${groupId} .chip.on`);
  return a ? a.dataset.value : null;
}

function updateCharCount() {
  const ta = document.getElementById("f-kegiatan");
  const el = document.getElementById("char-count");
  if (ta && el) el.textContent = (ta.value||"").length;
}

function confirmDelete(key) {
  if (!confirm("Hapus entri ini? Tidak bisa dibatalkan.")) return;
  const session = getSession();
  journalRef().child(key).once("value", snap => {
    const d = snap.val();
    deleteEntry(session.uid, key).then(() => {
      notifyDelete(session.display, d);
    });
  });
}

function escHtml(s) {
  return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
