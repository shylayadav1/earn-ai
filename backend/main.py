import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.api_core import exceptions  # New import for error handling
from dotenv import load_dotenv
import PyPDF2

load_dotenv()

# Load the backend-only API key
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise RuntimeError(
        "Missing API key. Set GOOGLE_API_KEY in backend/.env."
    )

# Initialize the Gemini Client
client = genai.Client(api_key=api_key)

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Replace with your Vercel URL later
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

class FinanceRequest(BaseModel):
    prompt: str

def extract_pdf_text(pdf_filenames: list) -> str:
    """Extract and combine text from multiple PDF files."""
    combined_text = ""
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, "data")

    for filename in pdf_filenames:
        try:
            pdf_path = os.path.join(data_dir, filename)
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                combined_text += f"\n\n--- Content from {filename} ---\n"
                for page in pdf_reader.pages:
                    text = page.extract_text()
                    if text:
                        combined_text += text
        except FileNotFoundError:
            print(f"Warning: PDF file not found: {pdf_path}")
        except Exception as e:
            print(f"Warning: Error reading {filename}: {str(e)}")

    if not combined_text:
        raise HTTPException(
            status_code=500,
            detail="Could not load any PDF files from the data directory"
        )
    return combined_text

@app.get("/")
def read_root():
    return {"message": "Earn AI Backend is Online"}

@app.post("/ask")
async def ask_earn(request: FinanceRequest):
    try:
        # Extract text from all PDFs
        pdf_filenames = [
            "2026-27-fafsa-form.pdf",
            "Costs _ Purdue Polytechnic.pdf",
            "Undergraduate Tuition and Fees — 2026-2027 - Finance.pdf"
        ]
        pdf_context = extract_pdf_text(pdf_filenames)

        # Create a prompt that strictly uses only the PDF context
        system_instruction = "You are a Purdue student finance expert. You MUST answer questions ONLY using the provided PDF text below. Do not use any external knowledge or make assumptions. If the information is not in the PDF, explicitly say 'This information is not available in the provided documents.'"

        full_prompt = f"{system_instruction}\n\nPDF Content:\n{pdf_context}\n\nQuestion: {request.prompt}"

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=full_prompt
        )

        return {"reply": response.text}

    except exceptions.ResourceExhausted:
        # Specifically handles the 429 "Quota Exceeded" error
        print("PYTHON ERROR: Quota Exceeded (429)")
        raise HTTPException(
            status_code=429,
            detail="The AI is currently at capacity. Please wait about 60 seconds before asking another question."
        )
    except Exception as e:
        # Handles all other errors without killing the server
        print(f"PYTHON ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)