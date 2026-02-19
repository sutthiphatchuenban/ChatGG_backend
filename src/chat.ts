import 'dotenv/config'
import { Hono } from 'hono';
import axios from 'axios';
import { allModels, getModelById } from './models.js';

const chatRouter = new Hono();

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '';

// Get all available models
chatRouter.get('/models', (c) => {
  return c.json({
    models: allModels.map(model => ({
      id: model.id,
      name: model.name,
      description: model.description,
      supportsImages: model.supportsImages,
      maxTokens: model.maxTokens,
      temperature: model.temperature,
      topP: model.topP
    }))
  });
});

// Natural conversation system prompt
const naturalConversationPrompt = `You are a friendly AI assistant that converses naturally.

Key characteristics:
- Use natural language that is not too formal and not too concise
- Respond like chatting with a friend, not academic lecturing
- Use natural sentence endings like particles or polite forms (based on context), or omit them if appropriate
- Express opinions and emotions appropriately
- Answer straightforwardly for simple questions without unnecessary length
- Provide detailed explanations only when the user wants them
- Use easy-to-understand spoken language, avoiding unnecessary technical jargon
- If unsure, admit uncertainty rather than fabricating answers`;

// Chat completion endpoint with streaming support
chatRouter.post('/completions', async (c) => {
  try {
    const body = await c.req.json();
    const { model, messages, stream = true, temperature, max_tokens, top_p } = body;

    // Validate model
    const modelConfig = getModelById(model);
    if (!modelConfig) {
      return c.json({ error: 'Invalid model ID' }, 400);
    }

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return c.json({ error: 'Messages are required' }, 400);
    }

    // Always add system prompt for natural conversation
    let preparedMessages = messages;
    if (!messages.some((m: any) => m.role === 'system')) {
      preparedMessages = [
        { role: 'system', content: naturalConversationPrompt },
        ...messages
      ];
    }

    // Prepare payload
    const payload = {
      model: model,
      messages: preparedMessages,
      max_tokens: max_tokens || modelConfig.maxTokens,
      temperature: temperature ?? modelConfig.temperature,
      top_p: top_p ?? modelConfig.topP,
      frequency_penalty: modelConfig.frequencyPenalty,
      presence_penalty: modelConfig.presencePenalty,
      stream: stream
    };

    // If streaming is requested
    if (stream) {
      const response = await axios.post(NVIDIA_API_URL, payload, {
        headers: {
          'Authorization': `Bearer ${NVIDIA_API_KEY}`,
          'Accept': 'text/event-stream',
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      });

      // Set headers for SSE
      c.header('Content-Type', 'text/event-stream');
      c.header('Cache-Control', 'no-cache');
      c.header('Connection', 'keep-alive');

      // Create a ReadableStream
      const readableStream = new ReadableStream({
        start(controller) {
          response.data.on('data', (chunk: Buffer) => {
            const text = chunk.toString('utf-8');
            controller.enqueue(new TextEncoder().encode(text));
          });

          response.data.on('end', () => {
            controller.close();
          });

          response.data.on('error', (err: Error) => {
            controller.error(err);
          });
        },
        cancel() {
          response.data.destroy();
        }
      });

      return c.body(readableStream);
    } else {
      // Non-streaming response
      const response = await axios.post(NVIDIA_API_URL, payload, {
        headers: {
          'Authorization': `Bearer ${NVIDIA_API_KEY}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      return c.json(response.data);
    }
  } catch (error) {
    console.error('Chat completion error:', error);
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as import('axios').AxiosError;
      const status = (axiosError.response?.status as 200 | 400 | 401 | 403 | 404 | 500) || 500;
      const errorData = axiosError.response?.data || { error: 'Unknown error' };
      return c.json({
        error: 'NVIDIA API error',
        details: errorData
      }, status);
    }

    return c.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Health check endpoint
chatRouter.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    modelsAvailable: allModels.length
  });
});

export default chatRouter;
