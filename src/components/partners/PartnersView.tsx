import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Truck, CreditCard, Plus, Trash2, CheckCircle2, 
  XCircle, Search, Phone, 
  ToggleLeft, ToggleRight, Edit, Save, X
} from 'lucide-react';
import type { DeliveryPartner, PaymentPartner, UserAccount } from '../../types/crm';
import { dbService } from '../../database/db';
import { useLocalization } from '../../i18n/LanguageContext';
import { getRegionalCouriers, getRegionalPaymentPartnerTemplates } from '../../config/regionalPresets';

interface PartnersViewProps {
  currentUser: UserAccount;
}

// Shared inline edit input style
const inlineInputStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: '8px',
  backgroundColor: 'var(--bg-hover)',
  border: '1px solid var(--accent-primary)',
  color: 'var(--text-main)',
  fontSize: '0.85rem',
  width: '100%',
  outline: 'none',
};

const inlineSelectStyle: React.CSSProperties = {
  ...inlineInputStyle,
  cursor: 'pointer',
};

export const PartnersView: React.FC<PartnersViewProps> = ({ currentUser }) => {
  const { currencySymbol, currentCountryConfig } = useLocalization();
  const currentCountry = currentCountryConfig?.code || 'BD';
  const courierPresets = getRegionalCouriers(currentCountry);
  const paymentTemplates = getRegionalPaymentPartnerTemplates(currentCountry);

  const [activeSubTab, setActiveSubTab] = useState<'delivery' | 'payment'>('delivery');
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);
  const [paymentPartners, setPaymentPartners] = useState<PaymentPartner[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Inline editing state
  const [editingDeliveryId, setEditingDeliveryId] = useState<string | null>(null);
  const [editDelivery, setEditDelivery] = useState<{ type: string; base_rate_dhaka: number; base_rate_outside: number; contact_phone: string; name: string }>({ type: '', base_rate_dhaka: 0, base_rate_outside: 0, contact_phone: '', name: '' });

  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editPayment, setEditPayment] = useState<{ channel_type: string; account_number: string; settlement_charge: string; name: string }>({ channel_type: '', account_number: '', settlement_charge: '', name: '' });

  // Add Delivery Modal State
  const [isAddDeliveryOpen, setIsAddDeliveryOpen] = useState(false);
  const [deliveryName, setDeliveryName] = useState('');
  const [deliveryType, setDeliveryType] = useState('API Integrated COD Courier');
  const [rateDhaka, setRateDhaka] = useState(courierPresets[0]?.baseRateLocal ?? 70);
  const [rateOutside, setRateOutside] = useState(courierPresets[0]?.baseRateNational ?? 130);
  const [contactPhone, setContactPhone] = useState('');

  // Add Payment Modal State
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [paymentName, setPaymentName] = useState('');
  const [channelType, setChannelType] = useState(currentCountry === 'BD' ? 'Mobile Financial Service (MFS)' : 'Payment Gateway');
  const [accountNo, setAccountNo] = useState('');
  const [settlementCharge, setSettlementCharge] = useState(paymentTemplates[0]?.settlementCharge ?? '0% Fee');

  const refreshData = () => {
    setDeliveryPartners([...dbService.getDeliveryPartners()]);
    setPaymentPartners([...dbService.getPaymentPartners()]);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // --- Delivery Partner handlers ---
  const handleAddDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryName.trim()) return;
    dbService.addDeliveryPartner({
      name: deliveryName.trim(),
      type: deliveryType,
      base_rate_dhaka: Number(rateDhaka) || 70,
      base_rate_outside: Number(rateOutside) || 130,
      contact_phone: contactPhone.trim() || 'N/A',
      is_active: true
    }, currentUser.name);
    setDeliveryName('');
    setContactPhone('');
    setIsAddDeliveryOpen(false);
    refreshData();
  };

  const handleToggleDelivery = (id: string) => {
    dbService.toggleDeliveryPartnerStatus(id, currentUser.name);
    refreshData();
  };

  const handleRemoveDelivery = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove delivery partner "${name}"?`)) {
      dbService.removeDeliveryPartner(id, currentUser.name);
      refreshData();
    }
  };

  const startEditDelivery = (partner: DeliveryPartner) => {
    setEditingDeliveryId(partner.id);
    setEditDelivery({
      name: partner.name,
      type: partner.type,
      base_rate_dhaka: partner.base_rate_dhaka || 70,
      base_rate_outside: partner.base_rate_outside || 130,
      contact_phone: partner.contact_phone || '',
    });
  };

  const saveEditDelivery = () => {
    if (!editingDeliveryId) return;
    dbService.updateDeliveryPartner(editingDeliveryId, {
      name: editDelivery.name,
      type: editDelivery.type,
      base_rate_dhaka: Number(editDelivery.base_rate_dhaka) || 70,
      base_rate_outside: Number(editDelivery.base_rate_outside) || 130,
      contact_phone: editDelivery.contact_phone,
    }, currentUser.name);
    setEditingDeliveryId(null);
    refreshData();
  };

  const cancelEditDelivery = () => {
    setEditingDeliveryId(null);
  };

  // --- Payment Partner handlers ---
  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentName.trim() || !accountNo.trim()) return;
    dbService.addPaymentPartner({
      name: paymentName.trim(),
      channel_type: channelType,
      account_number: accountNo.trim(),
      settlement_charge: settlementCharge.trim() || '0% Fee',
      is_active: true
    }, currentUser.name);
    setPaymentName('');
    setAccountNo('');
    setIsAddPaymentOpen(false);
    refreshData();
  };

  const handleTogglePayment = (id: string) => {
    dbService.togglePaymentPartnerStatus(id, currentUser.name);
    refreshData();
  };

  const handleRemovePayment = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove payment partner "${name}"?`)) {
      dbService.removePaymentPartner(id, currentUser.name);
      refreshData();
    }
  };

  const startEditPayment = (partner: PaymentPartner) => {
    setEditingPaymentId(partner.id);
    setEditPayment({
      name: partner.name,
      channel_type: partner.channel_type,
      account_number: partner.account_number,
      settlement_charge: partner.settlement_charge || '',
    });
  };

  const saveEditPayment = () => {
    if (!editingPaymentId) return;
    dbService.updatePaymentPartner(editingPaymentId, {
      name: editPayment.name,
      channel_type: editPayment.channel_type,
      account_number: editPayment.account_number,
      settlement_charge: editPayment.settlement_charge,
    }, currentUser.name);
    setEditingPaymentId(null);
    refreshData();
  };

  const cancelEditPayment = () => {
    setEditingPaymentId(null);
  };

  // --- Filters ---
  const filteredDelivery = deliveryPartners.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.contact_phone && p.contact_phone.includes(searchQuery))
  );

  const filteredPayment = paymentPartners.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.channel_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.account_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }} className="animate-fade-in">
      {/* Top Header & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Briefcase size={28} style={{ color: 'var(--accent-primary)' }} />
            <span>Delivery & Payment Partners</span>
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Configure delivery couriers and payment channels.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search partner by name or ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 36px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <button
            onClick={() => activeSubTab === 'delivery' ? setIsAddDeliveryOpen(true) : setIsAddPaymentOpen(true)}
            className="btn btn-primary hover-lift"
            style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} />
            <span>{activeSubTab === 'delivery' ? 'Add Delivery Partner' : 'Add Payment Partner'}</span>
          </button>
        </div>
      </div>

      {/* Compact High-Density KPI Ribbon */}
      <div className="glass-card" style={{ padding: '12px 18px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', alignItems: 'center', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '14px', borderRight: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Couriers & Riders</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--emerald)', fontWeight: 600, marginTop: '2px' }}>
              {deliveryPartners.filter(p => p.is_active).length} active couriers
            </div>
          </div>
          <div style={{ fontSize: '1.24rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace', marginLeft: '8px' }}>
            {deliveryPartners.length}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '14px', borderRight: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--emerald)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Payment & MFS Channels</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--emerald)', fontWeight: 600, marginTop: '2px' }}>
              {paymentPartners.filter(p => p.is_active).length} active channels
            </div>
          </div>
          <div style={{ fontSize: '1.24rem', fontWeight: 800, color: 'var(--emerald)', fontFamily: 'monospace', marginLeft: '8px' }}>
            {paymentPartners.length}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--amber)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Settlement & COD Hubs</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>Active COD & settlement hubs</div>
          </div>
          <div style={{ fontSize: '1.24rem', fontWeight: 800, color: 'var(--amber)', fontFamily: 'monospace', marginLeft: '8px' }}>
            {paymentPartners.filter(p => p.channel_type.includes('MFS') || p.channel_type.includes('COD')).length}
          </div>
        </div>
      </div>

      {/* Sub-Tab Switcher */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveSubTab('delivery')}
          style={{
            padding: '10px 22px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: activeSubTab === 'delivery' ? 'var(--accent-primary)' : 'var(--bg-card)',
            color: activeSubTab === 'delivery' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeSubTab === 'delivery' ? '0 4px 14px rgba(99, 102, 241, 0.4)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Truck size={18} />
          <span>Delivery Partners ({deliveryPartners.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('payment')}
          style={{
            padding: '10px 22px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: activeSubTab === 'payment' ? 'var(--accent-primary)' : 'var(--bg-card)',
            color: activeSubTab === 'payment' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeSubTab === 'payment' ? '0 4px 14px rgba(99, 102, 241, 0.4)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <CreditCard size={18} />
          <span>Payment Partners & Gateways ({paymentPartners.length})</span>
        </button>
      </div>

      {/* TAB 1: DELIVERY PARTNERS */}
      {activeSubTab === 'delivery' && (
        <div className="glass-card" style={{ flex: 1, overflowY: 'auto' }}>
          <table className="crm-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Courier / Partner Name</th>
                <th>Mode & Type</th>
                <th>Standard Rates (Local / Regional)</th>
                <th>Contact Phone</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDelivery.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    No delivery partners found. Click <strong>+ Add Delivery Partner</strong> to configure a new shipping partner.
                  </td>
                </tr>
              ) : (
                filteredDelivery.map(partner => {
                  const isEditing = editingDeliveryId === partner.id;
                  return (
                    <tr key={partner.id} style={{ opacity: partner.is_active ? 1 : 0.65 }}>
                      <td style={{ padding: '9px 14px' }}>
                        <span
                          onClick={() => handleToggleDelivery(partner.id)}
                          className={`badge ${partner.is_active ? 'badge-success' : 'badge-danger'}`}
                          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', fontSize: '0.74rem' }}
                          title="Click to toggle status"
                        >
                          {partner.is_active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {partner.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td style={{ padding: '9px 14px' }}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editDelivery.name}
                            onChange={e => setEditDelivery({ ...editDelivery, name: e.target.value })}
                            style={inlineInputStyle}
                          />
                        ) : (
                          <>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>{partner.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>ID: {partner.id}</div>
                          </>
                        )}
                      </td>
                      <td style={{ padding: '9px 14px' }}>
                        {isEditing ? (
                          <select
                            value={editDelivery.type}
                            onChange={e => setEditDelivery({ ...editDelivery, type: e.target.value })}
                            style={inlineSelectStyle}
                          >
                            <option value="API Integrated COD Courier">API Integrated COD Courier</option>
                            <option value="Standard Parcel Delivery">Standard Parcel Delivery</option>
                            <option value="In-House Rider">In-House Rider / Express</option>
                            <option value="District Hub">District Hub / Pickup Point</option>
                          </select>
                        ) : (
                          <span className="badge" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.75rem', padding: '2px 8px' }}>
                            {partner.type}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '9px 14px' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Local ({currencySymbol})</span>
                              <input
                                type="number"
                                value={editDelivery.base_rate_dhaka}
                                onChange={e => setEditDelivery({ ...editDelivery, base_rate_dhaka: Number(e.target.value) })}
                                style={{ ...inlineInputStyle, width: '80px' }}
                              />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Regional ({currencySymbol})</span>
                              <input
                                type="number"
                                value={editDelivery.base_rate_outside}
                                onChange={e => setEditDelivery({ ...editDelivery, base_rate_outside: Number(e.target.value) })}
                                style={{ ...inlineInputStyle, width: '80px' }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '14px' }}>
                            <div style={{ fontSize: '0.82rem' }}>
                              Local: <strong style={{ color: 'var(--emerald)' }}>{currencySymbol}{partner.base_rate_dhaka || 70}</strong>
                            </div>
                            <div style={{ fontSize: '0.82rem' }}>
                              Regional: <strong style={{ color: 'var(--accent-primary)' }}>{currencySymbol}{partner.base_rate_outside || 130}</strong>
                            </div>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '9px 14px' }}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editDelivery.contact_phone}
                            onChange={e => setEditDelivery({ ...editDelivery, contact_phone: e.target.value })}
                            style={{ ...inlineInputStyle, width: '140px' }}
                          />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                            <Phone size={13} style={{ color: 'var(--text-muted)' }} />
                            <span>{partner.contact_phone || 'N/A'}</span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '9px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                          {isEditing ? (
                            <>
                              <button
                                onClick={saveEditDelivery}
                                className="btn btn-primary"
                                style={{ padding: '5px 9px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="Save changes"
                              >
                                <Save size={13} />
                                <span>Save</span>
                              </button>
                              <button
                                onClick={cancelEditDelivery}
                                className="btn btn-secondary"
                                style={{ padding: '5px 9px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="Cancel editing"
                              >
                                <X size={13} />
                                <span>Cancel</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditDelivery(partner)}
                                className="btn btn-secondary hover-lift"
                                style={{ padding: '5px 9px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="Edit partner details"
                              >
                                <Edit size={13} style={{ color: 'var(--accent-primary)' }} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleToggleDelivery(partner.id)}
                                className="btn btn-secondary hover-lift"
                                style={{ padding: '5px 9px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="Toggle Active/Inactive"
                              >
                                {partner.is_active ? <ToggleRight size={15} style={{ color: 'var(--emerald)' }} /> : <ToggleLeft size={15} style={{ color: 'var(--text-muted)' }} />}
                                <span>{partner.is_active ? 'Disable' : 'Enable'}</span>
                              </button>
                              <button
                                onClick={() => handleRemoveDelivery(partner.id, partner.name)}
                                className="btn btn-secondary hover-lift"
                                style={{ padding: '5px 9px', fontSize: '0.75rem', color: 'var(--ruby)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                                title="Remove Partner"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: PAYMENT PARTNERS */}
      {activeSubTab === 'payment' && (
        <div className="glass-card" style={{ flex: 1, overflowY: 'auto' }}>
          <table className="crm-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Account / Partner Name</th>
                <th>Channel Type</th>
                <th>Account Number / Branch</th>
                <th>Settlement Charge / Fee</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayment.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    No payment partners found. Click <strong>+ Add Payment Partner</strong> to configure a new account.
                  </td>
                </tr>
              ) : (
                filteredPayment.map(partner => {
                  const isEditing = editingPaymentId === partner.id;
                  return (
                    <tr key={partner.id} style={{ opacity: partner.is_active ? 1 : 0.65 }}>
                      <td style={{ padding: '9px 14px' }}>
                        <span
                          onClick={() => handleTogglePayment(partner.id)}
                          className={`badge ${partner.is_active ? 'badge-success' : 'badge-danger'}`}
                          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', fontSize: '0.74rem' }}
                          title="Click to toggle status"
                        >
                          {partner.is_active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {partner.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td style={{ padding: '9px 14px' }}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editPayment.name}
                            onChange={e => setEditPayment({ ...editPayment, name: e.target.value })}
                            style={inlineInputStyle}
                          />
                        ) : (
                          <>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>{partner.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>ID: {partner.id}</div>
                          </>
                        )}
                      </td>
                      <td style={{ padding: '9px 14px' }}>
                        {isEditing ? (
                          <select
                            value={editPayment.channel_type}
                            onChange={e => setEditPayment({ ...editPayment, channel_type: e.target.value })}
                            style={inlineSelectStyle}
                          >
                            <option value="Mobile Financial Service (MFS)">Mobile Financial Service (MFS)</option>
                            <option value="Corporate Bank Account">Corporate Bank Account</option>
                            <option value="Payment Gateway">Payment Gateway (SSLCommerz / Shurjopay)</option>
                            <option value="Physical Cash / COD Hub">Physical Cash / COD Hub</option>
                          </select>
                        ) : (
                          <span className="badge" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.75rem', padding: '2px 8px' }}>
                            {partner.channel_type}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '9px 14px' }}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editPayment.account_number}
                            onChange={e => setEditPayment({ ...editPayment, account_number: e.target.value })}
                            style={inlineInputStyle}
                          />
                        ) : (
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.84rem', fontFamily: 'monospace' }}>
                            {partner.account_number}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '9px 14px' }}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editPayment.settlement_charge}
                            onChange={e => setEditPayment({ ...editPayment, settlement_charge: e.target.value })}
                            style={{ ...inlineInputStyle, width: '140px' }}
                          />
                        ) : (
                          <span style={{ fontWeight: 700, color: '#38BDF8', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.76rem' }}>
                            {partner.settlement_charge || '0% Fee'}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '9px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                          {isEditing ? (
                            <>
                              <button
                                onClick={saveEditPayment}
                                className="btn btn-primary"
                                style={{ padding: '5px 9px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="Save changes"
                              >
                                <Save size={13} />
                                <span>Save</span>
                              </button>
                              <button
                                onClick={cancelEditPayment}
                                className="btn btn-secondary"
                                style={{ padding: '5px 9px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="Cancel editing"
                              >
                                <X size={13} />
                                <span>Cancel</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditPayment(partner)}
                                className="btn btn-secondary hover-lift"
                                style={{ padding: '5px 9px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="Edit partner details"
                              >
                                <Edit size={13} style={{ color: 'var(--accent-primary)' }} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleTogglePayment(partner.id)}
                                className="btn btn-secondary hover-lift"
                                style={{ padding: '5px 9px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="Toggle Active/Inactive"
                              >
                                {partner.is_active ? <ToggleRight size={15} style={{ color: 'var(--emerald)' }} /> : <ToggleLeft size={15} style={{ color: 'var(--text-muted)' }} />}
                                <span>{partner.is_active ? 'Disable' : 'Enable'}</span>
                              </button>
                              <button
                                onClick={() => handleRemovePayment(partner.id, partner.name)}
                                className="btn btn-secondary hover-lift"
                                style={{ padding: '5px 9px', fontSize: '0.75rem', color: 'var(--ruby)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                                title="Remove Partner"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Delivery Partner Modal */}
      {isAddDeliveryOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="glass-card" style={{
            width: '520px',
            padding: '28px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex', flexDirection: 'column', gap: '20px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={22} style={{ color: 'var(--accent-primary)' }} />
                <span>Add Delivery Partner</span>
              </h3>
              <button onClick={() => setIsAddDeliveryOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <XCircle size={22} />
              </button>
            </div>

            <form onSubmit={handleAddDelivery} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Courier / Partner Name *
                </label>
                <input
                  type="text"
                  required
                  list="courier-presets-list"
                  placeholder={currentCountry === 'BD' ? 'e.g. Pathao Courier, Steadfast, eCourier, RedX...' : 'e.g. FedEx Ground, UPS, DHL Express, USPS...'}
                  value={deliveryName}
                  onChange={e => {
                    const val = e.target.value;
                    setDeliveryName(val);
                    const matched = courierPresets.find(c => c.name.toLowerCase() === val.toLowerCase());
                    if (matched) {
                      setDeliveryType(matched.type);
                      setRateDhaka(matched.baseRateLocal);
                      setRateOutside(matched.baseRateNational);
                      if (matched.contactPhone) setContactPhone(matched.contactPhone);
                    }
                  }}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
                <datalist id="courier-presets-list">
                  {courierPresets.map(c => (
                    <option key={c.name} value={c.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Partner Type & Integration Mode
                </label>
                <select
                  value={deliveryType}
                  onChange={e => setDeliveryType(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                >
                  <option value="API Integrated COD Courier">API Integrated COD Courier</option>
                  <option value="Standard Parcel Delivery">Standard Parcel Delivery</option>
                  <option value="In-House Rider">In-House Rider / Express</option>
                  <option value="District Hub">District Hub / Pickup Point</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Local Zone Base Rate ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    value={rateDhaka}
                    onChange={e => setRateDhaka(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    National / Regional Rate ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    value={rateOutside}
                    onChange={e => setRateOutside(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Contact / Support Helpline
                </label>
                <input
                  type="text"
                  placeholder={currentCountry === 'BD' ? 'e.g. 09610-003030 or Rider phone' : 'e.g. 1-800-463-3339 or Local Dispatch'}
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsAddDeliveryOpen(false)} className="btn btn-secondary" style={{ padding: '10px 18px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary hover-lift" style={{ padding: '10px 22px' }}>
                  Confirm & Add Delivery Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Payment Partner Modal */}
      {isAddPaymentOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="glass-card" style={{
            width: '520px',
            padding: '28px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex', flexDirection: 'column', gap: '20px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={22} style={{ color: 'var(--emerald)' }} />
                <span>Add Payment Partner</span>
              </h3>
              <button onClick={() => setIsAddPaymentOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <XCircle size={22} />
              </button>
            </div>

            <form onSubmit={handleAddPayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Account / Partner Name *
                </label>
                <input
                  type="text"
                  required
                  list="payment-presets-list"
                  placeholder={currentCountry === 'BD' ? 'e.g. bKash Merchant Account, Nagad Corporate, City Bank...' : 'e.g. Stripe Card Processing, PayPal Business, Chase...'}
                  value={paymentName}
                  onChange={e => {
                    const val = e.target.value;
                    setPaymentName(val);
                    const matched = paymentTemplates.find(p => p.name.toLowerCase() === val.toLowerCase());
                    if (matched) {
                      setChannelType(matched.channelType);
                      setAccountNo(matched.accountExample);
                      setSettlementCharge(matched.settlementCharge);
                    }
                  }}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
                <datalist id="payment-presets-list">
                  {paymentTemplates.map(p => (
                    <option key={p.name} value={p.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Channel Type
                </label>
                <select
                  value={channelType}
                  onChange={e => setChannelType(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                >
                  {currentCountry === 'BD' ? (
                    <>
                      <option value="Mobile Financial Service (MFS)">Mobile Financial Service (bKash/Nagad/Rocket)</option>
                      <option value="Corporate Bank Account">Corporate Bank Account</option>
                      <option value="Payment Gateway">Payment Gateway (SSLCommerz / Shurjopay)</option>
                      <option value="Physical Cash / COD Hub">Physical Cash / COD Hub</option>
                    </>
                  ) : (
                    <>
                      <option value="Payment Gateway">Online Payment Gateway (Stripe / Cards)</option>
                      <option value="Online Digital Wallet">Digital Wallet (PayPal / Apple Pay)</option>
                      <option value="Corporate Bank Account">Commercial Bank / Wire Transfer</option>
                      <option value="Physical Cash / COD Hub">Cash on Delivery / POS Register</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Account Number / Branch details *
                </label>
                <input
                  type="text"
                  required
                  placeholder={currentCountry === 'BD' ? 'e.g. 01711-987654 (Merchant) or A/C 3101-998877' : 'e.g. payments@company.com or Routing / Account #'}
                  value={accountNo}
                  onChange={e => setAccountNo(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Settlement Charge / Fee
                </label>
                <input
                  type="text"
                  placeholder={currentCountry === 'BD' ? 'e.g. 1.2% Merchant Fee or 0% Bank Transfer' : 'e.g. 2.9% + $0.30 or 0% ACH Wire'}
                  value={settlementCharge}
                  onChange={e => setSettlementCharge(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsAddPaymentOpen(false)} className="btn btn-secondary" style={{ padding: '10px 18px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary hover-lift" style={{ padding: '10px 22px', backgroundColor: 'var(--emerald)' }}>
                  Confirm & Add Payment Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
