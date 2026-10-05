import React, { useState, useEffect } from 'react';
import { 
  Moon, Sun, Palette, Database, Download, Upload, 
  RotateCcw, Building, Truck, Check, Sparkles, AlertTriangle, Save, Shield,
  Image as ImageIcon, Trash2, Sliders, UploadCloud, Cloud,
  Shirt, Smartphone, Footprints, Apple, Store,
  Mail, ExternalLink, Copy, Heart, ShieldCheck,
  RefreshCw, ArrowUpCircle, CheckCircle2
} from 'lucide-react';

const LinkedinIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);
import { dbService } from '../../database/db';
import { getAuthorIdentity } from '../../utils/authorProtection';
import { updateService, type UpdateInfo, APP_VERSION } from '../../services/updateService';
import type { UserAccount, BusinessType } from '../../types/crm';
import { StaffManagementView } from './StaffManagementView';
import { PartnersView } from '../partners/PartnersView';
import { CloudSyncSettings } from './CloudSyncSettings';
import { processLogoImageFile } from '../../utils/imageUtils';
import { BUSINESS_SEGMENTS } from '../../config/businessSegments';
import { ProbahoLogo } from '../layout/ProbahoLogo';
import { useLocalization } from '../../i18n/LanguageContext';
import { COUNTRIES, LANGUAGES, CURRENCIES, getCountryByCode } from '../../config/countriesData';

export type ThemeMode = 'dark' | 'light' | 'gray' | 'notion-dark' | 'notion-light' | 'notion-gray';

export type SettingsSubTab = 'appearance' | 'database' | 'company' | 'courier' | 'staff' | 'cloud' | 'about';

interface SettingsViewProps {
  currentTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  onRefreshAll: () => void;
  currentUser?: UserAccount;
  onSwitchProfile?: (userId: string) => void;
  initialSubTab?: SettingsSubTab;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentTheme,
  onSelectTheme,
  onRefreshAll,
  currentUser = dbService.getCurrentUser(),
  onSwitchProfile = () => {},
  initialSubTab = 'appearance'
}) => {
  const { 
    language: ctxLanguage, 
    setLanguage: setCtxLanguage, 
    country: ctxCountry, 
    setCountry: setCtxCountry 
  } = useLocalization();

  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>(initialSubTab);
  const [companyName, setCompanyName] = useState('PROBAHO CRM Solutions');
  const [businessType, setBusinessType] = useState<BusinessType>('clothing');
  const [pendingBusinessType, setPendingBusinessType] = useState<BusinessType | null>(null);
  const [showSegmentWarningModal, setShowSegmentWarningModal] = useState<boolean>(false);
  const [country, setCountry] = useState<string>(() => dbService.getBrandProfile()?.country || ctxCountry || 'US');
  const [language, setLanguage] = useState<string>(() => dbService.getBrandProfile()?.language || ctxLanguage || 'en');
  const [taxTitle, setTaxTitle] = useState<string>(() => dbService.getBrandProfile()?.tax_title || 'Sales Tax / EIN');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [vatBin, setVatBin] = useState('');
  const [currency, setCurrency] = useState('USD ($)');
  const [defaultCourier, setDefaultCourier] = useState('Standard Courier');
  const [rtoThreshold, setRtoThreshold] = useState('2');
  const [logoUrl, setLogoUrl] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [defaultInvoiceTitle, setDefaultInvoiceTitle] = useState('INVOICE / CHALLAN');
  const [defaultInvoiceTerms, setDefaultInvoiceTerms] = useState('');
  const [defaultInvoiceFooter, setDefaultInvoiceFooter] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedCreatorEmail, setCopiedCreatorEmail] = useState(false);

  // Software Version & Update State
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>(() => updateService.getStatus());
  const [updateRepo, setUpdateRepo] = useState<string>(() => updateService.getConfig().githubRepo);
  const [isEditingRepo, setIsEditingRepo] = useState<boolean>(false);
  const [repoSavedSuccess, setRepoSavedSuccess] = useState<boolean>(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  useEffect(() => {
    const unsub = updateService.subscribe((info) => {
      setUpdateInfo(info);
      setIsCheckingUpdate(info.status === 'checking');
    });
    return () => unsub();
  }, []);

  const handleCheckForUpdates = async () => {
    setIsCheckingUpdate(true);
    await updateService.checkForUpdates(true);
    setIsCheckingUpdate(false);
  };

  const handleSaveRepo = () => {
    const cleaned = updateRepo.trim();
    if (!cleaned) return;
    updateService.saveConfig({ githubRepo: cleaned });
    setIsEditingRepo(false);
    setRepoSavedSuccess(true);
    setTimeout(() => setRepoSavedSuccess(false), 2500);
    updateService.checkForUpdates(true);
  };

  useEffect(() => {
    const profile = dbService.getBrandProfile();
    if (profile) {
      setCompanyName(profile.brand_name || 'PROBAHO CRM Solutions');
      setBusinessType(profile.business_type || 'clothing');
      setCountry(profile.country || 'US');
      setLanguage(profile.language || 'en');
      setTaxTitle(profile.tax_title || (getCountryByCode(profile.country || 'US')?.taxTitle) || 'Sales Tax / EIN');
      setPhone(profile.phone || '+1 (555) 019-2834');
      setAddress(profile.address || '100 Enterprise Way, Suite 400');
      setVatBin(profile.vat_bin || 'US-99210-BIN');
      setDefaultCourier(profile.default_courier || 'Standard Courier');
      setRtoThreshold(String(profile.rto_threshold || 2));
      setCurrency(profile.currency || 'USD ($)');
      setLogoUrl(profile.logo_url || '');
      setEmail(profile.email || '');
      setWebsite(profile.website || '');
      setDefaultInvoiceTitle(profile.default_invoice_title || 'INVOICE / CHALLAN');
      setDefaultInvoiceTerms(profile.default_invoice_terms || '');
      setDefaultInvoiceFooter(profile.default_invoice_footer || '');
    }
  }, []);

  const handleExportBackup = () => {
    const data = dbService.getData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `probaho-crm-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('✅ Data backup file successfully downloaded to your computer!');
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && json.orders && json.products) {
          dbService.saveToStorage(json);
          onRefreshAll();
          alert('🎉 Business records successfully restored from backup file!');
        } else {
          alert('❌ Invalid backup file format. Missing essential data tables.');
        }
      } catch {
        alert('❌ Error reading the selected backup file. Please ensure it is a valid backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllTransactions = () => {
    if (confirm('⚠️ Are you sure you want to clear all orders, products, customers, and payment ledger entries? Your Company Profile and Master User Accounts will be preserved. This creates a clean workspace for real operations.')) {
      dbService.resetToCleanSlate(true);
      onRefreshAll();
      alert('✨ Workspace successfully reset to a clean state. You can now start entering your real business orders.');
    }
  };

  const handleResetToSeed = () => {
    if (confirm('⚠️ Load sample business data (orders, products, customers)? This helps you explore CRM features with example data.')) {
      dbService.loadDemoData();
      onRefreshAll();
      alert('📦 Sample demo data loaded successfully.');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processLogoImageFile(file);
      setLogoUrl(dataUrl);
    } catch (err: any) {
      alert(err.message || 'Failed to process logo file');
    }
  };

  const handleCountryChange = (newCountryCode: string) => {
    setCountry(newCountryCode);
    const countryObj = getCountryByCode(newCountryCode);
    if (countryObj) {
      setCurrency(countryObj.currencyFormatted);
      setTaxTitle(countryObj.taxTitle);
      setCtxCountry(newCountryCode, true);
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCtxLanguage(newLang);
  };

  const handleSaveSettings = () => {
    dbService.saveBrandProfile({
      brand_name: companyName,
      business_type: businessType,
      country,
      language,
      tax_title: taxTitle,
      phone,
      address,
      vat_bin: vatBin,
      default_courier: defaultCourier,
      rto_threshold: Number(rtoThreshold) || 2,
      currency,
      logo_url: logoUrl,
      email,
      website,
      default_invoice_title: defaultInvoiceTitle,
      default_invoice_terms: defaultInvoiceTerms,
      default_invoice_footer: defaultInvoiceFooter
    });
    setCtxCountry(country, false);
    setCtxLanguage(language);
    onRefreshAll();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="brand-font" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
            System Settings & Data Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Manage workspace preferences, customize appearance themes, update company profile, and handle local data backups.
          </p>
        </div>
        {isSaved && (
          <div className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '8px 14px' }}>
            <Check size={16} />
            <span>Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      {/* Sub-navigation */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveSubTab('appearance')}
          className={`btn ${activeSubTab === 'appearance' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '8px' }}
        >
          <Palette size={16} />
          <span>UI Themes & Appearance</span>
        </button>

        <button
          onClick={() => setActiveSubTab('database')}
          className={`btn ${activeSubTab === 'database' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '8px' }}
        >
          <Database size={16} />
          <span>Backup & Restore Data</span>
        </button>

        <button
          onClick={() => setActiveSubTab('company')}
          className={`btn ${activeSubTab === 'company' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '8px' }}
        >
          <Building size={16} />
          <span>Brand & Company Profile</span>
        </button>

        <button
          onClick={() => setActiveSubTab('courier')}
          className={`btn ${activeSubTab === 'courier' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '8px' }}
        >
          <Truck size={16} />
          <span>Delivery & Payment Partners</span>
        </button>

        <button
          onClick={() => setActiveSubTab('staff')}
          className={`btn ${activeSubTab === 'staff' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '8px' }}
        >
          <Shield size={16} />
          <span>Staff & Access Control (RBAC)</span>
        </button>

        {currentUser?.role === 'master' && (
          <button
            onClick={() => setActiveSubTab('cloud')}
            className={`btn ${activeSubTab === 'cloud' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ 
              gap: '8px', 
              borderColor: activeSubTab === 'cloud' ? 'var(--accent-primary)' : 'rgba(16, 185, 129, 0.4)',
              background: activeSubTab === 'cloud' ? undefined : 'rgba(16, 185, 129, 0.08)'
            }}
          >
            <Cloud size={16} style={{ color: '#10B981' }} />
            <span>Cloud Sync & Multi-Device</span>
          </button>
        )}

        <button
          onClick={() => setActiveSubTab('about')}
          className={`btn ${activeSubTab === 'about' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ 
            gap: '8px',
            borderColor: activeSubTab === 'about' 
              ? 'var(--accent-primary)' 
              : (updateInfo.hasUpdate ? 'rgba(16, 185, 129, 0.6)' : 'rgba(99, 102, 241, 0.4)'),
            background: activeSubTab === 'about' 
              ? undefined 
              : (updateInfo.hasUpdate ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.08)'),
            position: 'relative'
          }}
        >
          <Sparkles size={16} style={{ color: activeSubTab === 'about' ? undefined : (updateInfo.hasUpdate ? '#10B981' : '#818CF8') }} />
          <span>About & Updates</span>
          {updateInfo.hasUpdate && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 7px',
              fontSize: '0.66rem',
              fontWeight: 800,
              borderRadius: '10px',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
              letterSpacing: '0.03em'
            }}>
              NEW
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Appearance & UI Themes */}
      {activeSubTab === 'appearance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Interface Color Themes</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Choose a theme suited to your workspace environment.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {/* Theme 1: Dark Mode */}
              <div
                onClick={() => onSelectTheme('dark')}
                className="hover-lift"
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  border: '2px solid',
                  borderColor: currentTheme === 'dark' ? 'var(--accent-primary)' : 'var(--border-color)',
                  backgroundColor: '#090D16',
                  color: '#F8FAFC',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: currentTheme === 'dark' ? '0 0 24px rgba(99, 102, 241, 0.35)' : 'none'
                }}
              >
                {currentTheme === 'dark' && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Check size={14} color="#FFF" />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                    <Sun size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>1. Dark Mode</h3>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Deep Navy (#090D16)</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.4 }}>
                  High contrast for low-light environments.
                </p>
                <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: '#090D16', border: '1px solid rgba(255,255,255,0.2)' }} />
                  <span style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: '#6366F1' }} />
                  <span style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: '#10B981' }} />
                </div>
              </div>

              {/* Theme 2: Light Mode */}
              <div
                onClick={() => onSelectTheme('light')}
                className="hover-lift"
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  border: '2px solid',
                  borderColor: currentTheme === 'light' ? 'var(--accent-primary)' : 'var(--border-color)',
                  backgroundColor: '#F1F5F9',
                  color: '#0F172A',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: currentTheme === 'light' ? '0 0 24px rgba(99, 102, 241, 0.35)' : '0 4px 12px rgba(0,0,0,0.05)'
                }}
              >
                {currentTheme === 'light' && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Check size={14} color="#FFF" />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#6366F1' }}>
                    <Moon size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>2. Light Mode</h3>
                    <span style={{ fontSize: '0.72rem', color: '#475569' }}>Crisp White (#F1F5F9)</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.4 }}>
                  Clean and bright for daylight office use.
                </p>
                <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }} />
                  <span style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: '#6366F1' }} />
                  <span style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: '#10B981' }} />
                </div>
              </div>

              {/* Theme 3: Gray Mode (Intermediate Slate) */}
              <div
                onClick={() => onSelectTheme('gray')}
                className="hover-lift"
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  border: '2px solid',
                  borderColor: currentTheme === 'gray' ? 'var(--accent-primary)' : 'var(--border-color)',
                  backgroundColor: '#2C3545',
                  color: '#F8FAFC',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: currentTheme === 'gray' ? '0 0 24px rgba(99, 102, 241, 0.35)' : 'none'
                }}
              >
                {currentTheme === 'gray' && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Check size={14} color="#FFF" />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#06B6D4' }}>
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>3. Gray Mode</h3>
                    <span style={{ fontSize: '0.72rem', color: '#CBD5E1' }}>Slate Gray (#2C3545)</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: 1.4 }}>
                  Balanced slate tones with reduced glare.
                </p>
                <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: '#2C3545', border: '1px solid rgba(255,255,255,0.2)' }} />
                  <span style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: '#6366F1' }} />
                  <span style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: '#06B6D4' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Theme Family 2: Notion & Airbnb Soft UI (Notion_Airbnb_SoftWarm) */}
          <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #D97706' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.4rem' }}>🏠</span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Notion & Airbnb Soft UI Theme (Notion_Airbnb_SoftWarm)</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Warm tones, organic curves, and relaxed typography.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {/* Soft UI Dark */}
              <div
                onClick={() => onSelectTheme('notion-dark')}
                className="hover-lift"
                style={{
                  padding: '20px',
                  borderRadius: '24px',
                  border: '2px solid',
                  borderColor: currentTheme === 'notion-dark' ? '#F59E0B' : 'var(--border-color)',
                  backgroundColor: '#1C1917',
                  color: '#FCFAF7',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: currentTheme === 'notion-dark' ? '0 0 24px rgba(245, 158, 11, 0.35)' : 'none'
                }}
              >
                {currentTheme === 'notion-dark' && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#F59E0B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Check size={14} color="#FFF" />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                    <Sun size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>1. Soft UI Dark</h3>
                    <span style={{ fontSize: '0.72rem', color: '#A8A29E' }}>Warm Charcoal (#1C1917)</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#A8A29E', lineHeight: 1.4 }}>
                  Espresso background with amber accents.
                </p>
                <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '99px', backgroundColor: '#1C1917', border: '1px solid rgba(255,255,255,0.2)' }} />
                  <span style={{ width: '20px', height: '20px', borderRadius: '99px', backgroundColor: '#F59E0B' }} />
                  <span style={{ width: '20px', height: '20px', borderRadius: '99px', backgroundColor: '#10B981' }} />
                </div>
              </div>

              {/* Soft UI Light (Cozy Sand - Requested Default Light) */}
              <div
                onClick={() => onSelectTheme('notion-light')}
                className="hover-lift"
                style={{
                  padding: '20px',
                  borderRadius: '24px',
                  border: '2px solid',
                  borderColor: currentTheme === 'notion-light' ? '#D97706' : 'var(--border-color)',
                  backgroundColor: '#FCFAF7',
                  color: '#2D2623',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: currentTheme === 'notion-light' ? '0 0 24px rgba(217, 119, 6, 0.35)' : '0 12px 36px rgba(45, 38, 35, 0.05)'
                }}
              >
                {currentTheme === 'notion-light' && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Check size={14} color="#FFF" />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(217, 119, 6, 0.15)', color: '#D97706' }}>
                    <Moon size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>2. Soft UI Light (Cozy Sand)</h3>
                    <span style={{ fontSize: '0.72rem', color: '#786D68' }}>Warm Cream (#FCFAF7)</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#786D68', lineHeight: 1.4 }}>
                  Cozy sand tones with warm organic borders.
                </p>
                <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '99px', backgroundColor: '#FCFAF7', border: '1px solid #EDE7DD' }} />
                  <span style={{ width: '20px', height: '20px', borderRadius: '99px', backgroundColor: '#D97706' }} />
                  <span style={{ width: '20px', height: '20px', borderRadius: '99px', backgroundColor: '#059669' }} />
                </div>
              </div>

              {/* Soft UI Gray (Warm Taupe) */}
              <div
                onClick={() => onSelectTheme('notion-gray')}
                className="hover-lift"
                style={{
                  padding: '20px',
                  borderRadius: '24px',
                  border: '2px solid',
                  borderColor: currentTheme === 'notion-gray' ? '#EAB308' : 'var(--border-color)',
                  backgroundColor: '#272422',
                  color: '#F5F3F0',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: currentTheme === 'notion-gray' ? '0 0 24px rgba(234, 179, 8, 0.35)' : 'none'
                }}
              >
                {currentTheme === 'notion-gray' && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#EAB308',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Check size={14} color="#FFF" />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#EAB308' }}>
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>3. Soft UI Gray</h3>
                    <span style={{ fontSize: '0.72rem', color: '#B8B2AC' }}>Warm Taupe (#272422)</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#B8B2AC', lineHeight: 1.4 }}>
                  Warm taupe with soft borders and pill shapes.
                </p>
                <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '99px', backgroundColor: '#272422', border: '1px solid rgba(255,255,255,0.2)' }} />
                  <span style={{ width: '20px', height: '20px', borderRadius: '99px', backgroundColor: '#EAB308' }} />
                  <span style={{ width: '20px', height: '20px', borderRadius: '99px', backgroundColor: '#34D399' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Database Backup & Restore */}
      {activeSubTab === 'database' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)' }}>
                <Download size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Export Full Data Backup</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Save a secure offline copy to your computer</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Download a complete backup file of all your orders, invoices, products, and customer records. You can keep this file in a safe folder or transfer it to another computer at any time.
            </p>
            <button onClick={handleExportBackup} className="btn btn-primary hover-lift" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>
              <Download size={16} />
              <span>Download Backup File (`.json`)</span>
            </button>
          </div>

          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818CF8' }}>
                <Upload size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Restore from Backup File</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Load records from a previously saved backup</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Restore your business orders, invoices, products, and customer records from a backup file. Your system database will be updated immediately.
            </p>
            <label className="btn btn-secondary hover-lift" style={{ marginTop: 'auto', alignSelf: 'flex-start', cursor: 'pointer' }}>
              <Upload size={16} />
              <span>Select Backup File to Restore...</span>
              <input type="file" accept=".json" onChange={handleRestoreBackup} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Wipe All Data Card */}
          <div className="glass-card" style={{ gridColumn: 'span 2', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: 'rgba(239, 68, 68, 0.25)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={20} style={{ color: 'var(--ruby)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Clear All Transaction Data (Fresh Start)</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Removes sample or historical orders, customers, and ledger records while keeping your company profile and master login intact.
              </p>
            </div>
            <button onClick={handleClearAllTransactions} className="btn hover-lift" style={{ backgroundColor: 'var(--ruby-bg)', color: 'var(--ruby)', border: '1px solid rgba(239, 68, 68, 0.3)', whiteSpace: 'nowrap' }}>
              <RotateCcw size={16} />
              <span>Reset Transaction Data</span>
            </button>
          </div>

          {/* Load Sample Demo Data Card */}
          <div className="glass-card" style={{ gridColumn: 'span 2', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Load Sample Business Data</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Populates sample products, orders, and customer records so you can test features and explore workflows.
              </p>
            </div>
            <button onClick={handleResetToSeed} className="btn btn-secondary hover-lift" style={{ whiteSpace: 'nowrap' }}>
              <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
              <span>Load Sample Data</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Brand & Company Profile */}
      {activeSubTab === 'company' && (
        <div className="glass-card" style={{ padding: '28px', maxWidth: '820px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Brand Profile, Logo & A4 Invoice Template</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Set your brand logo, contact details, and invoice defaults.
            </p>
          </div>

          {/* Logo Upload Section */}
          <div style={{
            padding: '18px 20px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-primary)',
            border: '1px dashed var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ImageIcon size={17} style={{ color: 'var(--accent-primary)' }} />
                  <span>Official Brand / Company Logo</span>
                </label>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  Supports SVG, PNG, JPG, WEBP. Automatically optimized for prints.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label className="btn btn-secondary hover-lift" style={{ cursor: 'pointer', padding: '7px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UploadCloud size={15} />
                  <span>{logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                  <input
                    type="file"
                    accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="btn btn-secondary hover-lift"
                    style={{ padding: '7px 10px', color: 'var(--ruby)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    title="Remove Logo"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Dual Live Preview: Sidebar Header & A4 Invoice */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '4px' }}>
              {/* Preview 1: App Navigation Bar Preview */}
              <div style={{
                padding: '14px 16px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    1. App Header Appearance
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#10B981', fontWeight: 600, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                    Top-Left Corner
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-highlight)'
                }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: logoUrl ? '#FFFFFF' : 'transparent',
                    border: logoUrl ? '1px solid rgba(255,255,255,0.25)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: logoUrl ? '2px' : 0,
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    ) : (companyName && companyName.trim().toLowerCase() !== 'probaho crm solutions') ? (
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {companyName.trim().slice(0, 2).toUpperCase()}
                      </div>
                    ) : (
                      <ProbahoLogo size={38} glow={false} />
                    )}
                  </div>
                  <div style={{ overflow: 'hidden', minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {companyName || 'PROBAHO CRM Solutions'}
                    </div>
                    <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                      {BUSINESS_SEGMENTS[businessType]?.title || 'Clothing & Fashion'}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--accent-primary)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px', opacity: 0.92 }}>
                      Powered by PROBAHO
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview 2: A4 Invoice Header Preview */}
              <div style={{
                padding: '14px 16px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    2. A4 Printed Invoice
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#10B981', fontWeight: 600, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                    Print Header
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 14px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  minHeight: '52px'
                }}>
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Brand Logo"
                      style={{
                        maxHeight: '44px',
                        maxWidth: '120px',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#111827' }}>
                      {companyName || 'PROBAHO CRM SOLUTIONS'}
                    </div>
                  )}
                  <div style={{ borderLeft: '1px solid #E5E7EB', paddingLeft: '10px' }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#111827' }}>RETAIL INVOICE</div>
                    <div style={{ fontSize: '0.66rem', color: '#6B7280' }}>Ref: INV-2026-001</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Industry / Segment Switcher */}
          <div style={{
            padding: '20px',
            borderRadius: '14px',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Store size={18} style={{ color: 'var(--accent-primary)' }} />
                  <span>Business Industry & Inventory Mode</span>
                </label>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  Customizes product fields, sizes, and categories for your industry.
                </p>
              </div>
              <div style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-primary)',
                fontWeight: 700
              }}>
                Active Mode: {BUSINESS_SEGMENTS[businessType]?.title || 'Clothing & Fashion'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {Object.values(BUSINESS_SEGMENTS).map(seg => {
                const isSelected = businessType === seg.id;
                const IconComponent = seg.iconName === 'Shirt' ? Shirt :
                                      seg.iconName === 'Smartphone' ? Smartphone :
                                      seg.iconName === 'Footprints' ? Footprints :
                                      seg.iconName === 'Sparkles' ? Sparkles :
                                      seg.iconName === 'Apple' ? Apple : Store;
                return (
                  <div
                    key={seg.id}
                    onClick={() => {
                      if (seg.id !== businessType) {
                        setPendingBusinessType(seg.id);
                        setShowSegmentWarningModal(true);
                      }
                    }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      position: 'relative',
                      transition: 'all 0.18s ease'
                    }}
                    className="hover-lift"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-hover)',
                        color: isSelected ? '#fff' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <IconComponent size={17} />
                      </div>
                      {isSelected && (
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff'
                        }}>
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: isSelected ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        {seg.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px', lineHeight: 1.3 }}>
                        {seg.subtitle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Basic Brand Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Brand Name / Showroom Title</label>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              style={{
                padding: '11px 14px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-hover)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.92rem'
              }}
            />
          </div>

          {/* Country & Language Configuration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                🌍 Operating Country & Regional Settings
              </label>
              <select
                value={country}
                onChange={e => handleCountryChange(e.target.value)}
                style={{
                  padding: '11px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem'
                }}
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.currencyCode} - {c.phoneCode})
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                Auto-syncs currency, phone code, and tax title.
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                🌐 System Language
              </label>
              <select
                value={language}
                onChange={e => handleLanguageChange(e.target.value)}
                style={{
                  padding: '11px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem'
                }}
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name} — {l.nativeName}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                Instantly updates all menus, buttons, and headers.
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Hotline / WhatsApp Helpline</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{
                  padding: '11px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {taxTitle || 'Tax / VAT Registration No.'}
              </label>
              <input
                type="text"
                placeholder="Registration / Tax ID"
                value={vatBin}
                onChange={e => setVatBin(e.target.value)}
                style={{
                  padding: '11px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Official Email</label>
              <input
                type="email"
                placeholder="care@yourbrand.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  padding: '11px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Website URL</label>
              <input
                type="text"
                placeholder="www.yourbrand.com"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                style={{
                  padding: '11px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Operating Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                style={{
                  padding: '11px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem'
                }}
              >
                {CURRENCIES.map(curr => (
                  <option key={curr.formatted} value={curr.formatted}>
                    {curr.formatted} - {curr.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Preferred Courier Partner</label>
              <input
                type="text"
                placeholder="e.g. Standard Courier / In-House"
                value={defaultCourier}
                onChange={e => setDefaultCourier(e.target.value)}
                style={{
                  padding: '11px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Business & Dispatch Address</label>
            <input
              type="text"
              placeholder="e.g. 100 Corporate Boulevard, Suite 400"
              value={address}
              onChange={e => setAddress(e.target.value)}
              style={{
                padding: '11px 14px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-hover)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.92rem'
              }}
            />
          </div>

          {/* Default Invoice Configuration */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} style={{ color: 'var(--accent-primary)' }} />
              <span>Default A4 Invoice Layout & Policies</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Standard terms and header text for all printed invoices.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Default Invoice Heading Title</label>
              <input
                type="text"
                placeholder="INVOICE / CHALLAN"
                value={defaultInvoiceTitle}
                onChange={e => setDefaultInvoiceTitle(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Standard Return / Exchange Policy Terms</label>
              <textarea
                rows={4}
                placeholder="1. Please inspect the parcel and verify item condition upon delivery...&#10;2. In case of any discrepancies, contact customer support within 48 hours..."
                value={defaultInvoiceTerms}
                onChange={e => setDefaultInvoiceTerms(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.86rem',
                  lineHeight: 1.5,
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Default Invoice Footer Thank You Banner</label>
              <input
                type="text"
                placeholder="Thank you for shopping with us!"
                value={defaultInvoiceFooter}
                onChange={e => setDefaultInvoiceFooter(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <button onClick={handleSaveSettings} className="btn btn-primary hover-lift" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
            <Save size={16} />
            <span>Save Brand Profile & Default Invoice Settings</span>
          </button>
        </div>
      )}

      {/* Tab 4: Courier & RTO Rules */}
      {activeSubTab === 'courier' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '28px', maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Courier Partners & RTO Risk Automation</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Set default couriers and return fraud thresholds.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Default Courier Partner</label>
                <select
                  value={defaultCourier}
                  onChange={e => setDefaultCourier(e.target.value)}
                  style={{
                    padding: '11px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-hover)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.92rem'
                  }}
                >
                  <option value="Pathao Courier">Pathao Courier</option>
                  <option value="RedX Logistics">RedX Logistics</option>
                  <option value="Steadfast Courier">Steadfast Courier</option>
                  <option value="Paperfly">Paperfly</option>
                  <option value="Sundarban Courier">Sundarban Courier</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>RTO Blacklist Alert Threshold</label>
                <select
                  value={rtoThreshold}
                  onChange={e => setRtoThreshold(e.target.value)}
                  style={{
                    padding: '11px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-hover)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.92rem'
                  }}
                >
                  <option value="1">1 Returned Order (Strict)</option>
                  <option value="2">2 Returned Orders (Default & Recommended)</option>
                  <option value="3">3 Returned Orders (Lenient)</option>
                </select>
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <AlertTriangle size={24} style={{ color: '#F59E0B', flexShrink: 0 }} />
              <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                <strong>Automatic Protection:</strong> Customers with &ge; {rtoThreshold} returned deliveries are flagged as Return Risk to prevent shipping losses.
              </div>
            </div>

            <button onClick={handleSaveSettings} className="btn btn-primary hover-lift" style={{ alignSelf: 'flex-start', marginTop: '8px' }}>
              <Save size={16} />
              <span>Save Courier Configuration</span>
            </button>
          </div>

          <PartnersView currentUser={currentUser} />
        </div>
      )}

      {/* Tab 5: Staff Profiles & Access Control (RBAC) */}
      {activeSubTab === 'staff' && (
        <StaffManagementView
          currentUser={currentUser}
          onRefreshUsers={onRefreshAll}
          onSwitchProfile={onSwitchProfile}
        />
      )}

      {/* Tab 6: Cloud Sync & Multi-Device Synchronization */}
      {activeSubTab === 'cloud' && (
        <CloudSyncSettings onRefreshAll={onRefreshAll} />
      )}

      {/* Tab 7: About Software & Creator Attribution */}
      {activeSubTab === 'about' && (() => {
        const author = getAuthorIdentity();
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
            {/* Header Banner */}
            <div className="glass-card" style={{ padding: '28px', border: '1px solid var(--border-highlight)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <ProbahoLogo size={52} glow={true} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                        PROBAHO CRM Solutions
                      </h2>
                      <span style={{ 
                        fontSize: '0.76rem', 
                        fontWeight: 700, 
                        padding: '3px 10px', 
                        borderRadius: '20px', 
                        backgroundColor: 'var(--accent-glow)', 
                        color: 'var(--accent-primary)' 
                      }}>
                        v{APP_VERSION} Desktop
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      Enterprise Business Operations Platform
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {updateInfo.hasUpdate ? (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      backgroundColor: 'rgba(16, 185, 129, 0.16)',
                      border: '1px solid rgba(16, 185, 129, 0.45)',
                      color: '#10B981',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      boxShadow: '0 0 12px rgba(16, 185, 129, 0.25)'
                    }}>
                      <ArrowUpCircle size={15} />
                      <span>Update Available: v{updateInfo.latestVersion}</span>
                    </div>
                  ) : (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#10B981',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                      <span>Freeware & Official Release</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Software Version & Live Update Management Card */}
              <div style={{
                padding: '22px',
                borderRadius: '14px',
                backgroundColor: 'var(--bg-secondary)',
                border: updateInfo.hasUpdate ? '1.5px solid rgba(16, 185, 129, 0.45)' : '1px solid var(--border-color)',
                marginBottom: '24px',
                boxShadow: updateInfo.hasUpdate ? '0 0 20px rgba(16, 185, 129, 0.08)' : 'none'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: updateInfo.hasUpdate || updateInfo.status === 'up-to-date' || updateInfo.status === 'error' ? '16px' : 0 }}>
                  <div style={{ minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
                      <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                        Software Version & Updates
                      </h3>
                      {updateInfo.hasUpdate ? (
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(16, 185, 129, 0.18)',
                          color: '#10B981',
                          border: '1px solid rgba(16, 185, 129, 0.35)',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <ArrowUpCircle size={13} />
                          v{updateInfo.latestVersion} Available
                        </span>
                      ) : (
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(99, 102, 241, 0.1)',
                          color: 'var(--accent-primary)',
                          border: '1px solid rgba(99, 102, 241, 0.25)',
                          fontSize: '0.74rem',
                          fontWeight: 600
                        }}>
                          Installed: v{APP_VERSION}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      Automated release verification. Installing updates preserves all customer records, transactions, and settings.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={handleCheckForUpdates}
                      disabled={isCheckingUpdate}
                      className="btn btn-secondary"
                      style={{
                        padding: '8px 16px',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        gap: '8px',
                        cursor: isCheckingUpdate ? 'wait' : 'pointer'
                      }}
                    >
                      <RefreshCw size={14} style={{ animation: isCheckingUpdate ? 'spin 1s linear infinite' : 'none' }} />
                      <span>{isCheckingUpdate ? 'Checking Server...' : 'Check for Updates'}</span>
                    </button>
                  </div>
                </div>

                {/* State: Update Available Banner */}
                {updateInfo.hasUpdate && (
                  <div style={{
                    padding: '18px 20px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <Sparkles size={18} style={{ color: '#10B981' }} />
                          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            {updateInfo.releaseTitle || `Release v${updateInfo.latestVersion} Available`}
                          </h4>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {updateInfo.releaseDate ? `Published: ${updateInfo.releaseDate} • ` : ''}Recommended official upgrade
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {updateInfo.downloadStatus === 'downloaded' ? (
                          <button
                            type="button"
                            onClick={() => updateService.installAndRestart()}
                            className="btn btn-primary"
                            style={{
                              padding: '9px 18px',
                              fontSize: '0.86rem',
                              fontWeight: 700,
                              gap: '8px',
                              backgroundColor: '#10B981',
                              borderColor: '#10B981',
                              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                            }}
                          >
                            <CheckCircle2 size={16} />
                            <span>Restart & Install Now</span>
                          </button>
                        ) : updateInfo.downloadStatus === 'downloading' ? (
                          <button
                            type="button"
                            onClick={() => updateService.cancelDownload()}
                            className="btn btn-secondary"
                            style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                          >
                            Cancel Download
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => updateService.startDownload()}
                            className="btn btn-primary"
                            style={{
                              padding: '9px 18px',
                              fontSize: '0.86rem',
                              fontWeight: 700,
                              gap: '8px',
                              backgroundColor: '#10B981',
                              borderColor: '#10B981',
                              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                            }}
                          >
                            <Download size={16} />
                            <span>Download & Install Update</span>
                          </button>
                        )}

                        {updateInfo.releasePageUrl && (
                          <a
                            href={updateInfo.releasePageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                            style={{ padding: '8px 12px', fontSize: '0.82rem', gap: '6px' }}
                          >
                            <ExternalLink size={14} />
                            <span>Release Notes</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Live Progress Bar when downloading */}
                    {updateInfo.downloadStatus === 'downloading' && (
                      <div style={{
                        marginTop: '14px',
                        padding: '14px 16px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            Downloading Update Package (v{updateInfo.latestVersion})...
                          </span>
                          <span style={{ fontWeight: 800, color: '#10B981' }}>
                            {updateInfo.downloadProgress?.percent || 0}%
                          </span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--border-color)',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${updateInfo.downloadProgress?.percent || 0}%`,
                            height: '100%',
                            backgroundColor: '#10B981',
                            borderRadius: '4px',
                            transition: 'width 0.2s ease',
                            boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                          }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          <span>
                            {updateInfo.downloadProgress?.totalBytes 
                              ? `${((updateInfo.downloadProgress.receivedBytes) / (1024 * 1024)).toFixed(1)} MB of ${((updateInfo.downloadProgress.totalBytes) / (1024 * 1024)).toFixed(1)} MB`
                              : `${((updateInfo.downloadProgress?.receivedBytes || 0) / (1024 * 1024)).toFixed(1)} MB downloaded`}
                          </span>
                          <span>In-app background download</span>
                        </div>
                      </div>
                    )}

                    {/* Downloaded and ready state notice */}
                    {updateInfo.downloadStatus === 'downloaded' && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <CheckCircle2 size={18} style={{ color: '#10B981', flexShrink: 0 }} />
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                          <strong>Update downloaded and ready.</strong> Click <strong>"Restart & Install Now"</strong> to apply the update and relaunch PROBAHO CRM Solutions.
                        </div>
                      </div>
                    )}

                    {/* Download error notice */}
                    {updateInfo.downloadStatus === 'error' && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        <div style={{ fontSize: '0.82rem', color: '#EF4444' }}>
                          {updateInfo.downloadError || 'Download interrupted. Please check your internet connection and try again.'}
                        </div>
                        <button
                          type="button"
                          onClick={() => updateService.startDownload()}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                        >
                          Retry Download
                        </button>
                      </div>
                    )}

                    {/* What's New bullet points */}
                    {updateInfo.changelog && updateInfo.changelog.length > 0 && (
                      <div style={{
                        backgroundColor: 'var(--bg-card)',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color)',
                        marginTop: '10px'
                      }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                          What's New in this Version:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {updateInfo.changelog.map((line, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: '1.45' }}>
                              <CheckCircle2 size={14} style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
                              <span>{line}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: '12px', fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={14} style={{ color: '#10B981' }} />
                      <span>Zero data loss guarantee: Upgrading replaces the application binary while leaving your database and settings intact.</span>
                    </div>
                  </div>
                )}

                {/* State: Up to Date Confirmation */}
                {!updateInfo.hasUpdate && updateInfo.status === 'up-to-date' && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle2 size={17} style={{ color: '#10B981', flexShrink: 0 }} />
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>
                        <strong>PROBAHO CRM Solutions is up to date</strong> (v{APP_VERSION}). You are running the latest official release with all stability, security, and performance enhancements.
                      </div>
                    </div>
                    {updateInfo.lastCheckedAt && (
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        Checked at {updateInfo.lastCheckedAt}
                      </span>
                    )}
                  </div>
                )}

                {/* State: Offline Notice */}
                {updateInfo.status === 'error' && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <AlertTriangle size={17} style={{ color: '#F59E0B', flexShrink: 0 }} />
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Running in offline-first mode. Version check skipped or server unreachable. Local operations remain fully functional.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCheckForUpdates}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.76rem', padding: '4px 10px' }}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Bottom Bar: Release Repository Setting */}
                <div style={{
                  paddingTop: '14px',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Release Repository:
                    </span>
                    {isEditingRepo ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="text"
                          value={updateRepo}
                          onChange={(e) => setUpdateRepo(e.target.value)}
                          placeholder="owner/repo"
                          style={{
                            fontSize: '0.78rem',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid var(--accent-primary)',
                            backgroundColor: 'var(--bg-input)',
                            color: 'var(--text-main)',
                            width: '210px'
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleSaveRepo}
                          className="btn btn-primary"
                          style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUpdateRepo(updateService.getConfig().githubRepo);
                            setIsEditingRepo(false);
                          }}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.74rem', padding: '4px 8px' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '0.78rem',
                          fontFamily: 'monospace',
                          color: 'var(--text-main)',
                          backgroundColor: 'var(--bg-hover)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)'
                        }}>
                          github.com/{updateRepo}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsEditingRepo(true)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-primary)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: 0
                          }}
                        >
                          Edit
                        </button>
                        {repoSavedSuccess && (
                          <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
                            ✓ Saved
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Creator Profile Box */}
              <div style={{
                padding: '22px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(16, 185, 129, 0.08))',
                border: '1px solid rgba(99, 102, 241, 0.28)',
                display: 'flex',
                gap: '20px',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '1.45rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 18px rgba(79, 70, 229, 0.4)',
                  flexShrink: 0
                }}>
                  IR
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {author.name}
                    </span>
                    <Sparkles size={18} style={{ color: '#F59E0B' }} />
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 700, marginBottom: '6px' }}>
                    {author.title}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    {author.bio}
                  </p>
                </div>
              </div>

              {/* Direct Official Contact Channels */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  Official Contact & Social Channels
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {/* LinkedIn */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    backgroundColor: 'var(--bg-hover)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: '#0A66C2',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <LinkedinIcon size={20} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>LinkedIn</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {author.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
                        </div>
                      </div>
                    </div>
                    <a
                      href={author.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ fontSize: '0.8rem', padding: '7px 14px', gap: '6px', whiteSpace: 'nowrap' }}
                    >
                      <span>Connect</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>

                  {/* Email */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    backgroundColor: 'var(--bg-hover)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        color: '#EF4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Mail size={20} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>Support & Inquiries</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {author.email}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(author.email);
                          setCopiedCreatorEmail(true);
                          setTimeout(() => setCopiedCreatorEmail(false), 2000);
                        }}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.8rem', padding: '7px 10px', gap: '5px' }}
                        title="Copy email address"
                      >
                        {copiedCreatorEmail ? <Check size={14} style={{ color: '#10B981' }} /> : <Copy size={14} />}
                        <span>{copiedCreatorEmail ? 'Copied' : 'Copy'}</span>
                      </button>
                      <a
                        href={`mailto:${author.email}?subject=PROBAHO%20CRM%20Solutions%20-%20Inquiry`}
                        className="btn btn-primary"
                        style={{ fontSize: '0.8rem', padding: '7px 12px', gap: '5px' }}
                      >
                        <span>Write</span>
                        <Mail size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* License & Attribution Notice */}
              <div style={{
                padding: '16px 18px',
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <ShieldCheck size={20} style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Official Freeware & Ownership License
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    Copyright © 2026 <strong>{author.name}</strong>. All rights reserved. 
                    This software is provided free of charge for commercial showroom operations and personal business management. 
                    Author attribution, creator dialogs, and copyright notices embedded in this software must remain intact and may not be removed, modified, or obscured.
                  </div>
                </div>
              </div>

              {/* Bottom Signature */}
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  Handcrafted with <Heart size={13} style={{ color: '#EF4444', fill: '#EF4444' }} /> by {author.name}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  Desktop Application • High-Performance Local Database
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Business Segment Switch Warning Confirmation Modal */}
      {showSegmentWarningModal && pendingBusinessType && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 15, 30, 0.85)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '18px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }} className="animate-scale-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <AlertTriangle size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Change Business Segment?
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Switching to: <strong>{BUSINESS_SEGMENTS[pendingBusinessType]?.title}</strong>
                </span>
              </div>
            </div>

            <div style={{
              padding: '14px 16px',
              borderRadius: '10px',
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              fontSize: '0.84rem',
              color: 'var(--text-muted)',
              lineHeight: 1.55
            }}>
              <p style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#F59E0B' }}>⚠️ Important Notice:</strong>
              </p>
              <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>
                  Your <strong>Add & Edit Product</strong> forms will now display attributes suited for <strong>{BUSINESS_SEGMENTS[pendingBusinessType]?.title}</strong> ({BUSINESS_SEGMENTS[pendingBusinessType]?.specLabel}, {BUSINESS_SEGMENTS[pendingBusinessType]?.colorLabel}).
                </li>
                <li>
                  All existing inventory items, historical orders, and customer records will remain <strong>completely safe and preserved</strong>.
                </li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowSegmentWarningModal(false);
                  setPendingBusinessType(null);
                }}
                className="btn btn-secondary"
                style={{ padding: '9px 18px', fontSize: '0.86rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setBusinessType(pendingBusinessType);
                  setShowSegmentWarningModal(false);
                  setPendingBusinessType(null);
                }}
                className="btn btn-primary"
                style={{
                  padding: '9px 18px',
                  fontSize: '0.86rem',
                  backgroundColor: '#F59E0B',
                  borderColor: '#F59E0B',
                  color: '#000',
                  fontWeight: 700
                }}
              >
                Confirm & Switch Segment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
