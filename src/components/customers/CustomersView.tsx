import React, { useState } from 'react';
import { Search, Phone, MapPin, ShieldAlert, Award, Plus, Users } from 'lucide-react';
import type { Customer, CustomerSegment, Order } from '../../types/crm';
import { dbService } from '../../database/db';
import { AddCustomerModal } from './AddCustomerModal';
import { useLocalization } from '../../i18n/LanguageContext';

interface CustomersViewProps {
  customers: Customer[];
  orders: Order[];
  onSelectCustomer: (customer: Customer) => void;
  onOpenNewCustomer?: () => void;
  onAddCustomer?: (customer: Customer) => void;
}

const SEGMENTS: (CustomerSegment | 'All')[] = ['All', 'Champions', 'VIP', 'Regular', 'New', 'At Risk', 'Blacklisted/RTO Risk'];

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onSelectCustomer,
  onOpenNewCustomer,
  onAddCustomer
}) => {
  const { currencySymbol } = useLocalization();
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
    if (onOpenNewCustomer) {
      onOpenNewCustomer();
    }
  };

  const handleSaveCustomer = (newCustomer: Customer) => {
    dbService.saveCustomer(newCustomer);
    if (onAddCustomer) {
      onAddCustomer(newCustomer);
    }
    setIsAddModalOpen(false);
  };

  const filteredCustomers = customers.filter(c => {
    if (selectedSegment !== 'All' && c.segment !== selectedSegment) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.district.toLowerCase().includes(q);
    }
    return true;
  });

  const championsCount = customers.filter(c => c.segment === 'Champions').length;
  const vipCount = customers.filter(c => c.segment === 'VIP').length;
  const blacklistCount = customers.filter(c => c.segment === 'Blacklisted/RTO Risk').length;

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 className="brand-font" style={{ fontSize: '1.75rem', fontWeight: 700 }}>Customer CRM & Cohorts</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Customer histories, RFM segments, and WhatsApp outreach.
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary hover-lift">
          <Plus size={16} />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Cohort KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>Total Customer Base</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '6px', color: 'var(--text-main)' }}>{customers.length} Profiles</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Recorded profiles</div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--emerald)', fontWeight: 600, textTransform: 'uppercase' }}>🏆 Champions & VIPs</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '6px', color: 'var(--emerald)' }}>{championsCount + vipCount} Buyers</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>High-value buyers</div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--amber)', fontWeight: 600, textTransform: 'uppercase' }}>⚠️ At Risk VIPs</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '6px', color: 'var(--amber)' }}>
            {customers.filter(c => c.segment === 'At Risk').length} Buyers
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Inactive for 90+ days</div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--ruby)', fontWeight: 600, textTransform: 'uppercase' }}>🚫 Serial Returners (RTO Risk)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '6px', color: 'var(--ruby)' }}>{blacklistCount} Flagged</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ruby)', marginTop: '4px' }}>Multiple delivery returns</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px', backgroundColor: 'var(--bg-primary)', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <Search size={16} style={{ color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Search phone number (017..), customer name, or district..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {SEGMENTS.map(seg => (
            <button
              key={seg}
              onClick={() => setSelectedSegment(seg)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: selectedSegment === seg ? 'var(--border-highlight)' : 'var(--border-color)',
                backgroundColor: selectedSegment === seg ? (seg === 'Blacklisted/RTO Risk' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)') : 'transparent',
                color: selectedSegment === seg ? (seg === 'Blacklisted/RTO Risk' ? 'var(--ruby)' : 'var(--accent-primary)') : 'var(--text-muted)',
                fontWeight: selectedSegment === seg ? 600 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {seg}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflowX: 'auto' }}>
        <table className="crm-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Phone Number</th>
              <th>District / Location</th>
              <th>RFM Cohort Segment</th>
              <th style={{ textAlign: 'center' }}>Total Orders</th>
              <th style={{ textAlign: 'center' }}>Courier Returns</th>
              <th style={{ textAlign: 'right' }}>Total Spent ({currencySymbol})</th>
              <th>Quick Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--text-dim)' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <Users size={28} style={{ color: 'var(--accent-primary)', opacity: 0.8 }} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '6px', color: 'var(--text-main)' }}>No customer profiles recorded yet</div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 16px' }}>
                    Customer records and purchase histories appear automatically as orders are placed.
                  </div>
                  <button onClick={handleOpenAddModal} className="btn btn-secondary hover-lift" style={{ padding: '8px 18px', fontSize: '0.84rem' }}>
                    <Plus size={15} />
                    <span>Add Customer</span>
                  </button>
                </td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No customer profiles found matching filters.
                </td>
              </tr>
            ) : (
              filteredCustomers.map(cust => {
                const isRisk = cust.segment === 'Blacklisted/RTO Risk' || cust.total_returns >= 2;
                return (
                  <tr key={cust.id} style={{ cursor: 'pointer' }} onClick={() => onSelectCustomer(cust)}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{cust.name}</span>
                        {cust.segment === 'Champions' && <Award size={14} style={{ color: '#F59E0B' }} />}
                      </div>
                      {cust.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{cust.notes.slice(0, 48)}..</div>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                        <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                        <span>{cust.phone}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} style={{ color: 'var(--text-dim)' }} />
                        <span>{cust.district}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${isRisk ? 'badge-danger' : cust.segment === 'Champions' || cust.segment === 'VIP' ? 'badge-success' : cust.segment === 'At Risk' ? 'badge-warning' : 'badge-primary'}`}>
                        {isRisk && <ShieldAlert size={12} />}
                        {cust.segment}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{cust.total_orders}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, color: cust.total_returns > 0 ? 'var(--ruby)' : 'var(--text-muted)' }}>
                        {cust.total_returns}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--emerald)' }}>
                      {currencySymbol}{cust.total_spent_bdt.toLocaleString()}
                    </td>
                    <td>
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectCustomer(cust); }}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      >
                        <span>View Profile</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaveCustomer={handleSaveCustomer}
      />
    </div>
  );
};
