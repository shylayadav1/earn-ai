const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const PURDUE_FILES = [
  { mimeType: "application/pdf", fileUri: "https://generativelanguage.googleapis.com/v1beta/files/vr83205miadp" },
  { mimeType: "application/pdf", fileUri: "https://generativelanguage.googleapis.com/v1beta/files/vd4x602jze17" },
  { mimeType: "application/pdf", fileUri: "https://generativelanguage.googleapis.com/v1beta/files/xcwp16blyhsa" }
];

// This route handles POST requests to /api/wealth/check
router.post('/check', async (req, res) => {
  const { question } = req.body;
  try {
    const prompt = `You are the EARN-AI Wealth Consultant. Using the attached Purdue PDFs, answer: ${question}. Context: User is a Non-Resident Polytechnic student.`;
    const result = await model.generateContent([
      ...PURDUE_FILES.map(f => ({ fileData: f })),
      { text: prompt }
    ]);
    res.json({ answer: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: "Wealth AI error" });
  }
});

module.exports = router;