const nodemailer = require('nodemailer');

const createTransporter = () => {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        return null;
    }
};

const sendEmail = async (to, subject, text) => {
    const transporter = createTransporter();

    if (!transporter) {
        console.log('---------------------------------------------------');
        console.log(`[MOCK EMAIL] To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${text}`);
        console.log('---------------------------------------------------');
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"CocoVilla" <no-reply@cocovilla.com>',
            to,
            subject,
            text,
        });
        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending email via Nodemailer:", error);
        // Fallback to mock logging if real sending fails, or just throw
        throw error;
    }
};

module.exports = { sendEmail };
