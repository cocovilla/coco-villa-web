const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '../public/logo.png');
const originalSize = fs.statSync(filePath).size;

sharp(filePath)
    .resize(320, 320, { fit: 'inside', withoutEnlargement: true })
    .png({ quality: 80, compressionLevel: 9 })
    .toBuffer()
    .then(buf => {
        fs.writeFileSync(filePath, buf);
        const originalKB = Math.round(originalSize / 1024);
        const newKB = Math.round(buf.length / 1024);
        console.log(`✅ logo.png: ${originalKB} KB → ${newKB} KB`);
    })
    .catch(err => console.error('❌ Failed:', err.message));
