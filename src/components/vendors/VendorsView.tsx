import React, { useState } from 'react';
import { Factory, Phone, MapPin, Plus, DollarSign, Search, X, Printer, FileText, Edit, CheckCircle2, Truck } from 'lucide-react';
import type { Vendor } from '../../types/crm';
import { dbService } from '../../database/db';
import { getSegmentConfig } from '../../config/businessSegments';
import { useLocalization } from '../../i18n/LanguageContext';

interface VendorsViewProps {
  vendors: Vendor[];
  onOpenNewVendor: () => void;
  onLogVendorPayment: (vendorId: string, amount: number, method: string, notes: string) => void;
  onAddVendor?: (vendor: Vendor) => void;
  onUpdateVendor?: (vendor: Vendor) => void;
}

export const VendorsView: React.FC<VendorsViewProps> = ({
  vendors,
  onOpenNewVendor,
  onLogVendorPayment,
  onAddVendor,
  onUpdateVendor
}) => {
  const { currencySymbol } = useLocalization();
  const brandProfile = dbService.getBrandProfile();
  const currentSegment = getSegmentConfig(brandProfile?.business_type);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendorForPayment, setSelectedVendorForPayment] = useState<Vendor | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>(() => {
    const activePartners = dbService.getPaymentPartners().filter(p => p.is_active);
    return activePartners.length > 0 ? activePartners[0].name : 'Bank Transfer (City Bank)';
  });
  const [paymentNotes, setPaymentNotes] = useState<string>('Inventory procurement payment settlement');

  const [payoutInvoiceModal, setPayoutInvoiceModal] = useState<{
    vendor: Vendor;
    amount: number;
    method: string;
    notes: string;
    date: string;
    voucherId: string;
  } | null>(null);

  // Add Vendor Modal State
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorType, setNewVendorType] = useState(() => currentSegment.vendorCategories[0] || 'General Trade Supplier');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newBalance, setNewBalance] = useState<number>(0);

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName.trim() || !newPhone.trim()) {
      alert('Please fill in Vendor/Company Name and Contact Phone.');
      return;
    }
    const newVendor: Vendor = {
      id: `vend-${Date.now()}`,
      vendor_name: newVendorName.trim(),
      name: newVendorName.trim(),
      vendor_type: newVendorType,
      type: newVendorType,
      contact_person: newContactPerson.trim() || 'Representative',
      phone: newPhone.trim(),
      address: newAddress.trim() || 'Commercial District, Central Office',
      total_billed_bdt: Number(newBalance) || 0,
      total_paid_bdt: 0,
      balance_due_bdt: Number(newBalance) || 0,
      outstanding_balance_bdt: Number(newBalance) || 0
    };
    dbService.saveVendor(newVendor);
    if (onAddVendor) {
      onAddVendor(newVendor);
    } else {
      onOpenNewVendor(); // trigger external refresh check
    }
    setIsAddVendorOpen(false);
    setNewVendorName('');
    setNewContactPerson('');
    setNewPhone('');
    setNewAddress('');
    setNewBalance(0);
  };

  // Edit Vendor Modal State
  const [isEditVendorOpen, setIsEditVendorOpen] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<string>('');
  const [editVendorName, setEditVendorName] = useState('');
  const [editVendorType, setEditVendorType] = useState('Fabric Supplier / Textile Mill');
  const [editContactPerson, setEditContactPerson] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editBalance, setEditBalance] = useState<number>(0);

  const openEditModal = (vendor: Vendor) => {
    setEditingVendorId(vendor.id);
    setEditVendorName(vendor.vendor_name || vendor.name || '');
    setEditVendorType(vendor.vendor_type || vendor.type || 'Fabric Supplier / Textile Mill');
    setEditContactPerson(vendor.contact_person || 'Representative');
    setEditPhone(vendor.phone || '');
    setEditAddress(vendor.address || '');
    setEditBalance(vendor.balance_due_bdt || vendor.outstanding_balance_bdt || 0);
    setIsEditVendorOpen(true);
  };

  const handleSelectVendorToEdit = (id: string) => {
    const v = vendors.find(item => item.id === id);
    if (v) {
      openEditModal(v);
    }
  };

  const handleUpdateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editVendorName.trim() || !editPhone.trim()) {
      alert('Please fill in Vendor/Company Name and Contact Phone.');
      return;
    }
    const current = vendors.find(item => item.id === editingVendorId);
    if (!current) return;

    const updatedVendor: Vendor = {
      ...current,
      vendor_name: editVendorName.trim(),
      name: editVendorName.trim(),
      vendor_type: editVendorType as any,
      type: editVendorType,
      contact_person: editContactPerson.trim() || 'Representative',
      phone: editPhone.trim(),
      address: editAddress.trim() || 'Commercial District, Central Office',
      balance_due_bdt: Number(editBalance) || 0,
      outstanding_balance_bdt: Number(editBalance) || 0
    };

    dbService.updateVendor(updatedVendor);
    if (onUpdateVendor) {
      onUpdateVendor(updatedVendor);
    } else if (onAddVendor) {
      onAddVendor(updatedVendor);
    } else {
      onOpenNewVendor();
    }
    setIsEditVendorOpen(false);
  };

  const filteredVendors = vendors.filter(v => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = v.vendor_name || v.name || '';
      const type = v.vendor_type || v.type || '';
      const contact = v.contact_person || v.phone || '';
      return name.toLowerCase().includes(q) || type.toLowerCase().includes(q) || contact.toLowerCase().includes(q);
    }
    return true;
  });

  const totalOutstandingPayables = vendors.reduce((sum, v) => sum + (v.balance_due_bdt || v.outstanding_balance_bdt || 0), 0);
  const totalPaidPayables = vendors.reduce((sum, v) => sum + (v.total_paid_bdt || 0), 0);

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForPayment || !paymentAmount || paymentAmount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }
    onLogVendorPayment(selectedVendorForPayment.id, Number(paymentAmount), paymentMethod, paymentNotes);
    setSelectedVendorForPayment(null);
    alert(`Vendor payment of ${currencySymbol}${paymentAmount.toLocaleString()} recorded to ${selectedVendorForPayment.vendor_name || selectedVendorForPayment.name} and posted to ledger.`);
  };

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 className="brand-font" style={{ fontSize: '1.75rem', fontWeight: 700 }}>Vendor & Supplier Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Manage suppliers, purchase orders, and payable balances.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => {
              if (vendors.length === 0) {
                alert('No vendors available to edit.');
                return;
              }
              const target = selectedVendorForPayment || vendors[0];
              openEditModal(target);
            }}
            className="btn btn-secondary hover-lift"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px' }}
          >
            <Edit size={16} style={{ color: '#A5B4FC' }} />
            <span>Edit Vendor</span>
          </button>
          <button onClick={() => setIsAddVendorOpen(true)} className="btn btn-primary hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px' }}>
            <Plus size={16} />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>Total Active Suppliers</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '6px', color: 'var(--text-main)' }}>{vendors.length} Registered</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Active supplier profiles</div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--ruby)', fontWeight: 600, textTransform: 'uppercase' }}>Total Outstanding Payables</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '6px', color: 'var(--ruby)' }}>
            {currencySymbol}{totalOutstandingPayables.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ruby)', marginTop: '4px' }}>Due to suppliers</div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--emerald)', fontWeight: 600, textTransform: 'uppercase' }}>Total Purchases Settled</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '6px', color: 'var(--emerald)' }}>
            {currencySymbol}{totalPaidPayables.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Paid disbursements</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, backgroundColor: 'var(--bg-primary)', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <Search size={16} style={{ color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Search vendor name, contact person, or phone number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none', width: '100%' }}
          />
        </div>
      </div>

      {/* Vendor Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {vendors.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 20px', color: 'var(--text-dim)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Truck size={28} style={{ color: 'var(--accent-primary)', opacity: 0.8 }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '6px', color: 'var(--text-main)' }}>No vendors added yet</div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 18px' }}>
              Add vendors and suppliers to track procurement and balances.
            </div>
            <button onClick={() => setIsAddVendorOpen(true)} className="btn btn-primary hover-lift" style={{ padding: '9px 20px', fontSize: '0.86rem' }}>
              <Plus size={16} />
              <span>Add First Vendor</span>
            </button>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No suppliers match your search query.
          </div>
        ) : (
          filteredVendors.map(vendor => {
            const initials = (vendor.vendor_name || vendor.name || 'V')
              .split(' ')
              .filter(Boolean)
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            const bal = vendor.balance_due_bdt || vendor.outstanding_balance_bdt || 0;

            return (
              <div
                key={vendor.id}
                className="glass-card hover-lift"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="avatar-circle" style={{ width: '36px', height: '36px', fontSize: '0.8rem', backgroundColor: 'var(--bg-primary)', color: 'var(--accent-primary)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
                      {initials}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>{vendor.vendor_name || vendor.name}</h4>
                      <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '1px 6px', marginTop: '3px', display: 'inline-block' }}>{vendor.vendor_type || vendor.type}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.81rem', color: 'var(--text-muted)', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={13} style={{ color: 'var(--text-dim)' }} />
                    <span>Contact: <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>{vendor.contact_person || 'Rep'} ({vendor.phone})</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={13} style={{ color: 'var(--text-dim)' }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '270px' }}>{vendor.address}</span>
                  </div>
                </div>

                {/* Outstanding Balance Box (Linear style) */}
                <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Payables</div>
                    <div style={{ fontSize: '1.08rem', fontWeight: 800, color: bal > 0 ? 'var(--ruby)' : 'var(--emerald)', fontFamily: 'monospace' }}>
                      {currencySymbol}{bal.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => openEditModal(vendor)}
                      className="btn btn-secondary hover-lift"
                      style={{ padding: '6px 11px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                      title="Edit Vendor Name, Address & Contact Info"
                    >
                      <Edit size={13} style={{ color: '#A5B4FC' }} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVendorForPayment(vendor);
                        setPaymentAmount(bal || 10000);
                        const activePartners = dbService.getPaymentPartners().filter(p => p.is_active);
                        if (activePartners.length > 0 && !activePartners.some(p => p.name === paymentMethod)) {
                          setPaymentMethod(activePartners[0].name);
                        }
                      }}
                      className="btn btn-primary"
                      style={{ padding: '6px 11px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      <DollarSign size={13} />
                      <span>Log Payout</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Log Payment Modal */}
      {selectedVendorForPayment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }} onClick={() => setSelectedVendorForPayment(null)}>
          <div onClick={e => e.stopPropagation()} className="glass-card" style={{ width: '520px', padding: '24px', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 className="brand-font" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: '#A5B4FC' }}>
              Record Payment to {selectedVendorForPayment.vendor_name || selectedVendorForPayment.name}
            </h3>

            <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Payment Amount (BDT)</label>
                <input
                  type="number"
                  min={1}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Payment Channel / Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                >
                  {(() => {
                    const activePartners = dbService.getPaymentPartners().filter(p => p.is_active);
                    if (activePartners.length > 0) {
                      return activePartners.map(p => (
                        <option key={p.id} value={p.name}>
                          {p.name} {p.account_number ? `(${p.account_number})` : ''}
                        </option>
                      ));
                    }
                    return (
                      <>
                        <option value="Bank Transfer (City Bank)">Bank Transfer (City Bank)</option>
                        <option value="Bank Transfer (BRAC Bank)">Bank Transfer (BRAC Bank)</option>
                        <option value="bKash Merchant Account">bKash Merchant Account</option>
                        <option value="Cash Cheque / Showroom Cash">Cash Cheque / Showroom Cash</option>
                      </>
                    );
                  })()}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Accounting Notes / Batch Reference</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setSelectedVendorForPayment(null)} className="btn btn-secondary">Cancel</button>
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedVendorForPayment) return;
                    setPayoutInvoiceModal({
                      vendor: selectedVendorForPayment,
                      amount: paymentAmount || 0,
                      method: paymentMethod,
                      notes: paymentNotes || `Vendor ledger settlement for ${selectedVendorForPayment.vendor_name || selectedVendorForPayment.name}`,
                      date: new Date().toLocaleDateString('en-GB'),
                      voucherId: `VP-${Date.now().toString().slice(-6)}`
                    });
                  }}
                  className="btn btn-secondary hover-lift"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #6366F1', color: '#C7D2FE', padding: '10px 14px' }}
                  title="Print Payout Voucher & Ledger Invoice"
                >
                  <Printer size={15} />
                  <span>Print Payout Voucher</span>
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>Confirm Payment Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Vendor Profile Modal */}
      {isAddVendorOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }} className="animate-fade-in" onClick={() => setIsAddVendorOpen(false)}>
          <div onClick={e => e.stopPropagation()} className="glass-card" style={{ width: '560px', padding: '28px', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Factory size={24} style={{ color: 'var(--accent-primary)' }} />
                <h3 className="brand-font" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                  Create New Vendor / Supplier Profile
                </h3>
              </div>
              <button onClick={() => setIsAddVendorOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Vendor / Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Prime Wholesale Distributors or Pathao Courier Ltd."
                  value={newVendorName}
                  onChange={e => setNewVendorName(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.92rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Vendor Type / Category</label>
                  <select
                    value={newVendorType}
                    onChange={e => setNewVendorType(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                  >
                    {currentSegment.vendorCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="Other Business Vendor">Other Business Vendor</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Contact Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 01711-887766"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.92rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Contact Person / Designation</label>
                  <input
                    type="text"
                    placeholder="e.g., Md. Rafiq (Manager)"
                    value={newContactPerson}
                    onChange={e => setNewContactPerson(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.92rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Opening Payables ({currencySymbol})</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={newBalance}
                    onChange={e => setNewBalance(parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.92rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Factory / Office Address</label>
                <input
                  type="text"
                  placeholder="e.g., Plot 12, BSCIC Industrial Area, Narayanganj or Mirpur-10, Dhaka"
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.92rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsAddVendorOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary hover-lift" style={{ padding: '11px 22px' }}>
                  <Plus size={16} /> Save Vendor Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vendor Profile Modal */}
      {isEditVendorOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }} className="animate-fade-in" onClick={() => setIsEditVendorOpen(false)}>
          <div
            onClick={e => e.stopPropagation()}
            className="glass-card"
            style={{ width: '580px', backgroundColor: 'var(--bg-secondary)', overflow: 'hidden' }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Edit size={20} style={{ color: '#A5B4FC' }} />
                <h3 className="brand-font" style={{ fontSize: '1.2rem', fontWeight: 700 }}>Edit Vendor Profile & Payables</h3>
              </div>
              <button onClick={() => setIsEditVendorOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateVendor} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  Select Vendor / Factory to Edit
                </label>
                <select
                  value={editingVendorId}
                  onChange={e => handleSelectVendorToEdit(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--accent-primary)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', fontWeight: 600 }}
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.vendor_name || v.name} ({v.vendor_type || v.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Vendor / Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Prime Wholesale Distributors"
                  value={editVendorName}
                  onChange={e => setEditVendorName(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.92rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Vendor Type / Category</label>
                  <select
                    value={editVendorType}
                    onChange={e => setEditVendorType(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                  >
                    {currentSegment.vendorCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    {!currentSegment.vendorCategories.includes(editVendorType) && (
                      <option value={editVendorType}>{editVendorType}</option>
                    )}
                    <option value="Other Business Vendor">Other Business Vendor</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Contact Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 01711-887766"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.92rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Contact Person / Designation</label>
                  <input
                    type="text"
                    placeholder="e.g., Md. Rafiq (Manager)"
                    value={editContactPerson}
                    onChange={e => setEditContactPerson(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.92rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Pending Payables ({currencySymbol})</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={editBalance}
                    onChange={e => setEditBalance(parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.92rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Factory / Office Address</label>
                <input
                  type="text"
                  placeholder="e.g., Plot 12, BSCIC Industrial Area, Narayanganj or Mirpur-10, Dhaka"
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.92rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsEditVendorOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary hover-lift" style={{ padding: '11px 22px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Vendor Payout & Ledger Settlement Voucher Modal */}
      {payoutInvoiceModal && (() => {
        const vendor = payoutInvoiceModal.vendor;
        const bal = vendor.balance_due_bdt || vendor.outstanding_balance_bdt || 0;
        const remainingAfter = Math.max(0, bal - payoutInvoiceModal.amount);

        // Helper to convert number to words (International Standard)
        const amountToWords = (num: number): string => {
          if (num === 0) return 'Zero Only';
          const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
          const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
          const convertLess1000 = (n: number): string => {
            if (n === 0) return '';
            if (n < 20) return units[n];
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + units[n % 10] : '');
            return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLess1000(n % 100) : '');
          };
          let result = '';
          if (num >= 1000000000) {
            result += convertLess1000(Math.floor(num / 1000000000)) + ' Billion ';
            num %= 1000000000;
          }
          if (num >= 1000000) {
            result += convertLess1000(Math.floor(num / 1000000)) + ' Million ';
            num %= 1000000;
          }
          if (num >= 1000) {
            result += convertLess1000(Math.floor(num / 1000)) + ' Thousand ';
            num %= 1000;
          }
          if (num > 0) {
            result += convertLess1000(num);
          }
          return result.trim() + ' Only';
        };

        return (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(10, 15, 30, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px'
          }} onClick={() => setPayoutInvoiceModal(null)}>
            <style>{`
              @page {
                size: A4 portrait;
                margin: 8mm !important;
              }
              @media print {
                body * :not(#printable-vendor-payout-content):not(#printable-vendor-payout-content *):not(:has(#printable-vendor-payout-content)) {
                  display: none !important;
                }
                html, body, #root, .app-container, main,
                div:has(#printable-vendor-payout-content) {
                  display: block !important;
                  position: static !important;
                  transform: none !important;
                  filter: none !important;
                  backdrop-filter: none !important;
                  -webkit-backdrop-filter: none !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  border: none !important;
                  box-shadow: none !important;
                  background: transparent !important;
                  height: 0 !important;
                  max-height: 0 !important;
                  overflow: visible !important;
                  width: 100% !important;
                }
                #printable-vendor-payout-content, #printable-vendor-payout-content * {
                  visibility: visible !important;
                  box-sizing: border-box !important;
                }
                #printable-vendor-payout-content {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  right: auto !important;
                  bottom: auto !important;
                  width: 100% !important;
                  max-width: 210mm !important;
                  height: auto !important;
                  min-height: 0 !important;
                  max-height: none !important;
                  margin: 0 !important;
                  padding: 6mm 10mm !important;
                  background: #FFFFFF !important;
                  color: #000000 !important;
                  box-shadow: none !important;
                  border: none !important;
                  z-index: 999999999 !important;
                  display: block !important;
                  overflow: visible !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .no-print, .no-print * {
                  display: none !important;
                  visibility: hidden !important;
                }
              }
            `}</style>

            <div onClick={e => e.stopPropagation()} style={{
              width: '840px',
              maxHeight: '96vh',
              overflow: 'hidden',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'Inter, sans-serif'
            }}>
              {/* Modal Control Header (no-print) - Sticky Top */}
              <div className="no-print" style={{
                padding: '16px 24px',
                borderBottom: '2px solid #6366F1',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#0F172A',
                zIndex: 100,
                flex: '0 0 auto',
                minHeight: '68px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={22} style={{ color: '#818CF8' }} />
                  <div>
                    <div className="brand-font" style={{ fontWeight: 800, fontSize: '1.1rem', color: '#F8FAFC' }}>
                      Vendor Payout & Ledger Settlement Voucher Preview (1-Page A4)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                      Click the Print button below to generate A4 PDF or print physical copy
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button
                    onClick={() => window.print()}
                    className="btn btn-primary hover-lift pulse-alert"
                    style={{ padding: '10px 22px', fontSize: '0.96rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#4F46E5', color: '#FFFFFF', border: '2px solid #818CF8', borderRadius: '10px', cursor: 'pointer' }}
                  >
                    <Printer size={18} />
                    <span>𖠿 Print A4 Invoice</span>
                  </button>
                  <button
                    onClick={() => setPayoutInvoiceModal(null)}
                    className="btn btn-secondary"
                    style={{ padding: '10px 14px', cursor: 'pointer' }}
                    title="Close Preview"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Printable Content Area - Exactly matches A4 format */}
              <div id="printable-vendor-payout-content" style={{
                padding: '36px 40px',
                overflowY: 'auto',
                flex: 1,
                backgroundColor: '#FFFFFF',
                color: '#111827',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                fontFamily: 'Inter, -apple-system, sans-serif'
              }}>
                {/* Secondary On-Screen Action Bar inside scroll area so it is never missed */}
                <div className="no-print" style={{
                  marginBottom: '24px',
                  padding: '14px 18px',
                  backgroundColor: '#EEF2FF',
                  border: '1.5px solid #6366F1',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '0.9rem', color: '#312E81', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Printer size={18} style={{ color: '#4F46E5' }} />
                    <span>Ready to Print: Formatted & Aligned for A4 Paper Size</span>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="btn btn-primary hover-lift"
                    style={{ padding: '8px 18px', fontSize: '0.9rem', fontWeight: 800, backgroundColor: '#4F46E5', color: '#FFFFFF', border: '1px solid #4338CA', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Printer size={16} />
                    <span>Click Here to Print (A4 Format)</span>
                  </button>
                </div>

                <div>
                  {/* Top Header Block matching input_file_6.png */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                      <h1 style={{ margin: 0, fontSize: '2.4rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                        PAYOUT VOUCHER
                      </h1>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827', marginTop: '6px', letterSpacing: '0.01em' }}>
                        Ref: {payoutInvoiceModal.voucherId}
                      </div>
                    </div>

                    {/* Logo / Brand Box on Top Right */}
                    <div style={{
                      backgroundColor: '#F9FAFB',
                      border: '1px solid #F3F4F6',
                      borderRadius: '8px',
                      padding: '12px 20px',
                      textAlign: 'right'
                    }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>
                        {(() => { const p = dbService.getBrandProfile(); return (p?.brand_name || 'PROBAHO CRM SOLUTIONS').toUpperCase(); })()}
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4F46E5', letterSpacing: '0.04em', marginTop: '2px' }}>
                        VENDOR & LEDGER DIVISION
                      </div>
                    </div>
                  </div>

                  {/* Top Horizontal Divider */}
                  <div style={{ borderTop: '1px solid #D1D5DB', width: '100%' }} />

                  {/* 3-Column Bill From / Bill To / Date Info Block matching input_file_6.png */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    padding: '18px 0',
                    borderBottom: '1px solid #D1D5DB',
                    marginBottom: '28px'
                  }}>
                    {/* Col 1: Bill From / Issued By */}
                    <div style={{ paddingRight: '16px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                        PAY FROM (ISSUER):
                      </div>
                      <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
                        {(() => { const p = dbService.getBrandProfile(); return p?.brand_name || 'PROBAHO CRM SOLUTIONS'; })()}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#4B5563', lineHeight: 1.45 }}>
                        {(() => { const p = dbService.getBrandProfile(); return p?.address || 'Corporate Headquarters'; })()}<br />
                        VAT/BIN: {(() => { const p = dbService.getBrandProfile(); return p?.vat_bin || '001234567-0101'; })()}
                      </div>
                    </div>

                    {/* Col 2: Bill To / Vendor */}
                    <div style={{ padding: '0 16px', borderLeft: '1px solid #E5E7EB' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                        PAY TO (VENDOR / FACTORY):
                      </div>
                      <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
                        {vendor.vendor_name || vendor.name}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#4B5563', lineHeight: 1.45 }}>
                        Category: <strong style={{ color: '#374151' }}>{vendor.vendor_type || vendor.type}</strong><br />
                        Contact: {vendor.contact_person || 'Representative'} ({vendor.phone})<br />
                        {vendor.address || 'Commercial District'}
                      </div>
                    </div>

                    {/* Col 3: Dates & Payment Method */}
                    <div style={{ paddingLeft: '16px', borderLeft: '1px solid #E5E7EB' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                        PAYOUT DATE:
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#111827', marginBottom: '14px' }}>
                        {payoutInvoiceModal.date}
                      </div>

                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                        PAYMENT CHANNEL:
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#111827' }}>
                        {payoutInvoiceModal.method}
                      </div>
                    </div>
                  </div>

                  {/* Table matching exact input_file_6.png layout */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #D1D5DB', textAlign: 'left' }}>
                        <th style={{ padding: '10px 0', fontSize: '0.82rem', fontWeight: 800, color: '#111827', width: '55%' }}>Description & Ledger Settlement Reference</th>
                        <th style={{ padding: '10px 12px', fontSize: '0.82rem', fontWeight: 800, color: '#111827', width: '25%' }}>Payment Channel</th>
                        <th style={{ padding: '10px 0', fontSize: '0.82rem', fontWeight: 800, color: '#111827', textAlign: 'right', width: '20%' }}>Amount (BDT)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '14px 0', fontSize: '0.88rem', color: '#111827', fontWeight: 600 }}>
                          {payoutInvoiceModal.notes || `Ledger settlement & payout invoice for ${vendor.vendor_name || vendor.name}`}
                        </td>
                        <td style={{ padding: '14px 12px', fontSize: '0.88rem', color: '#4B5563', fontWeight: 500 }}>
                          {payoutInvoiceModal.method}
                        </td>
                        <td style={{ padding: '14px 0', fontSize: '0.92rem', fontWeight: 800, color: '#111827', textAlign: 'right' }}>
                          {currencySymbol}{payoutInvoiceModal.amount.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Right-Aligned Totals Section matching input_file_6.png */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
                    <div style={{ width: '280px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #E5E7EB', fontSize: '0.86rem', color: '#4B5563' }}>
                        <span>Logged Payout:</span>
                        <strong style={{ color: '#111827' }}>{currencySymbol}{payoutInvoiceModal.amount.toLocaleString()}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #E5E7EB', fontSize: '0.86rem', color: '#4B5563' }}>
                        <span>Prior Ledger Balance:</span>
                        <strong style={{ color: '#EF4444' }}>{currencySymbol}{bal.toLocaleString()}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #E5E7EB', fontSize: '0.86rem', color: '#4B5563' }}>
                        <span>Remaining Balance Due:</span>
                        <strong style={{ color: remainingAfter > 0 ? '#DC2626' : '#059669' }}>{currencySymbol}{remainingAfter.toLocaleString()} {remainingAfter === 0 && '(Settled)'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #111827', marginTop: '4px', fontSize: '1.05rem', fontWeight: 900, color: '#111827' }}>
                        <span>Total Paid:</span>
                        <span>{currencySymbol}{payoutInvoiceModal.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Left-Aligned Payment & Policy Information matching input_file_6.png */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
                      Payment Information & Audit Verification:
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#4B5563', lineHeight: 1.6 }}>
                      <div><strong>Amount in Words:</strong> {amountToWords(payoutInvoiceModal.amount)}</div>
                      <div>1. This voucher serves as official proof of payment for vendor/supplier accounts reconciliation and audit verification.</div>
                      <div>2. Any discrepancies regarding payment records or outstanding balances must be communicated to the accounts department within 3 business days.</div>
                    </div>
                  </div>

                  {/* Signatures Line above bottom block */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '24px',
                    marginTop: '28px',
                    paddingTop: '16px',
                    borderTop: '1px dashed #D1D5DB',
                    fontSize: '0.78rem',
                    color: '#6B7280'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ height: '20px' }} />
                      <div style={{ borderTop: '1px solid #6B7280', paddingTop: '6px', fontWeight: 600 }}>Prepared By ({(() => { const p = dbService.getBrandProfile(); return p?.brand_name || 'Accounts Officer'; })()})</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ height: '20px' }} />
                      <div style={{ borderTop: '1px solid #6B7280', paddingTop: '6px', fontWeight: 600 }}>Verified & Approved By</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ height: '20px' }} />
                      <div style={{ borderTop: '1px solid #6B7280', paddingTop: '6px', fontWeight: 600 }}>Payee Signature & Factory Seal</div>
                    </div>
                  </div>
                </div>

                {/* Bottom Full-Width Banner matching input_file_6.png ("Thank you for your business!") */}
                <div style={{
                  marginTop: '32px',
                  backgroundColor: '#F3F4F6',
                  padding: '12px 20px',
                  borderRadius: '6px',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  color: '#1F2937',
                  textAlign: 'left'
                }}>
                  Thank you for your business with {(() => { const p = dbService.getBrandProfile(); return (p?.brand_name || 'PROBAHO CRM SOLUTIONS').toUpperCase(); })()}!
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
