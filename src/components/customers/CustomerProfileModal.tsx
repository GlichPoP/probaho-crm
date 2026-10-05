import React, { useState } from 'react';
import { X, Phone, MapPin, Mail, MessageCircle, ExternalLink, ShoppingBag } from 'lucide-react';
import type { Customer, Order } from '../../types/crm';
import { dbService } from '../../database/db';
import { useLocalization } from '../../i18n/LanguageContext';

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  orders: Order[];
  onSaveCustomerNotes: (customer: Customer, newNotes: string) => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  isOpen,
  onClose,
  customer,
  orders,
  onSaveCustomerNotes
}) => {
  const { currencySymbol, currentCountryConfig } = useLocalization();
  const [notesInput, setNotesInput] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<'dispatch' | 'eid_coupon' | 'cod_reminder' | 'custom'>('dispatch');
  const [customMsg, setCustomMsg] = useState<string>('');

  React.useEffect(() => {
    if (customer) {
      setNotesInput(customer.notes || '');
    }
  }, [customer]);

  if (!isOpen || !customer) return null;

  const customerOrders = orders.filter(o => o.customer_id === customer.id || o.customer_phone === customer.phone);
  const latestOrder = customerOrders[0];

  // Clean phone for wa.me
  const cleanPhone = customer.phone.replace(/\D/g, '');
  const phonePrefix = currentCountryConfig?.phoneCode?.replace('+', '') || '1';
  const waPhone = cleanPhone.startsWith(phonePrefix) ? cleanPhone : `${phonePrefix}${cleanPhone}`;

  const brand = dbService.getBrandProfile();
  const brandName = brand.brand_name || 'PROBAHO CRM Solutions';

  // Generate template message
  let followUpText = '';
  if (selectedTemplate === 'dispatch') {
    followUpText = `Dear ${customer.name}, your ${brandName} order (${latestOrder ? latestOrder.invoice_no : 'INV-2026-X'}) has been handed over to ${latestOrder ? latestOrder.courier_name : 'Courier'} with Tracking Code ${latestOrder?.tracking_id || 'ID'}. Thank you for shopping with us!`;
  } else if (selectedTemplate === 'eid_coupon') {
    followUpText = `Dear ${customer.name}! As one of our valued ${customer.segment} buyers, here is your exclusive ${currencySymbol}300 discount coupon code: VIP300 for our new collection. Reply here or visit our store to order!`;
  } else if (selectedTemplate === 'cod_reminder') {
    followUpText = `Dear ${customer.name}, your ${brandName} parcel (${latestOrder?.invoice_no || 'INV-101'}) has arrived in your area (${customer.district || 'City'}). Please keep cash ${currencySymbol}${latestOrder?.total_amount_bdt.toLocaleString() || '1,850'} ready for the ${latestOrder?.courier_name || 'courier'} delivery agent!`;
  } else {
    followUpText = customMsg;
  }

  const waLink = `https://wa.me/${waPhone}?text=${encodeURIComponent(followUpText)}`;
  const emailSubject = `${brandName} - Order Notification for ${customer.name}`;
  const emailLink = customer.email ? `mailto:${customer.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(followUpText)}` : '';

  const handleSaveNotes = () => {
    onSaveCustomerNotes(customer, notesInput);
    alert('Customer notes updated successfully.');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }} className="animate-fade-in" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="glass-card"
        style={{
          width: '740px',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.2rem' }}>
              {customer.name.charAt(0)}
            </div>
            <div>
              <h3 className="brand-font" style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{customer.name}</span>
                <span className={`badge ${customer.segment === 'Blacklisted/RTO Risk' ? 'badge-danger' : 'badge-primary'}`} style={{ fontSize: '0.7rem' }}>
                  {customer.segment}
                </span>
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customer ID: {customer.id} • Registered: {new Date(customer.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Quick Stats Banner */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Lifetime Spent</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--emerald)', marginTop: '4px' }}>{currencySymbol}{customer.total_spent_bdt.toLocaleString()}</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Total Orders</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>{customer.total_orders}</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Courier Returns</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: customer.total_returns > 0 ? 'var(--ruby)' : 'var(--text-muted)', marginTop: '4px' }}>{customer.total_returns}</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>District Area</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38BDF8', marginTop: '4px' }}>{customer.district}</div>
            </div>
          </div>

          {/* Contact details & Notes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>Contact details</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
                <Phone size={16} style={{ color: 'var(--text-dim)' }} />
                <span>{customer.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
                <MapPin size={16} style={{ color: 'var(--text-dim)' }} />
                <span>{customer.address}, {customer.district}</span>
              </div>
              {customer.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
                  <Mail size={16} style={{ color: 'var(--text-dim)' }} />
                  <span>{customer.email}</span>
                </div>
              )}
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>CRM Staff Notes & Alerts</span>
                <button type="button" onClick={handleSaveNotes} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>Save Note</button>
              </div>
              <textarea
                value={notesInput}
                onChange={e => setNotesInput(e.target.value)}
                rows={3}
                placeholder="Add special notes about delivery habits, preferred sizes, or bKash advance rules..."
                style={{ width: '100%', padding: '8px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none', resize: 'none' }}
              />
            </div>
          </div>

          {/* 1-Click WhatsApp Direct Message Box */}
          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald)', fontWeight: 700, fontSize: '0.9rem' }}>
                <MessageCircle size={18} />
                <span>Quick Customer Direct Communication</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {customer.email && (
                  <a
                    href={emailLink}
                    className="btn btn-secondary"
                    style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Mail size={14} />
                    <span>Send via Email</span>
                  </a>
                )}
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ backgroundColor: 'var(--emerald)', backgroundImage: 'none', padding: '6px 14px', fontSize: '0.82rem' }}
                >
                  <span>Send WhatsApp</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSelectedTemplate('dispatch')}
                style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid', borderColor: selectedTemplate === 'dispatch' ? 'var(--emerald)' : 'var(--border-color)', backgroundColor: selectedTemplate === 'dispatch' ? 'var(--emerald-bg)' : 'transparent', color: selectedTemplate === 'dispatch' ? 'var(--emerald)' : 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
              >
                1. Courier Tracking Alert
              </button>
              <button
                type="button"
                onClick={() => setSelectedTemplate('eid_coupon')}
                style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid', borderColor: selectedTemplate === 'eid_coupon' ? 'var(--emerald)' : 'var(--border-color)', backgroundColor: selectedTemplate === 'eid_coupon' ? 'var(--emerald-bg)' : 'transparent', color: selectedTemplate === 'eid_coupon' ? 'var(--emerald)' : 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
              >
                2. VIP Coupon Follow-up
              </button>
              <button
                type="button"
                onClick={() => setSelectedTemplate('cod_reminder')}
                style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid', borderColor: selectedTemplate === 'cod_reminder' ? 'var(--emerald)' : 'var(--border-color)', backgroundColor: selectedTemplate === 'cod_reminder' ? 'var(--emerald-bg)' : 'transparent', color: selectedTemplate === 'cod_reminder' ? 'var(--emerald)' : 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
              >
                3. COD Cash Reminder
              </button>
              <button
                type="button"
                onClick={() => setSelectedTemplate('custom')}
                style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid', borderColor: selectedTemplate === 'custom' ? 'var(--emerald)' : 'var(--border-color)', backgroundColor: selectedTemplate === 'custom' ? 'var(--emerald-bg)' : 'transparent', color: selectedTemplate === 'custom' ? 'var(--emerald)' : 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
              >
                4. Custom Message
              </button>
            </div>

            {selectedTemplate === 'custom' && (
              <div>
                <textarea
                  value={customMsg}
                  onChange={e => setCustomMsg(e.target.value)}
                  rows={2}
                  placeholder="Type your custom message here..."
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none' }}
                />
              </div>
            )}

            <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.3)', fontSize: '0.82rem', color: 'var(--text-main)', fontStyle: 'italic', border: '1px dashed rgba(255,255,255,0.1)' }}>
              "{followUpText}"
            </div>
          </div>

          {/* 360° Order & Interaction Timeline */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '12px' }}>
              360° Chronological Order Timeline ({customerOrders.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
              {customerOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                  No orders recorded under this phone number yet.
                </div>
              ) : (
                customerOrders.map(ord => (
                  <div key={ord.id} style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <ShoppingBag size={18} style={{ color: '#818CF8' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{ord.invoice_no} • {ord.sales_channel} ({ord.courier_name})</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Ordered {new Date(ord.order_date).toLocaleDateString()} • Items: {ord.items.map(i => `${i.quantity}x ${i.name} [Size: ${i.size}]`).join(', ')}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--emerald)' }}>{currencySymbol}{ord.total_amount_bdt.toLocaleString()}</div>
                      <span className={`badge ${ord.delivery_status === 'Returned/RTO' ? 'badge-danger' : ord.delivery_status === 'Delivered' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.68rem' }}>
                        {ord.delivery_status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
