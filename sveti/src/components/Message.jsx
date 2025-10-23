import PropTypes from 'prop-types'
import { useMemo } from 'react'

/**
 * Chat message bubble component for Sveti
 * Displays user and assistant messages with proper styling and timestamps
 */
function Message({ role, content, timestamp }) {
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
            <p className="leading-relaxed break-words text-base font-medium">
              {content}
            </p>
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
              <p className="leading-relaxed break-words text-base">
                {content}
              </p>
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