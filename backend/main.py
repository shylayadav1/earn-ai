import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv

# 1. Load the secret variables from the .env file
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

# 2. Pass the variable into the client instead of the raw string
client = genai.Client(api_key=api_key)

app = FastAPI()

# ... (the rest of your code stays exactly the same) ...

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class FinanceRequest(BaseModel):
    prompt: str

@app.get("/")
def read_root():
    return {"message": "Earn AI is Online"}

@app.post("/ask")
async def ask_earn(request: FinanceRequest):
    try:
        # 3. Call Gemini using the NEW format
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=f"You are a student finance expert. Answer this: {request.prompt}"
        )
        
        print(f"Success! Sent response for: {request.prompt[:20]}...")
        return {"reply": response.text}

    except Exception as e:
        print(f"PYTHON ERROR: {str(e)}")
        return {"reply": f"AI Error: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)