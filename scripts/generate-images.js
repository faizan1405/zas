const fs = require('fs');
const path = require('path');

const dirs = [
  'public/images/categories',
  'public/images/checklist',
  'public/images/collections'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function generateSvg(title, color1, color2) {
  return `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#grad1)" />
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${title}</text>
  </svg>`;
}

const categories = [
  'cricket-bats', 'cricket-balls', 'cricket-kits', 'protective-gear', 'cricket-shoes', 'cricket-jerseys', 'cricket-bags', 'accessories', 'men', 'women', 'kids', 'batting-gloves', 'batting-pads', 'cricket-helmets', 'cricket-clothing', 'training-equipment', 'complete-cricket-kits', 'wicket-keeping-gloves', 'helmets', 'kit-bags'
];

categories.forEach(cat => {
  const svg = generateSvg(cat.replace(/-/g, ' ').toUpperCase(), '#1e293b', '#0f172a');
  fs.writeFileSync(`public/images/categories/${cat}.svg`, svg);
});

const checklist = [
  'bat', 'ball', 'gloves', 'pads', 'helmet', 'shoes', 'bag', 'jersey'
];

checklist.forEach(item => {
  const svg = generateSvg(item.toUpperCase(), '#0f172a', '#1e293b');
  fs.writeFileSync(`public/images/checklist/${item}.svg`, svg);
});

const collections = categories;
collections.forEach(col => {
  const svg = generateSvg(col.replace(/-/g, ' ').toUpperCase(), '#020617', '#1e293b');
  fs.writeFileSync(`public/images/collections/${col}.svg`, svg);
});

console.log('Images generated successfully!');
