import { useState, useEffect, useCallback } from 'react'
import { learningStyles, getAllStyles } from './config/learningStyles'
import MessageList from './components/MessageList'
import InputArea from './components/InputArea'
import TestOpenAI from './components/TestOpenAI'
import './index.css'

// Fixed useRealChat hook that handles OpenAI errors gracefully
function useRealChatFixed(subject = 'algebra', learningStyle = 'visual') {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Storage key for persistence
  const getStorageKey = useCallback((subj) => `sveti-messages-${subj}`, [])

  // Load messages from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(getStorageKey(subject))
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          // Convert timestamp strings back to Date objects if needed
          const messagesWithDates = parsed.map(msg => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
          }))
          setMessages(messagesWithDates)
        }
      }
    } catch (error) {
      console.warn('Failed to load messages:', error)
      setMessages([])
    }
  }, [subject, getStorageKey])

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        // Convert Date objects to strings for storage
        const messagesForStorage = messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
        }))
        localStorage.setItem(getStorageKey(subject), JSON.stringify(messagesForStorage))
      } catch (error) {
        console.warn('Failed to save messages:', error)
      }
    }
  }, [messages, subject, getStorageKey])

  // Send message function
  const sendMessage = useCallback(async (content, actionType = null) => {
    if (!content?.trim() || isLoading) return

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      actionType: actionType || 'general'
    }

    // Add user message immediately
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      // Try to import and use OpenAI, fallback to mock if it fails
      let aiResponse = null
      
      try {
        const openAIModule = await import('./utils/openai.js')
        const promptsModule = await import('./config/prompts.js')
        const stylesModule = await import('./config/learningStyles.js')
        
        const sendOpenAIMessage = openAIModule.sendMessage
        const getSystemPrompt = promptsModule.getSystemPrompt
        const getLearningStylePrompt = stylesModule.getLearningStylePrompt
        
        // Build system prompt
        const basePrompt = getSystemPrompt(subject, actionType)
        const stylePrompt = getLearningStylePrompt(learningStyle)
        const systemPrompt = `${basePrompt}\n\nTEACHING STYLE:\n${stylePrompt}`
        
        // Build API messages
        const apiMessages = [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: content.trim() }
        ]
        
        const response = await sendOpenAIMessage(apiMessages)
        
        if (response.content) {
          aiResponse = response.content
        } else {
          throw new Error(response.error || 'No response content')
        }
        
      } catch (openAIError) {
        console.warn('OpenAI failed, using fallback:', openAIError)
        
        // Fallback responses based on learning style and subject
        const fallbackResponses = {
          visual: `[Visual Learning] Let me break this down step-by-step with clear formatting for "${content}" in ${subject}. I'll organize this visually so it's easy to follow.`,
          reading: `[Reading/Writing] Here's a detailed written explanation for "${content}" in ${subject}. Let me provide comprehensive information you can read through carefully.`,
          examples: `[Example-Based] Let me show you concrete examples for "${content}" in ${subject}. I'll demonstrate this with practical illustrations.`,
          socratic: `[Socratic Method] Great question about "${content}" in ${subject}! Let me guide you with some questions - what do you think might be the first step here?`,
          analogies: `[Stories & Analogies] Let me explain "${content}" in ${subject} using a real-world analogy. Think of it like this...`
        }
        
        aiResponse = fallbackResponses[learningStyle] || fallbackResponses.visual
      }

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        learningStyle: learningStyle,
        model: 'gpt-4o-mini'
      }

      setMessages(prev => [...prev, aiMsg])
      
    } catch (error) {
      console.error('Send message error:', error)
      
      const errorMsg = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
        error: true
      }
      
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }, [subject, learningStyle, messages, isLoading])

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([])
    try {
      localStorage.removeItem(getStorageKey(subject))
    } catch (error) {
      console.warn('Failed to clear messages:', error)
    }
  }, [subject, getStorageKey])

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    subject,
    learningStyle
  }
}

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [subject, setSubject] = useState('algebra')
  const [testMode, setTestMode] = useState(false)
  const [learningStyle, setLearningStyle] = useState('visual')
  const { messages, isLoading, sendMessage, clearMessages } = useRealChatFixed(subject, learningStyle)

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
    <div className="h-screen flex bg-gray-50 dark:bg-gray-800">
      {/* LEFT SIDEBAR - Learning Styles */}
      <aside className="w-64 bg-white dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-600">
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
                  ? `bg-gradient-to-r ${style.color} text-white shadow-md ring-2 ${style.ringColor} opacity-100 scale-110`
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 opacity-80 hover:opacity-95'
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
        <header className="bg-white dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 px-6 py-4">
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
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="algebra">Algebra</option>
                  <option value="english">English</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={clearMessages}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Clear Chat
              </button>
              
              <button
                onClick={() => setTestMode(!testMode)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  testMode
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {testMode ? 'Exit Test' : 'Test Mode'}
              </button>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
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
                <MessageList messages={messages} isLoading={isLoading} subject={subject} />
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600">
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