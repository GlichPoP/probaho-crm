import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Trash2, Check, Sliders, Image as ImageIcon, Building2, Shield } from 'lucide-react';
import type { BrandProfile } from '../../types/crm';
import { dbService } from '../../database/db';
import { processBrandLogoFile } from '../../utils/imageUtils';

interface DefaultInvoiceEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand?: BrandProfile;
  onSave?: (updated: BrandProfile) => void;
  onSaved?: () => void;
}

export const DefaultInvoiceEditorModal: React.FC<DefaultInvoiceEditorModalProps> = ({
  isOpen,
  onClose,
  brand,
  onSave,
  onSaved
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentBrand = brand || dbService.getBrandProfile();

  const [brandName, setBrandName] = useState(currentBrand.brand_name || '');
  const [phone, setPhone] = useState(currentBrand.phone || '');
  const [address, setAddress] = useState(currentBrand.address || '');
  const [vatBin, setVatBin] = useState(currentBrand.vat_bin || '');
  const [email, setEmail] = useState(currentBrand.email || 'care@business.com');
  const [website, setWebsite] = useState(currentBrand.website || 'www.business.com');
  const [logoUrl, setLogoUrl] = useState<string>(currentBrand.logo_url || '');

  useEffect(() => {
    const b = brand || dbService.getBrandProfile();
    setBrandName(b.brand_name || '');
    setPhone(b.phone || '');
    setAddress(b.address || '');
    setVatBin(b.vat_bin || '');
    setEmail(b.email || 'care@business.com');
    setWebsite(b.website || 'www.business.com');
    setLogoUrl(b.logo_url || '');
    if (b.default_invoice_title) setDefaultTitle(b.default_invoice_title);
    if (b.default_invoice_terms) setDefaultTerms(b.default_invoice_terms);
    if (b.default_invoice_footer) setDefaultFooter(b.default_invoice_footer);
    if (b.default_invoice_notes) setDefaultNotes(b.default_invoice_notes);
  }, [brand, isOpen]);

  const [defaultTitle, setDefaultTitle] = useState(
    currentBrand.default_invoice_title || 'RETAIL INVOICE & DELIVERY CHALLAN'
  );
  const [defaultTerms, setDefaultTerms] = useState(
    currentBrand.default_invoice_terms ||
    '1. Please inspect the parcel and verify item condition upon delivery.\n2. In case of any discrepancies or exchange requests, contact our customer support within 48 hours.\n3. Items must remain unused with original tags and packaging intact for returns or exchanges.'
  );
  const [defaultFooter, setDefaultFooter] = useState(
    currentBrand.default_invoice_footer || `Thank you for your business!`
  );
  const [defaultNotes, setDefaultNotes] = useState(currentBrand.default_invoice_notes || '');

  const [isProcessingLogo, setIsProcessingLogo] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setIsProcessingLogo(true);
    try {
      const result = await processBrandLogoFile(file);
      setLogoUrl(result.dataUrl);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process logo image.');
    } finally {
      setIsProcessingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: BrandProfile = {
      ...currentBrand,
      brand_name: brandName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      vat_bin: vatBin.trim(),
      email: email.trim(),
      website: website.trim(),
      logo_url: logoUrl,
      default_invoice_title: defaultTitle.trim(),
      default_invoice_terms: defaultTerms.trim(),
      default_invoice_footer: defaultFooter.trim(),
      default_invoice_notes: defaultNotes.trim()
    };

    dbService.saveBrandProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      if (onSave) onSave(updated);
      if (onSaved) onSaved();
      onClose();
    }, 600);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 110,
        padding: '16px'
      }}
      className="animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="glass-card"
        style={{
          width: '780px',
          maxHeight: '94vh',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--accent-primary), #8B5CF6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <Sliders size={22} />
            </div>
            <div>
              <h3 className="brand-font" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Default Invoice Template & Logo Settings
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Default layout applied to all printed A4 invoices.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Logo Upload Section */}
          <div
            style={{
              padding: '18px 20px',
              borderRadius: '14px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={18} style={{ color: 'var(--accent-primary)' }} />
                  <span>Company / Brand Logo for A4 Invoices</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  Supports SVG, PNG, JPG, WEBP. Auto-scaled for A4 prints.
                </div>
              </div>

              {logoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.78rem', color: 'var(--ruby)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  <Trash2 size={14} />
                  <span>Remove Logo</span>
                </button>
              )}
            </div>

            {uploadError && (
              <div style={{ fontSize: '0.82rem', color: 'var(--ruby)', padding: '6px 10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>
                {uploadError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Logo Preview Container */}
              <div
                style={{
                  width: '240px',
                  height: '80px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  border: '1.5px dashed #CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 14px',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)'
                }}
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Brand Logo"
                    style={{
                      maxHeight: '64px',
                      maxWidth: '210px',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#94A3B8' }}>
                    <ImageIcon size={24} style={{ opacity: 0.6, margin: '0 auto 4px' }} />
                    <div style={{ fontSize: '0.72rem', fontWeight: 600 }}>No Logo Uploaded</div>
                  </div>
                )}
              </div>

              {/* Upload Action */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingLogo}
                  className="btn btn-secondary hover-lift"
                  style={{ padding: '9px 16px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Upload size={16} style={{ color: 'var(--accent-primary)' }} />
                  <span>{isProcessingLogo ? 'Auto-scaling Logo...' : logoUrl ? 'Replace Brand Logo' : 'Upload Brand Logo'}</span>
                </button>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                  Standard A4 Header Dimensions: Max 200×65px (Aspect ratio preserved)
                </div>
              </div>
            </div>
          </div>

          {/* Company Information Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={16} style={{ color: 'var(--accent-primary)' }} />
              <span>Issuer / Showroom Information</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                  Brand / Showroom Name *
                </label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  placeholder="e.g. YOUR COMPANY / BRAND NAME"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                  Hotline / WhatsApp Helpline *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. +880 1711-223344"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                  VAT / BIN Number (Optional)
                </label>
                <input
                  type="text"
                  value={vatBin}
                  onChange={e => setVatBin(e.target.value)}
                  placeholder="BIN: 001294821-0101"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                  Support Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="care@yourbusiness.com"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                  Official Website URL
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="www.yourbusiness.com"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                Showroom & Dispatch Warehouse Address *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="House 42, Road 11, Block D, Banani, Dhaka-1213"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          {/* Invoice Structure & Default Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={16} style={{ color: 'var(--emerald)' }} />
              <span>Default Invoice Text, Policy & Footer</span>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                Default Invoice Header Title
              </label>
              <input
                type="text"
                value={defaultTitle}
                onChange={e => setDefaultTitle(e.target.value)}
                placeholder="RETAIL INVOICE & DELIVERY CHALLAN"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                Default Return & Exchange Policy Terms
              </label>
              <textarea
                rows={3}
                value={defaultTerms}
                onChange={e => setDefaultTerms(e.target.value)}
                placeholder="Write standard return / exchange policy terms here..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.84rem', lineHeight: 1.45, resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                  Default Footer Banner Note
                </label>
                <input
                  type="text"
                  value={defaultFooter}
                  onChange={e => setDefaultFooter(e.target.value)}
                  placeholder="Thank you for shopping with us!"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                  Default Special Instructions / Notes
                </label>
                <input
                  type="text"
                  value={defaultNotes}
                  onChange={e => setDefaultNotes(e.target.value)}
                  placeholder="e.g. Keep cash ready for delivery rider"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem' }}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-color)'
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--emerald)', fontWeight: 600 }}>
              {saveSuccess ? '✔ Default Template Saved Successfully!' : ''}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ padding: '9px 18px', fontSize: '0.84rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary hover-lift"
                style={{ padding: '9px 22px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Check size={16} />
                <span>Save Default Template</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
