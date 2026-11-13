/**
 * Learning styles: how Sveti presents an explanation.
 * `prompt` is appended to the system prompt; the rest drives the UI.
 */
export const learningStyles = {
  visual: {
    id: 'visual',
    name: 'Visual',
    description: 'Steps, tables and clear structure',
    prompt:
      'VISUAL: Make it scannable. Use short numbered steps, a small table when comparing values, and line up the math so each step sits on its own line. Bold the key idea in each step.',
  },
  reading: {
    id: 'reading',
    name: 'Reading',
    description: 'Thorough written explanations',
    prompt:
      'READING: Explain in clear, connected paragraphs. Define each term the first time it appears and explain why each step works, not only what to do.',
  },
  examples: {
    id: 'examples',
    name: 'Examples',
    description: 'Learn from worked examples',
    prompt:
      'EXAMPLES: Teach by demonstration. Give a one-sentence idea, then two fully worked examples (the second slightly harder), then one similar problem for the student to try. Do not open with questions.',
  },
  socratic: {
    id: 'socratic',
    name: 'Socratic',
    description: 'Guided questions, you discover it',
    prompt:
      'SOCRATIC: Lead with questions. Ask one focused question at a time, wait for the answer, and build on it. Only explain directly when the student is clearly stuck.',
  },
  analogies: {
    id: 'analogies',
    name: 'Stories',
    description: 'Analogies and mini-stories',
    prompt:
      'STORIES: Open with a short scene or analogy that makes the idea click, then map each part of the story onto the math or writing concept explicitly.',
  },
}

export const DEFAULT_STYLE = 'visual'

export function getLearningStylePrompt(styleKey) {
  return (learningStyles[styleKey] || learningStyles[DEFAULT_STYLE]).prompt
}

export function getAllStyles() {
  return Object.values(learningStyles)
}
