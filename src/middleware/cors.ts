import type { Context, Next } from 'hono';

// CORS middleware
export async function cors(c: Context, next: Next) {
  // Get allowed origins from environment variable or allow all in development
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
  const origin = c.req.header('origin') || '';

  // Check if origin is allowed
  const isAllowed = allowedOrigins.includes('*') || allowedOrigins.includes(origin);

  if (isAllowed) {
    c.header('Access-Control-Allow-Origin', origin || '*');
  }

  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  c.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204);
  }

  await next();
}
