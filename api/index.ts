import 'dotenv/config'
import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import chatRouter from '../src/chat.js'
import { apiKeyAuth, addApiKey } from '../src/middleware/auth.js'
import { cors } from '../src/middleware/cors.js'

const app = new Hono().basePath('/api')

// Load API keys from environment variable
const apiKeysFromEnv = process.env.API_KEYS?.split(',').filter(Boolean) || [];
apiKeysFromEnv.forEach(key => addApiKey(key.trim()));

// Apply CORS middleware
app.use('*', cors)

// Apply API key authentication middleware
app.use('*', apiKeyAuth)

// Mount chat routes
app.route('/chat', chatRouter)

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'chatGG API',
    version: '1.0.0',
    description: 'Chat API supporting multiple AI models via NVIDIA',
    endpoints: {
      health: '/api/health',
      chatHealth: '/api/chat/health',
      models: '/api/chat/models',
      chat: '/api/chat/completions'
    }
  })
})

// Global health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'chatGG API'
  })
})

// Legacy hello endpoint (keep for compatibility)
app.get('/hello', (c) => {
  return c.json({
    message: 'Hello from chatGG API!'
  })
})

export default handle(app)
