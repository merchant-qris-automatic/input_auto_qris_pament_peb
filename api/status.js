global.sessions = global.sessions || {};

export default function handler(req, res) {
    const { sessionId } = req.query;
    const status = global.sessions[sessionId] || 'pending';
    res.status(200).json({ status });
}
