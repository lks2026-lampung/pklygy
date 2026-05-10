// ============================================================
//  autodown.js — Auto redirect ke goodbye.html setelah PKL selesai
//  PKL Selesai: 25 September 2026 pukul 23:59:59 WIB
// ============================================================

const PKL_END = new Date("2026-09-25T23:59:59+07:00");

function checkPKLEnd() {
  const now = new Date();

  // Sudah lewat? Langsung redirect
  if (now >= PKL_END) {
    // Jangan redirect kalau sudah di goodbye.html
    if (!window.location.pathname.endsWith("goodbye.html")) {
      window.location.replace("goodbye.html");
    }
    return;
  }

  // Belum lewat — hitung sisa waktu dan set timer
  const msLeft = PKL_END - now;

  // Kalau sisa < 24 jam, set timeout tepat waktu
  if (msLeft < 86400000) {
    setTimeout(() => {
      if (!window.location.pathname.endsWith("goodbye.html")) {
        window.location.replace("goodbye.html");
      }
    }, msLeft + 1000); // +1s buffer
  }
}

// Jalankan saat halaman load
checkPKLEnd();

// Cek ulang setiap menit (antisipasi tab yang dibuka lama)
setInterval(checkPKLEnd, 60000);
