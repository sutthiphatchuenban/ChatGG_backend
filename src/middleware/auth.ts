import type { Context, Next } from 'hono';

// API Keys storage (in production, use database)
const VALID_API_KEYS = new Set<string>([
  // Add your valid API keys here
  'chatgg-dev-key-2024',
]);

// Middleware to check API key
export async function apiKeyAuth(c: Context, next: Next) {
  // Skip auth for health check and public endpoints
  const path = c.req.path;
  if (
    path === '/' ||
    path === '/health' ||
    path === '/api' ||
    path === '/api/' ||
    path === '/api/health' ||
    path.startsWith('/api/chat/health')
  ) {
    return next();
  }

  const apiKey = c.req.header('X-API-Key') || c.req.query('api_key');

  if (!apiKey) {
    return c.json({
      error: 'Unauthorized',
      message: 'API key is required. Please provide X-API-Key header or api_key query parameter.'
    }, 401);
  }

  if (!VALID_API_KEYS.has(apiKey)) {
    return c.json({
      error: 'Unauthorized',
      message: 'Invalid API key.'
    }, 401);
  }

  // Store API key info in context for later use
  c.set('apiKey', apiKey);

  await next();
}

// Function to add new API key
export function addApiKey(key: string): boolean {
  if (VALID_API_KEYS.has(key)) {
    return false;
  }
  VALID_API_KEYS.add(key);
  return true;
}

// Function to remove API key
export function removeApiKey(key: string): boolean {
  return VALID_API_KEYS.delete(key);
}

// Function to list all API keys (masked)
export function listApiKeys(): string[] {
  return Array.from(VALID_API_KEYS).map(key => {
    // Show only first 8 and last 4 characters
    if (key.length > 12) {
      return key.substring(0, 8) + '****' + key.substring(key.length - 4);
    }
    return '****';
  });
}
