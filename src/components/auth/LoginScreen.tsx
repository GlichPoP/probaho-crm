import React, { useState, useEffect } from 'react';
import { 
  Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Moon, Sun, 
  Check, Building2, AlertCircle 
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
        setErrorMsg(res.message || 'Invalid username or password. Please verify credentials.');
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
        setErrorMsg('Please satisfy all Master password requirements.');
      } else if (!passwordsMatch) {
        setErrorMsg('Passwords do not match.');
      } else if (masterFullName.trim().length < 2) {
        setErrorMsg('Please enter Master Administrator Full Name.');
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
        setSuccessMsg('Master account created! Launching CRM...');
        setIsMasterConfigured(true);
        setTimeout(() => {
          onLoginSuccess(res.user!, keepLoggedIn);
        }, 600);
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
      padding: '16px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient Radial Glow Background */}
      <div style={{
        position: 'absolute',
        width: '550px',
        height: '550px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.04) 50%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none'
      }} />

      {/* Top Bar with Theme Toggle */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 20
      }}>
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}
            title="Toggle Light / Dark Mode"
          >
            {theme === 'dark' || theme === 'notion-dark' ? (
              <Sun size={16} style={{ color: '#F59E0B' }} />
            ) : (
              <Moon size={16} style={{ color: '#6366F1' }} />
            )}
          </button>
        )}
      </div>

      {/* Main Form Container */}
      <div style={{
        width: '100%',
        maxWidth: '450px',
        maxHeight: 'calc(100vh - 32px)',
        overflowY: 'auto',
        backgroundColor: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '24px 26px',
        boxShadow: '0 16px 40px -10px rgba(0, 0, 0, 0.2), 0 0 24px rgba(99, 102, 241, 0.08)',
        position: 'relative',
        zIndex: 10,
        transition: 'all 0.25s ease'
      }}>
        {/* Compact Logo & Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'inline-block', marginBottom: '8px' }}>
            <ProbahoLogo size={42} style={{ borderRadius: '12px', boxShadow: '0 4px 16px rgba(99, 102, 241, 0.25)' }} />
          </div>
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            margin: '0 0 2px 0',
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em'
          }}>
            PROBAHO CRM Solutions
          </h1>
          <p style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            margin: 0
          }}>
            {mode === 'login' ? 'Showroom & Business Access Terminal' : 'First-Time Setup: Create Master Profile'}
          </p>
        </div>

        {/* Top Segmented Navigation Tab */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4px',
          padding: '3px',
          backgroundColor: 'var(--bg-hover)',
          borderRadius: '11px',
          marginBottom: '14px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            onClick={() => { setErrorMsg(null); setMode('login'); }}
            style={{
              padding: '7px 8px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: mode === 'login' ? 700 : 500,
              backgroundColor: mode === 'login' ? 'var(--bg-card)' : 'transparent',
              color: mode === 'login' ? 'var(--accent-primary)' : 'var(--text-muted)',
              border: mode === 'login' ? '1px solid var(--border-color)' : 'none',
              boxShadow: mode === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <User size={14} />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => { setErrorMsg(null); setMode('setup'); }}
            style={{
              padding: '7px 8px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: mode === 'setup' ? 700 : 500,
              backgroundColor: mode === 'setup' ? 'var(--bg-card)' : 'transparent',
              color: mode === 'setup' ? 'var(--accent-primary)' : 'var(--text-muted)',
              border: mode === 'setup' ? '1px solid var(--border-color)' : 'none',
              boxShadow: mode === 'setup' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <ShieldCheck size={14} />
            <span>{isMasterConfigured ? 'Master Config' : 'Create Master'}</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div style={{
            padding: '8px 12px',
            borderRadius: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#EF4444',
            fontSize: '0.78rem',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            padding: '8px 12px',
            borderRadius: '10px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#10B981',
            fontSize: '0.78rem',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Check size={15} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* -------------------- MODE: INITIAL MASTER SETUP -------------------- */}
        {mode === 'setup' && (
          <form onSubmit={handleMasterSetupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Master ID / Username & Full Name in 2 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Master ID <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="admin"
                  value={masterUsername}
                  onChange={e => setMasterUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  required
                  style={{ width: '100%', fontSize: '0.84rem', padding: '7px 10px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Full Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Irfanur Rahman"
                  value={masterFullName}
                  onChange={e => setMasterFullName(e.target.value)}
                  required
                  style={{ width: '100%', fontSize: '0.84rem', padding: '7px 10px' }}
                />
              </div>
            </div>

            {/* Business / Showroom Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                Business or Showroom Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Probaho Store"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  style={{ width: '100%', paddingLeft: '30px', fontSize: '0.84rem', padding: '7px 10px 7px 30px' }}
                />
                <Building2 size={14} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            {/* Password & Confirm Password in 2 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Strong Password <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showMasterPassword ? 'text' : 'password'}
                    className="input-field"
                    placeholder="Enter password"
                    value={masterPassword}
                    onChange={e => setMasterPassword(e.target.value)}
                    required
                    style={{ width: '100%', paddingRight: '32px', fontSize: '0.84rem', padding: '7px 32px 7px 10px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowMasterPassword(!showMasterPassword)}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {showMasterPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Confirm Password <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Re-enter"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  style={{ width: '100%', fontSize: '0.84rem', padding: '7px 10px' }}
                />
              </div>
            </div>

            {/* Compact Password Strength Meter & Micro-Pills */}
            <div style={{
              padding: '6px 8px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-hover)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-dim)' }}>
                  Password Security Rules:
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: masterVal.strengthColor }}>
                  {masterVal.strengthLabel} ({masterVal.score}/5)
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '3px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(masterVal.score / 5) * 100}%`,
                  height: '100%',
                  backgroundColor: masterVal.strengthColor,
                  transition: 'width 0.25s ease'
                }} />
              </div>

              {/* Micro badge pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                {[
                  { label: '8+ Chars', met: masterVal.hasMinLength },
                  { label: 'A-Z', met: masterVal.hasUppercase },
                  { label: 'a-z', met: masterVal.hasLowercase },
                  { label: '0-9', met: masterVal.hasNumber },
                  { label: '!@# Symbol', met: masterVal.hasSpecial },
                  { label: 'Match', met: passwordsMatch }
                ].map((item, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.67rem',
                      fontWeight: item.met ? 600 : 500,
                      padding: '2px 6px',
                      borderRadius: '5px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      backgroundColor: item.met ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)',
                      color: item.met ? '#10B981' : 'var(--text-muted)',
                      border: `1px solid ${item.met ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)'}`
                    }}
                  >
                    {item.met ? <Check size={10} /> : <span style={{ opacity: 0.5 }}>•</span>}
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Remember Session */}
            <div
              onClick={() => setKeepLoggedIn(!keepLoggedIn)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                cursor: 'pointer',
                userSelect: 'none',
                marginTop: '2px'
              }}
            >
              <input
                type="checkbox"
                checked={keepLoggedIn}
                onChange={() => {}}
                style={{ accentColor: '#6366F1', width: '14px', height: '14px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
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
                padding: '9px',
                marginTop: '2px',
                fontSize: '0.86rem',
                fontWeight: 700,
                borderRadius: '10px',
                opacity: canSubmitMaster && !isLoading ? 1 : 0.6,
                cursor: canSubmitMaster && !isLoading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)'
              }}
            >
              {isLoading ? 'Creating Master Profile...' : (
                <>
                  <span>Create Master Account & Launch</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}

        {/* -------------------- MODE: UNIFIED SIGN IN (MASTER & STAFF) -------------------- */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Username / Staff ID */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
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
                    paddingLeft: '32px',
                    paddingRight: '10px',
                    fontSize: '0.86rem',
                    paddingTop: '8px',
                    paddingBottom: '8px'
                  }}
                />
                <User size={15} style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
              </div>
            </div>

            {/* Password / PIN */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                Password or Security PIN <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Enter password or PIN"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    paddingLeft: '32px',
                    paddingRight: '34px',
                    fontSize: '0.86rem',
                    paddingTop: '8px',
                    paddingBottom: '8px'
                  }}
                />
                <Lock size={15} style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div
              onClick={() => setKeepLoggedIn(!keepLoggedIn)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                cursor: 'pointer',
                userSelect: 'none',
                marginTop: '2px'
              }}
            >
              <input
                type="checkbox"
                checked={keepLoggedIn}
                onChange={() => {}}
                style={{ accentColor: '#6366F1', width: '14px', height: '14px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
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
                padding: '10px',
                marginTop: '4px',
                fontSize: '0.88rem',
                fontWeight: 700,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.25)',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Authenticating...' : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Minimal Unobtrusive Security Badge */}
        <div style={{
          marginTop: '16px',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
          color: 'var(--text-dim)',
          fontSize: '0.7rem'
        }}>
          <ShieldCheck size={12} style={{ color: '#10B981' }} />
          <span>Encrypted Local Terminal</span>
        </div>
      </div>
    </div>
  );
};
