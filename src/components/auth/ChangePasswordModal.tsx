import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, Check, X, ShieldCheck, AlertCircle } from 'lucide-react';
import type { UserAccount } from '../../types/crm';
import { dbService } from '../../database/db';
import { validateMasterPassword } from '../../utils/security';

interface ChangePasswordModalProps {
  isOpen: boolean;
  currentUser: UserAccount;
  onClose: () => void;
  onSuccess?: () => void;
  isEnforced?: boolean; // If true, modal cannot be dismissed until password is changed
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onSuccess,
  isEnforced = false
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const isMaster = currentUser.role === 'master';
  const masterVal = isMaster ? validateMasterPassword(newPassword) : null;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const canSubmit = isMaster
    ? (masterVal?.isValid && passwordsMatch && currentPassword.trim().length > 0)
    : (newPassword.trim().length >= 4 && passwordsMatch && currentPassword.trim().length > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword.trim()) {
      setErrorMsg('Please enter your current password.');
      return;
    }

    if (!passwordsMatch) {
      setErrorMsg('The new password and confirmation password do not match.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = dbService.updateUserPassword(currentUser.id, currentPassword, newPassword);
      setIsLoading(false);

      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.message);
      }
    }, 200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '20px'
      }}
      onClick={isEnforced ? undefined : onClose}
    >
      <div
        className="glass-card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 6px 16px rgba(99, 102, 241, 0.35)'
            }}>
              <KeyRound size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {isEnforced ? 'Set Personal Password' : 'Change Password'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                {isMaster ? 'Master Administrator Security Credentials' : `Staff Profile: ${currentUser.name}`}
              </p>
            </div>
          </div>
          {!isEnforced && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {isEnforced && (
          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            fontSize: '0.84rem',
            color: 'var(--accent-primary)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldCheck size={18} />
            <span>Please choose your permanent personal password before accessing the showroom workspace.</span>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMsg && (
          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#EF4444',
            fontSize: '0.84rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#10B981',
            fontSize: '0.84rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Check size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Current Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Current Password or Initial PIN <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showCurrent ? 'text' : 'password'}
                className="input-field"
                placeholder={isMaster ? 'Enter current master password' : 'Enter initial password given by master'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
                style={{ width: '100%', paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              New Password <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNew ? 'text' : 'password'}
                className="input-field"
                placeholder={isMaster ? 'Strong password (8+ chars, upper, number, symbol)' : 'Min 4 characters'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                style={{ width: '100%', paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Master Password Policy Visual Checklist */}
          {isMaster && masterVal && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-hover)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Master Password Security Policy
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: masterVal.strengthColor }}>
                  {masterVal.strengthLabel} ({masterVal.score}/5)
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden', marginBottom: '6px' }}>
                <div style={{
                  width: `${(masterVal.score / 5) * 100}%`,
                  height: '100%',
                  backgroundColor: masterVal.strengthColor,
                  transition: 'width 0.3s ease, background-color 0.3s ease'
                }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.74rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: masterVal.hasMinLength ? '#10B981' : 'var(--text-muted)' }}>
                  {masterVal.hasMinLength ? <Check size={13} /> : <X size={13} />} At least 8 characters
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: masterVal.hasUppercase ? '#10B981' : 'var(--text-muted)' }}>
                  {masterVal.hasUppercase ? <Check size={13} /> : <X size={13} />} Uppercase (A-Z)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: masterVal.hasLowercase ? '#10B981' : 'var(--text-muted)' }}>
                  {masterVal.hasLowercase ? <Check size={13} /> : <X size={13} />} Lowercase (a-z)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: masterVal.hasNumber ? '#10B981' : 'var(--text-muted)' }}>
                  {masterVal.hasNumber ? <Check size={13} /> : <X size={13} />} Number (0-9)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', gridColumn: 'span 2', color: masterVal.hasSpecial ? '#10B981' : 'var(--text-muted)' }}>
                  {masterVal.hasSpecial ? <Check size={13} /> : <X size={13} />} Special character (!@#$%^&*...)
                </div>
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Confirm New Password <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="Re-type new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              style={{
                width: '100%',
                borderColor: confirmPassword.length > 0 && !passwordsMatch ? '#EF4444' : undefined
              }}
            />
            {confirmPassword.length > 0 && (
              <div style={{
                fontSize: '0.75rem',
                marginTop: '4px',
                color: passwordsMatch ? '#10B981' : '#EF4444',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {passwordsMatch ? <Check size={13} /> : <X size={13} />}
                {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            {!isEnforced && (
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!canSubmit || isLoading}
              className="btn btn-primary"
              style={{
                flex: 1,
                opacity: canSubmit && !isLoading ? 1 : 0.6,
                cursor: canSubmit && !isLoading ? 'pointer' : 'not-allowed'
              }}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
