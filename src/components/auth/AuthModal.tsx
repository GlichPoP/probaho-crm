import React, { useState, useEffect } from 'react';
import { 
  KeyRound, Building, Phone, 
  AlertCircle, ShieldCheck, ArrowRight, Sparkles
} from 'lucide-react';
import { dbService } from '../../database/db';
import { firebaseSync } from '../../services/firebaseSync';
import type { UserAccount, BusinessType } from '../../types/crm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  defaultMode?: 'signin' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultMode = 'signin'
}) => {
  const [mode, setMode] = useState<'signin' | 'register'>(defaultMode);

  // Sign in fields
  const [companyCode, setCompanyCode] = useState<string>(() => {
    // Check URL query parameters first (e.g. ?code=URBAN-101)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get('code') || params.get('company');
      if (fromUrl) return fromUrl.toUpperCase();
    }
    return dbService.getWorkspaceId() || '';
  });
  const [phoneOrId, setPhoneOrId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('user') || params.get('phone') || params.get('email') || '';
    }
    return '';
  });
  const [pin, setPin] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('pin') || '';
    }
    return '';
  });

  // Register fields (Master)
  const [brandName, setBrandName] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');
  const [ownerPhone, setOwnerPhone] = useState<string>('');
  const [ownerPin, setOwnerPin] = useState<string>('');
  const [businessType, setBusinessType] = useState<BusinessType>('clothing');
  const [loadDemo, setLoadDemo] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      // Auto-detect URL parameter on open
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get('code') || params.get('company');
      const fromUser = params.get('user') || params.get('phone') || params.get('email');
      const fromPin = params.get('pin');
      if (fromUrl) {
        setCompanyCode(fromUrl.toUpperCase());
        setMode('signin');
      }
      if (fromUser) {
        setPhoneOrId(fromUser);
        setMode('signin');
      }
      if (fromPin) {
        setPin(fromPin);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const cleanCode = companyCode.trim().toUpperCase();
      const cleanPhone = phoneOrId.trim();
      const cleanPin = pin.trim();

      if (!cleanCode) {
        setErrorMsg('Please enter your Company Workspace Code.');
        setIsLoading(false);
        return;
      }
      if (!cleanPhone) {
        setErrorMsg('Please enter your Mobile Number, Email, or Staff ID.');
        setIsLoading(false);
        return;
      }

      // If workspace code changed, update workspace
      if (cleanCode !== dbService.getWorkspaceId()) {
        dbService.setWorkspaceId(cleanCode);
        // If Firebase is active, attempt to pull latest snapshot for this workspace
        if (firebaseSync.getStatus() !== 'disconnected') {
          const remote = await firebaseSync.pullDataFromCloud(cleanCode);
          if (remote) {
            dbService.mergeRemoteData(remote);
          }
        }
      }

      // Authenticate against database
      const result = dbService.authenticateUserWithPin(cleanPhone, cleanPin);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
        onClose();
      } else {
        setErrorMsg(result.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!brandName.trim() || !ownerName.trim() || !ownerPhone.trim()) {
      setErrorMsg('Please fill in Brand Name, Owner Name, and Mobile Number.');
      return;
    }

    const generatedCode = brandName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) + '-' + Math.floor(100 + Math.random() * 900);

    dbService.completeOnboarding({
      brandName: brandName.trim(),
      businessType,
      phone: ownerPhone.trim(),
      address: 'Corporate Headquarters',
      ownerName: ownerName.trim(),
      ownerEmailOrPhone: ownerPhone.trim(),
      pinCode: ownerPin.trim() || undefined,
      loadDemoData: loadDemo
    });

    dbService.setWorkspaceId(generatedCode);

    const currentUser = dbService.getCurrentUser();
    onLoginSuccess(currentUser);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(10, 15, 30, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100000,
      padding: '16px'
    }}>
      <div 
        className="glass-card animate-scale-in"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '32px',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}
      >
        {/* Header Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)'
          }}>
            <ShieldCheck size={30} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
            PROBAHO CRM Suite
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
            {mode === 'signin' ? 'Sign in with your Company Code & Staff PIN' : 'Set up a new Company Workspace'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          padding: '4px',
          borderRadius: '12px',
          backgroundColor: 'var(--bg-hover)',
          border: '1px solid var(--border-color)',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMsg(null); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: mode === 'signin' ? 'var(--bg-card)' : 'transparent',
              color: mode === 'signin' ? 'var(--text-main)' : 'var(--text-dim)',
              fontWeight: mode === 'signin' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: mode === 'signin' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Sign In (Staff / Master)
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: mode === 'register' ? 'var(--bg-card)' : 'transparent',
              color: mode === 'register' ? 'var(--text-main)' : 'var(--text-dim)',
              fontWeight: mode === 'register' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: mode === 'register' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Register New Brand
          </button>
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #EF4444',
            color: '#EF4444',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form 1: Sign In */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Company Workspace Code
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="e.g. URBAN-101"
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                  required
                  className="input-field"
                  style={{ width: '100%', paddingLeft: '38px', fontWeight: 700, letterSpacing: '0.5px' }}
                />
                <Building size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Mobile Number, Email, or Staff ID
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="e.g. 01711-223344 or Tania"
                  value={phoneOrId}
                  onChange={(e) => setPhoneOrId(e.target.value)}
                  required
                  className="input-field"
                  style={{ width: '100%', paddingLeft: '38px' }}
                />
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Login PIN (4–6 Digits)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  placeholder="••••"
                  maxLength={8}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="input-field font-mono"
                  style={{ width: '100%', paddingLeft: '38px', letterSpacing: '3px' }}
                />
                <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary hover-lift"
              style={{
                marginTop: '10px',
                padding: '12px',
                fontSize: '0.92rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>{isLoading ? 'Verifying...' : 'Sign In to Workspace'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Form 2: Register New Brand */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Brand / Business Name
              </label>
              <input
                type="text"
                placeholder="e.g. Urban Retail Enterprises"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
                className="input-field"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Owner Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sajid Rahman"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Owner Mobile
                </label>
                <input
                  type="text"
                  placeholder="01711-..."
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  required
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Primary Business Industry Segment
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                className="input-field"
                style={{ width: '100%' }}
              >
                <option value="clothing">👗 Apparel, Clothing & Fashion</option>
                <option value="electronics">📱 Electronics & Mobile Gadgets</option>
                <option value="footwear">👟 Footwear & Leather Shoes</option>
                <option value="cosmetics">💄 Cosmetics & Beauty Care</option>
                <option value="grocery">🛒 Supermarket & Grocery Mart</option>
                <option value="general">📦 General Retail & Trading</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Master Access PIN (4–6 Digits)
              </label>
              <input
                type="password"
                placeholder="e.g. 1234"
                maxLength={8}
                value={ownerPin}
                onChange={(e) => setOwnerPin(e.target.value.replace(/\D/g, ''))}
                className="input-field font-mono"
                style={{ width: '100%', letterSpacing: '3px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '10px', backgroundColor: 'var(--bg-hover)' }}>
              <input
                type="checkbox"
                id="loadDemoCheck"
                checked={loadDemo}
                onChange={(e) => setLoadDemo(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="loadDemoCheck" style={{ fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                Pre-load sample business orders & inventory (for testing)
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary hover-lift"
              style={{
                marginTop: '10px',
                padding: '12px',
                fontSize: '0.92rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={16} />
              <span>Create My Workspace</span>
            </button>
          </form>
        )}

        {/* Footer info */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: 0 }}>
            🔒 Private Encrypted Data • Desktop & Web Real-time Sync
          </p>
        </div>

      </div>
    </div>
  );
};
