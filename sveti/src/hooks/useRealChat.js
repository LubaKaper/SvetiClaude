import { useState, useEffect, useCallback } from 'react'
import { sendMessage as sendOpenAIMessage } from '../utils/openai.js'
import { getSystemPrompt } from '../config/prompts.js'
import { getLearningStylePrompt } from '../config/learningStyles'

/**
 * Custom React hook for real-time AI chat using OpenAI API
 * Provides educational tutoring with conversation context and persistence
 * 
 * @param {string} subject - The subject to tutor ('algebra' or 'ela')
 * @param {string} learningStyle - The learning style preference ('visual', 'reading', 'examples', 'socratic', 'analogies')
 * @returns {Object} Chat interface with messages, loading state, and functions
 */
export function useRealChat(subject = 'algebra', learningStyle = 'visual') {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Subject-specific storage key for persistence
  const getStorageKey = useCallback((subj) => `sveti-messages-${subj}`, [])

  /**
   * Load messages for a specific subject from localStorage
   */
  const loadMessagesForSubject = useCallback((subj) => {
    try {
      const storageKey = getStorageKey(subj)
      const savedMessages = localStorage.getItem(storageKey)
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages)
        // Restore Date objects from ISO strings
        const restoredMessages = parsed.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        return restoredMessages
      }
      return []
    } catch (error) {
      console.warn(`Failed to load messages for ${subj} from localStorage:`, error)
      // Clear corrupted data
      const storageKey = getStorageKey(subj)
      localStorage.removeItem(storageKey)
      return []
    }
  }, [getStorageKey])

  /**
   * Save messages for a specific subject to localStorage
   */
  const saveMessagesForSubject = useCallback((subj, msgs) => {
    if (msgs.length === 0) return

    try {
      const storageKey = getStorageKey(subj)
      // Convert Date objects to ISO strings for storage
      const messagesForStorage = msgs.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }))
      localStorage.setItem(storageKey, JSON.stringify(messagesForStorage))
    } catch (error) {
      console.warn(`Failed to save messages for ${subj} to localStorage:`, error)
    }
  }, [getStorageKey])

  /**
   * Load messages from localStorage on component mount
   */
  useEffect(() => {
    const initialMessages = loadMessagesForSubject(subject)
    setMessages(initialMessages)
  }, [loadMessagesForSubject]) // Only run on mount

  /**
   * Handle subject changes - load messages for new subject
   */
  useEffect(() => {
    // Load messages for the current subject
    const subjectMessages = loadMessagesForSubject(subject)
    setMessages(subjectMessages)
  }, [subject, loadMessagesForSubject]) // Run when subject changes

  /**
   * Save messages to localStorage whenever messages change
   */
  useEffect(() => {
    saveMessagesForSubject(subject, messages)
  }, [messages, subject])

  /**
   * Create a message object with proper structure
   * @param {string} role - 'user' | 'assistant' | 'system'
   * @param {string} content - The message content
   * @returns {Object} Formatted message object
   */
  const createMessage = useCallback((role, content) => ({
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    role,
    content,
    timestamp: new Date()
  }), [])

  /**
   * Build context messages for OpenAI API
   * Includes system prompt and recent conversation history
   * @param {string} newContent - The new user message content
   * @param {string|null} actionType - Optional action type for specialized prompts
   * @returns {Array} Array of messages for OpenAI API
   */
  const buildAPIMessages = useCallback((newContent, actionType = null) => {
    // Get the base system prompt and learning style adaptation
    const baseSystemPrompt = getSystemPrompt(subject, actionType)
    const learningStyleModifier = getLearningStylePrompt(learningStyle)

    // Combine base prompt with learning style adaptation
    const combinedSystemPrompt = `${baseSystemPrompt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEACHING STYLE ADAPTATION:
${learningStyleModifier}

Apply this teaching style to all your explanations while maintaining your educational role.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    
    // Start with enhanced system message
    const apiMessages = [{
      role: 'system',
      content: combinedSystemPrompt
    }]

    // Debug logging
    console.log('Current learning style:', learningStyle)
    console.log('Learning style modifier:', learningStyleModifier)

    // Add recent conversation history (last 10 messages to keep context manageable)
    // Only include user and assistant messages, not system messages
    const recentMessages = messages
      .filter(msg => msg.role !== 'system')
      .slice(-10)
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }))

    apiMessages.push(...recentMessages)

    // Add the new user message
    apiMessages.push({
      role: 'user',
      content: newContent
    })

    return apiMessages
  }, [messages, subject, learningStyle])

  /**
   * Send a message to the AI and handle the response
   * @param {string} content - The user's message content
   * @param {string|null} actionType - Optional action type for specialized behavior
   */
  const sendMessage = useCallback(async (content, actionType = null) => {
    if (!content.trim()) return

    // Add user message immediately for responsive UI
    const userMessage = createMessage('user', content.trim())
    setMessages(prev => [...prev, userMessage])

    // Set loading state
    setIsLoading(true)

    try {
      // Build messages for API
      const apiMessages = buildAPIMessages(content.trim(), actionType)

      // Send to OpenAI
      const response = await sendOpenAIMessage(apiMessages, {
        max_tokens: 800,
        temperature: 0.7,
        stream: false
      })

      if (response.error) {
        // Handle API errors with user-friendly messages
        const errorMessage = createMessage(
          'assistant',
          `I'm having trouble connecting right now. ${getErrorMessage(response.error)} Let me try to help you anyway - could you rephrase your question?`
        )
        setMessages(prev => [...prev, errorMessage])
      } else {
        // Add successful AI response
        const assistantMessage = createMessage('assistant', response.content)
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Chat error:', error)
      
      // Add user-friendly error message
      const errorMessage = createMessage(
        'assistant',
        "I'm experiencing some technical difficulties right now. Please try again in a moment, and I'll do my best to help you with your studies! 📚"
      )
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [createMessage, buildAPIMessages])

  /**
   * Clear messages for the current subject only
   */
  const clearMessages = useCallback(() => {
    setMessages([])
    try {
      const storageKey = getStorageKey(subject)
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.warn(`Failed to clear messages for ${subject} from localStorage:`, error)
    }
  }, [subject])

  /**
   * Get user-friendly error message based on error type
   * @param {string} error - The error message from OpenAI API
   * @returns {string} User-friendly error explanation
   */
  const getErrorMessage = (error) => {
    if (error.includes('401') || error.includes('Invalid API key')) {
      return 'There seems to be an authentication issue.'
    }
    if (error.includes('429') || error.includes('rate limit')) {
      return 'I need to slow down a bit due to high usage.'
    }
    if (error.includes('500') || error.includes('server')) {
      return 'The AI service is temporarily unavailable.'
    }
    if (error.includes('network') || error.includes('connection')) {
      return 'There seems to be a connection issue.'
    }
    return 'Something unexpected happened.'
  }

  // Return the hook interface
  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages
  }
}

/**
 * Utility function to estimate token count for message management
 * Rough approximation: 1 token ≈ 4 characters
 * @param {string} text - Text to estimate
 * @returns {number} Estimated token count
 */
export function estimateTokens(text) {
  return Math.ceil(text.length / 4)
}

/**
 * Check if conversation is getting too long and suggest clearing
 * @param {Array} messages - Current messages array
 * @returns {boolean} Whether conversation should be cleared
 */
export function shouldSuggestClear(messages) {
  const totalLength = messages.reduce((acc, msg) => acc + msg.content.length, 0)
  const estimatedTokens = estimateTokens(totalLength.toString())
  
  // Suggest clearing if over ~3000 tokens to maintain quality and reduce costs
  return estimatedTokens > 3000
}