import {
  X,
  User as UserIcon,
  Shield,
  Building,
  Mail,
  Phone,
  Briefcase,
  Globe,
  CheckCircle2,
  AlertCircle,
  Key,
  Clock,
  Edit,
} from 'lucide-react';
import type { User } from '../../data/types';

interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
}

export function UserDetailModal({
  user,
  isOpen,
  onClose,
  onEdit,
  onToggleStatus,
}: UserDetailModalProps) {
  if (!isOpen || !user) return null;

  const getClearanceBadge = (level: string) => {
    switch (level) {
      case 'Restricted / PII':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'Gold (Aggregated)':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'Silver (Cleaned)':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
      case 'Bronze (Raw)':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/40';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Pending Review':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Suspended':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl border border-gray-700 bg-gray-900 text-cream-100 shadow-2xl overflow-hidden">
        {/* Header with profile banner */}
        <div className="relative bg-gradient-to-r from-blue-900 via-indigo-950 to-gray-900 p-6 border-b border-gray-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-lg p-1.5 text-cream-400 hover:bg-gray-850 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-start gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-blue-400/40 shadow-lg"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-300 font-bold text-xl shadow-lg">
                {user.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white">{user.fullName}</h2>
                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(user.status)}`}>
                  {user.status}
                </span>
                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${getClearanceBadge(user.clearanceLevel)}`}>
                  {user.clearanceLevel}
                </span>
              </div>
              <p className="text-xs text-blue-300 font-medium flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                {user.jobTitle} • {user.role}
              </p>
              <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5" />
                {user.department} • <Globe className="h-3.5 w-3.5" /> {user.officeLocation}
              </p>
            </div>
          </div>
        </div>

        {/* Content sections */}
        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto scrollbar-thin">
          {/* Contact & Reporting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-850 p-3.5 rounded-xl border border-gray-800">
            <div>
              <span className="text-gray-400 block text-[11px]">Corporate Email:</span>
              <span className="font-mono text-cream-100 flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5 text-blue-400" />
                {user.email}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Directory Username:</span>
              <span className="font-mono text-cream-100 flex items-center gap-1.5 mt-0.5">
                <UserIcon className="h-3.5 w-3.5 text-blue-400" />
                @{user.username}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Reporting Manager:</span>
              <span className="text-cream-100 flex items-center gap-1.5 mt-0.5">
                <Building className="h-3.5 w-3.5 text-blue-400" />
                {user.managerName || 'None assigned'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Contact Phone:</span>
              <span className="text-cream-100 flex items-center gap-1.5 mt-0.5">
                <Phone className="h-3.5 w-3.5 text-blue-400" />
                {user.phoneNumber || 'Not listed'}
              </span>
            </div>
          </div>

          {/* Access & Clearance */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-cream-200 flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-blue-400" />
              Environment & Warehouse Authorizations
            </h3>
            <div className="bg-gray-850 p-3.5 rounded-xl border border-gray-800 space-y-2.5 text-xs">
              <div>
                <span className="text-[11px] text-gray-400 block mb-1">Deployment Environments:</span>
                <div className="flex flex-wrap gap-1.5">
                  {user.accessibleEnvironments.map((env) => (
                    <span
                      key={env}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                        env === 'Production'
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      }`}
                    >
                      {env}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-gray-400 block mb-1">Authorized Data Clusters:</span>
                <div className="flex flex-wrap gap-1.5">
                  {user.authorizedWarehouses.map((wh) => (
                    <span
                      key={wh}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-gray-800 border border-gray-700 text-cream-200"
                    >
                      {wh}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Compliance & Security */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-cream-200 flex items-center gap-1.5">
              <Key className="h-4 w-4 text-emerald-400" />
              Security Compliance & MFA
            </h3>
            <div className="bg-gray-850 p-3.5 rounded-xl border border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                {user.compliance.soc2Acknowledged ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                )}
                <span>SOC-2 Policy Acknowledged</span>
              </div>
              <div className="flex items-center gap-2">
                {user.compliance.ndaSigned ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                )}
                <span>Corporate NDA Executed</span>
              </div>
              <div className="flex items-center gap-2">
                {user.compliance.piiDataHandlingCertified ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                )}
                <span>PII & GDPR Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-[11px]">MFA Mode:</span>
                <span className="font-semibold text-blue-300">{user.compliance.mfaMethod}</span>
              </div>
            </div>
          </div>

          {/* Activity & System Meta */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 px-1 pt-1">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Provisioned: {new Date(user.createdAt).toLocaleDateString()}
            </span>
            <span>Last Active: {new Date(user.lastActiveAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-gray-800 bg-gray-850 px-6 py-4">
          <button
            onClick={() => onToggleStatus(user)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold border transition-colors ${
              user.status === 'Active'
                ? 'border-red-500/40 text-red-400 hover:bg-red-500/10'
                : 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            {user.status === 'Active' ? 'Suspend Member Account' : 'Reactivate Member Account'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-2 text-xs font-medium text-cream-300 hover:bg-gray-750 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(user);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors shadow-md"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit User Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
