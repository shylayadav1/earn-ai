const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function askWealthAI(userQuestion) {
  const files = [
    { mimeType: "application/pdf", fileUri: "https://generativelanguage.googleapis.com/v1beta/files/vr83205miadp" }, // Tuition
    { mimeType: "application/pdf", fileUri: "https://generativelanguage.googleapis.com/v1beta/files/vd4x602jze17" }, // Financial Aid
    { mimeType: "application/pdf", fileUri: "https://generativelanguage.googleapis.com/v1beta/files/xcwp16blyhsa" }  // Scholarships
  ];

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
    
    console.log("\n💰 WEALTH INSIGHTS:");
    console.log(result.response.text());
  } catch (error) {
    console.error("Error fetching AI response:", error);
  }
}

// TEST IT:
askWealthAI("As a non-resident in Polytechnic, what is my total estimated cost for the year and what deadlines should I worry about right now?");