const express = require('express');
const router = express.Router();

// Rule-based generic chatbot matching
const chatbotRules = [
  { keywords: ['room', 'no', 'number', 'where', 'find'], response: 'To find a specific room number, please check the campus map at the main entrance or ask the front desk. For facility issues in a room, please use the Facilities tab.' },
  { keywords: ['lost', 'find', 'missing', 'id', 'wallet', 'phone'], response: 'To report a lost item or to find something you lost, please navigate to the "Lost & Found" section from the top menu, click "Find an Item", and fill out the details.' },
  { keywords: ['report', 'broken', 'issue', 'ac', 'fan', 'light', 'clean', 'washroom'], response: 'If you noticed a facility issue like a broken AC or a cleanliness problem, go to the "Facilities" section to submit a support ticket. Maintenance will be notified immediately.' },
  { keywords: ['login', 'account', 'register', 'password'], response: 'You can log into your account or register a new one by clicking the "Login" button on the top right. This is required to post lost items or facility issues.' },
  { keywords: ['hello', 'hi', 'hey', 'greetings'], response: 'Hello there! I am UniBot, your campus assistant. How can I help you? Try asking about reporting a lost item or fixing a broken facility.' },
  { keywords: ['admin', 'contact', 'help'], response: 'If you need human assistance, please contact the administration office directly. As a bot, I can only help you navigate the system!' }
];

// @route POST /api/chatbot
// @desc Get response from chatbot
router.post('/', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ reply: 'Please send a message.' });
  }

  const lowerMsg = message.toLowerCase();
  let bestMatch = null;
  let maxScore = 0;

  for (let rule of chatbotRules) {
    let score = 0;
    rule.keywords.forEach(kw => {
      if (lowerMsg.includes(kw)) score++;
    });
    if (score > maxScore) {
      maxScore = score;
      bestMatch = rule.response;
    }
  }

  const defaultReplies = [
    "I'm not quite sure I understand. Could you rephrase your question? Try asking about 'lost items' or 'facility issues'.",
    "Hmm, I didn't get that. I'm mainly trained to guide you through UniBuddy features like reporting issues and finding items.",
    "Can you clarify? Be sure to include keywords like 'lost', 'broken', or 'help'."
  ];
  
  const finalReply = bestMatch || defaultReplies[Math.floor(Math.random() * defaultReplies.length)];

  res.json({ reply: finalReply });
});

module.exports = router;
