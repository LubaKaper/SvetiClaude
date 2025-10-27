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
    promptModifier: 'EXAMPLES approach: Teach through 2-3 worked examples with complete solutions.'
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
    promptModifier: 'STORIES approach: Use real-world analogies and "It\'s like when you..." explanations.'
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