from fastapi.middleware.cors import CORSMiddleware

# Add this right after app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows your React app to connect
    allow_methods=["*"],
    allow_headers=["*"],
)