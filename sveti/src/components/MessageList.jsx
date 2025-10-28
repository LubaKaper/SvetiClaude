import PropTypes from 'prop-types'
import { useRef, useEffect, useState } from 'react'
import { Sun, Sparkles } from 'lucide-react'
import Message from './Message'

/**
 * Scrollable message list container with empty state and typing indicator
 */
function MessageList({ messages, isLoading, subject = 'algebra' }) {
  const scrollRef = useRef(null)
  const [isDark, setIsDark] = useState(false)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages, isLoading])

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    
    checkDarkMode()
    
    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [])

  // Empty state when no messages and not loading
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full relative overflow-hidden">
        {/* Horizontal glowing light beams - BOTH light and dark mode */}
        <div className="absolute inset-0 flex flex-col justify-center items-center gap-16">
          {/* Top beam */}
          <div className="w-full max-w-4xl">
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400/60 dark:via-amber-400/80 to-transparent shadow-[0_0_20px_rgba(251,191,36,0.4)] dark:shadow-[0_0_30px_rgba(251,191,36,0.6)] animate-pulse" />
          </div>
          
          {/* Middle beam (brighter, main focus) */}
          <div className="w-full max-w-3xl">
            <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-yellow-400/70 dark:via-yellow-300/90 to-transparent shadow-[0_0_30px_rgba(252,211,77,0.5)] dark:shadow-[0_0_40px_rgba(252,211,77,0.7)] animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          
          {/* Bottom beam */}
          <div className="w-full max-w-4xl">
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-300/50 dark:via-amber-300/70 to-transparent shadow-[0_0_15px_rgba(252,211,77,0.3)] dark:shadow-[0_0_25px_rgba(252,211,77,0.5)] animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>

        {/* Text content overlaid on beams */}
        <div className="relative z-10 text-center px-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            Ready to illuminate your learning
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Ask any question about{' '}
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              {subject === 'algebra' ? 'Algebra' : 'English'}
            </span>
            {' '}and let's learn together
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={scrollRef}
      className="h-full overflow-y-auto p-6 scrollbar-thin"
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      {/* Render all messages */}
      {messages.map((message) => (
        <Message
          key={message.id}
          role={message.role}
          content={message.content}
          timestamp={message.timestamp}
        />
      ))}
      
      {/* Warm branded typing indicator when loading */}
      {isLoading && (
        <div className="flex justify-start mb-6 animate-fadeIn">
          <div className="max-w-[75%] sm:max-w-[80%] mr-auto">
            <div className="bg-white/95 dark:bg-gray-700/95 backdrop-blur-sm border border-stone-200 dark:border-gray-600 px-6 py-4 rounded-3xl shadow-md">
              <div className="flex items-center gap-3">
                <span className="text-xl flex-shrink-0 filter drop-shadow-sm" aria-hidden="true">
                  ✨
                </span>
                <div className="flex flex-col gap-2">
                  {/* Branded bouncing dots */}
                  <div className="flex space-x-1" aria-label="Sveti is thinking">
                    <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full animate-bounce shadow-sm"></div>
                    <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full animate-bounce shadow-sm" style={{animationDelay: '150ms'}}></div>
                    <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full animate-bounce shadow-sm" style={{animationDelay: '300ms'}}></div>
                  </div>
                  {/* Branded text */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Sveti is thinking...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

MessageList.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      role: PropTypes.oneOf(['user', 'assistant']).isRequired,
      content: PropTypes.string.isRequired,
      timestamp: PropTypes.instanceOf(Date).isRequired
    })
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
  subject: PropTypes.string
}

export default MessageList