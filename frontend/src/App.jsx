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

  const handleAsk = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    const userMessage = query
    setQuery('')
    setMessages(prev => [...prev, { type: 'user', text: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8001/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage }),
      })

      const data = await res.json()
      const aiResponse = data.reply || 'No response received.'
      setMessages(prev => [...prev, { type: 'ai', text: aiResponse }])
    } catch (error) {
      console.error('Fetch error:', error)
      setMessages(prev => [...prev, {
        type: 'ai',
        text: 'Connection error. Ensure the backend is running on port 8001.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickPrompt = (prompt) => {
    setQuery(prompt)
    setTimeout(() => {
      document.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true }))
    }, 50)
  }

  return (
    <div className="min-h-screen bg-zen-dark text-zen-text flex flex-col">
      {/* Header */}
      <header className="border-b border-zen-light/20 py-8 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-medium tracking-tight mb-2">Earn AI</h1>
          <p className="text-sm text-zen-muted font-light">Your personal wealth architect. Focused on your future.</p>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Empty State */}
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center min-h-96 text-center">
                <div className="mb-8">
                  <div className="text-5xl mb-6 opacity-40">💭</div>
                  <h2 className="text-xl font-light mb-3 text-zen-text">What's on your mind?</h2>
                  <p className="text-sm text-zen-muted max-w-sm">
                    Ask me anything about building wealth, managing your finances, or planning your future.
                  </p>
                </div>

                {/* Suggested Prompts */}
                <div className="w-full mt-8 space-y-3">
                  <button
                    onClick={() => handleQuickPrompt('Building a Roth IRA as a student')}
                    className="w-full p-3 text-left text-sm glass-dark rounded-lg hover:bg-zen-light/20 transition-gentle text-zen-text"
                  >
                    <span className="font-medium">Building a Roth IRA as a student</span>
                  </button>
                  <button
                    onClick={() => handleQuickPrompt('Managing expenses at Purdue')}
                    className="w-full p-3 text-left text-sm glass-dark rounded-lg hover:bg-zen-light/20 transition-gentle text-zen-text"
                  >
                    <span className="font-medium">Managing expenses at Purdue</span>
                  </button>
                  <button
                    onClick={() => handleQuickPrompt('Long-term investment strategies')}
                    className="w-full p-3 text-left text-sm glass-dark rounded-lg hover:bg-zen-light/20 transition-gentle text-zen-text"
                  >
                    <span className="font-medium">Long-term investment strategies</span>
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.type === 'ai' && (
                    <div className="w-6 h-6 rounded-full bg-zen-purple/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs">AI</span>
                    </div>
                  )}
                  <div
                    className={`max-w-xl px-4 py-3 rounded-lg text-sm leading-relaxed ${
                      msg.type === 'user'
                        ? 'bg-purdue-gold/20 text-zen-text border border-purdue-gold/30'
                        : 'glass-dark text-zen-text'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Loading State */}
              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-6 h-6 rounded-full bg-zen-purple/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs">AI</span>
                  </div>
                  <div className="glass-dark px-4 py-3 rounded-lg">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-zen-purple rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-zen-purple rounded-full animate-pulse delay-100"></div>
                      <div className="w-2 h-2 bg-zen-purple rounded-full animate-pulse delay-200"></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-zen-light/20 px-6 py-6 bg-gradient-subtle">
          <form onSubmit={handleAsk} className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                placeholder="Ask anything about your finances..."
                className="flex-1 bg-zen-gray/50 border border-zen-light/30 rounded-full px-5 py-3 text-sm text-zen-text placeholder-zen-muted/50 focus-ring transition-gentle disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-6 py-3 bg-zen-light/40 hover:bg-zen-light/60 border border-zen-light/40 rounded-full text-sm font-medium text-zen-text transition-gentle disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App
