import { NextResponse } from 'next/server';
import dbConnect from 'src/lib/mongodb';
import Product from 'src/models/Product';
import Category from 'src/models/Category';
import User from 'src/models/User';
import Page from 'src/models/Page';
import Setting from 'src/models/Setting';
import Banner from 'src/models/Banner';
import { hashPassword, verifyAdmin } from 'src/lib/auth';

const DEFAULT_CATEGORIES = [
  { name: 'Cricket Bats', slug: 'cricket-bats', image: '/images/categories/cricket-bats.jpg', displayOrder: 1, isActive: true },
  { name: 'Cricket Balls', slug: 'cricket-balls', image: '/images/categories/cricket-balls.jpg', displayOrder: 2, isActive: true },
  { name: 'Batting Gloves', slug: 'batting-gloves', image: '/images/categories/batting-gloves.jpg', displayOrder: 3, isActive: true },
  { name: 'Wicket Keeping Gloves', slug: 'wicket-keeping-gloves', image: '/images/categories/wicket-keeping-gloves.jpg', displayOrder: 4, isActive: true },
  { name: 'Batting Pads', slug: 'batting-pads', image: '/images/categories/batting-pads.jpg', displayOrder: 5, isActive: true },
  { name: 'Helmets', slug: 'helmets', image: '/images/categories/helmets.jpg', displayOrder: 6, isActive: true },
  { name: 'Cricket Shoes', slug: 'cricket-shoes', image: '/images/categories/cricket-shoes.jpg', displayOrder: 7, isActive: true },
  { name: 'Kit Bags', slug: 'kit-bags', image: '/images/categories/kit-bags.jpg', displayOrder: 8, isActive: true },
  { name: 'Complete Cricket Kits', slug: 'complete-cricket-kits', image: '/images/categories/complete-cricket-kits.jpg', displayOrder: 9, isActive: true },
  { name: 'Accessories', slug: 'accessories', image: '/images/categories/accessories.jpg', displayOrder: 10, isActive: true }
];

const DEFAULT_PRODUCTS = [
  {
    name: 'Apex Pro English Willow Cricket Bat',
    brand: 'Apex Cricket',
    slug: 'apex-pro-english-willow-cricket-bat',
    description: 'Crafted from premium Grade 1 English Willow. Engineered for professional power hitters, featuring an optimized sweet spot, thick edges, and a lightweight balanced pickup.',
    specs: {
      'Wood Type': 'Grade 1 English Willow',
      'Weight': '2.7 - 2.9 lbs',
      'Handle': '9-piece Treble Spring Cane',
      'Edge Thickness': '40 mm',
      'Sweet Spot': 'Mid-to-Low'
    },
    price: 12999,
    mrp: 15999,
    discount: 18,
    stock: 25,
    sku: 'APX-BAT-PEW01',
    variants: {
      sizes: ['Short Handle', 'Long Handle'],
      handOrientations: ['Right Hand', 'Left Hand'],
      batWoodTypes: ['English Willow'],
      playingLevels: ['Professional'],
      ageGroups: ['Men']
    },
    images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=600'],
    ratings: { average: 4.8, count: 42 },
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isActive: true,
    category: 'cricket-bats'
  },
  {
    name: 'Apex Power Kashmir Willow Bat',
    brand: 'Apex Cricket',
    slug: 'apex-power-kashmir-willow-bat',
    description: 'High-quality selected Kashmir Willow bat, ideal for club league matches and training. Fitted with a secure wrap-around rubber sleeve and chevron grip.',
    specs: {
      'Wood Type': 'Selected Kashmir Willow',
      'Weight': '2.8 - 2.10 lbs',
      'Handle': 'Cane Handle',
      'Edge Thickness': '38 mm',
      'Sweet Spot': 'Mid-to-High'
    },
    price: 4999,
    mrp: 5999,
    discount: 16,
    stock: 40,
    sku: 'APX-BAT-PKW02',
    variants: {
      sizes: ['Short Handle', 'Size 6'],
      handOrientations: ['Right Hand', 'Left Hand'],
      batWoodTypes: ['Kashmir Willow'],
      playingLevels: ['Intermediate'],
      ageGroups: ['Men', 'Junior']
    },
    images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600'],
    ratings: { average: 4.5, count: 28 },
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    isActive: true,
    category: 'cricket-bats'
  },
  {
    name: 'Junior Strike Cricket Bat',
    brand: 'Apex Cricket',
    slug: 'junior-strike-cricket-bat',
    description: 'Lightweight cricket bat designed specifically for young players. Provides comfortable pickup, sturdy profile, and robust play.',
    specs: {
      'Wood Type': 'Kashmir Willow',
      'Weight': '2.2 lbs',
      'Handle': 'Standard cane'
    },
    price: 1899,
    mrp: 2499,
    discount: 24,
    stock: 35,
    sku: 'APX-BAT-JS03',
    variants: {
      sizes: ['Size 5', 'Size 4'],
      handOrientations: ['Right Hand', 'Left Hand'],
      batWoodTypes: ['Kashmir Willow'],
      playingLevels: ['Beginner'],
      ageGroups: ['Junior', 'Kids']
    },
    images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=600'],
    ratings: { average: 4.2, count: 15 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isActive: true,
    category: 'cricket-bats'
  },
  {
    name: 'Tennis Ball Power Bat',
    brand: 'Apex Cricket',
    slug: 'tennis-ball-power-bat',
    description: 'Special grade bat crafted for heavy tennis ball cricket. Comes with extra thick shoulder and curved blade for high performance.',
    specs: {
      'Wood Type': 'Hardwood Poplar',
      'Weight': '2.2 lbs',
      'Handle': 'Full cane'
    },
    price: 999,
    mrp: 1299,
    discount: 23,
    stock: 50,
    sku: 'APX-BAT-TB04',
    variants: {
      sizes: ['Short Handle', 'Size 5'],
      handOrientations: ['Right Hand', 'Left Hand'],
      batWoodTypes: ['Poplar Wood'],
      playingLevels: ['Beginner'],
      ageGroups: ['Men', 'Kids']
    },
    images: ['https://images.unsplash.com/photo-1540747737956-37872404a82f?q=80&w=600'],
    ratings: { average: 4.0, count: 20 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'cricket-bats'
  },
  {
    name: 'Leather Match Cricket Ball Pack of 6',
    brand: 'Apex Cricket',
    slug: 'leather-match-cricket-ball-pack-of-6',
    description: 'Premium four-piece alum-tanned leather balls with a high-density cork core. Hand-stitched for optimal swing, shape retention, and long life in 40+ over matches.',
    specs: {
      'Material': 'Alum-tanned English Leather',
      'Core': 'Pounded High-Density Cork',
      'Stitching': '80-84 stitches, Hand-Sewn',
      'Weight': '156 grams (5.5 oz)'
    },
    price: 1499,
    mrp: 1999,
    discount: 25,
    stock: 30,
    sku: 'APX-BAL-LMP05',
    variants: {
      colors: ['Red', 'Pink', 'White'],
      ballTypes: ['Leather ball'],
      playingLevels: ['Professional'],
      ageGroups: ['Men']
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
    name: 'Red Leather Cricket Ball',
    brand: 'Apex Cricket',
    slug: 'red-leather-cricket-ball',
    description: 'High-quality leather ball for club practice matches and training. Waterproof coating and sturdy core.',
    specs: {
      'Material': 'Leather',
      'Core': 'Cork',
      'Weight': '156g'
    },
    price: 349,
    mrp: 499,
    discount: 30,
    stock: 100,
    sku: 'APX-BAL-RLB06',
    variants: {
      colors: ['Red'],
      ballTypes: ['Leather ball'],
      playingLevels: ['Intermediate'],
      ageGroups: ['Men', 'Junior']
    },
    images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600'],
    ratings: { average: 4.3, count: 18 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isActive: true,
    category: 'cricket-balls'
  },
  {
    name: 'Tennis Cricket Ball Pack of 12',
    brand: 'Apex Cricket',
    slug: 'tennis-cricket-ball-pack-of-12',
    description: 'Pressurized, heavy-weight tennis balls optimized for outdoor street cricket play. Provides robust bounce and thick felt.',
    specs: {
      'Material': 'High-felt woven rubber',
      'Color': 'Fluorescent Yellow',
      'Pack Size': '12 Balls'
    },
    price: 599,
    mrp: 799,
    discount: 25,
    stock: 80,
    sku: 'APX-BAL-TCB07',
    variants: {
      colors: ['Yellow', 'Red'],
      ballTypes: ['Tennis ball'],
      playingLevels: ['Beginner', 'Intermediate'],
      ageGroups: ['Men', 'Women', 'Kids', 'Junior']
    },
    images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600'],
    ratings: { average: 4.1, count: 14 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'cricket-balls'
  },
  {
    name: 'Pro Grip Batting Gloves',
    brand: 'Apex Cricket',
    slug: 'pro-grip-batting-gloves',
    description: 'Professional batting gloves with high-density foam finger rolls and leather palm for maximum grip and shock absorption.',
    specs: {
      'Material': 'Sheepskin leather palm',
      'Protection': 'Dual density foam',
      'Wrist': 'Elasticated wrap'
    },
    price: 1799,
    mrp: 2199,
    discount: 18,
    stock: 45,
    sku: 'APX-GLV-PGB08',
    variants: {
      sizes: ['M', 'L'],
      handOrientations: ['Right Hand', 'Left Hand'],
      playingLevels: ['Professional'],
      ageGroups: ['Men']
    },
    images: ['https://images.unsplash.com/photo-1588615419954-bfad0c5f2122?q=80&w=600'],
    ratings: { average: 4.7, count: 21 },
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'batting-gloves'
  },
  {
    name: 'Junior Batting Gloves',
    brand: 'Apex Cricket',
    slug: 'junior-batting-gloves',
    description: 'Ergonomic protective gloves for junior cricket. Breathable mesh panels and comfortable foam lining.',
    specs: {
      'Material': 'Synthetic palm',
      'Protection': 'Standard density foam'
    },
    price: 999,
    mrp: 1299,
    discount: 23,
    stock: 35,
    sku: 'APX-GLV-JBG09',
    variants: {
      sizes: ['S', 'M'],
      handOrientations: ['Right Hand', 'Left Hand'],
      playingLevels: ['Beginner', 'Intermediate'],
      ageGroups: ['Junior', 'Kids']
    },
    images: ['https://images.unsplash.com/photo-1588615419954-bfad0c5f2122?q=80&w=600'],
    ratings: { average: 4.4, count: 12 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isActive: true,
    category: 'batting-gloves'
  },
  {
    name: 'Wicket Keeping Gloves Pro',
    brand: 'Apex Cricket',
    slug: 'wicket-keeping-gloves-pro',
    description: 'Premium keeping gloves featuring octopus-style grip rubber palm and padded cuffs for exceptional catching and thumb protection.',
    specs: {
      'Palm': 'Octopus rubber grip',
      'Cuff': 'Padded leather',
      'Finger Protection': 'Fibre inserts'
    },
    price: 2499,
    mrp: 2999,
    discount: 16,
    stock: 20,
    sku: 'APX-GLV-WKP10',
    variants: {
      sizes: ['M', 'L'],
      handOrientations: ['Right Hand', 'Left Hand'],
      playingLevels: ['Professional'],
      ageGroups: ['Men']
    },
    images: ['https://images.unsplash.com/photo-1606902960316-353ebd6dab78?q=80&w=600'],
    ratings: { average: 4.8, count: 19 },
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'wicket-keeping-gloves'
  },
  {
    name: 'Pro Shield Batting Pads',
    brand: 'Apex Cricket',
    slug: 'pro-shield-batting-pads',
    description: 'Traditional cane-construction pads featuring premium polyurethane face, dynamic knee rolls, and extra thick foam wing inserts.',
    specs: {
      'Face Material': 'Premium PU',
      'Structure': 'Cane rods protection',
      'Straps': 'Triple Velcro strap system'
    },
    price: 2999,
    mrp: 3499,
    discount: 14,
    stock: 30,
    sku: 'APX-PAD-PSB11',
    variants: {
      sizes: ['M', 'L'],
      handOrientations: ['Right Hand', 'Left Hand'],
      playingLevels: ['Professional'],
      ageGroups: ['Men']
    },
    images: ['https://images.unsplash.com/photo-1540747737956-37872404a82f?q=80&w=600'],
    ratings: { average: 4.8, count: 25 },
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'batting-pads'
  },
  {
    name: 'Junior Cricket Pads',
    brand: 'Apex Cricket',
    slug: 'junior-cricket-pads',
    description: 'Lightweight shin guards for youth and school cricket players. Soft foam lining provides comfortable shield.',
    specs: {
      'Material': 'PVC outer face',
      'Straps': 'Double Velcro strap'
    },
    price: 1599,
    mrp: 1999,
    discount: 20,
    stock: 40,
    sku: 'APX-PAD-JCP12',
    variants: {
      sizes: ['S', 'M'],
      handOrientations: ['Right Hand', 'Left Hand'],
      playingLevels: ['Beginner', 'Intermediate'],
      ageGroups: ['Junior', 'Kids']
    },
    images: ['https://images.unsplash.com/photo-1540747737956-37872404a82f?q=80&w=600'],
    ratings: { average: 4.3, count: 16 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isActive: true,
    category: 'batting-pads'
  },
  {
    name: 'Lightweight Wicket Keeping Pads',
    brand: 'Apex Cricket',
    slug: 'lightweight-wicket-keeping-pads',
    description: 'Specifically engineered low-profile keeping pads. Promotes fast footwork and provides compact protective barrier.',
    specs: {
      'Design': 'Compact low-profile',
      'Weight': 'Lightweight foam cores'
    },
    price: 2199,
    mrp: 2599,
    discount: 15,
    stock: 25,
    sku: 'APX-PAD-LKP13',
    variants: {
      sizes: ['M', 'L'],
      handOrientations: ['Right Hand', 'Left Hand'],
      playingLevels: ['Intermediate', 'Professional'],
      ageGroups: ['Men']
    },
    images: ['https://images.unsplash.com/photo-1540747737956-37872404a82f?q=80&w=600'],
    ratings: { average: 4.5, count: 10 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'batting-pads'
  },
  {
    name: 'Steel Grill Cricket Helmet',
    brand: 'Apex Cricket',
    slug: 'steel-grill-cricket-helmet',
    description: 'High-impact ABS outer shell cricket helmet with a fully adjustable carbon steel visor. Internal EPS liner absorbs shock.',
    specs: {
      'Outer Shell': 'High-Impact ABS',
      'Visor': 'Carbon steel grill',
      'Inner Padding': 'Dual-density foam'
    },
    price: 2499,
    mrp: 2999,
    discount: 16,
    stock: 30,
    sku: 'APX-HLM-SGH14',
    variants: {
      sizes: ['M', 'L'],
      playingLevels: ['Intermediate', 'Professional'],
      ageGroups: ['Men']
    },
    images: ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600'],
    ratings: { average: 4.7, count: 22 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'helmets'
  },
  {
    name: 'Junior Safety Cricket Helmet',
    brand: 'Apex Cricket',
    slug: 'junior-safety-cricket-helmet',
    description: 'Impact certified helmet designed for youth players. Features sweat-wicking padding and dial adjustment fit.',
    specs: {
      'Visor': 'Steel grill',
      'Shell': 'ABS shell'
    },
    price: 1799,
    mrp: 2199,
    discount: 18,
    stock: 35,
    sku: 'APX-HLM-JSH15',
    variants: {
      sizes: ['S', 'M'],
      playingLevels: ['Beginner', 'Intermediate'],
      ageGroups: ['Junior', 'Kids']
    },
    images: ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600'],
    ratings: { average: 4.5, count: 14 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isActive: true,
    category: 'helmets'
  },
  {
    name: 'Spike Cricket Shoes',
    brand: 'Apex Cricket',
    slug: 'spike-cricket-shoes',
    description: 'Professional metal spike shoes designed for match play. Offers superior turf traction for fast bowling and running.',
    specs: {
      'Outsole': 'Steel spikes plate',
      'Midsole': 'Cushioned EVA foam',
      'Upper': 'Synthetic leather + mesh'
    },
    price: 3499,
    mrp: 3999,
    discount: 12,
    stock: 50,
    sku: 'APX-SHS-SCS16',
    variants: {
      sizes: ['US 8', 'US 9', 'US 10', 'US 11'],
      playingLevels: ['Professional'],
      ageGroups: ['Men']
    },
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600'],
    ratings: { average: 4.8, count: 35 },
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'cricket-shoes'
  },
  {
    name: 'Rubber Sole Cricket Shoes',
    brand: 'Apex Cricket',
    slug: 'rubber-sole-cricket-shoes',
    description: 'Versatile rubber studs shoes ideal for indoor, net training, and synthetic turf pitches. Features breathable mesh upper.',
    specs: {
      'Outsole': 'Multi-stud rubber sole',
      'Midsole': 'Comfort cushion EVA'
    },
    price: 2199,
    mrp: 2599,
    discount: 15,
    stock: 60,
    sku: 'APX-SHS-RCS17',
    variants: {
      sizes: ['US 7', 'US 8', 'US 9', 'US 10'],
      playingLevels: ['Beginner', 'Intermediate'],
      ageGroups: ['Men', 'Women']
    },
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600'],
    ratings: { average: 4.4, count: 28 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isActive: true,
    category: 'cricket-shoes'
  },
  {
    name: 'Junior Cricket Shoes',
    brand: 'Apex Cricket',
    slug: 'junior-cricket-shoes',
    description: 'Comfortable sports shoes with rubber traction grips for junior cricketers. Padded ankle collar support.',
    specs: {
      'Sole': 'Traction rubber studs',
      'Fit': 'Lace-up closure'
    },
    price: 1499,
    mrp: 1799,
    discount: 16,
    stock: 40,
    sku: 'APX-SHS-JCS18',
    variants: {
      sizes: ['US 4', 'US 5', 'US 6'],
      playingLevels: ['Beginner'],
      ageGroups: ['Junior', 'Kids']
    },
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600'],
    ratings: { average: 4.3, count: 15 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'cricket-shoes'
  },
  {
    name: 'Large Cricket Kit Bag with Wheels',
    brand: 'Apex Cricket',
    slug: 'large-cricket-kit-bag-with-wheels',
    description: 'Heavy duty wheelie bag with massive storage compartment. Contains 3 external bat cavities and integrated wheels.',
    specs: {
      'Material': '1680D Cordura fabric',
      'Wheels': 'Tractor heavy duty wheels',
      'Size': '95 x 40 x 40 cm'
    },
    price: 3999,
    mrp: 4999,
    discount: 20,
    stock: 30,
    sku: 'APX-BAG-LKW19',
    variants: {
      colors: ['Black/Orange', 'Blue/Navy'],
      ageGroups: ['Men']
    },
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600'],
    ratings: { average: 4.8, count: 18 },
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'kit-bags'
  },
  {
    name: 'Compact Cricket Duffle Bag',
    brand: 'Apex Cricket',
    slug: 'compact-cricket-duffle-bag',
    description: 'Double strap shoulder bag with specialized internal bat sleeve. Perfect for training and carry-on use.',
    specs: {
      'Style': 'Duffle backpack',
      'Pockets': '2 side accessories pockets'
    },
    price: 1999,
    mrp: 2499,
    discount: 20,
    stock: 45,
    sku: 'APX-BAG-CCB20',
    variants: {
      colors: ['Grey/Blue', 'Black/Silver'],
      ageGroups: ['Men', 'Women', 'Junior']
    },
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600'],
    ratings: { average: 4.5, count: 11 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'kit-bags'
  },
  {
    name: 'Beginner Cricket Kit',
    brand: 'Apex Cricket',
    slug: 'beginner-cricket-kit',
    description: 'An all-in-one starter bundle for kids and juniors. Contains Kashmir Willow bat, batting pads, batting gloves, helmet, and shoulder kit bag.',
    specs: {
      'Target Age': '9 - 13 years',
      'Bat Wood': 'Kashmir Willow',
      'Includes': 'Bat, Pads, Gloves, Helmet, Bag'
    },
    price: 6999,
    mrp: 7999,
    discount: 12,
    stock: 20,
    sku: 'APX-KIT-BCK21',
    variants: {
      sizes: ['Size 6', 'Size 5'],
      handOrientations: ['Right Hand', 'Left Hand'],
      playingLevels: ['Beginner'],
      ageGroups: ['Junior', 'Kids']
    },
    images: ['https://images.unsplash.com/photo-1540747737956-37872404a82f?q=80&w=600'],
    ratings: { average: 4.6, count: 14 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'complete-cricket-kits'
  },
  {
    name: 'Junior Complete Cricket Kit',
    brand: 'Apex Cricket',
    slug: 'junior-complete-cricket-kit',
    description: 'Fully configured setup for academy trainees. Features light bats and custom molded knee pads.',
    specs: {
      'Includes': 'Bat, Pads, Gloves, Guards, Duffle bag',
      'Bat Size': 'Size 5 Kashmir Willow'
    },
    price: 5499,
    mrp: 6499,
    discount: 15,
    stock: 25,
    sku: 'APX-KIT-JCK22',
    variants: {
      sizes: ['Size 5', 'Size 4'],
      handOrientations: ['Right Hand', 'Left Hand'],
      playingLevels: ['Beginner', 'Intermediate'],
      ageGroups: ['Junior', 'Kids']
    },
    images: ['https://images.unsplash.com/photo-1540747737956-37872404a82f?q=80&w=600'],
    ratings: { average: 4.4, count: 10 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isActive: true,
    category: 'complete-cricket-kits'
  },
  {
    name: 'Professional Cricket Kit',
    brand: 'Apex Cricket',
    slug: 'professional-cricket-kit',
    description: 'Complete elite gear collection. Includes grade 1 English Willow bat, professional leather pads, carbon steel helmet, and wheelie bag.',
    specs: {
      'Bat wood': 'Grade 1 English Willow',
      'Protection': 'Rated for 140km/h+',
      'Storage': 'Large wheelie bag'
    },
    price: 14999,
    mrp: 17999,
    discount: 16,
    stock: 15,
    sku: 'APX-KIT-PCK23',
    variants: {
      sizes: ['Short Handle', 'Long Handle'],
      handOrientations: ['Right Hand', 'Left Hand'],
      playingLevels: ['Professional'],
      ageGroups: ['Men']
    },
    images: ['https://images.unsplash.com/photo-1540747737956-37872404a82f?q=80&w=600'],
    ratings: { average: 4.9, count: 30 },
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'complete-cricket-kits'
  },
  {
    name: 'Wooden Cricket Stumps Set',
    brand: 'Apex Cricket',
    slug: 'wooden-cricket-stumps-set',
    description: 'Traditional solid wooden stumps set. Lathed from seasoned hardwood, containing 6 stumps and 4 bails.',
    specs: {
      'Material': 'Seasoned Ash Wood',
      'Includes': '6 stumps, 4 bails, 1 carry wrap'
    },
    price: 799,
    mrp: 999,
    discount: 20,
    stock: 50,
    sku: 'APX-ACC-WCS24',
    variants: {
      playingLevels: ['Beginner', 'Intermediate', 'Professional']
    },
    images: ['https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=600'],
    ratings: { average: 4.5, count: 27 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'accessories'
  },
  {
    name: 'Bat Grip Pack of 3',
    brand: 'Apex Cricket',
    slug: 'bat-grip-pack-of-3',
    description: 'High-quality chevron pattern rubber bat grips. Delivers shock resistance and slips-free grip feel.',
    specs: {
      'Material': 'Synthetic rubber',
      'Pack Qty': '3 grips'
    },
    price: 299,
    mrp: 399,
    discount: 25,
    stock: 100,
    sku: 'APX-ACC-BGP25',
    variants: {
      colors: ['Red', 'White', 'Blue', 'Yellow']
    },
    images: ['https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=600'],
    ratings: { average: 4.3, count: 32 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'accessories'
  },
  {
    name: 'Abdominal Guard',
    brand: 'Apex Cricket',
    slug: 'abdominal-guard',
    description: 'Ergonomic high protection cup featuring padded edges for comfortable groin shield during batting.',
    specs: {
      'Shell': 'High-density plastic',
      'Edges': 'Silicone padded border'
    },
    price: 399,
    mrp: 499,
    discount: 20,
    stock: 150,
    sku: 'APX-ACC-ABG26',
    variants: {
      sizes: ['Youth', 'Adult'],
      playingLevels: ['Beginner', 'Intermediate', 'Professional'],
      ageGroups: ['Men', 'Junior']
    },
    images: ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600'],
    ratings: { average: 4.6, count: 18 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'accessories'
  },
  {
    name: 'Thigh Guard',
    brand: 'Apex Cricket',
    slug: 'thigh-guard',
    description: 'Pre-shaped ultra-lightweight foam dual thigh pad guards. Offers adjustable elastic bands.',
    specs: {
      'Material': 'EVA foam liner',
      'Straps': 'Elastic Velcro bands'
    },
    price: 699,
    mrp: 899,
    discount: 22,
    stock: 80,
    sku: 'APX-ACC-THG27',
    variants: {
      sizes: ['M', 'L'],
      handOrientations: ['Right Hand', 'Left Hand'],
      playingLevels: ['Intermediate', 'Professional'],
      ageGroups: ['Men']
    },
    images: ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600'],
    ratings: { average: 4.7, count: 24 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: 'accessories'
  },
  {
    name: 'Bat Cover',
    brand: 'Apex Cricket',
    slug: 'bat-cover',
    description: 'Padded nylon full length cover case. Protects willow from moisture and scratching.',
    specs: {
      'Material': 'Waterproof Nylon',
      'Strap': 'Adjustable carry belt'
    },
    price: 499,
    mrp: 599,
    discount: 16,
    stock: 120,
    sku: 'APX-ACC-BTC28',
    variants: {
      colors: ['Black', 'Blue'],
      ageGroups: ['Men', 'Women', 'Kids', 'Junior']
    },
    images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=600'],
    ratings: { average: 4.4, count: 15 },
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

    // Protect the seed route so it cannot be publicly reused.
    // Unauthenticated access is permitted only for first-run bootstrap
    // (when no admin account exists yet). Once an admin exists, or for any
    // destructive ?force=true re-seed, a valid admin session is required.
    const adminExistsAlready = await User.exists({ role: 'admin' });
    if (adminExistsAlready || force) {
      if (!verifyAdmin(request)) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized. Seeding is restricted to administrators.' },
          { status: 401 }
        );
      }
    }

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
          link: '/shop?category=complete-cricket-kits',
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
