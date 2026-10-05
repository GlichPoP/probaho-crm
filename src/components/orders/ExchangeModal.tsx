import React, { useState } from 'react';
import { X, ArrowRightLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Order, Product, OrderItem } from '../../types/crm';
import { SearchableProductSelect } from './SearchableProductSelect';

interface ExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  products: Product[];
  onConfirmExchange: (originalOrderId: string, newItem: OrderItem) => void;
}

export const ExchangeModal: React.FC<ExchangeModalProps> = ({
  isOpen,
  onClose,
  order,
  products,
  onConfirmExchange
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('Size Issue - Fit too tight');

  if (!isOpen || !order) return null;

  const handleConfirm = () => {
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) {
      alert('Please select a product item to exchange.');
      return;
    }

    const newItem: OrderItem = {
      product_id: prod.id,
      sku: prod.sku,
      name: prod.name,
      size: prod.size,
      color: prod.color,
      quantity,
      unit_price_bdt: 0, // Replacement item is 0 BDT
      total_price_bdt: 0
    };

    onConfirmExchange(order.id, newItem);
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
      zIndex: 100
    }} className="animate-fade-in" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="glass-card"
        style={{
          width: '580px',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ArrowRightLeft size={20} style={{ color: '#818CF8' }} />
            <h3 className="brand-font" style={{ fontSize: '1.2rem', fontWeight: 700 }}>Product Exchange</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Original Order Summary */}
          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Original Order details</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#A5B4FC', marginTop: '4px' }}>
              {order.invoice_no} • {order.customer_name} ({order.customer_phone})
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Current Items: {order.items.map(i => `${i.quantity}x ${i.name} [Spec: ${i.size}]`).join(', ')}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--amber)', fontSize: '0.82rem', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--amber-bg)' }}>
            <AlertCircle size={16} />
            <span>Creates a zero-cost replacement order for courier exchange.</span>
          </div>

          {/* New Item Selector */}
          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Select Replacement Product / Variant
            </label>
            <SearchableProductSelect
              products={products}
              selectedProductId={selectedProductId}
              onSelect={id => setSelectedProductId(id)}
              showPrice={false}
              placeholder="Search replacement product or variant..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Quantity</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Exchange Reason</label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Fit too tight / Color change"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button type="button" onClick={handleConfirm} className="btn btn-primary">
            <CheckCircle2 size={16} />
            <span>Generate Exchange Challan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
