const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sendEmail } = require('../services/emailService');

const testEmail = async () => {
    console.log('--- Email Service Verification ---');
    console.log('Checking Environment Variables...');

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        console.log('✅ SMTP Configuration found:');
        console.log(`   Host: ${process.env.SMTP_HOST}`);
        console.log(`   User: ${process.env.SMTP_USER}`);
    } else {
        console.log('❌ SMTP Configuration MISSING in .env');
        console.log('   Email service will fallback to MOCK mode.');
    }

    console.log('\nAttempting to send test email...');
    try {
        // Send a test email to the configured user or a dummy one
        const testRecipient = process.env.SMTP_USER || 'test@example.com';
        await sendEmail(testRecipient, 'CocoVilla Test Email', 'This is a test email to verify Nodemailer configuration.');
        console.log('\n✅ Test execution finished.');
    } catch (error) {
        console.error('\n❌ Failed to send email:', error.message);
    }
};

testEmail();
