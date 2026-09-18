import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsersPage } from '../UsersPage';
import { useCatalogData } from '../../../hooks/useCatalogData';

vi.mock('../../../hooks/useCatalogData', () => ({
  useCatalogData: vi.fn(),
}));

describe('UsersPage', () => {
  const mockAddUser = vi.fn();
  const mockUpdateUser = vi.fn();
  const mockDeleteUser = vi.fn();

  const mockUsers = [
    {
      id: 'usr-101',
      username: 'elena.rostova',
      fullName: 'Elena Rostova',
      email: 'elena.rostova@happycoffee.io',
      jobTitle: 'Data Platform Architect',
      role: 'Data Platform Admin',
      department: 'Data Platform & Infrastructure',
      officeLocation: 'Seattle Roastery HQ',
      status: 'Active',
      clearanceLevel: 'Restricted / PII',
      accessibleEnvironments: ['Production'],
      authorizedWarehouses: ['Snowflake Analytics'],
      preferences: {},
      compliance: {},
      createdAt: new Date(),
      lastActiveAt: new Date(),
    },
    {
      id: 'usr-102',
      username: 'marcus.vance',
      fullName: 'Marcus Vance',
      email: 'marcus.vance@happycoffee.io',
      jobTitle: 'Data Engineer',
      role: 'Data Engineer',
      department: 'Data Platform & Infrastructure',
      officeLocation: 'Seattle Roastery HQ',
      status: 'Active',
      clearanceLevel: 'Gold (Aggregated)',
      accessibleEnvironments: ['Development'],
      authorizedWarehouses: ['Snowflake Analytics'],
      preferences: {},
      compliance: {},
      createdAt: new Date(),
      lastActiveAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useCatalogData as any).mockReturnValue({
      users: mockUsers,
      addUser: mockAddUser,
      updateUser: mockUpdateUser,
      deleteUser: mockDeleteUser,
    });
  });

  it('renders the page header and stat cards', () => {
    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Users & Access Directory')).toBeInTheDocument();
    expect(screen.getByText('Total Registered Users')).toBeInTheDocument();
    expect(screen.getByText('Elena Rostova')).toBeInTheDocument();
    expect(screen.getByText('Marcus Vance')).toBeInTheDocument();
  });

  it('opens registration modal when clicking Register New User', () => {
    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    const registerBtn = screen.getByText('Register New User');
    fireEvent.click(registerBtn);

    expect(screen.getByText('Enterprise User Registration')).toBeInTheDocument();
  });

  it('opens user detail modal when clicking view user icon', () => {
    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    const viewButtons = screen.getAllByTitle('View user details');
    fireEvent.click(viewButtons[0]);

    expect(screen.getByText('Environment & Warehouse Authorizations')).toBeInTheDocument();
  });
});
