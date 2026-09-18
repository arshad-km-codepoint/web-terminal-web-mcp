import http from 'http';

let sessionId = '';
const req = http.request('http://localhost:3001/mcp/sse', (res) => {
  res.on('data', (chunk) => {
    const text = chunk.toString();
    console.log('SSE EVENT:', text.trim());
    const match = text.match(/sessionId=([a-zA-Z0-9-]+)/);
    if (match && !sessionId) {
      sessionId = match[1];
      console.log('Connected to session:', sessionId);

      const initPayload = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test-client', version: '1.0' } }
      });
      sendPost(initPayload);
    }

    if (text.includes('"id":1')) {
      console.log('\n--- Calling MCP tool: search_global_catalog ---');
      const toolPayload = JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'search_global_catalog',
          arguments: { query: 'Coffee' }
        }
      });
      sendPost(toolPayload);
    }

    if (text.includes('"id":2')) {
      console.log('\nSUCCESS! MCP tool call answered from browser bridge.');
      setTimeout(() => process.exit(0), 500);
    }
  });
});

function sendPost(payload) {
  const postReq = http.request('http://localhost:3001/mcp/messages?sessionId=' + sessionId, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
  });
  postReq.write(payload);
  postReq.end();
}

req.end();
