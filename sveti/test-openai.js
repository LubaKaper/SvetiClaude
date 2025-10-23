#!/usr/bin/env node

// Simple Node.js script to test OpenAI API
import 'dotenv/config'
import { OpenAI } from 'openai'

const client = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
})

async function testOpenAI() {
  console.log('🧪 Testing OpenAI API from terminal...\n')
  
  try {
    console.log('📡 Testing API connection...')
    
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'Say "Hello from terminal test!" to confirm the connection is working.'
        }
      ],
      max_tokens: 50,
      temperature: 0.1
    })

    const reply = response.choices[0]?.message?.content?.trim()
    
    if (reply) {
      console.log('✅ API Connection successful!')
      console.log(`📝 Response: "${reply}"`)
      console.log(`💰 Tokens used: ${response.usage?.total_tokens || 'unknown'}`)
    } else {
      console.log('❌ API returned empty response')
    }
    
  } catch (error) {
    console.log('❌ API Test failed:')
    
    if (error.status === 401) {
      console.log('   • Invalid API key')
    } else if (error.status === 429) {
      console.log('   • Rate limit exceeded')
    } else if (error.status === 500) {
      console.log('   • OpenAI server error')
    } else if (error.code === 'ENOTFOUND') {
      console.log('   • Network connection issue')
    } else {
      console.log(`   • Error: ${error.message}`)
    }
  }
}

testOpenAI()