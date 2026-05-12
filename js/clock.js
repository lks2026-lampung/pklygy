// clock.js — Jam Digital & Timer PKL

const PKL_START  = new Date("2026-05-04T10:00:00+07:00");
const PKL_FINISH = new Date("2026-09-25T23:59:59+07:00");

const HARI_ID  = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const BULAN_ID = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

// Hari libur custom — bisa ditambah dari settings
// Format: "YYYY-MM-DD"
let CUSTOM_HOLIDAYS = JSON.parse(localStorage.getItem("pkl_holidays") || "[]");
// Default weekend = Sabtu & Minggu
let HOLIDAY_DAYS = JSON.parse(localStorage.getItem("pkl_holiday_days") || "[0,6]");

function isHoliday(date) {
  const d   = new Date(date);
  const day = d.getDay();
  const str = d.toISOString().slice(0,10);
  return HOLIDAY_DAYS.includes(day) || CUSTOM_HOLIDAYS.includes(str);
}

function countWorkdays(start, end) {
  let count = 0;
  const cur  = new Date(start);
  cur.setHours(0,0,0,0);
  const endD = new Date(end);
  endD.setHours(23,59,59,0);
  while (cur <= endD) {
    if (!isHoliday(cur)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function getHariKe(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00+07:00");
  if (d < PKL_START) return 0;
  return countWorkdays(PKL_START, d);
}

function tickClock() {
  const now = new Date();
  const hh  = String(now.getHours()).padStart(2,"0");
  const mm  = String(now.getMinutes()).padStart(2,"0");
  const ss  = String(now.getSeconds()).padStart(2,"0");

  const set = (id,v) => { const e=document.getElementById(id); if(e) e.textContent=v; };
  set("clock-hh", hh);
  set("clock-mm", mm);
  set("clock-ss", ss);
  set("clock-date", `${HARI_ID[now.getDay()]}, ${now.getDate()} ${BULAN_ID[now.getMonth()]} ${now.getFullYear()}`);

  tickTimer(now);
  tickShiftCountdown(now);
}

function tickTimer(now) {
  const elapsed  = now - PKL_START;
  if (elapsed < 0) return;
  const totalSec = Math.floor(elapsed / 1000);
  const days  = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins  = Math.floor((totalSec % 3600) / 60);
  const secs  = totalSec % 60;

  const set = (id,v) => { const e=document.getElementById(id); if(e) e.textContent=v; };
  set("timer-days",  String(days).padStart(3,"0"));
  set("timer-hours", String(hours).padStart(2,"0"));
  set("timer-mins",  String(mins).padStart(2,"0"));
  set("timer-secs",  String(secs).padStart(2,"0"));

  const total    = PKL_FINISH - PKL_START;
  const progress = Math.min((elapsed / total) * 100, 100).toFixed(2);
  const bar = document.getElementById("pkl-progress-bar");
  const pct = document.getElementById("pkl-progress-pct");
  if (bar) bar.style.width = progress + "%";
  if (pct) pct.textContent = progress + "%";

  const wd = document.getElementById("timer-workday");
  if (wd) wd.textContent = countWorkdays(PKL_START, now);
}

function tickShiftCountdown(now) {
  // Jam istirahat 12:00, jam pulang 17:00
  const breakTime  = new Date(now); breakTime.setHours(12,0,0,0);
  const finishTime = new Date(now); finishTime.setHours(17,0,0,0);

  const setShift = (id, target, pastClass) => {
    const el = document.getElementById(id);
    if (!el) return;
    const diff = target - now;
    if (diff <= 0) {
      el.textContent = "Sudah lewat";
      el.classList.add(pastClass||"shift-past");
    } else {
      const h = Math.floor(diff/3600000);
      const m = Math.floor((diff%3600000)/60000);
      const s = Math.floor((diff%60000)/1000);
      el.textContent = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
      el.classList.remove("shift-past");
    }
  };

  setShift("shift-break",  breakTime,  "shift-past");
  setShift("shift-finish", finishTime, "shift-past");
}

function startClock() {
  tickClock();
  setInterval(tickClock, 1000);
}
