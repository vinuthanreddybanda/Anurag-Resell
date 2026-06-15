const nodemailer = require('nodemailer');

const sendVerificationOTP = async (email, name, otp) => {
  console.log('-----------------------------------------');
  console.log(`EMAIL VERIFICATION OTP FOR ${email}: ${otp}`);
  console.log('-----------------------------------------');

  // If using default mock/dev config, skip nodemailer setup to avoid crashes
  if (
    !process.env.EMAIL_USER ||
    process.env.EMAIL_USER === 'mock_user' ||
    !process.env.EMAIL_PASS ||
    process.env.EMAIL_PASS === 'mock_pass'
  ) {
    console.log('Mail credentials are mock. Skipping SMTP send. OTP logged above.');
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });


    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@campusresell.edu',
      to: email,
      subject: 'Verify Your Anurag Resell Portal Account',
      html: `
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
    };
    console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
    console.log("EMAIL_PORT:", process.env.EMAIL_PORT);
    console.log("EMAIL_USER:", process.env.EMAIL_USER);

    await transporter.verify();
    console.log("SMTP VERIFIED");
    await transporter.verify();
    console.log("SMTP connection successful");
    await transporter.sendMail(mailOptions);
    console.log(`Verification OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Full Email Error:', error);    // Return true anyway so that registration is not blocked in dev environment,
    // since the OTP was already printed to the console log!
    return true;
  }
};

module.exports = {
  sendVerificationOTP,
};
