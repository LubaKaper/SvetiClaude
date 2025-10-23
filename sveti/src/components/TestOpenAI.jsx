import { useState } from 'react'
import { quickTest, runAllTests, testConnection, testAlgebraTutoring, testELATutoring } from '../utils/testOpenAI.js'

export default function TestOpenAI() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState(null)

  const handleQuickTest = async () => {
    setIsRunning(true)
    setResults(null)
    
    console.log('Running quick test...')
    const success = await quickTest()
    
    setResults({
      type: 'quick',
      success,
      message: success ? 'Quick test passed!' : 'Quick test failed!'
    })
    setIsRunning(false)
  }

  const handleFullTests = async () => {
    setIsRunning(true)
    setResults(null)
    
    console.log('Running all tests...')
    const { overallSuccess, results: testResults } = await runAllTests()
    
    setResults({
      type: 'full',
      overallSuccess,
      results: testResults
    })
    setIsRunning(false)
  }

  const handleIndividualTest = async (testName) => {
    setIsRunning(true)
    setResults(null)
    
    console.log(`Running ${testName} test...`)
    
    let testFunction
    switch (testName) {
      case 'connection':
        testFunction = testConnection
        break
      case 'algebra':
        testFunction = testAlgebraTutoring
        break
      case 'ela':
        testFunction = testELATutoring
        break
      default:
        return
    }
    
    const result = await testFunction()
    
    setResults({
      type: 'individual',
      testName,
      ...result
    })
    setIsRunning(false)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OpenAI API Tests</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={handleQuickTest}
          disabled={isRunning}
          className="w-full px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Quick Test'}
        </button>
        
        <button
          onClick={handleFullTests}
          disabled={isRunning}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Run All Tests'}
        </button>
        
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleIndividualTest('connection')}
            disabled={isRunning}
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
          >
            Connection
          </button>
          <button
            onClick={() => handleIndividualTest('algebra')}
            disabled={isRunning}
            className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 text-sm"
          >
            Algebra
          </button>
          <button
            onClick={() => handleIndividualTest('ela')}
            disabled={isRunning}
            className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 text-sm"
          >
            ELA
          </button>
        </div>
      </div>

      {results && (
        <div className="mt-6 p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">Test Results:</h2>
          
          {results.type === 'quick' && (
            <div className={`p-2 rounded ${results.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {results.success ? '✅' : '❌'} {results.message}
            </div>
          )}
          
          {results.type === 'individual' && (
            <div className={`p-2 rounded ${results.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {results.success ? '✅' : '❌'} {results.testName}: {results.message}
              {results.response && (
                <div className="mt-2 text-sm">
                  <strong>Response:</strong> {results.response.substring(0, 200)}...
                </div>
              )}
            </div>
          )}
          
          {results.type === 'full' && (
            <div className="space-y-2">
              <div className={`p-2 rounded font-semibold ${results.overallSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {results.overallSuccess ? '✅ All tests passed!' : '❌ Some tests failed'}
              </div>
              
              {results.results.map((result, index) => (
                <div key={index} className={`p-2 rounded text-sm ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {result.success ? '✅' : '❌'} {result.name}: {result.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-600">
        <p><strong>Note:</strong> Check the browser console (F12) for detailed test output and logs.</p>
      </div>
    </div>
  )
}