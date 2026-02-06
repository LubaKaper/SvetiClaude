import { useState } from 'react'

function TestOpenAI() {
  const [testResult, setTestResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const runTest = async (testType) => {
    setIsLoading(true)
    setTestResult(`Running ${testType} test...`)
    
    try {
      const { sendMessage } = await import('../utils/openai')
      
      let messages = []
      
      switch (testType) {
        case 'connection':
          messages = [
            { role: 'system', content: 'You are a helpful assistant. Respond with just "API connection successful!"' },
            { role: 'user', content: 'Test connection' }
          ]
          break
          
        case 'math':
          messages = [
            { role: 'system', content: 'You are a friendly math tutor.' },
            { role: 'user', content: 'What is 2 + 2? Explain briefly.' }
          ]
          break
          
        case 'algebra':
          messages = [
            { role: 'system', content: 'You are Sveti, a patient algebra tutor.' },
            { role: 'user', content: 'Explain what algebra is in simple terms.' }
          ]
          break
          
        case 'english':
          messages = [
            { role: 'system', content: 'You are a helpful English writing tutor.' },
            { role: 'user', content: 'Help me write a good opening sentence.' }
          ]
          break
          
        case 'visual':
          messages = [
            { role: 'system', content: 'Use a VISUAL learning approach: Create clear step-by-step numbered layouts. Use structured formatting.' },
            { role: 'user', content: 'Explain fractions using visual learning style.' }
          ]
          break

        case 'gameContext':
          // Clear all sveti- localStorage keys
          console.log('🧹 Clearing all sveti- localStorage keys...')
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sveti-')) {
              localStorage.removeItem(key)
              console.log(`   Cleared: ${key}`)
            }
          })
          
          // Send three sequential messages
          const testMessages = [
            'Explain slope',  
            'Show steps',
            'Practice please'
          ]
          
          console.log('🎮 Starting Game Context Smoke Test...')
          let gameTestResults = []
          
          for (let i = 0; i < testMessages.length; i++) {
            const userMsg = testMessages[i]
            console.log(`📤 Step ${i + 1}: Sending "${userMsg}"`)
            
            const testMsgs = [
              { role: 'system', content: 'You are Sveti, a friendly algebra tutor with game-based learning.' },
              { role: 'user', content: userMsg }
            ]
            
            try {
              const response = await sendMessage(testMsgs)
              console.log(`📥 Step ${i + 1} Response:`, response.content)
              gameTestResults.push(`Step ${i + 1} - "${userMsg}": ${response.content?.substring(0, 100)}...`)
            } catch (error) {
              console.error(`❌ Step ${i + 1} Error:`, error)
              gameTestResults.push(`Step ${i + 1} - "${userMsg}": ERROR - ${error.message}`)
            }
            
            // Small delay between messages
            await new Promise(resolve => setTimeout(resolve, 500))
          }
          
          setTestResult(`✅ GAME CONTEXT SMOKE TEST COMPLETE:\n${gameTestResults.join('\n\n')}`)
          console.log('🎮 Game Context Smoke Test completed!')
          setIsLoading(false)
          return
          
        default:
          messages = [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Say hello!' }
          ]
      }

      const response = await sendMessage(messages)

      if (response.error) {
        setTestResult(`❌ ${testType.toUpperCase()} TEST FAILED:\n${response.error}`)
      } else {
        setTestResult(`✅ ${testType.toUpperCase()} TEST SUCCESS:\n${response.content}`)
      }
    } catch (error) {
      setTestResult(`❌ ${testType.toUpperCase()} TEST ERROR:\n${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">🧪 OpenAI API Test Suite</h2>
        
        {/* API Status */}
        <div className="mb-6 p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${import.meta.env.VITE_OPENAI_API_KEY ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="font-medium text-gray-900 dark:text-white">
              API Key: {import.meta.env.VITE_OPENAI_API_KEY ? 'Configured ✅' : 'Missing ❌'}
            </span>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => runTest('connection')}
            disabled={isLoading}
            className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
          >
            🔗 Connection Test
          </button>
          
          <button
            onClick={() => runTest('math')}
            disabled={isLoading}
            className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium"
          >
            🧮 Math Test
          </button>
          
          <button
            onClick={() => runTest('algebra')}
            disabled={isLoading}
            className="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 font-medium"
          >
            📐 Algebra Test
          </button>
          
          <button
            onClick={() => runTest('english')}
            disabled={isLoading}
            className="px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 font-medium"
          >
            ✍️ English Test
          </button>
          
          <button
            onClick={() => runTest('visual')}
            disabled={isLoading}
            className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium"
          >
            👁️ Visual Learning Test
          </button>
          
          <button
            onClick={() => runTest('gameContext')}
            disabled={isLoading}
            className="px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 font-medium"
          >
            🎮 Game Context Smoke Test
          </button>
          
          <button
            onClick={() => setTestResult('')}
            disabled={isLoading}
            className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 font-medium"
          >
            🗑️ Clear Results
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="mb-4 flex items-center gap-3 text-blue-600 dark:text-blue-400">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-300">Testing OpenAI API...</span>
          </div>
        )}
        
        {/* Results */}
        {testResult && (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Test Results:</h3>
            <pre className="whitespace-pre-wrap text-sm font-mono overflow-x-auto text-gray-800 dark:text-gray-200">
              {testResult}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default TestOpenAI