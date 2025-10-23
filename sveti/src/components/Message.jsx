import PropTypes from 'prop-types'
import { useMemo } from 'react'

/**
 * Clean up LaTeX symbols and format text with paragraphs
 */
function cleanAndFormatText(text) {
  if (!text) return []
  
  // Comprehensive LaTeX and markdown cleanup
  let cleaned = text
    // Remove LaTeX delimiters
    .replace(/\\\[/g, '') // Remove \[
    .replace(/\\\]/g, '') // Remove \]
    .replace(/\\\(/g, '') // Remove \(
    .replace(/\\\)/g, '') // Remove \)
    
    // Clean up common LaTeX commands
    .replace(/\\neq/g, '≠') // Not equal
    .replace(/\\leq/g, '≤') // Less than or equal
    .replace(/\\geq/g, '≥') // Greater than or equal
    .replace(/\\pm/g, '±') // Plus minus
    .replace(/\\times/g, '×') // Times
    .replace(/\\div/g, '÷') // Division
    
    // Handle fractions - convert \frac{a}{b} to a/b
    .replace(/\\frac\{\{([^}]+)\}\}\{\{([^}]+)\}\}/g, '($1)/($2)')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    
    // Handle square roots - convert \sqrt{a} to √(a)
    .replace(/\\sqrt\{\{([^}]+)\}\}/g, '√($1)')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    
    // Clean up any remaining backslashes
    .replace(/\\[a-zA-Z]+/g, '') // Remove other LaTeX commands
    .replace(/\\\\/g, '') // Remove double backslashes
    .replace(/\\(?![a-zA-Z])/g, '') // Remove single backslashes not followed by letters
    
    // Handle markdown - convert to simple formatting
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove ** bold markers for now
    .replace(/\*([^*]+)\*/g, '$1') // Remove * italic markers
    
    // Clean up extra braces
    .replace(/\{\{/g, '') // Remove {{
    .replace(/\}\}/g, '') // Remove }}
    .replace(/\{([^}]*)\}/g, '$1') // Remove single braces but keep content
  
  // Create paragraph breaks - split on double newlines first
  let paragraphs = cleaned.split(/\n\s*\n/)
  
  // If no natural paragraph breaks, create them intelligently
  if (paragraphs.length <= 1) {
    // Split on numbered lists or step patterns
    paragraphs = cleaned.split(/(?=\d+\.\s|\*\*|[A-Z][^.]*:)/)
    
    // If still one big chunk, split on sentences ending with period + space + capital
    if (paragraphs.length <= 1) {
      paragraphs = cleaned.split(/(?<=[.!?])\s+(?=[A-Z])/)
    }
  }
  
  // Clean and filter paragraphs
  return paragraphs
    .map(p => p.replace(/\n/g, ' ').trim()) // Convert newlines to spaces, trim
    .filter(p => p.length > 10) // Only keep paragraphs with substance
    .map(p => p.replace(/\s+/g, ' ')) // Normalize whitespace
}

/**
 * Chat message bubble component for Sveti
 * Displays user and assistant messages with proper styling and timestamps
 */
function Message({ role, content, timestamp }) {
  // Debug: log the content to see what we're working with
  if (role === 'assistant') {
    console.log('AI Response content:', JSON.stringify(content))
  }
  
  // Format timestamp to readable format (e.g., "2:45 PM")
  const formattedTime = useMemo(() => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }, [timestamp])

  // User message (student) - aligned right with teal gradient
  if (role === 'user') {
    return (
      <div className="flex justify-end mb-6 animate-fadeIn">
        <div className="max-w-[75%] sm:max-w-[80%] ml-auto">
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white px-6 py-4 rounded-3xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl transform hover:-translate-y-0.5">
            <div className="leading-relaxed break-words text-base font-medium">
              {cleanAndFormatText(content).map((paragraph, index) => (
                <p key={index} className="mb-3 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
          <div className="text-right mt-2 mr-3">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {formattedTime}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Assistant message (AI tutor) - aligned left with sparkle emoji
  return (
    <div className="flex justify-start mb-6 animate-fadeIn">
      <div className="max-w-[75%] sm:max-w-[80%] mr-auto">
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm text-slate-800 dark:text-slate-100 border border-stone-200 dark:border-slate-700 px-6 py-4 rounded-3xl shadow-md transition-all duration-300 ease-in-out hover:shadow-lg transform hover:-translate-y-0.5">
          <div className="flex items-start gap-3">
            <span className="text-xl mt-1 flex-shrink-0 filter drop-shadow-sm" aria-hidden="true">
              ✨
            </span>
            <div className="flex-1">
              <div className="leading-relaxed break-words text-base">
                {cleanAndFormatText(content).map((paragraph, index) => (
                  <p key={index} className="mb-3 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="text-left mt-2 ml-10">
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {formattedTime}
          </span>
        </div>
      </div>
    </div>
  )
}

Message.propTypes = {
  role: PropTypes.oneOf(['user', 'assistant']).isRequired,
  content: PropTypes.string.isRequired,
  timestamp: PropTypes.instanceOf(Date).isRequired
}

export default Message