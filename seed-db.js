const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Read .env file to extract MONGODB_URI
const envPath = path.join(__dirname, '.env');
console.log('Reading config from:', envPath);
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (err) {
  console.error('Failed to read .env file', err.message);
  process.exit(1);
}

let mongodbUri = '';
if (envContent) {
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith('MONGODB_URI=')) {
      mongodbUri = line.trim().split('MONGODB_URI=')[1];
      break;
    }
  }
}

if (!mongodbUri) {
  console.error('MONGODB_URI not found in .env');
  process.exit(1);
}

mongodbUri = mongodbUri.split('#')[0].trim();
console.log('Connecting to database...');

// Define local schemas for seeding
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'categories' });

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  specs: { type: Map, of: String },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  stock: { type: Number, required: true, default: 0 },
  sku: { type: String, required: true, unique: true },
  variants: {
    sizes: [String],
    colors: [String],
    handOrientations: [String],
    batWoodTypes: [String],
    ballTypes: [String],
    playingLevels: [String],
    ageGroups: [String],
  },
  images: [String],
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  category: { type: String, required: true },
  subcategory: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'products' });

const PageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'pages' });

const SettingSchema = new mongoose.Schema({
  storeName: { type: String, default: 'Zassports' },
  contactNumber: { type: String, default: '8860654659' },
  whatsappNumber: { type: String, default: '8860654659' },
  email: { type: String, default: 'info@zassports.com' },
  address: { type: String, default: 'Main road, Deepak Vihar, near Indus Valley Public School, Khora Colony, Noida Sec 62, Uttar Pradesh - 201309' },
  shippingCharges: { type: Number, default: 100 },
  freeShippingMinAmount: { type: Number, default: 999 },
  codEnabled: { type: Boolean, default: true },
  onlinePaymentEnabled: { type: Boolean, default: true },
  taxPercent: { type: Number, default: 12 },
  gstDetails: { type: String, default: '09AACCZ4143L1ZY' },
  logoUrl: { type: String, default: '' },
  socialLinks: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'settings' });

const BannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  image: { type: String, required: true },
  link: { type: String },
  type: { type: String, enum: ['hero', 'offer', 'side'], default: 'hero' },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'banners' });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'users' });

const CATEGORIES = [
  { name: 'Cricket Bats', slug: 'cricket-bats', image: '/images/categories/cricket-bats.svg', displayOrder: 1, isActive: true },
  { name: 'Cricket Balls', slug: 'cricket-balls', image: '/images/categories/cricket-balls.svg', displayOrder: 2, isActive: true },
  { name: 'Batting Gloves', slug: 'batting-gloves', image: '/images/categories/batting-gloves.svg', displayOrder: 3, isActive: true },
  { name: 'Batting Pads', slug: 'batting-pads', image: '/images/categories/batting-pads.svg', displayOrder: 4, isActive: true },
  { name: 'Cricket Helmets', slug: 'cricket-helmets', image: '/images/categories/cricket-helmets.svg', displayOrder: 5, isActive: true },
  { name: 'Cricket Shoes', slug: 'cricket-shoes', image: '/images/categories/cricket-shoes.svg', displayOrder: 6, isActive: true },
  { name: 'Cricket Bags', slug: 'cricket-bags', image: '/images/categories/cricket-bags.svg', displayOrder: 7, isActive: true },
  { name: 'Cricket Clothing', slug: 'cricket-clothing', image: '/images/categories/cricket-clothing.svg', displayOrder: 8, isActive: true },
  { name: 'Protective Gear', slug: 'protective-gear', image: '/images/categories/protective-gear.svg', displayOrder: 9, isActive: true },
  { name: 'Training Equipment', slug: 'training-equipment', image: '/images/categories/training-equipment.svg', displayOrder: 10, isActive: true },
  { name: 'Accessories', slug: 'accessories', image: '/images/categories/accessories.svg', displayOrder: 11, isActive: true }
];

const PRODUCTS = [
  {
    name: 'Zassports English Willow Cricket Bat',
    brand: 'Zassports',
    slug: 'zassports-english-willow-cricket-bat',
    description: 'Expertly crafted from premium Grade 1 English Willow. Balanced sweet spot, thick edges, and a lightweight pickup for professional-grade power hitting.',
    specs: { 'Wood Type': 'Grade 1 English Willow', 'Weight': '2.8 lbs', 'Handle': '9-piece cane', 'Edge': '40 mm' },
    price: 6999,
    mrp: 8999,
    discount: 22,
    stock: 50,
    sku: 'ZAS-BAT-EW01',
    variants: { sizes: ['Short Handle', 'Long Handle'], handOrientations: ['Right Hand', 'Left Hand'], batWoodTypes: ['English Willow'], playingLevels: ['Professional'], ageGroups: ['Men'] },
    images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=600'],
    ratings: { average: 4.8, count: 45 },
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isActive: true,
    category: 'cricket-bats',
    subcategory: 'english-willow-bat'
  },
  {
    name: 'Zassports Kashmir Willow Cricket Bat',
    brand: 'Zassports',
    slug: 'zassports-kashmir-willow-cricket-bat',
    description: 'Selected high-quality Kashmir Willow bat. Provides excellent durability and rebound drive, making it ideal for tournament and club play.',
    specs: { 'Wood Type': 'Premium Kashmir Willow', 'Weight': '2.9 lbs', 'Handle': 'Full cane', 'Edge': '38 mm' },
    price: 2999,
    mrp: 3999,
    discount: 25,
    stock: 50,
    sku: 'ZAS-BAT-KW02',
    variants: { sizes: ['Short Handle', 'Size 6'], handOrientations: ['Right Hand', 'Left Hand'], batWoodTypes: ['Kashmir Willow'], playingLevels: ['Intermediate'], ageGroups: ['Men', 'Junior'] },
    images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=600'],
    ratings: { average: 4.5, count: 22 },
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    isActive: true,
    category: 'cricket-bats',
    subcategory: 'kashmir-willow-bat'
  },
  {
    name: 'Zassports Tennis Cricket Bat',
    brand: 'Zassports',
    slug: 'zassports-tennis-cricket-bat',
    description: 'High-performance poplar wood bat explicitly pressed and curved for heavy tennis ball cricket matches. Offers extra thick shoulder layout.',
    specs: { 'Wood Type': 'Poplar Hardwood', 'Weight': '2.2 lbs', 'Handle': 'Cane Handle' },
    price: 999,
    mrp: 1499,
    discount: 33,
    stock: 50,
    sku: 'ZAS-BAT-TB03',
    variants: { sizes: ['Short Handle', 'Size 5'], handOrientations: ['Right Hand'], batWoodTypes: ['Poplar Wood'], playingLevels: ['Beginner'], ageGroups: ['Men', 'Kids'] },
    images: ['https://images.unsplash.com/photo-1540747737956-37872404a82f?q=80&w=600'],
    ratings: { average: 4.2, count: 31 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isActive: true,
    category: 'cricket-bats',
    subcategory: 'tennis-cricket-bat'
  },
  {
    name: 'Zassports Kids Cricket Bat',
    brand: 'Zassports',
    slug: 'zassports-kids-cricket-bat',
    description: 'Super lightweight youth bat to help young champions develop their stance and drive techniques safely.',
    specs: { 'Wood Type': 'Lightweight Poplar', 'Weight': '1.8 lbs', 'Handle': 'Comfort sleeve' },
    price: 899,
    mrp: 1299,
    discount: 31,
    stock: 50,
    sku: 'ZAS-BAT-KB04',
    variants: { sizes: ['Size 4', 'Size 3', 'Size 2'], handOrientations: ['Right Hand', 'Left Hand'], batWoodTypes: ['Poplar Wood'], playingLevels: ['Beginner'], ageGroups: ['Kids', 'Junior'] },
    images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=600'],
    ratings: { average: 4.4, count: 12 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'cricket-bats',
    subcategory: 'kids-cricket-bat'
  },
  {
    name: 'Zassports Leather Cricket Ball',
    brand: 'Zassports',
    slug: 'zassports-leather-cricket-ball',
    description: 'Premium 4-piece alum-tanned leather ball with a solid cork core. Perfect shape retention and pronounced seam for match-winning swing.',
    specs: { 'Material': 'Alum-tanned English Leather', 'Core': 'High density compressed cork', 'Weight': '156g' },
    price: 399,
    mrp: 599,
    discount: 33,
    stock: 50,
    sku: 'ZAS-BAL-LT01',
    variants: { colors: ['Red', 'White', 'Pink'], ballTypes: ['Leather ball'], playingLevels: ['Professional', 'Intermediate'], ageGroups: ['Men'] },
    images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600'],
    ratings: { average: 4.6, count: 51 },
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isActive: true,
    category: 'cricket-balls',
    subcategory: 'leather-ball'
  },
  {
    name: 'Zassports Heavy Tennis Ball Pack of 6',
    brand: 'Zassports',
    slug: 'zassports-heavy-tennis-ball-pack-of-6',
    description: 'Heavyweight, highly pressurized outdoor play tennis balls with robust felt cover for standard street or tournament cricket matches.',
    specs: { 'Material': 'Pressurized woven rubber felt', 'Pack Qty': '6 Balls', 'Color': 'Fluorescent Yellow' },
    price: 499,
    mrp: 699,
    discount: 29,
    stock: 50,
    sku: 'ZAS-BAL-HT02',
    variants: { colors: ['Yellow', 'Red'], ballTypes: ['Tennis ball'], playingLevels: ['Beginner', 'Intermediate'], ageGroups: ['Men', 'Women', 'Kids', 'Junior'] },
    images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600'],
    ratings: { average: 4.3, count: 18 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isActive: true,
    category: 'cricket-balls',
    subcategory: 'tennis-ball'
  },
  {
    name: 'Zassports Practice Rubber Ball',
    brand: 'Zassports',
    slug: 'zassports-practice-rubber-ball',
    description: 'Highly durable bounce-reactive practice rubber balls. Perfect for indoor nets, solo catching drills, and swing tests.',
    specs: { 'Material': 'Solid synthetic rubber', 'Diameter': '70mm' },
    price: 199,
    mrp: 299,
    discount: 33,
    stock: 50,
    sku: 'ZAS-BAL-PR03',
    variants: { colors: ['Red', 'Yellow'], ballTypes: ['Practice ball'], playingLevels: ['Beginner'], ageGroups: ['Kids', 'Junior'] },
    images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600'],
    ratings: { average: 4.1, count: 10 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'cricket-balls',
    subcategory: 'practice-ball'
  },
  {
    name: 'Zassports Batting Gloves',
    brand: 'Zassports',
    slug: 'zassports-batting-gloves',
    description: 'Ergonomic dual-density foam protective gloves. Features sheepskin leather palm for a comfortable, non-slip grip and air mesh panels.',
    specs: { 'Material': 'Genuine sheepskin palm', 'Protection': 'High density foam finger rolls' },
    price: 1199,
    mrp: 1599,
    discount: 25,
    stock: 50,
    sku: 'ZAS-GLV-BT01',
    variants: { sizes: ['S', 'M', 'L'], handOrientations: ['Right Hand', 'Left Hand'], playingLevels: ['Intermediate', 'Professional'], ageGroups: ['Men', 'Junior'] },
    images: ['https://images.unsplash.com/photo-1588615419954-bfad0c5f2122?q=80&w=600'],
    ratings: { average: 4.7, count: 28 },
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isActive: true,
    category: 'batting-gloves',
    subcategory: 'batting-gloves'
  },
  {
    name: 'Zassports Batting Pads',
    brand: 'Zassports',
    slug: 'zassports-batting-pads',
    description: 'Traditional lightweight cane rod constructed shin guards. Wraps securely with triple velcro straps and provides molded knee cups.',
    specs: { 'Material': 'Polyurethane front face', 'Padding': 'Molded shock absorbing foam' },
    price: 1799,
    mrp: 2299,
    discount: 22,
    stock: 50,
    sku: 'ZAS-PAD-BT01',
    variants: { sizes: ['M', 'L'], handOrientations: ['Right Hand', 'Left Hand'], playingLevels: ['Intermediate', 'Professional'], ageGroups: ['Men'] },
    images: ['https://images.unsplash.com/photo-1540747737956-37872404a82f?q=80&w=600'],
    ratings: { average: 4.6, count: 32 },
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'batting-pads',
    subcategory: 'batting-pads'
  },
  {
    name: 'Zassports Cricket Helmet',
    brand: 'Zassports',
    slug: 'zassports-cricket-helmet',
    description: 'Impact certified protective helmet. Hard ABS shell structure with sweat-wicking padding and high-tensile carbon steel grill.',
    specs: { 'Shell': 'ABS High-Impact', 'Visor': 'Carbon steel visor grill' },
    price: 1499,
    mrp: 1999,
    discount: 25,
    stock: 50,
    sku: 'ZAS-HLM-CR01',
    variants: { sizes: ['S', 'M', 'L'], playingLevels: ['Beginner', 'Intermediate', 'Professional'], ageGroups: ['Men', 'Junior'] },
    images: ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600'],
    ratings: { average: 4.7, count: 19 },
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'cricket-helmets',
    subcategory: 'cricket-helmets'
  },
  {
    name: 'Zassports Cricket Shoes (Rubber Sole)',
    brand: 'Zassports',
    slug: 'zassports-cricket-shoes-rubber-sole',
    description: 'Versatile rubber multi-stud outsole shoes. Breathable synthetic upper with shock absorbing EVA midsole, perfect for training nets and synthetic turfs.',
    specs: { 'Sole': 'Multi-stud rubber sole', 'Midsole': 'EVA Cushioned foam' },
    price: 2499,
    mrp: 3299,
    discount: 24,
    stock: 50,
    sku: 'ZAS-SHS-RS01',
    variants: { sizes: ['US 8', 'US 9', 'US 10'], playingLevels: ['Beginner', 'Intermediate'], ageGroups: ['Men', 'Kids', 'Junior'] },
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600'],
    ratings: { average: 4.5, count: 27 },
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isActive: true,
    category: 'cricket-shoes',
    subcategory: 'rubber-shoes'
  },
  {
    name: 'Zassports Spiked Cricket Shoes',
    brand: 'Zassports',
    slug: 'zassports-spiked-cricket-shoes',
    description: 'Pro metal spike shoes built for turf match play. Delivers outstanding grip for fast bowlers and quick fielders.',
    specs: { 'Sole': 'Steel spikes plate', 'Midsole': 'EVA Cushioned' },
    price: 3499,
    mrp: 4499,
    discount: 22,
    stock: 50,
    sku: 'ZAS-SHS-SP02',
    variants: { sizes: ['US 8', 'US 9', 'US 10', 'US 11'], playingLevels: ['Professional'], ageGroups: ['Men'] },
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600'],
    ratings: { average: 4.8, count: 15 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isActive: true,
    category: 'cricket-shoes',
    subcategory: 'spiked-shoes'
  },
  {
    name: 'Zassports Cricket Kit Bag',
    brand: 'Zassports',
    slug: 'zassports-cricket-kit-bag',
    description: 'Heavy duty wheelie cricket bag featuring massive storage compartment. Contains 3 external bat cavities and integrated tractor-grade wheels.',
    specs: { 'Material': '1680D Cordura fabric', 'Wheels': 'Tractor heavy duty wheels', 'Size': '90 x 38 x 38 cm' },
    price: 1299,
    mrp: 1799,
    discount: 28,
    stock: 50,
    sku: 'ZAS-BAG-KT01',
    variants: { colors: ['Black/Orange', 'Blue/Navy'], ageGroups: ['Men', 'Junior'] },
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600'],
    ratings: { average: 4.6, count: 38 },
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isActive: true,
    category: 'cricket-bags',
    subcategory: 'cricket-bags'
  },
  {
    name: 'Zassports Cricket Jersey',
    brand: 'Zassports',
    slug: 'zassports-cricket-jersey',
    description: 'Breathable, sweat-wicking lightweight quick-dry polyester jersey. Designed for extreme flexibility and airflow on the field.',
    specs: { 'Material': '100% Quick-dry Polyester', 'Fit': 'Regular active fit' },
    price: 599,
    mrp: 899,
    discount: 33,
    stock: 50,
    sku: 'ZAS-CLO-JS01',
    variants: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Blue', 'White'], ageGroups: ['Men', 'Women', 'Kids', 'Junior'] },
    images: ['https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=600'],
    ratings: { average: 4.4, count: 24 },
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    isActive: true,
    category: 'cricket-clothing',
    subcategory: 'cricket-jersey'
  },
  {
    name: 'Zassports Cricket Track Pants',
    brand: 'Zassports',
    slug: 'zassports-cricket-track-pants',
    description: 'Super stretch active track pants with mesh aeration lines on the side. Drawcord waist adjustments and zip pockets.',
    specs: { 'Material': 'Polyester Spandex Blend', 'Pockets': '2 Side zip pockets' },
    price: 799,
    mrp: 1199,
    discount: 33,
    stock: 50,
    sku: 'ZAS-CLO-TP02',
    variants: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Navy Blue', 'White'], ageGroups: ['Men', 'Junior'] },
    images: ['https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=600'],
    ratings: { average: 4.3, count: 17 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'cricket-clothing',
    subcategory: 'cricket-track-pants'
  },
  {
    name: 'Zassports Thigh Guard',
    brand: 'Zassports',
    slug: 'zassports-thigh-guard',
    description: 'Pre-shaped ultra-lightweight foam dual thigh pad guards. Offers adjustable elastic straps for secure wrap-around protection.',
    specs: { 'Material': 'EVA Foam protection', 'Straps': 'Elastic Velcro bands' },
    price: 499,
    mrp: 799,
    discount: 38,
    stock: 50,
    sku: 'ZAS-PRO-TG01',
    variants: { sizes: ['Youth', 'Adult'], handOrientations: ['Right Hand', 'Left Hand'], playingLevels: ['Intermediate', 'Professional'], ageGroups: ['Men', 'Junior'] },
    images: ['https://images.unsplash.com/photo-1540747737956-37872404a82f?q=80&w=600'],
    ratings: { average: 4.7, count: 14 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'protective-gear',
    subcategory: 'protective-gear'
  },
  {
    name: 'Zassports Cricket Stumps Set',
    brand: 'Zassports',
    slug: 'zassports-cricket-stumps-set',
    description: 'Traditional solid wooden stumps set lathed from seasoned hardwood. Set contains 6 full length stumps and 4 bails with a carry wrap.',
    specs: { 'Material': 'Seasoned Ash Wood', 'Height': '28 Inches', 'Includes': '6 stumps, 4 bails, 1 carry bag' },
    price: 799,
    mrp: 1199,
    discount: 33,
    stock: 50,
    sku: 'ZAS-EQP-ST01',
    variants: { playingLevels: ['Beginner', 'Intermediate', 'Professional'] },
    images: ['https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=600'],
    ratings: { average: 4.5, count: 21 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'training-equipment',
    subcategory: 'stumps'
  },
  {
    name: 'Zassports Bat Grip (Pack of 3)',
    brand: 'Zassports',
    slug: 'zassports-bat-grip-pack-of-3',
    description: 'High elasticity chevron patterned rubber bat grips. Delivers excellent shock absorption and slip-free performance under wet conditions.',
    specs: { 'Material': 'High-stretch synthetic rubber', 'Pack Size': '3 grips' },
    price: 99,
    mrp: 149,
    discount: 34,
    stock: 50,
    sku: 'ZAS-ACC-BG01',
    variants: { colors: ['Red', 'White', 'Yellow'] },
    images: ['https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=600'],
    ratings: { average: 4.4, count: 32 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'accessories',
    subcategory: 'bat-grips'
  }
];

const PAGES = [
  {
    title: 'Shipping Policy',
    slug: 'shipping-policy',
    content: `## Shipping Policy
We ship our premium cricket gear all over India. Shipping charges are extra and calculated based on weight and destination at checkout.

### Delivery Areas
- We deliver to almost all pincodes across India.

### Delivery Times
- **Metro Cities:** 3-5 business days.
- **Other Regions:** 5-7 business days.

### Order Tracking
Once your order has been packed and shipped, you will receive an email and WhatsApp message with your tracking ID. You can track your order live using our Track Order tool.`
  },
  {
    title: 'Return & Exchange Policy',
    slug: 'return-policy',
    content: `## Return & Exchange Policy
We stand behind the quality of our sports equipment. If you are not 100% satisfied, you can return or exchange your product within 7 days of delivery.

### Conditions for Returns
- Items must be unused, with original tags intact and in their original packaging.
- Bats must not have been oiled, knocked, or used for match play.
- Shoes must be returned in their original shoebox.

### Process
1. Contact customer support (8860654659) or submit a return request.
2. A courier partner will pick up the package from your address.
3. Upon inspection at our warehouse, your refund/exchange will be processed within 5 business days.`
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: `## Privacy Policy
Your privacy is important to us. This policy describes how we collect, use, and protect your personal information when you use the Zassports store.

### Information We Collect
- Contact details (name, email, phone number, address).
- Transaction history.
- Cookie data for cart persistence and search filters.

We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties.`
  },
  {
    title: 'Terms & Conditions',
    slug: 'terms-and-conditions',
    content: `## Terms & Conditions
Welcome to Zassports. By browsing or purchasing from our website, you agree to comply with the following terms.

### Pricing & Availability
We make every effort to display accurate pricing and stock status. In the event of an out-of-stock item being purchased, we will cancel the item and issue a full refund.

### Account Responsibility
You are responsible for keeping your login credentials secure. Unauthorized usage of your account should be reported immediately.`
  },
  {
    title: 'About Us',
    slug: 'about-us',
    content: `## Our Story
Founded in 2026, **Zassports** was born out of a passion for cricket. Inspired by the premium athletic experience of large-scale sports hubs, we set out to build a professional-grade cricket shopping destination.

### Our Mission
- To provide cricketers of all levels—from backyard beginners to professional county players—with the highest quality cricket gear at competitive prices. We believe proper equipment is the foundation of outstanding athletic performance.`
  },
  {
    title: 'Contact Us',
    slug: 'contact-us',
    content: `## Get in Touch
If you have questions about bat grains, size fittings, or order shipping times, our support team is ready to assist.

### Contact Channels
- **WhatsApp Support:** 8860654659
- **Direct Phone:** 8860654659
- **Email:** info@zassports.com
- **HQ Office:** Main road, Deepak Vihar, near Indus Valley Public School, Khora Colony, Noida Sec 62, Uttar Pradesh - 201309`
  }
];

async function seed() {
  try {
    await mongoose.connect(mongodbUri);
    console.log('Connected to MongoDB successfully!');

    const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
    const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
    const Page = mongoose.models.Page || mongoose.model('Page', PageSchema);
    const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
    const Banner = mongoose.models.Banner || mongoose.model('Banner', BannerSchema);
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Wipe collections
    console.log('Wiping collections...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Page.deleteMany({});
    await Setting.deleteMany({});
    await Banner.deleteMany({});
    
    // Seed Categories
    console.log('Seeding Categories...');
    await Category.insertMany(CATEGORIES);
    console.log(`Successfully seeded ${CATEGORIES.length} categories.`);

    // Seed Products
    console.log('Seeding Products...');
    await Product.insertMany(PRODUCTS);
    console.log(`Successfully seeded ${PRODUCTS.length} products.`);

    // Seed Pages
    console.log('Seeding Pages...');
    await Page.insertMany(PAGES);
    console.log(`Successfully seeded ${PAGES.length} policy pages.`);

    // Seed Settings
    console.log('Seeding Settings...');
    await Setting.create({
      storeName: 'Zassports',
      contactNumber: '8860654659',
      whatsappNumber: '8860654659',
      email: 'info@zassports.com',
      address: 'Main road, Deepak Vihar, near Indus Valley Public School, Khora Colony, Noida Sec 62, Uttar Pradesh - 201309',
      shippingCharges: 100,
      freeShippingMinAmount: 999,
      codEnabled: true,
      onlinePaymentEnabled: true,
      taxPercent: 12,
      gstDetails: '09AACCZ4143L1ZY',
      socialLinks: {
        facebook: 'https://facebook.com',
        instagram: 'https://www.instagram.com/zas.india?igsh=MWx2cTk1Z2g3czZlNA%3D%3D&utm_source=qr',
        twitter: 'https://twitter.com',
        youtube: 'https://youtube.com/@brandedmalikboss?si=z7IYvk_dR1mPFkVH'
      }
    });
    console.log('Default settings created.');

    // Seed Admin Account if doesn't exist
    console.log('Checking Admin account...');
    const adminEmail = 'admin@zassports.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);
      await User.create({
        name: 'Zassports Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Default administrator created (admin@zassports.com / Admin@123).');
    }

    // Seed Default Hero Banners
    console.log('Seeding Homepage banners...');
    await Banner.create([
      {
        title: 'Unleash Your Inner Champion',
        subtitle: 'Explore our professional English Willow bats and protective gear.',
        image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200',
        link: '/shop?category=cricket-bats',
        type: 'hero',
        isActive: true,
        displayOrder: 1
      },
      {
        title: 'Gear Up For The Match',
        subtitle: 'Special 25% discount on all custom cricket kits and bundles.',
        image: 'https://images.unsplash.com/photo-1540747737956-37872404a82f?q=80&w=1200',
        link: '/shop?category=complete-cricket-kits',
        type: 'offer',
        isActive: true,
        displayOrder: 2
      }
    ]);
    console.log('Banners seeded successfully.');

  } catch (err) {
    console.error('Error running seeding script:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

seed();
