import type { 
  Product, Customer, Order, PaymentLedgerEntry, Vendor, ActivityLog, 
  CRMDataStore, BrandProfile, UserAccount, DeliveryPartner, PaymentPartner,
  BusinessType
} from '../types/crm';
import { firebaseSync } from '../services/firebaseSync';

const STORAGE_KEY = 'VASTRA_CRM_LOCAL_STORE_V1';

// Seed data generator for Demonstration and Testing
export function generateDemoSeedData(): CRMDataStore {
  const products: Product[] = [
    {
      id: 'prod-1',
      sku: 'PAN-NAVY-M',
      name: 'Premium Egyptian Cotton Panjabi - Royal Navy Blue',
      category: 'Panjabi',
      size: 'M',
      color: 'Navy Blue',
      stock_quantity: 18,
      low_stock_threshold: 5,
      cost_price_bdt: 1100,
      selling_price_bdt: 2450,
      description: 'Hand-embossed metal buttons, semi-fit cut tailored for Eid & wedding occasions.'
    },
    {
      id: 'prod-2',
      sku: 'PAN-NAVY-L',
      name: 'Premium Egyptian Cotton Panjabi - Royal Navy Blue',
      category: 'Panjabi',
      size: 'L',
      color: 'Navy Blue',
      stock_quantity: 4, // Low stock!
      low_stock_threshold: 5,
      cost_price_bdt: 1100,
      selling_price_bdt: 2450,
      description: 'Hand-embossed metal buttons, semi-fit cut tailored for Eid & wedding occasions.'
    },
    {
      id: 'prod-3',
      sku: 'PAN-NAVY-XL',
      name: 'Premium Egyptian Cotton Panjabi - Royal Navy Blue',
      category: 'Panjabi',
      size: 'XL',
      color: 'Navy Blue',
      stock_quantity: 12,
      low_stock_threshold: 5,
      cost_price_bdt: 1100,
      selling_price_bdt: 2450,
      description: 'Hand-embossed metal buttons, semi-fit cut tailored for Eid & wedding occasions.'
    },
    {
      id: 'prod-4',
      sku: 'KUR-MAR-S',
      name: 'Jamdani Motif Screen-Print Kurti - Maroon & Gold',
      category: 'Kurti',
      size: 'S',
      color: 'Maroon',
      stock_quantity: 25,
      low_stock_threshold: 6,
      cost_price_bdt: 750,
      selling_price_bdt: 1850,
      description: 'Georgette body with inner lining, traditional Jamdani geometric block motif.'
    },
    {
      id: 'prod-5',
      sku: 'KUR-MAR-M',
      name: 'Jamdani Motif Screen-Print Kurti - Maroon & Gold',
      category: 'Kurti',
      size: 'M',
      color: 'Maroon',
      stock_quantity: 3, // Low stock!
      low_stock_threshold: 6,
      cost_price_bdt: 750,
      selling_price_bdt: 1850,
      description: 'Georgette body with inner lining, traditional Jamdani geometric block motif.'
    },
    {
      id: 'prod-6',
      sku: 'TS-BLK-L',
      name: 'Oversized Acid Wash Graphic T-Shirt - Pitch Black',
      category: 'T-Shirt',
      size: 'L',
      color: 'Black',
      stock_quantity: 45,
      low_stock_threshold: 10,
      cost_price_bdt: 420,
      selling_price_bdt: 990,
      description: '240 GSM heavy combed cotton, puff-printed typography front & back.'
    },
    {
      id: 'prod-7',
      sku: 'TS-BLK-XL',
      name: 'Oversized Acid Wash Graphic T-Shirt - Pitch Black',
      category: 'T-Shirt',
      size: 'XL',
      color: 'Black',
      stock_quantity: 2, // Low stock!
      low_stock_threshold: 10,
      cost_price_bdt: 420,
      selling_price_bdt: 990,
      description: '240 GSM heavy combed cotton, puff-printed typography front & back.'
    },
    {
      id: 'prod-8',
      sku: 'SAR-KAT-FREE',
      name: 'Authentic Mirpur Katan Silk Saree - Emerald Green',
      category: 'Saree',
      size: 'Free Size',
      color: 'Emerald Green',
      stock_quantity: 8,
      low_stock_threshold: 3,
      cost_price_bdt: 3800,
      selling_price_bdt: 7500,
      description: 'All-over zari border weave, includes unstitched contrast matching blouse piece.'
    },
    {
      id: 'prod-9',
      sku: 'DNM-BLU-32',
      name: 'Baggy Fit Cargo Denim Pants - Vintage Indigo',
      category: 'Denim',
      size: 'L',
      color: 'Indigo Blue',
      stock_quantity: 14,
      low_stock_threshold: 5,
      cost_price_bdt: 850,
      selling_price_bdt: 1950,
      description: '6 functional flap pockets, enzyme washed for superior softness.'
    },
    {
      id: 'prod-10',
      sku: 'WES-OLV-M',
      name: 'Western Co-Ord Linen Set - Olive Green',
      category: 'Western',
      size: 'M',
      color: 'Olive Green',
      stock_quantity: 11,
      low_stock_threshold: 4,
      cost_price_bdt: 1300,
      selling_price_bdt: 2890,
      description: 'Breathable pure linen crop top with matching high-waisted palazzo trousers.'
    }
  ];

  const customers: Customer[] = [
    {
      id: 'cust-1',
      name: 'Dr. Nusrat Jahan',
      phone: '01711223344',
      email: 'nusrat.jahan@gmail.com',
      address: 'House 14, Road 7, Dhanmondi R/A',
      district: 'Dhaka',
      segment: 'Champions',
      total_spent_bdt: 24500,
      total_orders: 6,
      total_returns: 0,
      notes: 'Prefers Pathao express home delivery. Always pays upfront via bKash.',
      created_at: '2026-03-12T10:00:00Z'
    },
    {
      id: 'cust-2',
      name: 'Mahbubur Rahman Chowdhury',
      phone: '01822334455',
      email: 'm.chowdhury@groupbd.com',
      address: 'Apt 4B, Equity Tower, GEC Circle',
      district: 'Chattogram',
      segment: 'VIP',
      total_spent_bdt: 14700,
      total_orders: 4,
      total_returns: 0,
      notes: 'Loves our Panjabi collections. Send Eid catalog on WhatsApp early.',
      created_at: '2026-04-05T14:30:00Z'
    },
    {
      id: 'cust-3',
      name: 'Sohail Ahmed (High Return Risk)',
      phone: '01788992211',
      email: 'sohail99@yahoo.com',
      address: 'Near Shahi Eidgah, Zindabazar',
      district: 'Sylhet',
      segment: 'Blacklisted/RTO Risk',
      total_spent_bdt: 1950,
      total_orders: 4,
      total_returns: 3, // 3 returns! Will trigger Blacklist alert!
      notes: '⚠️ HIGH RETURN RISK: Has ordered 4 times, rejected parcel 3 times. Do NOT dispatch without an advance delivery deposit!',
      created_at: '2026-05-18T09:15:00Z'
    },
    {
      id: 'cust-4',
      name: 'Tanveer Hasan',
      phone: '01977665544',
      email: 'tanveer.h@brac.net',
      address: 'Plot 45, Sector 11, Uttara',
      district: 'Dhaka',
      segment: 'Blacklisted/RTO Risk',
      total_spent_bdt: 0,
      total_orders: 2,
      total_returns: 2, // 2 returns! Will trigger alert!
      notes: 'Phone switched off when Pathao delivery man arrived. High risk COD buyer.',
      created_at: '2026-06-01T11:20:00Z'
    },
    {
      id: 'cust-5',
      name: 'Farzana Akter Pinky',
      phone: '01633445566',
      address: 'Shaheb Bazar Zero Point',
      district: 'Rajshahi',
      segment: 'Regular',
      total_spent_bdt: 5550,
      total_orders: 2,
      total_returns: 0,
      notes: 'Active on Facebook Messenger. Enquires about Kurtis frequently.',
      created_at: '2026-06-15T16:40:00Z'
    },
    {
      id: 'cust-6',
      name: 'Sadia Islam Kanta',
      phone: '01511889900',
      email: 'sadia.kanta@northsouth.edu',
      address: 'Bashundhara Residential Area, Block C',
      district: 'Dhaka',
      segment: 'New',
      total_spent_bdt: 2840,
      total_orders: 1,
      total_returns: 0,
      notes: 'First purchase via Instagram DM.',
      created_at: '2026-07-08T12:10:00Z'
    },
    {
      id: 'cust-7',
      name: 'Engr. Shahriar Kabir',
      phone: '01755112233',
      address: 'Sonadanga Residential Area, Phase 2',
      district: 'Khulna',
      segment: 'At Risk',
      total_spent_bdt: 12400,
      total_orders: 3,
      total_returns: 0,
      notes: 'VIP customer who has not purchased in over 95 days. Needs a follow-up offer.',
      created_at: '2026-01-20T15:00:00Z'
    }
  ];

  const orders: Order[] = [
    {
      id: 'ord-101',
      invoice_no: 'INV-2026-00101',
      customer_id: 'cust-1',
      customer_name: 'Dr. Nusrat Jahan',
      customer_phone: '01711223344',
      customer_address: 'House 14, Road 7, Dhanmondi R/A',
      customer_district: 'Dhaka',
      order_date: '2026-07-10T14:30:00Z',
      sales_channel: 'Facebook Messenger',
      courier_name: 'Pathao Courier',
      tracking_id: 'PTH-8891023',
      delivery_status: 'In Transit',
      items: [
        {
          product_id: 'prod-4',
          sku: 'KUR-MAR-S',
          name: 'Jamdani Motif Screen-Print Kurti - Maroon & Gold',
          size: 'S',
          color: 'Maroon',
          quantity: 2,
          unit_price_bdt: 1850,
          total_price_bdt: 3700
        }
      ],
      subtotal_bdt: 3700,
      delivery_charge_bdt: 70,
      discount_bdt: 200,
      total_amount_bdt: 3570,
      advance_paid_bdt: 3570,
      payment_status: 'Paid',
      cod_settlement_status: 'N/A',
      notes: 'Customer paid full amount upfront for promotional discount.'
    },
    {
      id: 'ord-102',
      invoice_no: 'INV-2026-00102',
      customer_id: 'cust-2',
      customer_name: 'Mahbubur Rahman Chowdhury',
      customer_phone: '01822334455',
      customer_address: 'Apt 4B, Equity Tower, GEC Circle',
      customer_district: 'Chattogram',
      order_date: '2026-07-09T18:15:00Z',
      sales_channel: 'WhatsApp',
      courier_name: 'RedX',
      tracking_id: 'RDX-4410299',
      delivery_status: 'Handed to Courier',
      items: [
        {
          product_id: 'prod-1',
          sku: 'PAN-NAVY-M',
          name: 'Premium Egyptian Cotton Panjabi - Royal Navy Blue',
          size: 'M',
          color: 'Navy Blue',
          quantity: 1,
          unit_price_bdt: 2450,
          total_price_bdt: 2450
        },
        {
          product_id: 'prod-6',
          sku: 'TS-BLK-L',
          name: 'Oversized Acid Wash Graphic T-Shirt - Pitch Black',
          size: 'L',
          color: 'Black',
          quantity: 2,
          unit_price_bdt: 990,
          total_price_bdt: 1980
        }
      ],
      subtotal_bdt: 4430,
      delivery_charge_bdt: 130,
      discount_bdt: 0,
      total_amount_bdt: 4560,
      advance_paid_bdt: 200,
      payment_status: 'COD Pending',
      cod_settlement_status: 'Pending Courier Remittance',
      notes: 'Advance delivery charge received. Balance due via COD.'
    },
    {
      id: 'ord-103',
      invoice_no: 'INV-2026-00103',
      customer_id: 'cust-5',
      customer_name: 'Farzana Akter Pinky',
      customer_phone: '01633445566',
      customer_address: 'Shaheb Bazar Zero Point',
      customer_district: 'Rajshahi',
      order_date: '2026-07-08T11:00:00Z',
      sales_channel: 'Website',
      courier_name: 'Steadfast',
      tracking_id: 'SF-990182',
      delivery_status: 'Delivered',
      items: [
        {
          product_id: 'prod-10',
          sku: 'WES-OLV-M',
          name: 'Western Co-Ord Linen Set - Olive Green',
          size: 'M',
          color: 'Olive Green',
          quantity: 1,
          unit_price_bdt: 2890,
          total_price_bdt: 2890
        }
      ],
      subtotal_bdt: 2890,
      delivery_charge_bdt: 130,
      discount_bdt: 0,
      total_amount_bdt: 3020,
      advance_paid_bdt: 0,
      payment_status: 'Paid',
      cod_settlement_status: 'Settled by Courier',
      notes: 'Delivered cleanly. Steadfast remitted COD collection on July 10.'
    },
    {
      id: 'ord-104',
      invoice_no: 'INV-2026-00104',
      customer_id: 'cust-6',
      customer_name: 'Sadia Islam Kanta',
      customer_phone: '01511889900',
      customer_address: 'Bashundhara Residential Area, Block C',
      customer_district: 'Dhaka',
      order_date: '2026-07-11T09:30:00Z',
      sales_channel: 'Instagram DM',
      courier_name: 'Pathao Courier',
      tracking_id: 'PTH-8891450',
      delivery_status: 'Packing/Stitching',
      items: [
        {
          product_id: 'prod-4',
          sku: 'KUR-MAR-S',
          name: 'Jamdani Motif Screen-Print Kurti - Maroon & Gold',
          size: 'S',
          color: 'Maroon',
          quantity: 1,
          unit_price_bdt: 1850,
          total_price_bdt: 1850
        },
        {
          product_id: 'prod-6',
          sku: 'TS-BLK-L',
          name: 'Oversized Acid Wash Graphic T-Shirt - Pitch Black',
          size: 'L',
          color: 'Black',
          quantity: 1,
          unit_price_bdt: 990,
          total_price_bdt: 990
        }
      ],
      subtotal_bdt: 2840,
      delivery_charge_bdt: 70,
      discount_bdt: 0,
      total_amount_bdt: 2910,
      advance_paid_bdt: 0,
      payment_status: 'COD Pending',
      cod_settlement_status: 'Pending Courier Remittance',
      notes: 'Urgent packaging requested for weekend event.'
    },
    {
      id: 'ord-105',
      invoice_no: 'INV-2026-00105',
      customer_id: 'cust-3',
      customer_name: 'Sohail Ahmed (High Return Risk)',
      customer_phone: '01788992211',
      customer_address: 'Near Shahi Eidgah, Zindabazar',
      customer_district: 'Sylhet',
      order_date: '2026-07-04T16:00:00Z',
      sales_channel: 'Facebook Messenger',
      courier_name: 'Pathao Courier',
      tracking_id: 'PTH-7761002',
      delivery_status: 'Returned/RTO', // Returned order!
      items: [
        {
          product_id: 'prod-9',
          sku: 'DNM-BLU-32',
          name: 'Baggy Fit Cargo Denim Pants - Vintage Indigo',
          size: 'L',
          color: 'Indigo Blue',
          quantity: 1,
          unit_price_bdt: 1950,
          total_price_bdt: 1950
        }
      ],
      subtotal_bdt: 1950,
      delivery_charge_bdt: 150,
      discount_bdt: 0,
      total_amount_bdt: 2100,
      advance_paid_bdt: 0,
      payment_status: 'Unpaid',
      cod_settlement_status: 'N/A',
      notes: 'Customer refused to pick up phone. Parcel returned to warehouse on July 8.'
    }
  ];

  const payments: PaymentLedgerEntry[] = [
    {
      id: 'pay-1',
      transaction_date: '2026-07-10',
      type: 'Customer Payment',
      category: 'Sales Revenue',
      amount_bdt: 3570,
      payment_method: 'bKash',
      reference_id: 'INV-2026-00101',
      trx_id: '9XF21AZ9Q0',
      notes: 'Full payment received from Dr. Nusrat Jahan via bKash Personal.'
    },
    {
      id: 'pay-2',
      transaction_date: '2026-07-09',
      type: 'Customer Payment',
      category: 'Delivery Charge Advance',
      amount_bdt: 200,
      payment_method: 'bKash',
      reference_id: 'INV-2026-00102',
      trx_id: '8KL99PPA12',
      notes: 'Delivery advance from Mahbubur Chowdhury.'
    },
    {
      id: 'pay-3',
      transaction_date: '2026-07-10',
      type: 'Courier COD Settlement',
      category: 'COD Remittance',
      amount_bdt: 2890,
      payment_method: 'Bank Transfer',
      reference_id: 'INV-2026-00103',
      trx_id: 'BRAC-EFT-449102',
      notes: 'Steadfast Courier COD payout directly to City Bank corporate account.'
    },
    {
      id: 'pay-4',
      transaction_date: '2026-07-07',
      type: 'Vendor Payout',
      category: 'Fabric Purchase',
      amount_bdt: 35000,
      payment_method: 'Bank Transfer',
      reference_id: 'vend-1',
      trx_id: 'IBBL-TRX-882190',
      notes: 'Paid for 150 yards of Egyptian Cotton Panjabi fabric.'
    },
    {
      id: 'pay-5',
      transaction_date: '2026-07-08',
      type: 'Vendor Payout',
      category: 'Tailoring Bill',
      amount_bdt: 18500,
      payment_method: 'Nagad',
      reference_id: 'vend-2',
      trx_id: 'NGD-77881122',
      notes: 'Stitching bill for 50 pieces of Jamdani Kurtis.'
    },
    {
      id: 'pay-6',
      transaction_date: '2026-07-06',
      type: 'Expense',
      category: 'Ad Spend',
      amount_bdt: 12000,
      payment_method: 'Bank Transfer',
      reference_id: 'FB-ADS-JULY',
      notes: 'Meta Facebook/Instagram Ad campaign budget payment for Eid collection.'
    }
  ];

  const vendors: Vendor[] = [
    {
      id: 'vend-1',
      vendor_name: 'Narayanganj Textile Mills & Dyeing',
      vendor_type: 'Fabric Supplier',
      phone: '01711887766',
      address: 'Plot 12, BSCIC Industrial Area, Narayanganj',
      total_billed_bdt: 145000,
      total_paid_bdt: 110000,
      balance_due_bdt: 35000
    },
    {
      id: 'vend-2',
      vendor_name: 'Mirpur Master Stitching Workshop',
      vendor_type: 'Stitching/Tailoring Factory',
      phone: '01819223344',
      address: 'Section 10, Block D, Mirpur, Dhaka',
      total_billed_bdt: 82000,
      total_paid_bdt: 68500,
      balance_due_bdt: 13500
    },
    {
      id: 'vend-3',
      vendor_name: 'Chawkbazar Accessories & Zari House',
      vendor_type: 'Accessories & Trims',
      phone: '01911445566',
      address: 'Urdu Road, Chawkbazar, Old Dhaka',
      total_billed_bdt: 24000,
      total_paid_bdt: 24000,
      balance_due_bdt: 0
    },
    {
      id: 'vend-4',
      vendor_name: 'Pathao Courier Service Ltd.',
      vendor_type: 'Courier Partner',
      phone: '09610003030',
      address: 'Gulshan-1, Dhaka',
      total_billed_bdt: 18400,
      total_paid_bdt: 18400,
      balance_due_bdt: 0
    }
  ];

  const activities: ActivityLog[] = [
    {
      id: 'act-1',
      timestamp: '2026-07-11T09:35:00Z',
      category: 'Order',
      description: 'New order INV-2026-00104 placed by Sadia Islam Kanta via Instagram DM.',
      performed_by: 'System'
    },
    {
      id: 'act-2',
      timestamp: '2026-07-10T16:20:00Z',
      category: 'Finance',
      description: 'Payment of 3,570 received from Dr. Nusrat Jahan via Digital Payment (TrxID: 9XF21AZ9Q0).',
      performed_by: 'Admin'
    },
    {
      id: 'act-3',
      timestamp: '2026-07-10T11:00:00Z',
      category: 'Finance',
      description: 'Courier COD remittance of 2,890 settled for INV-2026-00103.',
      performed_by: 'Admin'
    },
    {
      id: 'act-4',
      timestamp: '2026-07-09T18:20:00Z',
      category: 'Order',
      description: 'Order INV-2026-00102 handed over to RedX Courier with Tracking ID RDX-4410299.',
      performed_by: 'Admin'
    },
    {
      id: 'act-5',
      timestamp: '2026-07-08T14:10:00Z',
      category: 'Inventory',
      description: 'Stock adjusted for SKU: PAN-NAVY-M from 25 to 18 units (Reason: Factory QA Audit).',
      performed_by: 'Warehouse Manager'
    }
  ];

  const brand_profile = {
    brand_name: 'PROBAHO CRM Solutions',
    phone: '+1 555-019-2834',
    address: 'Corporate Headquarters',
    vat_bin: '001234567-0101',
    default_courier: 'Pathao Courier',
    rto_threshold: 2,
    business_type: 'clothing' as BusinessType,
    currency: 'USD ($)',
    country: 'US',
    language: 'en',
    tax_title: 'Sales Tax / EIN'
  };

  const delivery_partners = [
    { id: 'dp-1', name: 'Pathao Courier', type: 'API Integrated COD Courier', base_rate_dhaka: 70, base_rate_outside: 130, contact_phone: '09610-003030', is_active: true, created_at: new Date().toISOString() },
    { id: 'dp-2', name: 'RedX Logistics', type: 'API Integrated COD Courier', base_rate_dhaka: 65, base_rate_outside: 125, contact_phone: '09610-007339', is_active: true, created_at: new Date().toISOString() },
    { id: 'dp-3', name: 'Steadfast Courier', type: 'Standard Parcel Delivery', base_rate_dhaka: 70, base_rate_outside: 130, contact_phone: '09678-044444', is_active: true, created_at: new Date().toISOString() },
    { id: 'dp-4', name: 'eCourier', type: 'Standard Parcel Delivery', base_rate_dhaka: 75, base_rate_outside: 135, contact_phone: '09612-500500', is_active: true, created_at: new Date().toISOString() },
    { id: 'dp-5', name: 'Self Delivery / In-House Rider', type: 'In-House Rider', base_rate_dhaka: 60, base_rate_outside: 120, contact_phone: '01711-000000', is_active: true, created_at: new Date().toISOString() }
  ];

  const payment_partners = [
    { id: 'pp-1', name: 'bKash Merchant Account', channel_type: 'Mobile Financial Service (MFS)', account_number: '01711-987654 (Merchant)', settlement_charge: '1.5% COD Fee', is_active: true, created_at: new Date().toISOString() },
    { id: 'pp-2', name: 'Nagad Corporate Account', channel_type: 'Mobile Financial Service (MFS)', account_number: '01822-334455', settlement_charge: '1.2% Fee', is_active: true, created_at: new Date().toISOString() },
    { id: 'pp-3', name: 'City Bank Corporate Current Account', channel_type: 'Corporate Bank Account', account_number: '3101-99887766 (Banani Branch)', settlement_charge: '0% Bank Transfer Fee', is_active: true, created_at: new Date().toISOString() },
    { id: 'pp-4', name: 'Showroom Cash on Delivery Hub', channel_type: 'Physical Cash / COD Hub', account_number: 'Main Cash Box - Banani Showroom', settlement_charge: '0% Cash Handling', is_active: true, created_at: new Date().toISOString() }
  ];

  const user_accounts: UserAccount[] = [
    {
      id: 'user-master-1',
      name: 'Admin Owner',
      email_or_phone: 'admin@probaho.com',
      role: 'master',
      allowed_tabs: ['dashboard', 'orders', 'challan', 'inventory', 'customers', 'finance', 'vendors', 'partners', 'settings', 'staff'],
      created_at: new Date().toISOString()
    },
    {
      id: 'user-emp-1',
      name: 'Tania Akter (Sales Executive)',
      email_or_phone: '01711-889900',
      role: 'employee',
      allowed_tabs: ['orders', 'challan', 'customers'],
      created_by: 'Sajid Rahman (Owner)',
      created_at: new Date().toISOString()
    }
  ];

  return { products, customers, orders, payments, vendors, activities, brand_profile, user_accounts, delivery_partners, payment_partners };
}

export function createCleanInitialDataStore(): CRMDataStore {
  return {
    is_onboarded: false,
    products: [],
    customers: [],
    orders: [],
    payments: [],
    vendors: [],
    activities: [],
    brand_profile: {
      brand_name: '',
      business_type: 'clothing',
      country: 'US',
      language: 'en',
      phone: '',
      address: '',
      vat_bin: '',
      tax_title: 'Sales Tax / EIN',
      default_courier: 'Standard Courier',
      rto_threshold: 2,
      currency: 'USD ($)'
    },
    user_accounts: [],
    delivery_partners: [
      { id: 'dp-1', name: 'Pathao Courier', type: 'API Integrated COD Courier', base_rate_dhaka: 70, base_rate_outside: 130, contact_phone: '09610-003030', is_active: true, created_at: new Date().toISOString() },
      { id: 'dp-2', name: 'RedX Logistics', type: 'API Integrated COD Courier', base_rate_dhaka: 65, base_rate_outside: 125, contact_phone: '09610-007339', is_active: true, created_at: new Date().toISOString() },
      { id: 'dp-3', name: 'Steadfast Courier', type: 'Standard Parcel Delivery', base_rate_dhaka: 70, base_rate_outside: 130, contact_phone: '09678-044444', is_active: true, created_at: new Date().toISOString() },
      { id: 'dp-4', name: 'eCourier', type: 'Standard Parcel Delivery', base_rate_dhaka: 75, base_rate_outside: 135, contact_phone: '09612-500500', is_active: true, created_at: new Date().toISOString() },
      { id: 'dp-5', name: 'Self Delivery / In-House Rider', type: 'In-House Rider', base_rate_dhaka: 60, base_rate_outside: 120, contact_phone: '01711-000000', is_active: true, created_at: new Date().toISOString() }
    ],
    payment_partners: [
      { id: 'pp-1', name: 'Cash on Delivery (COD)', channel_type: 'Physical Cash / COD Hub', account_number: 'Courier COD Cash Remittance', settlement_charge: '0% Cash Handling', is_active: true, created_at: new Date().toISOString() },
      { id: 'pp-2', name: 'bKash Merchant / Personal', channel_type: 'Mobile Financial Service (MFS)', account_number: 'bKash Wallet', settlement_charge: '1.5% Fee', is_active: true, created_at: new Date().toISOString() },
      { id: 'pp-3', name: 'Nagad Account', channel_type: 'Mobile Financial Service (MFS)', account_number: 'Nagad Wallet', settlement_charge: '1.2% Fee', is_active: true, created_at: new Date().toISOString() },
      { id: 'pp-4', name: 'Corporate Bank Account', channel_type: 'Corporate Bank Account', account_number: 'Corporate Current Account', settlement_charge: '0% Bank Transfer Fee', is_active: true, created_at: new Date().toISOString() }
    ]
  };
}

// Local storage management wrapper ensuring super-fast offline persistence & real-time cloud sync
class CRMDatabaseService {
  private data: CRMDataStore;
  private changeListeners: Array<() => void> = [];
  private unsubscribeCloud: (() => void) | null = null;

  constructor() {
    this.data = this.loadFromStorage();
    this.initCloudSync();
  }

  public initCloudSync(): void {
    if (this.unsubscribeCloud) {
      this.unsubscribeCloud();
      this.unsubscribeCloud = null;
    }

    const workspaceId = firebaseSync.getActiveWorkspaceId();
    if (workspaceId && firebaseSync.getStatus() !== 'disconnected') {
      this.unsubscribeCloud = firebaseSync.subscribeToCloudUpdates(workspaceId, (remote) => {
        this.mergeRemoteData(remote);
      });
    }
  }

  public onDataChange(listener: () => void): () => void {
    this.changeListeners.push(listener);
    return () => {
      this.changeListeners = this.changeListeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.changeListeners.forEach(listener => {
      try {
        listener();
      } catch (err) {
        console.error('Error in database change listener:', err);
      }
    });
  }

  public mergeRemoteData(remoteData: Partial<CRMDataStore>): void {
    if (!remoteData) return;
    let hasChanges = false;

    if (Array.isArray(remoteData.products)) {
      this.data.products = remoteData.products;
      hasChanges = true;
    }
    if (Array.isArray(remoteData.orders)) {
      this.data.orders = remoteData.orders;
      hasChanges = true;
    }
    if (Array.isArray(remoteData.customers)) {
      this.data.customers = remoteData.customers;
      hasChanges = true;
    }
    if (Array.isArray(remoteData.payments)) {
      this.data.payments = remoteData.payments;
      hasChanges = true;
    }
    if (Array.isArray(remoteData.vendors)) {
      this.data.vendors = remoteData.vendors;
      hasChanges = true;
    }
    if (Array.isArray(remoteData.activities)) {
      this.data.activities = remoteData.activities;
      hasChanges = true;
    }
    if (remoteData.brand_profile) {
      this.data.brand_profile = remoteData.brand_profile;
      hasChanges = true;
    }
    if (Array.isArray(remoteData.user_accounts)) {
      this.data.user_accounts = remoteData.user_accounts;
      hasChanges = true;
    }
    if (Array.isArray(remoteData.delivery_partners)) {
      this.data.delivery_partners = remoteData.delivery_partners;
      hasChanges = true;
    }
    if (Array.isArray(remoteData.payment_partners)) {
      this.data.payment_partners = remoteData.payment_partners;
      hasChanges = true;
    }
    if (remoteData.is_onboarded !== undefined) {
      this.data.is_onboarded = remoteData.is_onboarded;
      hasChanges = true;
    }

    if (hasChanges) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (err) {
        console.error('Error persisting merged cloud data to local storage:', err);
      }
      this.notifyListeners();
    }
  }

  public sanitizeDataStore(parsed: any): CRMDataStore {
    const clean = createCleanInitialDataStore();
    if (!parsed || typeof parsed !== 'object') return clean;
    return {
      products: Array.isArray(parsed.products) ? parsed.products : [],
      customers: Array.isArray(parsed.customers) ? parsed.customers : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      payments: Array.isArray(parsed.payments) ? parsed.payments : [],
      vendors: Array.isArray(parsed.vendors) ? parsed.vendors : [],
      activities: Array.isArray(parsed.activities) ? parsed.activities : [],
      brand_profile: parsed.brand_profile && typeof parsed.brand_profile === 'object'
        ? { ...clean.brand_profile, ...parsed.brand_profile }
        : clean.brand_profile,
      user_accounts: Array.isArray(parsed.user_accounts) && parsed.user_accounts.length > 0
        ? parsed.user_accounts
        : clean.user_accounts,
      delivery_partners: Array.isArray(parsed.delivery_partners) && parsed.delivery_partners.length > 0
        ? parsed.delivery_partners
        : clean.delivery_partners,
      payment_partners: Array.isArray(parsed.payment_partners) && parsed.payment_partners.length > 0
        ? parsed.payment_partners
        : clean.payment_partners,
      is_onboarded: parsed.is_onboarded ?? false,
      workspace_id: parsed.workspace_id || clean.workspace_id,
      last_synced_at: parsed.last_synced_at
    };
  }

  private loadFromStorage(): CRMDataStore {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return this.sanitizeDataStore(parsed);
      }
    } catch {
      console.warn('Could not read from local storage, initializing clean data store...');
    }
    const clean = createCleanInitialDataStore();
    this.saveToStorage(clean);
    return clean;
  }

  public saveToStorage(data: CRMDataStore, performedBy: string = 'User'): void {
    this.data = data;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err: any) {
      console.error('Error saving to local storage:', err);
      // Quota management: prune older activity entries if storage is nearing capacity
      if (err?.name === 'QuotaExceededError' || err?.code === 22) {
        if (data.activities && data.activities.length > 50) {
          data.activities = data.activities.slice(0, 50);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          } catch {
            console.error('Local storage critically full.');
          }
        }
      }
    }

    // Auto-sync asynchronously to Firebase if connected
    if (firebaseSync.getStatus() !== 'disconnected') {
      firebaseSync.pushDataToCloud(data, performedBy).catch(() => {});
    }

    this.notifyListeners();
  }

  public getWorkspaceId(): string {
    return this.data.workspace_id || firebaseSync.getActiveWorkspaceId();
  }

  public setWorkspaceId(id: string): void {
    const cleanId = id.trim().toUpperCase();
    this.data.workspace_id = cleanId;
    firebaseSync.setWorkspaceId(cleanId);
    this.saveToStorage(this.data);
    this.initCloudSync();
  }

  public getDataStore(): CRMDataStore {
    return this.data;
  }

  public getData(): CRMDataStore {
    return this.data;
  }

  public isOnboarded(): boolean {
    return Boolean(
      this.data.is_onboarded && 
      this.data.brand_profile && 
      this.data.brand_profile.brand_name && 
      this.data.brand_profile.brand_name.trim().length > 0 &&
      this.data.user_accounts && 
      this.data.user_accounts.length > 0
    );
  }

  public completeOnboarding(params: {
    brandName: string;
    businessType?: BusinessType;
    country?: string;
    language?: string;
    phone: string;
    address: string;
    vatBin?: string;
    taxTitle?: string;
    currency?: string;
    ownerName: string;
    ownerEmailOrPhone: string;
    pinCode?: string;
    defaultCourier?: string;
    activeCouriers?: string[];
    activePayments?: string[];
    loadDemoData?: boolean;
  }): void {
    if (params.loadDemoData) {
      const demoData = generateDemoSeedData();
      demoData.brand_profile = {
        brand_name: params.brandName.trim() || 'My Business',
        business_type: params.businessType || 'clothing',
        country: params.country || 'US',
        language: params.language || 'en',
        phone: params.phone.trim() || '+1 555-019-2834',
        address: params.address.trim() || 'Corporate Headquarters',
        vat_bin: params.vatBin?.trim() || '',
        tax_title: params.taxTitle || 'Sales Tax / EIN',
        default_courier: params.defaultCourier || 'Standard Courier',
        rto_threshold: 2,
        currency: params.currency || 'USD ($)'
      };
      const ownerUser: UserAccount = {
        id: `user-owner-${Date.now()}`,
        name: `${params.ownerName.trim() || 'Business Owner'} (Owner)`,
        email_or_phone: params.ownerEmailOrPhone.trim() || 'owner@business.com',
        role: 'master',
        pin_code: params.pinCode?.trim() || undefined,
        allowed_tabs: ['dashboard', 'orders', 'challan', 'inventory', 'customers', 'finance', 'vendors', 'partners', 'settings', 'staff'],
        created_at: new Date().toISOString()
      };
      demoData.user_accounts = [ownerUser];
      demoData.is_onboarded = true;
      demoData.activities = [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          category: 'System',
          description: `Business workspace initialized with sample demonstration data for "${demoData.brand_profile.brand_name}".`,
          performed_by: ownerUser.name
        }
      ];
      this.saveToStorage(demoData);
      this.setCurrentUser(ownerUser.id);
      return;
    }

    // Clean Slate initialization (Default & Recommended)
    const cleanStore = createCleanInitialDataStore();
    cleanStore.is_onboarded = true;
    cleanStore.brand_profile = {
      brand_name: params.brandName.trim(),
      business_type: params.businessType || 'clothing',
      country: params.country || 'US',
      language: params.language || 'en',
      phone: params.phone.trim(),
      address: params.address.trim(),
      vat_bin: params.vatBin?.trim() || '',
      tax_title: params.taxTitle || 'Sales Tax / EIN',
      default_courier: params.defaultCourier || 'Standard Courier',
      rto_threshold: 2,
      currency: params.currency || 'USD ($)'
    };

    const masterUser: UserAccount = {
      id: `user-owner-${Date.now()}`,
      name: `${params.ownerName.trim()} (Owner)`,
      email_or_phone: params.ownerEmailOrPhone.trim(),
      role: 'master',
      pin_code: params.pinCode?.trim() || undefined,
      allowed_tabs: ['dashboard', 'orders', 'challan', 'inventory', 'customers', 'finance', 'vendors', 'partners', 'settings', 'staff'],
      created_at: new Date().toISOString()
    };
    cleanStore.user_accounts = [masterUser];

    // Configure couriers
    if (params.activeCouriers && params.activeCouriers.length > 0 && cleanStore.delivery_partners) {
      cleanStore.delivery_partners.forEach(dp => {
        dp.is_active = params.activeCouriers!.includes(dp.name);
      });
    }

    // Configure payment methods
    if (params.activePayments && params.activePayments.length > 0 && cleanStore.payment_partners) {
      cleanStore.payment_partners.forEach(pp => {
        pp.is_active = params.activePayments!.includes(pp.name);
      });
    }

    cleanStore.activities = [
      {
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        category: 'System',
        description: `Clean business workspace created for "${cleanStore.brand_profile.brand_name}". Ready for operation.`,
        performed_by: masterUser.name
      }
    ];

    this.saveToStorage(cleanStore);
    this.setCurrentUser(masterUser.id);
  }

  public resetToCleanSlate(preserveProfile = true): void {
    const existingBrand = this.data.brand_profile;
    const existingUsers = this.data.user_accounts;
    const clean = createCleanInitialDataStore();
    
    if (preserveProfile && existingBrand?.brand_name) {
      clean.is_onboarded = true;
      clean.brand_profile = existingBrand;
      clean.user_accounts = existingUsers;
      clean.activities = [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          category: 'System',
          description: `All transaction records cleared. Workspace reset to clean slate.`,
          performed_by: this.getCurrentUser().name
        }
      ];
    } else {
      clean.is_onboarded = false;
    }
    
    this.saveToStorage(clean);
  }

  public loadDemoData(): void {
    const seed = generateDemoSeedData();
    seed.is_onboarded = true;
    this.saveToStorage(seed);
    const firstMaster = seed.user_accounts?.find(u => u.role === 'master');
    if (firstMaster) {
      this.setCurrentUser(firstMaster.id);
    }
  }

  public resetSeed(): CRMDataStore {
    return this.data;
  }

  public resetAndSeed(): void {
    this.loadDemoData();
  }

  public backupToJson(): string {
    return JSON.stringify(this.data, null, 2);
  }

  public restoreFromJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        this.data = this.sanitizeDataStore(parsed);
        this.saveToStorage(this.data);
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON backup file:', e);
    }
    return false;
  }

  // --- Products CRUD ---
  public getProducts(): Product[] {
    return this.data.products;
  }

  public saveProduct(product: Product): void {
    const index = this.data.products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      this.data.products[index] = product;
    } else {
      this.data.products.unshift(product);
    }
    this.saveToStorage(this.data);
  }

  public adjustStock(productId: string, delta: number, reason: string, performedBy: string): void {
    const p = this.data.products.find(item => item.id === productId);
    if (p) {
      const oldQty = p.stock_quantity;
      p.stock_quantity = Math.max(0, oldQty + delta);
      this.logActivity(
        'Inventory',
        `Adjusted stock for SKU [${p.sku}] from ${oldQty} to ${p.stock_quantity} units. Reason: ${reason}`,
        performedBy
      );
      this.saveToStorage(this.data);
    }
  }

  // --- Customers CRUD & Blacklist Checker ---
  public getCustomers(): Customer[] {
    return this.data.customers;
  }

  public checkBlacklistRisk(phone: string): { isRisk: boolean; returnsCount: number; message: string } {
    const cleanPhone = phone.replace(/\D/g, '');
    const matched = this.data.customers.find(c => c.phone.replace(/\D/g, '').endsWith(cleanPhone.slice(-10)));
    
    if (matched && (matched.total_returns >= 2 || matched.segment === 'Blacklisted/RTO Risk')) {
      return {
        isRisk: true,
        returnsCount: matched.total_returns,
        message: `⚠️ HIGH RETURN RISK: Customer "${matched.name}" has ${matched.total_returns} previous return(s)/rejection(s)! Strongly advise collecting an advance delivery deposit before dispatch.`
      };
    }
    return { isRisk: false, returnsCount: matched ? matched.total_returns : 0, message: '' };
  }

  public saveCustomer(customer: Customer): void {
    const index = this.data.customers.findIndex(c => c.id === customer.id);
    if (index >= 0) {
      this.data.customers[index] = customer;
    } else {
      this.data.customers.unshift(customer);
    }
    this.saveToStorage(this.data);
  }

  // --- Orders CRUD & Pipeline ---
  public getOrders(): Order[] {
    return this.data.orders;
  }

  public saveOrder(order: Order, performedBy: string = 'Admin'): void {
    const index = this.data.orders.findIndex(o => o.id === order.id);
    if (index >= 0) {
      order.last_modified_by = performedBy;
      this.data.orders[index] = order;
      this.logActivity('Order', `Updated order [${order.invoice_no}] for ${order.customer_name}`, performedBy);
    } else {
      order.created_by = order.created_by || performedBy;
      order.last_modified_by = performedBy;
      this.data.orders.unshift(order);

      // Deduct stock on new order
      order.items.forEach(item => {
        const prod = this.data.products.find(p => p.id === item.product_id);
        if (prod) {
          prod.stock_quantity = Math.max(0, prod.stock_quantity - item.quantity);
        }
      });

      // Ensure customer exists in database
      const cleanPhone = (order.customer_phone || '').replace(/\D/g, '');
      let cust = this.data.customers.find(c => {
        const cPhone = c.phone.replace(/\D/g, '');
        return c.id === order.customer_id || (cleanPhone.length >= 7 && cPhone.endsWith(cleanPhone.slice(-10)));
      });

      if (!cust && order.customer_name) {
        const newCust: Customer = {
          id: order.customer_id || `cust-${Date.now()}`,
          name: order.customer_name,
          phone: order.customer_phone || '',
          address: order.customer_address || '',
          district: order.customer_district || '',
          total_orders: 1,
          total_spent_bdt: order.total_amount_bdt || 0,
          total_returns: 0,
          segment: 'New',
          notes: `Created via order [${order.invoice_no}]`,
          created_at: new Date().toISOString()
        };
        this.data.customers.unshift(newCust);
        order.customer_id = newCust.id;
      } else if (cust) {
        order.customer_id = cust.id;
      }

      this.logActivity('Order', `Created new order [${order.invoice_no}] for ${order.customer_name} via ${order.sales_channel}`, performedBy);
    }
    this.saveToStorage(this.data, performedBy);
  }

  public updateOrderStatus(orderId: string, newStatus: Order['delivery_status'], performedBy: string = 'Admin'): void {
    const order = this.data.orders.find(o => o.id === orderId);
    if (order && order.delivery_status !== newStatus) {
      const oldStatus = order.delivery_status;
      order.delivery_status = newStatus;
      order.last_modified_by = performedBy;
      const cust = this.data.customers.find(c => c.id === order.customer_id);

      // Inventory & Customer metrics handling for Returned/RTO status
      if (newStatus === 'Returned/RTO' && oldStatus !== 'Returned/RTO') {
        // Transition TO Returned: restore stock & increment returns
        order.items.forEach(item => {
          const prod = this.data.products.find(p => p.id === item.product_id);
          if (prod) prod.stock_quantity += item.quantity;
        });
        if (cust) {
          cust.total_returns += 1;
          if (cust.total_returns >= 2) cust.segment = 'Blacklisted/RTO Risk';
        }
      } else if (oldStatus === 'Returned/RTO' && newStatus !== 'Returned/RTO') {
        // Transition AWAY FROM Returned: re-deduct restored stock & decrement returns
        order.items.forEach(item => {
          const prod = this.data.products.find(p => p.id === item.product_id);
          if (prod) prod.stock_quantity = Math.max(0, prod.stock_quantity - item.quantity);
        });
        if (cust) {
          cust.total_returns = Math.max(0, cust.total_returns - 1);
          if (cust.total_returns < 2 && cust.segment === 'Blacklisted/RTO Risk') {
            cust.segment = cust.total_orders > 3 ? 'VIP' : 'Regular';
          }
        }
      }

      // Customer metrics handling for Delivered status
      if (newStatus === 'Delivered' && oldStatus !== 'Delivered') {
        if (cust) {
          cust.total_orders += 1;
          cust.total_spent_bdt += order.total_amount_bdt;
          if (cust.total_spent_bdt >= 15000 || cust.total_orders >= 4) {
            cust.segment = 'Champions';
          } else if (cust.total_spent_bdt >= 8000 || cust.total_orders >= 2) {
            cust.segment = 'VIP';
          }
        }
      } else if (oldStatus === 'Delivered' && newStatus !== 'Delivered') {
        if (cust) {
          cust.total_orders = Math.max(0, cust.total_orders - 1);
          cust.total_spent_bdt = Math.max(0, cust.total_spent_bdt - order.total_amount_bdt);
          if (cust.total_spent_bdt < 8000 && cust.total_orders < 2 && (cust.segment === 'Champions' || cust.segment === 'VIP')) {
            cust.segment = 'Regular';
          }
        }
      }

      this.logActivity('Order', `Order [${order.invoice_no}] status updated from "${oldStatus}" to "${newStatus}"`, performedBy);
      this.saveToStorage(this.data, performedBy);
    }
  }

  public deleteOrder(orderId: string, performedBy: string = 'Admin'): boolean {
    const idx = this.data.orders.findIndex(o => o.id === orderId);
    if (idx === -1) return false;

    const order = this.data.orders[idx];
    // If order was active (not already returned), restore stock
    if (order.delivery_status !== 'Returned/RTO') {
      order.items.forEach(item => {
        const prod = this.data.products.find(p => p.id === item.product_id);
        if (prod) prod.stock_quantity += item.quantity;
      });
    }

    // If order was delivered, revert customer metrics
    if (order.delivery_status === 'Delivered') {
      const cust = this.data.customers.find(c => c.id === order.customer_id);
      if (cust) {
        cust.total_orders = Math.max(0, cust.total_orders - 1);
        cust.total_spent_bdt = Math.max(0, cust.total_spent_bdt - order.total_amount_bdt);
      }
    }

    this.data.orders.splice(idx, 1);
    this.logActivity('Order', `Deleted Order [${order.invoice_no}] for ${order.customer_name}`, performedBy);
    this.saveToStorage(this.data, performedBy);
    return true;
  }

  public updateOrderTracking(orderId: string, trackingId: string, performedBy: string = 'Admin'): void {
    const order = this.data.orders.find(o => o.id === orderId);
    if (order) {
      order.tracking_id = trackingId;
      this.logActivity('Order', `Attached tracking/barcode ID [${trackingId}] to Order [${order.invoice_no}]`, performedBy);
      this.saveToStorage(this.data, performedBy);
    }
  }

  public updateOrderDetails(updatedOrder: Order, performedBy: string = 'Admin'): void {
    const idx = this.data.orders.findIndex(o => o.id === updatedOrder.id);
    if (idx !== -1) {
      this.data.orders[idx] = { ...this.data.orders[idx], ...updatedOrder };
      this.logActivity('Order', `Updated details for Order [${updatedOrder.invoice_no}]`, performedBy);
      this.saveToStorage(this.data, performedBy);
    }
  }

  public createSizeExchange(originalOrderId: string, newItem: Order['items'][0], performedBy: string = 'Admin'): Order | null {
    const orig = this.data.orders.find(o => o.id === originalOrderId);
    if (!orig) return null;

    const deliveryCharge = orig.delivery_charge_bdt ?? 0;
    const exchangeOrder: Order = {
      id: `ord-exc-${Date.now()}`,
      invoice_no: `EXC-${orig.invoice_no.replace('INV-', '')}`,
      customer_id: orig.customer_id,
      customer_name: orig.customer_name,
      customer_phone: orig.customer_phone,
      customer_address: orig.customer_address,
      customer_district: orig.customer_district,
      order_date: new Date().toISOString(),
      sales_channel: orig.sales_channel,
      courier_name: orig.courier_name,
      delivery_status: 'Order Placed',
      items: [newItem],
      subtotal_bdt: 0,
      delivery_charge_bdt: deliveryCharge,
      discount_bdt: 0,
      total_amount_bdt: deliveryCharge,
      advance_paid_bdt: 0,
      payment_status: 'COD Pending',
      cod_settlement_status: 'Pending Courier Remittance',
      notes: `Size/Variant Exchange for Original Invoice ${orig.invoice_no}`,
      is_exchange: true,
      original_order_id: orig.id
    };

    this.saveOrder(exchangeOrder, performedBy);
    return exchangeOrder;
  }

  // --- Payments & Ledger ---
  public getPayments(): PaymentLedgerEntry[] {
    return this.data.payments;
  }

  public addPayment(payment: any, performedBy: string = 'Admin'): void {
    if (!payment.id) payment.id = `pay-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    if (!payment.transaction_date) payment.transaction_date = payment.date || new Date().toISOString();
    if (!payment.payment_method) payment.payment_method = payment.method || 'Cash';
    this.data.payments.unshift(payment);
    if (payment.type === 'Courier COD Settlement' && payment.reference_id) {
      const order = this.data.orders.find(o => o.invoice_no === payment.reference_id || o.id === payment.reference_id);
      if (order) {
        order.cod_settlement_status = 'Settled by Courier';
        order.payment_status = 'Paid';
      }
    }
    const sym = this.data.brand_profile?.currency?.match(/\((.*?)\)/)?.[1] || '$';
    this.logActivity('Finance', `Logged ${payment.type || 'Payment'} of ${sym}${(payment.amount_bdt || 0).toLocaleString()} via ${payment.payment_method} (${payment.category || 'General'})`, performedBy);
    this.saveToStorage(this.data);
  }

  // --- Vendors CRUD ---
  public getVendors(): Vendor[] {
    return this.data.vendors;
  }

  public saveVendor(vendor: Vendor): void {
    const idx = this.data.vendors.findIndex(v => v.id === vendor.id);
    if (idx >= 0) {
      this.data.vendors[idx] = vendor;
    } else {
      this.data.vendors.unshift(vendor);
    }
    this.saveToStorage(this.data);
  }

  // --- Activities ---
  public getActivities(): ActivityLog[] {
    return this.data.activities;
  }

  private logActivity(category: ActivityLog['category'], description: string, performedBy: string): void {
    const entry: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category,
      description,
      performed_by: performedBy
    };
    this.data.activities.unshift(entry);
    if (this.data.activities.length > 200) {
      this.data.activities.pop();
    }
  }

  // --- Aliases & Batch Reconciliation for App compatibility ---
  public getPaymentsLedger(): PaymentLedgerEntry[] {
    return this.getPayments();
  }

  public addOrder(order: Order, performedBy: string = 'Admin'): void {
    this.saveOrder(order, performedBy);
  }

  public checkRTOBlacklist(phone: string): { isRisk: boolean; returnsCount: number; message: string } {
    return this.checkBlacklistRisk(phone);
  }

  public adjustProductStock(productId: string, delta: number, reason: string, performedBy: string = 'Admin'): void {
    this.adjustStock(productId, delta, reason, performedBy);
  }

  public updateCustomer(customer: Customer): void {
    this.saveCustomer(customer);
  }

  public addPaymentLedgerEntry(payment: any, performedBy: string = 'Admin'): void {
    this.addPayment(payment, performedBy);
  }

  public updateVendor(vendor: Vendor): void {
    this.saveVendor(vendor);
  }

  public reconcileCourierCodBatch(courierName: string, settlementRef: string, performedBy: string = 'Admin'): void {
    let settledAmount = 0;
    let settledCount = 0;
    this.data.orders.forEach(o => {
      if (
        (o.courier_name.toLowerCase().includes(courierName.toLowerCase()) || courierName === 'All') &&
        o.delivery_status === 'Delivered' &&
        o.cod_settlement_status === 'Pending Courier Remittance'
      ) {
        const due = o.total_amount_bdt - (o.advance_paid_bdt || 0);
        settledAmount += due;
        settledCount += 1;
        o.cod_settlement_status = 'Settled by Courier';
        o.payment_status = 'Paid';
      }
    });

    if (settledCount > 0) {
      const entry: PaymentLedgerEntry = {
        id: `pay-settle-${Date.now()}`,
        transaction_date: new Date().toISOString(),
        date: new Date().toISOString(),
        type: 'Courier COD Settlement',
        direction: 'inflow',
        category: 'COD Remittance',
        party_name: courierName,
        amount_bdt: settledAmount,
        payment_method: 'Bank Transfer',
        method: 'Bank Transfer',
        reference_id: settlementRef,
        description: `Batch COD Settlement (${settledCount} invoices settled via ${courierName})`
      };
      this.data.payments.unshift(entry);
      const sym = this.data.brand_profile?.currency?.match(/\((.*?)\)/)?.[1] || '$';
      this.logActivity('Finance', `Reconciled COD Batch [${settlementRef}] from ${courierName} for ${settledCount} orders totaling ${sym}${settledAmount.toLocaleString()}`, performedBy);
      this.saveToStorage(this.data);
    }
  }

  public getBrandProfile(): BrandProfile {
    if (!this.data.brand_profile) {
      this.data.brand_profile = {
        brand_name: '',
        phone: '',
        address: '',
        vat_bin: '',
        default_courier: 'Standard Courier',
        rto_threshold: 2,
        currency: 'USD ($)',
        country: 'US',
        language: 'en',
        tax_title: 'Sales Tax / EIN'
      };
      this.saveToStorage(this.data);
    }
    return this.data.brand_profile;
  }

  public saveBrandProfile(profile: BrandProfile, performedBy: string = 'Admin'): void {
    this.data.brand_profile = profile;
    this.logActivity('System', `Updated Brand & Company Profile (${profile.brand_name || 'My Brand'})`, performedBy);
    this.saveToStorage(this.data);
  }

  public getUserAccounts(): UserAccount[] {
    if (!this.data.user_accounts || !Array.isArray(this.data.user_accounts)) {
      this.data.user_accounts = [];
      this.saveToStorage(this.data);
    }
    // Ensure all accounts have is_active defined (defaults to true)
    return this.data.user_accounts.map(u => ({
      ...u,
      is_active: u.is_active !== false
    }));
  }

  public saveUserAccount(account: UserAccount, performedBy: string = 'Admin'): void {
    const accounts = [...this.getUserAccounts()];
    const index = accounts.findIndex(a => a.id === account.id);
    const sanitizedAccount: UserAccount = {
      ...account,
      is_active: account.is_active !== false
    };

    if (index >= 0) {
      accounts[index] = sanitizedAccount;
    } else {
      accounts.push(sanitizedAccount);
    }
    this.data.user_accounts = accounts;
    this.logActivity('System', `Updated profile [${account.name}] (Role: ${account.role.toUpperCase()})`, performedBy);
    this.saveToStorage(this.data, performedBy);
  }

  public toggleUserActive(userId: string, performedBy: string = 'Admin'): { success: boolean; message: string; is_active?: boolean } {
    const accounts = [...this.getUserAccounts()];
    const target = accounts.find(a => a.id === userId);
    if (!target) return { success: false, message: 'Profile not found.' };

    if (target.role === 'master' && target.is_active !== false) {
      const activeMasters = accounts.filter(a => a.role === 'master' && a.is_active !== false);
      if (activeMasters.length <= 1) {
        return { success: false, message: '⚠️ Cannot deactivate the only active Master profile! At least one Master profile must remain active.' };
      }
    }

    target.is_active = target.is_active === false ? true : false;
    this.data.user_accounts = accounts;
    this.logActivity('System', `${target.is_active ? 'Re-activated' : 'Deactivated / Revoked access for'} profile [${target.name}]`, performedBy);
    this.saveToStorage(this.data, performedBy);
    return { success: true, message: `Profile "${target.name}" is now ${target.is_active ? 'Active' : 'Deactivated'}.`, is_active: target.is_active };
  }

  public deleteUserAccount(userId: string, performedBy: string = 'Admin'): { success: boolean; message: string } {
    const accounts = [...this.getUserAccounts()];
    const target = accounts.find(a => a.id === userId);
    if (!target) return { success: false, message: 'Profile not found.' };
    
    const masters = accounts.filter(a => a.role === 'master');
    if (target.role === 'master' && masters.length <= 1) {
      return { success: false, message: '⚠️ Cannot delete the only remaining Master Profile! At least one Master profile must exist.' };
    }
    
    this.data.user_accounts = accounts.filter(a => a.id !== userId);
    this.logActivity('System', `Deleted user profile [${target.name}]`, performedBy);
    this.saveToStorage(this.data, performedBy);
    return { success: true, message: `Successfully deleted profile: ${target.name}` };
  }

  public getCurrentUser(): UserAccount {
    const accounts = this.getUserAccounts();
    const activeId = localStorage.getItem('VASTRA_CRM_ACTIVE_USER_ID');
    if (activeId) {
      const found = accounts.find(a => a.id === activeId);
      if (found && found.is_active !== false) return found;
      // If found but deactivated, remove active user id
      localStorage.removeItem('VASTRA_CRM_ACTIVE_USER_ID');
    }
    const firstActiveMaster = accounts.find(a => a.role === 'master' && a.is_active !== false) || accounts[0];
    if (firstActiveMaster && firstActiveMaster.is_active !== false) {
      localStorage.setItem('VASTRA_CRM_ACTIVE_USER_ID', firstActiveMaster.id);
      return firstActiveMaster;
    }
    const brandName = this.data.brand_profile?.brand_name || 'Business Owner';
    return {
      id: 'user-default-master',
      name: `${brandName} (Owner)`,
      email_or_phone: this.data.brand_profile?.phone || 'owner@business.com',
      role: 'master',
      is_active: true,
      allowed_tabs: ['dashboard', 'orders', 'challan', 'inventory', 'customers', 'finance', 'vendors', 'partners', 'settings', 'staff']
    };
  }

  public setCurrentUser(userId: string): void {
    localStorage.setItem('VASTRA_CRM_ACTIVE_USER_ID', userId);
    this.notifyListeners();
  }

  public authenticateUserWithPin(phoneOrEmail: string, pin: string): { success: boolean; user?: UserAccount; message: string } {
    const accounts = this.getUserAccounts();
    const cleanInput = phoneOrEmail.trim().toLowerCase();
    const cleanPin = pin.trim();

    const matched = accounts.find(a => {
      const phoneClean = a.email_or_phone.replace(/\D/g, '');
      const inputPhoneClean = cleanInput.replace(/\D/g, '');
      const emailMatch = a.email_or_phone.trim().toLowerCase() === cleanInput;
      const phoneMatch = inputPhoneClean.length >= 7 && phoneClean.endsWith(inputPhoneClean.slice(-10));
      const idMatch = a.id.toLowerCase() === cleanInput;
      return emailMatch || phoneMatch || idMatch;
    });

    if (!matched) {
      return { success: false, message: 'No staff account found with this Phone, Email, or Staff ID.' };
    }

    if (matched.is_active === false) {
      return { success: false, message: '⚠️ Access Revoked: This employee account has been deactivated by the Master.' };
    }

    if (matched.pin_code && matched.pin_code.trim() !== '') {
      if (matched.pin_code.trim() !== cleanPin) {
        return { success: false, message: 'Incorrect PIN entered. Please check your 4-digit PIN.' };
      }
    }

    matched.last_active_at = new Date().toISOString();
    this.setCurrentUser(matched.id);
    this.saveToStorage(this.data, matched.name);

    return { success: true, user: matched, message: 'Logged in successfully!' };
  }

  // --- Delivery & Payment Partners Management ---
  public getDeliveryPartners(): DeliveryPartner[] {
    if (!this.data.delivery_partners) {
      this.data.delivery_partners = [
        { id: 'dp-1', name: 'Pathao Courier', type: 'API Integrated COD Courier', base_rate_dhaka: 70, base_rate_outside: 130, contact_phone: '09610-003030', is_active: true, created_at: new Date().toISOString() },
        { id: 'dp-2', name: 'RedX Logistics', type: 'API Integrated COD Courier', base_rate_dhaka: 65, base_rate_outside: 125, contact_phone: '09610-007339', is_active: true, created_at: new Date().toISOString() },
        { id: 'dp-3', name: 'Steadfast Courier', type: 'Standard Parcel Delivery', base_rate_dhaka: 70, base_rate_outside: 130, contact_phone: '09678-044444', is_active: true, created_at: new Date().toISOString() },
        { id: 'dp-4', name: 'eCourier', type: 'Standard Parcel Delivery', base_rate_dhaka: 75, base_rate_outside: 135, contact_phone: '09612-500500', is_active: true, created_at: new Date().toISOString() },
        { id: 'dp-5', name: 'Self Delivery / In-House Rider', type: 'In-House Rider', base_rate_dhaka: 60, base_rate_outside: 120, contact_phone: '01711-000000', is_active: true, created_at: new Date().toISOString() }
      ];
      this.saveToStorage(this.data);
    }
    return this.data.delivery_partners;
  }

  public addDeliveryPartner(partner: Omit<DeliveryPartner, 'id' | 'created_at'>, performedBy: string = 'Admin'): DeliveryPartner {
    const list = this.getDeliveryPartners();
    const newPartner: DeliveryPartner = {
      ...partner,
      id: `dp-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    list.push(newPartner);
    this.saveToStorage(this.data);
    this.logActivity('System', `Added Delivery Partner (${newPartner.name})`, performedBy);
    return newPartner;
  }

  public toggleDeliveryPartnerStatus(id: string, performedBy: string = 'Admin'): void {
    const list = this.getDeliveryPartners();
    const p = list.find(x => x.id === id);
    if (p) {
      p.is_active = !p.is_active;
      this.saveToStorage(this.data);
      this.logActivity('System', `Updated status of Delivery Partner (${p.name}) to ${p.is_active ? 'Active' : 'Inactive'}`, performedBy);
    }
  }

  public removeDeliveryPartner(id: string, performedBy: string = 'Admin'): void {
    const list = this.getDeliveryPartners();
    const idx = list.findIndex(x => x.id === id);
    if (idx !== -1) {
      const removed = list[idx];
      this.data.delivery_partners = list.filter(x => x.id !== id);
      this.saveToStorage(this.data);
      this.logActivity('System', `Removed Delivery Partner (${removed.name})`, performedBy);
    }
  }

  public updateDeliveryPartner(id: string, updates: Partial<Omit<DeliveryPartner, 'id' | 'created_at'>>, performedBy: string = 'Admin'): void {
    const list = this.getDeliveryPartners();
    const p = list.find(x => x.id === id);
    if (p) {
      Object.assign(p, updates);
      this.saveToStorage(this.data);
      this.logActivity('System', `Updated Delivery Partner (${p.name})`, performedBy);
    }
  }

  public getPaymentPartners(): PaymentPartner[] {
    if (!this.data.payment_partners) {
      this.data.payment_partners = [
        { id: 'pp-1', name: 'bKash Merchant Account', channel_type: 'Mobile Financial Service (MFS)', account_number: '01711-987654 (Merchant)', settlement_charge: '1.5% COD Fee', is_active: true, created_at: new Date().toISOString() },
        { id: 'pp-2', name: 'Nagad Corporate Account', channel_type: 'Mobile Financial Service (MFS)', account_number: '01822-334455', settlement_charge: '1.2% Fee', is_active: true, created_at: new Date().toISOString() },
        { id: 'pp-3', name: 'City Bank Corporate Current Account', channel_type: 'Corporate Bank Account', account_number: '3101-99887766 (Banani Branch)', settlement_charge: '0% Bank Transfer Fee', is_active: true, created_at: new Date().toISOString() },
        { id: 'pp-4', name: 'Showroom Cash on Delivery Hub', channel_type: 'Physical Cash / COD Hub', account_number: 'Main Cash Box - Banani Showroom', settlement_charge: '0% Cash Handling', is_active: true, created_at: new Date().toISOString() }
      ];
      this.saveToStorage(this.data);
    }
    return this.data.payment_partners;
  }

  public addPaymentPartner(partner: Omit<PaymentPartner, 'id' | 'created_at'>, performedBy: string = 'Admin'): PaymentPartner {
    const list = this.getPaymentPartners();
    const newPartner: PaymentPartner = {
      ...partner,
      id: `pp-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    list.push(newPartner);
    this.saveToStorage(this.data);
    this.logActivity('System', `Added Payment Partner (${newPartner.name})`, performedBy);
    return newPartner;
  }

  public togglePaymentPartnerStatus(id: string, performedBy: string = 'Admin'): void {
    const list = this.getPaymentPartners();
    const p = list.find(x => x.id === id);
    if (p) {
      p.is_active = !p.is_active;
      this.saveToStorage(this.data);
      this.logActivity('System', `Updated status of Payment Partner (${p.name}) to ${p.is_active ? 'Active' : 'Inactive'}`, performedBy);
    }
  }

  public removePaymentPartner(id: string, performedBy: string = 'Admin'): void {
    const list = this.getPaymentPartners();
    const idx = list.findIndex(x => x.id === id);
    if (idx !== -1) {
      const removed = list[idx];
      this.data.payment_partners = list.filter(x => x.id !== id);
      this.saveToStorage(this.data);
      this.logActivity('System', `Removed Payment Partner (${removed.name})`, performedBy);
    }
  }

  public updatePaymentPartner(id: string, updates: Partial<Omit<PaymentPartner, 'id' | 'created_at'>>, performedBy: string = 'Admin'): void {
    const list = this.getPaymentPartners();
    const p = list.find(x => x.id === id);
    if (p) {
      Object.assign(p, updates);
      this.saveToStorage(this.data);
      this.logActivity('System', `Updated Payment Partner (${p.name})`, performedBy);
    }
  }
}

export const dbService = new CRMDatabaseService();
