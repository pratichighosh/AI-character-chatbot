// middlewares/sendMail.js
// ES Module version

import nodemailer from 'nodemailer';

const SENDER_EMAIL = 'pratichighosh053@gmail.com';
const SENDER_PASSWORD = 'afidwpueqljxgqhc';

console.log('📧 sendMail.js loaded - WILL SEND FROM:', SENDER_EMAIL);

export const sendMail = async (email, otp) => {
  try {
    console.log(`\n📧 === SENDING REAL EMAIL ===`);
    console.log(`📤 FROM: ${SENDER_EMAIL}`);
    console.log(`📧 TO: ${email}`);
    console.log(`🔢 OTP: ${otp}`);

    console.log('🔧 Creating email transporter...');
    // Fix: Use createTransport (not createTransporter)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: SENDER_EMAIL,
        pass: SENDER_PASSWORD,
      }
    });

    console.log('✅ Email transporter created');

    // Verify connection
    try {
      await transporter.verify();
      console.log('✅ SMTP connection verified');
    } catch (verifyError) {
      console.log('⚠️ SMTP verification failed:', verifyError.message);
      console.log('⚠️ Continuing anyway...');
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
            <p style="color: #666;">One-Time Password</p>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1976d2; margin: 0 0 15px 0;">Your Code</h2>
              <div style="font-size: 36px; font-weight: bold; color: #1976d2; letter-spacing: 8px; font-family: monospace; background: white; padding: 15px; border-radius: 5px;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #e65100; font-size: 14px;">
              ⏰ Expires in 10 minutes<br>
              🔒 Keep secure • Don't share
            </p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              From: ${SENDER_EMAIL}<br>
              ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
      text: `ChatBot OTP: ${otp}\n\nExpires in 10 minutes\nFrom: ${SENDER_EMAIL}`
    };

    console.log('📤 Sending email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`\n🎉 === EMAIL SENT SUCCESSFULLY ===`);
    console.log(`📨 Message ID: ${info.messageId}`);
    console.log(`📤 FROM: ${SENDER_EMAIL}`);

    return {
      success: true,
      messageId: info.messageId,
      sentFrom: SENDER_EMAIL
    };

  } catch (error) {
    console.error(`\n❌ === EMAIL SEND FAILED ===`);
    console.error(`❌ Error: ${error.message}`);
    console.error(`❌ Full error:`, error);
    
    throw new Error(`Email failed: ${error.message}`);
  }
};