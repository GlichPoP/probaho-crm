export interface CountryConfig {
  code: string;           // ISO 3166-1 alpha-2 (e.g. 'US', 'BD', 'IN')
  name: string;           // Country name in English
  flag: string;           // Flag emoji (e.g. '🇺🇸', '🇧🇩')
  currencyCode: string;   // ISO 4217 currency code (e.g. 'USD', 'BDT')
  currencySymbol: string; // Currency symbol (e.g. '$', '৳', '₹', '€', '£')
  currencyFormatted: string; // Display label (e.g. 'USD ($)', 'BDT (৳)')
  phoneCode: string;      // International calling prefix (e.g. '+1', '+880')
  taxTitle: string;       // Default tax system title (e.g. 'Sales Tax / EIN', 'BIN / VAT')
  regionLabel: string;    // Subnational division label (e.g. 'State', 'District', 'Province')
  defaultLanguage: string;// Default language code (e.g. 'en', 'bn', 'hi')
}

export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  formatted: string;
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  dir?: 'ltr' | 'rtl';
}

// Top-level comprehensive country directory
export const COUNTRIES: CountryConfig[] = [
  // North America
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currencyCode: 'USD',
    currencySymbol: '$',
    currencyFormatted: 'USD ($)',
    phoneCode: '+1',
    taxTitle: 'Sales Tax / EIN',
    regionLabel: 'State',
    defaultLanguage: 'en'
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currencyCode: 'CAD',
    currencySymbol: 'C$',
    currencyFormatted: 'CAD (C$)',
    phoneCode: '+1',
    taxTitle: 'GST / HST / BN',
    regionLabel: 'Province',
    defaultLanguage: 'en'
  },
  {
    code: 'MX',
    name: 'Mexico',
    flag: '🇲🇽',
    currencyCode: 'MXN',
    currencySymbol: '$',
    currencyFormatted: 'MXN ($)',
    phoneCode: '+52',
    taxTitle: 'RFC / IVA',
    regionLabel: 'State',
    defaultLanguage: 'es'
  },

  // South Asia
  {
    code: 'BD',
    name: 'Bangladesh',
    flag: '🇧🇩',
    currencyCode: 'BDT',
    currencySymbol: '৳',
    currencyFormatted: 'BDT (৳)',
    phoneCode: '+880',
    taxTitle: 'BIN / VAT Registration',
    regionLabel: 'District',
    defaultLanguage: 'bn'
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currencyCode: 'INR',
    currencySymbol: '₹',
    currencyFormatted: 'INR (₹)',
    phoneCode: '+91',
    taxTitle: 'GST / GSTIN',
    regionLabel: 'State',
    defaultLanguage: 'hi'
  },
  {
    code: 'PK',
    name: 'Pakistan',
    flag: '🇵🇰',
    currencyCode: 'PKR',
    currencySymbol: '₨',
    currencyFormatted: 'PKR (₨)',
    phoneCode: '+92',
    taxTitle: 'NTN / STRN',
    regionLabel: 'Province',
    defaultLanguage: 'ur'
  },
  {
    code: 'LK',
    name: 'Sri Lanka',
    flag: '🇱🇰',
    currencyCode: 'LKR',
    currencySymbol: 'Rs',
    currencyFormatted: 'LKR (Rs)',
    phoneCode: '+94',
    taxTitle: 'TIN / VAT',
    regionLabel: 'District',
    defaultLanguage: 'en'
  },
  {
    code: 'NP',
    name: 'Nepal',
    flag: '🇳🇵',
    currencyCode: 'NPR',
    currencySymbol: 'Rs',
    currencyFormatted: 'NPR (Rs)',
    phoneCode: '+977',
    taxTitle: 'PAN / VAT',
    regionLabel: 'District',
    defaultLanguage: 'en'
  },

  // Europe & UK
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currencyCode: 'GBP',
    currencySymbol: '£',
    currencyFormatted: 'GBP (£)',
    phoneCode: '+44',
    taxTitle: 'VAT Registration No.',
    regionLabel: 'County / Region',
    defaultLanguage: 'en'
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    currencyCode: 'EUR',
    currencySymbol: '€',
    currencyFormatted: 'EUR (€)',
    phoneCode: '+49',
    taxTitle: 'USt-IdNr. / Steuernummer',
    regionLabel: 'State / Bundesland',
    defaultLanguage: 'de'
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    currencyCode: 'EUR',
    currencySymbol: '€',
    currencyFormatted: 'EUR (€)',
    phoneCode: '+33',
    taxTitle: 'N° TVA / SIRET',
    regionLabel: 'Region',
    defaultLanguage: 'fr'
  },
  {
    code: 'IT',
    name: 'Italy',
    flag: '🇮🇹',
    currencyCode: 'EUR',
    currencySymbol: '€',
    currencyFormatted: 'EUR (€)',
    phoneCode: '+39',
    taxTitle: 'Partita IVA (P.IVA)',
    regionLabel: 'Province',
    defaultLanguage: 'en'
  },
  {
    code: 'ES',
    name: 'Spain',
    flag: '🇪🇸',
    currencyCode: 'EUR',
    currencySymbol: '€',
    currencyFormatted: 'EUR (€)',
    phoneCode: '+34',
    taxTitle: 'CIF / NIF / IVA',
    regionLabel: 'Province',
    defaultLanguage: 'es'
  },
  {
    code: 'NL',
    name: 'Netherlands',
    flag: '🇳🇱',
    currencyCode: 'EUR',
    currencySymbol: '€',
    currencyFormatted: 'EUR (€)',
    phoneCode: '+31',
    taxTitle: 'BTW-identificatienummer',
    regionLabel: 'Province',
    defaultLanguage: 'en'
  },
  {
    code: 'CH',
    name: 'Switzerland',
    flag: '🇨🇭',
    currencyCode: 'CHF',
    currencySymbol: 'CHF',
    currencyFormatted: 'CHF (CHF)',
    phoneCode: '+41',
    taxTitle: 'UID / MWST',
    regionLabel: 'Canton',
    defaultLanguage: 'de'
  },
  {
    code: 'BE',
    name: 'Belgium',
    flag: '🇧🇪',
    currencyCode: 'EUR',
    currencySymbol: '€',
    currencyFormatted: 'EUR (€)',
    phoneCode: '+32',
    taxTitle: 'TVA / BTW',
    regionLabel: 'Province',
    defaultLanguage: 'fr'
  },
  {
    code: 'SE',
    name: 'Sweden',
    flag: '🇸🇪',
    currencyCode: 'SEK',
    currencySymbol: 'kr',
    currencyFormatted: 'SEK (kr)',
    phoneCode: '+46',
    taxTitle: 'Momsregistreringsnummer',
    regionLabel: 'County',
    defaultLanguage: 'en'
  },
  {
    code: 'NO',
    name: 'Norway',
    flag: '🇳🇴',
    currencyCode: 'NOK',
    currencySymbol: 'kr',
    currencyFormatted: 'NOK (kr)',
    phoneCode: '+47',
    taxTitle: 'MVA-nummer',
    regionLabel: 'County',
    defaultLanguage: 'en'
  },
  {
    code: 'DK',
    name: 'Denmark',
    flag: '🇩🇰',
    currencyCode: 'DKK',
    currencySymbol: 'kr',
    currencyFormatted: 'DKK (kr)',
    phoneCode: '+45',
    taxTitle: 'CVR / Moms',
    regionLabel: 'Region',
    defaultLanguage: 'en'
  },
  {
    code: 'PL',
    name: 'Poland',
    flag: '🇵🇱',
    currencyCode: 'PLN',
    currencySymbol: 'zł',
    currencyFormatted: 'PLN (zł)',
    phoneCode: '+48',
    taxTitle: 'NIP / VAT-UE',
    regionLabel: 'Voivodeship',
    defaultLanguage: 'en'
  },
  {
    code: 'IE',
    name: 'Ireland',
    flag: '🇮🇪',
    currencyCode: 'EUR',
    currencySymbol: '€',
    currencyFormatted: 'EUR (€)',
    phoneCode: '+353',
    taxTitle: 'VAT Number',
    regionLabel: 'County',
    defaultLanguage: 'en'
  },
  {
    code: 'PT',
    name: 'Portugal',
    flag: '🇵🇹',
    currencyCode: 'EUR',
    currencySymbol: '€',
    currencyFormatted: 'EUR (€)',
    phoneCode: '+351',
    taxTitle: 'NIF / NIPC',
    regionLabel: 'District',
    defaultLanguage: 'pt'
  },
  {
    code: 'TR',
    name: 'Turkey',
    flag: '🇹🇷',
    currencyCode: 'TRY',
    currencySymbol: '₺',
    currencyFormatted: 'TRY (₺)',
    phoneCode: '+90',
    taxTitle: 'VKN / KDV No.',
    regionLabel: 'Province',
    defaultLanguage: 'tr'
  },
  {
    code: 'RU',
    name: 'Russia',
    flag: '🇷🇺',
    currencyCode: 'RUB',
    currencySymbol: '₽',
    currencyFormatted: 'RUB (₽)',
    phoneCode: '+7',
    taxTitle: 'INN / KPP',
    regionLabel: 'Region / Oblast',
    defaultLanguage: 'ru'
  },

  // Middle East
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    currencyCode: 'AED',
    currencySymbol: 'AED',
    currencyFormatted: 'AED (AED)',
    phoneCode: '+971',
    taxTitle: 'Tax Registration No. (TRN)',
    regionLabel: 'Emirate',
    defaultLanguage: 'ar'
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    flag: '🇸🇦',
    currencyCode: 'SAR',
    currencySymbol: 'SAR',
    currencyFormatted: 'SAR (SAR)',
    phoneCode: '+966',
    taxTitle: 'ZATCA / VAT No.',
    regionLabel: 'Province',
    defaultLanguage: 'ar'
  },
  {
    code: 'QA',
    name: 'Qatar',
    flag: '🇶🇦',
    currencyCode: 'QAR',
    currencySymbol: 'QR',
    currencyFormatted: 'QAR (QR)',
    phoneCode: '+974',
    taxTitle: 'TIN / Commercial Reg.',
    regionLabel: 'Municipality',
    defaultLanguage: 'ar'
  },
  {
    code: 'KW',
    name: 'Kuwait',
    flag: '🇰🇼',
    currencyCode: 'KWD',
    currencySymbol: 'KD',
    currencyFormatted: 'KWD (KD)',
    phoneCode: '+965',
    taxTitle: 'Civil ID / Reg. No.',
    regionLabel: 'Governorate',
    defaultLanguage: 'ar'
  },
  {
    code: 'OM',
    name: 'Oman',
    flag: '🇴🇲',
    currencyCode: 'OMR',
    currencySymbol: 'OMR',
    currencyFormatted: 'OMR (OMR)',
    phoneCode: '+968',
    taxTitle: 'VAT TIN',
    regionLabel: 'Governorate',
    defaultLanguage: 'ar'
  },
  {
    code: 'BH',
    name: 'Bahrain',
    flag: '🇧🇭',
    currencyCode: 'BHD',
    currencySymbol: 'BD',
    currencyFormatted: 'BHD (BD)',
    phoneCode: '+973',
    taxTitle: 'NBR / VAT Account',
    regionLabel: 'Governorate',
    defaultLanguage: 'ar'
  },
  {
    code: 'EG',
    name: 'Egypt',
    flag: '🇪🇬',
    currencyCode: 'EGP',
    currencySymbol: 'E£',
    currencyFormatted: 'EGP (E£)',
    phoneCode: '+20',
    taxTitle: 'Tax Card / VAT Reg.',
    regionLabel: 'Governorate',
    defaultLanguage: 'ar'
  },

  // East Asia & Pacific
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    currencyCode: 'SGD',
    currencySymbol: 'S$',
    currencyFormatted: 'SGD (S$)',
    phoneCode: '+65',
    taxTitle: 'GST Registration / UEN',
    regionLabel: 'District',
    defaultLanguage: 'en'
  },
  {
    code: 'MY',
    name: 'Malaysia',
    flag: '🇲🇾',
    currencyCode: 'MYR',
    currencySymbol: 'RM',
    currencyFormatted: 'MYR (RM)',
    phoneCode: '+60',
    taxTitle: 'SST / BRN',
    regionLabel: 'State',
    defaultLanguage: 'en'
  },
  {
    code: 'ID',
    name: 'Indonesia',
    flag: '🇮🇩',
    currencyCode: 'IDR',
    currencySymbol: 'Rp',
    currencyFormatted: 'IDR (Rp)',
    phoneCode: '+62',
    taxTitle: 'NPWP / PPN',
    regionLabel: 'Province',
    defaultLanguage: 'id'
  },
  {
    code: 'TH',
    name: 'Thailand',
    flag: '🇹🇭',
    currencyCode: 'THB',
    currencySymbol: '฿',
    currencyFormatted: 'THB (฿)',
    phoneCode: '+66',
    taxTitle: 'Tax ID / VAT',
    regionLabel: 'Province',
    defaultLanguage: 'en'
  },
  {
    code: 'VN',
    name: 'Vietnam',
    flag: '🇻🇳',
    currencyCode: 'VND',
    currencySymbol: '₫',
    currencyFormatted: 'VND (₫)',
    phoneCode: '+84',
    taxTitle: 'Mã số thuế (MST)',
    regionLabel: 'Province / City',
    defaultLanguage: 'en'
  },
  {
    code: 'PH',
    name: 'Philippines',
    flag: '🇵🇭',
    currencyCode: 'PHP',
    currencySymbol: '₱',
    currencyFormatted: 'PHP (₱)',
    phoneCode: '+63',
    taxTitle: 'BIR / TIN',
    regionLabel: 'Province',
    defaultLanguage: 'en'
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    currencyCode: 'JPY',
    currencySymbol: '¥',
    currencyFormatted: 'JPY (¥)',
    phoneCode: '+81',
    taxTitle: 'Corporate Number (法人番号)',
    regionLabel: 'Prefecture',
    defaultLanguage: 'ja'
  },
  {
    code: 'KR',
    name: 'South Korea',
    flag: '🇰🇷',
    currencyCode: 'KRW',
    currencySymbol: '₩',
    currencyFormatted: 'KRW (₩)',
    phoneCode: '+82',
    taxTitle: 'Business Reg. No. (사업자등록번호)',
    regionLabel: 'Province',
    defaultLanguage: 'en'
  },
  {
    code: 'CN',
    name: 'China',
    flag: '🇨🇳',
    currencyCode: 'CNY',
    currencySymbol: '¥',
    currencyFormatted: 'CNY (¥)',
    phoneCode: '+86',
    taxTitle: 'Unified Social Credit Code (USCC)',
    regionLabel: 'Province',
    defaultLanguage: 'zh'
  },
  {
    code: 'HK',
    name: 'Hong Kong',
    flag: '🇭🇰',
    currencyCode: 'HKD',
    currencySymbol: 'HK$',
    currencyFormatted: 'HKD (HK$)',
    phoneCode: '+852',
    taxTitle: 'BRN (Business Reg. No.)',
    regionLabel: 'District',
    defaultLanguage: 'zh'
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    currencyCode: 'AUD',
    currencySymbol: 'A$',
    currencyFormatted: 'AUD (A$)',
    phoneCode: '+61',
    taxTitle: 'ABN / GST',
    regionLabel: 'State / Territory',
    defaultLanguage: 'en'
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    flag: '🇳🇿',
    currencyCode: 'NZD',
    currencySymbol: 'NZ$',
    currencyFormatted: 'NZD (NZ$)',
    phoneCode: '+64',
    taxTitle: 'GST / NZBN',
    regionLabel: 'Region',
    defaultLanguage: 'en'
  },

  // South America
  {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    currencyCode: 'BRL',
    currencySymbol: 'R$',
    currencyFormatted: 'BRL (R$)',
    phoneCode: '+55',
    taxTitle: 'CNPJ / CPF',
    regionLabel: 'State',
    defaultLanguage: 'pt'
  },
  {
    code: 'AR',
    name: 'Argentina',
    flag: '🇦🇷',
    currencyCode: 'ARS',
    currencySymbol: '$',
    currencyFormatted: 'ARS ($)',
    phoneCode: '+54',
    taxTitle: 'CUIT / IVA',
    regionLabel: 'Province',
    defaultLanguage: 'es'
  },
  {
    code: 'CL',
    name: 'Chile',
    flag: '🇨🇱',
    currencyCode: 'CLP',
    currencySymbol: '$',
    currencyFormatted: 'CLP ($)',
    phoneCode: '+56',
    taxTitle: 'RUT / IVA',
    regionLabel: 'Region',
    defaultLanguage: 'es'
  },
  {
    code: 'CO',
    name: 'Colombia',
    flag: '🇨🇴',
    currencyCode: 'COP',
    currencySymbol: '$',
    currencyFormatted: 'COP ($)',
    phoneCode: '+57',
    taxTitle: 'NIT / RUT',
    regionLabel: 'Department',
    defaultLanguage: 'es'
  },

  // Africa
  {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    currencyCode: 'ZAR',
    currencySymbol: 'R',
    currencyFormatted: 'ZAR (R)',
    phoneCode: '+27',
    taxTitle: 'VAT / CIPC Registration',
    regionLabel: 'Province',
    defaultLanguage: 'en'
  },
  {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    currencyCode: 'NGN',
    currencySymbol: '₦',
    currencyFormatted: 'NGN (₦)',
    phoneCode: '+234',
    taxTitle: 'TIN / CAC No.',
    regionLabel: 'State',
    defaultLanguage: 'en'
  },
  {
    code: 'KE',
    name: 'Kenya',
    flag: '🇰🇪',
    currencyCode: 'KES',
    currencySymbol: 'KSh',
    currencyFormatted: 'KES (KSh)',
    phoneCode: '+254',
    taxTitle: 'KRA PIN / VAT',
    regionLabel: 'County',
    defaultLanguage: 'en'
  },
  {
    code: 'GH',
    name: 'Ghana',
    flag: '🇬🇭',
    currencyCode: 'GHS',
    currencySymbol: 'GH₵',
    currencyFormatted: 'GHS (GH₵)',
    phoneCode: '+233',
    taxTitle: 'TIN / GRA Reg.',
    regionLabel: 'Region',
    defaultLanguage: 'en'
  }
];

// Comprehensive list of operating currencies
export const CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', formatted: 'USD ($)' },
  { code: 'EUR', name: 'Euro', symbol: '€', formatted: 'EUR (€)' },
  { code: 'GBP', name: 'British Pound', symbol: '£', formatted: 'GBP (£)' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', formatted: 'BDT (৳)' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', formatted: 'INR (₹)' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', formatted: 'AED (AED)' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', formatted: 'SAR (SAR)' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', formatted: 'CAD (C$)' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', formatted: 'AUD (A$)' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', formatted: 'SGD (S$)' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', formatted: 'MYR (RM)' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', formatted: 'IDR (Rp)' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', formatted: 'JPY (¥)' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', formatted: 'CNY (¥)' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', formatted: 'CHF (CHF)' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', formatted: 'PKR (₨)' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', formatted: 'TRY (₺)' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', formatted: 'BRL (R$)' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', formatted: 'MXN ($)' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', formatted: 'ZAR (R)' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR', formatted: 'QAR (QR)' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', formatted: 'KWD (KD)' }
];

// Supported system languages
export const LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English (US)', flag: '🇺🇸', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা (Bengali)', flag: '🇧🇩', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी (Hindi)', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية (Arabic)', flag: '🇸🇦', dir: 'rtl' },
  { code: 'es', name: 'Spanish', nativeName: 'Español (Spanish)', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français (French)', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch (German)', flag: '🇩🇪', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文 (Simplified)', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語 (Japanese)', flag: '🇯🇵', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português (Portuguese)', flag: '🇧🇷', dir: 'ltr' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe (Turkish)', flag: '🇹🇷', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو (Urdu)', flag: '🇵🇰', dir: 'rtl' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский (Russian)', flag: '🇷🇺', dir: 'ltr' }
];

// Helper to look up country by ISO code or fallback to US
export function getCountryByCode(code?: string): CountryConfig {
  if (!code) return COUNTRIES[0]; // US
  const found = COUNTRIES.find(c => c.code.toUpperCase() === code.toUpperCase() || c.name.toLowerCase() === code.toLowerCase());
  return found || COUNTRIES[0];
}

// Helper to look up currency symbol from currency string e.g. "USD ($)" -> "$"
export function extractCurrencySymbol(currencyStr?: string): string {
  if (!currencyStr) return '$';
  const match = currencyStr.match(/\((.*?)\)/);
  if (match && match[1]) return match[1];
  const cur = CURRENCIES.find(c => c.code === currencyStr || c.formatted === currencyStr);
  return cur ? cur.symbol : (currencyStr.trim() || '$');
}
