import React from 'react';
import { Crown, Check, X, Shield, ArrowRight, KeyRound, Lock } from 'lucide-react';
import type { UserAccount } from '../../types/crm';
import { dbService } from '../../database/db';

interface ProfileSwitcherModalProps {
  currentUser: UserAccount;
  onClose: () => void;
  onSelectUser: (userId: string) => void;
  onOpenStaffSettings: () => void;
  onOpenAuthModal?: () => void;
  onLockSession?: () => void;
  onChangePassword?: () => void;
}

export const ProfileSwitcherModal: React.FC<ProfileSwitcherModalProps> = ({
  currentUser,
  onClose,
  onSelectUser,
  onOpenStaffSettings,
  onOpenAuthModal,
  onLockSession,
  onChangePassword
}) => {
  const allUsers = dbService.getUserAccounts();
  const masters = allUsers.filter(u => u.role === 'master');
  const employees = allUsers.filter(u => u.role === 'employee');

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.78)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }} className="animate-fade-in" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="glass-card"
        style={{ width: '560px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Crown size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Switch CRM Profile
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Select a profile to switch active session
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Current Active User Banner */}
        <div style={{
          padding: '14px 18px',
          borderRadius: '12px',
          backgroundColor: currentUser.role === 'master' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(99, 102, 241, 0.12)',
          border: '1px solid',
          borderColor: currentUser.role === 'master' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(99, 102, 241, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '1.6rem' }}>{currentUser.role === 'master' ? '👑' : '👤'}</div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Currently Active Session</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>{currentUser.name}</div>
            </div>
          </div>
          <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Check size={14} /> Active
          </span>
        </div>

        {/* Master Accounts Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            👑 Master Profiles
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {masters.map(master => {
              const isCurrent = master.id === currentUser.id;
              return (
                <div
                  key={master.id}
                  onClick={() => { if (!isCurrent) onSelectUser(master.id); }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    backgroundColor: isCurrent ? 'rgba(245, 158, 11, 0.18)' : 'var(--bg-hover)',
                    border: '1px solid',
                    borderColor: isCurrent ? '#F59E0B' : 'var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: isCurrent ? 'default' : 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className={isCurrent ? '' : 'hover-lift'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>👑</span>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>{master.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>{master.email_or_phone}</div>
                    </div>
                  </div>
                  {isCurrent ? (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F59E0B' }}>Logged In</span>
                  ) : (
                    <button style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                      Switch <ArrowRight size={12} style={{ verticalAlign: 'middle', marginLeft: '2px' }} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Employee Accounts Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            👤 Employee Profiles
          </div>
          {employees.length === 0 ? (
            <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--bg-hover)', border: '1px dashed var(--border-color)', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              No employee profiles yet. Create one from Staff Permissions settings below.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {employees.map(emp => {
                const isCurrent = emp.id === currentUser.id;
                const modCount = (emp.allowed_tabs || []).length;
                return (
                  <div
                    key={emp.id}
                    onClick={() => { if (!isCurrent) onSelectUser(emp.id); }}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      backgroundColor: isCurrent ? 'rgba(99, 102, 241, 0.18)' : 'var(--bg-hover)',
                      border: '1px solid',
                      borderColor: isCurrent ? '#6366F1' : 'var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: isCurrent ? 'default' : 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    className={isCurrent ? '' : 'hover-lift'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.2rem' }}>👤</span>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>{emp.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          Permitted Modules: <strong>{modCount}</strong> / 8
                        </div>
                      </div>
                    </div>
                    {isCurrent ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366F1' }}>Logged In</span>
                    ) : (
                      <button style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}>
                        Switch <ArrowRight size={12} style={{ verticalAlign: 'middle', marginLeft: '2px' }} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => { onClose(); onOpenStaffSettings(); }}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-hover)',
              border: '1px solid var(--border-color)',
              color: 'var(--accent-primary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              justifyContent: 'center'
            }}
            className="hover-lift"
          >
            <Shield size={16} />
            <span>Manage Staff Access Permissions & RBAC Hub</span>
          </button>

          {onChangePassword && (
            <button
              onClick={() => { onClose(); onChangePassword(); }}
              style={{
                padding: '9px 18px',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10B981',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                justifyContent: 'center'
              }}
              className="hover-lift"
            >
              <KeyRound size={15} />
              <span>Change My Password / Security PIN</span>
            </button>
          )}

          {onOpenAuthModal && (
            <button
              onClick={() => { onClose(); onOpenAuthModal(); }}
              style={{
                padding: '9px 18px',
                borderRadius: '10px',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#6366F1',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                justifyContent: 'center'
              }}
              className="hover-lift"
            >
              <KeyRound size={15} />
              <span>Sign In with PIN / Switch Company Workspace</span>
            </button>
          )}

          {onLockSession && (
            <button
              onClick={() => { onClose(); onLockSession(); }}
              style={{
                padding: '9px 18px',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.28)',
                color: '#EF4444',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                justifyContent: 'center'
              }}
              className="hover-lift"
            >
              <Lock size={15} />
              <span>Lock CRM Terminal / Log Out</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
