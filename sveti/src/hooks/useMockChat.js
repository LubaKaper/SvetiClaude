import { useState, useCallback, useEffect } from 'react'

/**
 * Custom React hook that simulates AI chat for development
 * This is temporary for building the UI - will be replaced with real OpenAI later
 * 
 * @param {string} subject - The subject area ('algebra' or 'ela')
 * @returns {Object} Chat state and functions
 */
export function useMockChat(subject = 'algebra') {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sveti-messages')
      if (saved) {
        const parsedMessages = JSON.parse(saved).map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(parsedMessages)
      }
    } catch (error) {
      console.warn('Failed to load messages from localStorage:', error)
    }
  }, [])

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem('sveti-messages', JSON.stringify(messages))
      }
    } catch (error) {
      console.warn('Failed to save messages to localStorage:', error)
    }
  }, [messages])

  /**
   * Generate a mock AI response based on the user's input
   * @param {string} content - User's message content
   * @returns {string} Generated AI response
   */
  const generateMockResponse = useCallback((content) => {
    const lowerContent = content.toLowerCase()

    // Math problem solving
    if (lowerContent.includes('solve') || /\d+.*x|x.*\d+/.test(lowerContent)) {
      return "I'd be happy to help you solve this! Let's work through it step by step. First, we need to isolate the variable by performing the same operation on both sides of the equation. What operation do you think we should start with?"
    }

    // Explanation requests
    if (lowerContent.includes('explain') || lowerContent.includes('what is')) {
      return "Great question! Let me break this down for you in simple terms. Understanding the concept is more important than just memorizing formulas. Think of it this way - when we're working with equations, we're like detectives solving a mystery to find the value of our unknown variable."
    }

    // Practice problems
    if (lowerContent.includes('practice') || lowerContent.includes('problems')) {
      return `Here are 3 practice problems for you:\n\n1. 3x + 7 = 22\n2. 2(x - 4) = 10\n3. 5x - 3 = 4x + 8\n\nTry solving these step by step! Remember to show your work, and let me know if you need help with any of them.`
    }

    // Writing/ELA topics
    if (lowerContent.includes('essay') || lowerContent.includes('thesis')) {
      return "Let's work on developing your thesis together! A strong thesis should be specific, arguable, and provide a roadmap for your essay. What's your topic? I can help you narrow it down and create a clear, focused thesis statement."
    }

    // Grammar check
    if (lowerContent.includes('grammar') || lowerContent.includes('check')) {
      return "I'd be happy to help you check your grammar! Please share the text you'd like me to review, and I'll point out any issues and explain how to fix them. Remember, good writing is all about clear communication."
    }

    // Brainstorming
    if (lowerContent.includes('brainstorm') || lowerContent.includes('ideas')) {
      return "Brainstorming is one of my favorite parts of writing! Let's think about this together. What's your assignment about? I can help you generate ideas, organize your thoughts, and find the angle that interests you most."
    }

    // Default encouraging response
    const defaultResponses = [
      "I'm here to help! Can you tell me more about what you're working on? The more details you share, the better I can assist you.",
      "That's a great question to explore! Let's break it down together. What specific part would you like to focus on first?",
      "I love helping students learn! Could you share more context about your assignment or what you're trying to understand?"
    ]

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }, [])

  /**
   * Send a message and get an AI response
   * @param {string} content - The message content
   * @param {string} actionType - Optional action type for context
   */
  const sendMessage = useCallback(async (content, actionType = null) => {
    if (!content.trim()) return

    // Add user message immediately
    const userMessage = {
      id: crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Simulate API delay (1-2 seconds)
      const delay = 1000 + Math.random() * 1000
      await new Promise(resolve => setTimeout(resolve, delay))

      // Generate mock AI response
      const aiResponse = generateMockResponse(content)

      // Add AI message
      const assistantMessage = {
        id: crypto.randomUUID ? crypto.randomUUID() : `assistant-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error in mock chat:', error)
      
      // Add error message
      const errorMessage = {
        id: crypto.randomUUID ? crypto.randomUUID() : `error-${Date.now()}`,
        role: 'assistant',
        content: "I apologize, but I'm having trouble processing your message right now. Please try again!",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [generateMockResponse])

  /**
   * Clear all messages from the chat
   */
  const clearMessages = useCallback(() => {
    setMessages([])
    setIsLoading(false)
    // Also clear from localStorage
    try {
      localStorage.removeItem('sveti-messages')
    } catch (error) {
      console.warn('Failed to clear messages from localStorage:', error)
    }
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages
  }
}