import dotenv from 'dotenv';
import OpenAI from 'openai';
import { TOOLS } from '../mcp/mcp-server.js';
import { bridgeManager } from '../mcp/bridge-handler.js';

const SYSTEM_INSTRUCTION = `You are the Happy Coffee AI Data Assistant, an intelligent data catalog copilot powered by DeepSeek.
Happy Coffee is a global coffee exporter data catalog platform managing assets across analytics warehouses, operational databases, and data lakes.

You have access to live data-portal tools to navigate and query the catalog in real time:
- search_global_catalog: Search datasets, pipelines, and sources across the catalog.
- filter_datasets: Filter and list datasets with quality scores, tiers, and tags.
- view_dataset_details: View schema, sample data, quality, lineage, pipelines, or costs for a dataset.
- filter_pipelines: List and filter pipelines by status and engine.
- view_pipeline_details: View pipeline execution runs, lineage, or costs.
- view_pipeline_run_logs: View execution logs for a specific pipeline run.
- trigger_pipeline_execution: Trigger a pipeline execution on staging or production.
- analyze_infrastructure_costs: Analyze compute, storage, and cloud spending.
- view_home_dashboard: Open and view top assets on the home dashboard.
- create_user: Register and provision a new platform user with roles, departments, and clearance.
- update_user: Update profile, clearance tier, department, or status for an existing user.
- filter_users: Search and filter members in the user directory by role, clearance, and status.
- get_user_details: Retrieve full profile, permissions, and compliance info for a user.
- delete_user: Deactivate a user from the directory.

When a user asks you to inspect or run a pipeline (e.g. "Run the X pipeline on staging and check if it succeeds"):
1. First find the pipeline using filter_pipelines or search_global_catalog to get its pipelineId.
2. Then call trigger_pipeline_execution with the pipelineId and environment ("staging" or "production").
3. The portal UI will automatically navigate to that pipeline's execution page and start running live in the browser!
4. Report the runId and status to the user.

Your tone is professional, friendly, concise, and actionable.
Format responses using clear Markdown (bullet points, bold titles, tables, or code blocks where appropriate).`;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: Array<{ role: 'user' | 'model' | 'assistant'; text?: string; content?: string }>;
}

export function* getLocalCatalogResponse(lastQuery: string): Generator<string, void, unknown> {
  const q = lastQuery.toLowerCase();

  if (q.includes('user') || q.includes('member') || q.includes('register') || q.includes('access') || q.includes('clearance')) {
    yield `### 👥 Users & Access Directory (Happy Coffee)\n\n`;
    yield `- **Platform Members:** 12 registered data professionals across global roasteries & hubs\n`;
    yield `- **Clearance Breakdown:** Gold & Restricted PII tiers enforced with Hardware MFA (FIDO2)\n`;
    yield `- **Key Roles:** Data Engineers, Data Analysts, ML Sensory Scientists, and Compliance Stewards\n\n`;
    yield `You can navigate to the **Users** tab to view credentials, filter permissions, or register new team members.`;
  } else if (q.includes('quality') || q.includes('score')) {
    yield `### ☕ Data Quality Summary (Happy Coffee)\n\n`;
    yield `- **Average Catalog Quality:** 78.8 / 100\n`;
    yield `- **Highest Quality:** *Roasting Profiles* (Score: 98, Tier: Bronze) & *Lab Analysis* (Score: 98)\n`;
    yield `- **Needs Attention:** *Shipment Tracking* (Score: 62) & *Pricing History* (Score: 63)\n\n`;
    yield `You can navigate to the **Datasets** tab to view detailed schema validations and completeness metrics.`;
  } else if (q.includes('pipeline') || q.includes('failure') || q.includes('run') || q.includes('sla')) {
    yield `### 🔄 Active Pipelines Overview\n\n`;
    yield `- **Total Pipelines:** 22 registered\n`;
    yield `- **Success Rate:** ~91% in production\n`;
    yield `- **Recent SLA Breaches:** *Warehouse Stock ETL* exceeded runtime SLA by 26 minutes.\n\n`;
    yield `You can view live execution logs and trigger simulated test runs in the **Pipelines** tab.`;
  } else if (q.includes('cost') || q.includes('infrastructure') || q.includes('spend')) {
    yield `### 💰 Monthly Cloud Infrastructure Costs\n\n`;
    yield `- **Total Current Monthly Spend:** ~$797,000\n`;
    yield `- **Top Cost Centers:**\n`;
    yield `  1. Compute (Warehouse queries & transformations): ~$520k\n`;
    yield `  2. Storage (Data Lake & Cold Archival): ~$185k\n`;
    yield `  3. Ingestion & Streaming: ~$92k\n\n`;
    yield `Filter trends by date and warehouse tier under the **Costs** section.`;
  } else {
    yield `Hello! I am your **Happy Coffee Data Catalog Copilot**, powered by **DeepSeek**.\n\n`;
    yield `I can help you navigate datasets, investigate pipeline run logs, check data quality scores, manage platform user accounts, and inspect cloud compute costs.\n\n`;
    yield `**Try asking:**\n`;
    yield `- *"Show me all registered platform users"*\n`;
    yield `- *"What are our lowest quality datasets?"*\n`;
    yield `- *"Show me pipelines with recent SLA warnings"*\n`;
    yield `- *"Break down our cloud infrastructure costs"*\n`;
    yield `- *"How do I track coffee shipment origins?"*`;
  }
}

export function getDeepSeekClient(apiKey: string): OpenAI {
  const baseURL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
  return new OpenAI({
    baseURL,
    apiKey,
  });
}

function getOpenAITools(): OpenAI.Chat.ChatCompletionTool[] {
  return TOOLS.map((t) => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.inputSchema as Record<string, unknown>,
    },
  }));
}

export async function* streamDeepSeekResponse(request: ChatRequest): AsyncGenerator<string, void, unknown> {
  dotenv.config();
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  const lastMsg = request.messages[request.messages.length - 1];
  const lastQuery = lastMsg?.text || lastMsg?.content || '';

  if (!apiKey) {
    yield `*Note: To connect to live DeepSeek API, add your \`DEEPSEEK_API_KEY\` to \`packages/backend/.env\`.*\n\n`;
    yield* getLocalCatalogResponse(lastQuery);
    return;
  }

  const openai = getDeepSeekClient(apiKey);
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

  // Format messages into OpenAI/DeepSeek format
  const formattedMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_INSTRUCTION },
    ...request.messages.map((m) => ({
      role: (m.role === 'model' ? 'assistant' : m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
      content: m.content || m.text || '',
    })),
  ];

  try {
    const maxTurns = 5;
    let turn = 0;

    while (turn < maxTurns) {
      turn++;
      const streamParams: any = {
        model,
        messages: formattedMessages,
        tools: getOpenAITools(),
        tool_choice: 'auto',
        stream: true,
      };

      if (process.env.DEEPSEEK_THINKING === 'true' || model.includes('reasoner') || model.includes('flash')) {
        streamParams.thinking = { type: 'enabled' };
        if (process.env.DEEPSEEK_REASONING_EFFORT) {
          streamParams.reasoning_effort = process.env.DEEPSEEK_REASONING_EFFORT;
        }
      }

      const stream = (await openai.chat.completions.create(streamParams)) as unknown as AsyncIterable<OpenAI.Chat.ChatCompletionChunk>;

      let hasReasoned = false;
      let accumulatedContent = '';
      const toolCallMap: Record<number, { id: string; name: string; arguments: string }> = {};

      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta;
        if (!delta) continue;

        // Handle reasoning_content if returned by thinking/reasoning models
        const reasoningContent = (delta as any).reasoning_content;
        if (reasoningContent) {
          if (!hasReasoned) {
            hasReasoned = true;
            yield '> *Thinking...*\n> ';
          }
          yield reasoningContent.replace(/\n/g, '\n> ');
        }

        if (delta.content) {
          if (hasReasoned) {
            yield '\n\n---\n\n';
            hasReasoned = false;
          }
          accumulatedContent += delta.content;
          yield delta.content;
        }

        // Track any streaming tool calls
        if (delta.tool_calls) {
          for (const tc of delta.tool_calls) {
            const idx = tc.index ?? 0;
            if (!toolCallMap[idx]) {
              toolCallMap[idx] = {
                id: tc.id || `call_${Date.now()}_${idx}`,
                name: tc.function?.name || '',
                arguments: '',
              };
            }
            if (tc.id) {
              toolCallMap[idx].id = tc.id;
            }
            if (tc.function?.name) {
              toolCallMap[idx].name = tc.function.name;
            }
            if (tc.function?.arguments) {
              toolCallMap[idx].arguments += tc.function.arguments;
            }
          }
        }
      }

      const toolCalls = Object.values(toolCallMap);
      if (toolCalls.length === 0) {
        // Model has completed its final response with no more tool calls
        break;
      }

      // Record assistant turn with tool calls
      formattedMessages.push({
        role: 'assistant',
        content: accumulatedContent || null,
        tool_calls: toolCalls.map((tc) => ({
          id: tc.id,
          type: 'function',
          function: {
            name: tc.name,
            arguments: tc.arguments,
          },
        })),
      });

      // Execute each tool call
      for (const tc of toolCalls) {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(tc.arguments || '{}');
        } catch {
          args = {};
        }

        yield `\n\n> 🛠️ *Calling catalog tool:* \`${tc.name}(${tc.arguments || ''})\`...\n\n`;

        let toolResult: unknown;
        try {
          if (bridgeManager.isConnected()) {
            toolResult = await bridgeManager.callTool(tc.name, args);
          } else {
            toolResult = {
              status: 'offline_notice',
              message: `Portal browser bridge is not connected. Keep http://localhost:5173 open to run live browser navigation. Query: ${JSON.stringify(args)}`,
            };
          }
        } catch (err: any) {
          toolResult = { error: err.message || 'Tool execution failed' };
        }

        formattedMessages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult),
        });
      }
      // Loop continues with tool results in context for the next turn
    }
  } catch (error: any) {
    console.warn('DeepSeek API Notice:', error.message || error);
    yield `*DeepSeek API Notice (${error.message || 'connection issue'}). Providing catalog copilot response:*\n\n`;
    yield* getLocalCatalogResponse(lastQuery);
  }
}

export async function getDeepSeekCompletion(request: ChatRequest): Promise<string> {
  dotenv.config();
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  const lastMsg = request.messages[request.messages.length - 1];
  const lastQuery = lastMsg?.text || lastMsg?.content || '';

  if (!apiKey) {
    return Array.from(getLocalCatalogResponse(lastQuery)).join('');
  }

  const openai = getDeepSeekClient(apiKey);
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

  const formattedMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_INSTRUCTION },
    ...request.messages.map((m) => ({
      role: (m.role === 'model' ? 'assistant' : m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
      content: m.content || m.text || '',
    })),
  ];

  try {
    const maxTurns = 5;
    let turn = 0;

    while (turn < maxTurns) {
      turn++;
      const params: any = {
        model,
        messages: formattedMessages,
        tools: getOpenAITools(),
        tool_choice: 'auto',
        stream: false,
      };

      if (process.env.DEEPSEEK_THINKING === 'true' || model.includes('reasoner') || model.includes('flash')) {
        params.thinking = { type: 'enabled' };
        if (process.env.DEEPSEEK_REASONING_EFFORT) {
          params.reasoning_effort = process.env.DEEPSEEK_REASONING_EFFORT;
        }
      }

      const completion = (await openai.chat.completions.create(params)) as OpenAI.Chat.ChatCompletion;
      const choice = completion.choices[0];

      if (choice.message?.tool_calls?.length) {
        formattedMessages.push(choice.message);
        for (const tc of choice.message.tool_calls) {
          const fn = (tc as any).function;
          let args = {};
          try {
            args = JSON.parse(fn?.arguments || '{}');
          } catch {
            args = {};
          }

          let toolResult: unknown;
          try {
            if (bridgeManager.isConnected() && fn?.name) {
              toolResult = await bridgeManager.callTool(fn.name, args);
            } else {
              toolResult = {
                status: 'offline_notice',
                message: `Portal browser bridge is not connected. Query: ${JSON.stringify(args)}`,
              };
            }
          } catch (err: any) {
            toolResult = { error: err.message || 'Tool execution failed' };
          }

          formattedMessages.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult),
          });
        }
      } else {
        return choice.message?.content || '';
      }
    }

    return '';
  } catch (error: any) {
    console.warn('DeepSeek API Notice:', error.message || error);
    return `*DeepSeek API Notice (${error.message || 'connection issue'}). Providing catalog copilot response:*\n\n` +
      Array.from(getLocalCatalogResponse(lastQuery)).join('');
  }
}
