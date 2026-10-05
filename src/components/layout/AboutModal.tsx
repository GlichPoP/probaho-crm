import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Mail, Copy, Check, ExternalLink, 
  ShieldCheck, X, Heart, ArrowUpCircle
} from 'lucide-react';
import { getAuthorIdentity } from '../../utils/authorProtection';
import { ProbahoLogo } from './ProbahoLogo';
import { updateService, APP_VERSION, type UpdateInfo } from '../../services/updateService';

const LinkedinIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettingsUpdates?: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, onOpenSettingsUpdates }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>(() => updateService.getStatus());
  const author = getAuthorIdentity();

  useEffect(() => {
    return updateService.subscribe(info => setUpdateInfo(info));
  }, []);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(author.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }} 
      className="animate-fade-in" 
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="glass-card"
        style={{ 
          width: '540px', 
          maxWidth: '100%',
          padding: '28px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px', 
          maxHeight: '92vh', 
          overflowY: 'auto',
          borderRadius: '16px',
          border: '1px solid var(--border-highlight)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <ProbahoLogo size={46} glow={true} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  PROBAHO CRM Solutions
                </h3>
                <span style={{ 
                  fontSize: '0.72rem', 
                  fontWeight: 700, 
                  padding: '2px 8px', 
                  borderRadius: '20px', 
                  backgroundColor: 'var(--accent-glow)', 
                  color: 'var(--accent-primary)' 
                }}>
                  v{APP_VERSION}
                </span>
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Enterprise Business Operations Platform
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-muted)', 
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="hover-lift"
          >
            <X size={20} />
          </button>
        </div>

        {/* Creator Showcase Banner */}
        <div style={{
          padding: '18px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(16, 185, 129, 0.08))',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          display: 'flex',
          gap: '16px',
          alignItems: 'center'
        }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
            flexShrink: 0
          }}>
            IR
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {author.name}
              </span>
              <Sparkles size={15} style={{ color: '#F59E0B' }} />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '6px' }}>
              {author.title}
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
              {author.bio}
            </p>
          </div>
        </div>

        {/* Contact Channels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Official Creator Contact & Links
          </div>

          {/* LinkedIn Channel */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            backgroundColor: 'var(--bg-hover)',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <div style={{ 
                width: '36px', height: '36px', borderRadius: '8px', 
                backgroundColor: '#0A66C2', color: '#fff', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <LinkedinIcon size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>LinkedIn Profile</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {author.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
                </div>
              </div>
            </div>
            <a
              href={author.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ fontSize: '0.78rem', padding: '6px 12px', gap: '6px', whiteSpace: 'nowrap' }}
            >
              <span>Connect</span>
              <ExternalLink size={13} />
            </a>
          </div>

          {/* Email Channel */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            backgroundColor: 'var(--bg-hover)',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <div style={{ 
                width: '36px', height: '36px', borderRadius: '8px', 
                backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <Mail size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>Contact Email</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {author.email}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              <button
                onClick={handleCopyEmail}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px 10px', gap: '5px' }}
                title="Copy email address"
              >
                {copiedEmail ? <Check size={13} style={{ color: '#10B981' }} /> : <Copy size={13} />}
                <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
              </button>
              <a
                href={`mailto:${author.email}?subject=PROBAHO%20CRM%20Solutions%20-%20Inquiry`}
                className="btn btn-primary"
                style={{ fontSize: '0.78rem', padding: '6px 12px', gap: '5px' }}
              >
                <span>Write</span>
                <Mail size={13} />
              </a>
            </div>
          </div>
        </div>

        {/* Software Version & Update Status Ribbon */}
        <div style={{
          padding: '10px 14px',
          borderRadius: '10px',
          backgroundColor: updateInfo.hasUpdate ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-hover)',
          border: updateInfo.hasUpdate ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {updateInfo.hasUpdate ? (
              <ArrowUpCircle size={15} style={{ color: '#10B981', flexShrink: 0 }} />
            ) : (
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 6px #10B981',
                flexShrink: 0
              }} />
            )}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>
              {updateInfo.hasUpdate 
                ? `Update Available: v${updateInfo.latestVersion}` 
                : `Version ${APP_VERSION} (Up to Date)`}
            </span>
          </div>

          {onOpenSettingsUpdates && (
            <button
              type="button"
              onClick={onOpenSettingsUpdates}
              className={`btn ${updateInfo.hasUpdate ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                fontSize: '0.74rem',
                padding: '4px 10px',
                backgroundColor: updateInfo.hasUpdate ? '#10B981' : undefined,
                borderColor: updateInfo.hasUpdate ? '#10B981' : undefined,
                color: updateInfo.hasUpdate ? '#FFFFFF' : undefined,
                fontWeight: 600
              }}
            >
              {updateInfo.hasUpdate 
                ? (updateInfo.downloadStatus === 'downloaded' ? 'Install Update' : 'Update Now') 
                : 'Updates & Status'}
            </button>
          )}
        </div>

        {/* License & Rights Notice */}
        <div style={{
          padding: '12px 14px',
          borderRadius: '10px',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start'
        }}>
          <ShieldCheck size={18} style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.76rem', color: 'var(--text-main)', lineHeight: '1.45' }}>
            <strong>Official Freeware License:</strong> Copyright © 2026 <strong>{author.name}</strong>. 
            Free for personal and commercial enterprise operations. 
            Author attribution and creator dialog must remain preserved in all distributions.
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Built with <Heart size={12} style={{ color: '#EF4444', fill: '#EF4444' }} /> by {author.name}
          </span>
          <button 
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '6px 18px', fontSize: '0.82rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
