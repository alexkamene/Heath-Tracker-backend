// utils/sendEmail.js
const { Resend } = require('resend');

const resend = new Resend("re_bq9bYfff_CXq4EjrTQBfWpA44FgefsMbS");

const sendEmail = async ({ to, subject, html }) => {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', // You can verify and use a custom domain later
      to,
      subject,
      html,
    });

    console.log('✅ Email sent via Resend:', data);
  } catch (error) {
    console.error('❌ Email failed:', error.message);
  }
};

module.exports = sendEmail;
