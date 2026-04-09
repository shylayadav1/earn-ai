const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const PURDUE_FILES = [
  { mimeType: "application/pdf", fileUri: "https://generativelanguage.googleapis.com/v1beta/files/vr83205miadp" },
  { mimeType: "application/pdf", fileUri: "https://generativelanguage.googleapis.com/v1beta/files/vd4x602jze17" },
  { mimeType: "application/pdf", fileUri: "https://generativelanguage.googleapis.com/v1beta/files/xcwp16blyhsa" }
];

app.post('/api/wealth-check', async (req, res) => {
  const { question } = req.body;

  try {
    const prompt = `
      You are the EARN-AI Wealth Consultant. 
      Answer the following using the attached Purdue PDFs: ${question}.
      Context: User is a Non-Resident Polytechnic student.
    `;

    const result = await model.generateContent([
      ...PURDUE_FILES.map(f => ({ fileData: f })),
      { text: prompt }
    ]);

    res.json({ answer: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: "AI failed to process wealth data." });
  }
});

const wealthRoutes = require('./routes/wealth');

app.use('/api/wealth', wealthRoutes);

app.listen(5001, () => {
  console.log('Backend running on port 5001');
});