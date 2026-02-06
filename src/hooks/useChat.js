import { useState, useEffect, useCallback } from 'react'
import { useGamePrefs } from './useGamePrefs'
import { buildSystemWithGames } from '../config/prompts'

// Chat hook that handles OpenAI calls with graceful error fallback
export function useChat(subject = 'algebra', learningStyle = 'visual') {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Game preferences hook
  const { gamePrefs, setGamePrefs, asked, setAsked, prefersGames, setPrefers, parseGamesFromText, hasPrefs, resetGamePrefs } = useGamePrefs();

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

    // 🎮 DEBUG: Game Ask Trigger
    console.groupCollapsed("🎮 Game Ask Check");
    console.log("Messages length BEFORE adding new one:", messages?.length);
    console.log("Asked:", asked, "HasPrefs:", hasPrefs, "GamePrefs:", gamePrefs);
    console.groupEnd();

    const newUserMsg = { id: crypto.randomUUID(), role: "user", content: content.trim(), timestamp: new Date() };
    const nextMessages = [...messages, newUserMsg];
    setMessages(nextMessages);

    // Count only USER messages to determine when to ask about games
    const userMessageCount = nextMessages.filter(msg => msg.role === 'user').length;
    console.log("🧮 userMessageCount:", userMessageCount, "totalCount:", nextMessages.length);

    if (!asked && !hasPrefs && userMessageCount >= 3) {
      const askMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Quick check: are you into any video games? If yes, name one or two. If not, just say 'no'.",
        timestamp: new Date(),
      };
      // small natural pause before asking about games
      setTimeout(() => {
        setMessages(prev => [...prev, askMsg]);
      }, 1500); // 1.5 second delay
      setAsked(true);
      console.warn("🎮 Injected game question and returning early.");
      return; // stop before OpenAI call
    }

    // Handle games reply locally so we don't send it to the model
    if (asked && !hasPrefs) {
      const parsed = parseGamesFromText(newUserMsg.content || "");
      console.log("📝 Parsing games from:", newUserMsg.content);
      if (parsed.length > 0) {
        setGamePrefs(parsed.slice(0, 2));
        setPrefers(true);
        console.log("✅ Saved gamePrefs:", parsed.slice(0, 2));
        const cleanGames = parsed.map(g => g.replace(/i'?m|into|right now|playing/gi, "").trim()).filter(Boolean);
        const gamesToShow = cleanGames.length ? cleanGames.join(", ") : parsed.join(", ");

        // short delay before responding naturally
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            role: "assistant",
            timestamp: new Date(),
            content: `Got it — I'll use ${gamesToShow} for examples. Want to try a practice problem?`,
          }]);
        }, 2000); // 2 second delay
        setIsLoading(false);
        return;
      } else {
        setPrefers(false);
        console.log("ℹ️ No valid game names found — user opted out.");
        // short delay before responding naturally
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            role: "assistant",
            timestamp: new Date(),
            content: "No problem — I'll stick to neutral examples. Want a practice problem?"
          }]);
        }, 2000); // 2 second delay
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true)

    try {
      // Try to import and use OpenAI, fallback to mock if it fails
      let aiResponse = null

      try {
        const openAIModule = await import('../utils/openai.js')
        const promptsModule = await import('../config/prompts.js')
        const stylesModule = await import('../config/learningStyles.js')

        const sendOpenAIMessage = openAIModule.sendMessage
        const getSystemPrompt = promptsModule.getSystemPrompt
        const getLearningStylePrompt = stylesModule.getLearningStylePrompt

        // --- quick topic detector for Sveti MVP ---
        // detect math topic from the student's latest message
        let topicKey = null;
        const userText = (nextMessages?.at(-1)?.content || "").toLowerCase();
        if (userText.includes("%") || userText.includes("percent") || userText.includes("discount"))
          topicKey = "percentChange";
        else if (userText.includes("ratio") || userText.includes("proportion"))
          topicKey = "ratios";
        else if (userText.includes("linear") || userText.includes("slope") || userText.includes("y="))
          topicKey = "linearEq";

        // Build system prompt with game context
        const basePrompt = getSystemPrompt(subject, actionType)
        const stylePrompt = getLearningStylePrompt(learningStyle)
        const baseSystemPrompt = `${basePrompt}\n\nTEACHING STYLE:\n${stylePrompt}`

        // build final system prompt with optional game context + topic hint
        const systemContent = buildSystemWithGames(
          baseSystemPrompt,
          stylePrompt,
          gamePrefs,
          topicKey
        );
        console.log("🧩 System prompt preview (first 300 chars):", systemContent.slice(0, 300));

        // Build API messages
        const apiMessages = [
          { role: 'system', content: systemContent },
          ...nextMessages.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
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
      // Clear current subject messages
      localStorage.removeItem(getStorageKey(subject))

      // Clear all subject-specific message keys (in case user switched subjects)
      const subjects = ['algebra', 'english']
      subjects.forEach(subj => {
        localStorage.removeItem(`sveti-messages-${subj}`)
      })

      // Reset game preferences and state
      resetGamePrefs()

      console.log('🧼 Cleared all chat messages and game preferences')
    } catch (error) {
      console.warn('Failed to clear messages:', error)
    }
  }, [subject, getStorageKey, resetGamePrefs])

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    subject,
    learningStyle
  }
}
