import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

app = FastAPI()

# This is CRITICAL for React to work
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class FinanceRequest(BaseModel):
    query: str

@app.get("/")
def read_root():
    return {"message": "Earn AI is Online"}

@app.post("/ask")
async def ask_earn(request: FinanceRequest):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(f"You are a student finance expert. Answer this: {request.query}")
        return {"answer": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

