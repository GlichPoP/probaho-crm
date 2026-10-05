import React, { useState, useEffect } from 'react';
import { Search, X, ShoppingBag, Users, Package, ArrowRight } from 'lucide-react';
import type { Order, Customer, Product } from '../../types/crm';
import { useLocalization } from '../../i18n/LanguageContext';

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  orders?: Order[];
  customers?: Customer[];
  products?: Product[];
  onSelectOrder?: (order: Order) => void;
  onSelectCustomer?: (customer: Customer) => void;
  onSelectProduct?: (product: Product) => void;
  onNavigate?: (route: string, itemId?: string) => void;
}

export const CommandBar: React.FC<CommandBarProps> = ({
  isOpen,
  onClose,
  orders = [],
  customers = [],
  products = [],
  onSelectOrder,
  onSelectCustomer,
  onSelectProduct,
  onNavigate
}) => {
  const { currencySymbol } = useLocalization();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // Or trigger open via parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const matchedOrders = cleanQuery ? orders.filter(o => 
    o.invoice_no.toLowerCase().includes(cleanQuery) ||
    o.customer_name.toLowerCase().includes(cleanQuery) ||
    o.customer_phone.includes(cleanQuery) ||
    (o.tracking_id && o.tracking_id.toLowerCase().includes(cleanQuery))
  ).slice(0, 5) : [];

  const matchedCustomers = cleanQuery ? customers.filter(c =>
    c.name.toLowerCase().includes(cleanQuery) ||
    c.phone.includes(cleanQuery) ||
    c.district.toLowerCase().includes(cleanQuery)
  ).slice(0, 5) : [];

  const matchedProducts = cleanQuery ? products.filter(p =>
    p.name.toLowerCase().includes(cleanQuery) ||
    p.sku.toLowerCase().includes(cleanQuery) ||
    p.category.toLowerCase().includes(cleanQuery)
  ).slice(0, 5) : [];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '10vh',
      zIndex: 100
    }} className="animate-fade-in" onClick={onClose}>
      <div 
        onClick={e => e.stopPropagation()} 
        style={{
          width: '680px',
          maxHeight: '76vh',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Input Box */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <Search size={22} style={{ color: 'var(--accent-primary)' }} />
          <input
            type="text"
            placeholder="Search orders (INV-..), phones (017..), SKUs, or customer names..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '1.05rem',
              outline: 'none',
              fontFamily: 'Inter, sans-serif'
            }}
          />
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Results Box */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!cleanQuery && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)' }}>
              <Search size={36} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
              <p style={{ fontSize: '0.92rem', fontWeight: 500 }}>Type to instantly search across all Orders, Customers, and Products.</p>
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <span className="badge badge-info">Try: 01788...</span>
                <span className="badge badge-info">Try: INV-2026-00101</span>
                <span className="badge badge-info">Try: Panjabi</span>
              </div>
            </div>
          )}

          {cleanQuery && matchedOrders.length === 0 && matchedCustomers.length === 0 && matchedProducts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              No exact matches found for "{query}". Try a partial phone number or SKU.
            </div>
          )}

          {/* Matched Orders */}
          {matchedOrders.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Orders ({matchedOrders.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {matchedOrders.map(ord => (
                  <div
                    key={ord.id}
                    onClick={() => { if (onSelectOrder) onSelectOrder(ord); else if (onNavigate) onNavigate('orders', ord.id); onClose(); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-hover)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    className="hover-lift"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <ShoppingBag size={18} style={{ color: '#818CF8' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ord.invoice_no} • {ord.customer_name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{ord.sales_channel} ({ord.courier_name}) • {ord.delivery_status}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--emerald)' }}>{currencySymbol}{ord.total_amount_bdt.toLocaleString()}</span>
                      <ArrowRight size={16} style={{ color: 'var(--text-dim)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Customers */}
          {matchedCustomers.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Customers ({matchedCustomers.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {matchedCustomers.map(cust => (
                  <div
                    key={cust.id}
                    onClick={() => { if (onSelectCustomer) onSelectCustomer(cust); else if (onNavigate) onNavigate('customers', cust.id); onClose(); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-hover)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer'
                    }}
                    className="hover-lift"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Users size={18} style={{ color: '#34D399' }} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cust.name}</span>
                          <span className={`badge ${cust.segment === 'Blacklisted/RTO Risk' ? 'badge-danger' : 'badge-primary'}`}>{cust.segment}</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cust.phone} • {cust.district}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Spent: {currencySymbol}{cust.total_spent_bdt.toLocaleString()}</span>
                      <ArrowRight size={16} style={{ color: 'var(--text-dim)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Products */}
          {matchedProducts.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Products ({matchedProducts.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {matchedProducts.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => { if (onSelectProduct) onSelectProduct(prod); else if (onNavigate) onNavigate('inventory', prod.id); onClose(); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-hover)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Package size={18} style={{ color: '#F59E0B' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{prod.name} (Size: {prod.size})</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>SKU: {prod.sku} • {prod.category} • Color: {prod.color}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className={`badge ${prod.stock_quantity <= prod.low_stock_threshold ? 'badge-danger' : 'badge-success'}`}>
                        Stock: {prod.stock_quantity}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{currencySymbol}{prod.selling_price_bdt.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.1)' }}>
          <div>Press <kbd style={{ padding: '2px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>ESC</kbd> to exit search</div>
          <div>Instant 360° Search • PROBAHO CRM Solutions Engine</div>
        </div>
      </div>
    </div>
  );
};
