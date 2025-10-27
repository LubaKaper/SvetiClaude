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
    promptModifier: 'Use a VISUAL learning approach: Create clear step-by-step numbered layouts. Use tables and structured formatting. Organize information spatially with clear sections and headers. Use markdown to create visual hierarchy. Break complex ideas into distinct, numbered steps with clear spacing. Make the text layout itself visual and easy to scan.'
  },
  reading: {
    id: 'reading',
    name: 'Reading',
    description: 'Detailed written explanations',
    color: 'from-purple-500 to-pink-500',
    ringColor: 'ring-purple-300 dark:ring-purple-700',
    promptModifier: 'Use a READING/WRITING learning approach: Provide detailed, comprehensive written explanations. Use formal academic language with well-structured paragraphs. Include clear definitions and thorough descriptions. Write in a style optimized for careful reading and note-taking. Be comprehensive and detailed in your explanations.'
  },
  examples: {
    id: 'examples',
    name: 'Examples',
    description: 'Multiple worked examples',
    color: 'from-orange-500 to-red-500',
    ringColor: 'ring-orange-300 dark:ring-orange-700',
    promptModifier: 'Use an EXAMPLE-BASED learning approach: Teach primarily through concrete, worked examples. Show 2-3 complete examples with detailed solutions. Demonstrate the process first, then provide similar practice problems. Focus on "learning by doing" through multiple demonstrations before having the student try.'
  },
  socratic: {
    id: 'socratic',
    name: 'Socratic',
    description: 'Guided questions and discovery',
    color: 'from-emerald-500 to-teal-500',
    ringColor: 'ring-emerald-300 dark:ring-emerald-700',
    promptModifier: 'Use the SOCRATIC METHOD: Guide the student through thoughtful questions. Never give direct answers - instead ask questions that lead them to discover the solution themselves. Help them think through problems by asking "What do you think happens if...?" and "Why do you think that is?" Guide discovery through inquiry.'
  },
  analogies: {
    id: 'analogies',
    name: 'Stories',
    description: 'Real-world analogies and metaphors',
    color: 'from-indigo-500 to-purple-600',
    ringColor: 'ring-indigo-300 dark:ring-indigo-700',
    promptModifier: 'Use an ANALOGY/STORY approach: Explain concepts using real-world analogies, metaphors, and relatable stories. Connect abstract ideas to everyday experiences. Make concepts concrete through creative comparisons. Use "It\'s like when you..." style explanations. Tell stories that illustrate the concept.'
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