import { render } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WebMCPIntegration } from '../WebMCPIntegration';
import { useCatalogData } from '../../../hooks/useCatalogData';

// Mock the dependencies
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

vi.mock('../../../hooks/useCatalogData', () => ({
    useCatalogData: vi.fn(),
}));

describe('WebMCPIntegration', () => {
    let mockNavigate: any;
    let modelContextMock: any;

    beforeEach(() => {
        mockNavigate = vi.fn();
        (useNavigate as any).mockReturnValue(mockNavigate);

        const mockAddUser = vi.fn();
        const mockUpdateUser = vi.fn();
        const mockDeleteUser = vi.fn();

        (useCatalogData as any).mockReturnValue({
            datasets: [{ id: 'ds-1', name: 'mock_dataset', displayName: 'Mock Dataset', type: 'dbt', owner: 'Test', schema: { fields: [] }, sampleData: [], qualityScore: 90 }],
            pipelines: [{ id: 'p-1', name: 'mock_pipeline', displayName: 'Mock Pipeline', inputDatasets: [], outputDatasets: ['ds-1'] }],
            pipelineRuns: [{ pipelineId: 'p-1', id: 'run-1', logs: [{ message: 'Test Log' }] }],
            costs: [{ id: 'c-1', category: 'Compute', subcategory: 'Snowflake Warehouse Credits', entityType: 'Pipeline', entityId: 'p-1', amount: 150.50, currency: 'USD', date: new Date().toISOString(), description: 'Compute cost' }],
            users: [{ id: 'usr-1', fullName: 'Elena Rostova', email: 'elena@happycoffee.io', role: 'Data Platform Admin', department: 'Data Platform & Infrastructure', status: 'Active', clearanceLevel: 'Restricted / PII', accessibleEnvironments: ['Production'], authorizedWarehouses: ['Snowflake Analytics'], preferences: {}, compliance: {}, createdAt: new Date(), lastActiveAt: new Date() }],
            addUser: mockAddUser,
            updateUser: mockUpdateUser,
            deleteUser: mockDeleteUser,
        });

        modelContextMock = {
            registerTool: vi.fn().mockResolvedValue(undefined)
        };
        (global.document as any).modelContext = modelContextMock;
    });

    afterEach(() => {
        vi.clearAllMocks();
        delete (global.document as any).modelContext;
    });

    it('handles missing modelContext safely', () => {
        delete (global.document as any).modelContext;
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        render(
            <MemoryRouter>
                <WebMCPIntegration />
            </MemoryRouter>
        );

        expect(consoleSpy).toHaveBeenCalledWith('WebMCP not available (document.modelContext is undefined).');
        consoleSpy.mockRestore();
    });

    it('registers 14 tools when mounted', () => {
        render(
            <MemoryRouter>
                <WebMCPIntegration />
            </MemoryRouter>
        );

        expect(modelContextMock.registerTool).toHaveBeenCalledTimes(14);
        expect(modelContextMock.registerTool.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
        const triggerTool = modelContextMock.registerTool.mock.calls
            .map(([tool]: [any]) => tool)
            .find((tool: any) => tool.name === 'trigger_pipeline_execution');
        expect(triggerTool.annotations.readOnlyHint).toBe(false);

        const createUserTool = modelContextMock.registerTool.mock.calls
            .map(([tool]: [any]) => tool)
            .find((tool: any) => tool.name === 'create_user');
        expect(createUserTool.annotations.readOnlyHint).toBe(false);
    });

    describe('Tool Execution', () => {
        // Helper to get a registered tool by name
        const getTool = (name: string) => {
            render(
                <MemoryRouter>
                    <WebMCPIntegration />
                </MemoryRouter>
            );
            const tools = modelContextMock.registerTool.mock.calls.map(([tool]: [any]) => tool);
            return tools.find((tool: any) => tool.name === name);
        };

        it('view_home_dashboard navigates correctly', async () => {
            const tool = getTool('view_home_dashboard');
            const result = await tool.execute({ tab: 'datasets' });

            expect(mockNavigate).toHaveBeenCalledWith('/?tab=datasets');
            expect(result).toContain('datasets');
        });

        it('search_global_catalog navigates correctly', async () => {
            const tool = getTool('search_global_catalog');
            await tool.execute({ query: 'test query', type: 'sources' });

            expect(mockNavigate).toHaveBeenCalledWith('/search?q=test%20query&tab=sources');
        });

        it('filter_datasets pushes exact searchParams', async () => {
            const tool = getTool('filter_datasets');
            await tool.execute({ query: 'sales', types: ['dbt', 'sql'], sortKey: 'updated', page: 2 });

            expect(mockNavigate).toHaveBeenCalledWith('/datasets?q=sales&type=dbt&type=sql&sort=updated&page=2');
        });

        it('view_dataset_details paths correctly', async () => {
            const tool = getTool('view_dataset_details');
            await tool.execute({ id: 'ds-1', tab: 'costs', dateRange: '30' });

            expect(mockNavigate).toHaveBeenCalledWith('/datasets/ds-1?tab=costs&dateRange=30');
        });

        it('view_pipeline_details paths correctly for costs', async () => {
            const tool = getTool('view_pipeline_details');
            const result = await tool.execute({ id: 'p-1', tab: 'costs', dateRange: '7' });

            expect(mockNavigate).toHaveBeenCalledWith('/pipelines/p-1?tab=costs&dateRange=7');
            expect(result).toContain('producedDatasets');
            expect(result).toContain('150.5');
        });

        it('view_pipeline_run_logs retrieves logs', async () => {
            const tool = getTool('view_pipeline_run_logs');
            const result = await tool.execute({ pipelineId: 'p-1', runId: 'run-1' });

            expect(mockNavigate).toHaveBeenCalledWith('/pipelines/p-1?tab=runs&run=run-1');
            expect(result).toContain('Test Log');
        });

        it('analyze_infrastructure_costs navigates and computes aggregation correctly', async () => {
            const tool = getTool('analyze_infrastructure_costs');
            const result = await tool.execute({ dateRange: '30', search: 'compute' });

            expect(mockNavigate).toHaveBeenCalledWith('/costs?range=30&q=compute');
            expect(result).toContain('150.50');
            expect(result).toContain('Snowflake');
        });

        it('create_user executes and navigates to users profile', async () => {
            const tool = getTool('create_user');
            const result = await tool.execute({
                fullName: 'Amara Tadesse',
                email: 'amara@happycoffee.io',
                role: 'Data Steward',
                department: 'Supply Chain & Sourcing',
            });

            expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('/users?userId=usr-'));
            expect(result).toContain('Amara Tadesse');
        });

        it('filter_users pushes search params and navigates', async () => {
            const tool = getTool('filter_users');
            const result = await tool.execute({ query: 'elena', role: 'Data Platform Admin' });

            expect(mockNavigate).toHaveBeenCalledWith('/users?q=elena&role=Data+Platform+Admin');
            expect(result).toContain('Elena Rostova');
        });

        it('get_user_details retrieves user profile context', async () => {
            const tool = getTool('get_user_details');
            const result = await tool.execute({ id: 'usr-1' });

            expect(mockNavigate).toHaveBeenCalledWith('/users?userId=usr-1');
            expect(result).toContain('Elena Rostova');
        });

        it('delete_user navigates and deletes user', async () => {
            const tool = getTool('delete_user');
            const result = await tool.execute({ id: 'usr-1' });

            expect(mockNavigate).toHaveBeenCalledWith('/users');
            expect(result).toContain('Deactivated and removed user');
        });
    });
});
