// middlewares/sendMail.js - ENHANCED EMAIL SERVICE WITH VERIFICATION
// ✅ FIXED: Added email verification and better error handling

import nodemailer from 'nodemailer';

// Configuration - Using your working credentials
const SENDER_EMAIL = 'pratichighosh053@gmail.com';
const SENDER_PASSWORD = 'afidwpueqljxgqhc';

console.log('📧 === EMAIL SERVICE INITIALIZING ===');
console.log('📧 Sender email:', SENDER_EMAIL);

// ✅ ENHANCED: Create transporter with better configuration
let transporter = null;

const createTransporter = () => {
  if (!transporter) {
    console.log('🔧 Creating email transporter...');
    transporter = nodemailer.createTransporter({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: SENDER_EMAIL,
        pass: SENDER_PASSWORD,
      },
      // ✅ ENHANCED: Additional options for better reliability
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 10,
      tls: {
        rejectUnauthorized: false // ✅ This helps with some email issues
      }
    });
    console.log('✅ Email transporter created');
  }
  return transporter;
};

// ✅ CRITICAL: Verify email service with better testing
const verifyEmailService = async () => {
  try {
    console.log('🔍 === VERIFYING EMAIL SERVICE ===');
    const testTransporter = createTransporter();
    
    // Test the connection
    await testTransporter.verify();
    console.log('✅ SMTP connection verified successfully');
    
    // ✅ NEW: Test sending actual email to verify it works
    try {
      console.log('🧪 Testing actual email send...');
      const testResult = await testTransporter.sendMail({
        from: SENDER_EMAIL,
        to: SENDER_EMAIL, // Send to self for testing
        subject: '🧪 Email Service Test',
        text: `Email service test at ${new Date().toISOString()}`
      });
      console.log('✅ Test email sent successfully:', testResult.messageId);
      return true;
    } catch (testError) {
      console.error('❌ Test email failed:', testError.message);
      // Don't fail completely, just warn
      console.warn('⚠️ Email service may not work properly');
      return false;
    }
    
  } catch (error) {
    console.error('❌ === EMAIL SERVICE VERIFICATION FAILED ===');
    console.error('❌ Error:', error.message);
    console.error('❌ Code:', error.code);
    
    // Check for common error codes
    if (error.code === 'EAUTH') {
      console.error('❌ AUTHENTICATION FAILED - Check email credentials');
    } else if (error.code === 'ECONNECTION') {
      console.error('❌ CONNECTION FAILED - Check internet connection');
    }
    
    return false;
  }
};

// ✅ ENHANCED: Main email sending function with better error handling
export const sendMail = async (email, otp) => {
  try {
    console.log(`\n📧 === SENDING OTP EMAIL ===`);
    console.log(`📤 FROM: ${SENDER_EMAIL}`);
    console.log(`📧 TO: ${email}`);
    console.log(`🔢 OTP: ${otp}`);
    console.log(`⏰ Time: ${new Date().toISOString()}`);

    // ✅ ENHANCED: Validate inputs more thoroughly
    if (!email || !otp) {
      throw new Error('Email and OTP are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    if (!/^\d{6}$/.test(otp.toString())) {
      throw new Error('OTP must be 6 digits');
    }

    // ✅ CRITICAL: Test transporter before sending
    const emailTransporter = createTransporter();
    
    console.log('🔍 Verifying transporter before sending...');
    try {
      await emailTransporter.verify();
      console.log('✅ Transporter verified');
    } catch (verifyError) {
      console.error('❌ Transporter verification failed:', verifyError.message);
      throw new Error(`Email service not available: ${verifyError.message}`);
    }

    // ✅ ENHANCED: Better email template with clear formatting
    const mailOptions = {
      from: {
        name: '🤖 AI ChatBot - OTP Service',
        address: SENDER_EMAIL
      },
      to: email,
      subject: `🔐 Your ChatBot Login Code: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; text-align: center; color: white;">
            <h1 style="margin: 0;">🤖 AI ChatBot</h1>
            <p style="margin: 10px 0 0 0;">Your verification code is ready!</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; margin: 20px 0; border-radius: 10px; text-align: center;">
            <h2 style="color: #333; margin: 0 0 20px 0;">Your OTP Code</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #667eea;">
              <span style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: monospace;">
                ${otp}
              </span>
            </div>
            <p style="margin: 20px 0 0 0; color: #666;">
              This code expires in <strong>10 minutes</strong>
            </p>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>🔒 Security Notice:</strong> Never share this code with anyone. 
              If you didn't request this, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
            <p>Sent from: ${SENDER_EMAIL}</p>
            <p>Time: ${new Date().toLocaleString()}</p>
            <p>© 2025 AI ChatBot - Secure Authentication</p>
          </div>
        </div>
      `,
      
      text: `
🤖 AI ChatBot - Login Verification

Your verification code is: ${otp}

⏰ This code expires in 10 minutes
🔒 Never share this code with anyone
📧 If you didn't request this, ignore this email

Sent from: ${SENDER_EMAIL}
Time: ${new Date().toLocaleString()}
      `,
      
      // ✅ ENHANCED: Better headers for deliverability
      headers: {
        'X-Priority': '1 (Highest)',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Mailer': 'AI ChatBot Authentication System'
      }
    };

    console.log('📤 Sending email...');
    console.log('📧 Email template size: ~' + Math.round(mailOptions.html.length / 1024) + 'KB');

    // ✅ ENHANCED: Send with retry logic and better error handling
    let emailResult;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`📤 Send attempt ${attempts}/${maxAttempts}...`);
        
        emailResult = await emailTransporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully on attempt ${attempts}`);
        break; // Success, exit retry loop
        
      } catch (sendError) {
        console.error(`❌ Send attempt ${attempts} failed:`, sendError.message);
        console.error(`❌ Error code:`, sendError.code);
        console.error(`❌ Error response:`, sendError.response);
        
        if (attempts >= maxAttempts) {
          throw sendError; // Final attempt failed
        }
        
        // Wait before retrying
        const delay = Math.pow(2, attempts) * 1000; // 2s, 4s, 8s
        console.log(`⏳ Retrying in ${delay/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.log(`\n🎉 === EMAIL SENT SUCCESSFULLY ===`);
    console.log(`📨 Message ID: ${emailResult.messageId}`);
    console.log(`📤 FROM: ${SENDER_EMAIL}`);
    console.log(`📧 TO: ${email}`);
    console.log(`🔢 OTP: ${otp}`);
    console.log(`📊 Attempts: ${attempts}/${maxAttempts}`);
    console.log(`⏰ Sent at: ${new Date().toISOString()}`);
    console.log(`📮 Response: ${emailResult.response}`);

    return {
      success: true,
      messageId: emailResult.messageId,
      sentFrom: SENDER_EMAIL,
      sentTo: email,
      otp: otp,
      timestamp: new Date().toISOString(),
      attempts: attempts,
      response: emailResult.response,
      emailSize: Math.round(mailOptions.html.length / 1024) + 'KB'
    };

  } catch (error) {
    console.error(`\n❌ === EMAIL SEND FAILED ===`);
    console.error(`❌ Error: ${error.message}`);
    console.error(`❌ Error code: ${error.code}`);
    console.error(`❌ Error response: ${error.response}`);
    console.error(`❌ Email: ${email}`);
    console.error(`❌ OTP: ${otp}`);
    
    // ✅ ENHANCED: Better error categorization
    let errorCategory = 'UNKNOWN_ERROR';
    let solution = 'Check server logs';
    
    if (error.code === 'EAUTH') {
      errorCategory = 'AUTHENTICATION_ERROR';
      solution = 'Check Gmail credentials and app password';
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      errorCategory = 'NETWORK_ERROR';
      solution = 'Check internet connection and Gmail service status';
    } else if (error.code === 'EMESSAGE') {
      errorCategory = 'MESSAGE_ERROR';
      solution = 'Check email content and recipient address';
    } else if (error.message.includes('Invalid login')) {
      errorCategory = 'CREDENTIALS_ERROR';
      solution = 'Verify Gmail username and app password';
    }

    console.error(`❌ Error category: ${errorCategory}`);
    console.error(`❌ Suggested solution: ${solution}`);
    
    throw new Error(`Email send failed (${errorCategory}): ${error.message}`);
  }
};

// ✅ ENHANCED: Test function for debugging
export const testEmailService = async (testEmail = SENDER_EMAIL) => {
  try {
    console.log('🧪 === TESTING EMAIL SERVICE ===');
    console.log('🧪 Test email:', testEmail);
    
    const testOTP = '123456';
    const result = await sendMail(testEmail, testOTP);
    
    console.log('✅ Email service test PASSED');
    return {
      success: true,
      message: 'Email service is working correctly',
      result: result
    };
    
  } catch (error) {
    console.error('❌ Email service test FAILED:', error.message);
    return {
      success: false,
      message: 'Email service test failed',
      error: error.message
    };
  }
};

// ✅ ENHANCED: Health check
export const emailHealthCheck = async () => {
  try {
    const testTransporter = createTransporter();
    await testTransporter.verify();
    
    return {
      status: 'healthy',
      service: 'gmail',
      credentials: 'valid',
      sender: SENDER_EMAIL,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      status: 'unhealthy',
      service: 'gmail',
      error: error.message,
      errorCode: error.code,
      sender: SENDER_EMAIL,
      timestamp: new Date().toISOString()
    };
  }
};

// ✅ CRITICAL: Test email service on startup
verifyEmailService().then(result => {
  if (result) {
    console.log('🎉 EMAIL SERVICE READY FOR PRODUCTION!');
  } else {
    console.error('⚠️ EMAIL SERVICE MAY HAVE ISSUES!');
  }
});

console.log('✅ === EMAIL SERVICE MODULE LOADED ===');

export default sendMail;