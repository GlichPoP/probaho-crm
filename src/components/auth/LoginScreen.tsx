import React, { useState, useEffect } from 'react';
import { 
  Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Moon, Sun, 
  Check, X, Building2, AlertCircle, ShieldAlert 
} from 'lucide-react';
import { ProbahoLogo } from '../layout/ProbahoLogo';
import { dbService } from '../../database/db';
import { validateMasterPassword } from '../../utils/security';
import type { UserAccount } from '../../types/crm';

interface LoginScreenProps {
  onLoginSuccess: (user: UserAccount, keepLoggedIn: boolean) => void;
  theme?: string;
  onToggleTheme?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  theme = 'light',
  onToggleTheme
}) => {
  // Check if system has a master account configured
  const [isMasterConfigured, setIsMasterConfigured] = useState<boolean>(() => dbService.isMasterConfigured());
  const [mode, setMode] = useState<'login' | 'setup'>(() => (dbService.isMasterConfigured() ? 'login' : 'setup'));

  // Standard Login Fields
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState<boolean>(true);

  // Master Setup Fields
  const [masterUsername, setMasterUsername] = useState<string>('admin');
  const [masterFullName, setMasterFullName] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>(() => dbService.getBrandProfile()?.brand_name || '');
  const [masterPassword, setMasterPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showMasterPassword, setShowMasterPassword] = useState<boolean>(false);

  // State & Feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Password validation for Master
  const masterVal = validateMasterPassword(masterPassword);
  const passwordsMatch = masterPassword.length > 0 && masterPassword === confirmPassword;
  const canSubmitMaster = 
    masterUsername.trim().length >= 3 &&
    masterFullName.trim().length >= 2 &&
    masterVal.isValid &&
    passwordsMatch;

  useEffect(() => {
    setIsMasterConfigured(dbService.isMasterConfigured());
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = dbService.authenticateUser(loginIdentifier, loginPassword);
      if (res.success && res.user) {
        onLoginSuccess(res.user, keepLoggedIn);
      } else {
        setErrorMsg(res.message || 'Invalid username or password. Please verify your credentials.');
        setIsLoading(false);
      }
    }, 200);
  };

  const handleMasterSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!canSubmitMaster) {
      if (!masterVal.isValid) {
        setErrorMsg('Please fulfill all Master password security criteria.');
      } else if (!passwordsMatch) {
        setErrorMsg('The passwords do not match.');
      } else if (masterFullName.trim().length < 2) {
        setErrorMsg('Please enter the Master Administrator Full Name.');
      }
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = dbService.initializeMasterAccount({
        username: masterUsername.trim(),
        name: masterFullName.trim(),
        password: masterPassword,
        businessName: businessName.trim() || undefined
      });

      if (res.success && res.user) {
        setSuccessMsg('Master account initialized successfully! Launching CRM...');
        setIsMasterConfigured(true);
        setTimeout(() => {
          onLoginSuccess(res.user!, keepLoggedIn);
        }, 800);
      } else {
        setErrorMsg(res.message || 'Failed to initialize Master account.');
        setIsLoading(false);
      }
    }, 250);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient Radial Glow Background */}
      <div style={{
        position: 'absolute',
        width: '650px',
        height: '650px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.16) 0%, rgba(139, 92, 246, 0.06) 50%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none'
      }} />

      {/* Top Bar with Theme Toggle */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
            title="Toggle Light / Dark Mode"
          >
            {theme === 'dark' || theme === 'notion-dark' ? (
              <Sun size={18} style={{ color: '#F59E0B' }} />
            ) : (
              <Moon size={18} style={{ color: '#6366F1' }} />
            )}
          </button>
        )}
      </div>

      {/* Main Form Container */}
      <div style={{
        width: '100%',
        maxWidth: mode === 'setup' ? '500px' : '440px',
        backgroundColor: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border-color)',
        borderRadius: '24px',
        padding: mode === 'setup' ? '32px 32px' : '36px 32px',
        boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(99, 102, 241, 0.12)',
        position: 'relative',
        zIndex: 10,
        transition: 'all 0.3s ease'
      }}>
        {/* Logo and Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-block', marginBottom: '12px' }}>
            <ProbahoLogo size={60} style={{ borderRadius: '16px', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)' }} />
          </div>
          <h1 style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            margin: '0 0 4px 0',
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em'
          }}>
            PROBAHO CRM Solutions
          </h1>
          <p style={{
            fontSize: '0.84rem',
            color: 'var(--text-muted)',
            margin: 0
          }}>
            {mode === 'setup' 
              ? 'First-Time Setup: Establish Master Administrator Account' 
              : 'Enterprise Business Management & Showroom POS'}
          </p>
        </div>

        {/* Feedback Banners */}
        {errorMsg && (
          <div style={{
            padding: '12px 14px',
            borderRadius: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#EF4444',
            fontSize: '0.84rem',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            padding: '12px 14px',
            borderRadius: '12px',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10B981',
            fontSize: '0.84rem',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Check size={18} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* -------------------- MODE: INITIAL MASTER SETUP -------------------- */}
        {mode === 'setup' && (
          <form onSubmit={handleMasterSetupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              padding: '10px 12px',
              borderRadius: '10px',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              lineHeight: 1.45,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <ShieldAlert size={16} style={{ color: '#6366F1', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--text-main)' }}>Root Security Requirement:</strong> Master accounts control all retail operations, staff permissions, and financial ledgers. A strong master password is mandatory.
              </div>
            </div>

            {/* Master ID / Username & Full Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                  Master ID / Username <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. admin or owner"
                  value={masterUsername}
                  onChange={e => setMasterUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  required
                  style={{ width: '100%', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                  Master Full Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Irfanur Rahman"
                  value={masterFullName}
                  onChange={e => setMasterFullName(e.target.value)}
                  required
                  style={{ width: '100%', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            {/* Business / Showroom Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                Business or Showroom Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Urban Style Showroom"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  style={{ width: '100%', paddingLeft: '34px', fontSize: '0.88rem' }}
                />
                <Building2 size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            {/* Master Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                Master Strong Password <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showMasterPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Min 8 characters, Upper, Lower, Number, Symbol"
                  value={masterPassword}
                  onChange={e => setMasterPassword(e.target.value)}
                  required
                  style={{ width: '100%', paddingRight: '38px', fontSize: '0.88rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowMasterPassword(!showMasterPassword)}
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
                  {showMasterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Master Password Strength Checklist */}
            <div style={{
              padding: '10px 12px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-hover)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Security Verification
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: masterVal.strengthColor }}>
                  {masterVal.strengthLabel} ({masterVal.score}/5)
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(masterVal.score / 5) * 100}%`,
                  height: '100%',
                  backgroundColor: masterVal.strengthColor,
                  transition: 'width 0.3s ease'
                }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '0.73rem', marginTop: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: masterVal.hasMinLength ? '#10B981' : 'var(--text-muted)' }}>
                  {masterVal.hasMinLength ? <Check size={12} /> : <X size={12} />} 8+ Characters
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: masterVal.hasUppercase ? '#10B981' : 'var(--text-muted)' }}>
                  {masterVal.hasUppercase ? <Check size={12} /> : <X size={12} />} Uppercase (A-Z)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: masterVal.hasLowercase ? '#10B981' : 'var(--text-muted)' }}>
                  {masterVal.hasLowercase ? <Check size={12} /> : <X size={12} />} Lowercase (a-z)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: masterVal.hasNumber ? '#10B981' : 'var(--text-muted)' }}>
                  {masterVal.hasNumber ? <Check size={12} /> : <X size={12} />} Number (0-9)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', gridColumn: 'span 2', color: masterVal.hasSpecial ? '#10B981' : 'var(--text-muted)' }}>
                  {masterVal.hasSpecial ? <Check size={12} /> : <X size={12} />} Special Symbol (!@#$%^&*...)
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                Confirm Master Password <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Re-enter master password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                style={{ width: '100%', fontSize: '0.88rem' }}
              />
              {confirmPassword.length > 0 && (
                <div style={{
                  fontSize: '0.74rem',
                  marginTop: '4px',
                  color: passwordsMatch ? '#10B981' : '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {passwordsMatch ? <Check size={12} /> : <X size={12} />}
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </div>
              )}
            </div>

            {/* Remember Session */}
            <div
              onClick={() => setKeepLoggedIn(!keepLoggedIn)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                userSelect: 'none',
                marginTop: '4px'
              }}
            >
              <input
                type="checkbox"
                checked={keepLoggedIn}
                onChange={() => {}}
                style={{ accentColor: '#6366F1', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Keep me logged in on this computer
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!canSubmitMaster || isLoading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '6px',
                fontSize: '0.92rem',
                fontWeight: 700,
                borderRadius: '12px',
                opacity: canSubmitMaster && !isLoading ? 1 : 0.6,
                cursor: canSubmitMaster && !isLoading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
              }}
            >
              {isLoading ? 'Creating Master Profile...' : (
                <>
                  <span>Create Master Account & Start CRM</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Switch to Standard Sign In */}
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setMode('login');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Staff Member or Existing Business? Sign In
              </button>
            </div>
          </form>
        )}

        {/* -------------------- MODE: UNIFIED SIGN IN (MASTER & STAFF) -------------------- */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Username / Staff ID */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                User ID / Username / Staff ID <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. admin or staff_karim"
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    paddingLeft: '38px',
                    paddingRight: '12px',
                    fontSize: '0.92rem'
                  }}
                />
                <User size={18} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
              </div>
            </div>

            {/* Password / PIN */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                Password or PIN <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Enter your security password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    paddingLeft: '38px',
                    paddingRight: '40px',
                    fontSize: '0.92rem'
                  }}
                />
                <Lock size={18} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div
              onClick={() => setKeepLoggedIn(!keepLoggedIn)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <input
                type="checkbox"
                checked={keepLoggedIn}
                onChange={() => {}}
                style={{ accentColor: '#6366F1', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Keep me logged in on this computer
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !loginIdentifier.trim() || !loginPassword.trim()}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Authenticating...' : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Switch to Setup / First-Time */}
            <div style={{ textAlign: 'center', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setMode('setup');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {!isMasterConfigured ? 'First-Time Setup? Create Master Administrator' : 'Set Up New Business Master Account'}
              </button>
            </div>
          </form>
        )}

        {/* Security Footer Notice */}
        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          color: 'var(--text-dim)',
          fontSize: '0.74rem'
        }}>
          <ShieldCheck size={14} style={{ color: '#10B981' }} />
          <span>Local Offline Relational Persistence • Role-Based Encryption</span>
        </div>
      </div>
    </div>
  );
};
