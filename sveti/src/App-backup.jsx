import { useState, useEffect } from 'react'
import MessageList from './components/MessageList'
import InputArea from './components/InputArea'
import TestOpenAI from './components/TestOpenAI'
import { useRealChat } from './hooks/useRealChat'
import { learningStyles, getAllStyles } from './config/learningStyles'
import './index.css'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [subject, setSubject] = useState('algebra')
  const [testMode, setTestMode] = useState(false)
  const [learningStyle, setLearningStyle] = useState('visual')
  const { messages, isLoading, sendMessage, clearMessages } = useRealChat(subject, learningStyle)

  // Load learning style from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sveti-learning-style')
    if (saved && learningStyles[saved]) {
      setLearningStyle(saved)
    }
  }, [])

  // Save learning style when changed
  useEffect(() => {
    localStorage.setItem('sveti-learning-style', learningStyle)
  }, [learningStyle])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-slate-900">
      {/* LEFT SIDEBAR - Learning Styles */}
      <aside className="w-48 flex-shrink-0 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Learning Style
          </h3>
        </div>
        
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
          {getAllStyles().map(style => (
            <button
              key={style.id}
              onClick={() => setLearningStyle(style.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                learningStyle === style.id
                  ? `bg-gradient-to-r ${style.color} text-white shadow-md ring-2 ${style.ringColor}`
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <div className="font-semibold">{style.name}</div>
              <div className={`text-xs mt-1 ${
                learningStyle === style.id ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {style.description}
              </div>
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Sveti AI Tutor
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {learningStyles[learningStyle]?.name} Learning Style
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subject:
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="algebra">Algebra</option>
                  <option value="english">English</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={clearMessages}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Clear Chat
              </button>
              
              <button
                onClick={() => setTestMode(!testMode)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  testMode
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                {testMode ? 'Exit Test' : 'Test Mode'}
              </button>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {darkMode ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>
        </header>

        {/* CHAT AREA */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {testMode ? (
            <TestOpenAI />
          ) : (
            <>
              <div className="flex-1 overflow-hidden">
                <MessageList messages={messages} isLoading={isLoading} />
              </div>
              <div className="border-t border-gray-200 dark:border-slate-700">
                <InputArea 
                  onSendMessage={sendMessage} 
                  disabled={isLoading} 
                  subject={subject}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App