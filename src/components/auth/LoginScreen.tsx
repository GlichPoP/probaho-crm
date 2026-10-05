import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, Moon, Sun, CheckSquare, Square } from 'lucide-react';
import { ProbahoLogo } from '../layout/ProbahoLogo';
import { dbService } from '../../database/db';
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
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('admin123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = dbService.authenticateUser(username, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user, keepLoggedIn);
      } else {
        setErrorMsg(res.message || 'Invalid username or password. Please verify your credentials.');
        setIsLoading(false);
      }
    }, 200);
  };

  const handleQuickFillMaster = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMsg(null);
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
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 70%)',
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

      {/* Login Card */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border-color)',
        borderRadius: '24px',
        padding: '36px 32px',
        boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(99, 102, 241, 0.12)',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Brand Header Lockup */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '28px'
        }}>
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <ProbahoLogo size={68} glow={true} />
          </div>

          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
            margin: '0 0 6px 0'
          }}>
            PROBAHO CRM Solutions
          </h1>

          <p style={{
            fontSize: '0.86rem',
            color: 'var(--text-muted)',
            margin: '0 0 14px 0',
            fontWeight: 500
          }}>
            Enterprise Showroom & Business Management Suite
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '20px',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10B981',
            fontSize: '0.74rem',
            fontWeight: 700
          }}>
            <ShieldCheck size={14} />
            <span>Secured Offline Workspace Terminal</span>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div style={{
            padding: '12px 14px',
            borderRadius: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#EF4444',
            fontSize: '0.84rem',
            fontWeight: 600,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Username Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              marginBottom: '6px'
            }}>
              Username / Staff ID / Email
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-input)',
              border: '1.5px solid var(--border-color)',
              borderRadius: '12px',
              padding: '0 14px',
              transition: 'border-color 0.2s ease'
            }}>
              <User size={18} style={{ color: 'var(--text-muted)', marginRight: '10px', flexShrink: 0 }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (e.g. admin)"
                required
                style={{
                  width: '100%',
                  height: '44px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem',
                  fontWeight: 600
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              marginBottom: '6px'
            }}>
              Password / Master PIN
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-input)',
              border: '1.5px solid var(--border-color)',
              borderRadius: '12px',
              padding: '0 14px',
              transition: 'border-color 0.2s ease'
            }}>
              <Lock size={18} style={{ color: 'var(--text-muted)', marginRight: '10px', flexShrink: 0 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password or PIN"
                required
                style={{
                  width: '100%',
                  height: '44px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem',
                  fontWeight: 600
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Keep Me Logged In Checkbox */}
          <div
            onClick={() => setKeepLoggedIn(!keepLoggedIn)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '4px 0'
            }}
          >
            <div style={{ color: keepLoggedIn ? '#6366F1' : 'var(--text-muted)', marginTop: '2px' }}>
              {keepLoggedIn ? <CheckSquare size={18} /> : <Square size={18} />}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Keep me logged in on this computer
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Uncheck for high security on shared cashier/showroom counters
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #8B5CF6 100%)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.94rem',
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
              transition: 'all 0.2s ease',
              marginTop: '6px'
            }}
          >
            <span>{isLoading ? 'Authenticating...' : 'Unlock CRM Workspace'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Quick Demo Credentials Footer Helper */}
        <div style={{
          marginTop: '24px',
          paddingTop: '18px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            fontSize: '0.76rem',
            color: 'var(--text-muted)',
            textAlign: 'center'
          }}>
            Default Master: <strong style={{ color: 'var(--text-main)' }}>admin</strong> • Password: <strong style={{ color: 'var(--text-main)' }}>admin123</strong>
          </div>
          <button
            type="button"
            onClick={handleQuickFillMaster}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              color: '#6366F1',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={13} />
            <span>Auto-Fill Master Credentials</span>
          </button>
        </div>
      </div>
    </div>
  );
};
