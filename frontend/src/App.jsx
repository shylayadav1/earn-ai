import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const askEarn = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    const userMessage = query;
    setQuery('')
    setMessages(prev => [...prev, { type: 'user', text: userMessage }])
    setLoading(true)

    try {
      const res = await fetch("http://localhost:8001/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage }),
      });

      const data = await res.json();
      const aiResponse = data.reply || "AI connected, but no text in response.";
      setMessages(prev => [...prev, { type: 'ai', text: aiResponse }])

    } catch (error) {
      console.error("Fetch error:", error);
      setMessages(prev => [...prev, {
        type: 'ai',
        text: "Error: Backend not reachable. Check if 'python main.py' is running on port 8001."
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickPrompt = (prompt) => {
    setQuery(prompt)
    setTimeout(() => {
      const form = document.querySelector('.chat-input-area')
      form?.dispatchEvent(new Event('submit', { bubbles: true }))
    }, 50)
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-content">
          <h1 className="header-title">Earn AI</h1>
          <p className="header-subtitle">Your Personal Wealth Architect | Purdue Edition</p>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">💰</div>
            <h2>Build Your Wealth, Boilermaker</h2>
            <p>Master personal finance with AI designed for Purdue students. From Roth IRAs to investment strategies, let's build your financial future.</p>
            <div className="suggested-prompts">
              <button className="prompt-btn" onClick={() => handleQuickPrompt('What should I know about Roth IRAs?')}>💡 Understanding Roth IRAs</button>
              <button className="prompt-btn" onClick={() => handleQuickPrompt('How can I create a realistic budget as a student?')}>📊 Student Budgeting 101</button>
              <button className="prompt-btn" onClick={() => handleQuickPrompt('What are the best investment strategies for beginners?')}>📈 Smart Investing for Beginners</button>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`message message-${msg.type}`}>
            <div className="message-avatar">
              {msg.type === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-bubble">
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message message-ai">
            <div className="message-avatar">🤖</div>
            <div className="message-bubble loading">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={askEarn}>
        <input
          type="text"
          placeholder="Ask about Purdue financial aid, budgeting, or investing..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          className="chat-input"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="chat-button"
        >
          {loading ? '⏳' : '➤'}
        </button>
      </form>
    </div>
  )
}

export default App
