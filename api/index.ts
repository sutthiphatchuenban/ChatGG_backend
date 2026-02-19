import 'dotenv/config'
import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import chatRouter from '../src/chat.js'
import { apiKeyAuth, addApiKey } from '../src/middleware/auth.js'
import { cors } from 'hono/cors'

const app = new Hono()

// Load API keys from environment variable
const apiKeysFromEnv = process.env.API_KEYS?.split(',').filter(Boolean) || [];
apiKeysFromEnv.forEach(key => addApiKey(key.trim()));

// Apply CORS middleware
app.use('*', cors({
  origin: (origin) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return origin || '*';
    }
    return null; // Block origin
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
}))

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
      health: '/health',
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
app.get('/api/hello', (c) => {
  return c.json({
    message: 'Hello from chatGG API!'
  })
})

// 404 Handler
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: `Path ${c.req.path} not found`,
    availableEndpoints: [
      '/',
      '/health',
      '/api/chat/health',
      '/api/chat/models',
      '/api/chat/completions'
    ]
  }, 404)
})

// Error Handler
app.onError((err, c) => {
  console.error('App Error:', err)
  return c.json({
    error: 'Internal Server Error',
    message: err.message
  }, 500)
})

export default handle(app)
