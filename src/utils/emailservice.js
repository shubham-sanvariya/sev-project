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


export const sendVerificationEmail = async (to, link) => {
    const name = process.env.SMTP_BREVO_SENDER_NAME
    const mail = process.env.SMTP_BREVO_SENDER_MAIL
    const info = await transporter.sendMail({
        from: `"${name}" <${mail}>`,
        to,
        subject: 'Verify your email',
        html: `
      <h2>Email Verification</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${link}">${link}</a>
    `
    });

    console.log('📧 Email sent:', info.messageId);
};
