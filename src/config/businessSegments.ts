import type { BusinessType } from '../types/crm';

export interface BusinessSegmentConfig {
  id: BusinessType;
  title: string;
  subtitle: string;
  badge: string;
  iconName: 'Shirt' | 'Smartphone' | 'Footprints' | 'Sparkles' | 'Apple' | 'Store';
  specLabel: string;
  specPlaceholder: string;
  specOptions: string[];
  colorLabel: string;
  categories: string[];
  vendorCategories: string[];
  secondaryAttribute?: {
    key: 'warranty' | 'unit';
    label: string;
    placeholder: string;
    options: string[];
  };
}

export const CLASSIC_COLORS: { name: string; hex: string; border?: string }[] = [
  { name: 'Black', hex: '#111827' },
  { name: 'White', hex: '#FFFFFF', border: '#D1D5DB' },
  { name: 'Navy Blue', hex: '#1E3A8A' },
  { name: 'Royal Blue', hex: '#2563EB' },
  { name: 'Sky Blue', hex: '#38BDF8' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Maroon', hex: '#831843' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Olive', hex: '#65A30D' },
  { name: 'Charcoal', hex: '#374151' },
  { name: 'Grey', hex: '#9CA3AF' },
  { name: 'Silver', hex: '#E2E8F0', border: '#CBD5E1' },
  { name: 'Gold', hex: '#EAB308' },
  { name: 'Beige', hex: '#F5F5DC', border: '#E2E8F0' },
  { name: 'Brown', hex: '#78350F' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Purple', hex: '#9333EA' },
  { name: 'Yellow', hex: '#FACC15' },
  { name: 'Orange', hex: '#F97316' }
];

export const BUSINESS_SEGMENTS: Record<BusinessType, BusinessSegmentConfig> = {
  clothing: {
    id: 'clothing',
    title: 'Clothing & Fashion',
    subtitle: 'Apparel, fabrics & fashion wear',
    badge: 'Apparel & Wearables',
    iconName: 'Shirt',
    specLabel: 'Size / Fit',
    specPlaceholder: 'e.g. M, L, XL, Free Size, 42, 44',
    specOptions: ['S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size', '38', '40', '42', '44'],
    colorLabel: 'Color / Fabric Shade',
    categories: ['Panjabi', 'Kurti', 'T-Shirt', 'Polo Shirt', 'Formal Shirt', 'Saree', 'Salwar Kameez', 'Pants / Trousers', 'Jackets & Hoodies', 'Accessories'],
    vendorCategories: [
      'Fabric Supplier / Textile Mill',
      'Stitching & Tailoring Workshop',
      'Accessories & Trims Supplier',
      'Embroidery & Printing Unit',
      'Packaging & Box Manufacturer',
      'Courier & Logistics Partner',
      'General Trade Supplier'
    ]
  },
  electronics: {
    id: 'electronics',
    title: 'Electronics & Gadgets',
    subtitle: 'Devices, gadgets & accessories',
    badge: 'Tech & Devices',
    iconName: 'Smartphone',
    specLabel: 'Storage / Specification',
    specPlaceholder: 'e.g. 128GB / 8GB RAM, 65W, Bluetooth 5.3',
    specOptions: ['64GB', '128GB', '256GB', '512GB', '1TB', 'Standard', 'Pro', 'Max'],
    colorLabel: 'Color / Finish',
    categories: ['Smartphones', 'Smartwatches', 'Earbuds / Audio', 'Power Banks & Chargers', 'Cables & Adapters', 'Computer Accessories', 'Smart Home & IoT'],
    vendorCategories: [
      'Hardware & Component Wholesaler',
      'Official Device Importer / Distributor',
      'Warranty & Repair Service Center',
      'Cables & Accessories Supplier',
      'Packaging & Printing Unit',
      'Courier & Logistics Partner',
      'General Tech Supplier'
    ],
    secondaryAttribute: {
      key: 'warranty',
      label: 'Warranty Period',
      placeholder: 'Select Warranty',
      options: ['No Warranty', '7 Days Replacement', '1 Month', '3 Months', '6 Months', '1 Year Official', '2 Years Official', 'Lifetime Warranty']
    }
  },
  footwear: {
    id: 'footwear',
    title: 'Footwear & Leather',
    subtitle: 'Shoes, sandals & leather items',
    badge: 'Shoes & Leather',
    iconName: 'Footprints',
    specLabel: 'Shoe Size (EU/BD)',
    specPlaceholder: 'e.g. 39, 40, 41, 42, 43, 44',
    specOptions: ['38', '39', '40', '41', '42', '43', '44', '45', '46', 'US 7', 'US 8', 'US 9', 'US 10'],
    colorLabel: 'Color / Leather Finish',
    categories: ['Sneakers', 'Formal Shoes', 'Loafers', 'Sandals & Slides', 'Boots', 'Leather Belts', 'Wallets & Bags'],
    vendorCategories: [
      'Leather & Sole Manufacturer',
      'Tannery / Raw Hide Supplier',
      'Shoe Workshop / Assembly Unit',
      'Buckles, Laces & Trims Supplier',
      'Shoebox & Packaging Manufacturer',
      'Courier & Logistics Partner',
      'General Trade Supplier'
    ]
  },
  cosmetics: {
    id: 'cosmetics',
    title: 'Cosmetics & Skincare',
    subtitle: 'Skincare, makeup & personal care',
    badge: 'Beauty & Wellness',
    iconName: 'Sparkles',
    specLabel: 'Net Volume / Weight',
    specPlaceholder: 'e.g. 30ml, 50ml, 100ml, 50g',
    specOptions: ['15ml', '30ml', '50ml', '100ml', '150ml', '200ml', '30g', '50g', '100g'],
    colorLabel: 'Shade / Tone / Variant',
    categories: ['Serums & Toners', 'Moisturizers & Creams', 'Face Wash & Cleansers', 'Sunscreen', 'Lipstick & Lip Care', 'Foundation & Concealer', 'Perfumes & Fragrances', 'Hair Care'],
    vendorCategories: [
      'Skincare & Cosmetic Formulation Lab',
      'Beauty Products Importer / Distributor',
      'Bottle, Jar & Tube Manufacturer',
      'Essential Oils & Fragrance Supplier',
      'Packaging & Printing Unit',
      'Courier & Logistics Partner',
      'General Trade Supplier'
    ]
  },
  grocery: {
    id: 'grocery',
    title: 'Grocery & Organic Food',
    subtitle: 'Food items, dry goods & groceries',
    badge: 'FMCG & Groceries',
    iconName: 'Apple',
    specLabel: 'Pack Weight / Net Volume',
    specPlaceholder: 'e.g. 500g, 1kg, 2kg, 5kg, 1 Liter',
    specOptions: ['250g', '500g', '1kg', '2kg', '5kg', '250ml', '500ml', '1 Liter', '2 Liters', '5 Liters'],
    colorLabel: 'Variant / Origin Grade',
    categories: ['Organic Honey', 'Pure Ghee', 'Mustard & Cooking Oil', 'Spices & Masala', 'Dry Fruits & Nuts', 'Premium Rice & Grains', 'Tea & Beverages', 'Snacks & Sweets'],
    vendorCategories: [
      'Agricultural Producer / Farm Merchant',
      'Wholesale Grain & Spice Merchant',
      'Oil Mill & Processing Plant',
      'Cold Storage & Bulk Warehouse',
      'Food-Grade Packaging Supplier',
      'Courier & Logistics Partner',
      'General Trade Supplier'
    ],
    secondaryAttribute: {
      key: 'unit',
      label: 'Measurement Unit',
      placeholder: 'Select Unit',
      options: ['kg', 'gm', 'Liter', 'ml', 'Pcs / Box', 'Pack']
    }
  },
  general: {
    id: 'general',
    title: 'General Retail & Multi-Category',
    subtitle: 'Retail goods, home & general items',
    badge: 'Versatile / Multi-Category',
    iconName: 'Store',
    specLabel: 'Specification / Size / Variant',
    specPlaceholder: 'e.g. Standard, Large, Pack of 3, 220V',
    specOptions: ['Standard', 'Small', 'Medium', 'Large', 'Extra Large', 'Set of 1', 'Set of 3', 'Pack of 5', 'Custom'],
    colorLabel: 'Color / Variant',
    categories: ['General Merchandise', 'Home & Living', 'Kitchen & Dining', 'Stationery & Books', 'Toys & Baby Care', 'Sports & Fitness', 'Gifts & Crafts'],
    vendorCategories: [
      'Wholesale Goods Importer / Distributor',
      'Product Manufacturing Supplier',
      'Packaging & Box Unit',
      'Office & Hardware Supplier',
      'Courier & Logistics Partner',
      'General Trade Supplier'
    ],
    secondaryAttribute: {
      key: 'unit',
      label: 'Unit of Measure',
      placeholder: 'Select Unit',
      options: ['pcs', 'set', 'box', 'pack', 'pair', 'unit']
    }
  }
};

export function getSegmentConfig(type?: BusinessType): BusinessSegmentConfig {
  if (type && BUSINESS_SEGMENTS[type]) {
    return BUSINESS_SEGMENTS[type];
  }
  return BUSINESS_SEGMENTS.clothing;
}
