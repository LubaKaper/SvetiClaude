import OpenAI from 'openai'

/**
 * OpenAI client instance for Sveti AI homework tutor
 * Note: dangerouslyAllowBrowser is enabled for development only
 */
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // For development only - should use backend in production
})

/**
 * Send a message to OpenAI and get a response
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Optional configuration
 * @param {string} options.model - OpenAI model to use (default: 'gpt-4o-mini')
 * @param {number} options.temperature - Response creativity (0-2, default: 0.7)
 * @param {number} options.max_tokens - Maximum response length (default: 1500)
 * @returns {Promise<{content: string, error: null} | {content: null, error: string}>}
 */
export async function sendMessage(messages, options = {}) {
  // Set default options
  const {
    model = 'gpt-4o-mini',
    temperature = 0.7,
    max_tokens = 1500
  } = options

  try {
    // Validate API key
    if (!import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY === 'sk-your-key-goes-here') {
      return {
        content: null,
        error: 'OpenAI API key not configured. Please add your API key to the .env file.'
      }
    }

    // Validate messages array
    if (!Array.isArray(messages) || messages.length === 0) {
      return {
        content: null,
        error: 'Messages array is required and cannot be empty.'
      }
    }

    // Make API call
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
      stream: false
    })

    // Extract response content
    const content = response.choices[0]?.message?.content

    if (!content) {
      return {
        content: null,
        error: 'No response content received from OpenAI.'
      }
    }

    return {
      content: content.trim(),
      error: null
    }

  } catch (error) {
    // Log error for debugging
    console.error('OpenAI API Error:', error)

    // Handle specific error types with user-friendly messages
    if (error.status === 401) {
      return {
        content: null,
        error: 'Invalid OpenAI API key. Please check your API key in the .env file.'
      }
    }

    if (error.status === 429) {
      return {
        content: null,
        error: 'Rate limit exceeded. Please wait a moment before trying again.'
      }
    }

    if (error.status === 402) {
      return {
        content: null,
        error: 'OpenAI account quota exceeded. Please check your billing settings.'
      }
    }

    if (error.status === 503) {
      return {
        content: null,
        error: 'OpenAI service is temporarily unavailable. Please try again later.'
      }
    }

    // Network or connection errors
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('fetch')) {
      return {
        content: null,
        error: 'Network error. Please check your internet connection and try again.'
      }
    }

    // Generic error fallback
    return {
      content: null,
      error: 'An unexpected error occurred. Please try again later.'
    }
  }
}

/**
 * Create a system message for the AI tutor
 * @param {string} subject - The subject being tutored (algebra, ela, etc.)
 * @returns {Object} System message object
 */
export function createSystemMessage(subject = 'general') {
  const systemPrompts = {
    algebra: `You are Sveti, a friendly and encouraging AI homework coach specializing in Algebra. 
    
Your teaching style:
- Break down complex problems into simple, manageable steps
- Always explain the "why" behind each step
- Use encouraging language and celebrate progress
- Provide hints rather than direct answers when possible
- Use real-world examples to make concepts relatable
- Ask guiding questions to help students think through problems

Remember: Your goal is to help students understand and learn, not just get the right answer.`,

    ela: `You are Sveti, a supportive AI homework coach specializing in English Language Arts.

Your teaching approach:
- Help with writing, reading comprehension, grammar, and literature analysis
- Provide constructive feedback on writing assignments
- Guide students through the writing process (brainstorming, outlining, drafting, revising)
- Explain literary concepts with clear examples
- Encourage creativity while maintaining academic standards
- Break down complex texts into understandable parts

Remember: Focus on developing critical thinking and communication skills, not just completion of assignments.`,

    general: `You are Sveti, a knowledgeable and supportive AI homework coach. You help students with various subjects including math, science, English, history, and more.

Your approach:
- Be encouraging and patient with all students
- Explain concepts clearly and step-by-step
- Provide guidance rather than direct answers
- Help students develop problem-solving skills
- Celebrate learning progress and effort
- Adapt your teaching style to each student's needs

Remember: Your goal is to foster understanding and independent learning.`
  }

  return {
    role: 'system',
    content: systemPrompts[subject] || systemPrompts.general
  }
}

/**
 * Validate message format
 * @param {Array} messages - Array of messages to validate
 * @returns {boolean} True if messages are valid
 */
export function validateMessages(messages) {
  if (!Array.isArray(messages)) return false
  
  return messages.every(msg => 
    msg && 
    typeof msg === 'object' && 
    typeof msg.role === 'string' && 
    typeof msg.content === 'string' &&
    ['system', 'user', 'assistant'].includes(msg.role)
  )
}