import React, { useState, useEffect } from 'react';
import { X, History, CheckCircle2 } from 'lucide-react';
import type { Product } from '../../types/crm';
import { SearchableProductSelect } from '../orders/SearchableProductSelect';

interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  products: Product[];
  onAdjustStock: (productId: string, delta: number, reason: string, performedBy: string) => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  isOpen,
  onClose,
  product,
  products,
  onAdjustStock
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(product?.id || products[0]?.id || '');
  const [delta, setDelta] = useState<number>(10);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'deduct'>('add');
  const [reason, setReason] = useState<string>('New Supplier Inward Batch');
  const [performedBy, setPerformedBy] = useState<string>('Warehouse Manager');

  useEffect(() => {
    if (product) {
      setSelectedProductId(product.id);
    }
  }, [product]);

  if (!isOpen) return null;

  const currentProd = products.find(p => p.id === selectedProductId);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !delta || delta <= 0) {
      alert('Please select an item and enter a valid quantity.');
      return;
    }
    const finalDelta = adjustmentType === 'add' ? Number(delta) : -Number(delta);
    onAdjustStock(selectedProductId, finalDelta, reason, performedBy);
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
          width: '560px',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={20} style={{ color: 'var(--accent-primary)' }} />
            <h3 className="brand-font" style={{ fontSize: '1.2rem', fontWeight: 700 }}>Stock Adjustment</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Select Product / Variant
            </label>
            <SearchableProductSelect
              products={products}
              selectedProductId={selectedProductId}
              onSelect={id => setSelectedProductId(id)}
              showPrice={true}
              placeholder="Search product or variant to adjust..."
            />
          </div>

          {currentProd && (
            <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Current Stock Level</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{currentProd.stock_quantity} units</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>New Stock Level</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: adjustmentType === 'add' ? 'var(--emerald)' : 'var(--ruby)' }}>
                  {Math.max(0, currentProd.stock_quantity + (adjustmentType === 'add' ? Number(delta) : -Number(delta)))} units
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Adjustment Type</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setAdjustmentType('add')}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid', borderColor: adjustmentType === 'add' ? 'var(--emerald)' : 'var(--border-color)', backgroundColor: adjustmentType === 'add' ? 'var(--emerald-bg)' : 'transparent', color: adjustmentType === 'add' ? 'var(--emerald)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}
                >
                  + Add Stock
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentType('deduct')}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid', borderColor: adjustmentType === 'deduct' ? 'var(--ruby)' : 'var(--border-color)', backgroundColor: adjustmentType === 'deduct' ? 'var(--ruby-bg)' : 'transparent', color: adjustmentType === 'deduct' ? 'var(--ruby)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}
                >
                  - Deduct Stock
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Quantity Delta</label>
              <input
                type="number"
                min={1}
                value={delta}
                onChange={e => setDelta(parseInt(e.target.value) || 1)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Reason / Audit Category</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
            >
              <option value="New Supplier Inward Batch">New Supplier Inward Batch</option>
              <option value="Damaged / Defective Stock Write-off">Damaged / Defective Stock Write-off</option>
              <option value="Customer Return Restocked to Shelf">Customer Return Restocked to Shelf</option>
              <option value="Manual QA Physical Audit Correction">Manual QA Physical Audit Correction</option>
              <option value="Promotional Sample / Display">Promotional Sample / Display</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Performed By (Staff Name/Role)</label>
            <input
              type="text"
              value={performedBy}
              onChange={e => setPerformedBy(e.target.value)}
              placeholder="e.g. Warehouse Manager / Admin"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
            />
          </div>

          <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
              <CheckCircle2 size={16} />
              <span>Confirm Audit Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
