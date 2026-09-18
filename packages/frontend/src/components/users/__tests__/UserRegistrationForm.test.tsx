import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserRegistrationForm } from '../UserRegistrationForm';
import type { User } from '../../../data/types';

describe('UserRegistrationForm', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const mockUser: User = {
    id: 'usr-101',
    username: 'elena.rostova',
    fullName: 'Elena Rostova',
    email: 'elena.rostova@happycoffee.io',
    jobTitle: 'Data Lead',
    role: 'Data Platform Admin',
    department: 'Data Platform & Infrastructure',
    officeLocation: 'Seattle Roastery HQ',
    status: 'Active',
    clearanceLevel: 'Restricted / PII',
    accessibleEnvironments: ['Production'],
    authorizedWarehouses: ['Snowflake Analytics'],
    preferences: {
      emailAlerts: true,
      slackAlerts: true,
      pagerDutyAlerts: false,
      weeklySpendDigest: true,
      dataQualityIncidentAlerts: true,
      timezone: 'America/Los_Angeles',
    },
    compliance: {
      ndaSigned: true,
      piiDataHandlingCertified: true,
      soc2Acknowledged: true,
      mfaMethod: 'Hardware Key (FIDO2)',
    },
    createdAt: new Date(),
    lastActiveAt: new Date(),
  };

  it('renders modal when open', () => {
    render(
      <UserRegistrationForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Enterprise User Registration')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Elena Rostova')).toBeInTheDocument();
  });

  it('validates required fields on step 1 before proceeding', () => {
    render(
      <UserRegistrationForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const nextBtn = screen.getByText('Next Step');
    fireEvent.click(nextBtn);

    expect(screen.getByText('Full Name is required.')).toBeInTheDocument();
  });

  it('loads quick template presets correctly', () => {
    render(
      <UserRegistrationForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const engineerPreset = screen.getByText(/Data Engineer/i);
    fireEvent.click(engineerPreset);

    const nameInput = screen.getByPlaceholderText('e.g. Elena Rostova') as HTMLInputElement;
    expect(nameInput.value).toBe('Lucas Silva');
  });

  it('populates fields when editing an existing user', () => {
    render(
      <UserRegistrationForm
        isOpen={true}
        initialUser={mockUser}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Edit Member Profile')).toBeInTheDocument();
    const nameInput = screen.getByDisplayValue('Elena Rostova');
    expect(nameInput).toBeInTheDocument();
  });
});
