export type BusinessType = 
  | 'clothing' 
  | 'electronics' 
  | 'footwear' 
  | 'cosmetics' 
  | 'grocery' 
  | 'general';

export type ApparelSize = 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Free Size' | string;

export type ProductCategory = string;

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  size: string;
  color: string;
  stock_quantity: number;
  low_stock_threshold: number;
  cost_price_bdt: number;
  selling_price_bdt: number;
  description?: string;
  warranty?: string;
  brand_model?: string;
  unit?: string;
}

export type CustomerSegment = 'Champions' | 'VIP' | 'Regular' | 'New' | 'At Risk' | 'Blacklisted/RTO Risk';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  district: string;
  segment: CustomerSegment;
  total_spent_bdt: number;
  total_orders: number;
  total_returns: number;
  notes?: string;
  created_at: string;
}

export type SalesChannel = 'Facebook Messenger' | 'Instagram DM' | 'WhatsApp' | 'Website' | 'Showroom';
export type CourierPartner = 'Pathao Courier' | 'RedX' | 'Steadfast' | 'eCourier' | 'Self Delivery';
export type DeliveryStatus = 'Order Placed' | 'Packaging / Processing' | 'Packing/Stitching' | 'Handed to Courier' | 'In Transit' | 'Delivered' | 'Returned/RTO' | 'Exchanged';
export type PaymentStatus = 'Paid' | 'Partial' | 'Unpaid' | 'COD Pending';
export type CODSettlementStatus = 'Settled by Courier' | 'Pending Courier Remittance' | 'N/A';

export interface OrderItem {
  product_id: string;
  sku: string;
  name: string;
  size: ApparelSize;
  color: string;
  quantity: number;
  unit_price_bdt: number;
  total_price_bdt: number;
}

export interface Order {
  id: string;
  invoice_no: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_district: string;
  order_date: string;
  sales_channel: SalesChannel;
  courier_name: CourierPartner;
  tracking_id?: string;
  delivery_status: DeliveryStatus;
  items: OrderItem[];
  subtotal_bdt: number;
  delivery_charge_bdt: number;
  discount_bdt: number;
  total_amount_bdt: number;
  advance_paid_bdt: number;
  payment_status: PaymentStatus;
  cod_settlement_status: CODSettlementStatus;
  notes?: string;
  is_exchange?: boolean;
  original_order_id?: string;
  // Specific Invoice Overrides:
  custom_invoice_title?: string;
  custom_invoice_terms?: string;
  custom_invoice_footer?: string;
  custom_invoice_notes?: string;
  // Audit Trail & Multi-device Attribution:
  created_by?: string;
  last_modified_by?: string;
}

export type PaymentType = 'Customer Payment' | 'Vendor Payout' | 'Courier COD Settlement' | 'Expense' | 'Refund';
export type PaymentMethod = 'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer' | 'Cash' | 'COD Collection';

export interface PaymentLedgerEntry {
  id: string;
  transaction_date: string;
  date?: string;
  type: PaymentType;
  direction?: 'inflow' | 'outflow';
  category: string;
  party_name?: string;
  amount_bdt: number;
  payment_method: PaymentMethod;
  method?: string;
  reference_id?: string;
  trx_id?: string;
  notes?: string;
  description?: string;
}

export type VendorType = 'Fabric Supplier' | 'Stitching/Tailoring Factory' | 'Accessories & Trims' | 'Courier Partner' | 'Digital Marketing Agency' | 'Packaging & Printing Unit' | 'Embroidery Workshop' | 'Other Vendor' | string;

export interface Vendor {
  id: string;
  vendor_name: string;
  name?: string;
  vendor_type: VendorType;
  type?: string;
  phone: string;
  address: string;
  contact_person?: string;
  total_billed_bdt: number;
  total_paid_bdt: number;
  balance_due_bdt: number;
  outstanding_balance_bdt?: number;
}

export type ActivityCategory = 'Order' | 'Inventory' | 'Finance' | 'Customer' | 'System';

export interface ActivityLog {
  id: string;
  timestamp: string;
  category: ActivityCategory;
  description: string;
  performed_by: string;
}

export interface BrandProfile {
  brand_name: string;
  business_type?: BusinessType;
  country?: string;
  language?: string;
  phone: string;
  address: string;
  vat_bin: string;
  tax_title?: string;
  default_courier: string;
  rto_threshold: number;
  currency?: string;
  logo_url?: string;
  email?: string;
  website?: string;
  default_invoice_title?: string;
  default_invoice_terms?: string;
  default_invoice_footer?: string;
  default_invoice_notes?: string;
}

export type UserRole = 'master' | 'employee';

export interface UserAccount {
  id: string;
  name: string;
  email_or_phone: string;
  role: UserRole;
  pin_code?: string;
  allowed_tabs: string[]; // e.g. ['dashboard', 'orders', 'challan', 'inventory', 'customers', 'finance', 'vendors', 'settings', 'staff']
  is_active?: boolean; // Kill switch: false = blocked/revoked
  last_active_at?: string;
  created_by?: string;
  created_at?: string;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  type: 'API Integrated COD Courier' | 'Standard Parcel Delivery' | 'In-House Rider' | 'District Hub' | string;
  base_rate_dhaka?: number;
  base_rate_outside?: number;
  contact_phone?: string;
  is_active: boolean;
  created_at?: string;
}

export interface PaymentPartner {
  id: string;
  name: string;
  channel_type: 'Mobile Financial Service (MFS)' | 'Corporate Bank Account' | 'Payment Gateway' | 'Physical Cash / COD Hub' | string;
  account_number: string;
  settlement_charge?: string;
  is_active: boolean;
  created_at?: string;
}

export interface CRMDataStore {
  is_onboarded?: boolean;
  workspace_id?: string; // Unique Company Code (e.g. URBAN-101)
  last_synced_at?: string;
  products: Product[];
  customers: Customer[];
  orders: Order[];
  payments: PaymentLedgerEntry[];
  vendors: Vendor[];
  activities: ActivityLog[];
  brand_profile?: BrandProfile;
  user_accounts?: UserAccount[];
  delivery_partners?: DeliveryPartner[];
  payment_partners?: PaymentPartner[];
}

export type SyncStatus = 'connected' | 'syncing' | 'offline' | 'error' | 'disconnected';

export interface FirebaseConfig {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
}

export interface CloudWorkspaceInfo {
  workspace_id: string;
  company_name: string;
  created_at: string;
  last_synced_at?: string;
  master_phone?: string;
}

