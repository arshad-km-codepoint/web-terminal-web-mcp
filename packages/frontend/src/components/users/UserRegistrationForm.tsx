import { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Shield,
  CheckCircle2,
  Sparkles,
  Globe,
  Database,
  ArrowRight,
  ArrowLeft,
  X,
  Lock,
  Mail,
  Phone,
  Briefcase,
  Layers,
  Server,
} from 'lucide-react';
import type {
  User,
  UserRole,
  UserDepartment,
  UserStatus,
  DataClearanceLevel,
  EnvironmentAccess,
  UserPreferences,
  UserCompliance,
} from '../../data/types';

interface UserRegistrationFormProps {
  initialUser?: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: User) => void;
}

const ROLES: { role: UserRole; desc: string; icon: any }[] = [
  {
    role: 'Data Platform Admin',
    desc: 'Full access to warehouse administration, user provisioning, and catalog management.',
    icon: Shield,
  },
  {
    role: 'Data Steward',
    desc: 'Oversees schema metadata, data quality policies, and compliance workflows.',
    icon: Layers,
  },
  {
    role: 'Data Engineer',
    desc: 'Builds, maintains, and triggers pipelines and telemetry ingestion feeds.',
    icon: Server,
  },
  {
    role: 'Data Analyst',
    desc: 'Queries conformed datasets, creates dashboards, and monitors business metrics.',
    icon: Database,
  },
  {
    role: 'ML Engineer',
    desc: 'Trains predictive models on sensory analysis, yield, and futures forecasts.',
    icon: Sparkles,
  },
  {
    role: 'Security & Compliance Officer',
    desc: 'Audits access logs, manages SOC2 controls, and enforces PII data boundaries.',
    icon: Lock,
  },
];

const DEPARTMENTS: UserDepartment[] = [
  'Data Platform & Infrastructure',
  'Analytics & Business Intelligence',
  'Supply Chain & Sourcing',
  'Roastery Operations & Quality',
  'Finance & Commodity Trading',
  'Governance & Security',
];

const CLEARANCE_LEVELS: { level: DataClearanceLevel; color: string; desc: string }[] = [
  { level: 'Public', color: 'bg-cream-100 text-cream-700 border-cream-300', desc: 'Marketing stats & public commodity indexes' },
  { level: 'Bronze (Raw)', color: 'bg-amber-100 text-amber-800 border-amber-300', desc: 'Unprocessed telemetry & external vendor extracts' },
  { level: 'Silver (Cleaned)', color: 'bg-slate-200 text-slate-800 border-slate-300', desc: 'Standardized tables & cleansed operational logs' },
  { level: 'Gold (Aggregated)', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', desc: 'Financial aggregations & enterprise reporting cubes' },
  { level: 'Restricted / PII', color: 'bg-red-100 text-red-800 border-red-300', desc: 'Customer identities, secret roasting recipes & contracts' },
];

const WAREHOUSE_OPTIONS = [
  'Snowflake Analytics',
  'Databricks ML Lakehouse',
  'BigQuery EU',
  'Kafka Streaming Cluster',
  'IoT Logistics Ingestion',
  'Great Expectations Store',
  'AWS Cost Explorer Feed',
];

const OFFICE_LOCATIONS = [
  'Seattle Roastery HQ',
  'Addis Ababa Sourcing Hub',
  'Bogotá Trading Desk',
  'Tokyo Innovation Roastery',
  'Amsterdam Global Trade HQ',
  'Berlin Roastery Hub',
  'Santos Port Office (Brazil)',
  'Bangalore Technology Center',
  'Dubai Logistics Center',
  'Paris Boutique & Lab',
];

const TIMEZONES = [
  'America/Los_Angeles',
  'America/New_York',
  'America/Bogota',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Amsterdam',
  'Europe/Berlin',
  'Europe/Paris',
  'Africa/Addis_Ababa',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Tokyo',
];

export function UserRegistrationForm({
  initialUser,
  isOpen,
  onClose,
  onSubmit,
}: UserRegistrationFormProps) {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [officeLocation, setOfficeLocation] = useState(OFFICE_LOCATIONS[0]);
  const [avatarUrl, setAvatarUrl] = useState('');

  const [department, setDepartment] = useState<UserDepartment>(DEPARTMENTS[0]);
  const [role, setRole] = useState<UserRole>('Data Engineer');
  const [managerName, setManagerName] = useState('Elena Rostova');

  const [clearanceLevel, setClearanceLevel] = useState<DataClearanceLevel>('Silver (Cleaned)');
  const [accessibleEnvironments, setAccessibleEnvironments] = useState<EnvironmentAccess[]>([
    'Development',
    'Staging',
  ]);
  const [authorizedWarehouses, setAuthorizedWarehouses] = useState<string[]>([
    'Snowflake Analytics',
  ]);

  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'dark',
    emailAlerts: true,
    slackAlerts: true,
    pagerDutyAlerts: false,
    weeklySpendDigest: true,
    dataQualityIncidentAlerts: true,
    timezone: 'America/Los_Angeles',
  });

  const [compliance, setCompliance] = useState<UserCompliance>({
    ndaSigned: true,
    piiDataHandlingCertified: true,
    soc2Acknowledged: true,
    mfaMethod: 'Hardware Key (FIDO2)',
  });

  const [status, setStatus] = useState<UserStatus>('Active');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialUser) {
      setFullName(initialUser.fullName);
      setEmail(initialUser.email);
      setUsername(initialUser.username);
      setPhoneNumber(initialUser.phoneNumber || '');
      setJobTitle(initialUser.jobTitle);
      setOfficeLocation(initialUser.officeLocation);
      setAvatarUrl(initialUser.avatarUrl || '');
      setDepartment(initialUser.department);
      setRole(initialUser.role);
      setManagerName(initialUser.managerName || '');
      setClearanceLevel(initialUser.clearanceLevel);
      setAccessibleEnvironments(initialUser.accessibleEnvironments);
      setAuthorizedWarehouses(initialUser.authorizedWarehouses);
      setPreferences(initialUser.preferences);
      setCompliance(initialUser.compliance);
      setStatus(initialUser.status);
    } else {
      resetForm();
    }
    setStep(1);
    setErrors({});
  }, [initialUser, isOpen]);

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setUsername('');
    setPhoneNumber('');
    setJobTitle('');
    setOfficeLocation(OFFICE_LOCATIONS[0]);
    setAvatarUrl('');
    setDepartment(DEPARTMENTS[0]);
    setRole('Data Engineer');
    setManagerName('Elena Rostova');
    setClearanceLevel('Silver (Cleaned)');
    setAccessibleEnvironments(['Development', 'Staging']);
    setAuthorizedWarehouses(['Snowflake Analytics']);
    setPreferences({
      theme: 'dark',
      emailAlerts: true,
      slackAlerts: true,
      pagerDutyAlerts: false,
      weeklySpendDigest: true,
      dataQualityIncidentAlerts: true,
      timezone: 'America/Los_Angeles',
    });
    setCompliance({
      ndaSigned: true,
      piiDataHandlingCertified: true,
      soc2Acknowledged: true,
      mfaMethod: 'Hardware Key (FIDO2)',
    });
    setStatus('Active');
  };

  const handleNameChange = (name: string) => {
    setFullName(name);
    if (!initialUser && !username) {
      const suggested = name
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, '.');
      setUsername(suggested);
      if (!email && suggested) {
        setEmail(`${suggested}@happycoffee.io`);
      }
    }
  };

  const loadPresetTemplate = (type: 'engineer' | 'analyst' | 'scientist' | 'officer') => {
    if (type === 'engineer') {
      setFullName('Lucas Silva');
      setEmail('lucas.silva@happycoffee.io');
      setUsername('lucas.silva');
      setJobTitle('Lead Data Pipeline Architect');
      setDepartment('Data Platform & Infrastructure');
      setRole('Data Engineer');
      setClearanceLevel('Gold (Aggregated)');
      setAccessibleEnvironments(['Development', 'Staging', 'Production']);
      setAuthorizedWarehouses(['Snowflake Analytics', 'Kafka Streaming Cluster', 'IoT Logistics Ingestion']);
      setCompliance({ ndaSigned: true, piiDataHandlingCertified: true, soc2Acknowledged: true, mfaMethod: 'Hardware Key (FIDO2)' });
    } else if (type === 'analyst') {
      setFullName('Sara Jenkins');
      setEmail('sara.jenkins@happycoffee.io');
      setUsername('sara.jenkins');
      setJobTitle('Senior Commercial Analytics Specialist');
      setDepartment('Analytics & Business Intelligence');
      setRole('Data Analyst');
      setClearanceLevel('Silver (Cleaned)');
      setAccessibleEnvironments(['Development', 'Staging']);
      setAuthorizedWarehouses(['Snowflake Analytics']);
      setCompliance({ ndaSigned: true, piiDataHandlingCertified: true, soc2Acknowledged: true, mfaMethod: 'TOTP' });
    } else if (type === 'scientist') {
      setFullName('Dr. Wei Zhang');
      setEmail('wei.zhang@happycoffee.io');
      setUsername('wei.zhang');
      setJobTitle('Staff Sensory ML Scientist');
      setDepartment('Roastery Operations & Quality');
      setRole('ML Engineer');
      setClearanceLevel('Restricted / PII');
      setAccessibleEnvironments(['Development', 'Staging', 'Production']);
      setAuthorizedWarehouses(['Databricks ML Lakehouse', 'Snowflake Analytics']);
      setCompliance({ ndaSigned: true, piiDataHandlingCertified: true, soc2Acknowledged: true, mfaMethod: 'Hardware Key (FIDO2)' });
    } else if (type === 'officer') {
      setFullName('Karin Lindqvist');
      setEmail('karin.lindqvist@happycoffee.io');
      setUsername('karin.lindqvist');
      setJobTitle('Global Data Protection Officer');
      setDepartment('Governance & Security');
      setRole('Security & Compliance Officer');
      setClearanceLevel('Restricted / PII');
      setAccessibleEnvironments(['Production']);
      setAuthorizedWarehouses(['Snowflake Analytics', 'BigQuery EU', 'Great Expectations Store']);
      setCompliance({ ndaSigned: true, piiDataHandlingCertified: true, soc2Acknowledged: true, mfaMethod: 'Hardware Key (FIDO2)' });
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!fullName.trim()) newErrors.fullName = 'Full Name is required.';
      if (!email.trim()) {
        newErrors.email = 'Corporate email is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'Please provide a valid email address.';
      }
      if (!username.trim()) newErrors.username = 'Username is required.';
      if (!jobTitle.trim()) newErrors.jobTitle = 'Job title is required.';
    }

    if (currentStep === 2) {
      if (!managerName.trim()) newErrors.managerName = 'Reporting manager is required.';
    }

    if (currentStep === 3) {
      if (accessibleEnvironments.length === 0) {
        newErrors.accessibleEnvironments = 'Select at least one accessible environment.';
      }
      if (authorizedWarehouses.length === 0) {
        newErrors.authorizedWarehouses = 'Select at least one authorized warehouse cluster.';
      }
    }

    if (currentStep === 5) {
      if (!compliance.soc2Acknowledged) {
        newErrors.soc2 = 'SOC-2 security acknowledgment is mandatory for portal provisioning.';
      }
      if (!compliance.ndaSigned) {
        newErrors.nda = 'Corporate NDA acknowledgment is required.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    const finalUser: User = {
      id: initialUser ? initialUser.id : `usr-${Date.now().toString().slice(-4)}`,
      username: username.trim(),
      fullName: fullName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
      avatarUrl: avatarUrl.trim() || undefined,
      jobTitle: jobTitle.trim(),
      role,
      department,
      officeLocation,
      managerName: managerName.trim() || undefined,
      status,
      clearanceLevel,
      accessibleEnvironments,
      authorizedWarehouses,
      preferences,
      compliance,
      assignedDatasetsCount: initialUser?.assignedDatasetsCount ?? 0,
      assignedPipelinesCount: initialUser?.assignedPipelinesCount ?? 0,
      createdAt: initialUser?.createdAt ? new Date(initialUser.createdAt) : new Date(),
      lastActiveAt: new Date(),
    };

    onSubmit(finalUser);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl rounded-2xl border border-gray-700 bg-gray-900 text-cream-100 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 bg-gray-850 px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {initialUser ? 'Edit Member Profile' : 'Enterprise User Registration'}
                <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-300 border border-blue-500/30">
                  Data Portal Identity
                </span>
              </h2>
              <p className="text-xs text-cream-400">
                Configure role credentials, data governance clearance, warehouse access & compliance.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-cream-400 hover:bg-gray-800 hover:text-cream-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Templates bar (only shown for new registrations) */}
        {!initialUser && (
          <div className="flex items-center gap-2 border-b border-gray-800 bg-gray-900/90 px-6 py-2.5 overflow-x-auto text-xs flex-shrink-0 scrollbar-thin">
            <span className="text-cream-400 flex items-center gap-1 font-medium whitespace-nowrap text-[11px]">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              Quick Templates:
            </span>
            <button
              type="button"
              onClick={() => loadPresetTemplate('engineer')}
              className="rounded-md bg-gray-800 hover:bg-gray-750 px-2.5 py-1 text-[11px] text-cream-200 border border-gray-700 transition-colors whitespace-nowrap hover:border-blue-500/50"
            >
              🛠️ Data Engineer
            </button>
            <button
              type="button"
              onClick={() => loadPresetTemplate('analyst')}
              className="rounded-md bg-gray-800 hover:bg-gray-750 px-2.5 py-1 text-[11px] text-cream-200 border border-gray-700 transition-colors whitespace-nowrap hover:border-blue-500/50"
            >
              📊 BI Analyst
            </button>
            <button
              type="button"
              onClick={() => loadPresetTemplate('scientist')}
              className="rounded-md bg-gray-800 hover:bg-gray-750 px-2.5 py-1 text-[11px] text-cream-200 border border-gray-700 transition-colors whitespace-nowrap hover:border-blue-500/50"
            >
              ☕ ML Sensory Scientist
            </button>
            <button
              type="button"
              onClick={() => loadPresetTemplate('officer')}
              className="rounded-md bg-gray-800 hover:bg-gray-750 px-2.5 py-1 text-[11px] text-cream-200 border border-gray-700 transition-colors whitespace-nowrap hover:border-blue-500/50"
            >
              🛡️ Compliance Officer
            </button>
          </div>
        )}

        {/* Stepper Progress */}
        <div className="flex items-center justify-between border-b border-gray-800 bg-gray-850/60 px-6 py-3 flex-shrink-0 text-xs">
          {[
            { num: 1, label: 'Personal & Profile' },
            { num: 2, label: 'Org & Department' },
            { num: 3, label: 'Clearance & Access' },
            { num: 4, label: 'Alerts & Operations' },
            { num: 5, label: 'Compliance & Security' },
          ].map((s) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (isCompleted || isCurrent) setStep(s.num);
                }}
                className={`flex items-center gap-2 transition-all ${
                  isCurrent
                    ? 'text-blue-400 font-semibold'
                    : isCompleted
                    ? 'text-emerald-400 hover:text-emerald-300'
                    : 'text-gray-500 cursor-not-allowed'
                }`}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.num}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          {/* STEP 1: Personal & Profile */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-blue-300 flex items-start gap-2.5">
                <Globe className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-400" />
                <div>
                  <span className="font-semibold text-blue-200">Global Coffee Identity:</span> User accounts synchronize across Seattle Roastery HQ, Addis Ababa Sourcing Hub, and European trade networks.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cream-200 mb-1">
                    Full Legal Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Elena Rostova"
                      className="w-full rounded-xl bg-gray-800 border border-gray-700 pl-9 pr-3 py-2 text-xs text-cream-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  {errors.fullName && <p className="text-[11px] text-red-400 mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cream-200 mb-1">
                    Corporate Email <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="elena.rostova@happycoffee.io"
                      className="w-full rounded-xl bg-gray-800 border border-gray-700 pl-9 pr-3 py-2 text-xs text-cream-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cream-200 mb-1">
                    Directory Username <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="elena.rostova"
                    className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-xs text-cream-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors font-mono"
                  />
                  {errors.username && <p className="text-[11px] text-red-400 mt-1">{errors.username}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cream-200 mb-1">
                    Job Title <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Senior Data Platform Engineer"
                      className="w-full rounded-xl bg-gray-800 border border-gray-700 pl-9 pr-3 py-2 text-xs text-cream-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  {errors.jobTitle && <p className="text-[11px] text-red-400 mt-1">{errors.jobTitle}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cream-200 mb-1">
                    Contact Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (206) 555-0182"
                      className="w-full rounded-xl bg-gray-800 border border-gray-700 pl-9 pr-3 py-2 text-xs text-cream-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cream-200 mb-1">
                    Office / Regional Hub
                  </label>
                  <select
                    value={officeLocation}
                    onChange={(e) => setOfficeLocation(e.target.value)}
                    className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-xs text-cream-100 focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    {OFFICE_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream-200 mb-1">
                  Avatar / Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-xs text-cream-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Org & Department */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cream-200 mb-1">
                    Business Unit / Department <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as UserDepartment)}
                    className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-xs text-cream-100 focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cream-200 mb-1">
                    Reporting Manager <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="e.g. David Sterling (VP of Data)"
                    className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-xs text-cream-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  {errors.managerName && <p className="text-[11px] text-red-400 mt-1">{errors.managerName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream-200 mb-2">
                  Role-Based Authorization Role (RBAC) <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {ROLES.map(({ role: r, desc, icon: IconComponent }) => {
                    const isSelected = role === r;
                    return (
                      <div
                        key={r}
                        onClick={() => setRole(r)}
                        className={`cursor-pointer rounded-xl border p-3 transition-all ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500 text-cream-100 shadow-md ring-1 ring-blue-500/50'
                            : 'bg-gray-800 border-gray-700 text-cream-300 hover:border-gray-600 hover:bg-gray-750'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`p-1.5 rounded-lg ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                            }`}
                          >
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-xs text-white">{r}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed pl-7">{desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Clearance & Access */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-cream-200 mb-2">
                  Data Governance Clearance Level <span className="text-red-400">*</span>
                </label>
                <div className="space-y-2">
                  {CLEARANCE_LEVELS.map(({ level, color, desc }) => {
                    const isSelected = clearanceLevel === level;
                    return (
                      <label
                        key={level}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500/50'
                            : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="clearance"
                            checked={isSelected}
                            onChange={() => setClearanceLevel(level)}
                            className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{level}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${color}`}>
                                Tier Badge
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5">{desc}</p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream-200 mb-1">
                  Accessible Deployment Environments <span className="text-red-400">*</span>
                </label>
                <div className="flex flex-wrap gap-2.5 mt-1.5">
                  {(['Development', 'Staging', 'Production'] as EnvironmentAccess[]).map((env) => {
                    const checked = accessibleEnvironments.includes(env);
                    return (
                      <button
                        key={env}
                        type="button"
                        onClick={() => {
                          if (checked) {
                            setAccessibleEnvironments(accessibleEnvironments.filter((e) => e !== env));
                          } else {
                            setAccessibleEnvironments([...accessibleEnvironments, env]);
                          }
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                          checked
                            ? env === 'Production'
                              ? 'bg-red-500/20 border-red-500 text-red-300'
                              : 'bg-blue-600/20 border-blue-500 text-blue-300'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'
                        }`}
                      >
                        <div
                          className={`h-3.5 w-3.5 rounded flex items-center justify-center border ${
                            checked ? 'bg-blue-600 border-blue-500 text-white' : 'border-gray-600'
                          }`}
                        >
                          {checked && <CheckCircle2 className="h-3 w-3" />}
                        </div>
                        <span>{env}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.accessibleEnvironments && (
                  <p className="text-[11px] text-red-400 mt-1">{errors.accessibleEnvironments}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream-200 mb-1">
                  Authorized Warehouse & Engine Clusters <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                  {WAREHOUSE_OPTIONS.map((wh) => {
                    const checked = authorizedWarehouses.includes(wh);
                    return (
                      <button
                        key={wh}
                        type="button"
                        onClick={() => {
                          if (checked) {
                            setAuthorizedWarehouses(authorizedWarehouses.filter((w) => w !== wh));
                          } else {
                            setAuthorizedWarehouses([...authorizedWarehouses, wh]);
                          }
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-left border transition-all ${
                          checked
                            ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-750'
                        }`}
                      >
                        <div
                          className={`h-3.5 w-3.5 rounded flex items-center justify-center border flex-shrink-0 ${
                            checked ? 'bg-blue-600 border-blue-500 text-white' : 'border-gray-600'
                          }`}
                        >
                          {checked && <CheckCircle2 className="h-3 w-3" />}
                        </div>
                        <span className="truncate">{wh}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.authorizedWarehouses && (
                  <p className="text-[11px] text-red-400 mt-1">{errors.authorizedWarehouses}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Alerts & Operations */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h4 className="text-xs font-bold text-white mb-2">Notification Routing Channels</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-800 border border-gray-700 cursor-pointer hover:bg-gray-750">
                    <input
                      type="checkbox"
                      checked={preferences.emailAlerts}
                      onChange={(e) => setPreferences({ ...preferences, emailAlerts: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="text-xs text-cream-200">Email Notifications</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-800 border border-gray-700 cursor-pointer hover:bg-gray-750">
                    <input
                      type="checkbox"
                      checked={preferences.slackAlerts}
                      onChange={(e) => setPreferences({ ...preferences, slackAlerts: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="text-xs text-cream-200">Slack Webhook Alerts</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-800 border border-gray-700 cursor-pointer hover:bg-gray-750">
                    <input
                      type="checkbox"
                      checked={preferences.pagerDutyAlerts}
                      onChange={(e) => setPreferences({ ...preferences, pagerDutyAlerts: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="text-xs text-cream-200">PagerDuty On-Call</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white mb-2">Catalog Event Subscriptions</h4>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-gray-800 border border-gray-700 cursor-pointer">
                    <div>
                      <span className="text-xs font-semibold text-cream-100">Data Quality Incident Alerts</span>
                      <p className="text-[11px] text-gray-400">Immediate trigger when schema completeness or freshness tests fail.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.dataQualityIncidentAlerts}
                      onChange={(e) =>
                        setPreferences({ ...preferences, dataQualityIncidentAlerts: e.target.checked })
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-gray-800 border border-gray-700 cursor-pointer">
                    <div>
                      <span className="text-xs font-semibold text-cream-100">Weekly Cloud Spend & FinOps Digest</span>
                      <p className="text-[11px] text-gray-400">Receive weekly summaries of Snowflake and Databricks credit burns.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.weeklySpendDigest}
                      onChange={(e) =>
                        setPreferences({ ...preferences, weeklySpendDigest: e.target.checked })
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream-200 mb-1">
                  Primary Operating Timezone
                </label>
                <select
                  value={preferences.timezone}
                  onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                  className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-xs text-cream-100 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 5: Compliance & Security */}
          {step === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-cream-200 mb-2">
                  Multi-Factor Authentication (MFA) Requirement
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { method: 'Hardware Key (FIDO2)', desc: 'YubiKey / Touch ID / FIDO2 security dongle' },
                    { method: 'TOTP', desc: 'Google Authenticator, 1Password, or Authy app' },
                    { method: 'SMS OTP', desc: 'Cellular SMS one-time passcode' },
                    { method: 'None', desc: 'No second factor (Strictly for development sandbox)' },
                  ].map(({ method, desc }) => {
                    const isSelected = compliance.mfaMethod === method;
                    return (
                      <label
                        key={method}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500/50'
                            : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="mfa"
                            checked={isSelected}
                            onChange={() => setCompliance({ ...compliance, mfaMethod: method as any })}
                            className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                          <span className="text-xs font-bold text-white">{method}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1 pl-6">{desc}</p>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream-200 mb-2">
                  Initial Provisioning Status
                </label>
                <div className="flex gap-3">
                  {(['Active', 'Pending Review', 'Suspended'] as UserStatus[]).map((s) => (
                    <label
                      key={s}
                      className={`flex-1 p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                        status === s
                          ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                          : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-750'
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        checked={status === s}
                        onChange={() => setStatus(s)}
                        className="sr-only"
                      />
                      <span className="text-xs">{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-gray-700 bg-gray-800/80 p-3.5 space-y-2.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  Data Governance & Legal Compliance Agreements
                </h4>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={compliance.soc2Acknowledged}
                    onChange={(e) => setCompliance({ ...compliance, soc2Acknowledged: e.target.checked })}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-4 w-4 flex-shrink-0"
                  />
                  <span className="text-xs text-cream-200 leading-relaxed">
                    I acknowledge Happy Coffee SOC-2 Type II audit logging and accept automated monitoring of warehouse queries.
                  </span>
                </label>
                {errors.soc2 && <p className="text-[11px] text-red-400 pl-6">{errors.soc2}</p>}

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={compliance.ndaSigned}
                    onChange={(e) => setCompliance({ ...compliance, ndaSigned: e.target.checked })}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-4 w-4 flex-shrink-0"
                  />
                  <span className="text-xs text-cream-200 leading-relaxed">
                    Employee NDA and confidentiality terms covering proprietary roasting recipes, shipment tracking, and pricing feeds.
                  </span>
                </label>
                {errors.nda && <p className="text-[11px] text-red-400 pl-6">{errors.nda}</p>}

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={compliance.piiDataHandlingCertified}
                    onChange={(e) =>
                      setCompliance({ ...compliance, piiDataHandlingCertified: e.target.checked })
                    }
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-4 w-4 flex-shrink-0"
                  />
                  <span className="text-xs text-cream-200 leading-relaxed">
                    Certified in GDPR / PII handling guidelines for customer orders and roasting lab analyses.
                  </span>
                </label>
              </div>
            </div>
          )}
        </form>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-gray-800 bg-gray-850 px-6 py-4 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-2 text-xs font-medium text-cream-300 hover:bg-gray-750 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 rounded-xl border border-gray-700 bg-gray-800 px-4 py-2 text-xs font-medium text-cream-200 hover:bg-gray-750 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Previous
              </button>
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors shadow-md"
              >
                Next Step
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2 text-xs font-bold text-white hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg"
              >
                <CheckCircle2 className="h-4 w-4" />
                {initialUser ? 'Save Profile Changes' : 'Provision User Credentials'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
