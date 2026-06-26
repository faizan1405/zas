const fs = require('fs');
const path = require('path');
const https = require('https');

const map = {
  'cricket-bats': '1531415074968-036ba1b575da',
  'cricket-balls': '1607604276583-eef5d076aa5f',
  'batting-gloves': '1588615419954-bfad0c5f2122',
  'batting-pads': '1540747737956-37872404a82f',
  'cricket-helmets': '1508098682722-e99c43a406b2',
  'cricket-shoes': '1542291026-7eec264c27ff',
  'cricket-bags': '1553062407-98eeb64c6a62',
  'cricket-clothing': '1516257984-b1b4d707412e',
  'protective-gear': '1540747737956-37872404a82f', 
  'training-equipment': '1516257984-b1b4d707412e',
  'accessories': '1607604276583-eef5d076aa5f', 
  'wicket-keeping-gloves': '1606902960316-353ebd6dab78',
  'helmets': '1508098682722-e99c43a406b2',
  'kit-bags': '1553062407-98eeb64c6a62',
  'complete-cricket-kits': '1540747737956-37872404a82f',
  'men': '1531415074968-036ba1b575da',
  'women': '1516257984-b1b4d707412e',
  'kids': '1508098682722-e99c43a406b2',
  'cricket-kits': '1540747737956-37872404a82f',
  'jerseys': '1516257984-b1b4d707412e',
  'bags': '1553062407-98eeb64c6a62',
  
  // Checklist mappings
  'bat': '1531415074968-036ba1b575da',
  'ball': '1607604276583-eef5d076aa5f',
  'gloves': '1588615419954-bfad0c5f2122',
  'pads': '1540747737956-37872404a82f',
  'helmet': '1508098682722-e99c43a406b2',
  'shoes': '1542291026-7eec264c27ff',
  'bag': '1553062407-98eeb64c6a62',
  'jersey': '1516257984-b1b4d707412e'
};

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

async function downloadImage(id, filePath) {
  const url = `https://images.unsplash.com/photo-${id}?q=80&w=600&auto=format`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        https.get(res.headers.location, (redirectRes) => {
          const file = fs.createWriteStream(filePath);
          redirectRes.pipe(file);
          file.on('finish', () => { file.close(); resolve(); });
        });
      } else {
        const file = fs.createWriteStream(filePath);
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }
    }).on('error', (err) => reject(err));
  });
}

async function main() {
  for (const [name, id] of Object.entries(map)) {
    // Determine category based on name
    let type = 'categories';
    if (['bat', 'ball', 'gloves', 'pads', 'helmet', 'shoes', 'bag', 'jersey'].includes(name)) {
      type = 'checklist';
    }
    
    // We can also copy the same image to collections for simplicity, but collections use the same slugs as categories.
    const promises = [];
    if (type === 'categories') {
      promises.push(downloadImage(id, `public/images/categories/${name}.jpg`));
      promises.push(downloadImage(id, `public/images/collections/${name}.jpg`));
    } else {
      promises.push(downloadImage(id, `public/images/checklist/${name}.jpg`));
    }
    
    await Promise.all(promises);
    console.log(`Downloaded ${name}.jpg`);
  }
  console.log('Done downloading real images!');
}

main();
