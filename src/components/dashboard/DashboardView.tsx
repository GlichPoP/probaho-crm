import React, { useMemo } from 'react';
import { 
  DollarSign, ShoppingBag, Truck, AlertTriangle, TrendingUp, 
  Activity, ShieldAlert, CheckCircle2, Sparkles, Plus, Package 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import type { Order, Product, Customer, PaymentLedgerEntry, ActivityLog } from '../../types/crm';
import { useLocalization } from '../../i18n/LanguageContext';

interface DashboardViewProps {
  orders: Order[];
  products: Product[];
  customers?: Customer[];
  payments?: PaymentLedgerEntry[];
  ledger?: PaymentLedgerEntry[];
  activities?: ActivityLog[];
  onNavigateTab?: (tab: any) => void;
  onNavigateToTab?: (tab: any) => void;
  onOpenNewOrder?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders = [],
  products = [],
  activities = [],
  onNavigateTab,
  onNavigateToTab,
  onOpenNewOrder
}) => {
  const { currencySymbol, currency, t } = useLocalization();
  const handleNav = (tab: any) => {
    if (onNavigateToTab) onNavigateToTab(tab);
    else if (onNavigateTab) onNavigateTab(tab);
  };
  // KPI Calculations
  const totalRevenue = orders
    .filter(o => o.delivery_status !== 'Returned/RTO')
    .reduce((sum, o) => sum + o.total_amount_bdt, 0);

  // Approximate Net Profit (Revenue - Cost of Products - Delivery Subsidy)
  const estimatedProfit = orders
    .filter(o => o.delivery_status !== 'Returned/RTO')
    .reduce((sum, o) => {
      const itemsCost = o.items.reduce((c, item) => {
        const p = products.find(prod => prod.id === item.product_id);
        return c + (p ? p.cost_price_bdt * item.quantity : item.unit_price_bdt * 0.45 * item.quantity);
      }, 0);
      const net = o.total_amount_bdt - itemsCost - (o.discount_bdt || 0);
      return sum + net;
    }, 0);

  const activeOrdersCount = orders.filter(o => 
    o.delivery_status !== 'Delivered' && o.delivery_status !== 'Returned/RTO'
  ).length;

  const codPendingRemittance = orders
    .filter(o => o.payment_status === 'COD Pending' && o.delivery_status === 'Delivered')
    .reduce((sum, o) => sum + (o.total_amount_bdt - o.advance_paid_bdt), 0);

  const returnedOrdersCount = orders.filter(o => o.delivery_status === 'Returned/RTO').length;
  const rtoRate = orders.length > 0 ? ((returnedOrdersCount / orders.length) * 100).toFixed(1) : '0.0';

  const lowStockProducts = products.filter(p => p.stock_quantity <= p.low_stock_threshold);

  // Chart data: Sales Channel Breakdown
  const channelCounts: Record<string, number> = {};
  orders.forEach(o => {
    channelCounts[o.sales_channel] = (channelCounts[o.sales_channel] || 0) + o.total_amount_bdt;
  });

  const channelData = Object.entries(channelCounts).map(([name, value]) => ({
    name,
    value
  }));

  const CHANNEL_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#06B6D4', '#EC4899'];

  // Chart data: Dynamic Daily Revenue Trend calculated from actual orders
  const revenueTrend = useMemo(() => {
    if (orders.length === 0) {
      const weekdays = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Today'];
      return weekdays.map(day => ({ day, revenue: 0, profit: 0 }));
    }
    const map: Record<string, { revenue: number; profit: number }> = {};
    orders.forEach(o => {
      const d = o.order_date ? new Date(o.order_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today';
      if (!map[d]) map[d] = { revenue: 0, profit: 0 };
      if (o.delivery_status !== 'Returned/RTO') {
        map[d].revenue += o.total_amount_bdt;
        const itemsCost = o.items.reduce((c, item) => {
          const p = products.find(prod => prod.id === item.product_id);
          return c + (p ? p.cost_price_bdt * item.quantity : item.unit_price_bdt * 0.45 * item.quantity);
        }, 0);
        map[d].profit += Math.max(0, o.total_amount_bdt - itemsCost - (o.discount_bdt || 0));
      }
    });
    return Object.entries(map).map(([day, val]) => ({ day, ...val }));
  }, [orders, products]);

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Top Welcome & KPI Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="brand-font" style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Executive Command Center</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.89rem', marginTop: '4px' }}>
            Real-time sales, COD remittances, and stock metrics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => handleNav('orders')} className="btn btn-secondary hover-lift" style={{ padding: '9px 16px' }}>
            <ShoppingBag size={16} style={{ color: 'var(--accent-primary)' }} />
            <span>View All Orders</span>
          </button>
          <button onClick={() => handleNav('finance')} className="btn btn-primary hover-lift" style={{ padding: '9px 18px' }}>
            <DollarSign size={16} />
            <span>Reconcile COD Cash</span>
          </button>
        </div>
      </div>

      {/* Welcome Banner for Clean State */}
      {orders.length === 0 && (
        <div style={{
          padding: '24px 28px',
          borderRadius: '16px',
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '1.05rem' }}>
              <Sparkles size={18} />
              <span>Clean Production Workspace Ready</span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Add products in Inventory or record your first order.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handleNav('inventory')}
              className="btn btn-secondary hover-lift"
              style={{ padding: '8px 16px', fontSize: '0.84rem' }}
            >
              <Package size={15} style={{ color: 'var(--accent-primary)' }} />
              <span>Add Inventory Item</span>
            </button>
            <button
              onClick={() => {
                if (onOpenNewOrder) onOpenNewOrder();
                else handleNav('orders');
              }}
              className="btn btn-primary hover-lift"
              style={{ padding: '8px 18px', fontSize: '0.84rem' }}
            >
              <Plus size={15} />
              <span>Record First Order</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
        {/* Gross Revenue */}
        <div className="glass-card hover-lift" style={{ padding: '22px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('revenue', 'Gross Revenue')}</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'rgba(99, 102, 241, 0.16)', border: '1px solid rgba(99, 102, 241, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} style={{ color: 'var(--accent-primary)' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, marginTop: '14px', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {currencySymbol}{totalRevenue.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '0.76rem', color: totalRevenue > 0 ? 'var(--emerald)' : 'var(--text-dim)' }}>
            {totalRevenue > 0 && <TrendingUp size={14} />}
            <span style={{ fontWeight: 700 }}>{orders.length}</span>
            <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>orders placed</span>
          </div>
        </div>

        {/* Estimated Profit */}
        <div className="glass-card hover-lift" style={{ padding: '22px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('netProfit', 'Est. Net Profit')}</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'rgba(16, 185, 129, 0.16)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} style={{ color: 'var(--emerald)' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, marginTop: '14px', color: 'var(--emerald)', letterSpacing: '-0.02em' }}>
            {currencySymbol}{Math.round(estimatedProfit).toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 600 }}>{totalRevenue > 0 ? `~${Math.round((estimatedProfit / totalRevenue) * 100)}% Gross Margin` : 'Net profit after item costs'}</span>
          </div>
        </div>

        {/* Active Pipeline Orders */}
        <div className="glass-card hover-lift" style={{ padding: '22px 20px', cursor: 'pointer' }} onClick={() => handleNav('orders')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('activeOrders', 'Active Orders')}</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'rgba(245, 158, 11, 0.16)', border: '1px solid rgba(245, 158, 11, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={18} style={{ color: 'var(--amber)' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, marginTop: '14px', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {activeOrdersCount}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '0.76rem', color: activeOrdersCount > 0 ? 'var(--amber)' : 'var(--text-dim)' }}>
            <span style={{ fontWeight: 600 }}>{activeOrdersCount > 0 ? 'In stitching / transit via couriers' : 'No active shipments'}</span>
          </div>
        </div>

        {/* Courier COD Due */}
        <div className="glass-card hover-lift" style={{ padding: '22px 20px', cursor: 'pointer' }} onClick={() => handleNav('finance')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('courierDue', 'Pending Courier COD')}</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'rgba(6, 182, 212, 0.16)', border: '1px solid rgba(6, 182, 212, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={18} style={{ color: 'var(--cyan)' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, marginTop: '14px', color: 'var(--cyan)', letterSpacing: '-0.02em' }}>
            {currencySymbol}{codPendingRemittance.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 600 }}>Owed by couriers / riders</span>
          </div>
        </div>

        {/* COD RTO Rate */}
        <div className="glass-card hover-lift" style={{ padding: '22px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>COD RTO Return Rate</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'rgba(239, 68, 68, 0.16)', border: '1px solid rgba(239, 68, 68, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={18} style={{ color: 'var(--ruby)' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, marginTop: '14px', color: Number(rtoRate) > 15 ? 'var(--ruby)' : 'var(--emerald)', letterSpacing: '-0.02em' }}>
            {rtoRate}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 600 }}>{returnedOrdersCount} returns recorded</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Recharts Visualizations */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Revenue & Profit Area Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Revenue vs. Estimated Profit ({currency} {currencySymbol})</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily revenue and estimated profit trend</p>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#6366F1' }} />
                <span>Gross Revenue</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                <span>Net Profit</span>
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="day" stroke="var(--text-dim)" fontSize={12} />
                <YAxis stroke="var(--text-dim)" fontSize={12} tickFormatter={val => `${currencySymbol}${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '10px', fontSize: '13px', color: 'var(--text-main)' }}
                  formatter={(value: any) => [`${currencySymbol}${Number(value).toLocaleString()}`, 'Amount']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Channel Pie Chart */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Sales Channel Breakdown</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sales breakdown by channel</p>
          </div>

          {channelData.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '260px', color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <ShoppingBag size={22} style={{ color: 'var(--text-dim)' }} />
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)' }}>No sales channel data yet</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginTop: '4px', maxWidth: '220px' }}>
                Populates automatically as orders are placed.
              </div>
            </div>
          ) : (
            <>
              <div style={{ width: '100%', height: '200px', margin: '12px 0' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {channelData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHANNEL_COLORS[index % CHANNEL_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '10px', fontSize: '12px', color: 'var(--text-main)' }}
                      formatter={(value: any) => [`${currencySymbol}${Number(value).toLocaleString()}`, 'Revenue']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                {channelData.map((entry, idx) => (
                  <div key={entry.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: CHANNEL_COLORS[idx % CHANNEL_COLORS.length] }} />
                      <span style={{ color: 'var(--text-muted)' }}>{entry.name}</span>
                    </div>
                    <span style={{ fontWeight: 600 }}>{currencySymbol}{entry.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Section: Low Stock Alert Grid & Live Activity Log */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Low Stock Product Matrix Alert */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={20} style={{ color: 'var(--ruby)' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Low Stock Product Matrix ({lowStockProducts.length})</h3>
            </div>
            <button onClick={() => handleNav('inventory')} style={{ fontSize: '0.78rem', color: '#818CF8', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Manage Inventory →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
            {lowStockProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--emerald)', fontWeight: 500 }}>
                <CheckCircle2 size={28} style={{ margin: '0 auto 8px', opacity: 0.8 }} />
                All product variants are well stocked.
              </div>
            ) : (
              lowStockProducts.map(prod => (
                <div key={prod.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{prod.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      SKU: {prod.sku} • Spec: <strong style={{ color: 'var(--text-main)' }}>{prod.size}</strong> • Color: {prod.color}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-danger">Stock: {prod.stock_quantity} units</span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>Min alert: {prod.low_stock_threshold}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live System Activity Log */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={20} style={{ color: '#06B6D4' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Live Activity Log</h3>
            </div>
            <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>Real-Time Audit Trail</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto' }}>
            {activities.slice(0, 7).map((act: any) => (
              <div key={act.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: act.category === 'Finance' ? 'var(--emerald-bg)' : act.category === 'Order' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: act.category === 'Finance' ? 'var(--emerald)' : '#818CF8',
                  flexShrink: 0
                }}>
                  <Activity size={14} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4 }}>{act.description}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    <span>By: {act.performed_by}</span>
                    <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
