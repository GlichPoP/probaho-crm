import React, { useState, useEffect } from 'react';
import { ArrowUpCircle, X, Download, CheckCircle2, ExternalLink } from 'lucide-react';
import { updateService, type UpdateInfo } from '../../services/updateService';

interface UpdateNotificationToastProps {
  onOpenSettingsUpdates?: () => void;
}

export const UpdateNotificationToast: React.FC<UpdateNotificationToastProps> = ({
  onOpenSettingsUpdates
}) => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>(() => updateService.getStatus());
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    return updateService.subscribe((info) => {
      setUpdateInfo(info);
    });
  }, []);

  // Only render if an update is available and user hasn't dismissed it this session
  if (!updateInfo.hasUpdate || isDismissed) {
    return null;
  }

  const progress = updateInfo.downloadProgress;
  const percent = progress?.percent ?? 0;
  const receivedMb = progress ? (progress.receivedBytes / (1024 * 1024)).toFixed(1) : '0';
  const totalMb = progress && progress.totalBytes > 0 ? (progress.totalBytes / (1024 * 1024)).toFixed(1) : null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        width: '380px',
        maxWidth: 'calc(100vw - 48px)',
        backgroundColor: 'var(--bg-secondary)',
        border: '1.5px solid rgba(16, 185, 129, 0.45)',
        borderRadius: '16px',
        boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.55), 0 0 25px rgba(16, 185, 129, 0.15)',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        animation: 'slideInUp 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      className="glass-card"
    >
      {/* Toast Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ArrowUpCircle size={20} />
          </div>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '1px 7px',
              borderRadius: '6px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10B981',
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              marginBottom: '2px'
            }}>
              UPDATE READY • v{updateInfo.latestVersion}
            </div>
            <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-main)' }}>
              New Version Available
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body text */}
      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
        {updateInfo.downloadStatus === 'downloaded' 
          ? `Update v${updateInfo.latestVersion} has been downloaded and is ready to install.`
          : updateInfo.downloadStatus === 'downloading'
          ? `Downloading update package... ${percent}% complete.`
          : `A new official release of PROBAHO CRM Solutions is available with enhanced stability and performance.`}
      </p>

      {/* Progress Bar (When downloading) */}
      {updateInfo.downloadStatus === 'downloading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{
            width: '100%',
            height: '7px',
            borderRadius: '4px',
            backgroundColor: 'var(--border-color)',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${percent}%`,
              height: '100%',
              backgroundColor: '#10B981',
              borderRadius: '4px',
              transition: 'width 0.2s ease',
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            <span>{totalMb ? `${receivedMb} MB of ${totalMb} MB` : `${receivedMb} MB downloaded`}</span>
            <span style={{ fontWeight: 700, color: '#10B981' }}>{percent}%</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '4px' }}>
        {updateInfo.downloadStatus === 'downloaded' ? (
          <button
            type="button"
            onClick={() => updateService.installAndRestart()}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '8px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              gap: '6px',
              backgroundColor: '#10B981',
              borderColor: '#10B981',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
            }}
          >
            <CheckCircle2 size={15} />
            <span>Restart & Install Now</span>
          </button>
        ) : updateInfo.downloadStatus === 'downloading' ? (
          <button
            type="button"
            onClick={() => updateService.cancelDownload()}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '7px 12px', fontSize: '0.78rem' }}
          >
            Cancel Download
          </button>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => updateService.startDownload()}
                className="btn btn-primary"
                style={{
                  padding: '7px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  gap: '6px',
                  backgroundColor: '#10B981',
                  borderColor: '#10B981',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                }}
              >
                <Download size={14} />
                <span>Update Now</span>
              </button>

              {onOpenSettingsUpdates && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDismissed(true);
                    onOpenSettingsUpdates();
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '7px 10px', fontSize: '0.78rem', gap: '5px' }}
                >
                  <ExternalLink size={13} />
                  <span>Details</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                fontSize: '0.76rem',
                cursor: 'pointer',
                padding: '4px 6px'
              }}
            >
              Later
            </button>
          </>
        )}
      </div>
    </div>
  );
};
