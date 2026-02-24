/**
 * Resizes and compresses logo.png for web use.
 * Run once: node scripts/compressLogo.js
 * Requires: npm install sharp
 */
const sharp = require('sharp');
const path = require('path');

const input = path.join(__dirname, '../public/logo.png');
const output = path.join(__dirname, '../public/logo.png');

sharp(input)
    .resize(320, 320, {          // 320px is 2x retina size of the 160px display size
        fit: 'inside',            // preserve aspect ratio
        withoutEnlargement: true
    })
    .png({ quality: 80, compressionLevel: 9 })
    .toBuffer()
    .then(buf => {
        require('fs').writeFileSync(output, buf);
        const originalKB = Math.round(require('fs').statSync(input).size / 1024);
        const newKB = Math.round(buf.length / 1024);
        console.log(`✅ logo.png compressed: ${originalKB} KB → ${newKB} KB`);
    })
    .catch(err => console.error('❌ Failed:', err));
