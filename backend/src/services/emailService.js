const axios = require('axios');

const sendVerificationOTP = async (email, name, otp) => {
  console.log('-----------------------------------------');
  console.log(`EMAIL VERIFICATION OTP FOR ${email}: ${otp}`);
  console.log('-----------------------------------------');

  if (!process.env.BREVO_API_KEY) {
    console.error('BREVO_API_KEY is missing — cannot send email.');
    return false;
  }

  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'Anurag Resell',
          email: process.env.EMAIL_FROM || 'noreply@campusresell.edu',
        },
        to: [{ email, name }],
        subject: 'Verify Your Anurag Resell Portal Account',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #4f46e5; text-align: center;">Anurag Resell</h2>
            <p>Hi ${name},</p>
            <p>Thank you for registering on Anurag Resell Portal. Please verify your email address to activate your account by using the following One-Time Password (OTP):</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5; background-color: #f3f4f6; padding: 10px 20px; border-radius: 5px;">${otp}</span>
            </div>
            <p>This OTP is valid for 10 minutes.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #888; text-align: center;">Anurag Resell - Student Marketplace</p>
          </div>
        `,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log(`Verification OTP sent to ${email}, messageId: ${response.data.messageId}`);
    return true;
  } catch (error) {
    console.error('Full Email Error:', error.response?.data || error.message);
    return false;
  }
};

module.exports = {
  sendVerificationOTP,
};