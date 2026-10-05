import React, { useState, useMemo } from 'react';
import { 
  FileText, Search, Printer, CheckSquare, Square, 
  Truck, Phone, MapPin, CheckCircle2, Share2,
  MessageSquare, Camera, Copy, Check, X, Calendar, Clock,
  Edit3, Sliders
} from 'lucide-react';
import type { Order, DeliveryStatus } from '../../types/crm';
import { dbService } from '../../database/db';
import { BatchChallanPrintModal } from './BatchChallanPrintModal';
import { DefaultInvoiceEditorModal } from './DefaultInvoiceEditorModal';
import { SpecificInvoiceEditorModal } from './SpecificInvoiceEditorModal';
import { useLocalization } from '../../i18n/LanguageContext';

interface ChallanInvoicesViewProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: DeliveryStatus) => void;
  onViewChallan: (order: Order) => void;
  onUpdateTracking?: (orderId: string, trackingId: string) => void;
  onRefreshOrders?: () => void;
}

export const ChallanInvoicesView: React.FC<ChallanInvoicesViewProps> = ({
  orders,
  onUpdateStatus,
  onViewChallan,
  onUpdateTracking: _onUpdateTracking,
  onRefreshOrders
}) => {
  const { currencySymbol, currentCountryConfig } = useLocalization();
  const [brand, setBrand] = useState(dbService.getBrandProfile());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [courierFilter, setCourierFilter] = useState<string>('All');
  const [datePreset, setDatePreset] = useState<string>('All');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [showManifestModal, setShowManifestModal] = useState(false);
  const [manifestCourier, setManifestCourier] = useState('Pathao Courier');
  const [shareOrderModal, setShareOrderModal] = useState<Order | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'whatsapp' | 'messenger' | 'instagram'>('whatsapp');
  const [copySuccessToast, setCopySuccessToast] = useState<string | null>(null);
  const [batchPrintOrders, setBatchPrintOrders] = useState<Order[] | null>(null);
  const [isDefaultInvoiceEditorOpen, setIsDefaultInvoiceEditorOpen] = useState(false);
  const [editingSpecificOrder, setEditingSpecificOrder] = useState<Order | null>(null);

  // Filter logic
  const filteredOrders = useMemo(() => {
    return orders.filter(ord => {
      if (statusFilter !== 'All') {
        if (statusFilter === 'Pending Challan' && (ord.delivery_status !== 'Order Placed' && ord.delivery_status !== 'Packing/Stitching' && ord.delivery_status !== 'Packaging / Processing')) return false;
        if (statusFilter === 'Handed / Manifested' && ord.delivery_status !== 'Handed to Courier') return false;
        if (statusFilter === 'In Transit' && ord.delivery_status !== 'In Transit') return false;
        if (statusFilter === 'Delivered' && ord.delivery_status !== 'Delivered') return false;
        if (statusFilter === 'Returned / RTO' && ord.delivery_status !== 'Returned/RTO') return false;
      }
      if (courierFilter !== 'All' && ord.courier_name !== courierFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inv = ord.invoice_no.toLowerCase();
        const name = ord.customer_name.toLowerCase();
        const phone = ord.customer_phone.toLowerCase();
        const dist = ord.customer_district.toLowerCase();
        const track = (ord.tracking_id || '').toLowerCase();
        if (!(inv.includes(q) || name.includes(q) || phone.includes(q) || dist.includes(q) || track.includes(q))) {
          return false;
        }
      }

      if (ord.order_date) {
        const orderDateObj = new Date(ord.order_date);
        if (!isNaN(orderDateObj.getTime())) {
          const now = new Date();
          if (datePreset === 'Today') {
            if (orderDateObj.toDateString() !== now.toDateString()) return false;
          } else if (datePreset === 'Yesterday') {
            const yesterday = new Date(now.getTime() - 86400000);
            if (orderDateObj.toDateString() !== yesterday.toDateString()) return false;
          } else if (datePreset === 'Last 7 Days') {
            const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
            if (orderDateObj < sevenDaysAgo) return false;
          } else if (datePreset === 'Last 30 Days') {
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
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
  }, [orders, statusFilter, courierFilter, searchQuery, datePreset, customStartDate, customEndDate, startTime, endTime]);

  // KPI Calculations
  const totalInvoicesCount = orders.length;
  const pendingChallanCount = orders.filter(o => o.delivery_status === 'Order Placed' || o.delivery_status === 'Packing/Stitching' || o.delivery_status === 'Packaging / Processing').length;
  const manifestedCount = orders.filter(o => o.delivery_status === 'Handed to Courier' || o.delivery_status === 'In Transit').length;
  const totalInvoicesValuation = orders.reduce((sum, o) => sum + (o.total_amount_bdt || 0), 0);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedOrderIds.size === filteredOrders.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedOrderIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedOrderIds(next);
  };

  const selectedOrdersList = useMemo(() => {
    return orders.filter(o => selectedOrderIds.has(o.id));
  }, [orders, selectedOrderIds]);

  const handleBatchPrintChallans = () => {
    if (selectedOrdersList.length === 0) {
      if (filteredOrders.length === 0) {
        alert('No invoices found matching the current filters to print.');
        return;
      }
      const confirmSelectAll = window.confirm(
        `No invoices currently checked.\n\nWould you like to select all ${filteredOrders.length} listed invoices/challans and open the Batch A4 Print Preview right now?`
      );
      if (confirmSelectAll) {
        setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
        setBatchPrintOrders(filteredOrders);
      }
      return;
    }
    // Open all selected orders in Batch A4 Print modal
    setBatchPrintOrders(selectedOrdersList);
  };

  const handleBatchMarkHanded = () => {
    if (selectedOrderIds.size === 0) return;
    if (window.confirm(`Mark ${selectedOrderIds.size} selected parcels as 'Handed to Courier'?`)) {
      selectedOrderIds.forEach(id => {
        onUpdateStatus(id, 'Handed to Courier');
      });
      setSelectedOrderIds(new Set());
    }
  };

  const handleOpenManifest = () => {
    if (selectedOrdersList.length === 0) {
      if (filteredOrders.length === 0) {
        alert('No parcels found matching the current filters.');
        return;
      }
      const confirmSelectAll = window.confirm(
        `No parcels currently checked.\n\nWould you like to select all ${filteredOrders.length} listed parcels to generate the Courier Manifest Sheet right now?`
      );
      if (confirmSelectAll) {
        setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
        setShowManifestModal(true);
      }
      return;
    }
    setShowManifestModal(true);
  };

  const handlePrintManifest = () => {
    window.print();
  };

  const getWhatsAppSlipText = (ord: Order) => {
    const businessName = brand.brand_name || 'PROBAHO CRM Solutions';
    return `Hello *${ord.customer_name}*,\nYour ${businessName} order *#${ord.invoice_no}* has been processed & confirmed!\n\n📦 *Order Items*:\n${ord.items.map(it => `• ${it.quantity}x ${it.name}${it.size ? ` (Size: *${it.size}*${it.color ? ` - ${it.color}` : ''})` : ''}`).join('\n')}\n\n💵 *Total COD Payable*: ${currencySymbol}${ord.total_amount_bdt.toLocaleString()}\n🚚 *Courier Partner*: ${ord.courier_name}\n${ord.tracking_id ? `🔗 *Tracking ID*: ${ord.tracking_id}\n` : ''}\nThank you for choosing ${businessName}!`;
  };

  const getMessengerSlipText = (ord: Order) => {
    const businessName = brand.brand_name || 'PROBAHO CRM Solutions';
    return `Hello ${ord.customer_name},\nYour ${businessName} order #${ord.invoice_no} has been processed & confirmed!\n\n📦 Order Items:\n${ord.items.map(it => `• ${it.quantity}x ${it.name}${it.size ? ` [Size: ${it.size}${it.color ? ` - ${it.color}` : ''}]` : ''}`).join('\n')}\n\n💵 Total COD Payable: ${currencySymbol}${ord.total_amount_bdt.toLocaleString()}\n🚚 Courier Partner: ${ord.courier_name}\n${ord.tracking_id ? `🔗 Tracking ID: ${ord.tracking_id}\n` : ''}\nThank you for choosing ${businessName}!`;
  };

  const getInstagramSlipText = (ord: Order) => {
    const businessName = brand.brand_name || 'PROBAHO CRM Solutions';
    return `Hey ${ord.customer_name}! ✨\nYour ${businessName} order #${ord.invoice_no} is processed & ready for dispatch!\n\n📦 Items:\n${ord.items.map(it => `• ${it.quantity}x ${it.name}${it.size ? ` (${it.size}${it.color ? ` / ${it.color}` : ''})` : ''}`).join('\n')}\n\n💵 Total COD Payable: ${currencySymbol}${ord.total_amount_bdt.toLocaleString()}\n🚚 Courier: ${ord.courier_name}\n${ord.tracking_id ? `🔗 Tracking ID: ${ord.tracking_id}\n` : ''}\nThanks for shopping with ${businessName}! ✨`;
  };

  const handleShareChannel = (channel: 'whatsapp' | 'messenger' | 'instagram' | 'email', ord: Order) => {
    if (channel === 'whatsapp') {
      const text = getWhatsAppSlipText(ord);
      const cleanPhone = ord.customer_phone.replace(/[^0-9]/g, '');
      const phonePrefix = currentCountryConfig?.phoneCode?.replace('+', '') || '1';
      const phoneWithCountry = cleanPhone.startsWith(phonePrefix) ? cleanPhone : `${phonePrefix}${cleanPhone}`;
      window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`, '_blank');
    } else if (channel === 'messenger') {
      const text = getMessengerSlipText(ord);
      navigator.clipboard.writeText(text);
      setCopySuccessToast('✅ Formatted FB Messenger slip copied to clipboard! Opening Messenger...');
      setTimeout(() => {
        window.open('https://www.messenger.com/', '_blank');
        setCopySuccessToast(null);
      }, 1200);
    } else if (channel === 'instagram') {
      const text = getInstagramSlipText(ord);
      navigator.clipboard.writeText(text);
      setCopySuccessToast('✅ Formatted Instagram DM slip copied to clipboard! Opening Instagram...');
      setTimeout(() => {
        window.open('https://www.instagram.com/direct/inbox/', '_blank');
        setCopySuccessToast(null);
      }, 1200);
    } else if (channel === 'email') {
      const text = getMessengerSlipText(ord);
      const emailSubject = `${brand.brand_name || 'Order Update'} - Invoice #${ord.invoice_no}`;
      window.open(`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }} className="animate-fade-in">
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="brand-font" style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText style={{ color: 'var(--accent-primary)' }} />
            <span>Challan & Invoice Management Hub</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Print A4 packing challans, courier manifests, and invoices.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsDefaultInvoiceEditorOpen(true)}
            className="btn btn-secondary hover-lift"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Edit default invoice template and logo"
          >
            <Sliders size={16} />
            <span>Invoice Settings & Logo</span>
          </button>

          <button 
            onClick={handleOpenManifest}
            className="btn btn-secondary hover-lift"
            style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38BDF8', cursor: 'pointer' }}
          >
            <Truck size={16} />
            <span>Generate Courier Manifest ({selectedOrderIds.size})</span>
          </button>

          <button 
            onClick={handleBatchPrintChallans}
            className="btn btn-primary hover-lift pulse-alert"
            style={{ cursor: 'pointer' }}
          >
            <Printer size={16} />
            <span>Batch Print Invoices ({selectedOrderIds.size})</span>
          </button>
        </div>
      </div>

      {/* Compact High-Density KPI Ribbon */}
      <div className="glass-card" style={{ padding: '12px 18px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', alignItems: 'center', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '14px', borderRight: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Invoices Issued</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>Total issued</div>
          </div>
          <div style={{ fontSize: '1.24rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace', marginLeft: '8px' }}>
            {totalInvoicesCount}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '14px', borderRight: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--amber)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Challan Printing</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>Needs printing</div>
          </div>
          <div style={{ fontSize: '1.24rem', fontWeight: 800, color: 'var(--amber)', fontFamily: 'monospace', marginLeft: '8px' }}>
            {pendingChallanCount}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '14px', borderRight: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#38BDF8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Dispatched / Manifested</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>In courier transit</div>
          </div>
          <div style={{ fontSize: '1.24rem', fontWeight: 800, color: '#38BDF8', fontFamily: 'monospace', marginLeft: '8px' }}>
            {manifestedCount}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--emerald)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Gross Invoice Valuation</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>Total billed amount</div>
          </div>
          <div style={{ fontSize: '1.24rem', fontWeight: 800, color: 'var(--emerald)', fontFamily: 'monospace', marginLeft: '8px' }}>
            {currencySymbol}{totalInvoicesValuation.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Top Row: Search, Status Tabs, Courier */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px', backgroundColor: 'var(--bg-primary)', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <Search size={16} style={{ color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search invoice (#INV-101), customer phone (017..), district, or tracking ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none', width: '100%' }}
            />
          </div>

          {/* Invoice Status Pill Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['All', 'Pending Challan', 'Handed / Manifested', 'In Transit', 'Delivered', 'Returned / RTO'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '6px 13px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: statusFilter === st ? 'var(--border-highlight)' : 'var(--border-color)',
                  backgroundColor: statusFilter === st ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  color: statusFilter === st ? 'var(--accent-primary)' : 'var(--text-muted)',
                  fontWeight: statusFilter === st ? 600 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Courier Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={15} style={{ color: 'var(--text-dim)' }} />
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

        {/* Bottom Row: Date Period, Time Window & Invoices Summary Badge */}
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
                <option value="All">All Time (Total Invoices)</option>
                <option value="Today">Today (Daily Invoices)</option>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {/* Bulk Actions transferred to the green marked space inside the filter row */}
            {selectedOrderIds.size > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '4px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                animation: 'fadeIn 0.18s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.82rem', color: 'var(--accent-primary)' }}>
                  <CheckSquare size={15} />
                  <span>{selectedOrderIds.size} checked</span>
                </div>
                <button
                  onClick={handleBatchMarkHanded}
                  className="btn btn-secondary hover-lift"
                  style={{ padding: '4px 10px', fontSize: '0.78rem', height: '28px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  title="Mark all selected invoices as Handed to Courier"
                >
                  <CheckCircle2 size={14} style={{ color: 'var(--emerald)' }} />
                  <span>Mark Handed to Courier</span>
                </button>
                <button
                  onClick={() => setSelectedOrderIds(new Set())}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer', padding: '2px 6px', fontWeight: 600 }}
                  title="Clear checkmarks"
                >
                  Clear Selection
                </button>
              </div>
            )}

            <div style={{ padding: '6px 14px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Invoices Listed:</span>
              <strong style={{ fontSize: '0.95rem', color: 'var(--accent-primary)' }}>{filteredOrders.length}</strong>
            </div>
            {(statusFilter !== 'All' || courierFilter !== 'All' || datePreset !== 'All' || startTime || endTime || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter('All');
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

      {/* Invoices Table */}
      <div className="glass-card" style={{ flex: 1, overflowY: 'auto' }}>
        <table className="crm-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                <button onClick={handleSelectAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0 ? (
                    <CheckSquare size={16} style={{ color: 'var(--accent-primary)' }} />
                  ) : (
                    <Square size={16} style={{ color: 'var(--text-dim)' }} />
                  )}
                </button>
              </th>
              <th style={{ width: '14%' }}>Invoice # & Date</th>
              <th style={{ width: '20%' }}>Customer & Destination</th>
              <th style={{ width: '18%' }}>Products Summary</th>
              <th style={{ width: '15%' }}>Courier & Tracking ID</th>
              <th style={{ width: '11%', textAlign: 'right' }}>Billing ({currencySymbol})</th>
              <th style={{ width: '12%', textAlign: 'center' }}>Dispatch Status</th>
              <th style={{ width: '10%', textAlign: 'right' }}>Invoice Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-dim)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '4px', color: 'var(--text-muted)' }}>No challans or invoices found matching filters</div>
                  <div style={{ fontSize: '0.8rem' }}>Try modifying your search query, date selection, or courier filter.</div>
                </td>
              </tr>
            ) : (
              filteredOrders.map(ord => {
                const isChecked = selectedOrderIds.has(ord.id);
                const initials = (ord.customer_name || 'U')
                  .split(' ')
                  .filter(Boolean)
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                const getStatusDotColor = (st: string) => {
                  if (st === 'Delivered') return 'var(--emerald)';
                  if (st === 'Returned/RTO') return 'var(--ruby)';
                  if (st === 'In Transit' || st === 'Handed to Courier') return 'var(--cyan)';
                  if (st === 'Ready to Ship' || st === 'QC Check') return 'var(--accent-primary)';
                  return 'var(--amber)';
                };

                return (
                  <tr key={ord.id} style={{ backgroundColor: isChecked ? 'rgba(99, 102, 241, 0.08)' : 'transparent' }}>
                    <td style={{ padding: '9px 14px', textAlign: 'center' }} onClick={e => handleToggleSelect(ord.id, e)}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isChecked ? (
                          <CheckSquare size={16} style={{ color: 'var(--accent-primary)' }} />
                        ) : (
                          <Square size={16} style={{ color: 'var(--text-dim)' }} />
                        )}
                      </button>
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span className="chip-mono" style={{ color: 'var(--accent-primary)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>{ord.invoice_no}</span>
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
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div className="avatar-circle">
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.86rem' }}>{ord.customer_name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                            <Phone size={11} />
                            <span>{ord.customer_phone}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                            <MapPin size={11} />
                            <span>{ord.customer_district} ({ord.customer_address.slice(0, 22)}..)</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      <div style={{ fontSize: '0.81rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {ord.items.map((it, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{it.quantity}x</span>
                            <span>{it.name.slice(0, 20)}..</span>
                            <span className="chip-mono" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>{it.size}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>{ord.courier_name}</div>
                      <div style={{ marginTop: '2px' }}>
                        {ord.tracking_id ? (
                          <span className="chip-mono" style={{ fontSize: '0.72rem', color: 'var(--cyan)' }}>{ord.tracking_id}</span>
                        ) : (
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>No tracking</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '9px 14px', textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--emerald)' }}>{currencySymbol}{ord.total_amount_bdt.toLocaleString()}</div>
                      <div style={{ marginTop: '2px' }}>
                        <span className={`badge ${ord.payment_status === 'Paid' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                          {ord.payment_status}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '9px 14px', textAlign: 'center' }}>
                      <div className="status-pill" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
                        <div className="status-dot" style={{ backgroundColor: getStatusDotColor(ord.delivery_status), boxShadow: `0 0 6px ${getStatusDotColor(ord.delivery_status)}` }} />
                        <span style={{ fontSize: '0.76rem' }}>
                          {ord.delivery_status === 'Order Placed' || ord.delivery_status === 'Packing/Stitching' ? 'Challan Needed' : ord.delivery_status}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '9px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setEditingSpecificOrder(ord)}
                          className="btn btn-secondary hover-lift"
                          style={{ padding: '5px 9px', fontSize: '0.75rem', borderColor: 'rgba(99, 102, 241, 0.4)' }}
                          title="Edit this specific order's invoice (title, items, amounts, notes)"
                        >
                          <Edit3 size={14} style={{ color: 'var(--accent-primary)' }} />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => onViewChallan(ord)}
                          className="btn btn-secondary hover-lift"
                          style={{ padding: '5px 9px', fontSize: '0.75rem' }}
                          title="Preview & Print A4 Invoice"
                        >
                          <Printer size={14} style={{ color: 'var(--accent-primary)' }} />
                          <span>Invoice</span>
                        </button>

                        <button
                          onClick={() => {
                            setShareOrderModal(ord);
                            setActivePreviewTab('whatsapp');
                            setCopySuccessToast(null);
                          }}
                          className="btn btn-secondary hover-lift"
                          style={{ padding: '5px 9px', fontSize: '0.75rem' }}
                          title="Share via Facebook Messenger, Instagram or WhatsApp"
                        >
                          <Share2 size={14} style={{ color: '#38BDF8' }} />
                          <span>Share</span>
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

      {/* Courier Manifest Generation Modal */}
      {showManifestModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }} className="animate-fade-in" onClick={() => setShowManifestModal(false)}>
          <style>{`
            @page {
              size: A4 portrait;
              margin: 8mm !important;
            }
            @media print {
              body * :not(#manifest-print-box):not(#manifest-print-box *):not(:has(#manifest-print-box)) {
                display: none !important;
              }
              html, body, #root, .app-container, main,
              div:has(#manifest-print-box) {
                display: block !important;
                position: static !important;
                transform: none !important;
                filter: none !important;
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                box-shadow: none !important;
                background: transparent !important;
                height: 0 !important;
                max-height: 0 !important;
                overflow: visible !important;
                width: 100% !important;
              }
              #manifest-print-box, #manifest-print-box * {
                visibility: visible !important;
                box-sizing: border-box !important;
              }
              #manifest-print-box {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                right: auto !important;
                bottom: auto !important;
                width: 100% !important;
                max-width: 210mm !important;
                height: auto !important;
                min-height: 0 !important;
                max-height: none !important;
                margin: 0 !important;
                padding: 6mm 10mm !important;
                background: #FFFFFF !important;
                color: #000000 !important;
                box-shadow: none !important;
                border: none !important;
                z-index: 999999999 !important;
                display: block !important;
                overflow: visible !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print, .no-print * { display: none !important; visibility: hidden !important; }
            }
          `}</style>
          <div
            id="manifest-print-box"
            onClick={e => e.stopPropagation()}
            style={{
              width: '820px',
              maxHeight: '90vh',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              borderRadius: '16px',
              padding: '28px',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            {/* Header / Brand Details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #CBD5E1', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{brand.brand_name.toUpperCase()}</h2>
                <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>
                  {brand.address}<br />
                  Hotline / WhatsApp: {brand.phone}{brand.email ? ` • Email: ${brand.email}` : ''}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4338CA' }}>COURIER DISPATCH MANIFEST</div>
                <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
                  <strong>Courier Service:</strong> {manifestCourier}<br />
                  <strong>Date:</strong> {new Date().toLocaleDateString('en-GB')}
                </div>
              </div>
            </div>

            {/* Courier Selector (Hidden on print) */}
            <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F1F5F9', padding: '12px 16px', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Select Courier Service for Rider Handover:</span>
                <select
                  value={manifestCourier}
                  onChange={e => setManifestCourier(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontWeight: 600, fontSize: '0.88rem' }}
                >
                  {dbService.getDeliveryPartners().filter(p => p.is_active).map(p => (
                    <option key={p.id} value={p.name}>{p.name} ({p.type})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handlePrintManifest} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem', backgroundColor: '#4338CA', color: '#fff' }}>
                  <Printer size={15} /> Print Rider Manifest Sheet
                </button>
                <button onClick={() => setShowManifestModal(false)} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                  Close
                </button>
              </div>
            </div>

            {/* Manifest Parcel List */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', color: '#1E293B' }}>
                Parcels Prepared for Dispatch ({selectedOrdersList.length} items total)
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #CBD5E1', textAlign: 'left' }}>
                    <th style={{ padding: '8px', border: '1px solid #E2E8F0' }}>SL #</th>
                    <th style={{ padding: '8px', border: '1px solid #E2E8F0' }}>Invoice No</th>
                    <th style={{ padding: '8px', border: '1px solid #E2E8F0' }}>Customer Name & Phone</th>
                    <th style={{ padding: '8px', border: '1px solid #E2E8F0' }}>District & Destination</th>
                    <th style={{ padding: '8px', border: '1px solid #E2E8F0' }}>Tracking ID / Barcode</th>
                    <th style={{ padding: '8px', border: '1px solid #E2E8F0', textAlign: 'right' }}>COD Amount ({currencySymbol})</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrdersList.map((ord, idx) => (
                    <tr key={ord.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '8px', border: '1px solid #E2E8F0', textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ padding: '8px', border: '1px solid #E2E8F0', fontWeight: 700, color: '#4338CA' }}>{ord.invoice_no}</td>
                      <td style={{ padding: '8px', border: '1px solid #E2E8F0' }}>
                        <strong>{ord.customer_name}</strong><br />
                        <span style={{ color: '#64748B', fontSize: '0.78rem' }}>{ord.customer_phone}</span>
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #E2E8F0' }}>
                        <strong>{ord.customer_district}</strong><br />
                        <span style={{ color: '#64748B', fontSize: '0.75rem' }}>{ord.customer_address.slice(0, 32)}</span>
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #E2E8F0', fontFamily: 'monospace' }}>
                        {ord.tracking_id || 'PENDING-SCAN'}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #E2E8F0', textAlign: 'right', fontWeight: 800 }}>
                        {currencySymbol}{ord.total_amount_bdt.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr style={{ backgroundColor: '#F1F5F9', fontWeight: 800 }}>
                    <td colSpan={5} style={{ padding: '10px', border: '1px solid #CBD5E1', textAlign: 'right' }}>
                      TOTAL PARCELS & COD VALUE TO COLLECT:
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #CBD5E1', textAlign: 'right', color: '#059669', fontSize: '1rem' }}>
                      {currencySymbol}{selectedOrdersList.reduce((sum, o) => sum + (o.total_amount_bdt || 0), 0).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Rider Sign-off Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '36px', paddingTop: '20px', borderTop: '1px dashed #94A3B8' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>{brand.brand_name || 'PROBAHO CRM Solutions'} Dispatch Officer Sign & Date:</div>
                <div style={{ height: '45px', borderBottom: '1px solid #64748B', marginTop: '16px', width: '80%' }}></div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Authorized Warehouse Representative</div>
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>Courier Rider Sign & Date (Received {selectedOrdersList.length} Parcels):</div>
                <div style={{ height: '45px', borderBottom: '1px solid #64748B', marginTop: '16px', width: '80%' }}></div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>{manifestCourier} Pickup Rider Signature & Mobile No.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Invoice Slip Modal */}
      {shareOrderModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.78)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-card animate-scale-up" style={{
            width: '100%',
            maxWidth: '640px',
            borderRadius: '20px',
            border: '1px solid var(--border-highlight)',
            overflow: 'hidden',
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              backgroundColor: 'var(--bg-primary)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38BDF8'
                }}>
                  <Share2 size={22} />
                </div>
                <div>
                  <h3 className="brand-font" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    Share Invoice • #{shareOrderModal.invoice_no}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Customer: <strong style={{ color: 'var(--text-main)' }}>{shareOrderModal.customer_name}</strong> ({shareOrderModal.customer_phone})
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShareOrderModal(null);
                  setCopySuccessToast(null);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div>
                <label style={{ fontSize: '0.84rem', color: 'var(--text-muted)', display: 'block', marginBottom: '12px', fontWeight: 600 }}>
                  Share COD Slip via:
                </label>

                {/* 3 Action Buttons Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                  {/* 1. Facebook Messenger */}
                  <button
                    onClick={() => handleShareChannel('messenger', shareOrderModal)}
                    className="hover-lift"
                    style={{
                      padding: '16px 12px',
                      borderRadius: '14px',
                      border: '1px solid rgba(59, 130, 246, 0.35)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: '#3B82F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)'
                    }}>
                      <MessageSquare size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>FB Messenger</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '3px' }}>Copy slip & open chat</div>
                    </div>
                  </button>

                  {/* 2. Instagram DM */}
                  <button
                    onClick={() => handleShareChannel('instagram', shareOrderModal)}
                    className="hover-lift"
                    style={{
                      padding: '16px 12px',
                      borderRadius: '14px',
                      border: '1px solid rgba(236, 72, 153, 0.35)',
                      backgroundColor: 'rgba(236, 72, 153, 0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(236, 72, 153, 0.35)'
                    }}>
                      <Camera size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Instagram DM</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '3px' }}>Copy slip & open IG</div>
                    </div>
                  </button>

                  {/* 3. WhatsApp */}
                  <button
                    onClick={() => handleShareChannel('whatsapp', shareOrderModal)}
                    className="hover-lift"
                    style={{
                      padding: '16px 12px',
                      borderRadius: '14px',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
                    }}>
                      <MessageSquare size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>WhatsApp</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '3px' }}>Direct send via web</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Toast Notification */}
              {copySuccessToast && (
                <div className="animate-fade-in" style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#10B981',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Check size={16} />
                  <span>{copySuccessToast}</span>
                </div>
              )}

              {/* Preview Box */}
              <div style={{
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '10px 16px',
                  backgroundColor: 'var(--bg-hover)',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => setActivePreviewTab('messenger')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: activePreviewTab === 'messenger' ? '#3B82F6' : 'transparent',
                        color: activePreviewTab === 'messenger' ? '#fff' : 'var(--text-muted)'
                      }}
                    >
                      FB Messenger Slip
                    </button>
                    <button
                      onClick={() => setActivePreviewTab('instagram')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: activePreviewTab === 'instagram' ? '#EC4899' : 'transparent',
                        color: activePreviewTab === 'instagram' ? '#fff' : 'var(--text-muted)'
                      }}
                    >
                      Instagram Slip
                    </button>
                    <button
                      onClick={() => setActivePreviewTab('whatsapp')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: activePreviewTab === 'whatsapp' ? '#10B981' : 'transparent',
                        color: activePreviewTab === 'whatsapp' ? '#fff' : 'var(--text-muted)'
                      }}
                    >
                      WhatsApp Slip
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      const txt = activePreviewTab === 'messenger'
                        ? getMessengerSlipText(shareOrderModal)
                        : activePreviewTab === 'instagram'
                        ? getInstagramSlipText(shareOrderModal)
                        : getWhatsAppSlipText(shareOrderModal);
                      navigator.clipboard.writeText(txt);
                      setCopySuccessToast(`✅ ${activePreviewTab.toUpperCase()} slip text copied to clipboard!`);
                      setTimeout(() => setCopySuccessToast(null), 3000);
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  >
                    <Copy size={13} />
                    <span>Copy Text</span>
                  </button>
                </div>

                <div style={{
                  padding: '16px',
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  color: 'var(--text-main)',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  lineHeight: 1.5
                }}>
                  {activePreviewTab === 'messenger'
                    ? getMessengerSlipText(shareOrderModal)
                    : activePreviewTab === 'instagram'
                    ? getInstagramSlipText(shareOrderModal)
                    : getWhatsAppSlipText(shareOrderModal)}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              backgroundColor: 'var(--bg-primary)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShareOrderModal(null)}
                className="btn btn-secondary"
                style={{ padding: '8px 20px', fontSize: '0.85rem' }}
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch A4 Print Modal */}
      <BatchChallanPrintModal
        isOpen={!!batchPrintOrders}
        onClose={() => setBatchPrintOrders(null)}
        orders={batchPrintOrders || []}
      />

      {/* Global Default Invoice & Logo Modal */}
      {isDefaultInvoiceEditorOpen && (
        <DefaultInvoiceEditorModal
          isOpen={isDefaultInvoiceEditorOpen}
          onClose={() => {
            setIsDefaultInvoiceEditorOpen(false);
            setBrand(dbService.getBrandProfile());
            onRefreshOrders?.();
          }}
          brand={brand}
          onSave={updated => {
            setBrand(updated);
            onRefreshOrders?.();
          }}
        />
      )}

      {/* Specific Order Invoice Customizer Modal */}
      {editingSpecificOrder && (
        <SpecificInvoiceEditorModal
          isOpen={!!editingSpecificOrder}
          onClose={() => setEditingSpecificOrder(null)}
          order={editingSpecificOrder}
          onSave={_updated => {
            setEditingSpecificOrder(null);
            onRefreshOrders?.();
          }}
        />
      )}
    </div>
  );
};
