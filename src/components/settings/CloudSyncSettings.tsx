import React, { useState, useEffect } from 'react';
import { 
  CloudCheck, RefreshCw, 
  ExternalLink, ShieldCheck, AlertCircle, 
  CheckCircle2
} from 'lucide-react';
import { firebaseSync } from '../../services/firebaseSync';
import { dbService } from '../../database/db';
import type { SyncStatus, FirebaseConfig } from '../../types/crm';

interface CloudSyncSettingsProps {
  onRefreshAll: () => void;
}

export const CloudSyncSettings: React.FC<CloudSyncSettingsProps> = ({ onRefreshAll }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => firebaseSync.getStatus());
  const [rawSnippet, setRawSnippet] = useState<string>('');
  const [workspaceCode, setWorkspaceCode] = useState<string>(() => dbService.getWorkspaceId() || 'MY-BRAND-101');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeConfig, setActiveConfig] = useState<FirebaseConfig | null>(() => firebaseSync.getActiveConfig());
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toLocaleTimeString());

  useEffect(() => {
    const unsub = firebaseSync.onStatusChange((status) => {
      setSyncStatus(status);
      setActiveConfig(firebaseSync.getActiveConfig());
      if (status === 'connected') {
        setLastSyncTime(new Date().toLocaleTimeString());
      }
    });
    return unsub;
  }, []);

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestResult(null);

    const parsed = firebaseSync.parseFirebaseConfigInput(rawSnippet);
    if (!parsed) {
      setTestResult({
        success: false,
        message: 'Could not parse the Firebase snippet. Please ensure you copied the `const firebaseConfig = { ... }` block or JSON configuration from Firebase.'
      });
      return;
    }

    if (!workspaceCode.trim()) {
      setTestResult({
        success: false,
        message: 'Please provide a unique Company Workspace Code (e.g. URBAN-101).'
      });
      return;
    }

    setIsTesting(true);
    try {
      const cleanWorkspace = workspaceCode.trim().toUpperCase();
      const res = await firebaseSync.connectWithConfig(parsed, cleanWorkspace);
      setTestResult(res);

      if (res.success) {
        dbService.setWorkspaceId(cleanWorkspace);
        // Push current local snapshot to the newly connected cloud
        await firebaseSync.pushDataToCloud(dbService.getData(), 'Master');
        setActiveConfig(parsed);
        onRefreshAll();
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to connect to Firebase.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleForceSync = async () => {
    setIsTesting(true);
    try {
      const ok = await firebaseSync.pushDataToCloud(dbService.getData(), 'Master Force Sync');
      if (ok) {
        setLastSyncTime(new Date().toLocaleTimeString());
        alert('All local orders, products, and customer records have been pushed to your Google Cloud database!');
      } else {
        alert('Sync failed. Please check your internet connection.');
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect from this Google Firebase account? Your local computer data will be kept intact, but automatic multi-device sync will pause.')) {
      firebaseSync.disconnect();
      setActiveConfig(null);
      setTestResult(null);
      setRawSnippet('');
      onRefreshAll();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Privacy Guarantee Header */}
      <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 95, 70, 0.05))', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                Private Cloud & Multi-Device Synchronization
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
                Sync data securely across devices through your private Google Firebase account.
              </p>
            </div>
          </div>

          {/* Connection Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '24px', backgroundColor: syncStatus === 'connected' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.12)', border: `1px solid ${syncStatus === 'connected' ? '#10B981' : '#EF4444'}` }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: syncStatus === 'connected' ? '#10B981' : '#EF4444', display: 'inline-block' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: syncStatus === 'connected' ? '#10B981' : '#EF4444' }}>
              {syncStatus === 'connected' ? 'Cloud Connected & Live' : syncStatus === 'syncing' ? 'Syncing...' : 'Local Mode (No Cloud)'}
            </span>
          </div>
        </div>
      </div>



      {/* Connected Cloud State Details */}
      {activeConfig && syncStatus === 'connected' ? (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CloudCheck size={22} style={{ color: '#10B981' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Active Firebase Connection
              </h4>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleForceSync}
                disabled={isTesting}
                className="btn btn-secondary hover-lift"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <RefreshCw size={16} className={isTesting ? 'spin' : ''} />
                <span>Force Sync All Now</span>
              </button>
              <button 
                onClick={handleDisconnect}
                className="btn btn-secondary hover-lift"
                style={{ color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              >
                Disconnect Cloud
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '14px' }}>
            <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-hover)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Firebase Project ID</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>{activeConfig.projectId}</div>
            </div>
            <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-hover)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Active Workspace</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>{workspaceCode}</div>
            </div>
            <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-hover)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Last Synced</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10B981', marginTop: '4px' }}>{lastSyncTime}</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Guided 3-Step Setup Wizard (Always available or when disconnected) */}
      {syncStatus !== 'connected' ? (
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                Connect Your Free Google Firebase Account (3-Minute Guide)
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                Follow these 3 steps to connect multi-device sync.
              </p>
            </div>
            <a 
              href="https://console.firebase.google.com" 
              target="_blank" 
              rel="noreferrer"
              className="btn btn-primary hover-lift"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
            >
              <span>1. Open Google Firebase</span>
              <ExternalLink size={16} />
            </a>
          </div>

          {/* 3 Step Visual Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '12px' }}>
                1
              </div>
              <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                Create a Free Project
              </h5>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Click <strong>"Add Project"</strong> in Firebase console and give it a name.
              </p>
            </div>

            <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '12px' }}>
                2
              </div>
              <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                Enable Cloud Firestore
              </h5>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Go to <strong>Build → Firestore Database</strong> and click <strong>Create Database</strong>.
              </p>
            </div>

            <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '12px' }}>
                3
              </div>
              <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                Copy Config Box
              </h5>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Go to Project Settings → Web App, copy your config object and paste below.
              </p>
            </div>
          </div>

          {/* Paste Form */}
          <form onSubmit={handleTestAndSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                Company Workspace Code (Choose a memorable code for your staff):
              </label>
              <input 
                type="text"
                value={workspaceCode}
                onChange={(e) => setWorkspaceCode(e.target.value.toUpperCase())}
                placeholder="e.g. URBAN-101 or STYLE-BD"
                required
                className="input-field"
                style={{ width: '100%', maxWidth: '400px', fontWeight: 700, letterSpacing: '0.5px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                Paste Firebase Configuration (JavaScript snippet or JSON):
              </label>
              <textarea 
                rows={7}
                value={rawSnippet}
                onChange={(e) => setRawSnippet(e.target.value)}
                placeholder={`Paste your code here, for example:\nconst firebaseConfig = {\n  apiKey: "AIzaSy...",\n  projectId: "your-project-id",\n  appId: "1:..."\n};`}
                required
                className="input-field font-mono"
                style={{ width: '100%', resize: 'vertical', fontSize: '0.84rem' }}
              />
            </div>

            {testResult ? (
              <div style={{
                padding: '14px 18px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: testResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: testResult.success ? '#10B981' : '#EF4444',
                border: `1px solid ${testResult.success ? '#10B981' : '#EF4444'}`
              }}>
                {testResult.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{testResult.message}</span>
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button 
                type="submit" 
                disabled={isTesting}
                className="btn btn-primary hover-lift"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
              >
                <CloudCheck size={18} />
                <span>{isTesting ? 'Validating & Connecting...' : 'Connect & Test Firebase'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : null}

    </div>
  );
};
