import { useState, useEffect } from 'react'
import MessageList from './components/MessageList'
import InputArea from './components/InputArea'
import { useMockChat } from './hooks/useMockChat'
import './index.css'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [subject, setSubject] = useState('algebra')
  const { messages, isLoading, sendMessage, clearMessages } = useMockChat(subject)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className="h-screen flex flex-col bg-stone-50 dark:bg-slate-900">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 bg-white dark:bg-slate-800 border-b border-stone-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
              S
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">Sveti</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">AI Homework Coach</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Subject Toggle */}
            <div className="flex gap-2 bg-stone-100 dark:bg-slate-700 p-1 rounded-lg">
              <button
                onClick={() => setSubject('algebra')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  subject === 'algebra'
                    ? 'bg-white dark:bg-slate-600 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                📐 Algebra
              </button>
              <button
                onClick={() => setSubject('ela')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  subject === 'ela'
                    ? 'bg-white dark:bg-slate-600 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                📝 English
              </button>
            </div>

            {/* Clear Chat Button */}
            {messages.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Clear all messages?')) {
                    clearMessages()
                  }
                }}
                className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                aria-label="Clear chat history"
                title="Clear all messages"
              >
                🗑️
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-stone-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-stone-200 dark:hover:bg-slate-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-5xl mx-auto">
          <MessageList messages={messages} isLoading={isLoading} />
        </div>
      </main>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="max-w-5xl mx-auto">
          <InputArea
            onSendMessage={sendMessage}
            isLoading={isLoading}
            subject={subject}
          />
        </div>
      </div>
    </div>
  )
}

export default App