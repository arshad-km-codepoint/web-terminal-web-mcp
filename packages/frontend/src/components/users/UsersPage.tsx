import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Shield,
  CheckCircle,
  Clock,
  Search,
  Globe,
  Edit,
  Eye,
} from 'lucide-react';
import { PageHeader } from '../layout/PageHeader';
import { StatCard } from '../ui/StatCard';
import { Pagination } from '../ui/Pagination';
import { useCatalogData } from '../../hooks/useCatalogData';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { UserRegistrationForm } from './UserRegistrationForm';
import { UserDetailModal } from './UserDetailModal';
import type { User, UserStatus, DataClearanceLevel } from '../../data/types';

const PAGE_SIZE = 10;


export function UsersPage() {
  useDocumentTitle('Users & Access');
  const { users = [], addUser, updateUser } = useCatalogData();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and Filter State synced with URL parameters
  const searchQuery = searchParams.get('q') || '';
  const selectedRole = searchParams.get('role') || 'all';
  const selectedDepartment = searchParams.get('department') || 'all';
  const selectedClearance = searchParams.get('clearance') || 'all';
  const selectedStatus = searchParams.get('status') || 'all';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const selectedUserId = searchParams.get('userId') || '';
  const openAction = searchParams.get('action') || '';

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Sync with URL parameters (for MCP tools or deep links)
  useEffect(() => {
    if (openAction === 'register') {
      setEditingUser(null);
      setIsFormOpen(true);
    } else if (openAction === 'edit' && selectedUserId) {
      const u = users.find((x) => x.id === selectedUserId || x.email.toLowerCase() === selectedUserId.toLowerCase());
      if (u) {
        setEditingUser(u);
        setIsFormOpen(true);
      }
    } else if (selectedUserId) {
      const u = users.find((x) => x.id === selectedUserId || x.email.toLowerCase() === selectedUserId.toLowerCase());
      if (u) {
        setViewingUser(u);
        setIsDetailOpen(true);
      }
    }
  }, [openAction, selectedUserId, users]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.delete('page'); // Reset to page 1 on filter changes
    setSearchParams(next);
  };

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'Active').length;
  const highClearanceUsers = users.filter(
    (u) => u.clearanceLevel === 'Gold (Aggregated)' || u.clearanceLevel === 'Restricted / PII'
  ).length;
  const pendingUsers = users.filter((u) => u.status === 'Pending Review').length;

  // Filtered list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.jobTitle.toLowerCase().includes(q) ||
          u.officeLocation.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (selectedRole !== 'all' && u.role !== selectedRole) return false;
      if (selectedDepartment !== 'all' && u.department !== selectedDepartment) return false;
      if (selectedClearance !== 'all' && u.clearanceLevel !== selectedClearance) return false;
      if (selectedStatus !== 'all' && u.status !== selectedStatus) return false;
      return true;
    });
  }, [users, searchQuery, selectedRole, selectedDepartment, selectedClearance, selectedStatus]);

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  const handleFormSubmit = (savedUser: User) => {
    if (editingUser) {
      updateUser(savedUser.id, savedUser);
    } else {
      addUser(savedUser);
    }
    setIsFormOpen(false);
    setEditingUser(null);
    const next = new URLSearchParams(searchParams);
    next.delete('action');
    next.delete('userId');
    setSearchParams(next);
  };

  const handleToggleStatus = (user: User) => {
    const nextStatus: UserStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    updateUser(user.id, { status: nextStatus });
    if (viewingUser && viewingUser.id === user.id) {
      setViewingUser({ ...viewingUser, status: nextStatus });
    }
  };

  const getClearanceBadge = (level: DataClearanceLevel) => {
    switch (level) {
      case 'Restricted / PII':
        return 'bg-red-500/15 text-red-300 border-red-500/30';
      case 'Gold (Aggregated)':
        return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
      case 'Silver (Cleaned)':
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
      case 'Bronze (Raw)':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      default:
        return 'bg-gray-500/15 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Pending Review':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Suspended':
        return 'bg-red-500/15 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/15 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Users & Access Directory"
        subtitle="Enterprise platform user credentials, role-based governance tiers, environment authorizations, and compliance status."
        actions={
          <button
            onClick={() => {
              setEditingUser(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:from-blue-500 hover:to-indigo-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus className="h-4 w-4" />
            <span>Register New User</span>
          </button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Registered Users"
          value={totalUsers}
          icon={Users}
          detail="+2 this month"
        />
        <StatCard
          label="Active Accounts"
          value={activeUsers}
          icon={CheckCircle}
          detail={`${Math.round((activeUsers / (totalUsers || 1)) * 100)}% active`}
        />
        <StatCard
          label="High Clearance (Gold / PII)"
          value={highClearanceUsers}
          icon={Shield}
          detail="Audit compliant"
        />
        <StatCard
          label="Pending Approvals"
          value={pendingUsers}
          icon={Clock}
          detail={pendingUsers > 0 ? 'Requires action' : 'All clear'}
        />
      </div>

      {/* Filters & Search Toolbar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => updateParam('q', e.target.value)}
              placeholder="Search users by name, username, email, job title, or location..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          {/* Quick Clear */}
          {(searchQuery || selectedRole !== 'all' || selectedDepartment !== 'all' || selectedClearance !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => setSearchParams(new URLSearchParams())}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap px-2"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 border-t border-gray-100">
          <select
            value={selectedRole}
            onChange={(e) => updateParam('role', e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 focus:border-blue-500 focus:bg-white focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="Data Platform Admin">Data Platform Admin</option>
            <option value="Data Steward">Data Steward</option>
            <option value="Data Engineer">Data Engineer</option>
            <option value="Data Analyst">Data Analyst</option>
            <option value="ML Engineer">ML Engineer</option>
            <option value="Security & Compliance Officer">Security & Compliance</option>
          </select>

          <select
            value={selectedDepartment}
            onChange={(e) => updateParam('department', e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 focus:border-blue-500 focus:bg-white focus:outline-none"
          >
            <option value="all">All Departments</option>
            <option value="Data Platform & Infrastructure">Data Platform</option>
            <option value="Analytics & Business Intelligence">Analytics & BI</option>
            <option value="Supply Chain & Sourcing">Supply Chain</option>
            <option value="Roastery Operations & Quality">Roastery & Quality</option>
            <option value="Finance & Commodity Trading">Finance & Trading</option>
            <option value="Governance & Security">Governance</option>
          </select>

          <select
            value={selectedClearance}
            onChange={(e) => updateParam('clearance', e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 focus:border-blue-500 focus:bg-white focus:outline-none"
          >
            <option value="all">All Clearance Tiers</option>
            <option value="Public">Public</option>
            <option value="Bronze (Raw)">Bronze (Raw)</option>
            <option value="Silver (Cleaned)">Silver (Cleaned)</option>
            <option value="Gold (Aggregated)">Gold (Aggregated)</option>
            <option value="Restricted / PII">Restricted / PII</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => updateParam('status', e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 focus:border-blue-500 focus:bg-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100/70 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Member Name & Role</th>
                <th className="py-3.5 px-4">Department & Hub</th>
                <th className="py-3.5 px-4">Clearance Tier</th>
                <th className="py-3.5 px-4">Environments</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="font-semibold text-gray-700">No matching user records found.</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Try relaxing your search query or filter chips.</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-cream-50/80 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.fullName}
                            className="h-9 w-9 rounded-xl object-cover ring-1 ring-gray-200 shadow-sm"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-xs shadow-sm">
                            {user.fullName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span
                            onClick={() => {
                              setViewingUser(user);
                              setIsDetailOpen(true);
                            }}
                            className="font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors block"
                          >
                            {user.fullName}
                          </span>
                          <span className="text-[11px] text-gray-400 block font-mono">
                            {user.email} • <span className="text-gray-500 font-sans">{user.jobTitle}</span>
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-gray-800 block">{user.department}</span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Globe className="h-3 w-3 text-gray-400" />
                        {user.officeLocation}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getClearanceBadge(
                          user.clearanceLevel
                        )}`}
                      >
                        {user.clearanceLevel}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {user.accessibleEnvironments.map((env) => (
                          <span
                            key={env}
                            className={`text-[9px] px-1.5 py-0.5 rounded font-medium border ${
                              env === 'Production'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {env.slice(0, 4)}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setViewingUser(user);
                            setIsDetailOpen(true);
                          }}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                          title="View user details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setIsFormOpen(true);
                          }}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                          title="Edit user profile"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > PAGE_SIZE && (
          <div className="border-t border-gray-100 p-3 bg-cream-50/50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => {
                const next = new URLSearchParams(searchParams);
                next.set('page', String(p));
                setSearchParams(next);
              }}
            />
          </div>
        )}
      </div>

      {/* Registration & Edit Form Wizard Modal */}
      <UserRegistrationForm
        isOpen={isFormOpen}
        initialUser={editingUser}
        onClose={() => {
          setIsFormOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* User Detail Profile Modal */}
      <UserDetailModal
        isOpen={isDetailOpen}
        user={viewingUser}
        onClose={() => {
          setIsDetailOpen(false);
          setViewingUser(null);
        }}
        onEdit={(u) => {
          setIsDetailOpen(false);
          setEditingUser(u);
          setIsFormOpen(true);
        }}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}
