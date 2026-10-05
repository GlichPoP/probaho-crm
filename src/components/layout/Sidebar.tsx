import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, ShoppingBag, FileText, Package, Users, 
  DollarSign, Truck, Settings, Lock, Briefcase,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import type { UserAccount, BrandProfile } from '../../types/crm';
import { dbService } from '../../database/db';
import { getAuthorIdentity } from '../../utils/authorProtection';
import { ProbahoLogo } from './ProbahoLogo';
import { BUSINESS_SEGMENTS } from '../../config/businessSegments';
import { useLocalization } from '../../i18n/LanguageContext';
import { updateService, type UpdateInfo } from '../../services/updateService';

export type TabType = 'dashboard' | 'orders' | 'challan' | 'inventory' | 'customers' | 'finance' | 'vendors' | 'partners' | 'settings';

interface SidebarProps {
  activeTab: TabType | any;
  onTabChange?: (tab: TabType | any) => void;
  onSelectTab?: (tab: TabType | any) => void;
  lowStockCount?: number;
  codPendingCount?: number;
  blacklistCount?: number;
  currentUser?: UserAccount;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  width?: number;
  onWidthChange?: (width: number) => void;
  onOpenAbout?: () => void;
  onOpenBrandSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onSelectTab,
  lowStockCount = 0,
  codPendingCount = 0,
  blacklistCount = 0,
  currentUser,
  isCollapsed = false,
  onToggleCollapse,
  width = 256,
  onWidthChange,
  onOpenAbout,
  onOpenBrandSettings
}) => {
  const { t } = useLocalization();
  const [hoveredTab, setHoveredTab] = useState<TabType | null>(null);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [brandProfile, setBrandProfile] = useState<BrandProfile>(() => dbService.getBrandProfile());
  const [isBrandHovered, setIsBrandHovered] = useState<boolean>(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>(() => updateService.getStatus());
  const resizerRef = useRef<{ startX: number; startWidth: number }>({ startX: 0, startWidth: width });

  useEffect(() => {
    return updateService.subscribe(info => setUpdateInfo(info));
  }, []);

  useEffect(() => {
    const unsub = dbService.onDataChange(() => {
      setBrandProfile(dbService.getBrandProfile());
    });
    return unsub;
  }, []);

  const getBrandMonogram = (name: string): string => {
    const clean = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    if (words.length === 1 && words[0].length >= 2) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0] || 'PB').substring(0, 2).toUpperCase();
  };

  const rawBrandName = brandProfile?.brand_name?.trim() || '';
  const isDefaultBrand = !rawBrandName || rawBrandName.toLowerCase() === 'probaho crm solutions';
  const brandDisplayName = rawBrandName || 'PROBAHO CRM Solutions';
  const hasCustomLogo = Boolean(brandProfile?.logo_url && brandProfile.logo_url.trim().length > 0);
  const segmentConfig = brandProfile?.business_type ? BUSINESS_SEGMENTS[brandProfile.business_type] : null;
  const segmentTitle = segmentConfig ? segmentConfig.title : (isDefaultBrand ? 'Business Management Suite' : 'General Retail & Commerce');

  const handleBrandHeaderClick = () => {
    if (isCollapsed) {
      if (onToggleCollapse) onToggleCollapse();
      return;
    }
    if (onOpenBrandSettings) {
      onOpenBrandSettings();
    } else {
      handleSelect('settings', 'Brand Profile & Settings');
    }
  };

  const handleSelect = (tab: any, label: string) => {
    if (currentUser && currentUser.role === 'employee') {
      const allowed = currentUser.allowed_tabs || [];
      if (!allowed.includes(tab)) {
        alert(`🔒 Restricted Access: Your profile (${currentUser.name}) is not granted access to [${label}]. Ask a Master profile to enable this module for you in Settings -> Staff.`);
        return;
      }
    }
    if (onSelectTab) onSelectTab(tab);
    else if (onTabChange) onTabChange(tab);
  };

  // Drag-to-resize logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const deltaX = e.clientX - resizerRef.current.startX;
      let newWidth = resizerRef.current.startWidth + deltaX;

      // If user drags extremely narrow (< 130px), snap to collapsed mode
      if (newWidth < 130) {
        if (!isCollapsed && onToggleCollapse) {
          onToggleCollapse();
        }
        return;
      }

      // If user drags wider while collapsed, uncollapse and set width
      if (isCollapsed && newWidth >= 160) {
        if (onToggleCollapse) onToggleCollapse();
      }

      // Constrain sidebar width between 165px and 420px
      newWidth = Math.max(165, Math.min(newWidth, 420));
      if (onWidthChange) {
        onWidthChange(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isCollapsed, onToggleCollapse, onWidthChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    resizerRef.current = {
      startX: e.clientX,
      startWidth: isCollapsed ? 74 : width
    };
    setIsResizing(true);
  };

  const handleDoubleClickResizer = () => {
    if (onToggleCollapse) onToggleCollapse();
  };

  const navItems = [
    { id: 'dashboard' as TabType, label: t('dashboard', 'Dashboard & KPI'), icon: LayoutDashboard },
    { id: 'orders' as TabType, label: t('orders', 'Orders'), icon: ShoppingBag, badge: codPendingCount > 0 ? `${codPendingCount} COD` : undefined, badgeColor: 'badge-warning' },
    { id: 'challan' as TabType, label: t('invoices', 'Invoices'), icon: FileText },
    { id: 'inventory' as TabType, label: t('inventory', 'Inventory'), icon: Package, badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined, badgeColor: 'badge-danger' },
    { id: 'customers' as TabType, label: t('customers', 'Customers & CRM'), icon: Users, badge: blacklistCount > 0 ? `${blacklistCount} RTO Risk` : undefined, badgeColor: 'badge-danger' },
    { id: 'finance' as TabType, label: t('payments', 'Payments'), icon: DollarSign },
    { id: 'vendors' as TabType, label: t('vendors', 'Vendors'), icon: Truck },
    { id: 'partners' as TabType, label: t('partners', 'Delivery & Payment Partners'), icon: Briefcase },
    { id: 'settings' as TabType, label: t('settings', 'Settings & Backup'), icon: Settings },
  ];

  const currentSidebarWidth = isCollapsed ? 74 : width;

  return (
    <aside style={{
      width: `${currentSidebarWidth}px`,
      minWidth: `${currentSidebarWidth}px`,
      maxWidth: `${currentSidebarWidth}px`,
      height: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '4px 0 24px -12px rgba(0, 0, 0, 0.15)',
      userSelect: 'none',
      transition: isResizing ? 'none' : 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.22s cubic-bezier(0.16, 1, 0.3, 1), max-width 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {/* Interactive Resizer Strip along borderRight */}
      <div
        onMouseDown={handleMouseDown}
        title="Drag left/right to shorten or resize sidebar (Double-click to collapse)"
        onDoubleClick={handleDoubleClickResizer}
        style={{
          position: 'absolute',
          right: '-4px',
          top: 0,
          bottom: 0,
          width: '8px',
          cursor: 'col-resize',
          zIndex: 100,
          backgroundColor: isResizing ? 'var(--accent-primary)' : 'transparent',
          transition: isResizing ? 'none' : 'background-color 0.18s ease',
        }}
        onMouseEnter={e => {
          if (!isResizing) e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.45)';
        }}
        onMouseLeave={e => {
          if (!isResizing) e.currentTarget.style.backgroundColor = 'transparent';
        }}
      />

      {/* Toggle Collapse Button directly on the right border */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (onToggleCollapse) onToggleCollapse();
        }}
        title={isCollapsed ? "Expand Sidebar (Ctrl+B)" : "Shorten / Collapse Sidebar (Ctrl+B)"}
        style={{
          position: 'absolute',
          right: '-13px',
          top: '86px',
          transform: 'translateY(-50%)',
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-highlight)',
          color: 'var(--text-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 101,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="hover-lift"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Dynamic Brand Logo & Workspace Header */}
      <div 
        onClick={handleBrandHeaderClick}
        onMouseEnter={() => setIsBrandHovered(true)}
        onMouseLeave={() => setIsBrandHovered(false)}
        title={isCollapsed 
          ? `${brandDisplayName} • Click to expand (Ctrl+B)` 
          : `Workspace: ${brandDisplayName} • Click to customize brand & logo in Settings`}
        style={{ 
          padding: isCollapsed ? '20px 12px' : '15px 16px', 
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          overflow: 'hidden',
          minHeight: '88px',
          cursor: 'pointer',
          backgroundColor: isBrandHovered && !isCollapsed ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
          transition: 'background-color 0.18s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', minWidth: 0 }}>
          {/* Avatar Tile: User Logo OR Company Monogram OR PROBAHO Master Logo */}
          <div 
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '11px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: isBrandHovered ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            {hasCustomLogo ? (
              <div 
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '11px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.22)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '3px',
                  overflow: 'hidden'
                }}
              >
                <img
                  src={brandProfile.logo_url}
                  alt={brandDisplayName}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>
            ) : !isDefaultBrand ? (
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '11px',
                  background: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  letterSpacing: '-0.02em',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)'
                }}
              >
                {getBrandMonogram(brandDisplayName)}
              </div>
            ) : (
              <ProbahoLogo size={40} glow={true} />
            )}
          </div>

          {/* Expanded Brand Name & Co-Branding Metadata */}
          {!isCollapsed && (
            <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <h1 
                  className="brand-font" 
                  style={{ 
                    fontSize: '0.98rem', 
                    fontWeight: 800, 
                    letterSpacing: '-0.025em', 
                    background: 'linear-gradient(90deg, var(--text-main), #A78BFA)', 
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent', 
                    lineHeight: 1.25, 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis' 
                  }}
                >
                  {brandDisplayName}
                </h1>
                {isBrandHovered && (
                  <span 
                    title="Customize Brand Logo & Showroom Title in Settings"
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 5px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--accent-glow)',
                      color: 'var(--accent-primary)',
                      flexShrink: 0
                    }}
                  >
                    Edit
                  </span>
                )}
              </div>
              {/* Tier 2: Industry / Business Segmentation */}
              <span style={{ 
                fontSize: '0.70rem', 
                color: 'var(--text-muted)', 
                fontWeight: 600, 
                letterSpacing: '0.01em', 
                display: 'block', 
                marginTop: '1px', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap', 
                maxWidth: `${width - 86}px` 
              }}>
                {segmentTitle}
              </span>

              {/* Tier 3: Co-Branding Platform Credit (Placed below segmentation) */}
              <span style={{ 
                fontSize: '0.62rem', 
                color: 'var(--accent-primary)', 
                fontWeight: 700, 
                letterSpacing: '0.04em', 
                textTransform: 'uppercase',
                display: 'block', 
                marginTop: '2px', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap', 
                maxWidth: `${width - 86}px`,
                opacity: 0.92
              }}>
                Powered by PROBAHO
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: isCollapsed ? '16px 8px' : '16px 12px', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {!isCollapsed ? (
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, padding: '4px 12px 8px', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
            Menu Modules
          </div>
        ) : (
          <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '4px 8px 8px' }} />
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isLocked = currentUser?.role === 'employee' && !(currentUser.allowed_tabs || []).includes(item.id);
          return (
            <div key={item.id} style={{ position: 'relative' }}>
              <button
                onClick={() => handleSelect(item.id, item.label)}
                onMouseEnter={() => setHoveredTab(item.id)}
                onMouseLeave={() => setHoveredTab(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'space-between',
                  padding: isCollapsed ? '12px 0' : '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--border-highlight)' : 'transparent',
                  backgroundColor: isActive ? 'rgba(99, 102, 241, 0.16)' : 'transparent',
                  color: isLocked ? 'var(--text-dim)' : (isActive ? 'var(--accent-primary)' : 'var(--text-muted)'),
                  opacity: isLocked ? 0.6 : 1,
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  textAlign: 'left',
                  width: '100%',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.86rem',
                  position: 'relative'
                }}
                className="sidebar-item hover-lift"
              >
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '15%',
                    bottom: '15%',
                    width: '3px',
                    backgroundColor: 'var(--accent-primary)',
                    borderRadius: '0 4px 4px 0',
                    boxShadow: '0 0 8px var(--accent-glow)'
                  }} />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: isCollapsed ? 0 : '11px', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                  <Icon size={isCollapsed ? 20 : 18} style={{ color: isLocked ? 'var(--text-dim)' : (isActive ? 'var(--accent-primary)' : 'var(--text-dim)'), transition: 'color 0.18s ease', flexShrink: 0 }} />
                  {!isCollapsed && (
                    <span style={{ textDecoration: isLocked ? 'line-through' : 'none', letterSpacing: '-0.005em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                  )}
                </div>

                {!isCollapsed && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {isLocked && (
                      <span style={{ fontSize: '0.72rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                        <Lock size={13} />
                      </span>
                    )}
                    {item.badge && !isLocked && (
                      <span className={`badge ${item.badgeColor}`} style={{ fontSize: '0.67rem', padding: '2px 7px' }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Mini notification dot for badge in collapsed mode */}
                {isCollapsed && item.badge && !isLocked && (
                  <span style={{
                    position: 'absolute',
                    top: '6px',
                    right: '12px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: item.badgeColor === 'badge-warning' ? 'var(--amber)' : 'var(--ruby)',
                    boxShadow: item.badgeColor === 'badge-warning' ? '0 0 6px var(--amber)' : '0 0 6px var(--ruby)'
                  }} />
                )}
              </button>

              {/* Floating Tooltip in Collapsed Mode */}
              {isCollapsed && hoveredTab === item.id && (
                <div style={{
                  position: 'absolute',
                  left: '68px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  boxShadow: '0 6px 24px rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-highlight)',
                  whiteSpace: 'nowrap',
                  zIndex: 250,
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  pointerEvents: 'none'
                }}>
                  <span>{item.label}</span>
                  {item.badge && !isLocked && (
                    <span className={`badge ${item.badgeColor}`} style={{ fontSize: '0.66rem', padding: '1px 7px' }}>
                      {item.badge}
                    </span>
                  )}
                  {isLocked && (
                    <span style={{ fontSize: '0.72rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Lock size={12} /> Restricted
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Offline Ecosystem & Creator Attribution Footer */}
      <div style={{ 
        padding: isCollapsed ? '12px 6px' : '12px 14px', 
        borderTop: '1px solid var(--border-color)', 
        background: 'var(--bg-hover)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: isCollapsed ? 'center' : 'stretch',
        overflow: 'hidden'
      }}>
        {/* Workspace Status Indicator */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: isCollapsed ? '2px 0' : '2px 4px'
          }}
          title="PROBAHO CRM • Local & Private Workspace"
        >
          <div style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: 'var(--emerald)',
            boxShadow: '0 0 6px var(--emerald)',
            flexShrink: 0
          }} />
          {!isCollapsed && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Local Workspace • Ready
            </span>
          )}
        </div>

        {/* Creator Attribution & About Button */}
        {isCollapsed ? (
          <button
            onClick={onOpenAbout}
            title={updateInfo.hasUpdate ? `Update v${updateInfo.latestVersion} Available!` : `About PROBAHO CRM • Created by ${getAuthorIdentity().name}`}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: updateInfo.hasUpdate ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.1)',
              border: updateInfo.hasUpdate ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(99, 102, 241, 0.25)',
              color: updateInfo.hasUpdate ? '#10B981' : 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.18s ease'
            }}
            className="hover-lift"
          >
            <ProbahoLogo size={18} glow={updateInfo.hasUpdate} />
            {updateInfo.hasUpdate && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 6px #10B981'
              }} />
            )}
          </button>
        ) : (
          <button
            onClick={onOpenAbout}
            title={updateInfo.hasUpdate ? `Update v${updateInfo.latestVersion} Available! Click to view.` : 'Click to view software details, license & creator contacts'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              backgroundColor: updateInfo.hasUpdate ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.08)',
              border: updateInfo.hasUpdate ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'var(--text-main)',
              transition: 'all 0.18s ease'
            }}
            className="hover-lift"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
              <ProbahoLogo size={15} glow={updateInfo.hasUpdate} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                By {getAuthorIdentity().name}
              </span>
            </div>
            <span style={{ 
              fontSize: '0.66rem', 
              fontWeight: 800, 
              color: updateInfo.hasUpdate ? '#FFFFFF' : 'var(--accent-primary)', 
              backgroundColor: updateInfo.hasUpdate ? '#10B981' : 'var(--accent-glow)', 
              padding: '1px 6px', 
              borderRadius: '4px',
              boxShadow: updateInfo.hasUpdate ? '0 0 8px rgba(16, 185, 129, 0.4)' : undefined,
              flexShrink: 0 
            }}>
              {updateInfo.hasUpdate ? 'UPDATE' : 'About'}
            </span>
          </button>
        )}
      </div>
    </aside>
  );
};

