import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';

describe('Chat API Endpoint (DeepSeek)', () => {
  it('returns 400 when messages array is missing or empty', async () => {
    const res = await request(app).post('/api/chat').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns a contextual response for data catalog questions in demo mode', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({
        messages: [{ role: 'user', content: 'Tell me about our data quality' }],
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('text');
    expect(res.body.text.toLowerCase()).toContain('quality');
  });


  it('handles streaming requests with text/event-stream', async () => {
    const res = await request(app)
      .post('/api/chat?stream=true')
      .set('Accept', 'text/event-stream')
      .send({
        messages: [{ role: 'user', content: 'Hello' }],
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/event-stream');
    expect(res.text).toContain('data:');
    expect(res.text).toContain('[DONE]');
  });
});
