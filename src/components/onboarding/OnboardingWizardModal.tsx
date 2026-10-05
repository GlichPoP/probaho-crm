import React, { useState } from 'react';
import { 
  Building2, User, Truck, Sparkles, Check, ArrowRight, Layers,
  Shirt, Smartphone, Footprints, Apple, Store
} from 'lucide-react';
import { dbService } from '../../database/db';
import type { BusinessType } from '../../types/crm';
import { BUSINESS_SEGMENTS } from '../../config/businessSegments';
import { COUNTRIES, LANGUAGES, CURRENCIES, getCountryByCode } from '../../config/countriesData';
import { useLocalization } from '../../i18n/LanguageContext';
import { getRegionalCouriers, getRegionalPaymentMethods } from '../../config/regionalPresets';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <OnboardingWizardModalContent {...props} />;
};

const OnboardingWizardModalContent: React.FC<OnboardingWizardModalProps> = ({
  onComplete
}) => {
  const { setCountry: setCtxCountry, setLanguage: setCtxLanguage } = useLocalization();

  // Step state
  const [step, setStep] = useState<number>(1);

  // Form State
  const [brandName, setBrandName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('clothing');
  const [country, setCountry] = useState('US');
  const [language, setLanguage] = useState('en');
  const [taxTitle, setTaxTitle] = useState('Sales Tax / EIN');
  const [phone, setPhone] = useState('+1 ');
  const [address, setAddress] = useState('');
  const [vatBin, setVatBin] = useState('');
  const [currency, setCurrency] = useState('USD ($)');

  const [selectedCouriers, setSelectedCouriers] = useState<string[]>(() =>
    getRegionalCouriers('US').slice(0, 3).map(c => c.name)
  );
  const [defaultCourier, setDefaultCourier] = useState(() =>
    getRegionalCouriers('US')[0]?.name || 'FedEx Ground'
  );
  const [selectedPayments, setSelectedPayments] = useState<string[]>(() =>
    getRegionalPaymentMethods('US').slice(0, 3)
  );

  const handleCountryChange = (countryCode: string) => {
    setCountry(countryCode);
    const cObj = getCountryByCode(countryCode);
    if (cObj) {
      setCurrency(cObj.currencyFormatted);
      setTaxTitle(cObj.taxTitle);
      if (cObj.defaultLanguage) {
        setLanguage(cObj.defaultLanguage);
      }
      setPhone(`${cObj.phoneCode} `);
    }
    const regionalCouriers = getRegionalCouriers(countryCode);
    const regionalPayments = getRegionalPaymentMethods(countryCode);
    setSelectedCouriers(regionalCouriers.slice(0, 3).map(c => c.name));
    setDefaultCourier(regionalCouriers[0]?.name || 'Standard Courier');
    setSelectedPayments(regionalPayments.slice(0, 3));
  };

  const [ownerName, setOwnerName] = useState('');
  const [ownerEmailOrPhone, setOwnerEmailOrPhone] = useState('');
  const [pinCode, setPinCode] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCourier = (courier: string) => {
    setSelectedCouriers(prev => {
      if (prev.includes(courier)) {
        if (prev.length === 1) return prev; // keep at least 1
        const updated = prev.filter(c => c !== courier);
        if (defaultCourier === courier && updated.length > 0) {
          setDefaultCourier(updated[0]);
        }
        return updated;
      } else {
        return [...prev, courier];
      }
    });
  };

  const togglePayment = (payment: string) => {
    setSelectedPayments(prev => {
      if (prev.includes(payment)) {
        if (prev.length === 1) return prev;
        return prev.filter(p => p !== payment);
      } else {
        return [...prev, payment];
      }
    });
  };

  const handleLaunch = (loadDemoData: boolean = false) => {
    if (!brandName.trim()) {
      alert('Please enter your Business / Brand Name.');
      setStep(1);
      return;
    }
    if (!ownerName.trim()) {
      alert('Please enter the Owner / Administrator Full Name.');
      setStep(2);
      return;
    }

    setIsSubmitting(true);

    try {
      dbService.completeOnboarding({
        brandName: brandName.trim(),
        businessType,
        country,
        language,
        taxTitle,
        phone: phone.trim(),
        address: address.trim() || 'Primary Business Address',
        vatBin: vatBin.trim(),
        currency,
        ownerName: ownerName.trim(),
        ownerEmailOrPhone: ownerEmailOrPhone.trim() || phone.trim() || 'owner@business.com',
        pinCode: pinCode.trim(),
        defaultCourier,
        activeCouriers: selectedCouriers,
        activePayments: selectedPayments,
        loadDemoData
      });

      setCtxCountry(country, true);
      setCtxLanguage(language);
      onComplete();
    } catch (err) {
      console.error('Error during onboarding setup:', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedStep1 = brandName.trim().length > 0;
  const canProceedStep2 = ownerName.trim().length > 0;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px'
    }}>
      <div 
        data-theme="light"
        style={{
          width: '100%',
          maxWidth: '740px',
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          border: '1px solid rgba(0, 0, 0, 0.12)',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }} 
        className="animate-scale-in"
      >
        
        {/* Header Banner */}
        <div style={{
          padding: '28px 32px 24px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, var(--accent-primary), #8B5CF6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 6px 18px 0 var(--accent-glow)'
              }}>
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="brand-font" style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
                  Welcome to PROBAHO CRM Solutions
                </h2>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Set up your business profile to get started.
                </p>
              </div>
            </div>

            {/* Step Indicators */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  onClick={() => {
                    if (s === 2 && !canProceedStep1) return;
                    if (s === 3 && (!canProceedStep1 || !canProceedStep2)) return;
                    setStep(s);
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: (s === 1 || (s === 2 && canProceedStep1) || (s === 3 && canProceedStep1 && canProceedStep2)) ? 'pointer' : 'not-allowed',
                    backgroundColor: step === s ? 'var(--accent-primary)' : step > s ? 'var(--emerald)' : 'var(--bg-primary)',
                    color: step >= s ? '#fff' : 'var(--text-dim)',
                    border: '1px solid ' + (step === s ? 'var(--accent-primary)' : step > s ? 'var(--emerald)' : 'var(--border-color)'),
                    transition: 'all 0.2s ease'
                  }}
                >
                  {step > s ? <Check size={14} /> : s}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Body: Steps */}
        <div style={{ padding: '28px 32px', maxHeight: '64vh', overflowY: 'auto' }}>
          
          {/* STEP 1: Business Identity & Brand */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)', fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Building2 size={18} />
                <span>Step 1: Your Business & Brand Profile</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                    Business / Brand Name <span style={{ color: 'var(--ruby)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Apex Global Enterprises / Heritage Store / Urban Retail"
                    value={brandName}
                    onChange={e => setBrandName(e.target.value)}
                    autoFocus
                    style={{ fontSize: '1rem', padding: '11px 14px' }}
                  />
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                    Appears on invoices, challans, and the header.
                  </span>
                </div>

                {/* Business Type / Industry Selection */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '4px' }}>
                    Select Your Business Segment / Industry <span style={{ color: 'var(--ruby)' }}>*</span>
                  </label>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    Adapts inventory fields, sizes, and categories to your industry.
                  </p>
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
                          onClick={() => setBusinessType(seg.id)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '12px',
                            border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                            backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            position: 'relative',
                            transition: 'all 0.18s ease'
                          }}
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
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? 'var(--text-main)' : 'var(--text-muted)' }}>
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

                {/* Operating Country and Language */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                    🌍 Operating Country & Region <span style={{ color: 'var(--ruby)' }}>*</span>
                  </label>
                  <select
                    className="input-field"
                    value={country}
                    onChange={e => handleCountryChange(e.target.value)}
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name} ({c.currencyCode} - {c.phoneCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                    🌐 System Language
                  </label>
                  <select
                    className="input-field"
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.code} value={l.code}>
                        {l.flag} {l.name} — {l.nativeName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                    Official Contact Phone / Helpline
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. +1 555-019-2834 or official business phone"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                    Operating Currency
                  </label>
                  <select
                    className="input-field"
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                  >
                    {CURRENCIES.map(curr => (
                      <option key={curr.formatted} value={curr.formatted}>
                        {curr.formatted} - {curr.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                    Corporate / Warehouse Address
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 100 Corporate Boulevard, Suite 400"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                    {taxTitle || 'VAT / BIN / Trade License Number'} <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 001234567-0101 or Tax ID"
                    value={vatBin}
                    onChange={e => setVatBin(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Administrator / Owner Account */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)', fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <User size={18} />
                <span>Step 2: Business Owner & Master Account</span>
              </div>

              <div style={{
                padding: '14px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                fontSize: '0.83rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5
              }}>
                <strong style={{ color: 'var(--accent-primary)' }}>Master Profile:</strong> Full access to all CRM modules and settings.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                    Owner / Administrator Full Name <span style={{ color: 'var(--ruby)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Alexander Vance (Administrator)"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    autoFocus
                    style={{ fontSize: '1rem', padding: '11px 14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                    Email or Mobile Number
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={country === 'BD' ? 'e.g. owner@business.com / 017xxxxxxxx' : 'e.g. owner@business.com / (555) 019-2834'}
                    value={ownerEmailOrPhone}
                    onChange={e => setOwnerEmailOrPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                    Quick Access PIN <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(Optional, e.g. 1234)</span>
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    className="input-field"
                    placeholder="••••"
                    value={pinCode}
                    onChange={e => setPinCode(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Couriers, Channels & Launch Mode */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }} className="animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)', fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Truck size={18} />
                <span>Step 3: Logistics & Starting Preference</span>
              </div>

              {/* Delivery Couriers Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '8px' }}>
                  Couriers & Logistics Partners You Use
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {getRegionalCouriers(country).map(cObj => {
                    const courier = cObj.name;
                    const isSelected = selectedCouriers.includes(courier);
                    return (
                      <div
                        key={courier}
                        onClick={() => toggleCourier(courier)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? 'var(--accent-glow)' : 'var(--bg-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.18s ease'
                        }}
                      >
                        <span style={{ fontSize: '0.83rem', fontWeight: isSelected ? 600 : 400 }}>{courier}</span>
                        {isSelected && <Check size={14} style={{ color: 'var(--accent-primary)' }} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '8px' }}>
                  Payment Methods Accepted
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {getRegionalPaymentMethods(country).map(pm => {
                    const isSelected = selectedPayments.includes(pm);
                    return (
                      <div
                        key={pm}
                        onClick={() => togglePayment(pm)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: isSelected ? '1px solid var(--emerald)' : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? 'var(--emerald-bg)' : 'var(--bg-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.18s ease'
                        }}
                      >
                        <span style={{ fontSize: '0.83rem', fontWeight: isSelected ? 600 : 400 }}>{pm}</span>
                        {isSelected && <Check size={14} style={{ color: 'var(--emerald)' }} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Launch Choice Boxes */}
              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '10px' }}>
                  Select Initial Workspace State:
                </label>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  {/* Clean Slate Card (Primary) */}
                  <div
                    onClick={() => handleLaunch(false)}
                    style={{
                      padding: '18px 20px',
                      borderRadius: '14px',
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      border: '2px solid var(--emerald)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      boxShadow: '0 4px 20px -4px rgba(16, 185, 129, 0.25)',
                      transition: 'all 0.18s ease'
                    }}
                    className="hover-lift"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald)', fontWeight: 800, fontSize: '0.95rem' }}>
                      <Sparkles size={18} />
                      <span>Clean Slate (Recommended)</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                      Starts with an empty database. Ready to enter your live business data.
                    </p>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      style={{
                        marginTop: 'auto',
                        padding: '10px',
                        borderRadius: '9px',
                        backgroundColor: 'var(--emerald)',
                        color: '#fff',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Check size={15} />
                      <span>Start Clean Workspace</span>
                    </button>
                  </div>

                  {/* Sample Demo Data Card */}
                  <div
                    onClick={() => handleLaunch(true)}
                    style={{
                      padding: '18px 20px',
                      borderRadius: '14px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'all 0.18s ease'
                    }}
                    className="hover-lift"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: 700, fontSize: '0.95rem' }}>
                      <Layers size={18} style={{ color: 'var(--accent-primary)' }} />
                      <span>Load Sample Demo Data</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.45 }}>
                      Populates sample products, orders, and couriers for testing.
                    </p>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      style={{
                        marginTop: 'auto',
                        padding: '10px',
                        borderRadius: '9px',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-color)',
                        fontWeight: 600,
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>Explore Demo Mode</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div style={{
          padding: '18px 32px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                className="btn btn-secondary hover-lift"
                style={{ padding: '8px 16px', fontSize: '0.84rem' }}
              >
                Back
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !canProceedStep1) {
                    alert('Please enter your Business / Brand Name.');
                    return;
                  }
                  if (step === 2 && !canProceedStep2) {
                    alert('Please enter the Owner / Administrator Full Name.');
                    return;
                  }
                  setStep(prev => prev + 1);
                }}
                className="btn btn-primary hover-lift"
                style={{ padding: '9px 20px', fontSize: '0.88rem' }}
              >
                <span>Continue</span>
                <ArrowRight size={15} />
              </button>
            ) : null}
          </div>
        </div>

      </div>
    </div>
  );
};
