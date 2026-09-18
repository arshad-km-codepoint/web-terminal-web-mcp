import type { Request, Response } from 'express';
import { streamDeepSeekResponse, type ChatRequest } from './deepseek-client.js';

export async function handleChat(req: Request, res: Response): Promise<void> {
  const { messages } = req.body as ChatRequest;

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Invalid or missing messages array' });
    return;
  }

  const isStream = req.headers.accept?.includes('text/event-stream') || req.query.stream === 'true';

  if (isStream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      for await (const chunk of streamDeepSeekResponse({ messages })) {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err: any) {
      console.error('Streaming chat error:', err);
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  } else {
    try {
      let fullText = '';
      for await (const chunk of streamDeepSeekResponse({ messages })) {
        fullText += chunk;
      }
      res.json({ text: fullText });
    } catch (err: any) {
      console.error('Chat error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate response' });
    }
  }
}
