import { sendMessage, createSystemMessage, validateMessages } from './openai.js'

/**
 * Test OpenAI API connection and functionality
 * This utility helps verify that the OpenAI integration is working properly
 */

/**
 * Test basic API connection with a simple message
 * @returns {Promise<{success: boolean, message: string, response?: string}>}
 */
export async function testConnection() {
  console.log('🔍 Testing OpenAI API connection...')
  
  const testMessages = [
    createSystemMessage('general'),
    {
      role: 'user',
      content: 'Hello! Can you respond with just "Hello, I am working!" to confirm the connection?'
    }
  ]

  const result = await sendMessage(testMessages, {
    max_tokens: 50,
    temperature: 0.1
  })

  if (result.error) {
    return {
      success: false,
      message: `Connection failed: ${result.error}`
    }
  }

  return {
    success: true,
    message: 'API connection successful!',
    response: result.content
  }
}

/**
 * Test algebra tutoring functionality
 * @returns {Promise<{success: boolean, message: string, response?: string}>}
 */
export async function testAlgebraTutoring() {
  console.log('📐 Testing Algebra tutoring...')
  
  const testMessages = [
    createSystemMessage('algebra'),
    {
      role: 'user',
      content: 'Can you help me solve 2x + 5 = 13? Please explain step by step.'
    }
  ]

  const result = await sendMessage(testMessages, {
    max_tokens: 300,
    temperature: 0.7
  })

  if (result.error) {
    return {
      success: false,
      message: `Algebra test failed: ${result.error}`
    }
  }

  return {
    success: true,
    message: 'Algebra tutoring test successful!',
    response: result.content
  }
}

/**
 * Test English Language Arts tutoring functionality
 * @returns {Promise<{success: boolean, message: string, response?: string}>}
 */
export async function testELATutoring() {
  console.log('📝 Testing ELA tutoring...')
  
  const testMessages = [
    createSystemMessage('ela'),
    {
      role: 'user',
      content: 'Can you help me write a thesis statement for an essay about the importance of reading?'
    }
  ]

  const result = await sendMessage(testMessages, {
    max_tokens: 300,
    temperature: 0.7
  })

  if (result.error) {
    return {
      success: false,
      message: `ELA test failed: ${result.error}`
    }
  }

  return {
    success: true,
    message: 'ELA tutoring test successful!',
    response: result.content
  }
}

/**
 * Test conversation flow with multiple messages
 * @returns {Promise<{success: boolean, message: string, response?: string}>}
 */
export async function testConversationFlow() {
  console.log('💬 Testing conversation flow...')
  
  const testMessages = [
    createSystemMessage('algebra'),
    {
      role: 'user',
      content: 'I need help with quadratic equations.'
    },
    {
      role: 'assistant',
      content: 'I\'d be happy to help you with quadratic equations! They are equations where the highest power of the variable is 2, like ax² + bx + c = 0. What specific aspect would you like to work on?'
    },
    {
      role: 'user',
      content: 'How do I solve x² - 5x + 6 = 0?'
    }
  ]

  const result = await sendMessage(testMessages, {
    max_tokens: 400,
    temperature: 0.7
  })

  if (result.error) {
    return {
      success: false,
      message: `Conversation flow test failed: ${result.error}`
    }
  }

  return {
    success: true,
    message: 'Conversation flow test successful!',
    response: result.content
  }
}

/**
 * Test message validation utility
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function testMessageValidation() {
  console.log('✅ Testing message validation...')
  
  const validMessages = [
    { role: 'system', content: 'You are a tutor' },
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hi there!' }
  ]

  const invalidMessages = [
    { role: 'invalid', content: 'Bad role' },
    { content: 'Missing role' },
    { role: 'user' }, // Missing content
    'not an object'
  ]

  const validResult = validateMessages(validMessages)
  const invalidResult = validateMessages(invalidMessages)

  if (validResult && !invalidResult) {
    return {
      success: true,
      message: 'Message validation working correctly!'
    }
  }

  return {
    success: false,
    message: 'Message validation test failed!'
  }
}

/**
 * Run all tests and return comprehensive results
 * @returns {Promise<{overallSuccess: boolean, results: Array}>}
 */
export async function runAllTests() {
  console.log('🚀 Running comprehensive OpenAI API tests...\n')
  
  const tests = [
    { name: 'API Connection', test: testConnection },
    { name: 'Message Validation', test: testMessageValidation },
    { name: 'Algebra Tutoring', test: testAlgebraTutoring },
    { name: 'ELA Tutoring', test: testELATutoring },
    { name: 'Conversation Flow', test: testConversationFlow }
  ]

  const results = []
  let overallSuccess = true

  for (const { name, test } of tests) {
    try {
      const result = await test()
      results.push({ name, ...result })
      
      console.log(`${result.success ? '✅' : '❌'} ${name}: ${result.message}`)
      if (result.response) {
        console.log(`   Response: ${result.response.substring(0, 100)}${result.response.length > 100 ? '...' : ''}\n`)
      }
      
      if (!result.success) {
        overallSuccess = false
      }
    } catch (error) {
      const errorResult = {
        name,
        success: false,
        message: `Test threw an error: ${error.message}`
      }
      results.push(errorResult)
      overallSuccess = false
      
      console.log(`❌ ${name}: ${errorResult.message}\n`)
    }
  }

  console.log(`\n🎯 Overall Test Result: ${overallSuccess ? 'ALL TESTS PASSED ✅' : 'SOME TESTS FAILED ❌'}`)
  
  return { overallSuccess, results }
}

/**
 * Quick test function for development
 * Just tests connection and logs result to console
 */
export async function quickTest() {
  console.log('⚡ Quick OpenAI API test...')
  
  const result = await testConnection()
  
  if (result.success) {
    console.log('✅ OpenAI API is working!')
    console.log(`Response: "${result.response}"`)
  } else {
    console.error('❌ OpenAI API test failed:')
    console.error(result.message)
  }
  
  return result.success
}