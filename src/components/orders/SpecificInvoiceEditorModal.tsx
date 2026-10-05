import React, { useState } from 'react';
import { X, Check, Edit3, User, Package } from 'lucide-react';
import type { Order, OrderItem } from '../../types/crm';
import { dbService } from '../../database/db';

interface SpecificInvoiceEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onOrderUpdated?: (updatedOrder: Order) => void;
  onSave?: (updatedOrder: Order) => void;
}

export const SpecificInvoiceEditorModal: React.FC<SpecificInvoiceEditorModalProps> = (props) => {
  if (!props.isOpen || !props.order) return null;
  return <SpecificInvoiceEditorModalContent {...props} order={props.order} />;
};

const SpecificInvoiceEditorModalContent: React.FC<SpecificInvoiceEditorModalProps & { order: Order }> = ({
  onClose,
  order,
  onOrderUpdated,
  onSave
}) => {
  const [invoiceNo, setInvoiceNo] = useState(order.invoice_no);
  const [customTitle, setCustomTitle] = useState(order.custom_invoice_title || '');
  const [customerName, setCustomerName] = useState(order.customer_name);
  const [customerPhone, setCustomerPhone] = useState(order.customer_phone);
  const [customerDistrict, setCustomerDistrict] = useState(order.customer_district);
  const [customerAddress, setCustomerAddress] = useState(order.customer_address);

  const [deliveryCharge, setDeliveryCharge] = useState<number>(order.delivery_charge_bdt);
  const [discount, setDiscount] = useState<number>(order.discount_bdt);
  const [advancePaid, setAdvancePaid] = useState<number>(order.advance_paid_bdt);

  const [items, setItems] = useState<OrderItem[]>(order.items || []);
  const [notes, setNotes] = useState(order.notes || '');
  const [customTerms, setCustomTerms] = useState(order.custom_invoice_terms || '');
  const [customFooter, setCustomFooter] = useState(order.custom_invoice_footer || '');

  const brand = dbService.getBrandProfile();
  const currencySymbol = brand.currency?.match(/\((.*?)\)/)?.[1] || brand.currency || '$';

  // Calculate current subtotal from items
  const currentSubtotal = items.reduce((sum, it) => sum + (it.unit_price_bdt * it.quantity), 0);
  const currentTotal = Math.max(0, currentSubtotal + Number(deliveryCharge) - Number(discount));
  const currentCodDue = Math.max(0, currentTotal - Number(advancePaid));

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unit_price_bdt') {
      const q = field === 'quantity' ? Number(value) || 0 : item.quantity;
      const p = field === 'unit_price_bdt' ? Number(value) || 0 : item.unit_price_bdt;
      item.total_price_bdt = q * p;
    }
    updated[index] = item;
    setItems(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedOrder: Order = {
      ...order,
      invoice_no: invoiceNo.trim() || order.invoice_no,
      custom_invoice_title: customTitle.trim() || undefined,
      customer_name: customerName.trim() || order.customer_name,
      customer_phone: customerPhone.trim() || order.customer_phone,
      customer_district: customerDistrict.trim() || order.customer_district,
      customer_address: customerAddress.trim() || order.customer_address,
      items: items,
      subtotal_bdt: currentSubtotal,
      delivery_charge_bdt: Number(deliveryCharge) || 0,
      discount_bdt: Number(discount) || 0,
      total_amount_bdt: currentTotal,
      advance_paid_bdt: Number(advancePaid) || 0,
      notes: notes.trim() || undefined,
      custom_invoice_terms: customTerms.trim() || undefined,
      custom_invoice_footer: customFooter.trim() || undefined
    };

    dbService.saveOrder(updatedOrder);
    if (onOrderUpdated) onOrderUpdated(updatedOrder);
    if (onSave) onSave(updatedOrder);
    onClose();
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
                background: 'linear-gradient(135deg, var(--accent-primary), #06B6D4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <Edit3 size={22} />
            </div>
            <div>
              <h3 className="brand-font" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Edit Order Invoice: {order.invoice_no}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Customize details, items, or notes for this invoice.
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
        <form onSubmit={handleSave} style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Invoice Header Overrides */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                Invoice Number / Ref #
              </label>
              <input
                type="text"
                required
                value={invoiceNo}
                onChange={e => setInvoiceNo(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--accent-primary)', fontSize: '0.88rem', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                Specific Invoice Title (Leave blank for default)
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={e => setCustomTitle(e.target.value)}
                placeholder="e.g. TAX INVOICE or SPECIAL CLEARANCE INVOICE"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          {/* Customer / Consignee Information */}
          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} style={{ color: 'var(--accent-primary)' }} />
              <span>Bill To / Consignee Details</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Recipient Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.86rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Phone Number</label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.86rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>District</label>
                <input
                  type="text"
                  required
                  value={customerDistrict}
                  onChange={e => setCustomerDistrict(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.86rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Delivery Address</label>
              <input
                type="text"
                required
                value={customerAddress}
                onChange={e => setCustomerAddress(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.86rem' }}
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Package size={16} style={{ color: 'var(--accent-primary)' }} />
              <span>Invoice Product Line Items</span>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px 10px' }}>Item Description</th>
                    <th style={{ padding: '8px 10px', width: '90px' }}>Spec / Size</th>
                    <th style={{ padding: '8px 10px', width: '110px' }}>Color / Variant</th>
                    <th style={{ padding: '8px 10px', width: '70px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '8px 10px', width: '100px', textAlign: 'right' }}>Price ({currencySymbol})</th>
                    <th style={{ padding: '8px 10px', width: '100px', textAlign: 'right' }}>Total ({currencySymbol})</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '6px 10px' }}>
                        <input
                          type="text"
                          value={it.name}
                          onChange={e => handleItemChange(idx, 'name', e.target.value)}
                          style={{ width: '100%', padding: '5px 8px', borderRadius: '5px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                        />
                      </td>
                      <td style={{ padding: '6px 10px' }}>
                        <input
                          type="text"
                          value={it.size}
                          onChange={e => handleItemChange(idx, 'size', e.target.value)}
                          style={{ width: '100%', padding: '5px 8px', borderRadius: '5px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                        />
                      </td>
                      <td style={{ padding: '6px 10px' }}>
                        <input
                          type="text"
                          value={it.color}
                          onChange={e => handleItemChange(idx, 'color', e.target.value)}
                          style={{ width: '100%', padding: '5px 8px', borderRadius: '5px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                        />
                      </td>
                      <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                        <input
                          type="number"
                          min={1}
                          value={it.quantity}
                          onChange={e => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                          style={{ width: '56px', padding: '5px 4px', textAlign: 'center', borderRadius: '5px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                        />
                      </td>
                      <td style={{ padding: '6px 10px', textAlign: 'right' }}>
                        <input
                          type="number"
                          min={0}
                          value={it.unit_price_bdt}
                          onChange={e => handleItemChange(idx, 'unit_price_bdt', parseInt(e.target.value) || 0)}
                          style={{ width: '85px', padding: '5px 8px', textAlign: 'right', borderRadius: '5px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                        />
                      </td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--emerald)' }}>
                        {currencySymbol}{(it.quantity * it.unit_price_bdt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Summary Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', padding: '14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
            <div>
              <label style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Delivery Charge ({currencySymbol})</label>
              <input
                type="number"
                min={0}
                value={deliveryCharge}
                onChange={e => setDeliveryCharge(parseInt(e.target.value) || 0)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Discount ({currencySymbol})</label>
              <input
                type="number"
                min={0}
                value={discount}
                onChange={e => setDiscount(parseInt(e.target.value) || 0)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--ruby)', fontSize: '0.88rem', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Advance Paid ({currencySymbol})</label>
              <input
                type="number"
                min={0}
                value={advancePaid}
                onChange={e => setAdvancePaid(parseInt(e.target.value) || 0)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--emerald)', fontSize: '0.88rem', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.76rem', color: 'var(--accent-primary)', display: 'block', marginBottom: '4px', fontWeight: 800 }}>Cash To Collect / Due</label>
              <div style={{ padding: '7px 10px', borderRadius: '6px', backgroundColor: 'rgba(99, 102, 241, 0.12)', border: '1px solid var(--accent-primary)', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 800, textAlign: 'right' }}>
                {currencySymbol}{currentCodDue.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Notes & Special Instructions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                Specific Delivery Notes (Shown on invoice note box)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Call before delivery; deliver after 5 PM"
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.84rem', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                Specific Terms Override (Leave blank to use default)
              </label>
              <textarea
                rows={2}
                value={customTerms}
                onChange={e => setCustomTerms(e.target.value)}
                placeholder="Leave blank to use standard return policy"
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.84rem', resize: 'vertical' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>
              Specific Footer Thank You Banner (Leave blank to use brand default)
            </label>
            <input
              type="text"
              value={customFooter}
              onChange={e => setCustomFooter(e.target.value)}
              placeholder="e.g. Special festive greetings or custom customer thank you note"
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.84rem' }}
            />
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '10px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-color)'
            }}
          >
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
              <span>Save & Update Invoice</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
