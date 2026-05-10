// ============================================================
//  clock.js — Jam Digital & Timer PKL
// ============================================================

const PKL_START  = new Date("2026-05-04T10:00:00+07:00");
const PKL_FINISH = new Date("2026-09-25T17:00:00+07:00");

const HARI_ID  = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const BULAN_ID = ["Januari","Februari","Maret","April","Mei","Juni",
                  "Juli","Agustus","September","Oktober","November","Desember"];

function tickClock() {
  const now = new Date();
  const hh  = String(now.getHours()).padStart(2,"0");
  const mm  = String(now.getMinutes()).padStart(2,"0");
  const ss  = String(now.getSeconds()).padStart(2,"0");

  const set = (id, val) => { const e = document.getElementById(id); if(e) e.textContent = val; };

  set("clock-hh", hh);
  set("clock-mm", mm);
  set("clock-ss", ss);
  set("clock-date", `${HARI_ID[now.getDay()]}, ${now.getDate()} ${BULAN_ID[now.getMonth()]} ${now.getFullYear()}`);

  const blink = now.getSeconds() % 2 === 0;
  document.querySelectorAll(".clock-colon").forEach(e => e.style.opacity = blink ? "1" : "0.2");

  tickTimer(now);
}

function tickTimer(now) {
  const elapsed  = now - PKL_START;
  if (elapsed < 0) return;

  const totalSec = Math.floor(elapsed / 1000);
  const days  = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins  = Math.floor((totalSec % 3600) / 60);
  const secs  = totalSec % 60;

  const set = (id, val) => { const e = document.getElementById(id); if(e) e.textContent = val; };
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

function countWorkdays(start, end) {
  let count = 0, cur = new Date(start);
  while (cur <= end) { const d = cur.getDay(); if(d!==0&&d!==6) count++; cur.setDate(cur.getDate()+1); }
  return count;
}

function getHariKe(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00+07:00");
  return countWorkdays(PKL_START, d);
}

function startClock() { tickClock(); setInterval(tickClock, 1000); }
