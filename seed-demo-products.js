/*
 * seed-demo-products.js
 * ---------------------------------------------------------------------------
 * Ensures every EXISTING category has at least two ACTIVE products by adding
 * clearly-labelled "Demo" products. It NEVER creates categories and NEVER
 * modifies/deletes existing products.
 *
 *   Rule per category:
 *     >= 2 active products  -> skip (do nothing)
 *      1 active product     -> add 1 demo product
 *      0 active products    -> add 2 demo products
 *
 * All generated products:
 *   - have "(Demo)" in the name AND "Demo product" in the description
 *   - use SKUs prefixed "ZAS-DEMO-" and slugs ending in "-demo"
 *   - are isActive:true with positive stock, unique slug + SKU
 *   - use the project's existing image structure (image URLs in the
 *     `images` array; empty array falls back to the app's <InlineSVG/>)
 *
 * Usage:
 *   node seed-demo-products.js            # DRY RUN – reports the plan, writes nothing
 *   node seed-demo-products.js --apply    # actually inserts the demo products
 *
 * Idempotent: re-running after a successful apply finds >= 2 active products
 * per category and inserts nothing. Any slug/SKU that already exists is skipped.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const APPLY = process.argv.includes('--apply');

// --- Read MONGODB_URI from .env (same parsing as check-db.js / seed-db.js) ---
const envPath = path.join(__dirname, '.env');
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (err) {
  console.error('Failed to read .env file:', err.message);
  process.exit(1);
}
let mongodbUri = '';
for (const line of envContent.split('\n')) {
  if (line.trim().startsWith('MONGODB_URI=')) {
    mongodbUri = line.trim().split('MONGODB_URI=')[1];
    break;
  }
}
mongodbUri = (mongodbUri || '').split('#')[0].trim();
if (!mongodbUri) {
  console.error('MONGODB_URI not found in .env');
  process.exit(1);
}

// --- Schemas (mirror src/models/*, pinned to real collections) ---------------
const CategorySchema = new mongoose.Schema({
  name: String, slug: String, image: String, displayOrder: Number,
  isActive: Boolean, createdAt: Date,
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
    sizes: [String], colors: [String], handOrientations: [String],
    batWoodTypes: [String], ballTypes: [String], playingLevels: [String],
    ageGroups: [String],
  },
  images: [String],
  ratings: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  category: { type: String, required: true },
  subcategory: { type: String },
  createdAt: { type: Date, default: Date.now },
}, { collection: 'products' });

// --- Verified, working image URLs (all return HTTP 200) ----------------------
const IMG = {
  GLOVES:     'https://images.unsplash.com/photo-1588615419954-bfad0c5f2122?q=80&w=600',
  PADS:       'https://images.unsplash.com/photo-1540747737956-37872404a82f?q=80&w=600',
  HELMET:     'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600',
  SHOES:      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600',
  BAGS:       'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600',
  CLOTHING:   'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=600',
  FOOTBALL:   'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600',
  BADMINTON:  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600',
  DUMBBELL:   'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?q=80&w=600',
  YOGAMAT:    'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?q=80&w=600',
  RESISTBAND: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=600',
  NONE:       '', // -> app renders <InlineSVG type={category} /> fallback
};

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

// --- Demo product templates, grouped by category slug ------------------------
// Up to 2 per category; the script only uses as many as a category needs.
const TEMPLATES = {
  // ---- cricket categories currently holding exactly ONE product (need +1) ----
  'batting-gloves': [
    { name: 'Zassports Pro-Tek Batting Gloves (Demo)', sku: 'ZAS-DEMO-BGL1', price: 1349, mrp: 1799, stock: 40, image: IMG.GLOVES,
      description: 'Demo product. Dual-density foam batting gloves with a sheepskin leather palm, sweat-wicking towel thumb and pre-curved finger rolls for a natural grip.',
      specs: { 'Palm': 'Genuine sheepskin leather', 'Protection': 'High-density foam rolls', 'Closure': 'Adjustable velcro cuff' },
      variants: { sizes: ['S', 'M', 'L'], handOrientations: ['Right Hand', 'Left Hand'], playingLevels: ['Intermediate', 'Professional'], ageGroups: ['Men', 'Junior'] } },
  ],
  'batting-pads': [
    { name: 'Zassports Elite Batting Pads (Demo)', sku: 'ZAS-DEMO-BPD1', price: 1999, mrp: 2599, stock: 30, image: IMG.PADS,
      description: 'Demo product. Lightweight cane-rod batting pads with moulded knee cushions and triple bolster straps for secure, comfortable front-leg protection.',
      specs: { 'Facing': 'Polyurethane high-impact face', 'Padding': 'Moulded shock-absorbing foam', 'Straps': '3 velcro bolster straps' },
      variants: { sizes: ['Boys', 'Youth', 'Mens'], handOrientations: ['Right Hand', 'Left Hand'], playingLevels: ['Intermediate', 'Professional'], ageGroups: ['Men', 'Junior'] } },
  ],
  'cricket-helmets': [
    { name: 'Zassports Titan Cricket Helmet (Demo)', sku: 'ZAS-DEMO-HLM1', price: 1699, mrp: 2299, stock: 35, image: IMG.HELMET,
      description: 'Demo product. Impact-tested cricket helmet with a rigid ABS shell, high-tensile steel grille and breathable sweat-wicking inner padding.',
      specs: { 'Shell': 'ABS high-impact', 'Grille': 'Carbon steel visor', 'Padding': 'Moisture-wicking foam' },
      variants: { sizes: ['S', 'M', 'L'], playingLevels: ['Beginner', 'Intermediate', 'Professional'], ageGroups: ['Men', 'Junior'] } },
  ],
  'cricket-bags': [
    { name: 'Zassports Team Wheelie Cricket Bag (Demo)', sku: 'ZAS-DEMO-CBG1', price: 2199, mrp: 2999, stock: 25, image: IMG.BAGS,
      description: 'Demo product. Heavy-duty wheelie cricket bag with a full-length main compartment, dedicated bat sleeves and rugged inline wheels for easy transport.',
      specs: { 'Material': '1680D Cordura fabric', 'Wheels': 'Heavy-duty inline wheels', 'Size': '92 x 38 x 38 cm' },
      variants: { colors: ['Black/Red', 'Navy/Grey'], ageGroups: ['Men', 'Junior'] } },
  ],
  'protective-gear': [
    { name: 'Zassports Abdominal Guard (Demo)', sku: 'ZAS-DEMO-PRG1', price: 349, mrp: 599, stock: 60, image: IMG.PADS,
      description: 'Demo product. Contoured impact-resistant abdominal guard (box) with smooth moulded edges for safe, comfortable lower-body protection.',
      specs: { 'Material': 'High-impact moulded polymer', 'Fit': 'Ergonomic contoured shape', 'Use': 'Batting & wicket-keeping' },
      variants: { sizes: ['Youth', 'Adult'], playingLevels: ['Beginner', 'Intermediate', 'Professional'], ageGroups: ['Men', 'Junior'] } },
  ],
  'training-equipment': [
    { name: 'Zassports Agility Marker Cones – Set of 20 (Demo)', sku: 'ZAS-DEMO-TRN1', price: 399, mrp: 699, stock: 50, image: IMG.CLOTHING,
      description: 'Demo product. Set of 20 flexible PVC marker cones with a carry stand — ideal for fielding drills, footwork ladders and net-practice layouts.',
      specs: { 'Material': 'Flexible PVC', 'Quantity': '20 cones + stand', 'Height': '2 inch (5 cm)' },
      variants: { colors: ['Multicolor', 'Orange'] } },
  ],
  'accessories': [
    { name: 'Zassports Anti-Scuff Bat Protection Sheet (Demo)', sku: 'ZAS-DEMO-ACC1', price: 149, mrp: 249, stock: 80, image: IMG.CLOTHING,
      description: 'Demo product. Transparent fibre anti-scuff sheet that shields the bat face from surface cracks and moisture, extending willow life.',
      specs: { 'Material': 'Transparent fibre film', 'Coverage': 'Full bat face', 'Finish': 'Self-adhesive' },
      variants: { colors: ['Transparent'] } },
  ],

  // ---- categories currently EMPTY (need +2) ---------------------------------
  'cricket-gloves': [
    { name: 'Zassports Wicket-Keeping Gloves (Demo)', sku: 'ZAS-DEMO-CGL1', price: 1099, mrp: 1499, stock: 30, image: IMG.GLOVES,
      description: 'Demo product. Wicket-keeping gloves with a super-soft catching cup, reinforced webbing and cushioned finger protection for confident takes.',
      specs: { 'Palm': 'Pittard leather catching cup', 'Webbing': 'Reinforced index-thumb web', 'Cuff': 'Elastic towelling cuff' },
      variants: { sizes: ['Youth', 'Mens'], handOrientations: ['Right Hand', 'Left Hand'], playingLevels: ['Intermediate', 'Professional'], ageGroups: ['Men', 'Junior'] } },
    { name: 'Zassports Inner Cotton Gloves (Demo)', sku: 'ZAS-DEMO-CGL2', price: 299, mrp: 449, stock: 50, image: IMG.GLOVES,
      description: 'Demo product. Full-length cotton inner gloves with sponge padding that wick sweat and add comfort under batting or keeping gloves.',
      specs: { 'Material': 'Cotton with sponge lining', 'Fit': 'Full-finger', 'Wash': 'Machine washable' },
      variants: { sizes: ['S', 'M', 'L'], ageGroups: ['Men', 'Women', 'Junior'] } },
  ],
  'cricket-pads': [
    { name: 'Zassports Wicket-Keeping Pads (Demo)', sku: 'ZAS-DEMO-CPD1', price: 1499, mrp: 1999, stock: 25, image: IMG.PADS,
      description: 'Demo product. Lightweight wicket-keeping pads with low-bounce foam, contoured knee roll and quick-release straps for agile movement behind the stumps.',
      specs: { 'Facing': 'PVC low-bounce face', 'Padding': 'High-density foam', 'Straps': '3 quick-release straps' },
      variants: { sizes: ['Youth', 'Mens'], handOrientations: ['Right Hand', 'Left Hand'], playingLevels: ['Intermediate', 'Professional'], ageGroups: ['Men', 'Junior'] } },
    { name: 'Zassports Junior Cricket Pads (Demo)', sku: 'ZAS-DEMO-CPD2', price: 899, mrp: 1299, stock: 40, image: IMG.PADS,
      description: 'Demo product. Junior-sized batting pads with soft bolster edges and a lightweight build to help young cricketers play confidently and safely.',
      specs: { 'Facing': 'Lightweight PU face', 'Padding': 'Cushioned foam bolsters', 'Straps': '2 velcro straps' },
      variants: { sizes: ['Boys', 'Youth'], handOrientations: ['Right Hand', 'Left Hand'], playingLevels: ['Beginner'], ageGroups: ['Kids', 'Junior'] } },
  ],
  'running-shoes': [
    { name: 'Zassports Velocity Running Shoes (Demo)', sku: 'ZAS-DEMO-RUN1', price: 1999, mrp: 2999, stock: 45, image: IMG.SHOES,
      description: 'Demo product. Lightweight road-running shoes with a breathable knit upper, responsive EVA cushioning and a durable high-grip outsole.',
      specs: { 'Upper': 'Engineered breathable knit', 'Midsole': 'Responsive EVA foam', 'Outsole': 'High-abrasion rubber' },
      variants: { sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'], colors: ['Black', 'Blue'], ageGroups: ['Men', 'Women'] } },
    { name: 'Zassports Marathon Lite Running Shoes (Demo)', sku: 'ZAS-DEMO-RUN2', price: 2499, mrp: 3499, stock: 35, image: IMG.SHOES,
      description: 'Demo product. Ultra-light distance-running shoes with a plush heel counter and rocker sole geometry that keeps long-run strides smooth and efficient.',
      specs: { 'Upper': 'Ripstop mesh', 'Midsole': 'Dual-density cushioning', 'Weight': '235 g (US 9)' },
      variants: { sizes: ['US 7', 'US 8', 'US 9', 'US 10'], colors: ['Grey', 'Red'], ageGroups: ['Men', 'Women'] } },
  ],
  'dry-fit-t-shirts': [
    { name: 'Zassports Dry-Fit Training T-Shirt (Demo)', sku: 'ZAS-DEMO-DFT1', price: 499, mrp: 799, stock: 60, image: IMG.CLOTHING,
      description: 'Demo product. Quick-dry polyester training tee with moisture-wicking mesh panels and a regular athletic fit for all-day comfort.',
      specs: { 'Material': '100% quick-dry polyester', 'Fit': 'Regular athletic fit', 'Feature': 'Moisture-wicking mesh' },
      variants: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Blue', 'White'], ageGroups: ['Men', 'Women'] } },
    { name: 'Zassports Active Round-Neck Dry-Fit Tee (Demo)', sku: 'ZAS-DEMO-DFT2', price: 549, mrp: 899, stock: 55, image: IMG.CLOTHING,
      description: 'Demo product. Breathable round-neck dry-fit t-shirt with flatlock seams and a lightweight stretch weave for unrestricted movement.',
      specs: { 'Material': 'Poly-spandex stretch weave', 'Seams': 'Flatlock stitched', 'Neck': 'Ribbed round neck' },
      variants: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Navy Blue', 'Grey'], ageGroups: ['Men', 'Women'] } },
  ],
  'track-pants': [
    { name: 'Zassports Slim-Fit Track Pants (Demo)', sku: 'ZAS-DEMO-TRP1', price: 799, mrp: 1199, stock: 50, image: IMG.CLOTHING,
      description: 'Demo product. Slim-fit stretch track pants with a drawcord waist, zip side pockets and tapered ankles for training and casual wear.',
      specs: { 'Material': 'Polyester-spandex blend', 'Pockets': '2 zip side pockets', 'Waist': 'Elastic drawcord' },
      variants: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Navy Blue'], ageGroups: ['Men'] } },
    { name: 'Zassports Zipper Jogger Track Pants (Demo)', sku: 'ZAS-DEMO-TRP2', price: 899, mrp: 1399, stock: 45, image: IMG.CLOTHING,
      description: 'Demo product. Jogger-style track pants with ribbed ankle cuffs, mesh side vents and secure zip pockets for gym and running sessions.',
      specs: { 'Material': 'Brushed poly fleece', 'Cuff': 'Ribbed ankle cuffs', 'Vents': 'Mesh side aeration' },
      variants: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Grey', 'Black'], ageGroups: ['Men'] } },
  ],
  'sports-socks': [
    { name: 'Zassports Cushioned Sports Socks – Pack of 3 (Demo)', sku: 'ZAS-DEMO-SOK1', price: 349, mrp: 599, stock: 70, image: IMG.CLOTHING,
      description: 'Demo product. Pack of 3 cushioned crew sports socks with arch-support bands and breathable mesh tops to keep feet dry through every match.',
      specs: { 'Material': 'Combed cotton blend', 'Pack': '3 pairs', 'Feature': 'Cushioned sole + arch support' },
      variants: { sizes: ['Free Size'], colors: ['White', 'Black'], ageGroups: ['Men', 'Women'] } },
    { name: 'Zassports Ankle Sports Socks – Pack of 5 (Demo)', sku: 'ZAS-DEMO-SOK2', price: 449, mrp: 749, stock: 65, image: IMG.CLOTHING,
      description: 'Demo product. Pack of 5 low-cut ankle socks with elastic grip and moisture-wicking yarn — perfect for running, gym and training.',
      specs: { 'Material': 'Moisture-wicking cotton yarn', 'Pack': '5 pairs', 'Cut': 'Low ankle' },
      variants: { sizes: ['Free Size'], colors: ['White', 'Grey'], ageGroups: ['Men', 'Women'] } },
  ],
  'badminton-rackets': [
    { name: 'Zassports Carbon Pro Badminton Racket (Demo)', sku: 'ZAS-DEMO-BDR1', price: 1299, mrp: 1999, stock: 40, image: IMG.BADMINTON,
      description: 'Demo product. Full-carbon graphite badminton racket with an isometric head and stiff shaft for fast, accurate smashes. Includes a protective cover.',
      specs: { 'Frame': 'Full carbon graphite', 'Weight': '85 g (4U)', 'Balance': 'Head-light' },
      variants: { colors: ['Blue', 'Red'], playingLevels: ['Intermediate', 'Professional'] } },
    { name: 'Zassports Smash Lite Badminton Racket (Demo)', sku: 'ZAS-DEMO-BDR2', price: 799, mrp: 1299, stock: 50, image: IMG.BADMINTON,
      description: 'Demo product. Lightweight aluminium-alloy badminton racket with a pre-strung head — a durable, easy-to-play choice for beginners and casual games.',
      specs: { 'Frame': 'Aluminium alloy', 'Weight': '95 g', 'Grip': 'Cushioned PU grip' },
      variants: { colors: ['Green', 'Black'], playingLevels: ['Beginner', 'Intermediate'] } },
  ],
  'shuttlecocks': [
    { name: 'Zassports Nylon Shuttlecocks – Pack of 6 (Demo)', sku: 'ZAS-DEMO-SHC1', price: 399, mrp: 599, stock: 60, image: IMG.BADMINTON,
      description: 'Demo product. Pack of 6 durable nylon shuttlecocks with a cork-composite base and consistent flight — ideal for club practice and recreational play.',
      specs: { 'Skirt': 'High-durability nylon', 'Base': 'Cork-composite', 'Pack': '6 shuttles', 'Speed': 'Medium' },
      variants: { colors: ['White', 'Yellow'] } },
    { name: 'Zassports Feather Shuttlecocks – Pack of 10 (Demo)', sku: 'ZAS-DEMO-SHC2', price: 899, mrp: 1299, stock: 45, image: IMG.BADMINTON,
      description: 'Demo product. Tournament-grade natural feather shuttlecocks with a genuine cork base for a crisp hit and true, stable flight.',
      specs: { 'Feather': 'Natural goose feather', 'Base': 'Genuine cork', 'Pack': '10 shuttles (tube)', 'Speed': '77 / Medium' },
      variants: { colors: ['White'] } },
  ],
  'footballs': [
    { name: 'Zassports Match Football – Size 5 (Demo)', sku: 'ZAS-DEMO-FBL1', price: 999, mrp: 1499, stock: 40, image: IMG.FOOTBALL,
      description: 'Demo product. Size 5 match football with a machine-stitched TPU casing and butyl bladder for excellent air retention and true flight on grass or turf.',
      specs: { 'Size': 'Size 5', 'Casing': 'Machine-stitched TPU', 'Bladder': 'Butyl (best air retention)' },
      variants: { sizes: ['Size 5'], colors: ['White/Black', 'Green'] } },
    { name: 'Zassports Street Football – Size 4 (Demo)', sku: 'ZAS-DEMO-FBL2', price: 699, mrp: 999, stock: 50, image: IMG.FOOTBALL,
      description: 'Demo product. Rugged size 4 street football with an abrasion-resistant rubber surface built to take a beating on concrete, tarmac and hard courts.',
      specs: { 'Size': 'Size 4', 'Surface': 'Abrasion-resistant rubber', 'Use': 'Street / hard court' },
      variants: { sizes: ['Size 4'], colors: ['Orange', 'Blue'], ageGroups: ['Kids', 'Junior'] } },
  ],
  'football-shoes': [
    { name: 'Zassports Turf Football Shoes (Demo)', sku: 'ZAS-DEMO-FBS1', price: 1799, mrp: 2599, stock: 35, image: IMG.FOOTBALL,
      description: 'Demo product. Turf football shoes with a multi-stud rubber outsole and a soft synthetic upper for superb grip and ball feel on artificial grass.',
      specs: { 'Outsole': 'Multi-stud turf rubber', 'Upper': 'Soft synthetic', 'Lining': 'Cushioned insole' },
      variants: { sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'], colors: ['Black/Green', 'Blue'], ageGroups: ['Men'] } },
    { name: 'Zassports Firm-Ground Football Studs (Demo)', sku: 'ZAS-DEMO-FBS2', price: 2299, mrp: 3299, stock: 30, image: IMG.FOOTBALL,
      description: 'Demo product. Firm-ground football boots with conical studs and a textured strike zone for explosive traction and controlled shooting on natural grass.',
      specs: { 'Outsole': 'Firm-ground conical studs', 'Upper': 'Textured synthetic', 'Closure': 'Lace-up' },
      variants: { sizes: ['US 7', 'US 8', 'US 9', 'US 10'], colors: ['Red', 'White'], ageGroups: ['Men'] } },
  ],
  'yoga-mats': [
    { name: 'Zassports Anti-Slip Yoga Mat – 6mm (Demo)', sku: 'ZAS-DEMO-YOG1', price: 699, mrp: 1099, stock: 55, image: IMG.YOGAMAT,
      description: 'Demo product. Cushioned 6mm NBR yoga mat with a double-sided anti-slip texture and a carry strap — comfortable support for yoga, pilates and floor workouts.',
      specs: { 'Material': 'NBR foam', 'Thickness': '6 mm', 'Size': '183 x 61 cm', 'Includes': 'Carry strap' },
      variants: { colors: ['Purple', 'Blue', 'Green'] } },
    { name: 'Zassports Eco TPE Yoga Mat – 8mm (Demo)', sku: 'ZAS-DEMO-YOG2', price: 1099, mrp: 1599, stock: 40, image: IMG.YOGAMAT,
      description: 'Demo product. Extra-thick 8mm eco-friendly TPE yoga mat with alignment lines and a moisture-resistant closed-cell surface for extra joint comfort.',
      specs: { 'Material': 'Eco TPE (recyclable)', 'Thickness': '8 mm', 'Feature': 'Alignment lines', 'Grip': 'Textured non-slip' },
      variants: { colors: ['Teal', 'Grey'] } },
  ],
  'skipping-ropes': [
    { name: 'Zassports Speed Skipping Rope (Demo)', sku: 'ZAS-DEMO-SKR1', price: 249, mrp: 449, stock: 70, image: IMG.NONE,
      description: 'Demo product. Adjustable-length speed skipping rope with ball-bearing swivel handles and a tangle-free steel wire cable for fast cardio and crossfit.',
      specs: { 'Cable': 'PVC-coated steel wire', 'Handles': 'Ball-bearing swivel', 'Length': 'Adjustable up to 3 m' },
      variants: { colors: ['Black', 'Red'] } },
    { name: 'Zassports Weighted Jump Rope (Demo)', sku: 'ZAS-DEMO-SKR2', price: 399, mrp: 649, stock: 55, image: IMG.NONE,
      description: 'Demo product. Weighted jump rope with cushioned foam grips and a heavy braided cable that builds forearm strength and improves conditioning.',
      specs: { 'Cable': 'Weighted braided cable', 'Grips': 'Anti-slip foam', 'Weight': '0.5 kg total' },
      variants: { colors: ['Black'] } },
  ],
  'resistance-bands': [
    { name: 'Zassports Resistance Loop Bands – Set of 5 (Demo)', sku: 'ZAS-DEMO-RSB1', price: 499, mrp: 899, stock: 60, image: IMG.RESISTBAND,
      description: 'Demo product. Set of 5 colour-coded latex loop bands (X-light to X-heavy) with a mesh carry bag — great for mobility, strength and rehab training.',
      specs: { 'Material': 'Natural latex', 'Set': '5 resistance levels', 'Includes': 'Mesh carry bag' },
      variants: { colors: ['Multicolor'], playingLevels: ['Beginner', 'Intermediate', 'Professional'] } },
    { name: 'Zassports Tube Resistance Band with Handles (Demo)', sku: 'ZAS-DEMO-RSB2', price: 649, mrp: 999, stock: 45, image: IMG.RESISTBAND,
      description: 'Demo product. Heavy-duty tube resistance band with cushioned handles, a door anchor and ankle straps for full-body home-gym workouts.',
      specs: { 'Material': 'Reinforced rubber tube', 'Handles': 'Cushioned foam grips', 'Includes': 'Door anchor + ankle straps' },
      variants: { colors: ['Black/Blue'], playingLevels: ['Beginner', 'Intermediate'] } },
  ],
  'dumbbells': [
    { name: 'Zassports Hex Dumbbell 5KG – Pair (Demo)', sku: 'ZAS-DEMO-DMB1', price: 1299, mrp: 1899, stock: 40, image: IMG.DUMBBELL,
      description: 'Demo product. Pair of 5KG rubber-encased hex dumbbells with a knurled chrome handle — anti-roll heads protect floors and give a secure, comfortable grip.',
      specs: { 'Weight': '5 kg x 2 (pair)', 'Head': 'Rubber-encased hex', 'Handle': 'Knurled chrome' },
      variants: { sizes: ['5 kg (pair)'] } },
    { name: 'Zassports Adjustable Dumbbell Set (Demo)', sku: 'ZAS-DEMO-DMB2', price: 2999, mrp: 4499, stock: 25, image: IMG.DUMBBELL,
      description: 'Demo product. Adjustable dumbbell set with threaded steel bars, spinlock collars and stackable plates — scale weight up to 20kg per hand as you progress.',
      specs: { 'Max Weight': '20 kg per hand', 'Plates': 'Stackable cast-iron', 'Collars': 'Threaded spinlock' },
      variants: { sizes: ['Up to 20 kg / hand'] } },
  ],
  'gym-gloves': [
    { name: 'Zassports Pro-Grip Gym Gloves (Demo)', sku: 'ZAS-DEMO-GYG1', price: 549, mrp: 899, stock: 55, image: IMG.GLOVES,
      description: 'Demo product. Breathable gym gloves with silicone-printed palms and a padded grip that protect against calluses during weightlifting and cross-training.',
      specs: { 'Palm': 'Anti-slip silicone print', 'Back': 'Breathable mesh', 'Closure': 'Adjustable wrist velcro' },
      variants: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Grey'], ageGroups: ['Men', 'Women'] } },
    { name: 'Zassports Padded Weightlifting Gloves (Demo)', sku: 'ZAS-DEMO-GYG2', price: 749, mrp: 1199, stock: 40, image: IMG.GLOVES,
      description: 'Demo product. Weightlifting gloves with extra foam palm padding and an integrated wrist-wrap support strap for heavy pulls and pressing.',
      specs: { 'Palm': 'Foam-padded leather', 'Support': 'Integrated wrist wrap', 'Fingers': 'Half-finger design' },
      variants: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black/Red'], ageGroups: ['Men', 'Women'] } },
  ],
  'kit-bags': [
    { name: 'Zassports Duffle Kit Bag – 45L (Demo)', sku: 'ZAS-DEMO-KTB1', price: 1099, mrp: 1699, stock: 35, image: IMG.BAGS,
      description: 'Demo product. 45L water-resistant duffle kit bag with a ventilated shoe compartment, adjustable shoulder strap and a spacious main pocket for gym and travel.',
      specs: { 'Capacity': '45 litres', 'Material': 'Water-resistant polyester', 'Feature': 'Separate shoe compartment' },
      variants: { colors: ['Black', 'Navy Blue'] } },
    { name: 'Zassports Sports Backpack Kit Bag – 30L (Demo)', sku: 'ZAS-DEMO-KTB2', price: 1299, mrp: 1899, stock: 30, image: IMG.BAGS,
      description: 'Demo product. 30L sports backpack with a padded laptop sleeve, breathable back panel and side mesh pockets — carry training kit and daily essentials together.',
      specs: { 'Capacity': '30 litres', 'Back': 'Padded breathable panel', 'Feature': 'Laptop sleeve + bottle pockets' },
      variants: { colors: ['Black', 'Grey'] } },
  ],
};

// --- Generic fallback template builder for any category not listed above ------
function genericTemplates(cat) {
  const base = cat.name.replace(/s$/, '');
  return [1, 2].map((n) => ({
    name: `Zassports ${cat.name} Demo Item ${n} (Demo)`,
    sku: `ZAS-DEMO-${slugify(cat.slug).toUpperCase().replace(/-/g, '').slice(0, 6)}${n}`,
    price: 799, mrp: 1199, stock: 30, image: IMG.NONE,
    description: `Demo product. A sample ${base.toLowerCase()} added to populate the "${cat.name}" category so it displays correctly across the shop, search and product pages.`,
    specs: { 'Type': cat.name, 'Note': 'Demo placeholder product' },
    variants: {},
  }));
}

function buildProduct(t, categorySlug) {
  const discount = t.mrp > t.price ? Math.round(((t.mrp - t.price) / t.mrp) * 100) : 0;
  return {
    name: t.name,
    brand: 'Zassports',
    slug: slugify(t.name),
    description: t.description,
    specs: t.specs || {},
    price: t.price,
    mrp: t.mrp,
    discount,
    stock: t.stock,
    sku: t.sku,
    variants: t.variants || {},
    images: t.image ? [t.image] : [],
    ratings: { average: 4.2, count: 6 },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
    category: categorySlug,
  };
}

async function run() {
  console.log(`\n=== Demo product seeding (${APPLY ? 'APPLY' : 'DRY RUN'}) ===`);
  console.log('DB:', mongodbUri.replace(/:([^@]+)@/, ':****@'), '\n');

  await mongoose.connect(mongodbUri);
  const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
  const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

  const categories = await Category.find({}).sort({ displayOrder: 1, name: 1 });
  const allProducts = await Product.find({});

  const activeCount = (slug) =>
    allProducts.filter((p) => p.category === slug && p.isActive === true).length;

  // existing slugs / skus for uniqueness guards
  const existingSlugs = new Set(allProducts.map((p) => p.slug));
  const existingSkus = new Set(allProducts.map((p) => p.sku));

  const toInsert = [];
  const beforeCounts = {};
  const plan = { skipped: [], addOne: [], addTwo: [] };

  for (const cat of categories) {
    const before = activeCount(cat.slug);
    beforeCounts[cat.slug] = before;
    const need = before >= 2 ? 0 : before === 1 ? 1 : 2;

    if (need === 0) { plan.skipped.push(cat); continue; }
    (need === 1 ? plan.addOne : plan.addTwo).push(cat);

    const templates = (TEMPLATES[cat.slug] || genericTemplates(cat)).slice(0, need);
    for (const t of templates) {
      const prod = buildProduct(t, cat.slug);
      // uniqueness guards (idempotency / safety)
      let uniqueSlug = prod.slug, i = 2;
      while (existingSlugs.has(uniqueSlug)) uniqueSlug = `${prod.slug}-${i++}`;
      prod.slug = uniqueSlug;
      if (existingSkus.has(prod.sku)) {
        console.log(`  ! SKU ${prod.sku} already exists — skipping "${prod.name}"`);
        continue;
      }
      existingSlugs.add(prod.slug);
      existingSkus.add(prod.sku);
      toInsert.push(prod);
    }
  }

  // ---- Report: BEFORE state + plan ----
  console.log('Category'.padEnd(24), 'Before', ' Action');
  console.log('-'.repeat(52));
  for (const cat of categories) {
    const b = beforeCounts[cat.slug];
    const action = b >= 2 ? 'skip (>=2)' : b === 1 ? 'add 1 demo' : 'add 2 demo';
    console.log(cat.slug.padEnd(24), String(b).padStart(5), ' ', action);
  }

  console.log(`\nCategories: ${categories.length} | skip: ${plan.skipped.length} | +1: ${plan.addOne.length} | +2: ${plan.addTwo.length}`);
  console.log(`Demo products to create: ${toInsert.length}`);

  if (!APPLY) {
    console.log('\nDRY RUN — no changes written. Re-run with --apply to insert.');
    console.log('Products that would be created:');
    toInsert.forEach((p) => console.log(`  + [${p.category}] ${p.name}  (sku ${p.sku}, slug ${p.slug})`));
    await mongoose.disconnect();
    return;
  }

  // ---- APPLY ----
  if (toInsert.length > 0) {
    await Product.insertMany(toInsert, { ordered: false });
    console.log(`\nInserted ${toInsert.length} demo products.`);
  } else {
    console.log('\nNothing to insert — every category already has >= 2 active products.');
  }

  // ---- Report: AFTER state ----
  const afterProducts = await Product.find({});
  const afterActive = (slug) => afterProducts.filter((p) => p.category === slug && p.isActive === true).length;
  console.log('\n=== AFTER ===');
  console.log('Category'.padEnd(24), 'Before', ' After');
  console.log('-'.repeat(44));
  for (const cat of categories) {
    console.log(cat.slug.padEnd(24), String(beforeCounts[cat.slug]).padStart(5), ' ', String(afterActive(cat.slug)).padStart(4));
  }

  const created = afterProducts.filter((p) => /ZAS-DEMO-/.test(p.sku));
  console.log(`\nTotal demo products now in DB (sku ~ ZAS-DEMO-): ${created.length}`);

  await mongoose.disconnect();
  console.log('\nDone. Disconnected.');
}

run().catch(async (err) => {
  console.error('Seeding failed:', err);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
