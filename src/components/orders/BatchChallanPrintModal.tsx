import React, { useState } from 'react';
import { X, Printer, Layers } from 'lucide-react';
import type { Order } from '../../types/crm';
import { dbService } from '../../database/db';

interface BatchChallanPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

export const BatchChallanPrintModal: React.FC<BatchChallanPrintModalProps> = ({ isOpen, onClose, orders }) => {
  const [docMode, setDocMode] = useState<'invoice' | 'challan' | 'combo'>('invoice');

  if (!isOpen || orders.length === 0) return null;

  const brand = dbService.getBrandProfile();
  const currencySymbol = brand.currency?.match(/\((.*?)\)/)?.[1] || brand.currency || '$';

  const handlePrint = () => {
    window.print();
  };

  // Helper to convert number to words (International Standard)
  const amountToWords = (num: number): string => {
    if (num === 0) return 'Zero Only';
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const convertLess1000 = (n: number): string => {
      if (n === 0) return '';
      if (n < 20) return units[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + units[n % 10] : '');
      return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLess1000(n % 100) : '');
    };
    let result = '';
    if (num >= 1000000000) {
      result += convertLess1000(Math.floor(num / 1000000000)) + ' Billion ';
      num %= 1000000000;
    }
    if (num >= 1000000) {
      result += convertLess1000(Math.floor(num / 1000000)) + ' Million ';
      num %= 1000000;
    }
    if (num >= 1000) {
      result += convertLess1000(Math.floor(num / 1000)) + ' Thousand ';
      num %= 1000;
    }
    if (num > 0) {
      result += convertLess1000(num);
    }
    return result.trim() + ' Only';
  };

  const renderDocumentSection = (order: Order, titleLabel: string, isCompactCombo: boolean = false) => {
    const codDue = Math.max(0, order.total_amount_bdt - order.advance_paid_bdt);
    const activeTitle = order.custom_invoice_title || brand.default_invoice_title || (titleLabel.includes('CHALLAN') ? 'DELIVERY CHALLAN' : 'INVOICE');
    const activeTerms = order.custom_invoice_terms || brand.default_invoice_terms;
    const activeFooter = order.custom_invoice_footer || brand.default_invoice_footer || `Thank you for your business with ${brand.brand_name.toUpperCase()}!`;
    const activeNotes = order.custom_invoice_notes || order.notes;

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flex: isCompactCombo ? 'none' : 1,
        paddingBottom: isCompactCombo ? '12px' : '0',
        minHeight: isCompactCombo ? 'auto' : '100%',
        boxSizing: 'border-box'
      }}>
        <div>
          {/* Top Header Block matching input_file_6.png */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isCompactCombo ? '14px' : '24px' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: isCompactCombo ? '1.8rem' : '2.4rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                {activeTitle}
              </h1>
              <div style={{ fontSize: isCompactCombo ? '0.8rem' : '0.92rem', fontWeight: 700, color: '#111827', marginTop: '6px', letterSpacing: '0.01em' }}>
                Ref: {order.invoice_no}
              </div>
            </div>

            {/* Logo / Brand Box on Top Right */}
            {brand.logo_url ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                <img 
                  src={brand.logo_url} 
                  alt={brand.brand_name} 
                  style={{
                    maxHeight: isCompactCombo ? '46px' : '62px',
                    maxWidth: isCompactCombo ? '150px' : '210px',
                    objectFit: 'contain'
                  }} 
                />
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#4F46E5', letterSpacing: '0.04em', marginTop: '2px' }}>
                  {brand.brand_name}
                </div>
              </div>
            ) : (
              <div style={{
                backgroundColor: '#F9FAFB',
                border: '1px solid #F3F4F6',
                borderRadius: '8px',
                padding: isCompactCombo ? '8px 12px' : '12px 20px',
                textAlign: 'right'
              }}>
                <div style={{ fontSize: isCompactCombo ? '1.02rem' : '1.2rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>
                  {brand.brand_name.toUpperCase()}
                </div>
                <div style={{ fontSize: isCompactCombo ? '0.65rem' : '0.75rem', fontWeight: 600, color: '#4F46E5', letterSpacing: '0.04em', marginTop: '2px' }}>
                  BUSINESS INVOICE
                </div>
              </div>
            )}
          </div>

          {/* Top Horizontal Divider */}
          <div style={{ borderTop: '1px solid #D1D5DB', width: '100%' }} />

          {/* 3-Column Info Block matching input_file_6.png */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            padding: isCompactCombo ? '10px 0' : '18px 0',
            borderBottom: '1px solid #D1D5DB',
            marginBottom: isCompactCombo ? '14px' : '28px'
          }}>
            {/* Col 1: Bill From / Issued By */}
            <div style={{ paddingRight: '16px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                BILL FROM (ISSUER):
              </div>
              <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
                {brand.brand_name.toUpperCase()}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#4B5563', lineHeight: 1.45 }}>
                {brand.address}<br />
                Hotline/WhatsApp: {brand.phone}<br />
                {brand.email ? `Email: ${brand.email}` : ''}{brand.email && brand.website ? ' • ' : ''}{brand.website ? `Web: ${brand.website}` : ''}
              </div>
            </div>

            {/* Col 2: Bill To / Consignee */}
            <div style={{ padding: '0 16px', borderLeft: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                BILL TO / CONSIGNEE:
              </div>
              <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
                {order.customer_name}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#4B5563', lineHeight: 1.45 }}>
                Mobile: <strong style={{ color: '#111827' }}>{order.customer_phone}</strong><br />
                Address: {order.customer_address}<br />
                District: <strong style={{ color: '#111827' }}>{order.customer_district}</strong>
              </div>
            </div>

            {/* Col 3: Dates & Courier */}
            <div style={{ paddingLeft: '16px', borderLeft: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                ORDER DATE:
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#111827', marginBottom: '14px' }}>
                {new Date(order.order_date).toLocaleDateString('en-GB')}
              </div>

              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                COURIER & TRACKING:
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#111827' }}>
                {order.courier_name}<br />
                <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#4F46E5', fontWeight: 700 }}>
                  {order.tracking_id || 'HANDOVER-PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* Table matching exact input_file_6.png layout */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: isCompactCombo ? '12px' : '20px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #D1D5DB', textAlign: 'left' }}>
                <th style={{ padding: '10px 0', fontSize: '0.72rem', fontWeight: 800, color: '#111827', width: '8%' }}>SL #</th>
                <th style={{ padding: '10px 0', fontSize: '0.72rem', fontWeight: 800, color: '#111827', width: '42%' }}>Item & SKU Description</th>
                <th style={{ padding: '10px 0', fontSize: '0.72rem', fontWeight: 800, color: '#111827', textAlign: 'center', width: '10%' }}>Spec / Size</th>
                <th style={{ padding: '10px 0', fontSize: '0.72rem', fontWeight: 800, color: '#111827', textAlign: 'center', width: '10%' }}>Color / Variant</th>
                <th style={{ padding: '10px 0', fontSize: '0.72rem', fontWeight: 800, color: '#111827', textAlign: 'center', width: '10%' }}>Qty</th>
                <th style={{ padding: '10px 0', fontSize: '0.72rem', fontWeight: 800, color: '#111827', textAlign: 'right', width: '10%' }}>Unit Price</th>
                <th style={{ padding: '10px 0', fontSize: '0.72rem', fontWeight: 800, color: '#111827', textAlign: 'right', width: '10%' }}>Total (BDT)</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: isCompactCombo ? '6px 0' : '12px 0', fontSize: isCompactCombo ? '0.78rem' : '0.84rem', fontWeight: 700, color: '#6B7280' }}>
                    {idx + 1}.
                  </td>
                  <td style={{ padding: isCompactCombo ? '6px 0' : '12px 0', fontSize: isCompactCombo ? '0.78rem' : '0.84rem' }}>
                    <div style={{ fontWeight: 700, color: '#111827' }}>{it.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6B7280', fontFamily: 'monospace' }}>SKU: {it.sku}</div>
                  </td>
                  <td style={{ padding: isCompactCombo ? '6px 0' : '12px 0', fontSize: isCompactCombo ? '0.8rem' : '0.86rem', fontWeight: 800, textAlign: 'center', color: '#4F46E5' }}>
                    {it.size}
                  </td>
                  <td style={{ padding: isCompactCombo ? '6px 0' : '12px 0', fontSize: isCompactCombo ? '0.78rem' : '0.84rem', textAlign: 'center', color: '#4B5563', fontWeight: 600 }}>
                    {it.color}
                  </td>
                  <td style={{ padding: isCompactCombo ? '6px 0' : '12px 0', fontSize: isCompactCombo ? '0.8rem' : '0.86rem', fontWeight: 800, textAlign: 'center', color: '#111827' }}>
                    {it.quantity} Pcs
                  </td>
                  <td style={{ padding: isCompactCombo ? '6px 0' : '12px 0', fontSize: isCompactCombo ? '0.78rem' : '0.84rem', textAlign: 'right', color: '#4B5563' }}>
                    {currencySymbol}{it.unit_price_bdt.toLocaleString()}
                  </td>
                  <td style={{ padding: isCompactCombo ? '6px 0' : '12px 0', fontSize: isCompactCombo ? '0.82rem' : '0.88rem', fontWeight: 800, textAlign: 'right', color: '#111827' }}>
                    {currencySymbol}{it.total_price_bdt.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals & Policies Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: isCompactCombo ? '16px' : '24px', alignItems: 'flex-start' }}>
            {/* Customer Return & Exchange Policy Terms */}
            <div>
              <div style={{
                padding: isCompactCombo ? '8px 10px' : '12px 14px',
                backgroundColor: '#FFFBEB',
                border: '1px solid #FCD34D',
                borderRadius: '8px',
                color: '#92400E',
                fontSize: isCompactCombo ? '0.68rem' : '0.76rem',
                lineHeight: 1.5
              }}>
                <div style={{ fontWeight: 800, fontSize: isCompactCombo ? '0.72rem' : '0.82rem', marginBottom: '4px' }}>
                  Parcel Inspection & Return Policy (Standard Terms):
                </div>
                <div style={{ whiteSpace: 'pre-line' }}>
                  {activeTerms || (
                    `1. Please inspect the parcel and verify item condition upon delivery.\n2. In case of any discrepancies or exchange requests, contact our customer support within 48 hours.\n3. Items must remain unused with original tags and packaging intact for returns or exchanges.`
                  )}
                </div>
              </div>

              <div style={{ marginTop: '8px', padding: '10px 14px', backgroundColor: '#F9FAFB', borderRadius: '8px', borderLeft: '4px solid #4F46E5', fontSize: '0.82rem', color: '#1F2937' }}>
                <strong>Amount in Words:</strong> {amountToWords(order.total_amount_bdt)}
              </div>

              {activeNotes && (
                <div style={{ marginTop: '8px', fontSize: '0.74rem', color: '#4B5563', backgroundColor: '#F3F4F6', padding: '6px 10px', borderRadius: '6px', borderLeft: '3px solid #6B7280' }}>
                  <strong>Note:</strong> {activeNotes}
                </div>
              )}
            </div>

            {/* Financial Summary Box */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '100%', maxWidth: isCompactCombo ? '240px' : '280px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E5E7EB', fontSize: '0.82rem', color: '#4B5563' }}>
                  <span>Subtotal:</span>
                  <strong style={{ color: '#111827' }}>{currencySymbol}{order.subtotal_bdt.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E5E7EB', fontSize: '0.82rem', color: '#4B5563' }}>
                  <span>Delivery ({order.customer_district}):</span>
                  <strong style={{ color: '#111827' }}>{currencySymbol}{order.delivery_charge_bdt.toLocaleString()}</strong>
                </div>
                {order.discount_bdt > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E5E7EB', fontSize: '0.82rem', color: '#DC2626' }}>
                    <span>Discount Applied:</span>
                    <strong>-{currencySymbol}{order.discount_bdt.toLocaleString()}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E5E7EB', fontSize: '0.82rem', color: '#4B5563' }}>
                  <span>Net Billing Total:</span>
                  <strong style={{ color: '#111827' }}>{currencySymbol}{order.total_amount_bdt.toLocaleString()}</strong>
                </div>
                {order.advance_paid_bdt > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E5E7EB', fontSize: '0.82rem', color: '#16A34A' }}>
                    <span>Advance Paid:</span>
                    <strong>-{currencySymbol}{order.advance_paid_bdt.toLocaleString()}</strong>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: isCompactCombo ? '0.9rem' : '1.05rem',
                  fontWeight: 900,
                  backgroundColor: codDue === 0 ? '#DCFCE7' : '#FEF2F2',
                  color: codDue === 0 ? '#15803D' : '#DC2626',
                  border: `2px solid ${codDue === 0 ? '#86EFAC' : '#FCA5A5'}`,
                  padding: '8px 10px',
                  borderRadius: '8px',
                  marginTop: '8px'
                }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.85 }}>
                      {codDue === 0 ? 'PAYMENT STATUS' : 'CASH TO COLLECT'}
                    </span>
                    <span>{codDue === 0 ? '✔ FULLY PAID' : 'COD DUE:'}</span>
                  </div>
                  <span style={{ fontSize: isCompactCombo ? '1.1rem' : '1.25rem' }}>
                    {currencySymbol}{codDue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Group (Signatures + Banner together so they never split across pages) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
          marginTop: isCompactCombo ? '12px' : '18px'
        }}>
          {/* Signatures & Footer Line */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '20px',
            paddingTop: isCompactCombo ? '8px' : '12px',
            borderTop: '1px dashed #D1D5DB',
            fontSize: '0.78rem',
            color: '#6B7280'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: isCompactCombo ? '10px' : '16px' }} />
              <div style={{ borderTop: '1px solid #6B7280', paddingTop: '5px', fontWeight: 600 }}>Prepared By ({brand.brand_name || 'PROBAHO CRM Solutions'})</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: isCompactCombo ? '10px' : '16px' }} />
              <div style={{ borderTop: '1px solid #6B7280', paddingTop: '5px', fontWeight: 600 }}>Quality Checked & Packed</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: isCompactCombo ? '10px' : '16px' }} />
              <div style={{ borderTop: '1px solid #6B7280', paddingTop: '5px', fontWeight: 600 }}>Customer Signature & Date</div>
            </div>
          </div>

          {/* Bottom Full-Width Banner matching input_file_6.png */}
          {!isCompactCombo && (
            <div style={{
              marginTop: '16px',
              backgroundColor: '#F3F4F6',
              padding: '10px 18px',
              borderRadius: '6px',
              fontSize: '0.84rem',
              fontWeight: 800,
              color: '#1F2937',
              textAlign: 'left'
            }}>
              {activeFooter}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '16px'
    }} className="animate-fade-in" onClick={onClose}>
      <style>{`
        @page {
          size: A4 portrait;
          margin: 8mm !important;
        }
        @media print {
          body * :not(#printable-batch-challans-content):not(#printable-batch-challans-content *):not(:has(#printable-batch-challans-content)) {
            display: none !important;
          }
          html, body, #root, .app-container, main,
          div:has(#printable-batch-challans-content) {
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
          #printable-batch-challans-content, #printable-batch-challans-content * {
            visibility: visible !important;
            box-sizing: border-box !important;
          }
          #printable-batch-challans-content {
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
            padding: 0 !important;
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
          .batch-page-item {
            width: 100% !important;
            max-width: 210mm !important;
            min-height: auto !important;
            height: auto !important;
            padding: 6mm 10mm !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
            background: #FFFFFF !important;
            color: #000000 !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            position: relative !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .batch-page-item:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .no-print, .no-print * {
            display: none !important;
            visibility: hidden !important;
          }
        }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '880px',
          maxHeight: '96vh',
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        {/* Top Control & Document Mode Switcher Bar */}
        <div className="no-print" style={{
          padding: '14px 20px',
          backgroundColor: '#0F172A',
          color: '#F8FAFC',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={18} style={{ color: '#818CF8' }} />
            <div>
              <span style={{ fontWeight: 800, fontSize: '0.96rem', display: 'block' }}>
                Batch A4 Print Preview ({orders.length} {orders.length === 1 ? 'Customer Invoice' : 'Customer Invoices'})
              </span>
              <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                Each invoice prints on its own A4 page.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Mode Switchers */}
            <div style={{ display: 'flex', gap: '6px', backgroundColor: '#1E293B', padding: '3px', borderRadius: '8px' }}>
              <button
                onClick={() => setDocMode('invoice')}
                style={{
                  padding: '5px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: docMode === 'invoice' ? '#4F46E5' : 'transparent',
                  color: docMode === 'invoice' ? '#FFFFFF' : '#94A3B8',
                  transition: 'all 0.15s ease'
                }}
              >
                📑 Invoice
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="btn btn-primary hover-lift pulse-alert"
              style={{ padding: '8px 18px', fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#4F46E5', color: '#FFFFFF', border: '1px solid #818CF8', borderRadius: '8px', cursor: 'pointer' }}
            >
              <Printer size={16} />
              <span>𖠿 Print Batch ({orders.length} A4 Pages)</span>
            </button>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Content Area containing all selected A4 documents */}
        <div id="printable-batch-challans-content" style={{
          overflowY: 'auto',
          flex: 1,
          backgroundColor: '#F1F5F9',
          color: '#0F172A',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '24px 0'
        }}>
          {orders.map((order, orderIndex) => (
            <div
              key={order.id}
              className="batch-page-item"
              style={{
                width: '100%',
                maxWidth: '820px',
                minHeight: '980px',
                backgroundColor: '#FFFFFF',
                padding: docMode === 'combo' ? '20px 28px' : '28px 36px',
                marginBottom: orderIndex < orders.length - 1 ? '32px' : '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              {/* On-Screen Page Indicator Badge (Hidden during print) */}
              <div className="no-print" style={{
                position: 'absolute',
                top: '-14px',
                left: '20px',
                backgroundColor: '#334155',
                color: '#FFFFFF',
                padding: '3px 12px',
                borderRadius: '12px',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                zIndex: 10
              }}>
                📄 A4 Page {orderIndex + 1} of {orders.length} — Invoice: {order.invoice_no} ({order.customer_name})
              </div>

              {docMode === 'invoice' && renderDocumentSection(order, 'CUSTOMER INVOICE / RECEIPT', false)}
              {docMode === 'challan' && renderDocumentSection(order, 'PARCEL DELIVERY CHALLAN', false)}
              {docMode === 'combo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                  {renderDocumentSection(order, 'CUSTOMER INVOICE / RECEIPT (ORIGINAL COPY)', true)}
                  <div style={{
                    borderBottom: '2px dashed #94A3B8',
                    position: 'relative',
                    margin: '6px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{
                      position: 'absolute',
                      backgroundColor: '#FFFFFF',
                      padding: '0 12px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#64748B',
                      letterSpacing: '0.05em'
                    }}>
                      ✂ PERFORATION CUT LINE • RETAIN LOWER PORTION AS COURIER / WAREHOUSE ACKNOWLEDGMENT ✂
                    </span>
                  </div>
                  {renderDocumentSection(order, 'COURIER / WAREHOUSE CHALLAN (OFFICE & DISPATCH COPY)', true)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
