import { describe, it, expect, beforeEach } from 'vitest';
import { useCatalogStore } from '../catalog-store';
import type { PipelineRun } from '../../data/types';

function resetStore() {
  useCatalogStore.setState({
    datasets: [],
    dataSources: [],
    lineage: [],
    pipelines: [],
    pipelineRuns: [],
    qualityChecks: [],
    costs: [],
    users: [],
    initialized: false,
  });
}

describe('useCatalogStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('starts uninitialized with empty collections', () => {
    const state = useCatalogStore.getState();
    expect(state.initialized).toBe(false);
    expect(state.datasets).toHaveLength(0);
    expect(state.pipelines).toHaveLength(0);
    expect(state.users).toHaveLength(0);
  });

  it('initialize() populates all collections', () => {
    useCatalogStore.getState().initialize();
    const state = useCatalogStore.getState();
    expect(state.initialized).toBe(true);
    expect(state.datasets.length).toBeGreaterThan(0);
    expect(state.dataSources.length).toBeGreaterThan(0);
    expect(state.lineage.length).toBeGreaterThan(0);
    expect(state.pipelines.length).toBeGreaterThan(0);
    expect(state.pipelineRuns.length).toBeGreaterThan(0);
    expect(state.qualityChecks.length).toBeGreaterThan(0);
    expect(state.costs.length).toBeGreaterThan(0);
    expect(state.users.length).toBeGreaterThan(0);
  });


  it('regenerate() replaces data with new data', () => {
    useCatalogStore.getState().initialize();
    const firstIds = useCatalogStore.getState().datasets.map((d) => d.id);
    useCatalogStore.getState().regenerate();
    const secondIds = useCatalogStore.getState().datasets.map((d) => d.id);
    expect(secondIds).not.toEqual(firstIds);
  });

  it('addPipelineRun() prepends a run', () => {
    useCatalogStore.getState().initialize();
    const countBefore = useCatalogStore.getState().pipelineRuns.length;
    const newRun = { id: 'test-run-id', pipelineName: 'test' } as PipelineRun;
    useCatalogStore.getState().addPipelineRun(newRun);
    const state = useCatalogStore.getState();
    expect(state.pipelineRuns).toHaveLength(countBefore + 1);
    expect(state.pipelineRuns[0].id).toBe('test-run-id');
  });

  it('updatePipelineRun() patches the correct run', () => {
    useCatalogStore.getState().initialize();
    const targetRun = useCatalogStore.getState().pipelineRuns[0];
    useCatalogStore.getState().updatePipelineRun(targetRun.id, { status: 'Failed' });
    const updated = useCatalogStore.getState().pipelineRuns.find((r) => r.id === targetRun.id);
    expect(updated?.status).toBe('Failed');
  });

  it('updatePipeline() patches the correct pipeline', () => {
    useCatalogStore.getState().initialize();
    const target = useCatalogStore.getState().pipelines[0];
    useCatalogStore.getState().updatePipeline(target.id, { lastRunStatus: 'Failed' });
    const updated = useCatalogStore.getState().pipelines.find((p) => p.id === target.id);
    expect(updated?.lastRunStatus).toBe('Failed');
  });

  it('addUser() adds a new user to the state', () => {
    useCatalogStore.getState().initialize();
    const countBefore = useCatalogStore.getState().users.length;
    const testUser = {
      id: 'usr-new',
      fullName: 'Test User',
      email: 'test@happycoffee.io',
      role: 'Data Engineer' as const,
      department: 'Data Platform & Infrastructure' as const,
      status: 'Active' as const,
      clearanceLevel: 'Silver (Cleaned)' as const,
      accessibleEnvironments: ['Development' as const],
      authorizedWarehouses: ['Snowflake Analytics'],
      preferences: {} as any,
      compliance: {} as any,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      jobTitle: 'Data Engineer',
      officeLocation: 'Seattle Roastery HQ',
      username: 'test.user',
    };
    useCatalogStore.getState().addUser(testUser);
    const state = useCatalogStore.getState();
    expect(state.users).toHaveLength(countBefore + 1);
    expect(state.users[0].id).toBe('usr-new');
  });

  it('updateUser() patches an existing user', () => {
    useCatalogStore.getState().initialize();
    const target = useCatalogStore.getState().users[0];
    useCatalogStore.getState().updateUser(target.id, { jobTitle: 'Chief Coffee Architect' });
    const updated = useCatalogStore.getState().users.find((u) => u.id === target.id);
    expect(updated?.jobTitle).toBe('Chief Coffee Architect');
  });

  it('deleteUser() removes the user from the state', () => {
    useCatalogStore.getState().initialize();
    const target = useCatalogStore.getState().users[0];
    useCatalogStore.getState().deleteUser(target.id);
    const exists = useCatalogStore.getState().users.some((u) => u.id === target.id);
    expect(exists).toBe(false);
  });
});

