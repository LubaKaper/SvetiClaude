import PropTypes from 'prop-types'
import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'

/**
 * Clean up LaTeX symbols but preserve markdown formatting
 */
function cleanLatexSymbols(text) {
  if (!text) return ''
  
  // Only clean LaTeX symbols, preserve markdown
  return text
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
    
    // Clean up remaining LaTeX commands but preserve markdown
    .replace(/\\[a-zA-Z]+/g, '') // Remove other LaTeX commands
    .replace(/\\\\/g, '') // Remove double backslashes
    .replace(/\\(?![a-zA-Z])/g, '') // Remove single backslashes not followed by letters
    
    // Clean up extra braces
    .replace(/\{\{/g, '') // Remove {{
    .replace(/\}\}/g, '') // Remove }}
    .replace(/\{([^}]*)\}/g, '$1') // Remove single braces but keep content
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
            <div className="leading-relaxed break-words text-base font-medium prose prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-3 mt-4 text-white" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 mt-3 text-white" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-base font-semibold mb-2 mt-2 text-white" {...props} />,
                  h4: ({node, ...props}) => <h4 className="text-sm font-semibold mb-1 mt-2 text-white" {...props} />,
                  p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                  em: ({node, ...props}) => <em className="italic" {...props} />
                }}
              >
                {cleanLatexSymbols(content)}
              </ReactMarkdown>
            </div>
          </div>
          <div className="text-right mt-2 mr-3">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
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
        <div className="bg-white/95 dark:bg-gray-700/95 backdrop-blur-sm text-gray-800 dark:text-gray-100 border border-stone-200 dark:border-gray-600 px-6 py-4 rounded-3xl shadow-md transition-all duration-300 ease-in-out hover:shadow-lg transform hover:-translate-y-0.5">
          <div className="flex items-start gap-3">
            <span className="text-xl mt-1 flex-shrink-0 filter drop-shadow-sm" aria-hidden="true">
              ✨
            </span>
            <div className="flex-1">
              <div className="leading-relaxed break-words text-base prose dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-3 mt-4 text-gray-800 dark:text-gray-100" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 mt-3 text-gray-800 dark:text-gray-100" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-base font-semibold mb-2 mt-2 text-gray-800 dark:text-gray-100" {...props} />,
                    h4: ({node, ...props}) => <h4 className="text-sm font-semibold mb-1 mt-2 text-gray-800 dark:text-gray-100" {...props} />,
                    p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                    em: ({node, ...props}) => <em className="italic" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-3" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-3" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    code: ({node, inline, ...props}) => 
                      inline 
                        ? <code className="bg-gray-100 dark:bg-gray-600 px-1 py-0.5 rounded text-sm font-mono" {...props} />
                        : <code className="block bg-gray-100 dark:bg-gray-600 p-3 rounded text-sm font-mono overflow-x-auto mb-3" {...props} />
                  }}
                >
                  {cleanLatexSymbols(content)}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
        <div className="text-left mt-2 ml-10">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
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