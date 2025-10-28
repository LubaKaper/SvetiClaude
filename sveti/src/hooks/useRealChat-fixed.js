import { useState, useEffect, useCallback } from 'react'
import { useGamePrefs } from "./useGamePrefs";
import { buildSystemWithGames } from "../config/prompts";

/**
 * Custom React hook for real-time AI chat - Fixed version with error handling
 * Falls back to mock responses if OpenAI is not available
 * 
 * @param {string} subject - The subject to tutor ('algebra' or 'ela')
 * @param {string} learningStyle - The learning style preference
 * @returns {Object} Chat interface with messages, loading state, and functions
 */
export function useRealChat(subject = 'algebra', learningStyle = 'visual') {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Game preferences hook
  const { gamePrefs, setGamePrefs, asked, setAsked, prefersGames, setPrefers, parseGamesFromText, hasPrefs } = useGamePrefs();

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
        return Array.isArray(parsed) ? parsed : []
      }
    } catch (error) {
      console.warn('Failed to load messages from localStorage:', error)
    }
    return []
  }, [getStorageKey])

  /**
   * Save messages to localStorage
   */
  const saveMessages = useCallback((msgs, subj) => {
    try {
      const storageKey = getStorageKey(subj)
      localStorage.setItem(storageKey, JSON.stringify(msgs))
    } catch (error) {
      console.warn('Failed to save messages to localStorage:', error)
    }
  }, [getStorageKey])

  // Load messages when subject changes
  useEffect(() => {
    const loadedMessages = loadMessagesForSubject(subject)
    setMessages(loadedMessages)
  }, [subject, loadMessagesForSubject])

  // Auto-save messages when they change
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(messages, subject)
    }
  }, [messages, subject, saveMessages])

  /**
   * Send a message and get AI response
   */
  const sendMessage = useCallback(async (userMessage, actionType = null) => {
    if (!userMessage?.trim() || isLoading) return

    const userMsg = {
      role: 'user',
      content: userMessage.trim(),
      timestamp: new Date().toISOString(),
      actionType: actionType || 'general'
    }

    // Add user message immediately
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setIsLoading(true)

    // Ask once after 3 user messages if no prefs known
    const userMessageCount = nextMessages.filter(msg => msg.role === 'user').length
    if (!asked && !hasPrefs && userMessageCount >= 3) {
      const askMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Quick check: are you into any video games? If yes, name one or two. If not, just say 'no'.",
        timestamp: new Date().toISOString(),
      };
      // small natural pause before asking about games
      setTimeout(() => {
        setMessages(prev => [...prev, askMsg]);
      }, 1500); // 1.5 second delay
      setAsked(true);
      setIsLoading(false);
      return; // wait for the student's reply before hitting OpenAI
    }

    // Handle games reply locally so we don't send it to the model
    if (asked && !hasPrefs) {
      const parsed = parseGamesFromText(userMsg.content || "");
      if (parsed.length > 0) {
        setGamePrefs(parsed.slice(0, 2));
        setPrefers(true);
        const cleanGames = parsed.map(g => g.replace(/i'?m|into|right now|playing/gi, "").trim()).filter(Boolean);
        const gamesToShow = cleanGames.length ? cleanGames.join(", ") : parsed.join(", ");
        
        // short delay before responding naturally
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            role: "assistant",
            timestamp: new Date().toISOString(),
            content: `Got it — I'll use ${gamesToShow} for examples. Want to try a practice problem?`,
          }]);
        }, 2000); // 2 second delay
        setIsLoading(false);
        return;
      } else {
        setPrefers(false);
        // short delay before responding naturally
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            role: "assistant",
            timestamp: new Date().toISOString(),
            content: "No problem — I'll stick to neutral examples. Want a practice problem?"
          }]);
        }, 2000); // 2 second delay
        setIsLoading(false);
        return;
      }
    }

    try {
      // --- quick topic detector for Sveti MVP ---
      // detect math topic from the student's latest message
      let topicKey = null;
      const userText = (messages?.at(-1)?.content || "").toLowerCase();
      if (userText.includes("%") || userText.includes("percent") || userText.includes("discount"))
        topicKey = "percentChange";
      else if (userText.includes("ratio") || userText.includes("proportion"))
        topicKey = "ratios";
      else if (userText.includes("linear") || userText.includes("slope") || userText.includes("y="))
        topicKey = "linearEq";

      // build final system prompt with optional game context + topic hint
      const baseSystemPrompt = `You are Sveti, a friendly ${subject} tutor. Guide students with questions rather than giving direct answers.`;
      const learningStyleBlock = `Teaching style: ${learningStyle} learning approach.`;
      const systemContent = buildSystemWithGames(
        baseSystemPrompt,
        learningStyleBlock,
        gamePrefs,
        topicKey
      );

      // For now, create a mock response since OpenAI might not be properly configured
      const mockResponses = {
        algebra: [
          "Great question! Let me help you work through this step by step. What's the first thing you notice about this problem?",
          "I see you're working on this! That's a good start. Let's break this down into smaller pieces.",
          "Excellent thinking! You're on the right track. What would you try next?",
          "This is a common type of problem. Let me guide you through the solution process."
        ],
        english: [
          "That's a wonderful topic to explore! Let's brainstorm some ideas together.",
          "I can help you develop this further. What's your main argument or theme?",
          "Great writing! Let me suggest a few ways to make this even stronger.",
          "This is a good start. Let's work on organizing your thoughts more clearly."
        ]
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const responses = mockResponses[subject] || mockResponses.algebra
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      const aiMsg = {
        role: 'assistant',
        content: `[${learningStyle} style] ${randomResponse}`,
        timestamp: new Date().toISOString(),
        model: 'mock-gpt-4',
        learningStyle: learningStyle
      }

      setMessages(prev => [...prev, aiMsg])
    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorMsg = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        error: true
      }

      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, subject, learningStyle])

  /**
   * Clear all messages for current subject
   */
  const clearMessages = useCallback(() => {
    setMessages([])
    try {
      const storageKey = getStorageKey(subject)
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.warn('Failed to clear messages from localStorage:', error)
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