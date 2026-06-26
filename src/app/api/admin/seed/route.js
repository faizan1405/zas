import { NextResponse } from 'next/server';
import dbConnect from 'src/lib/mongodb';
import Product from 'src/models/Product';
import Category from 'src/models/Category';
import User from 'src/models/User';
import Page from 'src/models/Page';
import Setting from 'src/models/Setting';
import Banner from 'src/models/Banner';
import { hashPassword } from 'src/lib/auth';

const DEFAULT_CATEGORIES = [
  { name: 'Cricket Bats', slug: 'cricket-bats', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=600', displayOrder: 1, isActive: true },
  { name: 'Cricket Balls', slug: 'cricket-balls', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600', displayOrder: 2, isActive: true },
  { name: 'Cricket Kits', slug: 'cricket-kits', image: 'https://images.unsplash.com/photo-1540747737956-37872404a82f?q=80&w=600', displayOrder: 3, isActive: true },
  { name: 'Protection Gear', slug: 'protection-gear', image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600', displayOrder: 4, isActive: true },
  { name: 'Shoes', slug: 'shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600', displayOrder: 5, isActive: true },
  { name: 'Jerseys', slug: 'jerseys', image: 'https://images.unsplash.com/photo-1578269174936-2709b5a8c0e3?q=80&w=600', displayOrder: 6, isActive: true },
  { name: 'Bags', slug: 'bags', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600', displayOrder: 7, isActive: true },
  { name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=600', displayOrder: 8, isActive: true },
  { name: 'Men', slug: 'men', image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600', displayOrder: 9, isActive: true },
  { name: 'Women', slug: 'women', image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600', displayOrder: 10, isActive: true },
  { name: 'Kids', slug: 'kids', image: 'https://images.unsplash.com/photo-1540747737956-37872404a82f?q=80&w=600', displayOrder: 11, isActive: true }
];

const DEFAULT_PRODUCTS = [
  {
    name: 'Zassports Pro English Willow Bat',
    brand: 'Zassports',
    slug: 'zassports-pro-english-willow-bat',
    description: 'Crafted from premium Grade 1 English Willow. Engineered for professional power hitters, featuring an optimized sweet spot, thick edges, and a lightweight balanced pickup.',
    specs: {
      'Wood Type': 'Grade 1 English Willow',
      'Weight': '2.7 - 2.9 lbs',
      'Handle': '9-piece Treble Spring Cane',
      'Edge Thickness': '40 mm',
      'Sweet Spot': 'Mid-to-Low'
    },
    price: 299,
    mrp: 399,
    discount: 25,
    stock: 50,
    sku: 'ZAS-BAT-EW01',
    variants: {
      sizes: ['Short Handle', 'Long Handle', 'Harrow'],
      handOrientations: ['Right Hand', 'Left Hand'],
      batWoodTypes: ['English Willow'],
      playingLevels: ['Professional'],
      ageGroups: ['Men']
    },
    images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=600'],
    ratings: { average: 4.8, count: 24 },
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isActive: true,
    category: 'cricket-bats'
  },
  {
    name: 'Zassports Club Kashmir Willow Bat',
    brand: 'Zassports',
    slug: 'zassports-club-kashmir-willow-bat',
    description: 'High-quality selected Kashmir Willow bat, ideal for club league matches and training. Fitted with a secure wrap-around rubber sleeve and chevron grip.',
    specs: {
      'Wood Type': 'Selected Kashmir Willow',
      'Weight': '2.8 - 2.10 lbs',
      'Handle': 'Cane Handle',
      'Edge Thickness': '38 mm',
      'Sweet Spot': 'Mid-to-High'
    },
    price: 79,
    mrp: 99,
    discount: 20,
    stock: 50,
    sku: 'ZAS-BAT-KW02',
    variants: {
      sizes: ['Short Handle', 'Size 6'],
      handOrientations: ['Right Hand', 'Left Hand'],
      batWoodTypes: ['Kashmir Willow'],
      playingLevels: ['Intermediate'],
      ageGroups: ['Men', 'Junior']
    },
    images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=600'],
    ratings: { average: 4.2, count: 18 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isActive: true,
    category: 'cricket-bats'
  },
  {
    name: 'Zassports Junior Poplar Street Bat',
    brand: 'Zassports',
    slug: 'zassports-junior-poplar-street-bat',
    description: 'Ultra-lightweight poplar wood bat designed specifically for soft tennis balls and backyard cricket games. Recommended for young learners.',
    specs: {
      'Wood Type': 'Lightweight Poplar Wood',
      'Weight': '1.8 lbs',
      'Handle': 'One-piece Solid Wood',
      'Ball Type': 'Tennis ball / Windball'
    },
    price: 25,
    mrp: 29,
    discount: 13,
    stock: 50,
    sku: 'ZAS-BAT-PW03',
    variants: {
      sizes: ['Size 3', 'Size 4', 'Size 5'],
      batWoodTypes: ['Poplar Wood'],
      playingLevels: ['Beginner'],
      ageGroups: ['Kids', 'Junior']
    },
    images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=600'],
    ratings: { average: 4.0, count: 12 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'cricket-bats'
  },
  {
    name: 'Zassports Match Red Leather Ball',
    brand: 'Zassports',
    slug: 'zassports-match-red-leather-ball',
    description: 'Premium four-piece alum-tanned leather ball with a high-density cork core. Hand-stitched for optimal swing, seam shape retention, and long life in 40+ over matches.',
    specs: {
      'Material': 'Alum-tanned English Leather',
      'Core': 'Pounded High-Density Cork',
      'Stitching': '80-84 stitches, Hand-Sewn',
      'Weight': '156 grams (5.5 oz)'
    },
    price: 18,
    mrp: 25,
    discount: 28,
    stock: 50,
    sku: 'ZAS-BAL-RL01',
    variants: {
      ballTypes: ['Leather ball'],
      colors: ['Red'],
      playingLevels: ['Intermediate', 'Professional']
    },
    images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600'],
    ratings: { average: 4.6, count: 32 },
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isActive: true,
    category: 'cricket-balls'
  },
  {
    name: 'Zassports Day-Night Pink Leather Ball',
    brand: 'Zassports',
    slug: 'zassports-day-night-pink-leather-ball',
    description: 'Specially formulated pink leather ball for day-night matches. Highly visible under floodlights with premium gloss lacquer and standard icc measurements.',
    specs: {
      'Material': 'Premium English leather',
      'Core': 'Cane-Cork Multi-layered Center',
      'Color': 'Fluorescent Pink',
      'Weight': '156 grams'
    },
    price: 22,
    mrp: 30,
    discount: 26,
    stock: 50,
    sku: 'ZAS-BAL-PL02',
    variants: {
      ballTypes: ['Leather ball'],
      colors: ['Pink'],
      playingLevels: ['Professional']
    },
    images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600'],
    ratings: { average: 4.5, count: 14 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isActive: true,
    category: 'cricket-balls'
  },
  {
    name: 'Zassports Heavy Yellow Tennis Ball (6-Pack)',
    brand: 'Zassports',
    slug: 'zassports-heavy-yellow-tennis-ball-6-pack',
    description: 'Pressurized, heavy-weight tennis balls optimized for outdoor street cricket play. Provides robust bounce, durable thick felt, and wind resistance.',
    specs: {
      'Material': 'High-felt woven rubber',
      'Color': 'Fluorescent Yellow',
      'Felt': 'Extra Duty Outer Core',
      'Pack Size': '6 Balls per pack'
    },
    price: 15,
    mrp: 19,
    discount: 21,
    stock: 50,
    sku: 'ZAS-BAL-TB03',
    variants: {
      ballTypes: ['Tennis ball'],
      colors: ['Yellow'],
      playingLevels: ['Beginner', 'Intermediate'],
      ageGroups: ['Men', 'Women', 'Kids', 'Junior']
    },
    images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600'],
    ratings: { average: 4.4, count: 48 },
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    isActive: true,
    category: 'cricket-balls'
  },
  {
    name: 'Zassports Pro Batting Gloves',
    brand: 'Zassports',
    slug: 'zassports-pro-batting-gloves',
    description: 'Multi-flex ergonomic finger design batting gloves. Features high-density foam filling, premium sheepskin leather palm, and three-split sidebars for maximum impact protection.',
    specs: {
      'Palm Material': 'Premium Sheepskin Leather',
      'Finger Protection': 'Fibre inserts on lead fingers',
      'Thumb': 'Two-piece padded thumb',
      'Wrist Tab': '50mm wide double-sided towel sweatband'
    },
    price: 45,
    mrp: 59,
    discount: 23,
    stock: 50,
    sku: 'ZAS-GLV-BT01',
    variants: {
      sizes: ['Men', 'Youth'],
      handOrientations: ['Right Hand', 'Left Hand'],
      playingLevels: ['Professional', 'Intermediate'],
      ageGroups: ['Men', 'Women']
    },
    images: ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600'],
    ratings: { average: 4.7, count: 20 },
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'protection-gear'
  },
  {
    name: 'Zassports Shield Wicket Keeping Gloves',
    brand: 'Zassports',
    slug: 'zassports-shield-wicket-keeping-gloves',
    description: 'Professional wicket-keeping gloves with rubber octopus grip palm, reinforced finger chambers, and extensive leather padding on the cuffs for total protection.',
    specs: {
      'Palm Grip': 'Octopus style rubber grip sheet',
      'Material': 'Aniline leather outer casing',
      'Finger Caps': 'Protective plastic caps on all fingertips',
      'Cuff': 'Padded square cuff protector'
    },
    price: 65,
    mrp: 85,
    discount: 23,
    stock: 50,
    sku: 'ZAS-GLV-WK01',
    variants: {
      sizes: ['Men'],
      playingLevels: ['Professional'],
      ageGroups: ['Men']
    },
    images: ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600'],
    ratings: { average: 4.4, count: 11 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isActive: true,
    category: 'protection-gear'
  },
  {
    name: 'Zassports Carbon Fiber Batting Pads',
    brand: 'Zassports',
    slug: 'zassports-carbon-fiber-batting-pads',
    description: 'Ultra-lightweight batting pads with cane insertion and carbon-reinforced bolster. Contoured knee cups and wide padded straps ensure superior comfort and runability.',
    specs: {
      'Core Material': 'High density plastazote foam',
      'Structure': '7-cane traditional layout',
      'Straps': '3-strap quick-release velcro',
      'Knee Cup': 'Molded plastic knee locator'
    },
    price: 89,
    mrp: 119,
    discount: 25,
    stock: 50,
    sku: 'ZAS-PAD-BT01',
    variants: {
      sizes: ['Men', 'Youth'],
      handOrientations: ['Right Hand', 'Left Hand'],
      playingLevels: ['Professional', 'Intermediate'],
      ageGroups: ['Men', 'Women']
    },
    images: ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600'],
    ratings: { average: 4.6, count: 19 },
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isActive: true,
    category: 'protection-gear'
  },
  {
    name: 'Zassports Defender Cricket Helmet',
    brand: 'Zassports',
    slug: 'zassports-defender-cricket-helmet',
    description: 'High-impact ABS outer shell cricket helmet with a fully adjustable titanium steel visor. Internal EPS liner absorbs shock, while cooling air vents maintain airflow.',
    specs: {
      'Outer Shell': 'High-Impact ABS Plastic',
      'Visor': 'Titanium alloy wire grill',
      'Inner Padding': 'Dual-density foam with sweatband',
      'Standards': 'Certified to BS 7928:2013'
    },
    price: 59,
    mrp: 79,
    discount: 25,
    stock: 50,
    sku: 'ZAS-HLM-DF01',
    variants: {
      sizes: ['M (56-58cm)', 'L (59-61cm)'],
      playingLevels: ['Beginner', 'Intermediate', 'Professional'],
      ageGroups: ['Men', 'Women', 'Junior']
    },
    images: ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600'],
    ratings: { average: 4.7, count: 15 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'protection-gear'
  },
  {
    name: 'Zassports Spike Cricket Shoes',
    brand: 'Zassports',
    slug: 'zassports-spike-cricket-shoes',
    description: 'High-performance spikes designed for fast bowlers and batsmen alike. Built with a mesh/synthetic upper, cushioned EVA midsole, and a full steel-spike outsole plate.',
    specs: {
      'Outsole': 'TPU Plate with 11 metal spikes',
      'Midsole': 'High-rebound EVA cushion',
      'Upper': 'Synthetic leather + breathable mesh',
      'Closure': 'Lace-up with Velcro strap'
    },
    price: 95,
    mrp: 129,
    discount: 26,
    stock: 50,
    sku: 'ZAS-SH-SP01',
    variants: {
      sizes: ['US 8', 'US 9', 'US 10', 'US 11'],
      playingLevels: ['Intermediate', 'Professional'],
      ageGroups: ['Men']
    },
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600'],
    ratings: { average: 4.5, count: 21 },
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    isActive: true,
    category: 'shoes'
  },
  {
    name: 'Zassports Dri-Fit Match Jersey',
    brand: 'Zassports',
    slug: 'zassports-dri-fit-match-jersey',
    description: 'Elite cricket whites shirt. Fabricated with sweat-wicking dry-mesh technology to keep you cool and dry during hot multi-session days.',
    specs: {
      'Fabric': '100% Recycled Polyester Mesh',
      'Technology': 'Dri-Fit moisture management',
      'Fit': 'Athletic loose fit',
      'Collar': 'Traditional dynamic collar'
    },
    price: 29,
    mrp: 39,
    discount: 25,
    stock: 50,
    sku: 'ZAS-JSY-MF01',
    variants: {
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['White', 'Navy Blue'],
      ageGroups: ['Men', 'Women']
    },
    images: ['https://images.unsplash.com/photo-1578269174936-2709b5a8c0e3?q=80&w=600'],
    ratings: { average: 4.3, count: 28 },
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    isActive: true,
    category: 'jerseys'
  },
  {
    name: 'Zassports Pro Wheelie Cricket Bag',
    brand: 'Zassports',
    slug: 'zassports-pro-wheelie-cricket-bag',
    description: 'Massive storage kit bag with heavy-duty tractor wheels. Includes 3 integrated bat sleeves, separate helmet/shoe compartments, and a thermo-insulated pocket for drinks.',
    specs: {
      'Dimensions': '95cm x 40cm x 40cm',
      'Material': '1680D Water-resistant Cordura',
      'Wheels': '2 Heavy-duty offroad wheels',
      'Handles': 'Padded carry handle + telescoping pull strap'
    },
    price: 110,
    mrp: 149,
    discount: 26,
    stock: 50,
    sku: 'ZAS-BAG-WH01',
    variants: {
      colors: ['Black/Orange', 'Obsidian Black'],
      ageGroups: ['Men', 'Women', 'Junior']
    },
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600'],
    ratings: { average: 4.8, count: 10 },
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'bags'
  },
  {
    name: 'Zassports Youth Complete Cricket Kit',
    brand: 'Zassports',
    slug: 'zassports-youth-complete-cricket-kit',
    description: 'Everything a junior player needs to start cricket. Contains: 1 Kashmir Willow bat, batting pads, batting gloves, helmet, thigh guard, arm guard, abdominal guard, and a durable duffle bag.',
    specs: {
      'Target Age': '9 - 14 years',
      'Bat Size': 'Size 5 Kashmir Willow',
      'Includes': 'Bat, Pads, Gloves, Helmet, Thigh, Arm, Abdominal guard, Gear bag',
      'Bag Style': 'Double-strap shoulder backpack'
    },
    price: 179,
    mrp: 239,
    discount: 25,
    stock: 50,
    sku: 'ZAS-KIT-YT01',
    variants: {
      handOrientations: ['Right Hand', 'Left Hand'],
      playingLevels: ['Beginner', 'Intermediate'],
      ageGroups: ['Junior', 'Kids']
    },
    images: ['https://images.unsplash.com/photo-1540747737956-37872404a82f?q=80&w=600'],
    ratings: { average: 4.7, count: 8 },
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    isActive: true,
    category: 'cricket-kits'
  },
  {
    name: 'Zassports Solid Wooden Stumps (Set of 6)',
    brand: 'Zassports',
    slug: 'zassports-solid-wooden-stumps-set-of-6',
    description: 'Standard English Ash wood cricket stumps with matching bails. Precision-lathed to meet official ICC specifications for match play.',
    specs: {
      'Material': 'Seasoned Ash Wood',
      'Stump Height': '28 inches (71.1 cm) above ground',
      'Diameter': '3.81 cm',
      'Set Includes': '6 Stumps, 4 Bails, Carry Bag'
    },
    price: 49,
    mrp: 65,
    discount: 24,
    stock: 50,
    sku: 'ZAS-ACC-ST01',
    variants: {
      playingLevels: ['Beginner', 'Intermediate', 'Professional']
    },
    images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=600'],
    ratings: { average: 4.4, count: 16 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'accessories'
  }
];

const DEFAULT_PAGES = [
  {
    title: 'Shipping Policy',
    slug: 'shipping-policy',
    content: `## Shipping Information
We ship our premium cricket gear all over India. Shipping charges are extra and calculated based on weight and destination at the time of dispatch/checkout.

### Delivery Areas
- We deliver to all pincodes across India.

### Delivery Times
- **Metro Cities:** 3-5 business days.
- **Other Regions:** 5-7 business days.

### Order Tracking
Once your order has been packed and shipped, you will receive an email and WhatsApp message with your tracking ID and the name of the courier partner. You can track your order live using our [Track Order](/track-order) tool.`
  },
  {
    title: 'Return & Exchange Policy',
    slug: 'return-policy',
    content: `## Returns and Exchanges
We stand behind the quality of our sports equipment. If you are not 100% satisfied, you can return or exchange your product within 7 days of delivery.

### Conditions for Returns
- Items must be unused, with original tags intact and in their original packaging.
- Bats must not have been oiled, knocked, or used for match play.
- Shoes must be returned in their original shoebox.

### Process
1. Contact customer support or submit a return request from your account.
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

### Pricing & Availabilty
We make every effort to display accurate pricing and stock status. In the event of an out-of-stock item being purchased, we will cancel the item and issue a full refund.

### Account Responsibilty
You are responsible for keeping your login credentials secure. Unauthorized usage of your account should be reported immediately.`
  },
  {
    title: 'About Us',
    slug: 'about-us',
    content: `## Our Story
Founded in 2026, **Zassports** was born out of a passion for the sport. Inspired by the premium athletic experience of large-scale sports hubs, we set out to build a professional-grade cricket shopping destination.

### Our Mission
- To provide cricketers of all levels—from backyard beginners to professional county players—with the highest quality cricket gear at competitive prices. We believe proper equipment is the foundation of outstanding athletic performance.`
  },
  {
    title: 'Contact Us',
    slug: 'contact-us',
    content: `## Get in Touch
If you have questions about bat grains, size fittings, or order shipping times, our support team is ready to assist.

### Contact Channels
- **WhatsApp Support:** 918860654659
- **Direct Phone:** 8860654659
- **Email:** info@zassports.com
- **HQ Office:** Main Road, Deepak Vihar, Near Indus Valley Public School, Khora Colony, Noida Sector 62, Uttar Pradesh – 201309`
  }
];

export async function GET(request) {
  try {
    await dbConnect();

    // Check if ?force=true is query param to clean & re-seed
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    if (force) {
      console.log('Force parameter set. Wiping database collections...');
      await Product.deleteMany({});
      await Category.deleteMany({});
      await Page.deleteMany({});
      await Setting.deleteMany({});
      await Banner.deleteMany({});
      // Note: We don't delete Users to protect admin user if already seeded, but we'll re-seed admin
    }

    // 1. Seed Categories if empty
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      await Category.insertMany(DEFAULT_CATEGORIES);
      console.log('Categories seeded.');
    }

    // 2. Seed Products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(DEFAULT_PRODUCTS);
      console.log('Products seeded.');
    }

    // 3. Seed Policy Pages if empty
    const pageCount = await Page.countDocuments();
    if (pageCount === 0) {
      await Page.insertMany(DEFAULT_PAGES);
      console.log('Policy pages seeded.');
    }

    // 4. Seed Settings if empty
    const settingCount = await Setting.countDocuments();
    let currentSettings = null;
    if (settingCount === 0) {
      currentSettings = await Setting.create({});
      console.log('Default settings created.');
    } else {
      currentSettings = await Setting.findOne();
    }

    // 5. Seed Admin Account if doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@zassports.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      const hashedPassword = await hashPassword(adminPassword);
      await User.create({
        name: 'Zassports Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Default administrator created.');
    }

    // 6. Seed Default Hero Banners if empty
    const bannerCount = await Banner.countDocuments();
    if (bannerCount === 0) {
      await Banner.create([
        {
          title: 'Unleash Your Inner Champion',
          subtitle: 'Explore our professional English Willow bats and protective gear.',
          image: '/images/hero.png',
          link: '/shop',
          type: 'hero',
          isActive: true,
          displayOrder: 1
        },
        {
          title: 'Gear Up For The Match',
          subtitle: 'Special 25% discount on all custom cricket kits and bundles.',
          image: 'https://images.unsplash.com/photo-1540747737956-37872404a82f?q=80&w=1200',
          link: '/shop?category=cricket-kits',
          type: 'offer',
          isActive: true,
          displayOrder: 2
        }
      ]);
      console.log('Homepage banners seeded.');
    }

    return NextResponse.json({
      success: true,
      message: 'Seeding completed successfully.',
      forcedReset: force,
      categoriesCount: await Category.countDocuments(),
      productsCount: await Product.countDocuments(),
      pagesCount: await Page.countDocuments(),
      adminSeeded: !adminExists
    });

  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
