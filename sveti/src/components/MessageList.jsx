import PropTypes from 'prop-types'
import { useRef, useEffect } from 'react'
import Message from './Message'

/**
 * Scrollable message list container with empty state and typing indicator
 */
function MessageList({ messages, isLoading }) {
  const scrollRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages, isLoading])

  // Empty state when no messages and not loading
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your conversation will appear here
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
      
      {/* Typing indicator when loading */}
      {isLoading && (
        <div className="flex justify-start mb-6 animate-fadeIn">
          <div className="max-w-[75%] sm:max-w-[80%] mr-auto">
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-stone-200 dark:border-slate-700 px-6 py-4 rounded-3xl shadow-md">
              <div className="flex items-center gap-3">
                <span className="text-xl flex-shrink-0 filter drop-shadow-sm" aria-hidden="true">
                  ✨
                </span>
                <div className="flex space-x-1" aria-label="AI is typing">
                  <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce shadow-sm"></div>
                  <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce shadow-sm" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce shadow-sm" style={{animationDelay: '0.2s'}}></div>
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
  isLoading: PropTypes.bool.isRequired
}

export default MessageList