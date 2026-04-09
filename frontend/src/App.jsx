import { useState } from 'react'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const askEarn = async (e) => {
    // 1. Prevent any accidental form refreshes
    if (e) e.preventDefault();
    if (!query) return;

    setLoading(true)
    setResponse('') // Clear previous advice

    try {
      const res = await fetch("http://localhost:8001/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // IMPORTANT: Make sure this key "prompt" matches your Python Item class!
        body: JSON.stringify({ prompt: query }), 
      });

      const data = await res.json();
      
      // 2. Handle the response based on what your Python 'return' says
      // If Python returns {"answer": "..."}, use data.answer
      setResponse(data.reply || "AI connected, but no text in response.");
      
    } catch (error) {
      console.error("Fetch error:", error);
      setResponse("Error: Backend not reachable. Check if 'python main.py' is running on port 8001.");
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="App" style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center', padding: '50px' }}>
      <header>
        <h1 style={{ color: '#2ecc71', fontSize: '2.5rem' }}>Earn AI</h1>
        <p style={{ color: '#7f8c8d' }}>Your Purdue Student Wealth Architect</p>
      </header>
      
      <div className="card" style={{ marginTop: '30px' }}>
        <input 
          type="text" 
          placeholder="Ask about Roth IRAs or budgeting..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && askEarn()} // Allow pressing Enter
          style={{ padding: '12px', width: '350px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}
        />
        <button 
          onClick={askEarn} 
          disabled={loading}
          style={{
            marginLeft: '10px', 
            padding: '12px 25px', 
            backgroundColor: loading ? '#95a5a6' : '#2ecc71', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Analyzing...' : 'Get Advice'}
        </button>
      </div>

      {response && (
        <div style={{
          marginTop: '40px', 
          padding: '25px', 
          background: '#ffffff', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
          borderRadius: '12px', 
          textAlign: 'left', 
          maxWidth: '600px', 
          margin: '40px auto',
          borderLeft: '5px solid #2ecc71'
        }}>
          <strong style={{ color: '#27ae60', display: 'block', marginBottom: '10px' }}>Earn AI Advice:</strong>
          <p style={{ lineHeight: '1.6', color: '#2c3e50' }}>{response}</p>
        </div>
      )}
    </div>
  )
}

export default App

