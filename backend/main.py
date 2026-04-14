import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.genai
from google.genai import types
from dotenv import load_dotenv

# Import MCP tools directly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mcp_tools import (
    search_tuition_data,
    search_financial_aid,
    search_polytechnic_costs,
    calculate_total_cost,
    get_important_deadlines,
)

load_dotenv()

# Load the backend-only API key
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise RuntimeError("Missing API key. Set GOOGLE_API_KEY in backend/.env.")

# Initialize the Gemini Client
client = google.genai.Client(api_key=api_key)

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

class FinanceRequest(BaseModel):
    prompt: str

# ============================================================================
# Tool Definitions for Gemini
# ============================================================================

GEMINI_TOOLS = [
    {
        "function_declarations": [
            {
                "name": "search_tuition_data",
                "description": "Search Purdue tuition and fees data for 2026-2027 academic year. Use for questions about tuition rates, fees, or costs.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Search term (e.g., 'part-time Indiana resident', 'general service fee')",
                        }
                    },
                    "required": ["query"],
                },
            },
            {
                "name": "search_financial_aid",
                "description": "Search FAFSA and financial aid information. Use for questions about aid, scholarships, or financial support.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Search term (e.g., 'FAFSA deadline', 'scholarship', 'financial aid')",
                        }
                    },
                    "required": ["query"],
                },
            },
            {
                "name": "search_polytechnic_costs",
                "description": "Search Purdue Polytechnic-specific costs and fees. Use for Polytechnic-related tuition questions.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Search term (e.g., 'differential fee', 'engineering', 'technology')",
                        }
                    },
                    "required": ["query"],
                },
            },
            {
                "name": "calculate_total_cost",
                "description": "Calculate estimated total cost based on residency and enrollment status.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "resident": {
                            "type": "boolean",
                            "description": "True if Indiana resident, False if non-resident",
                        },
                        "credits_per_semester": {
                            "type": "integer",
                            "description": "Credit hours per semester",
                        },
                        "semesters": {
                            "type": "integer",
                            "description": "Number of semesters",
                        },
                    },
                    "required": ["resident", "credits_per_semester", "semesters"],
                },
            },
            {
                "name": "get_important_deadlines",
                "description": "Get important financial aid and enrollment deadlines.",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": [],
                },
            },
        ]
    }
]

# Map tool names to functions
TOOL_FUNCTIONS = {
    "search_tuition_data": search_tuition_data,
    "search_financial_aid": search_financial_aid,
    "search_polytechnic_costs": search_polytechnic_costs,
    "calculate_total_cost": calculate_total_cost,
    "get_important_deadlines": get_important_deadlines,
}

# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/")
def read_root():
    return {"message": "Earn AI Backend is Online"}

@app.post("/ask")
async def ask_earn(request: FinanceRequest):
    """
    Main endpoint for asking Purdue finance questions.
    Uses tools and Gemini with function calling.
    """
    try:
        # 1. Initialize the conversation history with the user's prompt
        conversation_history = [
            types.Content(role="user", parts=[types.Part.from_text(text=request.prompt)])
        ]

        # 2. TOOL LOOP: Handle multiple sequential tool calls
        while True:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=conversation_history,
                config=types.GenerateContentConfig(tools=GEMINI_TOOLS)
            )

            if not response.candidates or not response.candidates[0].content.parts:
                break

            part = response.candidates[0].content.parts[0]

            if hasattr(part, "function_call") and part.function_call:
                # Gemini is calling a tool
                tool_call = part.function_call
                tool_name = tool_call.name
                tool_args = dict(tool_call.args) if tool_call.args else {}

                print(f"Gemini calling tool: {tool_name} with args: {tool_args}", flush=True)

                # IMPORTANT: Append the AI's tool request to the history
                conversation_history.append(response.candidates[0].content)

                # Call the tool function
                if tool_name in TOOL_FUNCTIONS:
                    try:
                        tool_result = TOOL_FUNCTIONS[tool_name](**tool_args)
                    except TypeError as e:
                        tool_result = f"Error calling tool {tool_name}: {str(e)}"
                else:
                    tool_result = f"Tool {tool_name} not found"

                # IMPORTANT: Append the Tool's result to the history
                conversation_history.append(
                    types.Content(
                        role="user", 
                        parts=[
                            types.Part.from_function_response(
                                name=tool_name,
                                response={"content": str(tool_result)}
                            )
                        ]
                    )
                )
                # The loop will now restart and pass the FULL history back to Gemini
            else:
                # No function call - Gemini has the final answer
                break

        # 3. Extract and return the final response
        if response.candidates and response.candidates[0].content.parts:
            final_text = response.candidates[0].content.parts[0].text
            return {"reply": final_text}
        else:
            return {"reply": "I couldn't generate a response. Please try again."}

    except Exception as e:
        error_msg = str(e)
        print(f"PYTHON ERROR: {error_msg}", flush=True)

        if "429" in error_msg or "quota" in error_msg.lower():
            raise HTTPException(
                status_code=429,
                detail="The AI is currently at capacity. Please wait about 60 seconds before asking another question.",
            )

        raise HTTPException(status_code=500, detail="Internal Server Error")
    
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
