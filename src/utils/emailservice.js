import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_BREVO_KEY
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP Error:', error);
    } else {
        console.log('SMTP ready to send emails');
    }
});


function getEmailBody(link, uri) {
    let subject;
    let html;
    if (uri === "verify-email") {
        subject = "Verify your email"
        html = `
      <h2>Email Verification</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${link}">${link}</a>
    `
    } else {
        subject = 'Reset your password'
        html = `
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password.</p>
            <p>Click the link below to set a new password:</p>
            <a href="${link}">${link}</a>
            <p>This link will expire in 15 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
        `
    }

    return {subject, html};
}

export const sendVerificationEmail = async (to, link, uri) => {
    const name = process.env.SMTP_BREVO_SENDER_NAME
    const mail = process.env.SMTP_BREVO_SENDER_MAIL

    const {html, subject} = getEmailBody(link, uri);

    const info = await transporter.sendMail({
        from: `"${name}" <${mail}>`,
        to,
        subject,
        html
    });

    console.log('📧 Email sent:', info.messageId);
};
