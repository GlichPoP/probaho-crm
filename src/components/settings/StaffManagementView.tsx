import React, { useState } from 'react';
import { 
  Users, ShieldCheck, UserPlus, Trash2, Check, X, Lock, Unlock, 
  Crown, Edit, Shield, Share2, Copy, CheckCircle2, ExternalLink, Globe, Send, MessageSquare, Mail 
} from 'lucide-react';
import type { UserAccount, UserRole } from '../../types/crm';
import { dbService } from '../../database/db';

interface StaffManagementViewProps {
  currentUser: UserAccount;
  onRefreshUsers: () => void;
  onSwitchProfile: (userId: string) => void;
}

const ALL_CRM_MODULES = [
  { id: 'dashboard', label: 'Dashboard & KPI' },
  { id: 'orders', label: 'Orders' },
  { id: 'challan', label: 'Invoices' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'customers', label: 'Customers & CRM' },
  { id: 'finance', label: 'Payments' },
  { id: 'vendors', label: 'Vendors' },
  { id: 'partners', label: 'Delivery & Payment Partners' },
  { id: 'settings', label: 'Settings & Backup' }
];

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({
  currentUser,
  onRefreshUsers,
  onSwitchProfile
}) => {
  const [users, setUsers] = useState<UserAccount[]>(() => dbService.getUserAccounts());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>('employee');
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmailOrPhone, setNewEmailOrPhone] = useState('');
  const [newDesignation, setNewDesignation] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newMustChangePassword, setNewMustChangePassword] = useState(false);
  const [selectedTabs, setSelectedTabs] = useState<string[]>(['orders', 'challan', 'customers']);

  // Edit employee modal state
  const [editingEmployee, setEditingEmployee] = useState<UserAccount | null>(null);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmailOrPhone, setEditEmailOrPhone] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editPin, setEditPin] = useState('');
  const [editMustChangePassword, setEditMustChangePassword] = useState<boolean>(false);
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [editAllowedTabs, setEditAllowedTabs] = useState<string[]>([]);

  // Share individual employee access modal state
  const [sharingEmployee, setSharingEmployee] = useState<UserAccount | null>(null);
  const [copiedDirectLink, setCopiedDirectLink] = useState<boolean>(false);
  const [copiedMessage, setCopiedMessage] = useState<boolean>(false);
  const [customWebBaseUrl, setCustomWebBaseUrl] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.protocol.startsWith('http') && !window.location.hostname.includes('localhost')) {
      return window.location.origin;
    }
    return localStorage.getItem('probaho_web_app_url') || 'https://probaho-crm.web.app';
  });
  const [isEditingWebBase, setIsEditingWebBase] = useState<boolean>(false);
  const [webBaseInput, setWebBaseInput] = useState<string>('');

  const getEmployeeDirectLink = (emp: UserAccount) => {
    const workspace = dbService.getWorkspaceId() || 'MAIN';
    const base = customWebBaseUrl.trim().replace(/\/+$/, '');
    const userParam = emp.username || emp.email_or_phone;
    return `${base}/?code=${encodeURIComponent(workspace)}&user=${encodeURIComponent(userParam)}`;
  };

  const getEmployeeWhatsAppMessage = (emp: UserAccount) => {
    const workspace = dbService.getWorkspaceId() || 'MAIN';
    const link = getEmployeeDirectLink(emp);
    const brand = dbService.getBrandProfile()?.brand_name || 'PROBAHO CRM';
    const allowedModuleNames = (emp.allowed_tabs || [])
      .map(tabId => ALL_CRM_MODULES.find(m => m.id === tabId)?.label || tabId)
      .join(', ') || 'Showroom POS & Orders';

    return `👋 Hello ${emp.name},\n\nYour official staff account for *${brand}* is ready:\n\n👤 *Staff Login ID:* ${emp.username || emp.email_or_phone}\n🔑 *Initial Password / PIN:* ${emp.password || emp.pin_code || '1234'}\n🏢 *Showroom Workspace:* ${workspace}\n📋 *Assigned Modules:* ${allowedModuleNames}\n\n💻 *How to Access:*\n1. Launch the *PROBAHO CRM* software (Setup or Portable edition on your computer) or visit: ${link}\n2. Enter your Staff Login ID and Initial Password to sign in.\n3. You can change your password anytime by clicking your profile in the top bar!`;
  };

  const handleCopyDirectLink = (emp: UserAccount) => {
    const link = getEmployeeDirectLink(emp);
    navigator.clipboard.writeText(link);
    setCopiedDirectLink(true);
    setTimeout(() => setCopiedDirectLink(false), 2500);
  };

  const handleCopyMessage = (emp: UserAccount) => {
    const msg = getEmployeeWhatsAppMessage(emp);
    navigator.clipboard.writeText(msg);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const getEmployeeEmailMessage = (emp: UserAccount) => {
    const workspace = dbService.getWorkspaceId() || 'MAIN';
    const link = getEmployeeDirectLink(emp);
    const brand = dbService.getBrandProfile()?.brand_name || 'PROBAHO CRM';
    const allowedModuleNames = (emp.allowed_tabs || [])
      .map(tabId => ALL_CRM_MODULES.find(m => m.id === tabId)?.label || tabId)
      .join(', ') || 'Showroom POS & Orders';

    return `Hello ${emp.name},

Your staff account for ${brand} has been configured with the following credentials:

• Staff Login ID / Username: ${emp.username || emp.email_or_phone}
• Initial Password / PIN: ${emp.password || emp.pin_code || '1234'}
• Showroom Workspace Code: ${workspace}
• Permitted Modules: ${allowedModuleNames}

How to Access:
1. Open PROBAHO CRM Desktop or Portable on your computer (or open: ${link}).
2. Enter your Staff Login ID and Initial Password to sign in.
3. You can personalize your password anytime from your profile settings in the top header.

Best regards,
${brand} Master Administration`;
  };

  const handleSendEmail = (emp: UserAccount) => {
    const brand = dbService.getBrandProfile()?.brand_name || 'PROBAHO CRM';
    const subject = encodeURIComponent(`${brand} CRM - Access Credentials for ${emp.name}`);
    const body = encodeURIComponent(getEmployeeEmailMessage(emp));
    const recipient = emp.email_or_phone.includes('@') ? encodeURIComponent(emp.email_or_phone.trim()) : '';
    const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');
  };

  const handleOpenGmail = (emp: UserAccount) => {
    const brand = dbService.getBrandProfile()?.brand_name || 'PROBAHO CRM';
    const subject = encodeURIComponent(`${brand} CRM - Access Credentials for ${emp.name}`);
    const body = encodeURIComponent(getEmployeeEmailMessage(emp));
    const recipient = emp.email_or_phone.includes('@') ? encodeURIComponent(emp.email_or_phone.trim()) : '';
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
  };

  const handleSaveWebBase = () => {
    if (!webBaseInput.trim()) return;
    let formatted = webBaseInput.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = 'https://' + formatted;
    }
    setCustomWebBaseUrl(formatted);
    localStorage.setItem('probaho_web_app_url', formatted);
    setIsEditingWebBase(false);
  };

  const refreshList = () => {
    setUsers([...dbService.getUserAccounts()]);
    onRefreshUsers();
  };

  const handleToggleActive = (userId: string) => {
    const res = dbService.toggleUserActive(userId, currentUser.name);
    refreshList();
    if (!res.success) {
      alert(res.message);
    }
  };

  if (currentUser.role !== 'master') {
    return (
      <div className="glass-card" style={{ padding: '36px', textAlign: 'center', maxWidth: '640px', margin: '40px auto' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Lock size={32} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
          Restricted Module (Master Access Required)
        </h2>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '24px' }}>
          You are currently logged in as an Employee (`{currentUser.name}`). Only **Master Profiles** can create new master or employee profiles and adjust access permissions.
        </p>
        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>Need to switch to a Master Account?</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Switch to the Master profile using the top header bar.</div>
          </div>
        </div>
      </div>
    );
  }

  const handleToggleTab = (userId: string, tabId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target || target.role === 'master') return; // Master always has all tabs

    const currentTabs = [...(target.allowed_tabs || [])];
    const index = currentTabs.indexOf(tabId);
    if (index >= 0) {
      currentTabs.splice(index, 1);
    } else {
      currentTabs.push(tabId);
    }

    const updated: UserAccount = { ...target, allowed_tabs: currentTabs };
    dbService.saveUserAccount(updated, currentUser.name);
    refreshList();
  };

  const openEditModal = (emp: UserAccount) => {
    setEditingEmployee(emp);
    setEditName(emp.name);
    setEditUsername(emp.username || '');
    setEditEmailOrPhone(emp.email_or_phone);
    setEditDesignation(emp.designation || '');
    setEditPin(emp.password || emp.pin_code || '');
    setEditMustChangePassword(emp.must_change_password === true);
    setEditIsActive(emp.is_active !== false);
    setEditAllowedTabs([...(emp.allowed_tabs || [])]);
  };

  const handleSaveEditEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    if (!editName.trim() || !editEmailOrPhone.trim()) {
      alert('Please fill in both Name and Email/Phone.');
      return;
    }

    const updated: UserAccount = {
      ...editingEmployee,
      name: editName.trim(),
      username: editUsername.trim() || editingEmployee.username,
      email_or_phone: editEmailOrPhone.trim(),
      designation: editDesignation.trim() || editingEmployee.designation,
      password: editPin.trim() || editingEmployee.password,
      pin_code: editPin.trim() || editingEmployee.pin_code,
      must_change_password: editMustChangePassword,
      is_active: editIsActive,
      allowed_tabs: editAllowedTabs
    };

    dbService.saveUserAccount(updated, currentUser.name);
    refreshList();
    setEditingEmployee(null);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmailOrPhone.trim()) {
      alert('Please fill in both Name and Email/Phone.');
      return;
    }

    const rawUsername = newUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const fallbackUsername = newEmailOrPhone.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const finalUsername = rawUsername || fallbackUsername || `staff_${Date.now().toString().slice(-4)}`;
    const finalPassword = newPin.trim() || '1234';

    const newAccount: UserAccount = {
      id: `user-${newRole}-${Date.now()}`,
      username: finalUsername,
      name: newName.trim(),
      email_or_phone: newEmailOrPhone.trim(),
      role: newRole,
      password: finalPassword,
      pin_code: finalPassword,
      designation: newDesignation.trim() || (newRole === 'master' ? 'Master Administrator' : 'Showroom Associate'),
      must_change_password: newRole === 'employee' ? newMustChangePassword : false,
      is_active: true,
      allowed_tabs: newRole === 'master' 
        ? ['dashboard', 'orders', 'challan', 'inventory', 'customers', 'finance', 'vendors', 'partners', 'settings', 'staff']
        : selectedTabs,
      created_by: currentUser.name,
      created_at: new Date().toISOString()
    };

    dbService.saveUserAccount(newAccount, currentUser.name);
    refreshList();
    setIsCreateModalOpen(false);
    setNewName('');
    setNewUsername('');
    setNewEmailOrPhone('');
    setNewDesignation('');
    setNewPin('');
    setNewMustChangePassword(false);
    setSelectedTabs(['orders', 'challan', 'customers']);

    // Immediately open the personalized access card for this new employee
    if (newRole === 'employee') {
      setSharingEmployee(newAccount);
    }
  };

  const handleDeleteUser = (userId: string, name: string, role: UserRole) => {
    if (userId === currentUser.id) {
      alert('⚠️ You cannot delete the profile you are currently logged into! Switch to another Master profile first.');
      return;
    }
    if (confirm(`Are you sure you want to delete profile: "${name}" (${role.toUpperCase()})? This cannot be undone.`)) {
      const res = dbService.deleteUserAccount(userId, currentUser.name);
      if (res.success) {
        refreshList();
      } else {
        alert(res.message);
      }
    }
  };

  const masterCount = users.filter(u => u.role === 'master').length;
  const employeeCount = users.filter(u => u.role === 'employee').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Overview Banner */}
      <div className="glass-card" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08))', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <ShieldCheck size={22} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Staff & Master Role-Based Access Control (RBAC)
            </h2>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            Manage master accounts and assign specific module permissions to employees.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => { setNewRole('master'); setIsCreateModalOpen(true); }}
            className="btn btn-secondary hover-lift"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Crown size={16} style={{ color: '#F59E0B' }} />
            <span>+ New Master Profile</span>
          </button>
          <button
            onClick={() => { setNewRole('employee'); setIsCreateModalOpen(true); }}
            className="btn btn-primary hover-lift"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <UserPlus size={16} />
            <span>+ New Employee Profile</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total CRM Profiles</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>{users.length} Active Accounts</div>
        </div>
        <div className="glass-card" style={{ padding: '18px 22px', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Master Profiles (100% Access)</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F59E0B', marginTop: '4px' }}>{masterCount} Master(s)</div>
        </div>
        <div className="glass-card" style={{ padding: '18px 22px', borderLeft: '4px solid #6366F1' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Delegated Employees</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#6366F1', marginTop: '4px' }}>{employeeCount} Employee(s)</div>
        </div>
      </div>

      {/* Master Profiles Table */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Crown size={20} style={{ color: '#F59E0B' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>👑 Master Profiles (Unrestricted Access)</h3>
        </div>
        <div className="table-responsive">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Profile Name & Role</th>
                <th>Email / Phone Contact</th>
                <th>Access Scope</th>
                <th>Created Info</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => u.role === 'master').map(master => (
                <tr key={master.id} style={{ backgroundColor: master.id === currentUser.id ? 'rgba(99, 102, 241, 0.08)' : 'transparent' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        👑
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {master.name}
                          {master.id === currentUser.id && <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Active Now</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 600 }}>Master Profile</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ fontFamily: 'monospace', fontSize: '0.88rem' }}>{master.email_or_phone}</span></td>
                  <td>
                    <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={12} /> All Modules & Tabs Unlocked
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      {master.created_at ? new Date(master.created_at).toLocaleDateString('en-GB') : 'System Seed'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      {master.id !== currentUser.id && (
                        <button
                          onClick={() => onSwitchProfile(master.id)}
                          className="btn btn-secondary"
                          style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                        >
                          Switch To
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(master.id, master.name, master.role)}
                        className="btn btn-secondary"
                        style={{ padding: '5px 8px', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        title="Delete Master Profile"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Profiles & Specific Permissions Table */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} style={{ color: '#6366F1' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>👤 Employee Profiles & Granular Module Permissions</h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click tags to grant or revoke module access.</span>
        </div>

        {employeeCount === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>No employee profiles yet. Click "+ New Employee Profile" to add staff.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="crm-table">
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Employee Name & Contact</th>
                  <th style={{ width: '56%' }}>Specific Module Access (Click tags to toggle live)</th>
                  <th style={{ width: '12%' }}>Created By</th>
                  <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.role === 'employee').map(emp => (
                  <tr key={emp.id} style={{ backgroundColor: emp.id === currentUser.id ? 'rgba(99, 102, 241, 0.08)' : emp.is_active === false ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ 
                          width: '36px', height: '36px', borderRadius: '50%', 
                          backgroundColor: emp.is_active === false ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)', 
                          color: emp.is_active === false ? '#EF4444' : '#6366F1', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 
                        }}>
                          👤
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span>{emp.name}</span>
                            {emp.designation && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                ({emp.designation})
                              </span>
                            )}
                            {emp.id === currentUser.id && <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Active Now</span>}
                            {emp.is_active === false ? (
                              <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', fontWeight: 700 }}>
                                Revoked
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10B981', fontWeight: 700 }}>
                                Active
                              </span>
                            )}
                            {emp.must_change_password && (
                              <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', fontWeight: 700 }}>
                                Must Change Pass
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, fontFamily: 'monospace' }}>
                              ID: @{emp.username || emp.email_or_phone}
                            </span>
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>•</span>
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>{emp.email_or_phone}</span>
                            {(emp.password || emp.pin_code) && (
                              <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', padding: '1px 6px', borderRadius: '4px', color: '#10B981', fontWeight: 700 }}>
                                Pass: {emp.password || emp.pin_code}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {ALL_CRM_MODULES.map(mod => {
                          const hasAccess = (emp.allowed_tabs || []).includes(mod.id);
                          return (
                            <button
                              key={mod.id}
                              onClick={() => handleToggleTab(emp.id, mod.id)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                border: '1px solid',
                                borderColor: hasAccess ? '#6366F1' : 'var(--border-color)',
                                backgroundColor: hasAccess ? 'rgba(99, 102, 241, 0.18)' : 'var(--bg-hover)',
                                color: hasAccess ? 'var(--accent-primary)' : 'var(--text-dim)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                transition: 'all 0.15s ease'
                              }}
                              title={hasAccess ? `Click to revoke ${mod.label}` : `Click to grant ${mod.label}`}
                            >
                              {hasAccess ? <Unlock size={12} style={{ color: '#10B981' }} /> : <Lock size={12} style={{ opacity: 0.5 }} />}
                              <span>{mod.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{emp.created_by || 'Master'}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        {emp.id !== currentUser.id && (
                          <button
                            onClick={() => handleToggleActive(emp.id)}
                            className="btn btn-secondary hover-lift"
                            style={{ 
                              padding: '5px 8px', 
                              fontSize: '0.74rem', 
                              fontWeight: 700,
                              color: emp.is_active === false ? '#10B981' : '#EF4444',
                              borderColor: emp.is_active === false ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)',
                              background: emp.is_active === false ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.08)'
                            }}
                            title={emp.is_active === false ? 'Re-activate this staff profile' : 'Instant Kill Switch: Block staff access immediately'}
                          >
                            {emp.is_active === false ? 'Activate' : 'Revoke'}
                          </button>
                        )}
                        {emp.id !== currentUser.id && emp.is_active !== false && (
                          <button
                            onClick={() => onSwitchProfile(emp.id)}
                            className="btn btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                          >
                            Switch
                          </button>
                        )}
                        <button
                          onClick={() => setSharingEmployee(emp)}
                          className="btn btn-secondary hover-lift"
                          style={{ 
                            padding: '5px 9px', 
                            fontSize: '0.75rem', 
                            color: '#10B981', 
                            borderColor: 'rgba(16, 185, 129, 0.4)', 
                            background: 'rgba(16, 185, 129, 0.1)',
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px', 
                            fontWeight: 600 
                          }}
                          title="Share Personalized Staff Access Link & PIN"
                        >
                          <Share2 size={13} />
                          <span>Share</span>
                        </button>
                        <button
                          onClick={() => openEditModal(emp)}
                          className="btn btn-secondary hover-lift"
                          style={{ padding: '5px 8px', fontSize: '0.75rem', color: '#6366F1', borderColor: 'rgba(99, 102, 241, 0.4)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                          title="Edit Employee Access Permissions & Scope"
                        >
                          <Edit size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(emp.id, emp.name, emp.role)}
                          className="btn btn-secondary"
                          style={{ padding: '5px 8px', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          title="Delete Employee Profile"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for creating Master / Employee profile */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }} className="animate-fade-in" onClick={() => setIsCreateModalOpen(false)}>
          <div
            onClick={e => e.stopPropagation()}
            className="glass-card"
            style={{ width: '560px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {newRole === 'master' ? <Crown size={24} style={{ color: '#F59E0B' }} /> : <UserPlus size={24} style={{ color: '#6366F1' }} />}
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                  Create New {newRole === 'master' ? 'Master Profile' : 'Employee Profile'}
                </h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Staff Full Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter staff full name"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    style={{
                      padding: '11px 13px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-hover)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Staff Login ID / Username <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. staff.pos or STAFF-01"
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    style={{
                      padding: '11px 13px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-hover)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Role / Showroom Designation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cashier / POS Staff"
                    value={newDesignation}
                    onChange={e => setNewDesignation(e.target.value)}
                    style={{
                      padding: '11px 13px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-hover)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Email or Mobile Number <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 01711-223344 or staff@business.com"
                    value={newEmailOrPhone}
                    onChange={e => setNewEmailOrPhone(e.target.value)}
                    style={{
                      padding: '11px 13px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-hover)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Initial Password or PIN (Set by Master) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    Staff can change this password after signing in
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. 1234 or StaffPass@2026"
                  value={newPin}
                  onChange={e => setNewPin(e.target.value)}
                  style={{
                    padding: '11px 13px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-hover)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace'
                  }}
                  required
                />
              </div>

              {newRole === 'employee' && (
                <div
                  onClick={() => setNewMustChangePassword(!newMustChangePassword)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-hover)',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={newMustChangePassword}
                    onChange={() => {}}
                    style={{ accentColor: '#6366F1', width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                    Require staff to change password upon first login
                  </span>
                </div>
              )}

              {newRole === 'employee' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select Initial Allowed CRM Modules:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '200px', overflowY: 'auto', padding: '10px', backgroundColor: 'var(--bg-hover)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    {ALL_CRM_MODULES.map(mod => {
                      const isSelected = selectedTabs.includes(mod.id);
                      return (
                        <div
                          key={mod.id}
                          onClick={() => {
                            if (isSelected) setSelectedTabs(selectedTabs.filter(t => t !== mod.id));
                            else setSelectedTabs([...selectedTabs, mod.id]);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-primary)',
                            border: '1px solid',
                            borderColor: isSelected ? '#6366F1' : 'transparent',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                            fontWeight: isSelected ? 600 : 400
                          }}
                        >
                          <input type="checkbox" checked={isSelected} readOnly style={{ cursor: 'pointer' }} />
                          <span>{mod.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <UserPlus size={16} /> Create {newRole === 'master' ? 'Master' : 'Employee'} Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee & Granular Permissions Modal */}
      {editingEmployee && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }} className="animate-fade-in" onClick={() => setEditingEmployee(null)}>
          <div
            onClick={e => e.stopPropagation()}
            className="glass-card"
            style={{ width: '600px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={24} style={{ color: '#6366F1' }} />
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    Edit Access Permissions: {editingEmployee.name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Update permissions and profile details</div>
                </div>
              </div>
              <button onClick={() => setEditingEmployee(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Staff Full Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    style={{
                      padding: '11px 13px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-hover)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Staff Login ID / Username <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={e => setEditUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    style={{
                      padding: '11px 13px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-hover)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={editDesignation}
                    onChange={e => setEditDesignation(e.target.value)}
                    style={{
                      padding: '11px 13px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-hover)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Email or Mobile Number <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editEmailOrPhone}
                    onChange={e => setEditEmailOrPhone(e.target.value)}
                    style={{
                      padding: '11px 13px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-hover)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      Staff Password / PIN
                    </label>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Master can reset</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter new password/PIN"
                    value={editPin}
                    onChange={e => setEditPin(e.target.value)}
                    style={{
                      padding: '11px 13px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-hover)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Access Status (Kill Switch)
                  </label>
                  <div 
                    onClick={() => setEditIsActive(!editIsActive)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      backgroundColor: editIsActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      border: `1px solid ${editIsActive ? '#10B981' : '#EF4444'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: editIsActive ? '#10B981' : '#EF4444' }}>
                      {editIsActive ? '🟢 Active & Permitted' : '🔴 Revoked / Blocked'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Click to toggle</span>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setEditMustChangePassword(!editMustChangePassword)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-hover)',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <input
                  type="checkbox"
                  checked={editMustChangePassword}
                  onChange={() => {}}
                  style={{ accentColor: '#6366F1', width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                  Require staff to change password upon next login
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>Granular Module Access Scope:</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setEditAllowedTabs(ALL_CRM_MODULES.map(m => m.id))}
                      style={{ background: 'transparent', border: '1px solid #6366F1', color: '#6366F1', borderRadius: '6px', padding: '3px 8px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Grant All (8 Modules)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditAllowedTabs([])}
                      style={{ background: 'transparent', border: '1px solid #EF4444', color: '#EF4444', borderRadius: '6px', padding: '3px 8px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Revoke All Access
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxHeight: '250px', overflowY: 'auto', padding: '12px', backgroundColor: 'var(--bg-hover)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  {ALL_CRM_MODULES.map(mod => {
                    const isSelected = editAllowedTabs.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        onClick={() => {
                          if (isSelected) setEditAllowedTabs(editAllowedTabs.filter(t => t !== mod.id));
                          else setEditAllowedTabs([...editAllowedTabs, mod.id]);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.18)' : 'var(--bg-primary)',
                          border: '1px solid',
                          borderColor: isSelected ? '#6366F1' : 'transparent',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                          fontWeight: isSelected ? 600 : 400,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input type="checkbox" checked={isSelected} readOnly style={{ cursor: 'pointer', accentColor: '#6366F1' }} />
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isSelected ? <Unlock size={14} style={{ color: '#10B981' }} /> : <Lock size={14} style={{ opacity: 0.5 }} />}
                          {mod.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setEditingEmployee(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#6366F1' }}>
                  <ShieldCheck size={16} /> Save Updated Access Scope
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Personalized Staff Access Card & Share Modal */}
      {sharingEmployee && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            padding: '16px'
          }} 
          className="animate-fade-in" 
          onClick={() => setSharingEmployee(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="glass-card"
            style={{ 
              width: '680px', 
              maxWidth: '96vw', 
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '30px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '22px',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '46px', height: '46px', borderRadius: '12px', 
                  backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  <Share2 size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Personalized Staff Access Card
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Individual direct login credentials for <strong>{sharingEmployee.name}</strong>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSharingEmployee(null)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Employee Quick Summary Card */}
            <div style={{ 
              padding: '18px 20px', 
              borderRadius: '14px', 
              backgroundColor: 'var(--bg-hover)', 
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ 
                  width: '44px', height: '44px', borderRadius: '50%', 
                  backgroundColor: 'rgba(99, 102, 241, 0.18)', color: '#6366F1', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontWeight: 800, fontSize: '1.2rem' 
                }}>
                  👤
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {sharingEmployee.name}
                    <span style={{ 
                      fontSize: '0.68rem', padding: '2px 8px', borderRadius: '12px', 
                      backgroundColor: sharingEmployee.is_active === false ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', 
                      color: sharingEmployee.is_active === false ? '#EF4444' : '#10B981', 
                      fontWeight: 700 
                    }}>
                      {sharingEmployee.is_active === false ? 'Revoked' : 'Active'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {sharingEmployee.designation || 'Showroom Staff'} • <span style={{ fontFamily: 'monospace' }}>{sharingEmployee.email_or_phone}</span>
                  </div>
                </div>
              </div>

              {/* Staff Login ID & PIN Pills */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>Login ID</div>
                  <div style={{ 
                    fontSize: '0.95rem', 
                    fontWeight: 800, 
                    fontFamily: 'monospace', 
                    color: 'var(--accent-primary)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    marginTop: '2px'
                  }}>
                    {sharingEmployee.username || sharingEmployee.email_or_phone}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>Password / PIN</div>
                  <div style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 900, 
                    letterSpacing: '1px', 
                    fontFamily: 'monospace', 
                    color: '#10B981',
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '4px 14px',
                    borderRadius: '8px',
                    marginTop: '2px'
                  }}>
                    {sharingEmployee.password || sharingEmployee.pin_code || '1234'}
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Personal Web Link Box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  🔗 Personalized Direct Login Link (Pre-fills Workspace & User ID)
                </label>
                <button
                  type="button"
                  onClick={() => setIsEditingWebBase(!isEditingWebBase)}
                  style={{ background: 'transparent', border: 'none', color: '#6366F1', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Globe size={13} />
                  <span>{isEditingWebBase ? 'Hide URL Config' : 'Change Web Portal Domain'}</span>
                </button>
              </div>

              {isEditingWebBase && (
                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                  <input
                    type="text"
                    placeholder="e.g. https://crm.yourcompany.com or http://192.168.1.100:5173"
                    defaultValue={customWebBaseUrl}
                    onChange={e => setWebBaseInput(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.84rem' }}
                  />
                  <button onClick={handleSaveWebBase} className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                    Save Domain
                  </button>
                </div>
              )}

              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                alignItems: 'center', 
                backgroundColor: 'var(--bg-primary)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '10px', 
                padding: '6px 8px 6px 14px' 
              }}>
                <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {getEmployeeDirectLink(sharingEmployee)}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyDirectLink(sharingEmployee)}
                  className="btn btn-secondary hover-lift"
                  style={{ 
                    padding: '8px 14px', 
                    fontSize: '0.82rem', 
                    fontWeight: 700,
                    color: copiedDirectLink ? '#10B981' : 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {copiedDirectLink ? <CheckCircle2 size={16} style={{ color: '#10B981' }} /> : <Copy size={15} />}
                  <span>{copiedDirectLink ? 'Copied Link!' : 'Copy Link'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.open(getEmployeeDirectLink(sharingEmployee), '_blank')}
                  className="btn btn-secondary hover-lift"
                  style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                  title="Test link in browser"
                >
                  <ExternalLink size={15} />
                </button>
              </div>
            </div>

            {/* WhatsApp / Email Formatted Message Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={15} style={{ color: '#10B981' }} />
                  <span>Ready-to-Send Invitation Message (WhatsApp / Email / SMS)</span>
                </label>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Pre-formatted with login steps</span>
              </div>

              <div style={{ 
                padding: '14px 16px', 
                borderRadius: '12px', 
                backgroundColor: 'var(--bg-primary)', 
                border: '1px solid var(--border-color)',
                fontSize: '0.84rem',
                lineHeight: 1.6,
                color: 'var(--text-main)',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                maxHeight: '160px',
                overflowY: 'auto'
              }}>
                {getEmployeeWhatsAppMessage(sharingEmployee)}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => handleCopyMessage(sharingEmployee)}
                  className="btn btn-secondary hover-lift"
                  style={{ 
                    padding: '9px 16px', 
                    fontSize: '0.85rem', 
                    fontWeight: 700,
                    color: copiedMessage ? '#10B981' : 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {copiedMessage ? <CheckCircle2 size={16} style={{ color: '#10B981' }} /> : <Copy size={15} />}
                  <span>{copiedMessage ? 'Copied Invitation!' : 'Copy Full Message'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const text = encodeURIComponent(getEmployeeWhatsAppMessage(sharingEmployee));
                    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                  }}
                  className="btn btn-primary hover-lift"
                  style={{ 
                    padding: '9px 16px', 
                    fontSize: '0.85rem', 
                    fontWeight: 700,
                    backgroundColor: '#25D366', 
                    borderColor: '#25D366',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Open in WhatsApp Web / App"
                >
                  <Send size={15} />
                  <span>Send via WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendEmail(sharingEmployee)}
                  className="btn btn-primary hover-lift"
                  style={{ 
                    padding: '9px 16px', 
                    fontSize: '0.85rem', 
                    fontWeight: 700,
                    backgroundColor: '#2563EB', 
                    borderColor: '#2563EB',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Open Default Email Client (Outlook, Windows Mail, etc.)"
                >
                  <Mail size={15} />
                  <span>Send via Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenGmail(sharingEmployee)}
                  className="btn btn-secondary hover-lift"
                  style={{ 
                    padding: '9px 13px', 
                    fontSize: '0.85rem', 
                    fontWeight: 700,
                    color: '#EA4335',
                    borderColor: 'rgba(234, 67, 53, 0.4)',
                    background: 'rgba(234, 67, 53, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Compose directly in Gmail Web browser"
                >
                  <ExternalLink size={14} />
                  <span>Gmail</span>
                </button>
              </div>
            </div>

            {/* Permission Scope Summary */}
            <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Assigned CRM Modules ({sharingEmployee.allowed_tabs?.length || 0}):
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  {(sharingEmployee.allowed_tabs || []).map(tabId => ALL_CRM_MODULES.find(m => m.id === tabId)?.label || tabId).join(' • ') || 'None assigned yet'}
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Master retains full kill-switch control anytime
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button 
                type="button" 
                onClick={() => setSharingEmployee(null)} 
                className="btn btn-primary"
                style={{ padding: '10px 24px', fontWeight: 700 }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
