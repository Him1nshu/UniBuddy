const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ── Intent detection helpers ──────────────────────────────────────────────────

function detectIntent(msg) {
    const m = msg.toLowerCase();

    // Notice / announcement intent
    if (/notice|circular|announcement|bulletin|news|update|latest|recent|inform/i.test(m))
        return 'notice';

    // Helpline intent
    if (/helpline|emergency|call|phone|number|contact|reach|toll.?free|hotline/i.test(m))
        return 'helpline';

    // Staff / room intent
    if (/staff|teacher|professor|prof\.|faculty|hod|head|coordinator|where is|room|cabin|office|sit|located|find/i.test(m))
        return 'staff';

    // Lost & found intent
    if (/lost|found|missing|belong|item|bag|backpack|wallet|phone|id|card/i.test(m))
        return 'lost_found';

    // Facility issue intent
    if (/broken|repair|fix|maintenance|ac|fan|light|water|clean|washroom|toilet|issue|problem|fault/i.test(m))
        return 'facility';

    // Auth intent
    if (/login|register|sign.?in|sign.?up|account|password/i.test(m))
        return 'auth';

    // Greeting
    if (/\b(hi|hello|hey|greet|good morning|good afternoon|good evening|sup)\b/i.test(m))
        return 'greeting';

    return 'unknown';
}

// ── Keyword lookup in RoomInfo ────────────────────────────────────────────────

async function lookupRoomInfo(query, type = null) {
    const filter = type ? 'WHERE type = ?' : '';
    const params = type ? [type] : [];
    const [rows] = await pool.query(`SELECT * FROM RoomInfo ${filter} ORDER BY created_at DESC`, params);

    if (rows.length === 0) return null;

    const lower = query.toLowerCase();

    // 1. Exact or partial keyword match
    const match = rows.find(r => lower.includes(r.keyword.toLowerCase()));
    if (match) return { single: match.details };

    // 2. Reverse: any keyword word appears in query
    const tokens = lower.split(/\W+/).filter(w => w.length > 2);
    const fuzzy = rows.find(r => {
        const kLower = r.keyword.toLowerCase();
        return tokens.some(t => kLower.includes(t));
    });
    if (fuzzy) return { single: fuzzy.details };

    return { all: rows };
}

// ── Format a list of RoomInfo rows ───────────────────────────────────────────

function formatRoomList(rows, label) {
    if (rows.length === 0)
        return `No ${label} information has been added yet. Please ask the admin to add entries via the Admin Dashboard.`;
    return `Here are the ${label} details I have:\n\n` +
        rows.map(r => `• ${r.keyword}: ${r.details}`).join('\n');
}

// ── Fetch recent announcements ────────────────────────────────────────────────

async function fetchAnnouncements() {
    const [rows] = await pool.query(
        'SELECT message, is_active, created_at FROM Announcements ORDER BY created_at DESC LIMIT 5'
    );
    return rows;
}

// ── Search PDF knowledge base ─────────────────────────────────────────────────

async function searchKnowledgeBase(query) {
    const [notices] = await pool.query('SELECT * FROM KnowledgeBase ORDER BY uploaded_at DESC');
    if (notices.length === 0) return null;

    const words = query.toLowerCase()
        .split(/[\s,.'"!?;:]+/)
        .filter(w => w.length > 3);  // ignore very short words

    if (words.length === 0) return null;

    let best = null;
    let bestScore = 0;

    for (const notice of notices) {
        const content = notice.content.toLowerCase();
        const score = words.filter(w => content.includes(w)).length;
        if (score > bestScore) {
            bestScore = score;
            best = notice;
        }
    }

    // Require at least 1 word match (or 2 if query has many words)
    const threshold = words.length >= 4 ? 2 : 1;
    if (best && bestScore >= threshold) {
        // Return a clean snippet around the first matched word
        const snippet = extractSnippet(best.content, words, 350);
        return `According to the notice "${best.filename}":\n\n"${snippet}..."`;
    }

    return null;
}

function extractSnippet(text, words, maxLen) {
    // Find the first occurrence of any matched word and return text around it
    const lower = text.toLowerCase();
    let pos = -1;
    for (const w of words) {
        pos = lower.indexOf(w);
        if (pos !== -1) break;
    }
    if (pos === -1) return text.substring(0, maxLen);
    const start = Math.max(0, pos - 80);
    return text.substring(start, start + maxLen).replace(/\s+/g, ' ').trim();
}

// ── Main chatbot route ────────────────────────────────────────────────────────

router.post('/', async (req, res) => {
    const { message } = req.body;
    if (!message || !message.trim()) {
        return res.status(400).json({ reply: 'Please send a message.' });
    }

    const query = message.trim();
    const intent = detectIntent(query);

    try {
        // ── Staff / Room queries ──────────────────────────────────────────────
        if (intent === 'staff') {
            const result = await lookupRoomInfo(query, 'room');
            if (result) {
                if (result.single) return res.json({ reply: result.single });
                return res.json({ reply: formatRoomList(result.all, 'staff room') });
            }
            // Also try any type if room-only had nothing
            const anyResult = await lookupRoomInfo(query);
            if (anyResult?.single) return res.json({ reply: anyResult.single });
            return res.json({
                reply: "I don't have room information for that person yet. You can ask the admin to add it via the Admin Dashboard under 'Room & Helpline Details'."
            });
        }

        // ── Helpline queries ──────────────────────────────────────────────────
        if (intent === 'helpline') {
            const result = await lookupRoomInfo(query, 'helpline');
            if (result) {
                if (result.single) return res.json({ reply: result.single });
                return res.json({ reply: formatRoomList(result.all, 'helpline') });
            }
            return res.json({
                reply: "No helpline numbers have been added yet. Please contact the admin to add them via the Admin Dashboard."
            });
        }

        // ── Notice / Announcement queries ──────────────────────────────────────
        if (intent === 'notice') {
            const announcements = await fetchAnnouncements();
            const pdfResult = await searchKnowledgeBase(query);

            let reply = '';

            if (announcements.length > 0) {
                const active = announcements.find(a => a.is_active);
                if (active) reply += `📢 Current Announcement:\n"${active.message}"\n\n`;
                const others = announcements.filter(a => !a.is_active).slice(0, 3);
                if (others.length > 0) {
                    reply += `Recent Notices:\n` + others.map(a => `• ${a.message}`).join('\n') + '\n\n';
                }
            }

            if (pdfResult) {
                reply += pdfResult;
            }

            if (!reply) {
                return res.json({
                    reply: "There are no notices or announcements available at the moment. Please check back later or contact the admin."
                });
            }

            return res.json({ reply: reply.trim() });
        }

        // ── For other intents: try RoomInfo keyword match first ──────────────
        const roomResult = await lookupRoomInfo(query);
        if (roomResult?.single) return res.json({ reply: roomResult.single });

        // ── Then try PDF knowledge base ───────────────────────────────────────
        const pdfResult = await searchKnowledgeBase(query);
        if (pdfResult) return res.json({ reply: pdfResult });

        // ── Intent-specific fallback responses ────────────────────────────────
        const fallbacks = {
            lost_found: "To report a lost or found item, go to the **Lost & Found** section from the top menu and click 'Report Lost Item' or 'Report Found Item'. The system will automatically check for matches!",
            facility:   "To report a facility issue (broken AC, lights, cleanliness, etc.), go to the **Facilities** section, click 'Report New Issue', and fill in the details including the room number and severity.",
            auth:       "You can log in or create an account using the **Login** button in the top-right corner. A student account lets you report items and upvote facility issues.",
            greeting:   "Hello! 👋 I'm UniBot, your campus assistant. I can help you with:\n• Staff room numbers (ask about a teacher)\n• Helpline numbers\n• Campus notices and announcements\n• Lost & Found guidance\n• Facility issue reporting\n\nWhat do you need?",
            unknown:    "I'm not sure about that. Try asking me about a staff member's room, campus helplines, latest notices, or how to report a lost item or facility issue."
        };

        return res.json({ reply: fallbacks[intent] || fallbacks.unknown });

    } catch (err) {
        console.error('Chatbot error:', err);
        return res.json({ reply: "I'm having trouble connecting right now. Please try again in a moment." });
    }
});

module.exports = router;
