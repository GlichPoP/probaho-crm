import React, { useState } from 'react';
import { Plus, AlertTriangle, Search, CheckCircle2, History, X, Package, Edit3, Check, Shield } from 'lucide-react';
import type { Product, ProductCategory } from '../../types/crm';
import { dbService } from '../../database/db';
import { getSegmentConfig, CLASSIC_COLORS } from '../../config/businessSegments';
import { useLocalization } from '../../i18n/LanguageContext';

interface InventoryViewProps {
  products: Product[];
  onOpenStockAdjust: (product?: Product) => void;
  onOpenNewProduct: () => void;
  onAddProduct?: (product: Product) => void;
  onUpdateProduct?: (product: Product) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  onOpenStockAdjust,
  onOpenNewProduct,
  onAddProduct,
  onUpdateProduct
}) => {
  const { currencySymbol } = useLocalization();
  // Brand profile & Active business segment
  const brandProfile = dbService.getBrandProfile();
  const currentSegment = getSegmentConfig(brandProfile?.business_type);

  // Dynamic Categories: Segment defaults + any existing product categories
  const dynamicCategories: (ProductCategory | 'All')[] = [
    'All',
    ...Array.from(new Set([...currentSegment.categories, ...products.map(p => p.category)]))
  ];

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Add New Product Modal State
  const [isAddVariantOpen, setIsAddVariantOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCategory, setNewCategory] = useState<string>(currentSegment.categories[0] || 'General');
  const [newSize, setNewSize] = useState<string>(currentSegment.specOptions[0] || 'Standard');
  const [newColor, setNewColor] = useState('');
  const [newWarranty, setNewWarranty] = useState<string>(currentSegment.secondaryAttribute?.options?.[0] || '');
  const [newUnit, setNewUnit] = useState<string>(currentSegment.secondaryAttribute?.options?.[0] || '');
  const [newCost, setNewCost] = useState<number>(1000);
  const [newPrice, setNewPrice] = useState<number>(2200);
  const [newStock, setNewStock] = useState<number>(10);
  const [newThreshold, setNewThreshold] = useState<number>(5);
  const [newDescription, setNewDescription] = useState('');

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editSize, setEditSize] = useState<string>('');
  const [editColor, setEditColor] = useState('');
  const [editWarranty, setEditWarranty] = useState<string>('');
  const [editUnit, setEditUnit] = useState<string>('');
  const [editCost, setEditCost] = useState<number>(1000);
  const [editPrice, setEditPrice] = useState<number>(2200);
  const [editStock, setEditStock] = useState<number>(10);
  const [editThreshold, setEditThreshold] = useState<number>(5);
  const [editDescription, setEditDescription] = useState('');

  const handleOpenAddModal = () => {
    setNewName('');
    setNewSku('');
    setNewCategory(currentSegment.categories[0] || 'General');
    setNewSize(currentSegment.specOptions[0] || 'Standard');
    setNewColor('');
    setNewWarranty(currentSegment.secondaryAttribute?.key === 'warranty' ? (currentSegment.secondaryAttribute.options?.[0] || '') : '');
    setNewUnit(currentSegment.secondaryAttribute?.key === 'unit' ? (currentSegment.secondaryAttribute.options?.[0] || '') : '');
    setNewCost(1000);
    setNewPrice(2200);
    setNewStock(10);
    setNewThreshold(5);
    setNewDescription('');
    setIsAddVariantOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditSku(prod.sku);
    setEditCategory(prod.category);
    setEditSize(prod.size);
    setEditColor(prod.color);
    setEditWarranty(prod.warranty || '');
    setEditUnit(prod.unit || '');
    setEditCost(prod.cost_price_bdt);
    setEditPrice(prod.selling_price_bdt);
    setEditStock(prod.stock_quantity);
    setEditThreshold(prod.low_stock_threshold);
    setEditDescription(prod.description || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editName.trim() || !editColor.trim()) {
      alert(`Please fill in Product Name and ${currentSegment.colorLabel}.`);
      return;
    }
    const updatedProduct: Product = {
      ...editingProduct,
      name: editName.trim(),
      sku: editSku.trim() || editingProduct.sku,
      category: editCategory,
      size: editSize,
      color: editColor.trim(),
      warranty: editWarranty || undefined,
      unit: editUnit || undefined,
      cost_price_bdt: Number(editCost) || 0,
      selling_price_bdt: Number(editPrice) || 0,
      stock_quantity: Number(editStock) || 0,
      low_stock_threshold: Number(editThreshold) || 5,
      description: editDescription.trim() || `${editName.trim()} - ${editSize} (${editColor.trim()})`
    };
    dbService.saveProduct(updatedProduct);
    if (onUpdateProduct) {
      onUpdateProduct(updatedProduct);
    }
    setEditingProduct(null);
  };

  const handleCreateVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newColor.trim()) {
      alert(`Please fill in Product Name and ${currentSegment.colorLabel}.`);
      return;
    }
    const catCode = (newCategory || 'PRD').slice(0, 3).toUpperCase();
    const colorCode = newColor.replace(/\s+/g, '').slice(0, 4).toUpperCase();
    const sizeCode = (newSize || 'STD').replace(/\s+/g, '').slice(0, 3).toUpperCase();
    const generatedSku = newSku.trim() || `${catCode}-${colorCode}-${sizeCode}`;

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      sku: generatedSku,
      name: newName.trim(),
      category: newCategory,
      size: newSize,
      color: newColor.trim(),
      warranty: newWarranty || undefined,
      unit: newUnit || undefined,
      stock_quantity: Number(newStock) || 0,
      low_stock_threshold: Number(newThreshold) || 5,
      cost_price_bdt: Number(newCost) || 0,
      selling_price_bdt: Number(newPrice) || 0,
      description: newDescription.trim() || `${newName.trim()} - ${newSize} (${newColor.trim()})`
    };
    dbService.saveProduct(newProduct);
    if (onAddProduct) {
      onAddProduct(newProduct);
    } else {
      onOpenNewProduct();
    }
    setIsAddVariantOpen(false);
  };

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.color.toLowerCase().includes(q);
    }
    return true;
  });

  const lowStockCount = products.filter(p => p.stock_quantity <= p.low_stock_threshold).length;
  const totalValuationBdt = products.reduce((sum, p) => sum + (p.cost_price_bdt * p.stock_quantity), 0);
  const totalRetailValuationBdt = products.reduce((sum, p) => sum + (p.selling_price_bdt * p.stock_quantity), 0);

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 className="brand-font" style={{ fontSize: '1.75rem', fontWeight: 700 }}>Inventory Catalog</h2>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: '99px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--accent-primary)',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              {currentSegment.title} Mode
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Manage products, variants, prices, and stock levels.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => onOpenStockAdjust()} className="btn btn-secondary hover-lift">
            <History size={16} style={{ color: '#A5B4FC' }} />
            <span>Quick Adjust Stock</span>
          </button>
          <button onClick={handleOpenAddModal} className="btn btn-primary hover-lift">
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Compact High-Density KPI Ribbon */}
      <div className="glass-card" style={{ padding: '12px 18px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', alignItems: 'center', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '14px', borderRight: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total SKU Variants</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>Across all categories</div>
          </div>
          <div style={{ fontSize: '1.24rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace', marginLeft: '8px' }}>
            {products.length}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '14px', borderRight: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: lowStockCount > 0 ? 'var(--ruby)' : 'var(--emerald)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Low Stock Alert Matrix</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>Requires restock</div>
          </div>
          <div style={{ fontSize: '1.24rem', fontWeight: 800, color: lowStockCount > 0 ? 'var(--ruby)' : 'var(--emerald)', fontFamily: 'monospace', marginLeft: '8px' }}>
            {lowStockCount}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '14px', borderRight: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#06B6D4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stock Cost Valuation</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>Inventory cost value</div>
          </div>
          <div style={{ fontSize: '1.24rem', fontWeight: 800, color: '#06B6D4', fontFamily: 'monospace', marginLeft: '8px' }}>
            {currencySymbol}{totalValuationBdt.toLocaleString()}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--emerald)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Expected Retail Revenue</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--emerald)', marginTop: '2px' }}>
              ~{currencySymbol}{(totalRetailValuationBdt - totalValuationBdt).toLocaleString()} margin
            </div>
          </div>
          <div style={{ fontSize: '1.24rem', fontWeight: 800, color: 'var(--emerald)', fontFamily: 'monospace', marginLeft: '8px' }}>
            {currencySymbol}{totalRetailValuationBdt.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px', backgroundColor: 'var(--bg-primary)', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <Search size={16} style={{ color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Search SKU code, product name, or color variation..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none', width: '100%' }}
          />
        </div>

        {/* Dynamic Category Pill Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {dynamicCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--border-highlight)' : 'var(--border-color)',
                backgroundColor: selectedCategory === cat ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--text-muted)',
                fontWeight: selectedCategory === cat ? 600 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Catalog Table */}
      <div className="glass-card" style={{ overflowX: 'auto' }}>
        <table className="crm-table">
          <thead>
            <tr>
              <th>SKU Code</th>
              <th>Product Name & Details</th>
              <th>Category</th>
              <th style={{ textAlign: 'center' }}>{currentSegment.specLabel}</th>
              <th>{currentSegment.colorLabel}</th>
              <th style={{ textAlign: 'right' }}>Price & Unit Cost</th>
              <th style={{ textAlign: 'center' }}>Stock Qty</th>
              <th>Status</th>
              <th>Quick Action</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--text-dim)' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <Package size={28} style={{ color: 'var(--accent-primary)', opacity: 0.8 }} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '6px', color: 'var(--text-main)' }}>Your inventory catalog is currently empty</div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 18px' }}>
                    Add products and variants to start tracking your inventory.
                  </div>
                  <button onClick={handleOpenAddModal} className="btn btn-primary hover-lift" style={{ padding: '9px 20px', fontSize: '0.86rem' }}>
                    <Plus size={16} />
                    <span>Add First Product</span>
                  </button>
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No products found matching your current search or category filter.
                </td>
              </tr>
            ) : (
              filteredProducts.map(prod => {
                const isLow = prod.stock_quantity <= prod.low_stock_threshold;
                return (
                  <tr key={prod.id}>
                    <td style={{ padding: '9px 14px' }}>
                      <strong style={{ color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{prod.sku}</strong>
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      <div style={{ fontWeight: 600 }}>{prod.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                        <span>{prod.description?.slice(0, 55) || 'Standard product variant'}</span>
                        {prod.warranty && (
                          <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Shield size={10} /> {prod.warranty}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>{prod.category}</span>
                    </td>
                    <td style={{ padding: '9px 14px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-hover)',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        fontSize: '0.84rem'
                      }}>
                        {prod.size} {prod.unit ? <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 400 }}>({prod.unit})</span> : ''}
                      </span>
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: CLASSIC_COLORS.find(c => c.name.toLowerCase() === prod.color.toLowerCase())?.hex ||
                            (prod.color.toLowerCase().includes('blue') ? '#3B82F6' :
                             prod.color.toLowerCase().includes('red') || prod.color.toLowerCase().includes('maroon') ? '#EF4444' :
                             prod.color.toLowerCase().includes('black') ? '#1E293B' :
                             prod.color.toLowerCase().includes('white') ? '#FFFFFF' :
                             prod.color.toLowerCase().includes('green') ? '#10B981' : 'var(--accent-primary)'),
                          border: '1px solid rgba(255,255,255,0.25)'
                        }} />
                        <span style={{ fontSize: '0.84rem' }}>{prod.color}</span>
                      </div>
                    </td>
                    <td style={{ padding: '9px 14px', textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--emerald)', fontFamily: 'monospace', fontSize: '0.88rem' }}>
                        {currencySymbol}{prod.selling_price_bdt.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'monospace', marginTop: '1px' }}>
                        Cost: {currencySymbol}{prod.cost_price_bdt.toLocaleString()}
                      </div>
                    </td>
                    <td style={{ padding: '9px 14px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        fontFamily: 'monospace',
                        backgroundColor: isLow ? 'var(--ruby-bg)' : 'rgba(16, 185, 129, 0.1)',
                        color: isLow ? 'var(--ruby)' : 'var(--emerald)'
                      }}>
                        {prod.stock_quantity}
                      </span>
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      {isLow ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--ruby)', fontSize: '0.74rem', fontWeight: 600 }}>
                          <AlertTriangle size={13} />
                          <span>Low Stock Alert</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--emerald)', fontSize: '0.74rem', fontWeight: 500 }}>
                          <CheckCircle2 size={13} />
                          <span>Optimal</span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="btn btn-secondary hover-lift"
                          style={{ padding: '5px 9px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Edit Product Details & Attributes"
                        >
                          <Edit3 size={13} style={{ color: 'var(--accent-primary)' }} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => onOpenStockAdjust(prod)}
                          className="btn btn-secondary hover-lift"
                          style={{ padding: '5px 9px', fontSize: '0.75rem' }}
                          title="Audit Adjust Stock"
                        >
                          <span>Adjust Qty</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add New Product Modal */}
      {isAddVariantOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.78)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }} className="animate-fade-in" onClick={() => setIsAddVariantOpen(false)}>
          <div onClick={e => e.stopPropagation()} className="glass-card" style={{ width: '680px', maxHeight: '92vh', overflowY: 'auto', padding: '28px', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
                  <Package size={22} />
                </div>
                <div>
                  <h3 className="brand-font" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                    Add New Product
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Segment: <strong>{currentSegment.title}</strong>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsAddVariantOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateVariant} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Product Title & Name *</label>
                <input
                  type="text"
                  required
                  placeholder={`e.g., ${currentSegment.id === 'clothing' ? 'Premium Egyptian Cotton Panjabi - Royal Navy' : currentSegment.id === 'electronics' ? 'Wireless Noise-Cancelling Earbuds Pro' : currentSegment.id === 'footwear' ? 'Handcrafted Genuine Leather Loafers' : currentSegment.id === 'cosmetics' ? 'Hydrating Vitamin C Glow Face Serum' : currentSegment.id === 'grocery' ? 'Pure Organic Mustard Oil (Cold Pressed)' : 'Stainless Steel Vacuum Insulated Flask'}`}
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.92rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                  >
                    {currentSegment.categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                    {currentSegment.specLabel} *
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select
                      value={currentSegment.specOptions.includes(newSize) ? newSize : 'Custom'}
                      onChange={e => {
                        if (e.target.value !== 'Custom') {
                          setNewSize(e.target.value);
                        }
                      }}
                      style={{ width: '110px', padding: '10px 10px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.84rem', outline: 'none' }}
                    >
                      {currentSegment.specOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                      <option value="Custom">Custom...</option>
                    </select>
                    <input
                      type="text"
                      placeholder={currentSegment.specPlaceholder}
                      value={newSize}
                      onChange={e => setNewSize(e.target.value)}
                      style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* Classic Colors Selection Palette */}
              <div style={{
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {currentSegment.colorLabel} * <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: 400 }}>(Quick Select Classic Colors)</span>
                  </label>
                  {newColor && (
                    <span style={{ fontSize: '0.76rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                      Selected: <strong>{newColor}</strong>
                    </span>
                  )}
                </div>

                {/* Classic Color Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {CLASSIC_COLORS.map(c => {
                    const isSelected = newColor.toLowerCase() === c.name.toLowerCase();
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setNewColor(c.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-secondary)',
                          color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                          fontSize: '0.75rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        className="hover-lift"
                      >
                        <span style={{
                          width: '11px',
                          height: '11px',
                          borderRadius: '50%',
                          backgroundColor: c.hex,
                          border: c.border ? `1px solid ${c.border}` : '1px solid rgba(255,255,255,0.25)'
                        }} />
                        <span>{c.name}</span>
                        {isSelected && <Check size={12} style={{ color: 'var(--accent-primary)', marginLeft: '2px' }} />}
                      </button>
                    );
                  })}
                </div>

                {/* Direct Color Text Input */}
                <input
                  type="text"
                  required
                  placeholder="Or enter custom shade name (e.g. Space Grey, Rose Gold, Off-White, Matte Black)..."
                  value={newColor}
                  onChange={e => setNewColor(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.86rem', outline: 'none' }}
                />
              </div>

              {/* Secondary Attributes: Warranty / Unit if applicable */}
              {currentSegment.secondaryAttribute && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  {currentSegment.secondaryAttribute.key === 'warranty' && (
                    <div>
                      <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                        {currentSegment.secondaryAttribute.label}
                      </label>
                      <select
                        value={newWarranty}
                        onChange={e => setNewWarranty(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                      >
                        {currentSegment.secondaryAttribute.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {currentSegment.secondaryAttribute.key === 'unit' && (
                    <div>
                      <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                        {currentSegment.secondaryAttribute.label}
                      </label>
                      <select
                        value={newUnit}
                        onChange={e => setNewUnit(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                      >
                        {currentSegment.secondaryAttribute.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Custom SKU Code (Optional)</label>
                  <input
                    type="text"
                    placeholder={`e.g., ${newCategory.slice(0,3).toUpperCase()}-${newColor.replace(/\s+/g,'').slice(0,4).toUpperCase() || 'CLR'}-${newSize.replace(/\s+/g,'').slice(0,3).toUpperCase() || 'STD'}`}
                    value={newSku}
                    onChange={e => setNewSku(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Specifications / Feature Notes</label>
                  <input
                    type="text"
                    placeholder="e.g., Materials, grade, package contents, or warranty details"
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Cost Price ({currencySymbol})</label>
                  <input
                    type="number"
                    min={0}
                    value={newCost}
                    onChange={e => setNewCost(parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Selling Price ({currencySymbol})</label>
                  <input
                    type="number"
                    min={0}
                    value={newPrice}
                    onChange={e => setNewPrice(parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--emerald)', fontWeight: 700, fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Initial Stock</label>
                  <input
                    type="number"
                    min={0}
                    value={newStock}
                    onChange={e => setNewStock(parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Min Alert Qty</label>
                  <input
                    type="number"
                    min={0}
                    value={newThreshold}
                    onChange={e => setNewThreshold(parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--ruby)', fontWeight: 700, fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                <button type="button" onClick={() => setIsAddVariantOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary hover-lift" style={{ padding: '10px 22px' }}>
                  <Plus size={16} /> Save Product to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Profile Modal */}
      {editingProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.78)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }} className="animate-fade-in" onClick={() => setEditingProduct(null)}>
          <div onClick={e => e.stopPropagation()} className="glass-card" style={{ width: '680px', maxHeight: '92vh', overflowY: 'auto', padding: '28px', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
                  <Edit3 size={22} />
                </div>
                <div>
                  <h3 className="brand-font" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                    Edit Product
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    SKU: <strong>{editingProduct.sku}</strong> ({currentSegment.title} Mode)
                  </div>
                </div>
              </div>
              <button onClick={() => setEditingProduct(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Product Title & Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.92rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Category</label>
                  <select
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                  >
                    {currentSegment.categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    {!currentSegment.categories.includes(editCategory) && (
                      <option value={editCategory}>{editCategory}</option>
                    )}
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                    {currentSegment.specLabel} *
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select
                      value={currentSegment.specOptions.includes(editSize) ? editSize : 'Custom'}
                      onChange={e => {
                        if (e.target.value !== 'Custom') {
                          setEditSize(e.target.value);
                        }
                      }}
                      style={{ width: '110px', padding: '10px 10px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.84rem', outline: 'none' }}
                    >
                      {currentSegment.specOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                      <option value="Custom">Custom...</option>
                    </select>
                    <input
                      type="text"
                      placeholder={currentSegment.specPlaceholder}
                      value={editSize}
                      onChange={e => setEditSize(e.target.value)}
                      style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* Classic Colors Selection Palette for Edit */}
              <div style={{
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {currentSegment.colorLabel} * <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: 400 }}>(Quick Select Classic Colors)</span>
                  </label>
                  {editColor && (
                    <span style={{ fontSize: '0.76rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                      Selected: <strong>{editColor}</strong>
                    </span>
                  )}
                </div>

                {/* Classic Color Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {CLASSIC_COLORS.map(c => {
                    const isSelected = editColor.toLowerCase() === c.name.toLowerCase();
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setEditColor(c.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-secondary)',
                          color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                          fontSize: '0.75rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        className="hover-lift"
                      >
                        <span style={{
                          width: '11px',
                          height: '11px',
                          borderRadius: '50%',
                          backgroundColor: c.hex,
                          border: c.border ? `1px solid ${c.border}` : '1px solid rgba(255,255,255,0.25)'
                        }} />
                        <span>{c.name}</span>
                        {isSelected && <Check size={12} style={{ color: 'var(--accent-primary)', marginLeft: '2px' }} />}
                      </button>
                    );
                  })}
                </div>

                {/* Direct Color Text Input */}
                <input
                  type="text"
                  required
                  placeholder="Or enter custom shade name..."
                  value={editColor}
                  onChange={e => setEditColor(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.86rem', outline: 'none' }}
                />
              </div>

              {/* Secondary Attributes if applicable */}
              {currentSegment.secondaryAttribute && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  {currentSegment.secondaryAttribute.key === 'warranty' && (
                    <div>
                      <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                        {currentSegment.secondaryAttribute.label}
                      </label>
                      <select
                        value={editWarranty}
                        onChange={e => setEditWarranty(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                      >
                        {currentSegment.secondaryAttribute.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {currentSegment.secondaryAttribute.key === 'unit' && (
                    <div>
                      <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                        {currentSegment.secondaryAttribute.label}
                      </label>
                      <select
                        value={editUnit}
                        onChange={e => setEditUnit(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                      >
                        {currentSegment.secondaryAttribute.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>SKU Code</label>
                  <input
                    type="text"
                    value={editSku}
                    onChange={e => setEditSku(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Specifications / Feature Notes</label>
                  <input
                    type="text"
                    placeholder="e.g., Materials, grade, package contents, or warranty details"
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Cost Price ({currencySymbol})</label>
                  <input
                    type="number"
                    min={0}
                    value={editCost}
                    onChange={e => setEditCost(parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Selling Price ({currencySymbol})</label>
                  <input
                    type="number"
                    min={0}
                    value={editPrice}
                    onChange={e => setEditPrice(parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--emerald)', fontWeight: 700, fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Stock Qty</label>
                  <input
                    type="number"
                    min={0}
                    value={editStock}
                    onChange={e => setEditStock(parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Min Alert Qty</label>
                  <input
                    type="number"
                    min={0}
                    value={editThreshold}
                    onChange={e => setEditThreshold(parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--ruby)', fontWeight: 700, fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                <button type="button" onClick={() => setEditingProduct(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary hover-lift" style={{ padding: '10px 22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
