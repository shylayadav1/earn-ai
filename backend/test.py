from google import genai

client = genai.Client(api_key="AIzaSyA2oviNRCm1fOvzo15sYNtCUPQekc0VMHQ")

print("Asking Gemini...")

response = client.models.generate_content(
    model='gemini-2.5-flash', 
    contents='As a finance expert, give me one sentence of advice for a Purdue student.'
)

print(f"Gemini says: {response.text}")