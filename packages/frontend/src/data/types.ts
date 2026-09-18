export interface Dataset {
  id: string;
  name: string;
  displayName: string;
  type: 'Table' | 'View' | 'Materialized View' | 'External Table';
  schema: {
    database: string;
    schema: string;
  };
  description: string;
  columns: number;
  rows: number;
  sizeBytes: number;
  owner: string;
  tags: string[];
  qualityScore: number;
  criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  freshness: {
    lastUpdated: Date;
    updateFrequency: string;
  };
  source: string;
  createdAt: Date;
  sampleData: Record<string, unknown>[];
  fields: { name: string; type: string; description: string }[];
  qualityDashboard: QualityDashboard;
}

export interface QualityDashboard {
  checksFailed: number;
  checksWarned: number;
  healthScore: number;
  activeChecks: number;
  avgAlertsPerDay: number;
  dailyChecks: { date: string; pass: number; warn: number; fail: number }[];
}

export interface DataSource {
  id: string;
  name: string;
  type: 'Database' | 'API' | 'File' | 'Stream' | 'IoT';
  system: string;
  connectionStatus: 'Connected' | 'Degraded' | 'Disconnected';
  datasetsCount: number;
  lastSync: Date;
  owner: string;
  description: string;
}

export interface Pipeline {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: 'Ingestion' | 'Transformation' | 'Quality Check' | 'Export' | 'Aggregation';
  owner: string;
  schedule: {
    enabled: boolean;
    cron: string;
    timezone: string;
    nextRun: Date;
  } | null;
  engine: string;
  cluster: string;
  inputDatasets: string[];
  outputDatasets: string[];
  tags: string[];
  createdAt: Date;
  lastRunStatus: 'Success' | 'Failed' | 'Running' | 'Cancelled' | 'Never';
  lastRunTime: Date | null;
  avgDuration: number;
  totalRuns: number;
}

export interface PipelineRunLog {
  timestamp: Date;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
}

export interface PipelineRun {
  id: string;
  runNumber: string;
  pipelineId: string;
  pipelineName: string;
  type: 'Ingestion' | 'Transformation' | 'Quality Check' | 'Export' | 'Aggregation';
  status: 'Success' | 'Failed' | 'Running' | 'Cancelled';
  startTime: Date;
  endTime: Date;
  duration: number;
  recordsProcessed: number;
  recordsFailed: number;
  triggerType: 'Scheduled' | 'Manual' | 'Event';
  inputDatasets: string[];
  outputDatasets: string[];
  parameters: Record<string, unknown>;
  logs: PipelineRunLog[];
}

export interface LineageNode {
  id: string;
  type: 'Source' | 'Ingestion' | 'Bronze' | 'Silver' | 'Gold' | 'BI';
  name: string;
  timestamp: Date;
  location: string;
  datasetIds: string[];
  metadata: Record<string, unknown>;
  parentId?: string;
}

export interface QualityEntry {
  id: string;
  timestamp: Date;
  checkType: 'Freshness' | 'Schema' | 'Volume' | 'Accuracy' | 'Completeness';
  severity: 'Info' | 'Warning' | 'Error' | 'Critical';
  datasetId: string;
  datasetName: string;
  message: string;
  rule: string;
  result: 'Passed' | 'Failed' | 'Warning';
  metadata: Record<string, unknown>;
}

export interface CostEntry {
  id: string;
  category: 'Storage' | 'Compute' | 'Query' | 'Transfer' | 'Licensing' | 'Infrastructure';
  subcategory: string;
  entityType: 'Dataset' | 'Pipeline' | 'Source';
  entityId: string;
  amount: number;
  currency: string;
  date: Date;
  description: string;
  breakdown?: {
    item: string;
    cost: number;
  }[];
}

export type UserRole =
  | 'Data Platform Admin'
  | 'Data Steward'
  | 'Data Engineer'
  | 'Data Analyst'
  | 'ML Engineer'
  | 'Security & Compliance Officer';

export type UserDepartment =
  | 'Data Platform & Infrastructure'
  | 'Analytics & Business Intelligence'
  | 'Supply Chain & Sourcing'
  | 'Roastery Operations & Quality'
  | 'Finance & Commodity Trading'
  | 'Governance & Security';

export type UserStatus = 'Active' | 'Pending Review' | 'Suspended' | 'Offboarded';

export type DataClearanceLevel =
  | 'Public'
  | 'Bronze (Raw)'
  | 'Silver (Cleaned)'
  | 'Gold (Aggregated)'
  | 'Restricted / PII';

export type EnvironmentAccess = 'Development' | 'Staging' | 'Production';

export interface UserPreferences {
  theme?: 'dark' | 'light' | 'system';
  emailAlerts: boolean;
  slackAlerts: boolean;
  pagerDutyAlerts: boolean;
  weeklySpendDigest: boolean;
  dataQualityIncidentAlerts: boolean;
  timezone: string;
}

export interface UserCompliance {
  ndaSigned: boolean;
  piiDataHandlingCertified: boolean;
  soc2Acknowledged: boolean;
  mfaMethod: 'TOTP' | 'Hardware Key (FIDO2)' | 'SMS OTP' | 'None';
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  jobTitle: string;
  role: UserRole;
  department: UserDepartment;
  officeLocation: string;
  managerName?: string;
  status: UserStatus;
  clearanceLevel: DataClearanceLevel;
  accessibleEnvironments: EnvironmentAccess[];
  authorizedWarehouses: string[];
  preferences: UserPreferences;
  compliance: UserCompliance;
  assignedDatasetsCount?: number;
  assignedPipelinesCount?: number;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface CatalogData {
  datasets: Dataset[];
  dataSources: DataSource[];
  lineage: LineageNode[];
  pipelines: Pipeline[];
  pipelineRuns: PipelineRun[];
  qualityChecks: QualityEntry[];
  costs: CostEntry[];
  users: User[];
}

