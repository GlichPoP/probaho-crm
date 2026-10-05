import React, { useState } from 'react';
import { Search, ArrowDownRight, ArrowUpRight, ShieldCheck, DollarSign, Plus } from 'lucide-react';
import type { PaymentLedgerEntry, Order, Vendor } from '../../types/crm';
import { useLocalization } from '../../i18n/LanguageContext';
import { getRegionalPaymentMethods } from '../../config/regionalPresets';

interface PaymentsViewProps {
  ledger: PaymentLedgerEntry[];
  orders: Order[];
  vendors: Vendor[];
  onAddPaymentEntry: (entry: Omit<PaymentLedgerEntry, 'id'>) => void;
  onReconcileBatch: (courierName: string, settlementRef: string) => void;
}

const getEntryDirection = (entry: PaymentLedgerEntry): 'in' | 'out' => {
  if (entry.direction === 'inflow' || entry.direction === ('in' as any)) return 'in';
  if (entry.direction === 'outflow' || entry.direction === ('out' as any)) return 'out';
  return (entry.type === 'Customer Payment' || entry.type === 'Courier COD Settlement' || entry.type === 'Refund') ? 'in' : 'out';
};

const getPartyName = (entry: PaymentLedgerEntry): string => {
  return entry.party_name || entry.reference_id || entry.category || 'Direct Transaction';
};

const getDescription = (entry: PaymentLedgerEntry): string => {
  return entry.description || entry.notes || `${entry.type} via ${entry.payment_method}`;
};

const getDate = (entry: PaymentLedgerEntry): string => {
  return entry.date || entry.transaction_date || new Date().toISOString();
};

const getMethod = (entry: PaymentLedgerEntry): string => {
  return entry.method || entry.payment_method || 'Bank Transfer';
};

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  ledger,
  orders,
  onAddPaymentEntry,
  onReconcileBatch
}) => {
  const { currencySymbol, currentCountryConfig } = useLocalization();
  const currentCountry = currentCountryConfig?.code || 'BD';
  const regionalMethods = getRegionalPaymentMethods(currentCountry);

  const [activeTab, setActiveTab] = useState<'all' | 'customer_in' | 'vendor_out'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchCourier, setBatchCourier] = useState('Pathao Courier');
  const [batchRef, setBatchRef] = useState('PTH-BATCH-8821');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<'Customer Payment' | 'Vendor Payout' | 'Expense'>('Customer Payment');
  const [entryAmount, setEntryAmount] = useState('');
  const [entryMethod, setEntryMethod] = useState(regionalMethods[0] || 'Bank Transfer');
  const [entryParty, setEntryParty] = useState('');
  const [entryNotes, setEntryNotes] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryAmount || Number(entryAmount) <= 0) return;
    onAddPaymentEntry({
      transaction_date: new Date().toISOString(),
      type: entryType as any,
      amount_bdt: Number(entryAmount),
      payment_method: entryMethod as any,
      party_name: entryParty.trim() || 'General',
      notes: entryNotes.trim(),
      category: entryType === 'Customer Payment' ? 'Sales Revenue' : entryType === 'Vendor Payout' ? 'Supplier Bill' : 'Expense',
      direction: entryType === 'Customer Payment' ? 'inflow' : 'outflow'
    });
    setIsAddModalOpen(false);
    setEntryAmount('');
    setEntryParty('');
    setEntryNotes('');
  };

  // Filter ledger entries
  const filteredLedger = ledger.filter(entry => {
    const dir = getEntryDirection(entry);
    if (activeTab === 'customer_in' && dir !== 'in') return false;
    if (activeTab === 'vendor_out' && dir !== 'out') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return getPartyName(entry).toLowerCase().includes(q) || getDescription(entry).toLowerCase().includes(q) || (entry.reference_id && entry.reference_id.toLowerCase().includes(q));
    }
    return true;
  });

  const totalInflows = ledger.filter(e => getEntryDirection(e) === 'in').reduce((sum, e) => sum + e.amount_bdt, 0);
  const totalOutflows = ledger.filter(e => getEntryDirection(e) === 'out').reduce((sum, e) => sum + e.amount_bdt, 0);
  const netCashFlow = totalInflows - totalOutflows;

  // COD pending orders total
  const pendingCodOrders = orders.filter(o => o.delivery_status === 'Delivered' && o.cod_settlement_status === 'Pending Courier Remittance');
  const totalPendingCodBdt = pendingCodOrders.reduce((sum, o) => sum + (o.total_amount_bdt - o.advance_paid_bdt), 0);

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReconcileBatch(batchCourier, batchRef);
    setShowBatchModal(false);
    alert(`Successfully reconciled ${batchCourier} batch ${batchRef}! Matching delivered invoices updated to Settled.`);
  };

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 className="brand-font" style={{ fontSize: '1.75rem', fontWeight: 700 }}>Payments</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Track cash inflows, courier COD settlements, and expenses.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setShowBatchModal(true)} className="btn btn-secondary hover-lift" style={{ border: '1px solid #38BDF8', color: '#38BDF8' }}>
            <ShieldCheck size={16} />
            <span>Reconcile Courier COD Batch</span>
          </button>
        </div>
      </div>

      {/* Compact High-Density KPI Ribbon */}
      <div className="glass-card" style={{ padding: '12px 18px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', alignItems: 'center', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '14px', borderRight: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Cash Inflows</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>Received revenue</div>
          </div>
          <div style={{ fontSize: '1.24rem', fontWeight: 800, color: 'var(--emerald)', fontFamily: 'monospace', marginLeft: '8px' }}>
            {currencySymbol}{totalInflows.toLocaleString()}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '14px', borderRight: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Vendor Payouts (Outflows)</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>Supplier payments & costs</div>
          </div>
          <div style={{ fontSize: '1.24rem', fontWeight: 800, color: 'var(--ruby)', fontFamily: 'monospace', marginLeft: '8px' }}>
            {currencySymbol}{totalOutflows.toLocaleString()}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '14px', borderRight: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Net Realized Balance</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>Net cash position</div>
          </div>
          <div style={{ fontSize: '1.24rem', fontWeight: 800, color: netCashFlow >= 0 ? '#38BDF8' : 'var(--ruby)', fontFamily: 'monospace', marginLeft: '8px' }}>
            {currencySymbol}{netCashFlow.toLocaleString()}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--amber)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Unsettled COD Due</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {pendingCodOrders.length} delivered parcels awaiting payment
            </div>
          </div>
          <div style={{ fontSize: '1.24rem', fontWeight: 800, color: 'var(--amber)', fontFamily: 'monospace', marginLeft: '8px' }}>
            {currencySymbol}{totalPendingCodBdt.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tabs & Search Toolbar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px', backgroundColor: 'var(--bg-primary)', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <Search size={16} style={{ color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Search transaction description, party name, or reference invoice..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setActiveTab('all')}
            style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'all' ? 'rgba(99, 102, 241, 0.25)' : 'transparent', color: activeTab === 'all' ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
          >
            All Ledger Logs ({ledger.length})
          </button>
          <button
            onClick={() => setActiveTab('customer_in')}
            style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'customer_in' ? 'rgba(16, 185, 129, 0.25)' : 'transparent', color: activeTab === 'customer_in' ? 'var(--emerald)' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
          >
            Customer & COD Receipts
          </button>
          <button
            onClick={() => setActiveTab('vendor_out')}
            style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'vendor_out' ? 'rgba(239, 68, 68, 0.25)' : 'transparent', color: activeTab === 'vendor_out' ? 'var(--ruby)' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
          >
            Vendor Payouts & Expenses
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-card" style={{ overflowX: 'auto' }}>
        <table className="crm-table">
          <thead>
            <tr>
              <th>Date & Timestamp</th>
              <th>Transaction Description</th>
              <th>Party / Entity Name</th>
              <th>Payment Method</th>
              <th>Reference ID</th>
              <th style={{ textAlign: 'right' }}>Amount (BDT)</th>
              <th style={{ textAlign: 'center' }}>Direction</th>
            </tr>
          </thead>
          <tbody>
            {ledger.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--text-dim)' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <DollarSign size={28} style={{ color: 'var(--emerald)', opacity: 0.8 }} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '6px', color: 'var(--text-main)' }}>Your financial ledger is empty</div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 18px' }}>
                    Record payments, COD remittances, and business expenses.
                  </div>
                  <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary hover-lift" style={{ padding: '9px 20px', fontSize: '0.86rem' }}>
                    <Plus size={16} />
                    <span>Record First Entry</span>
                  </button>
                </td>
              </tr>
            ) : filteredLedger.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No payment ledger entries found matching criteria.
                </td>
              </tr>
            ) : (
              filteredLedger.map(entry => {
                const dir = getEntryDirection(entry);
                return (
                  <tr key={entry.id}>
                    <td style={{ padding: '9px 14px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {new Date(getDate(entry)).toLocaleDateString('en-GB')}
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{getDescription(entry)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Recorded in general accounting</div>
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      <strong style={{ color: dir === 'in' ? 'var(--accent-primary)' : 'var(--ruby)' }}>{getPartyName(entry)}</strong>
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>{getMethod(entry)}</span>
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#38BDF8', fontWeight: 600 }}>{entry.reference_id || 'N/A'}</span>
                    </td>
                    <td style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 800, fontSize: '0.98rem', color: dir === 'in' ? 'var(--emerald)' : 'var(--ruby)' }}>
                      {dir === 'in' ? '+' : '-'}{currencySymbol}{entry.amount_bdt.toLocaleString()}
                    </td>
                    <td style={{ padding: '9px 14px', textAlign: 'center' }}>
                      <span className={`badge ${dir === 'in' ? 'badge-success' : 'badge-danger'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {dir === 'in' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                        {dir === 'in' ? 'Cash In' : 'Cash Out'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Courier COD Batch Reconcile Modal */}
      {showBatchModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }} onClick={() => setShowBatchModal(false)}>
          <div onClick={e => e.stopPropagation()} className="glass-card" style={{ width: '540px', padding: '24px', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 className="brand-font" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#38BDF8' }}>
              <ShieldCheck size={22} />
              <span>Bulk Reconcile Courier COD Batch</span>
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
              When Pathao or RedX deposits settlement cash into your bank account, select the courier below to automatically clear all pending COD invoices and post a master cash-in ledger entry.
            </p>

            <form onSubmit={handleBatchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Courier Partner</label>
                <select
                  value={batchCourier}
                  onChange={e => setBatchCourier(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                >
                  <option value="Pathao Courier">Pathao Courier</option>
                  <option value="RedX">RedX</option>
                  <option value="Steadfast">Steadfast</option>
                  <option value="eCourier">eCourier</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Bank Settlement Reference / Batch ID</label>
                <input
                  type="text"
                  value={batchRef}
                  onChange={e => setBatchRef(e.target.value)}
                  placeholder="e.g. PTH-BATCH-88210"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>

              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', fontSize: '0.82rem', color: '#38BDF8' }}>
                Pending {batchCourier} COD due ready to reconcile: <strong>{currencySymbol}{pendingCodOrders.filter(o => o.courier_name === batchCourier).reduce((s, o) => s + (o.total_amount_bdt - o.advance_paid_bdt), 0).toLocaleString()}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowBatchModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>Confirm Settlement</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }} onClick={() => setIsAddModalOpen(false)}>
          <div onClick={e => e.stopPropagation()} className="glass-card" style={{ width: '480px', padding: '24px', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 className="brand-font" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald)' }}>
              <DollarSign size={22} />
              <span>Record Ledger Payment / Expense</span>
            </h3>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Entry Type</label>
                <select
                  value={entryType}
                  onChange={e => setEntryType(e.target.value as any)}
                  className="input-field"
                >
                  <option value="Customer Payment">Customer Payment (Cash Inflow)</option>
                  <option value="Vendor Payout">Vendor Payout (Cash Outflow)</option>
                  <option value="Expense">Business Expense (Cash Outflow)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Amount ({currencySymbol})</label>
                <input
                  type="number"
                  value={entryAmount}
                  onChange={e => setEntryAmount(e.target.value)}
                  placeholder="e.g. 2500"
                  required
                  min="1"
                  className="input-field"
                  autoFocus
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Payment Method</label>
                <select
                  value={entryMethod}
                  onChange={e => setEntryMethod(e.target.value)}
                  className="input-field"
                >
                  {regionalMethods.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Party / Recipient / Customer Name</label>
                <input
                  type="text"
                  value={entryParty}
                  onChange={e => setEntryParty(e.target.value)}
                  placeholder="e.g. Customer Name, Wholesale Supplier, Office Rent"
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Notes / Description</label>
                <input
                  type="text"
                  value={entryNotes}
                  onChange={e => setEntryNotes(e.target.value)}
                  placeholder="e.g. Advance deposit for order #INV-1001"
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '9px 20px' }}>Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
