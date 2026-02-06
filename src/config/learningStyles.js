/**
 * Learning Style Configurations for Sveti AI Tutor
 * Personalizes teaching approach based on student's preferred learning modality
 */

export const learningStyles = {
  visual: {
    id: 'visual',
    name: 'Visual',
    description: 'Structured steps, tables, and clear formatting',
    color: 'from-blue-500 to-cyan-500',
    ringColor: 'ring-blue-300 dark:ring-blue-700',
    promptModifier: 'VISUAL approach: Use numbered steps, tables, headers, and clear formatting. Make content scannable.'
  },
  reading: {
    id: 'reading',
    name: 'Reading',
    description: 'Detailed written explanations',
    color: 'from-purple-500 to-pink-500',
    ringColor: 'ring-purple-300 dark:ring-purple-700',
    promptModifier: 'READING approach: Provide detailed, comprehensive explanations with clear definitions.'
  },
  examples: {
    id: 'examples',
    name: 'Examples',
    description: 'Multiple worked examples',
    color: 'from-orange-500 to-red-500',
    ringColor: 'ring-orange-300 dark:ring-orange-700',
    promptModifier: 'Teach through concrete, worked examples. DO NOT ask the student questions - just show examples directly.\n\nStructure your response:\n1. Brief concept explanation (1-2 sentences)\n2. Example 1 with full solution\n3. Example 2 with full solution\n4. Example 3 with full solution (if relevant)\n5. Offer practice problems\n\nStart immediately with examples. Do not ask "What do you know?" or "Can you tell me?" - just demonstrate with clear examples.'
  },
  socratic: {
    id: 'socratic',
    name: 'Socratic',
    description: 'Guided questions and discovery',
    color: 'from-emerald-500 to-teal-500',
    ringColor: 'ring-emerald-300 dark:ring-emerald-700',
    promptModifier: 'SOCRATIC approach: Guide through questions, not direct answers. Ask "What happens if...?"'
  },
  analogies: {
    id: 'analogies',
    name: 'Stories',
    description: 'Real-world analogies and metaphors',
    color: 'from-indigo-500 to-purple-600',
    ringColor: 'ring-indigo-300 dark:ring-indigo-700',
    promptModifier: 'Explain using real-world analogies and stories. DO NOT ask the student questions first - just tell the story/analogy directly.\n\nStructure your response:\n1. Start with "Think of it like this..." or "Imagine..."\n2. Tell the analogy/story that explains the concept\n3. Connect it back to the actual topic\n4. Use everyday experiences they relate to\n\nDo not ask "Have you ever...?" and then answer it yourself. Just tell the story and make the connection. Be direct and engaging.'
  }
}

/**
 * Get the prompt modifier for a specific learning style
 * @param {string} styleKey - The learning style key
 * @returns {string} The prompt modifier text
 */
export function getLearningStylePrompt(styleKey) {
  const style = learningStyles[styleKey]
  return style ? style.promptModifier : learningStyles.visual.promptModifier
}

/**
 * Get all learning styles as an array
 * @returns {Array} Array of learning style objects
 */
export function getAllStyles() {
  return Object.values(learningStyles)
}