import React, { useState, useEffect } from 'react';
import { Search, Plus, Moon, Sun, DollarSign, Package, Truck, PanelLeft, Cloud, Lock } from 'lucide-react';
import type { UserAccount, SyncStatus } from '../../types/crm';
import { firebaseSync } from '../../services/firebaseSync';
import { LanguageDropdown } from './LanguageDropdown';
import { useLocalization } from '../../i18n/LanguageContext';

interface HeaderProps {
  onOpenNewOrder?: () => void;
  onOpenStockAdjust?: () => void;
  onOpenSearch?: () => void;
  onOpenCommandBar?: () => void;
  theme?: 'dark' | 'light' | 'gray' | 'notion-dark' | 'notion-light' | 'notion-gray' | string;
  onToggleTheme?: () => void;
  totalCashBdt?: number;
  codDueBdt?: number;
  currentUser?: UserAccount;
  onOpenProfileSwitcher?: () => void;
  onOpenCloudSettings?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onLockSession?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewOrder,
  onOpenStockAdjust,
  onOpenSearch,
  onOpenCommandBar,
  theme = 'dark',
  onToggleTheme,
  totalCashBdt = 0,
  codDueBdt = 0,
  currentUser,
  onOpenProfileSwitcher,
  onOpenCloudSettings,
  isSidebarCollapsed,
  onToggleSidebar,
  onLockSession
}) => {
  const { t, currencySymbol } = useLocalization();
  const [cloudStatus, setCloudStatus] = useState<SyncStatus>(() => firebaseSync.getStatus());

  useEffect(() => {
    const unsub = firebaseSync.onStatusChange((status) => {
      setCloudStatus(status);
    });
    return unsub;
  }, []);
  return (
    <header style={{
      height: '70px',
      backgroundColor: 'var(--bg-card)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: '0 4px 20px -6px rgba(0, 0, 0, 0.12)'
    }}>
      {/* Universal Search Bar Trigger (Ctrl+K) and Sidebar Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onToggleSidebar}
          title={isSidebarCollapsed ? "Expand Sidebar (Ctrl+B or drag right border)" : "Shorten / Collapse Sidebar (Ctrl+B or drag right border)"}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: isSidebarCollapsed ? 'var(--accent-glow)' : 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            color: isSidebarCollapsed ? 'var(--accent-primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.18s ease'
          }}
          className="hover-lift"
        >
          <PanelLeft size={18} />
        </button>

        <button
          onClick={() => { if (onOpenCommandBar) onOpenCommandBar(); else if (onOpenSearch) onOpenSearch(); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            width: '310px',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            fontSize: '0.85rem'
          }}
          className="hover-lift"
        >
          <Search size={15} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ flex: 1, textAlign: 'left', letterSpacing: '-0.005em' }}>{t('searchPlaceholder', 'Search orders, phone numbers, SKUs...')}</span>
          <kbd style={{
            fontSize: '0.69rem',
            padding: '2px 6px',
            borderRadius: '5px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-dim)',
            fontWeight: 700,
            letterSpacing: '0.02em'
          }}>Ctrl+K</kbd>
        </button>
      </div>

      {/* Right: Financial Quick Stats & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Quick KPI Pills */}
        <div className="header-kpi-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 14px',
            borderRadius: '10px',
            backgroundColor: 'var(--emerald-bg)',
            border: '1px solid rgba(16, 185, 129, 0.28)',
            boxShadow: '0 2px 8px -2px rgba(16, 185, 129, 0.15)'
          }}>
            <DollarSign size={15} style={{ color: 'var(--emerald)' }} />
            <div>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('availableCash', 'Available Cash')}</div>
              <div style={{ fontSize: '0.91rem', fontWeight: 800, color: 'var(--emerald)', letterSpacing: '-0.01em' }}>{currencySymbol}{totalCashBdt.toLocaleString()}</div>
            </div>
          </div>

          <div className="header-kpi-secondary" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 14px',
            borderRadius: '10px',
            backgroundColor: 'var(--amber-bg)',
            border: '1px solid rgba(245, 158, 11, 0.28)',
            boxShadow: '0 2px 8px -2px rgba(245, 158, 11, 0.15)'
          }}>
            <Truck size={15} style={{ color: 'var(--amber)' }} />
            <div>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('courierDue', 'Courier COD Due')}</div>
              <div style={{ fontSize: '0.91rem', fontWeight: 800, color: 'var(--amber)', letterSpacing: '-0.01em' }}>{currencySymbol}{codDueBdt.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div style={{ height: '26px', width: '1px', backgroundColor: 'var(--border-color)' }} />

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={onOpenStockAdjust} className="btn btn-secondary hover-lift" title="Quick Stock Adjustment" style={{ padding: '8px 12px', fontSize: '0.82rem' }}>
            <Package size={15} style={{ color: 'var(--accent-primary)' }} />
            <span>{t('adjustStock', 'Stock')}</span>
          </button>

          <button onClick={onOpenNewOrder} className="btn btn-primary hover-lift" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
            <Plus size={15} />
            <span>{t('newOrder', 'New Order')}</span>
          </button>

          {/* Google-Style Global Language & Country Selector */}
          <LanguageDropdown />

          {/* Modern Compact Theme Toggle Icon Button */}
          <button
            onClick={onToggleTheme}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.18s ease'
            }}
            className="hover-lift"
            title={`Active Theme: ${theme.replace('-', ' ').toUpperCase()} (Click to cycle themes)`}
          >
            {theme.includes('light') ? (
              <Moon size={16} style={{ color: '#6366F1' }} />
            ) : theme.includes('gray') ? (
              <Sun size={16} style={{ color: '#06B6D4' }} />
            ) : (
              <Sun size={16} style={{ color: '#F59E0B' }} />
            )}
          </button>

          {/* Cloud Sync Status Indicator Pill */}
          <button
            onClick={onOpenCloudSettings}
            style={{
              padding: '7px 12px',
              borderRadius: '10px',
              backgroundColor: cloudStatus === 'connected' ? 'rgba(16, 185, 129, 0.12)' : cloudStatus === 'syncing' ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-primary)',
              border: '1px solid',
              borderColor: cloudStatus === 'connected' ? 'rgba(16, 185, 129, 0.35)' : cloudStatus === 'syncing' ? 'rgba(245, 158, 11, 0.35)' : 'var(--border-color)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: cloudStatus === 'connected' ? '#10B981' : cloudStatus === 'syncing' ? '#F59E0B' : 'var(--text-dim)',
              transition: 'all 0.18s ease'
            }}
            className="hover-lift"
            title={cloudStatus === 'connected' ? "Google Cloud Active & Synced live" : cloudStatus === 'syncing' ? "Syncing data to cloud..." : "Local Storage (Click to configure Cloud Sync)"}
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: cloudStatus === 'connected' ? '#10B981' : cloudStatus === 'syncing' ? '#F59E0B' : 'var(--text-dim)',
              display: 'inline-block'
            }} />
            <Cloud size={14} />
            <span>{cloudStatus === 'connected' ? 'Cloud Synced' : cloudStatus === 'syncing' ? 'Syncing...' : 'Local DB'}</span>
          </button>

          {/* Active Profile Badge / Switcher Trigger */}
          {currentUser && (
            <button
              onClick={onOpenProfileSwitcher}
              style={{
                padding: '6px 13px',
                borderRadius: '10px',
                backgroundColor: currentUser.role === 'master' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                border: '1px solid',
                borderColor: currentUser.role === 'master' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(99, 102, 241, 0.4)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                fontWeight: 700,
                fontSize: '0.81rem'
              }}
              className="hover-lift"
              title="Click to Switch Profile or Manage Staff Access"
            >
              <div style={{
                width: '23px', height: '23px', borderRadius: '6px',
                backgroundColor: currentUser.role === 'master' ? '#F59E0B' : '#6366F1',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem'
              }}>
                {currentUser.role === 'master' ? '👑' : '👤'}
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.81rem', color: 'var(--text-main)', fontWeight: 700 }}>{currentUser.name.split(' ')[0]}</div>
                <div style={{ fontSize: '0.64rem', color: currentUser.role === 'master' ? '#F59E0B' : '#6366F1', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 800 }}>
                  {currentUser.role === 'master' ? 'Master Profile' : 'Employee'}
                </div>
              </div>
            </button>
          )}

          {/* Quick Lock Session Button */}
          {onLockSession && (
            <button
              onClick={onLockSession}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.18s ease'
              }}
              className="hover-lift"
              title="Lock CRM Terminal & Return to Login Screen"
            >
              <Lock size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
