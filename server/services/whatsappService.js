const twilio = require('twilio');

let client = null;

try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (accountSid && accountSid.startsWith('AC') && authToken) {
        client = twilio(accountSid, authToken);
    } else {
        console.warn('Twilio credentials missing or invalid. WhatsApp notifications will be mocked.');
    }
} catch (err) {
    console.error('Failed to initialize Twilio client:', err.message);
}

const sendWhatsApp = async (to, message) => {
    try {
        if (!client) {
            console.log(`[Mock WhatsApp] To: ${to}, Message: ${message}`);
            return;
        }

        await client.messages.create({
            body: message,
            from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
            to: `whatsapp:${to}`
        });
        console.log(`WhatsApp sent to ${to}`);
    } catch (error) {
        console.error('Twilio Error:', error);
    }
};

module.exports = { sendWhatsApp };
