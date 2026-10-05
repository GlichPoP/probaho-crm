import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, Search, ChevronDown, MapPin, Sparkles } from 'lucide-react';
import { useLocalization } from '../../i18n/LanguageContext';

export const LanguageDropdown: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    languages, 
    currentLanguageConfig,
    country,
    setCountry,
    countries,
    currentCountryConfig,
    currencySymbol
  } = useLocalization();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'language' | 'country'>('language');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredLanguages = languages.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.currencyCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLanguage = (langCode: string) => {
    setLanguage(langCode);
    const selected = languages.find(l => l.code === langCode);
    setNotification(`Language changed to ${selected?.name || langCode}`);
    setTimeout(() => {
      setNotification(null);
      setIsOpen(false);
    }, 600);
  };

  const handleSelectCountry = (countryCode: string) => {
    setCountry(countryCode, true);
    const selected = countries.find(c => c.code === countryCode);
    setNotification(`Country: ${selected?.name} • Currency synced to ${selected?.currencyFormatted}`);
    setTimeout(() => {
      setNotification(null);
      setIsOpen(false);
    }, 1000);
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Google-Style Pill Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(prev => !prev);
          setSearchQuery('');
        }}
        className="hover-lift"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: '7px 12px',
          borderRadius: '10px',
          backgroundColor: isOpen ? 'var(--accent-glow)' : 'var(--bg-primary)',
          border: '1px solid',
          borderColor: isOpen ? 'var(--accent-primary)' : 'var(--border-color)',
          color: 'var(--text-main)',
          fontSize: '0.81rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.18s ease'
        }}
        title="Select Language & Country (Like Google)"
      >
        <span style={{ fontSize: '0.95rem' }}>{currentCountryConfig.flag}</span>
        <Globe size={14} style={{ color: 'var(--accent-primary)' }} />
        <span>{currentLanguageConfig.name}</span>
        <span style={{ 
          fontSize: '0.7rem', 
          backgroundColor: 'var(--bg-hover)', 
          padding: '1px 6px', 
          borderRadius: '6px',
          color: 'var(--accent-primary)',
          fontWeight: 700
        }}>
          {currencySymbol}
        </span>
        <ChevronDown size={13} style={{ color: 'var(--text-dim)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: '320px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.28)',
          zIndex: 100,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}>
          {/* Header & Tabs */}
          <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={13} style={{ color: 'var(--accent-primary)' }} />
                <span>Regional Preferences</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--emerald)', fontWeight: 700 }}>
                {currentCountryConfig.code} • {currentCountryConfig.currencyFormatted}
              </div>
            </div>

            {/* Segmented Switcher */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4px',
              backgroundColor: 'var(--bg-hover)',
              padding: '3px',
              borderRadius: '8px'
            }}>
              <button
                onClick={() => { setActiveTab('language'); setSearchQuery(''); }}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: activeTab === 'language' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'language' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: activeTab === 'language' ? 700 : 500,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: activeTab === 'language' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Globe size={13} />
                <span>Language</span>
              </button>
              <button
                onClick={() => { setActiveTab('country'); setSearchQuery(''); }}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: activeTab === 'country' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'country' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: activeTab === 'country' ? 700 : 500,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: activeTab === 'country' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <MapPin size={13} />
                <span>Country & Currency</span>
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', marginTop: '8px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder={activeTab === 'language' ? 'Search language...' : 'Search country or currency...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 30px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
                autoFocus
              />
            </div>
          </div>

          {/* Quick Notification Toast */}
          {notification && (
            <div style={{
              padding: '7px 12px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--emerald)',
              fontSize: '0.76rem',
              fontWeight: 700,
              textAlign: 'center',
              borderBottom: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              {notification}
            </div>
          )}

          {/* Items List */}
          <div style={{ maxHeight: '280px', overflowY: 'auto', padding: '6px 0' }}>
            {activeTab === 'language' ? (
              filteredLanguages.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                  No languages match "{searchQuery}"
                </div>
              ) : (
                filteredLanguages.map(l => {
                  const isSelected = l.code === language;
                  return (
                    <button
                      key={l.code}
                      onClick={() => handleSelectLanguage(l.code)}
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: 'none',
                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-main)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.12s ease'
                      }}
                      className="hover-bg"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.1rem' }}>{l.flag}</span>
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: isSelected ? 700 : 500 }}>
                            {l.nativeName}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                            {l.name}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check size={16} style={{ color: 'var(--accent-primary)' }} />}
                    </button>
                  );
                })
              )
            ) : (
              filteredCountries.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                  No countries match "{searchQuery}"
                </div>
              ) : (
                filteredCountries.map(c => {
                  const isSelected = c.code === country;
                  return (
                    <button
                      key={c.code}
                      onClick={() => handleSelectCountry(c.code)}
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: 'none',
                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-main)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.12s ease'
                      }}
                      className="hover-bg"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.15rem' }}>{c.flag}</span>
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: isSelected ? 700 : 500 }}>
                            {c.name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                            {c.currencyFormatted} • Dial: {c.phoneCode}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check size={16} style={{ color: 'var(--accent-primary)' }} />}
                    </button>
                  );
                })
              )
            )}
          </div>

          {/* Footer Info */}
          <div style={{
            padding: '8px 14px',
            backgroundColor: 'var(--bg-primary)',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.69rem',
            color: 'var(--text-dim)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Syncs currency, dial code & tax title</span>
            <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>PROBAHO Global</span>
          </div>
        </div>
      )}
    </div>
  );
};
