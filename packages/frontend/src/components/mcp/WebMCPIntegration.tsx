import { useEffect, useRef } from 'react';
import { useCatalogTools } from './useCatalogTools';

type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  readOnlyHint?: boolean;
  execute: (args: Record<string, unknown>) => ReturnType<ReturnType<typeof useCatalogTools>['executeTool']>;
};

type ModelContext = {
  registerTool: (
    tool: Omit<ToolDefinition, 'execute'> & {
      annotations?: { readOnlyHint?: boolean };
      execute: (args: Record<string, unknown>) => Promise<string>;
    },
    options: { signal: AbortSignal },
  ) => Promise<void>;
};

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
}

// Registers data-portal tools using the current WebMCP imperative API.
export function WebMCPIntegration() {
  const { executeTool } = useCatalogTools();
  const executeToolRef = useRef(executeTool);

  useEffect(() => {
    executeToolRef.current = executeTool;
  });

  useEffect(() => {
    const modelContext = document.modelContext;
    if (!modelContext) {
      console.warn('WebMCP not available (document.modelContext is undefined).');
      return;
    }

    const registration = new AbortController();
    const tools: ToolDefinition[] = [
        {
          name: 'view_home_dashboard',
          description:
            'Navigate to the home dashboard and view top assets. Optionally filter by asset type.',
          inputSchema: {
            type: 'object',
            properties: {
              tab: {
                type: 'string',
                enum: ['all', 'datasets', 'sources', 'pipelines'],
                description: 'The category to view on the dashboard.',
              },
            },
          },
          execute: (args: Record<string, unknown>) =>
            executeToolRef.current('view_home_dashboard', args),
        },
        {
          name: 'search_global_catalog',
          description:
            'Search across all datasets, pipelines, and sources. ' +
            'IMPORTANT: Extract only the core entity name. Do NOT include words like "dataset", "pipeline", or "table".',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description:
                  'Core search term. Use partial strings if exact searches fail. ' +
                  'Example: "Farm Origins" not "Farm Origins dataset".',
              },
              type: {
                type: 'string',
                enum: ['all', 'datasets', 'sources', 'pipelines'],
                description: 'Filter by asset type.',
              },
            },
            required: ['query'],
          },
          execute: (args: Record<string, unknown>) =>
            executeToolRef.current('search_global_catalog', args),
        },
        {
          name: 'filter_datasets',
          description: 'Filter the datasets list by types, tags, or search string.',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search term for dataset name. Strip extraneous words; use partial chunks.',
              },
              types: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['Table', 'View', 'Materialized View', 'External Table'],
                },
              },
              tags: { type: 'array', items: { type: 'string' } },
              sortKey: { type: 'string', enum: ['quality', 'updated', 'name', 'size'] },
              page: { type: 'number' },
            },
          },
          execute: (args: Record<string, unknown>) =>
            executeToolRef.current('filter_datasets', args),
        },
        {
          name: 'view_dataset_details',
          description:
            'View details of a dataset by tab (overview, data, quality, lineage, pipelines, costs). ' +
            'Use "pipelines" to see executions; "costs" to see cost trends.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Dataset ID (e.g. ds-1).' },
              tab: {
                type: 'string',
                enum: ['overview', 'data', 'quality', 'lineage', 'pipelines', 'costs'],
              },
              dateRange: {
                type: 'string',
                enum: ['7', '30', '90'],
                description: 'For the costs tab: days of history.',
              },
            },
            required: ['id', 'tab'],
          },
          execute: (args: Record<string, unknown>) =>
            executeToolRef.current('view_dataset_details', args),
        },
        {
          name: 'filter_pipelines',
          description: 'Filter the pipelines list by statuses, engines, or search.',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search term for pipeline name. Use partial chunks if exact match fails.',
              },
              types: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['Ingestion', 'Transformation', 'Quality Check', 'Export', 'Aggregation'],
                },
              },
              statuses: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['Success', 'Failed', 'Running', 'Cancelled', 'Never'],
                },
              },
              engines: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: [
                    'Fivetran',
                    'Kafka Connect',
                    'Airflow',
                    'dbt',
                    'Spark',
                    'Great Expectations',
                  ],
                },
              },
              scheduleFilter: { type: 'array', items: { type: 'string' } },
              sortKey: { type: 'string', enum: ['name', 'lastRun', 'runs', 'duration'] },
              page: { type: 'number' },
            },
          },
          execute: (args: Record<string, unknown>) =>
            executeToolRef.current('filter_pipelines', args),
        },
        {
          name: 'view_pipeline_details',
          description:
            'View details of a pipeline by tab (overview, runs, lineage, costs). ' +
            'Get the runId from "runs", then call view_pipeline_run_logs for logs.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              tab: { type: 'string', enum: ['overview', 'runs', 'lineage', 'costs'] },
              dateRange: {
                type: 'string',
                enum: ['7', '30', '90'],
                description: 'For the costs tab: days of history.',
              },
            },
            required: ['id', 'tab'],
          },
          execute: (args: Record<string, unknown>) =>
            executeToolRef.current('view_pipeline_details', args),
        },
        {
          name: 'view_pipeline_run_logs',
          description:
            'View granular logs of a specific pipeline run. ' +
            'Get runId first from view_pipeline_details (tab=runs) before calling this.',
          inputSchema: {
            type: 'object',
            properties: {
              pipelineId: { type: 'string' },
              runId: { type: 'string' },
            },
            required: ['pipelineId', 'runId'],
          },
          execute: (args: Record<string, unknown>) =>
            executeToolRef.current('view_pipeline_run_logs', args),
        },
        {
          name: 'trigger_pipeline_execution',
          readOnlyHint: false,
          description:
            'Trigger a new pipeline run on staging or production. ' +
            'Returns the runId. Wait ~10 seconds then call view_pipeline_details (tab=runs) to confirm status.',
          inputSchema: {
            type: 'object',
            properties: {
              pipelineId: { type: 'string' },
              environment: { type: 'string', enum: ['production', 'staging'] },
            },
            required: ['pipelineId', 'environment'],
          },
          execute: (args: Record<string, unknown>) =>
            executeToolRef.current('trigger_pipeline_execution', args),
        },
        {
          name: 'analyze_infrastructure_costs',
          description:
            'View and analyze data platform infrastructure costs with date/category filters. ' +
            'Call autonomously to fetch and summarize costs without asking the user for permission.',
          inputSchema: {
            type: 'object',
            properties: {
              dateRange: { type: 'string', enum: ['7', '15', '30', '60', '90'] },
              category: {
                type: 'string',
                enum: [
                  'Storage',
                  'Compute',
                  'Query',
                  'Transfer',
                  'Licensing',
                  'Infrastructure',
                ],
              },
              entityType: { type: 'string' },
              search: {
                type: 'string',
                description: 'Search term for specific infrastructure components.',
              },
            },
          },
          execute: (args: Record<string, unknown>) =>
            executeToolRef.current('analyze_infrastructure_costs', args),
        },
        {
          name: 'create_user',
          readOnlyHint: false,
          description:
            'Register and provision a new user in the Happy Coffee data portal. Automatically navigates to the user directory.',
          inputSchema: {
            type: 'object',
            properties: {
              fullName: { type: 'string', description: 'Full legal name.' },
              email: { type: 'string', description: 'Corporate email ending with @happycoffee.io.' },
              role: {
                type: 'string',
                enum: [
                  'Data Platform Admin',
                  'Data Steward',
                  'Data Engineer',
                  'Data Analyst',
                  'ML Engineer',
                  'Security & Compliance Officer',
                ],
              },
              department: {
                type: 'string',
                enum: [
                  'Data Platform & Infrastructure',
                  'Analytics & Business Intelligence',
                  'Supply Chain & Sourcing',
                  'Roastery Operations & Quality',
                  'Finance & Commodity Trading',
                  'Governance & Security',
                ],
              },
              jobTitle: { type: 'string' },
              officeLocation: { type: 'string' },
              clearanceLevel: {
                type: 'string',
                enum: ['Public', 'Bronze (Raw)', 'Silver (Cleaned)', 'Gold (Aggregated)', 'Restricted / PII'],
              },
              accessibleEnvironments: {
                type: 'array',
                items: { type: 'string', enum: ['Development', 'Staging', 'Production'] },
              },
              status: {
                type: 'string',
                enum: ['Active', 'Pending Review', 'Suspended'],
              },
              mfaMethod: {
                type: 'string',
                enum: ['Hardware Key (FIDO2)', 'TOTP', 'SMS OTP', 'None'],
              },
            },
            required: ['fullName', 'email', 'role', 'department'],
          },
          execute: (args: Record<string, unknown>) =>
            executeToolRef.current('create_user', args),
        },
        {
          name: 'update_user',
          readOnlyHint: false,
          description:
            'Update profile, clearance level, role, department, or status for an existing user.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'User ID or email address.' },
              patch: {
                type: 'object',
                properties: {
                  fullName: { type: 'string' },
                  email: { type: 'string' },
                  role: {
                    type: 'string',
                    enum: [
                      'Data Platform Admin',
                      'Data Steward',
                      'Data Engineer',
                      'Data Analyst',
                      'ML Engineer',
                      'Security & Compliance Officer',
                    ],
                  },
                  department: {
                    type: 'string',
                    enum: [
                      'Data Platform & Infrastructure',
                      'Analytics & Business Intelligence',
                      'Supply Chain & Sourcing',
                      'Roastery Operations & Quality',
                      'Finance & Commodity Trading',
                      'Governance & Security',
                    ],
                  },
                  jobTitle: { type: 'string' },
                  officeLocation: { type: 'string' },
                  clearanceLevel: {
                    type: 'string',
                    enum: ['Public', 'Bronze (Raw)', 'Silver (Cleaned)', 'Gold (Aggregated)', 'Restricted / PII'],
                  },
                  status: {
                    type: 'string',
                    enum: ['Active', 'Pending Review', 'Suspended', 'Offboarded'],
                  },
                  accessibleEnvironments: {
                    type: 'array',
                    items: { type: 'string', enum: ['Development', 'Staging', 'Production'] },
                  },
                },
              },
            },
            required: ['id'],
          },
          execute: (args: Record<string, unknown>) =>
            executeToolRef.current('update_user', args),
        },
        {
          name: 'filter_users',
          readOnlyHint: true,
          description:
            'Filter and list data portal users by query, role, department, clearance level, or status. Navigates the portal to the users view.',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search term for name, email, or role.' },
              role: {
                type: 'string',
                enum: [
                  'Data Platform Admin',
                  'Data Steward',
                  'Data Engineer',
                  'Data Analyst',
                  'ML Engineer',
                  'Security & Compliance Officer',
                ],
              },
              department: {
                type: 'string',
                enum: [
                  'Data Platform & Infrastructure',
                  'Analytics & Business Intelligence',
                  'Supply Chain & Sourcing',
                  'Roastery Operations & Quality',
                  'Finance & Commodity Trading',
                  'Governance & Security',
                ],
              },
              clearanceLevel: {
                type: 'string',
                enum: ['Public', 'Bronze (Raw)', 'Silver (Cleaned)', 'Gold (Aggregated)', 'Restricted / PII'],
              },
              status: {
                type: 'string',
                enum: ['Active', 'Pending Review', 'Suspended'],
              },
              page: { type: 'number' },
            },
          },
          execute: (args: Record<string, unknown>) =>
            executeToolRef.current('filter_users', args),
        },
        {
          name: 'get_user_details',
          readOnlyHint: true,
          description:
            'Fetch full profile, compliance status, and permissions for a user. Optionally opens the registration edit form.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'User ID or email.' },
              openEditForm: { type: 'boolean' },
            },
            required: ['id'],
          },
          execute: (args: Record<string, unknown>) =>
            executeToolRef.current('get_user_details', args),
        },
        {
          name: 'delete_user',
          readOnlyHint: false,
          description:
            'Deactivate and remove a user from the active portal directory.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'User ID or email address.' },
            },
            required: ['id'],
          },
          execute: (args: Record<string, unknown>) =>
            executeToolRef.current('delete_user', args),
        },
    ];

    void Promise.all(
      tools.map(({ readOnlyHint = true, ...tool }) =>
        modelContext.registerTool(
          {
            ...tool,
            annotations: { readOnlyHint },
            execute: async (args) => {
              const result = await tool.execute(args);
              return result.content.map((item) => item.text).join('\n');
            },
          },
          { signal: registration.signal },
        ),
      ),
    ).catch((error: unknown) => {
      if (!registration.signal.aborted) {
        console.warn('Unable to register WebMCP tools.', error);
      }
    });

    return () => registration.abort();
  }, []);

  return null;
}
