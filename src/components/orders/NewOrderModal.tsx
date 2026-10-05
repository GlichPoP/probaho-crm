import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ShieldAlert, CheckCircle2, ShoppingBag } from 'lucide-react';
import type { Order, Product, Customer, SalesChannel, CourierPartner, OrderItem } from '../../types/crm';
import { SearchableProductSelect } from './SearchableProductSelect';
import { dbService } from '../../database/db';
import { useLocalization } from '../../i18n/LanguageContext';
import { getRegionalDistricts, getRegionalDeliveryPresets, getRegionalPhoneConfig } from '../../config/regionalPresets';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  customers: Customer[];
  onSaveOrder: (order: Order) => void;
  onCheckBlacklist: (phone: string) => { isRisk: boolean; returnsCount: number; message: string };
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  products,
  customers,
  onSaveOrder,
  onCheckBlacklist
}) => {
  const { currencySymbol, currentCountryConfig } = useLocalization();
  const currentCountry = currentCountryConfig?.code || 'BD';
  const phoneConfig = getRegionalPhoneConfig(currentCountry);
  const regionalDistricts = getRegionalDistricts(currentCountry);
  const deliveryPresets = getRegionalDeliveryPresets(currentCountry);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerDistrict, setCustomerDistrict] = useState(currentCountry === 'BD' ? 'Dhaka' : (regionalDistricts[0] || 'Local Delivery Zone'));
  const [salesChannel, setSalesChannel] = useState<SalesChannel>('Facebook Messenger');
  const [courierName, setCourierName] = useState<CourierPartner>('Pathao Courier');
  const [trackingId, setTrackingId] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState<number>(deliveryPresets[0]?.amount ?? 70);
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: products[0]?.id || '', quantity: 1 }
  ]);

  const [blacklistAlert, setBlacklistAlert] = useState<{ isRisk: boolean; returnsCount: number; message: string }>({
    isRisk: false,
    returnsCount: 0,
    message: ''
  });

  // Check phone real-time
  useEffect(() => {
    if (customerPhone.length >= 11) {
      const result = onCheckBlacklist(customerPhone);
      setBlacklistAlert(result);
      // Auto-fill existing customer info if exact match
      const existing = customers.find(c => c.phone.replace(/\D/g, '') === customerPhone.replace(/\D/g, ''));
      if (existing && !customerName) {
        setCustomerName(existing.name);
        setCustomerAddress(existing.address);
        setCustomerDistrict(existing.district);
      }
    } else {
      setBlacklistAlert({ isRisk: false, returnsCount: 0, message: '' });
    }
  }, [customerPhone, customers, onCheckBlacklist, customerName]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { productId: products[0]?.id || '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  // Calculate totals safely
  const subtotal = items.reduce((sum, item) => {
    const prod = products.find(p => p.id === item.productId);
    return sum + (prod ? prod.selling_price_bdt * item.quantity : 0);
  }, 0);

  const totalAmount = Math.max(0, subtotal + Number(deliveryCharge) - Number(discount));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || items.length === 0) {
      alert('Please fill out customer name, phone, and add at least 1 product item.');
      return;
    }

    const validItems = items.filter(item => {
      const prod = products.find(p => p.id === item.productId);
      return prod && item.quantity > 0;
    });

    if (validItems.length === 0) {
      alert('Please select at least 1 valid product item from your inventory catalog.');
      return;
    }

    const orderItems: OrderItem[] = validItems.map(item => {
      const prod = products.find(p => p.id === item.productId)!;
      return {
        product_id: prod.id,
        sku: prod.sku,
        name: prod.name,
        size: prod.size,
        color: prod.color,
        quantity: item.quantity,
        unit_price_bdt: prod.selling_price_bdt,
        total_price_bdt: prod.selling_price_bdt * item.quantity
      };
    });

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      invoice_no: `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      customer_id: customers.find(c => c.phone === customerPhone)?.id || `cust-new-${Date.now()}`,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress || 'No Address Provided',
      customer_district: customerDistrict,
      order_date: new Date().toISOString(),
      sales_channel: salesChannel,
      courier_name: courierName,
      tracking_id: trackingId || undefined,
      delivery_status: 'Order Placed',
      items: orderItems,
      subtotal_bdt: subtotal,
      delivery_charge_bdt: deliveryCharge,
      discount_bdt: discount,
      total_amount_bdt: totalAmount,
      advance_paid_bdt: Number(advancePaid) || 0,
      payment_status: Number(advancePaid) >= totalAmount ? 'Paid' : Number(advancePaid) > 0 ? 'Partial' : 'COD Pending',
      cod_settlement_status: 'Pending Courier Remittance',
      notes: notes || (blacklistAlert.isRisk ? `Risk Alert Flagged: ${blacklistAlert.returnsCount} previous returns.` : undefined)
    };

    onSaveOrder(newOrder);
    onClose();
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
      zIndex: 100,
      padding: '20px'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={22} style={{ color: 'var(--accent-primary)' }} />
            <h3 className="brand-font" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Create New Order</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSave} style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Customer & Blacklist Checker Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              1. Customer Information & Blacklist Check
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  {phoneConfig.label} {currentCountry === 'BD' && <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>(Try: 01788992211 for Risk Check)</span>}
                </label>
                <input
                  type="text"
                  placeholder={phoneConfig.placeholder}
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Customer Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sadia Islam"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            </div>

            {/* 🚨 BLACKLIST RTO RISK ALERT BANNER */}
            {blacklistAlert.isRisk && (
              <div className="pulse-alert" style={{
                padding: '14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '2px solid var(--ruby)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#FFF'
              }}>
                <ShieldAlert size={28} style={{ color: 'var(--ruby)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--ruby)' }}>
                    🚨 High Return Risk: {blacklistAlert.returnsCount} previous returns
                  </div>
                  <div style={{ fontSize: '0.82rem', marginTop: '2px' }}>
                    Customer returned {blacklistAlert.returnsCount} parcels before. Collect a delivery advance before shipping.
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Delivery Address (Street / Area / Landmark)
                </label>
                <input
                  type="text"
                  placeholder={currentCountry === 'BD' ? 'e.g. House 14, Road 7, Dhanmondi' : 'e.g. 742 Evergreen Terrace, Suite 101'}
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  {currentCountryConfig?.regionLabel || 'Delivery District / Region'}
                </label>
                <input
                  type="text"
                  list="delivery-zones-preset"
                  placeholder={currentCountry === 'BD' ? 'e.g. Dhaka, Chittagong, Sylhet...' : 'e.g. California, London, Dubai...'}
                  value={customerDistrict}
                  onChange={e => {
                    const val = e.target.value;
                    setCustomerDistrict(val);
                    if (currentCountry === 'BD') {
                      const lower = val.toLowerCase().trim();
                      if (lower === 'dhaka' || lower.includes('dhaka')) {
                        setDeliveryCharge(70);
                      } else if (lower.includes('gazipur') || lower.includes('narayanganj') || lower.includes('savar') || lower.includes('keraniganj')) {
                        setDeliveryCharge(100);
                      } else if (val.trim()) {
                        setDeliveryCharge(130);
                      }
                    }
                  }}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                />
                <datalist id="delivery-zones-preset">
                  {regionalDistricts.map(d => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Apparel SKUs Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                2. Select Products & Variants
              </span>
              <button type="button" onClick={handleAddItem} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                <Plus size={14} /> Add Item
              </button>
            </div>

            {items.map((item, idx) => {
              const selectedProd = products.find(p => p.id === item.productId);
              return (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <SearchableProductSelect
                    products={products}
                    selectedProductId={item.productId}
                    onSelect={id => handleItemChange(idx, 'productId', id)}
                    showPrice={true}
                  />

                  <div style={{ width: '100px' }}>
                    <input
                      type="number"
                      min={1}
                      max={selectedProd ? selectedProd.stock_quantity : 99}
                      value={item.quantity}
                      onChange={e => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none', textAlign: 'center' }}
                    />
                  </div>

                  <div style={{ width: '100px', textAlign: 'right', fontWeight: 700, color: 'var(--emerald)', fontSize: '0.92rem' }}>
                    {currencySymbol}{(selectedProd ? selectedProd.selling_price_bdt * item.quantity : 0).toLocaleString()}
                  </div>

                  {items.length > 1 && (
                    <button type="button" onClick={() => handleRemoveItem(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--ruby)', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Channel, Courier & Financials Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              3. Channel, Courier & Cash Reconciliation
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Sales Channel</label>
                <select
                  value={salesChannel}
                  onChange={e => setSalesChannel(e.target.value as SalesChannel)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                >
                  <option value="Facebook Messenger">Facebook Messenger</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Website">Website</option>
                  <option value="Instagram DM">Instagram DM</option>
                  <option value="Showroom">Showroom</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Courier Partner</label>
                <select
                  value={courierName}
                  onChange={e => setCourierName(e.target.value as CourierPartner)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                >
                  {dbService.getDeliveryPartners().filter(p => p.is_active).map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Tracking Code / Consignment</label>
                <input
                  type="text"
                  placeholder="e.g. PTH-88190"
                  value={trackingId}
                  onChange={e => setTrackingId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>
            </div>

            {/* Financial Summary Box */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '20px', marginTop: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Delivery Charge ({currencySymbol})</span>
                    <input
                      type="number"
                      min={0}
                      value={deliveryCharge}
                      onChange={e => setDeliveryCharge(Math.max(0, parseInt(e.target.value) || 0))}
                      style={{ width: '110px', padding: '6px 10px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: 700, outline: 'none', textAlign: 'right' }}
                    />
                  </div>
                  {/* Delivery Quick Presets */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px', justifyContent: 'flex-end' }}>
                    {deliveryPresets.map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setDeliveryCharge(preset.amount)}
                        style={{
                          padding: '2px 7px',
                          borderRadius: '6px',
                          fontSize: '0.71rem',
                          fontWeight: 600,
                          backgroundColor: deliveryCharge === preset.amount ? 'var(--accent-glow)' : 'var(--bg-primary)',
                          border: '1px solid',
                          borderColor: deliveryCharge === preset.amount ? 'var(--accent-primary)' : 'var(--border-color)',
                          color: deliveryCharge === preset.amount ? 'var(--accent-primary)' : 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {preset.label} ({currencySymbol}{preset.amount})
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Advance Deposit Paid ({currencySymbol})</span>
                  <input
                    type="number"
                    min={0}
                    value={advancePaid}
                    onChange={e => setAdvancePaid(parseInt(e.target.value) || 0)}
                    style={{ width: '110px', padding: '6px 10px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--emerald)', fontWeight: 700, outline: 'none', textAlign: 'right' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Discount Applied ({currencySymbol})</span>
                  <input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={e => setDiscount(parseInt(e.target.value) || 0)}
                    style={{ width: '110px', padding: '6px 10px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--ruby)', fontWeight: 700, outline: 'none', textAlign: 'right' }}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Order notes (e.g., Call before delivery / Fragile / Gift)..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <span>Subtotal:</span>
                  <span>{currencySymbol}{subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <span>Delivery ({customerDistrict}):</span>
                  <span>{currencySymbol}{Number(deliveryCharge).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '4px' }}>
                  <span>Total Amount:</span>
                  <span style={{ color: 'var(--emerald)' }}>{currencySymbol}{totalAmount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--amber)', fontWeight: 600 }}>
                  <span>COD Collection Due:</span>
                  <span>{currencySymbol}{Math.max(0, totalAmount - Number(advancePaid)).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

        </form>

        {/* Footer Actions */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button type="button" onClick={handleSave} className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <CheckCircle2 size={16} />
            <span>Confirm & Create Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};
