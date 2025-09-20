import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const root = path.resolve(process.cwd());
const svgPath = path.join(root, 'public', 'architecture-diagram.svg');
const pngPath = path.join(root, 'public', 'architecture-diagram.png');

async function run() {
  const svg = await fs.readFile(svgPath);
  await sharp(svg).png({ quality: 90 }).toFile(pngPath);
  console.log('Saved', pngPath);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});








