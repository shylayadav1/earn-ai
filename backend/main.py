import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv

load_dotenv()

# Load the backend-only API key from a secure .env file.
# Do not expose this value in frontend/.env or in browser code.
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise RuntimeError(
        "Missing API key. Set GOOGLE_API_KEY in backend/.env and do not commit it."
    )

# Initialize the Gemini Client
client = genai.Client(api_key=api_key)

app = FastAPI()

# CORS is essential for your React frontend to talk to this Python backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Local dev frontend origin; replace with production URL later
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

class FinanceRequest(BaseModel):
    prompt: str

@app.get("/")
def read_root():
    return {"message": "Earn AI Backend is Online"}

@app.post("/ask")
async def ask_earn(request: FinanceRequest):
    try:
        # Fixed model name to 1.5-flash (or 2.0-flash if available)
        response = client.models.generate_content(
            model='gemini-2.5-flash', 
            contents=f"You are a student finance expert. Answer this: {request.prompt}"
        )
        
        # The SDK returns a response object where .text contains the string
        return {"reply": response.text}

    except Exception as e:
        print(f"PYTHON ERROR: {str(e)}")
        # Raise a proper 500 error so the frontend knows something went wrong
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Changed port to 8001 as per your requirement
    uvicorn.run(app, host="0.0.0.0", port=8001)