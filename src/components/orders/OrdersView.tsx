import React, { useState, useMemo } from 'react';
import { 
  Plus, Filter, Search, 
  Truck, ArrowRightLeft, FileText, Calendar, Clock, X, Edit, Check, ShoppingBag, Trash2 
} from 'lucide-react';
import type { Order, DeliveryStatus, Product, Customer } from '../../types/crm';
import { dbService } from '../../database/db';
import { useLocalization } from '../../i18n/LanguageContext';

interface OrdersViewProps {
  orders: Order[];
  products: Product[];
  customers: Customer[];
  onUpdateStatus: (orderId: string, status: DeliveryStatus) => void;
  onOpenNewOrder: () => void;
  onOpenExchange: (order: Order) => void;
  onViewChallan: (order: Order) => void;
  onUpdateOrder?: (updatedOrder: Order) => void;
  onDeleteOrder?: (orderId: string) => void;
}

const KANBAN_COLUMNS: { status: DeliveryStatus; label: string; color: string }[] = [
  { status: 'Order Placed', label: '1. Order Placed', color: '#6366F1' },
  { status: 'Packaging / Processing', label: '2. Packaging / Processing', color: '#F59E0B' },
  { status: 'Handed to Courier', label: '3. Handed to Courier', color: '#06B6D4' },
  { status: 'In Transit', label: '4. In Transit', color: '#A855F7' },
  { status: 'Delivered', label: '5. Delivered & COD', color: '#10B981' },
  { status: 'Returned/RTO', label: '6. Returned (RTO)', color: '#EF4444' }
];

const DEFAULT_TABLE_HEADERS = {
  colInvoice: 'Invoice & Date',
  colCustomer: 'Customer',
  colDistrict: 'District',
  colItems: 'Products & Specification',
  colCourier: 'Courier & Tracking',
  colAmount: 'Amount & Payment',
  colStatus: 'Delivery Status',
  colActions: 'Actions'
};

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onUpdateStatus,
  onOpenNewOrder,
  onOpenExchange,
  onViewChallan,
  onUpdateOrder,
  onDeleteOrder
}) => {
  const { currencySymbol } = useLocalization();

  const [channelFilter, setChannelFilter] = useState<string>('All');
  const [courierFilter, setCourierFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [datePreset, setDatePreset] = useState<string>('All');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [isEditingHeaders, setIsEditingHeaders] = useState<boolean>(false);
  const [isEditingRows, setIsEditingRows] = useState<boolean>(false);
  const [editingRowsData, setEditingRowsData] = useState<Record<string, Partial<Order>>>({});

  const [customHeaders, setCustomHeaders] = useState<typeof DEFAULT_TABLE_HEADERS>(() => {
    try {
      const saved = localStorage.getItem('vastra_orders_table_headers');
      if (saved) return { ...DEFAULT_TABLE_HEADERS, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to load custom table headers:', e);
    }
    return DEFAULT_TABLE_HEADERS;
  });

  const handleHeaderChange = (key: keyof typeof DEFAULT_TABLE_HEADERS, value: string) => {
    setCustomHeaders(prev => ({ ...prev, [key]: value }));
  };

  const handleRowFieldChange = <K extends keyof Order>(orderId: string, field: K, value: Order[K]) => {
    setEditingRowsData(prev => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || {}),
        [field]: value
      }
    }));
  };

  const handleSaveSingleRow = (orderId: string, origOrder: Order) => {
    const updated = { ...origOrder, ...(editingRowsData[orderId] || {}) };
    if (onUpdateOrder) {
      onUpdateOrder(updated);
    } else {
      dbService.updateOrderDetails(updated);
    }
    setEditingRowsData(prev => {
      const copy = { ...prev };
      delete copy[orderId];
      return copy;
    });
  };

  const handleSaveAllRows = () => {
    Object.keys(editingRowsData).forEach(orderId => {
      const orig = orders.find(o => o.id === orderId);
      if (orig && editingRowsData[orderId]) {
        const updated = { ...orig, ...editingRowsData[orderId] };
        if (onUpdateOrder) {
          onUpdateOrder(updated);
        } else {
          dbService.updateOrderDetails(updated);
        }
      }
    });
    setEditingRowsData({});
    setIsEditingRows(false);
  };

  // Filter logic
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (channelFilter !== 'All' && o.sales_channel !== channelFilter) return false;
      if (courierFilter !== 'All' && o.courier_name !== courierFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesId = o.invoice_no.toLowerCase().includes(q);
        const matchesName = o.customer_name.toLowerCase().includes(q);
        const matchesPhone = o.customer_phone.includes(q);
        const matchesTracking = o.tracking_id && o.tracking_id.toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesPhone && !matchesTracking) return false;
      }

      if (o.order_date) {
        const orderDateObj = new Date(o.order_date);
        if (!isNaN(orderDateObj.getTime())) {
          const now = new Date();
          if (datePreset === 'Today') {
            if (orderDateObj.toDateString() !== now.toDateString()) return false;
          } else if (datePreset === 'Yesterday') {
            const yesterday = new Date(now.getTime() - 86400000);
            if (orderDateObj.toDateString() !== yesterday.toDateString()) return false;
          } else if (datePreset === 'Last 7 Days') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            sevenDaysAgo.setHours(0, 0, 0, 0);
            if (orderDateObj < sevenDaysAgo) return false;
          } else if (datePreset === 'Last 30 Days') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            thirtyDaysAgo.setHours(0, 0, 0, 0);
            if (orderDateObj < thirtyDaysAgo) return false;
          } else if (datePreset === 'This Year') {
            if (orderDateObj.getFullYear() !== now.getFullYear()) return false;
          } else if (datePreset === 'Custom') {
            if (customStartDate) {
              const start = new Date(customStartDate + 'T00:00:00');
              if (orderDateObj < start) return false;
            }
            if (customEndDate) {
              const end = new Date(customEndDate + 'T23:59:59');
              if (orderDateObj > end) return false;
            }
          }

          if (startTime) {
            const [startHrs, startMins] = startTime.split(':').map(Number);
            const orderTotalMins = orderDateObj.getHours() * 60 + orderDateObj.getMinutes();
            if (orderTotalMins < startHrs * 60 + startMins) return false;
          }
          if (endTime) {
            const [endHrs, endMins] = endTime.split(':').map(Number);
            const orderTotalMins = orderDateObj.getHours() * 60 + orderDateObj.getMinutes();
            if (orderTotalMins > endHrs * 60 + endMins) return false;
          }
        }
      }

      return true;
    });
  }, [orders, channelFilter, courierFilter, searchQuery, datePreset, customStartDate, customEndDate, startTime, endTime]);

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }} className="animate-fade-in">
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="brand-font" style={{ fontSize: '1.75rem', fontWeight: 700 }}>Orders Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Track and manage orders, couriers, and delivery status.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onOpenNewOrder} className="btn btn-primary hover-lift">
            <Plus size={16} />
            <span>Create Order</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Top Row: Search, Channel, Courier */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px', backgroundColor: 'var(--bg-primary)', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <Search size={16} style={{ color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search invoice (INV-101), phone, tracking ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={15} style={{ color: 'var(--text-dim)' }} />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Channel:</span>
            <select
              value={channelFilter}
              onChange={e => setChannelFilter(e.target.value)}
              style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 12px', fontSize: '0.82rem', outline: 'none' }}
            >
              <option value="All">All Channels</option>
              <option value="Facebook Messenger">Facebook Messenger</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Website">Website</option>
              <option value="Instagram DM">Instagram DM</option>
              <option value="Showroom">Showroom</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={15} style={{ color: 'var(--text-dim)' }} />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Courier:</span>
            <select
              value={courierFilter}
              onChange={e => setCourierFilter(e.target.value)}
              style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 12px', fontSize: '0.82rem', outline: 'none' }}
            >
              <option value="All">All Couriers</option>
              {dbService.getDeliveryPartners().filter(p => p.is_active).map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bottom Row: Date & Time Period Filters & Order Summary Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Date Period:</span>
              <select
                value={datePreset}
                onChange={e => setDatePreset(e.target.value)}
                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 12px', fontSize: '0.82rem', fontWeight: 600, outline: 'none' }}
              >
                <option value="All">All Time (Total Orders)</option>
                <option value="Today">Today (Daily Orders)</option>
                <option value="Yesterday">Yesterday</option>
                <option value="Last 7 Days">Last 7 Days (1 Week)</option>
                <option value="Last 30 Days">Last 30 Days (1 Month)</option>
                <option value="This Year">This Year (1 Year)</option>
                <option value="Custom">Custom Date Range</option>
              </select>
            </div>

            {datePreset === 'Custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-primary)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>From Date:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                  style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none' }}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>To Date:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                  style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-primary)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <Clock size={14} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Time Window:</span>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none', fontWeight: 600 }}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>to</span>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none', fontWeight: 600 }}
              />
              {(startTime || endTime) && (
                <button
                  onClick={() => { setStartTime(''); setEndTime(''); }}
                  title="Clear Time Window"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0 4px' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Table Row Content Editing Action (Green Circle Area) */}
            {!isEditingRows ? (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setIsEditingRows(true)}
                  className="btn btn-secondary hover-lift"
                  style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', borderColor: 'var(--border-color)', color: 'var(--text-main)', cursor: 'pointer' }}
                  title="Edit order rows directly in table"
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
                {!isEditingHeaders ? (
                  <button
                    onClick={() => setIsEditingHeaders(true)}
                    className="btn btn-secondary hover-lift"
                    style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', borderColor: 'var(--border-color)', color: 'var(--text-muted)', cursor: 'pointer' }}
                    title="Rename table headers"
                  >
                    <span>⚙ Headers</span>
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', backgroundColor: 'var(--bg-primary)', padding: '3px 8px', borderRadius: '8px', border: '1px solid var(--accent-primary)' }}>
                    <button
                      onClick={() => {
                        localStorage.setItem('vastra_orders_table_headers', JSON.stringify(customHeaders));
                        setIsEditingHeaders(false);
                      }}
                      className="btn btn-primary hover-lift"
                      style={{ padding: '4px 8px', fontSize: '0.72rem', backgroundColor: '#10B981', borderColor: '#059669', cursor: 'pointer' }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setCustomHeaders(DEFAULT_TABLE_HEADERS);
                        localStorage.removeItem('vastra_orders_table_headers');
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '4px 6px', fontSize: '0.72rem', cursor: 'pointer' }}
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setIsEditingHeaders(false)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 6px', cursor: 'pointer' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: 'var(--bg-primary)', padding: '4px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Edit size={14} />
                  <span>Row Edit Mode:</span>
                </span>
                <button
                  onClick={handleSaveAllRows}
                  className="btn btn-primary hover-lift"
                  style={{ padding: '5px 14px', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#10B981', borderColor: '#059669', cursor: 'pointer' }}
                  title="Save all edits"
                >
                  <Check size={14} />
                  <span>Save All Edits ({Object.keys(editingRowsData).length})</span>
                </button>
                <button
                  onClick={() => {
                    setEditingRowsData({});
                    setIsEditingRows(false);
                  }}
                  className="btn btn-secondary hover-lift"
                  style={{ padding: '5px 10px', fontSize: '0.78rem', cursor: 'pointer' }}
                  title="Cancel edits"
                >
                  Cancel
                </button>
              </div>
            )}

            <div style={{ padding: '6px 14px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Orders Listed:</span>
              <strong style={{ fontSize: '0.95rem', color: 'var(--accent-primary)' }}>{filteredOrders.length}</strong>
            </div>
            {(channelFilter !== 'All' || courierFilter !== 'All' || datePreset !== 'All' || startTime || endTime || searchQuery) && (
              <button
                onClick={() => {
                  setChannelFilter('All');
                  setCourierFilter('All');
                  setDatePreset('All');
                  setStartTime('');
                  setEndTime('');
                  setCustomStartDate('');
                  setCustomEndDate('');
                  setSearchQuery('');
                }}
                className="btn btn-secondary hover-lift"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table View */}
      <div className="glass-card" style={{ flex: 1, overflowY: 'auto' }}>
        <table className="crm-table">
          <thead>
            <tr>
              <th style={{ width: '13%' }}>
                {isEditingHeaders ? (
                  <input
                    type="text"
                    value={customHeaders.colInvoice}
                    onChange={e => handleHeaderChange('colInvoice', e.target.value)}
                    style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--accent-primary)', color: 'var(--text-main)', fontSize: '0.78rem', fontWeight: 700, outline: 'none' }}
                  />
                ) : customHeaders.colInvoice}
              </th>
              <th style={{ width: '18%' }}>
                {isEditingHeaders ? (
                  <input
                    type="text"
                    value={customHeaders.colCustomer}
                    onChange={e => handleHeaderChange('colCustomer', e.target.value)}
                    style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--accent-primary)', color: 'var(--text-main)', fontSize: '0.78rem', fontWeight: 700, outline: 'none' }}
                  />
                ) : customHeaders.colCustomer}
              </th>
              <th style={{ width: '12%' }}>
                {isEditingHeaders ? (
                  <input
                    type="text"
                    value={customHeaders.colDistrict}
                    onChange={e => handleHeaderChange('colDistrict', e.target.value)}
                    style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--accent-primary)', color: 'var(--text-main)', fontSize: '0.78rem', fontWeight: 700, outline: 'none' }}
                  />
                ) : customHeaders.colDistrict}
              </th>
              <th style={{ width: '18%' }}>
                {isEditingHeaders ? (
                  <input
                    type="text"
                    value={customHeaders.colItems}
                    onChange={e => handleHeaderChange('colItems', e.target.value)}
                    style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--accent-primary)', color: 'var(--text-main)', fontSize: '0.78rem', fontWeight: 700, outline: 'none' }}
                  />
                ) : customHeaders.colItems}
              </th>
              <th style={{ width: '13%' }}>
                {isEditingHeaders ? (
                  <input
                    type="text"
                    value={customHeaders.colCourier}
                    onChange={e => handleHeaderChange('colCourier', e.target.value)}
                    style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--accent-primary)', color: 'var(--text-main)', fontSize: '0.78rem', fontWeight: 700, outline: 'none' }}
                  />
                ) : customHeaders.colCourier}
              </th>
              <th style={{ width: '13%' }}>
                {isEditingHeaders ? (
                  <input
                    type="text"
                    value={customHeaders.colAmount}
                    onChange={e => handleHeaderChange('colAmount', e.target.value)}
                    style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--accent-primary)', color: 'var(--text-main)', fontSize: '0.78rem', fontWeight: 700, outline: 'none' }}
                  />
                ) : customHeaders.colAmount}
              </th>
              <th style={{ width: '13%' }}>
                {isEditingHeaders ? (
                  <input
                    type="text"
                    value={customHeaders.colStatus}
                    onChange={e => handleHeaderChange('colStatus', e.target.value)}
                    style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--accent-primary)', color: 'var(--text-main)', fontSize: '0.78rem', fontWeight: 700, outline: 'none' }}
                  />
                ) : customHeaders.colStatus}
              </th>
              <th style={{ width: '8%', textAlign: 'right' }}>
                {isEditingHeaders ? (
                  <input
                    type="text"
                    value={customHeaders.colActions}
                    onChange={e => handleHeaderChange('colActions', e.target.value)}
                    style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--accent-primary)', color: 'var(--text-main)', fontSize: '0.78rem', fontWeight: 700, outline: 'none', textAlign: 'right' }}
                  />
                ) : customHeaders.colActions}
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--text-dim)' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <ShoppingBag size={28} style={{ color: 'var(--accent-primary)', opacity: 0.8 }} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '6px', color: 'var(--text-main)' }}>No orders in your system yet</div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto 18px' }}>
                    Ready to record your first sale? Click below to generate an invoice, assign courier tracking, and update stock.
                  </div>
                  <button onClick={onOpenNewOrder} className="btn btn-primary hover-lift" style={{ padding: '9px 20px', fontSize: '0.86rem' }}>
                    <Plus size={16} />
                    <span>Create Your First Order</span>
                  </button>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-dim)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '4px', color: 'var(--text-muted)' }}>No orders match filter criteria</div>
                  <div style={{ fontSize: '0.8rem' }}>Try adjusting your search query, date preset, or status tab.</div>
                </td>
              </tr>
            ) : (
              filteredOrders.map(ord => {
                const draft = editingRowsData[ord.id] || {};
                const getField = <K extends keyof Order>(field: K): Order[K] => {
                  return draft[field] !== undefined ? (draft[field] as Order[K]) : ord[field];
                };

                const initials = (ord.customer_name || 'U')
                  .split(' ')
                  .filter(Boolean)
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                const getStatusColor = (st: DeliveryStatus) => {
                  if (st === 'Delivered') return 'var(--emerald)';
                  if (st === 'Returned/RTO') return 'var(--ruby)';
                  if (st === 'In Transit' || st === 'Handed to Courier') return 'var(--cyan)';
                  if (st === 'Order Placed') return 'var(--accent-primary)';
                  if (st === 'Packaging / Processing' || st === 'Packing/Stitching') return 'var(--amber)';
                  return 'var(--amber)';
                };

                if (isEditingRows) {
                  return (
                    <tr key={ord.id} style={{ backgroundColor: 'rgba(16, 185, 129, 0.04)', borderBottom: '1px solid var(--border-color)' }}>
                      {/* Col 1: Invoice & Date */}
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <input
                            type="text"
                            value={getField('invoice_no') as string}
                            onChange={e => handleRowFieldChange(ord.id, 'invoice_no', e.target.value)}
                            placeholder="Invoice #"
                            style={{ width: '100%', padding: '4px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--accent-primary)', color: 'var(--text-main)', fontSize: '0.78rem', fontWeight: 700, outline: 'none' }}
                          />
                          <input
                            type="datetime-local"
                            value={getField('order_date') ? new Date(getField('order_date') as string).toISOString().slice(0, 16) : ''}
                            onChange={e => handleRowFieldChange(ord.id, 'order_date', e.target.value ? new Date(e.target.value).toISOString() : ord.order_date)}
                            style={{ width: '100%', padding: '2px 4px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-dim)', fontSize: '0.72rem', outline: 'none' }}
                          />
                        </div>
                      </td>

                      {/* Col 2: Customer Name, Phone & Address */}
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <input
                            type="text"
                            value={getField('customer_name') as string}
                            onChange={e => handleRowFieldChange(ord.id, 'customer_name', e.target.value)}
                            placeholder="Customer Name"
                            style={{ width: '100%', padding: '4px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--accent-primary)', color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: 600, outline: 'none' }}
                          />
                          <input
                            type="text"
                            value={getField('customer_phone') as string}
                            onChange={e => handleRowFieldChange(ord.id, 'customer_phone', e.target.value)}
                            placeholder="Phone Number"
                            style={{ width: '100%', padding: '3px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.76rem', fontFamily: 'monospace', outline: 'none' }}
                          />
                          <input
                            type="text"
                            value={getField('customer_address') as string}
                            onChange={e => handleRowFieldChange(ord.id, 'customer_address', e.target.value)}
                            placeholder="Full Address"
                            style={{ width: '100%', padding: '3px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-dim)', fontSize: '0.74rem', outline: 'none' }}
                          />
                        </div>
                      </td>

                      {/* Col 3: District */}
                      <td style={{ padding: '8px 10px' }}>
                        <input
                          type="text"
                          value={getField('customer_district') as string}
                          onChange={e => handleRowFieldChange(ord.id, 'customer_district', e.target.value)}
                          placeholder="District (e.g. Dhaka)"
                          style={{ width: '100%', padding: '5px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--accent-primary)', color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: 600, outline: 'none' }}
                        />
                      </td>

                      {/* Col 4: Apparel Items & Size */}
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '110px', overflowY: 'auto' }}>
                          {(getField('items') as Order['items']).map((it, idx) => (
                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 48px', gap: '4px', alignItems: 'center' }}>
                              <input
                                type="number"
                                min={1}
                                value={it.quantity}
                                onChange={e => {
                                  const newItems = [...(getField('items') as Order['items'])];
                                  const qty = Number(e.target.value) || 1;
                                  newItems[idx] = { ...newItems[idx], quantity: qty, total_price_bdt: qty * newItems[idx].unit_price_bdt };
                                  handleRowFieldChange(ord.id, 'items', newItems);
                                }}
                                style={{ padding: '3px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center' }}
                              />
                              <input
                                type="text"
                                value={it.name}
                                onChange={e => {
                                  const newItems = [...(getField('items') as Order['items'])];
                                  newItems[idx] = { ...newItems[idx], name: e.target.value };
                                  handleRowFieldChange(ord.id, 'items', newItems);
                                }}
                                style={{ padding: '3px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.78rem' }}
                              />
                              <input
                                type="text"
                                value={it.size}
                                onChange={e => {
                                  const newItems = [...(getField('items') as Order['items'])];
                                  newItems[idx] = { ...newItems[idx], size: e.target.value as any };
                                  handleRowFieldChange(ord.id, 'items', newItems);
                                }}
                                style={{ padding: '3px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.75rem', textAlign: 'center' }}
                              />
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Col 5: Courier & Tracking */}
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <input
                            type="text"
                            value={getField('courier_name') as string}
                            onChange={e => handleRowFieldChange(ord.id, 'courier_name', e.target.value as any)}
                            placeholder="Courier (Pathao/RedX)"
                            style={{ width: '100%', padding: '4px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: 600 }}
                          />
                          <input
                            type="text"
                            value={getField('tracking_id') || ''}
                            onChange={e => handleRowFieldChange(ord.id, 'tracking_id', e.target.value)}
                            placeholder="Tracking ID (#)"
                            style={{ width: '100%', padding: '3px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--cyan)', color: 'var(--cyan)', fontSize: '0.75rem', fontFamily: 'monospace' }}
                          />
                        </div>
                      </td>

                      {/* Col 6: Amount & Payment */}
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <span style={{ color: 'var(--emerald)', fontWeight: 800 }}>{currencySymbol}</span>
                            <input
                              type="number"
                              value={getField('total_amount_bdt') as number}
                              onChange={e => handleRowFieldChange(ord.id, 'total_amount_bdt', Number(e.target.value) || 0)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--emerald)', color: 'var(--emerald)', fontSize: '0.88rem', fontWeight: 800 }}
                            />
                          </div>
                          <select
                            value={getField('payment_status') as string}
                            onChange={e => handleRowFieldChange(ord.id, 'payment_status', e.target.value as any)}
                            style={{ width: '100%', padding: '3px 4px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.74rem', fontWeight: 600 }}
                          >
                            <option value="Paid">Paid</option>
                            <option value="COD Pending">COD Pending</option>
                            <option value="Unpaid">Unpaid</option>
                            <option value="Partial">Partial</option>
                          </select>
                        </div>
                      </td>

                      {/* Col 7: Delivery Status */}
                      <td style={{ padding: '8px 10px' }}>
                        <select
                          value={getField('delivery_status') === 'Packing/Stitching' ? 'Packaging / Processing' : (getField('delivery_status') as string)}
                          onChange={e => handleRowFieldChange(ord.id, 'delivery_status', e.target.value as DeliveryStatus)}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-main)',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            outline: 'none'
                          }}
                        >
                          {KANBAN_COLUMNS.map(c => (
                            <option key={c.status} value={c.status} style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>{c.label}</option>
                          ))}
                        </select>
                      </td>

                      {/* Col 8: Actions */}
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleSaveSingleRow(ord.id, ord)}
                            className="btn btn-primary hover-lift"
                            style={{ padding: '6px 10px', fontSize: '0.76rem', backgroundColor: editingRowsData[ord.id] ? '#10B981' : 'var(--bg-card)', borderColor: editingRowsData[ord.id] ? '#059669' : 'var(--border-color)', color: editingRowsData[ord.id] ? '#FFFFFF' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                            title="Save edits for this single order row"
                          >
                            <Check size={14} />
                            <span>{editingRowsData[ord.id] ? 'Save' : 'Ready'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={ord.id}>
                    <td style={{ padding: '9px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span className="chip-mono" style={{ color: 'var(--accent-primary)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>{ord.invoice_no}</span>
                        <span className="badge badge-primary" style={{ fontSize: '0.66rem', padding: '1px 6px' }}>{ord.sales_channel}</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} style={{ color: 'var(--text-dim)' }} />
                        <span>
                          {ord.order_date ? new Date(ord.order_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </span>
                        {ord.order_date && (
                          <>
                            <Clock size={11} style={{ color: 'var(--text-dim)', marginLeft: '3px' }} />
                            <span>
                              {new Date(ord.order_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar-circle">
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.86rem' }}>{ord.customer_name}</div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{ord.customer_phone}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      <span style={{ fontWeight: 500, fontSize: '0.84rem', color: 'var(--text-muted)' }}>{ord.customer_district}</span>
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {ord.items.map((it, idx) => (
                          <div key={idx} style={{ fontSize: '0.81rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{it.quantity}x</span>
                            <span style={{ color: 'var(--text-main)' }}>{it.name.slice(0, 20)}..</span>
                            <span className="chip-mono" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>{it.size}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-main)' }}>{ord.courier_name}</div>
                      <div style={{ marginTop: '2px' }}>
                        {ord.tracking_id ? (
                          <span className="chip-mono" style={{ fontSize: '0.72rem', color: 'var(--cyan)' }}>{ord.tracking_id}</span>
                        ) : (
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>No tracking</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      <div style={{ fontWeight: 800, color: 'var(--emerald)', fontSize: '0.92rem' }}>{currencySymbol}{ord.total_amount_bdt.toLocaleString()}</div>
                      <div style={{ marginTop: '2px' }}>
                        <span className={`badge ${ord.payment_status === 'Paid' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                          {ord.payment_status}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      <div className="status-pill" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
                        <div className="status-dot" style={{ backgroundColor: getStatusColor(ord.delivery_status), boxShadow: `0 0 6px ${getStatusColor(ord.delivery_status)}` }} />
                        <select
                          value={ord.delivery_status === 'Packing/Stitching' ? 'Packaging / Processing' : ord.delivery_status}
                          onChange={e => onUpdateStatus(ord.id, e.target.value as DeliveryStatus)}
                          style={{
                            padding: '3px 4px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: 'var(--text-main)',
                            fontSize: '0.77rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          {KANBAN_COLUMNS.map(c => (
                            <option key={c.status} value={c.status} style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td style={{ padding: '9px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button onClick={() => onViewChallan(ord)} className="btn btn-secondary" style={{ padding: '5px 8px', fontSize: '0.76rem' }} title="Print Invoice">
                          <FileText size={14} />
                        </button>
                        <button onClick={() => onOpenExchange(ord)} className="btn btn-secondary" style={{ padding: '5px 8px', fontSize: '0.76rem' }} title="Process Exchange">
                          <ArrowRightLeft size={14} style={{ color: 'var(--accent-primary)' }} />
                        </button>
                        {onDeleteOrder && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to cancel and delete Order [${ord.invoice_no}]? This will restore any deducted product inventory.`)) {
                                onDeleteOrder(ord.id);
                              }
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '5px 8px', fontSize: '0.76rem', color: 'var(--ruby)' }}
                            title="Delete / Cancel Order"
                          >
                            <Trash2 size={14} />
                          </button>
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
    </div>
  );
};
