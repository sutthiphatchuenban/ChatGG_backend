import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import chatRouter from './chat.js'
import { apiKeyAuth, addApiKey } from './middleware/auth.js'
import { cors } from './middleware/cors.js'

const app = new Hono()

// Load API keys from environment variable
const apiKeysFromEnv = process.env.API_KEYS?.split(',').filter(Boolean) || [];
apiKeysFromEnv.forEach(key => addApiKey(key.trim()));

// Apply CORS middleware
app.use('*', cors)

// Apply API key authentication middleware
app.use('*', apiKeyAuth)

// Mount chat routes
app.route('/api/chat', chatRouter)

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'chatGG API',
    version: '1.0.0',
    description: 'Chat API supporting multiple AI models via NVIDIA',
    endpoints: {
      health: '/api/chat/health',
      models: '/api/chat/models',
      chat: '/api/chat/completions'
    }
  })
})

app.get('/api', (c) => {
  return c.json({
    name: 'chatGG API',
    version: '1.0.0',
    description: 'Chat API supporting multiple AI models via NVIDIA'
  })
})

// Legacy hello endpoint
app.get('/api/hello', (c) => {
  return c.json({
    message: 'Hello from chatGG API!'
  })
})

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000
console.log(`Server is running on http://localhost:${port}`)
console.log(`API endpoints:`)
console.log(`  - GET  http://localhost:${port}/api/chat/health`)
console.log(`  - GET  http://localhost:${port}/api/chat/models`)
console.log(`  - POST http://localhost:${port}/api/chat/completions`)

serve({
  fetch: app.fetch,
  port
})
