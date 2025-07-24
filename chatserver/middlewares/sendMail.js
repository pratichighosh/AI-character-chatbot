// middlewares/sendMail.js - FIXED EMAIL SENDING
import nodemailer from 'nodemailer';

const SENDER_EMAIL = 'pratichighosh053@gmail.com';
const SENDER_PASSWORD = 'afidwpueqljxgqhc';

console.log('📧 Email service configured with:', SENDER_EMAIL);

export const sendMail = async (email, otp) => {
  try {
    console.log(`📧 === ATTEMPTING TO SEND EMAIL ===`);
    console.log(`📤 FROM: ${SENDER_EMAIL}`);
    console.log(`📧 TO: ${email}`);
    console.log(`🔢 OTP: ${otp}`);

    // Create transporter with explicit settings
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: SENDER_EMAIL,
        pass: SENDER_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Test connection
    console.log('🔧 Testing SMTP connection...');
    try {
      await transporter.verify();
      console.log('✅ SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('❌ SMTP verification failed:', verifyError.message);
      throw new Error(`SMTP verification failed: ${verifyError.message}`);
    }

    const mailOptions = {
      from: {
        name: 'ChatBot OTP Service',
        address: SENDER_EMAIL
      },
      to: email,
      subject: `🔐 Your ChatBot OTP: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: #2563eb; margin: 0 0 20px 0;">🤖 ChatBot</h1>
            <p style="color: #666; font-size: 16px;">Your One-Time Password</p>
                         
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1976d2; margin: 0 0 15px 0;">Your OTP Code</h2>
              <div style="font-size: 32px; font-weight: bold; color: #1976d2; letter-spacing: 4px; font-family: monospace; background: white; padding: 15px; border-radius: 5px;">
                ${otp}
              </div>
            </div>
                         
            <p style="color: #e65100; font-size: 14px; margin: 20px 0;">
              ⏰ This code expires in 10 minutes<br>
              🔒 Keep this code secure and don't share it
            </p>
                         
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              Sent from: ${SENDER_EMAIL}<br>
              Time: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
      text: `
ChatBot OTP Verification

Your OTP code: ${otp}

This code expires in 10 minutes.
Keep this code secure and don't share it with anyone.

Sent from: ${SENDER_EMAIL}
Time: ${new Date().toLocaleString()}
      `
    };

    console.log('📤 Sending email now...');
    const info = await transporter.sendMail(mailOptions);

    console.log(`🎉 === EMAIL SENT SUCCESSFULLY ===`);
    console.log(`📨 Message ID: ${info.messageId}`);
    console.log(`📤 FROM: ${SENDER_EMAIL}`);
    console.log(`📧 TO: ${email}`);
    console.log(`🔢 OTP: ${otp}`);
    console.log(`⏰ SENT AT: ${new Date().toISOString()}`);

    return {
      success: true,
      messageId: info.messageId,
      sentFrom: SENDER_EMAIL,
      sentTo: email,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`❌ === EMAIL SEND FAILED ===`);
    console.error(`❌ TO: ${email}`);
    console.error(`❌ OTP: ${otp}`);
    console.error(`❌ ERROR: ${error.message}`);
    console.error(`❌ STACK:`, error.stack);

    // Log specific Gmail errors
    if (error.code === 'EAUTH') {
      console.error('❌ GMAIL AUTH ERROR: Check if app password is correct');
    } else if (error.code === 'ENOTFOUND') {
      console.error('❌ NETWORK ERROR: Cannot reach Gmail servers');
    } else if (error.responseCode === 535) {
      console.error('❌ INVALID CREDENTIALS: Gmail username/password incorrect');
    }

    throw new Error(`Failed to send email: ${error.message}`);
  }
};