// Centralized Context-Adaptive Regional Presets Engine
// Delivers first-class native workflows for Bangladesh (64 districts, Pathao/Steadfast, bKash/Nagad)
// and seamless localization for international users (US, UK, India, UAE, Canada, Australia, etc.)

export interface DeliveryChargePreset {
  label: string;
  amount: number;
  isDefault?: boolean;
}

export interface RegionalCourierPreset {
  name: string;
  type: string;
  baseRateLocal: number;
  baseRateNational: number;
  contactPhone?: string;
  isDefault?: boolean;
}

export interface RegionalPaymentPreset {
  name: string;
  channelType: string;
  accountExample: string;
  settlementCharge: string;
}

// Complete 64 Districts of Bangladesh arranged alphabetically for fast search and complete accuracy
export const BANGLADESH_64_DISTRICTS: string[] = [
  'Bagerhat',
  'Bandarban',
  'Barguna',
  'Barishal',
  'Bhola',
  'Bogra (Bogura)',
  'Brahmanbaria',
  'Chandpur',
  'Chapainawabganj',
  'Chattogram (Chittagong)',
  'Chuadanga',
  'Cox\'s Bazar',
  'Cumilla (Comilla)',
  'Dhaka',
  'Dinajpur',
  'Faridpur',
  'Feni',
  'Gaibandha',
  'Gazipur',
  'Gopalganj',
  'Habiganj',
  'Jamalpur',
  'Jashore (Jessore)',
  'Jhalokati',
  'Jhenaidah',
  'Joypurhat',
  'Khagrachhari',
  'Khulna',
  'Kishoreganj',
  'Kurigram',
  'Kushtia',
  'Lakshmipur',
  'Lalmonirhat',
  'Madaripur',
  'Magura',
  'Manikganj',
  'Meherpur',
  'Moulvibazar',
  'Munshiganj',
  'Mymensingh',
  'Naogaon',
  'Narail',
  'Narayanganj',
  'Narsingdi',
  'Natore',
  'Netrokona',
  'Nilphamari',
  'Noakhali',
  'Pabna',
  'Panchagarh',
  'Patuakhali',
  'Pirojpur',
  'Rajbari',
  'Rajshahi',
  'Rangamati',
  'Rangpur',
  'Satkhira',
  'Shariatpur',
  'Sherpur',
  'Sirajganj',
  'Sunamganj',
  'Sylhet',
  'Tangail',
  'Thakurgaon'
];

export const US_STATES: string[] = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming'
];

export const INDIA_STATES: string[] = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi (NCR)', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export const UK_REGIONS: string[] = [
  'Greater London', 'South East England', 'North West England', 'West Midlands', 'Yorkshire and the Humber',
  'South West England', 'East of England', 'East Midlands', 'North East England', 'Scotland', 'Wales', 'Northern Ireland'
];

export const UAE_EMIRATES: string[] = [
  'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'
];

export const CANADA_PROVINCES: string[] = [
  'Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan',
  'Nova Scotia', 'New Brunswick', 'Newfoundland and Labrador', 'Prince Edward Island'
];

export const AUSTRALIA_STATES: string[] = [
  'New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia',
  'Tasmania', 'Australian Capital Territory', 'Northern Territory'
];

/**
 * Returns available subnational divisions (districts/states/provinces) for the country.
 */
export function getRegionalDistricts(countryCode: string = 'BD'): string[] {
  const code = (countryCode || 'BD').toUpperCase();
  switch (code) {
    case 'BD':
      return BANGLADESH_64_DISTRICTS;
    case 'US':
      return US_STATES;
    case 'IN':
      return INDIA_STATES;
    case 'GB':
      return UK_REGIONS;
    case 'AE':
      return UAE_EMIRATES;
    case 'CA':
      return CANADA_PROVINCES;
    case 'AU':
      return AUSTRALIA_STATES;
    default:
      return [
        'Central / Metro District',
        'North District',
        'South District',
        'East District',
        'West District',
        'Regional Outskirts',
        'National Delivery Zone'
      ];
  }
}

/**
 * Returns regional delivery charge presets and buttons.
 */
export function getRegionalDeliveryPresets(countryCode: string = 'BD'): DeliveryChargePreset[] {
  const code = (countryCode || 'BD').toUpperCase();
  switch (code) {
    case 'BD':
      return [
        { label: 'Inside Dhaka', amount: 70, isDefault: true },
        { label: 'Sub-Dhaka / Suburban', amount: 100 },
        { label: 'Outside Dhaka', amount: 130 },
        { label: 'Free Shipping', amount: 0 }
      ];
    case 'US':
      return [
        { label: 'Standard Ground', amount: 7, isDefault: true },
        { label: 'Regional Priority', amount: 12 },
        { label: 'Express 2-Day', amount: 22 },
        { label: 'Free Delivery', amount: 0 }
      ];
    case 'IN':
      return [
        { label: 'Local City', amount: 50, isDefault: true },
        { label: 'State / Regional', amount: 80 },
        { label: 'National Express', amount: 130 },
        { label: 'Free Delivery', amount: 0 }
      ];
    case 'GB':
      return [
        { label: 'Standard Tracked', amount: 4, isDefault: true },
        { label: 'Next Day Express', amount: 8 },
        { label: 'Saturday Special', amount: 12 },
        { label: 'Free Delivery', amount: 0 }
      ];
    case 'AE':
      return [
        { label: 'Same City Express', amount: 15, isDefault: true },
        { label: 'Inter-Emirate', amount: 25 },
        { label: 'Remote Area Delivery', amount: 40 },
        { label: 'Free Delivery', amount: 0 }
      ];
    case 'CA':
      return [
        { label: 'Local Courier', amount: 8, isDefault: true },
        { label: 'Inter-Provincial', amount: 15 },
        { label: 'Express Air', amount: 25 },
        { label: 'Free Delivery', amount: 0 }
      ];
    case 'AU':
      return [
        { label: 'Metro Delivery', amount: 9, isDefault: true },
        { label: 'Interstate', amount: 16 },
        { label: 'Express Post', amount: 24 },
        { label: 'Free Delivery', amount: 0 }
      ];
    default:
      return [
        { label: 'Standard Local', amount: 6, isDefault: true },
        { label: 'National Zone', amount: 14 },
        { label: 'Express Priority', amount: 20 },
        { label: 'Free Delivery', amount: 0 }
      ];
  }
}

/**
 * Returns default couriers for the region with local & national base rates.
 */
export function getRegionalCouriers(countryCode: string = 'BD'): RegionalCourierPreset[] {
  const code = (countryCode || 'BD').toUpperCase();
  switch (code) {
    case 'BD':
      return [
        { name: 'Pathao Courier', type: 'API Integrated COD Courier', baseRateLocal: 70, baseRateNational: 130, contactPhone: '09610-003030', isDefault: true },
        { name: 'Steadfast Courier', type: 'API Integrated COD Courier', baseRateLocal: 70, baseRateNational: 130, contactPhone: '09678-045045' },
        { name: 'RedX Logistics', type: 'API Integrated COD Courier', baseRateLocal: 70, baseRateNational: 130, contactPhone: '09612-223344' },
        { name: 'Paperfly Delivery', type: 'Doorstep Courier Partner', baseRateLocal: 70, baseRateNational: 120, contactPhone: '09666-774433' },
        { name: 'eCourier', type: 'API Integrated COD Courier', baseRateLocal: 80, baseRateNational: 140, contactPhone: '09612-500500' },
        { name: 'Sundarban Courier', type: 'Parcel & Hub Pickup', baseRateLocal: 60, baseRateNational: 120, contactPhone: '02-9562725' },
        { name: 'In-House Rider Express', type: 'In-House Rider', baseRateLocal: 60, baseRateNational: 0 }
      ];
    case 'US':
      return [
        { name: 'FedEx Ground', type: 'Commercial Courier', baseRateLocal: 8, baseRateNational: 18, contactPhone: '1-800-463-3339', isDefault: true },
        { name: 'UPS', type: 'Commercial Parcel Service', baseRateLocal: 9, baseRateNational: 19, contactPhone: '1-800-742-5877' },
        { name: 'USPS Priority Mail', type: 'National Postal Service', baseRateLocal: 7, baseRateNational: 14, contactPhone: '1-800-275-8777' },
        { name: 'DHL Express', type: 'Express & International', baseRateLocal: 15, baseRateNational: 30, contactPhone: '1-800-225-5345' },
        { name: 'Local Same-Day Courier', type: 'In-House Rider', baseRateLocal: 12, baseRateNational: 0 }
      ];
    case 'IN':
      return [
        { name: 'Delhivery', type: 'API Integrated COD Courier', baseRateLocal: 50, baseRateNational: 100, contactPhone: '0124-6719500', isDefault: true },
        { name: 'Blue Dart Express', type: 'Express Air Logistics', baseRateLocal: 80, baseRateNational: 150, contactPhone: '1860-233-1234' },
        { name: 'DTDC Express', type: 'Domestic Courier Partner', baseRateLocal: 60, baseRateNational: 110, contactPhone: '080-25365032' },
        { name: 'Shadowfax', type: 'Hyperlocal & COD Delivery', baseRateLocal: 50, baseRateNational: 90 },
        { name: 'India Post (Speed Post)', type: 'National Postal Service', baseRateLocal: 40, baseRateNational: 80 }
      ];
    case 'GB':
      return [
        { name: 'Royal Mail Tracked', type: 'National Postal Service', baseRateLocal: 4, baseRateNational: 8, contactPhone: '03457-740740', isDefault: true },
        { name: 'DPD UK', type: 'Express Courier', baseRateLocal: 6, baseRateNational: 11, contactPhone: '0121-275-0500' },
        { name: 'Evri (Hermes)', type: 'Standard Parcel Delivery', baseRateLocal: 3.5, baseRateNational: 6.5 },
        { name: 'DHL Express UK', type: 'Express & Air Logistics', baseRateLocal: 9, baseRateNational: 18 }
      ];
    case 'AE':
      return [
        { name: 'Aramex Domestic', type: 'API Integrated COD Courier', baseRateLocal: 18, baseRateNational: 28, contactPhone: '600-544000', isDefault: true },
        { name: 'Careem Box / Rider', type: 'On-Demand Hyperlocal', baseRateLocal: 20, baseRateNational: 35 },
        { name: 'Fetchr / Shyft', type: 'COD Logistics Partner', baseRateLocal: 16, baseRateNational: 25 },
        { name: 'Emirates Post', type: 'National Postal Service', baseRateLocal: 12, baseRateNational: 20 }
      ];
    default:
      return [
        { name: 'Standard Tracked Courier', type: 'Standard Parcel Delivery', baseRateLocal: 6, baseRateNational: 14, isDefault: true },
        { name: 'Express Logistics Partner', type: 'API Integrated Courier', baseRateLocal: 12, baseRateNational: 24 },
        { name: 'In-House Same-Day Delivery', type: 'In-House Rider', baseRateLocal: 8, baseRateNational: 0 }
      ];
  }
}

/**
 * Returns available payment methods for the active region.
 */
export function getRegionalPaymentMethods(countryCode: string = 'BD'): string[] {
  const code = (countryCode || 'BD').toUpperCase();
  switch (code) {
    case 'BD':
      return [
        'Cash on Delivery (COD)',
        'bKash',
        'Nagad',
        'Rocket',
        'Upay',
        'Bank Transfer',
        'Card / Online Gateway'
      ];
    case 'US':
      return [
        'Credit / Debit Card (Stripe)',
        'Bank Wire / ACH Transfer',
        'PayPal',
        'Apple Pay / Google Pay',
        'Cash on Delivery (COD)'
      ];
    case 'IN':
      return [
        'UPI (GPay / PhonePe / Paytm)',
        'Net Banking (IMPS / NEFT)',
        'Credit / Debit Card (Razorpay)',
        'Cash on Delivery (COD)'
      ];
    case 'GB':
      return [
        'Credit / Debit Card (Stripe)',
        'BACS / Bank Transfer',
        'PayPal',
        'Apple Pay',
        'Cash on Delivery (COD)'
      ];
    case 'AE':
      return [
        'Credit / Debit Card',
        'Apple Pay / Tabby',
        'UAE Bank Transfer',
        'Cash on Delivery (COD)'
      ];
    default:
      return [
        'Credit / Debit Card',
        'Bank Transfer',
        'Digital Wallet (PayPal)',
        'Cash on Delivery (COD)'
      ];
  }
}

/**
 * Returns phone number placeholder and format hint.
 */
export function getRegionalPhoneConfig(countryCode: string = 'BD'): { placeholder: string; example: string; label: string } {
  const code = (countryCode || 'BD').toUpperCase();
  switch (code) {
    case 'BD':
      return {
        placeholder: '017XXXXXXXX',
        example: '01712-345678',
        label: 'Mobile Number (e.g. 017.., 018.., 019..)'
      };
    case 'US':
      return {
        placeholder: '(555) 000-0000',
        example: '(555) 234-5678',
        label: 'Phone Number (US / Canada format)'
      };
    case 'IN':
      return {
        placeholder: '98765 43210',
        example: '98765 43210',
        label: 'Mobile Number (10 digits)'
      };
    case 'GB':
      return {
        placeholder: '07123 456789',
        example: '07123 456789',
        label: 'UK Contact Number'
      };
    case 'AE':
      return {
        placeholder: '050 123 4567',
        example: '050 123 4567',
        label: 'UAE Mobile Number'
      };
    default:
      return {
        placeholder: 'Contact Phone Number',
        example: '+1 555-0199',
        label: 'Phone Number'
      };
  }
}

/**
 * Returns payment partner preset templates for configuring PartnersView.
 */
export function getRegionalPaymentPartnerTemplates(countryCode: string = 'BD'): RegionalPaymentPreset[] {
  const code = (countryCode || 'BD').toUpperCase();
  switch (code) {
    case 'BD':
      return [
        { name: 'bKash Merchant Account', channelType: 'Mobile Financial Service (MFS)', accountExample: '01711-987654 (Merchant)', settlementCharge: '1.2% Merchant Fee' },
        { name: 'Nagad Corporate MFS', channelType: 'Mobile Financial Service (MFS)', accountExample: '01811-987654 (Disbursement)', settlementCharge: '1.0% Fee' },
        { name: 'Rocket (DBBL Banking)', channelType: 'Mobile Financial Service (MFS)', accountExample: '01911-987654-7', settlementCharge: '0.9% Fee' },
        { name: 'City Bank / BRAC Bank Account', channelType: 'Corporate Bank Account', accountExample: 'A/C 3101-998877-001', settlementCharge: '0% Bank Transfer' },
        { name: 'SSLCommerz Gateway', channelType: 'Payment Gateway', accountExample: 'Merchant ID: PROBAHO_LIVE', settlementCharge: '2.5% + ৳5 Gateway Fee' },
        { name: 'Physical Cash Counter / COD Hub', channelType: 'Physical Cash / COD Hub', accountExample: 'Vault Register 01', settlementCharge: '0% Cash' }
      ];
    case 'US':
      return [
        { name: 'Stripe Card Processing', channelType: 'Online Payment Gateway', accountExample: 'acct_1HxyzLiveAccount', settlementCharge: '2.9% + $0.30' },
        { name: 'Chase Commercial Account', channelType: 'Corporate Bank Account', accountExample: 'Checking: 987654321 / Wire Routing', settlementCharge: '$15 Wire / 0% ACH' },
        { name: 'PayPal Business Merchant', channelType: 'Online Digital Wallet', accountExample: 'payments@company.com', settlementCharge: '3.49% + $0.49' },
        { name: 'Physical Store Register (Cash/COD)', channelType: 'Physical Cash / COD Hub', accountExample: 'Register POS #1', settlementCharge: '0% Cash' }
      ];
    case 'IN':
      return [
        { name: 'Razorpay UPI & Cards', channelType: 'Payment Gateway', accountExample: 'rzp_live_key998234', settlementCharge: '2.0% Processing Fee' },
        { name: 'Corporate Current Account (HDFC/ICICI)', channelType: 'Corporate Bank Account', accountExample: 'A/C 50200012345678, IFSC HDFC000123', settlementCharge: '0% IMPS/NEFT' },
        { name: 'Business PhonePe / Google Pay QR', channelType: 'Mobile UPI Wallet', accountExample: 'company@hdfcbank UPI ID', settlementCharge: '0% UPI Merchant' },
        { name: 'Cash on Delivery (Courier COD Remittance)', channelType: 'Physical Cash / COD Hub', accountExample: 'COD Settled via Courier', settlementCharge: '1.5% Courier COD Fee' }
      ];
    default:
      return [
        { name: 'Stripe / International Cards', channelType: 'Payment Gateway', accountExample: 'Live Merchant ID', settlementCharge: '2.9% Processing Fee' },
        { name: 'Corporate Bank Account', channelType: 'Corporate Bank Account', accountExample: 'IBAN / Swift / Routing', settlementCharge: '0% Wire Transfer' },
        { name: 'PayPal Business Account', channelType: 'Online Digital Wallet', accountExample: 'finance@company.com', settlementCharge: '3.4% Gateway Fee' },
        { name: 'Cash on Delivery (COD)', channelType: 'Physical Cash / COD Hub', accountExample: 'Cash Register / Rider Handover', settlementCharge: '0% Cash' }
      ];
  }
}
