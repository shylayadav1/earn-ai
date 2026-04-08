// frontend/src/services/api.js

const API_URL = "http://localhost:8001"; // Your FastAPI address

export const askEarnAI = async (userPrompt) => {
  try {
    const response = await fetch(`${API_URL}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: userPrompt }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data.reply; // This matches the {"reply": ...} from your Python code
  } catch (error) {
    console.error("Error calling Earn AI Backend:", error);
    return "Sorry, I'm having trouble connecting to the server.";
  }
};