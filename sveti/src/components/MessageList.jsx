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
      <div className="h-full flex flex-col items-center justify-center relative overflow-hidden p-8">
        {/* Background waves for dark mode */}
        {isDark && (
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
              {/* Multiple wavy lines */}
              {[...Array(10)].map((_, i) => (
                <path
                  key={i}
                  d={`M 0 ${50 + i * 40} Q 200 ${30 + i * 40} 400 ${50 + i * 40} T 800 ${50 + i * 40}`}
                  stroke={`url(#gradient${i})`}
                  strokeWidth="1.5"
                  fill="none"
                  className="animate-wave"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
              {/* Define gradients */}
              <defs>
                {[...Array(10)].map((_, i) => (
                  <linearGradient key={i} id={`gradient${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
                  </linearGradient>
                ))}
              </defs>
            </svg>
          </div>
        )}

        {/* Central glow orb (light mode) or beam (dark mode) */}
        <div className="relative z-10 mb-8">
          {!isDark ? (
            // Light mode: Glowing sun orb with rotating rays
            <div className="relative w-32 h-32">
              {/* Pulse rings */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-yellow-200 rounded-full opacity-20 animate-ping" />
              <div className="absolute inset-2 bg-gradient-to-br from-amber-300 to-yellow-200 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute inset-4 bg-gradient-to-br from-amber-200 to-yellow-100 rounded-full opacity-60 animate-glow-pulse" style={{ animationDelay: '1s' }} />
              
              {/* Central orb with sun icon */}
              <div className="absolute inset-6 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-full flex items-center justify-center shadow-xl">
                <Sun className="w-10 h-10 text-amber-700" strokeWidth={2} />
              </div>
              
              {/* Light rays */}
              <div className="absolute inset-0 animate-spin-slow">
                {[0, 60, 120, 180, 240, 300].map((angle) => (
                  <div
                    key={angle}
                    className="absolute w-1 h-20 bg-gradient-to-t from-amber-400/40 to-transparent"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `rotate(${angle}deg) translateY(-50px)`,
                      transformOrigin: 'center',
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            // Dark mode: Vertical beam with sparkles
            <div className="relative w-32 h-32">
              {/* Vertical beam background */}
              <div className="absolute inset-0 bg-gradient-to-b from-amber-400/20 via-yellow-300/10 to-transparent blur-xl animate-glow-pulse" />
              <div className="absolute inset-4 bg-gradient-to-b from-amber-500/30 via-yellow-400/20 to-transparent blur-lg animate-pulse" style={{ animationDelay: '0.5s' }} />
              
              {/* Central orb with sparkles icon */}
              <div className="absolute inset-6 bg-gradient-to-br from-amber-500 to-yellow-400 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/50 animate-glow-pulse">
                <Sparkles className="w-10 h-10 text-white" strokeWidth={2} />
              </div>
            </div>
          )}
        </div>

        {/* Text content */}
        <div className="relative z-10 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">
            Ready to illuminate your learning
          </h2>
          <p className="text-base text-gray-500 dark:text-gray-400 max-w-md px-4 leading-relaxed">
            Ask any question about{' '}
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {subject === 'algebra' ? 'Algebra' : subject === 'ela' ? 'English' : subject}
            </span>{' '}
            and let's learn together
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
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-stone-200 dark:border-slate-700 px-6 py-4 rounded-3xl shadow-md">
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