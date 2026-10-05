import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Package, AlertCircle } from 'lucide-react';
import type { Product } from '../../types/crm';
import { useLocalization } from '../../i18n/LanguageContext';

interface SearchableProductSelectProps {
  products: Product[];
  selectedProductId: string;
  onSelect: (productId: string) => void;
  placeholder?: string;
  showPrice?: boolean;
}

export const SearchableProductSelect: React.FC<SearchableProductSelectProps> = ({
  products,
  selectedProductId,
  onSelect,
  placeholder = "Search product by SKU, Name, Spec or Color...",
  showPrice = true
}) => {
  const { currencySymbol } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedProd = products.find(p => p.id === selectedProductId);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input and compute viewport clearance when dropdown opens
  useEffect(() => {
    if (isOpen) {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setOpenUpward(spaceBelow < 280 && rect.top > 280);
      }
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isOpen]);

  const filteredProducts = products.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.color.toLowerCase().includes(q) ||
      p.size.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  return (
    <div ref={containerRef} style={{ position: 'relative', flex: 1, width: '100%' }}>
      {/* Selected Box / Trigger */}
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setSearchQuery('');
        }}
        style={{
          padding: '10px 14px',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid',
          borderColor: isOpen ? 'var(--accent-primary)' : 'var(--border-color)',
          color: 'var(--text-main)',
          fontSize: '0.88rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          transition: 'all 0.15s ease',
          boxShadow: isOpen ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Package size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
          {selectedProd ? (
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <strong style={{ color: 'var(--accent-primary)' }}>[{selectedProd.sku}]</strong> {selectedProd.name}{' '}
              <span style={{ color: 'var(--text-dim)' }}>• Spec: {selectedProd.size} • Color: {selectedProd.color}</span>{' '}
              <span style={{ fontWeight: 600, color: selectedProd.stock_quantity <= selectedProd.low_stock_threshold ? 'var(--ruby)' : 'var(--emerald)' }}>
                (Stock: {selectedProd.stock_quantity})
              </span>
              {showPrice && <span style={{ fontWeight: 700, color: '#06B6D4' }}> - {currencySymbol}{selectedProd.selling_price_bdt}</span>}
            </span>
          ) : (
            <span style={{ color: 'var(--text-dim)' }}>{placeholder}</span>
          )}
        </div>
        <ChevronDown size={16} style={{ color: 'var(--text-dim)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease', flexShrink: 0 }} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            ...(openUpward ? { bottom: 'calc(100% + 6px)' } : { top: 'calc(100% + 6px)' }),
            left: 0,
            right: 0,
            maxHeight: '280px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-highlight)',
            borderRadius: '10px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
            zIndex: 1050,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
          className="animate-fade-in"
        >
          {/* Search Input inside Dropdown */}
          <div style={{ padding: '10px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={16} style={{ color: 'var(--text-dim)' }} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search by SKU, product name, specification, or color..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: '0.75rem', cursor: 'pointer', padding: '2px 6px' }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Product List */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '6px' }}>
            {filteredProducts.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={20} style={{ color: 'var(--amber)' }} />
                <span>No products found matching "{searchQuery}"</span>
              </div>
            ) : (
              filteredProducts.map(p => {
                const isSelected = p.id === selectedProductId;
                const isLow = p.stock_quantity <= p.low_stock_threshold;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelect(p.id);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      border: isSelected ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                      transition: 'background-color 0.1s ease',
                      marginBottom: '2px'
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        <span style={{ color: 'var(--accent-primary)', marginRight: '6px' }}>[{p.sku}]</span>
                        {p.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                        <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', fontWeight: 700, color: 'var(--text-main)' }}>
                          Spec: {p.size}
                        </span>
                        <span style={{ color: 'var(--text-dim)' }}>•</span>
                        <span style={{ color: 'var(--text-muted)' }}>Color: <strong>{p.color}</strong></span>
                        <span style={{ color: 'var(--text-dim)' }}>•</span>
                        <span style={{ fontWeight: 700, color: isLow ? 'var(--ruby)' : 'var(--emerald)' }}>
                          Stock: {p.stock_quantity} {isLow ? '(Low)' : ''}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {showPrice && (
                        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#06B6D4' }}>
                          {currencySymbol}{p.selling_price_bdt.toLocaleString()}
                        </span>
                      )}
                      {isSelected && <Check size={16} style={{ color: 'var(--accent-primary)' }} />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
