const { execSync } = require('child_process');
const path = require('path');

const scripts = [
    'scripts/seed.js',
    'scripts/seedFacilities.js',
    'scripts/seedSiteContent.js',
];

console.log('🚀 Running all setup scripts...\n');

for (const script of scripts) {
    const fullPath = path.join(__dirname, '..', script);
    console.log(`▶ Running ${script}...`);
    try {
        execSync(`node ${fullPath}`, { stdio: 'inherit' });
        console.log(`✅ ${script} completed\n`);
    } catch (err) {
        console.error(`❌ ${script} failed:`, err.message);
        process.exit(1);
    }
}

console.log('🎉 All setup scripts completed successfully!');
process.exit(0);
