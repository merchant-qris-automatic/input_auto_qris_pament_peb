global.sessions = global.sessions || {};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const update = req.body;

    // Pastikan ini adalah pesan teks
    if (update.message && update.message.text) {
        const text = update.message.text.toLowerCase().trim();
        const chatId = update.message.chat.id;

        // Memisahkan perintah dan session ID, contoh: "kirim A1B2C3"
        const parts = text.split(' ');
        const command = parts[0];
        const sessionId = parts[1]?.toUpperCase();

        if (['kirim', 'gagal'].includes(command) && sessionId) {
            // Update status di memori
            if (command === 'kirim') {
                global.sessions[sessionId] = 'success';
            } else if (command === 'gagal') {
                global.sessions[sessionId] = 'failed';
            }

            // Balas ke admin
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: `✅ Status Sesi ${sessionId} berhasil diubah menjadi: ${command.toUpperCase()}`
                })
            });
        }
    }

    res.status(200).send('OK');
}
