const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const files = [
  { mimeType: "application/pdf", fileUri: "https://generativelanguage.googleapis.com/v1beta/files/vr83205miadp" }, // Tuition
  { mimeType: "application/pdf", fileUri: "https://generativelanguage.googleapis.com/v1beta/files/vd4x602jze17" }, // Financial Aid
  { mimeType: "application/pdf", fileUri: "https://generativelanguage.googleapis.com/v1beta/files/xcwp16blyhsa" }  // Scholarships
];

async function askWealthAI(userQuestion) {
  const prompt = `
    You are the EARN-AI Wealth Consultant. Your goal is to provide precise financial guidance for a Purdue Polytechnic student.

    Using the attached documents, answer this: ${userQuestion}

    Rules:
    1. If the user is a Non-Resident, ensure you include the $2,025/semester differential fee.
    2. Highlight the April 15, 2026 FAFSA priority deadline if relevant.
    3. Be encouraging but data-driven.
  `;

  try {
    const result = await model.generateContent([
      ...files.map(f => ({ fileData: f })),
      { text: prompt }
    ]);

    return result.response.text();
  } catch (error) {
    throw new Error("Error fetching AI response: " + error.message);
  }
}

// Route for wealth advice
router.post('/ask', async (req, res) => {
  const { question } = req.body;
  try {
    const answer = await askWealthAI(question);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example GET route
router.get('/', (req, res) => {
  res.json({ message: 'Wealth routes are working' });
});

module.exports = router;