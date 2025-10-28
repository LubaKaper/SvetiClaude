import PropTypes from 'prop-types'
import { useState, useRef } from 'react'

/**
 * Input area with action chips and textarea for Sveti chat interface
 */
function InputArea({ onSendMessage, isLoading, subject }) {
  const [inputValue, setInputValue] = useState('')
  const [currentActionType, setCurrentActionType] = useState(null)
  const textareaRef = useRef(null)

  // Action chips based on subject
  const getActionChips = () => {
    if (subject === 'algebra') {
      return [
        { text: 'Explain Simply', prompt: 'Please explain this concept in simple terms: ', actionType: 'explain' },
        { text: 'Show Steps', prompt: 'Please show me the step-by-step solution for: ', actionType: 'steps' },
        { text: 'Practice', prompt: 'Can you give me practice problems for: ', actionType: 'practice' },
        { text: 'Check Work', prompt: 'Please check my work on this problem: ', actionType: 'check' }
      ]
    } else { // ELA
      return [
        { text: 'Brainstorm', prompt: 'Help me brainstorm ideas for: ', actionType: 'brainstorm' },
        { text: 'Outline', prompt: 'Help me create an outline for: ', actionType: 'outline' },
        { text: 'Improve', prompt: 'Please help me improve this writing: ', actionType: 'improve' },
        { text: 'Grammar', prompt: 'Please check the grammar in this text: ', actionType: 'grammar' }
      ]
    }
  }

  // Handle chip click
  const handleChipClick = (prompt, actionType) => {
    if (isLoading) return
    setInputValue(prompt)
    setCurrentActionType(actionType)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    
    onSendMessage(inputValue.trim(), currentActionType)
    setInputValue('')
    setCurrentActionType(null) // Reset action type after sending
  }

  // Handle textarea key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    
    // Clear action type if user manually edits (not from chip click)
    if (currentActionType && !getActionChips().some(chip => e.target.value.startsWith(chip.prompt))) {
      setCurrentActionType(null)
    }
    
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 96) + 'px'
    }
  }

  return (
    <div className="border-t border-stone-200 dark:border-gray-600 bg-white/95 dark:bg-gray-700/95 backdrop-blur-sm shadow-lg">
      {/* Action Chips Row */}
      <div className="p-6 pb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-thin">
          {getActionChips().map((chip, index) => (
            <button
              key={index}
              onClick={() => handleChipClick(chip.prompt, chip.actionType)}
              disabled={isLoading}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed min-h-[36px]"
              aria-label={`Use prompt: ${chip.text}`}
            >
              {chip.text}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-6 pt-0">
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="message-input" className="sr-only">
              Type your message
            </label>
            <textarea
              id="message-input"
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={subject === 'algebra' ? 'Ask me anything about Algebra - I\'m here to help!' : 'Ask me anything about English - I\'m here to help!'}
              rows={1}
              className="w-full resize-none rounded-2xl bg-stone-100 dark:bg-gray-600 border-2 border-stone-300 dark:border-gray-500 text-gray-800 dark:text-gray-100 px-5 py-4 text-base leading-relaxed focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-300 ease-in-out scrollbar-thin placeholder-gray-500 dark:placeholder-gray-400"
              style={{ minHeight: '56px', maxHeight: '112px' }}
              disabled={isLoading}
              aria-describedby="message-input-help"
            />
            <div id="message-input-help" className="sr-only">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="flex items-center justify-center px-8 py-4 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white rounded-2xl font-medium text-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-teal-500/20 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-lg shadow-md min-h-[56px] min-w-[56px]"
            aria-label={isLoading ? 'Message is being sent' : 'Send message'}
          >
            <span className="text-sm font-medium">
              {isLoading ? 'Sending...' : 'Send'}
            </span>
          </button>
        </form>
      </div>
    </div>
  )
}

InputArea.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  subject: PropTypes.oneOf(['algebra', 'ela']).isRequired
}

export default InputArea