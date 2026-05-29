const TIMER_DURATION = 8 * 60; // 8 Menit
let timeLeft = TIMER_DURATION;
let timerInterval;
let pollingInterval;

// Generate atau ambil Session ID
function getSessionId() {
    let sid = localStorage.getItem('qris_session');
    if (!sid) {
        sid = Math.random().toString(36).substring(2, 8).toUpperCase();
        localStorage.setItem('qris_session', sid);
    }
    return sid;
}

const sessionId = getSessionId();
document.getElementById('display-session').innerText = `Session: ${sessionId}`;

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = TIMER_DURATION;
    const timerEl = document.getElementById("timer");
    
    timerInterval = setInterval(() => {
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        timerEl.innerHTML = `Waktu Scan QRIS: ${m}:${s} Menit`;
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(timerInterval);
            showStatus("QRIS Expired / Pembayaran Gagal", "❌");
            setTimeout(() => resetSession(), 5000);
        }
    }, 1000);
}

function resetSession() {
    localStorage.removeItem('qris_session');
    location.reload(); // Refresh untuk generate session & QRIS baru
}

function showStatus(text, icon = null) {
    document.getElementById("overlay").style.display = "flex";
    document.getElementById("status-text").innerText = text;
    const loader = document.getElementById("loader-spinner");
    const iconEl = document.getElementById("icon-status");
    
    if (icon) {
        loader.style.display = "none";
        iconEl.style.display = "block";
        iconEl.innerText = icon;
    } else {
        loader.style.display = "block";
        iconEl.style.display = "none";
    }
}

// Deteksi saat user keluar aplikasi/browser lalu kembali
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === 'visible') {
        showStatus("Memproses Pembayaran Anda...");
        // Beri tahu backend untuk kirim notif ke Telegram
        fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
        });
    }
});

// Polling ke Backend setiap 3 detik (Simulasi Realtime)
function startPolling() {
    pollingInterval = setInterval(async () => {
        try {
            const res = await fetch(`/api/status?sessionId=${sessionId}`);
            const data = await res.json();
            
            if (data.status === 'success') {
                clearInterval(pollingInterval);
                clearInterval(timerInterval);
                showStatus("Pembayaran Berhasil", "✅");
                setTimeout(() => {
                    window.location.href = "https://download-file-video.edgeone.app";
                }, 5000);
            } 
            else if (data.status === 'failed') {
                clearInterval(pollingInterval);
                clearInterval(timerInterval);
                showStatus("Pembayaran Gagal", "❌");
                setTimeout(() => resetSession(), 5000);
            }
        } catch (e) { console.error("Polling error", e); }
    }, 3000);
}

startTimer();
startPolling();
