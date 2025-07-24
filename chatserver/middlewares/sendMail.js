// middlewares/sendMail.js - ENHANCED EMAIL SERVICE
// ES Module version with improved error handling and robustness

import nodemailer from 'nodemailer';

// Configuration
const SENDER_EMAIL = 'pratichighosh053@gmail.com';
const SENDER_PASSWORD = 'afidwpueqljxgqhc';

console.log('📧 === EMAIL SERVICE INITIALIZING ===');
console.log('📧 sendMail.js loaded - WILL SEND FROM:', SENDER_EMAIL);
console.log('✅ Email credentials configured');

// Create transporter once and reuse it
let transporter = null;

const createTransporter = () => {
  if (!transporter) {
    console.log('🔧 Creating email transporter...');
    transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: SENDER_EMAIL,
        pass: SENDER_PASSWORD,
      },
      // Additional options for better reliability
      pool: true, // Use pooled connections
      maxConnections: 3,
      maxMessages: 100,
      rateDelta: 1000, // Rate limiting
      rateLimit: 5
    });
    console.log('✅ Email transporter created with pooling enabled');
  }
  return transporter;
};

// Verify email service on startup
const verifyEmailService = async () => {
  try {
    const testTransporter = createTransporter();
    await testTransporter.verify();
    console.log('✅ === EMAIL SERVICE READY ===');
    console.log('✅ SMTP connection verified successfully');
    console.log('✅ Gmail service operational');
    return true;
  } catch (error) {
    console.error('❌ === EMAIL SERVICE VERIFICATION FAILED ===');
    console.error('❌ SMTP verification error:', error.message);
    console.error('❌ Email service may not work properly');
    return false;
  }
};

// Verify on module load
verifyEmailService();

export const sendMail = async (email, otp) => {
  try {
    console.log(`\n📧 === SENDING OTP EMAIL ===`);
    console.log(`📤 FROM: ${SENDER_EMAIL}`);
    console.log(`📧 TO: ${email}`);
    console.log(`🔢 OTP: ${otp}`);
    console.log(`⏰ Time: ${new Date().toISOString()}`);

    // Validate inputs
    if (!email || !otp) {
      throw new Error('Email and OTP are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate OTP format (should be 6 digits)
    if (!/^\d{6}$/.test(otp.toString())) {
      throw new Error('OTP must be 6 digits');
    }

    // Get or create transporter
    const emailTransporter = createTransporter();

    // Enhanced mail options with better styling
    const mailOptions = {
      from: {
        name: '🤖 AI ChatBot - OTP Service',
        address: SENDER_EMAIL
      },
      to: email,
      subject: `🔐 Your ChatBot Login Code: ${otp}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
          <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #1e293b; margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">🤖 AI ChatBot</h1>
              <p style="color: #64748b; margin: 0; font-size: 16px;">Secure Login Verification</p>
            </div>
            
            <!-- OTP Section -->
            <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 24px; border-radius: 10px; margin: 24px 0; text-align: center;">
              <p style="color: white; margin: 0 0 16px 0; font-size: 16px; font-weight: 500;">Your verification code is:</p>
              <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block; margin: 0 auto;">
                <span style="font-size: 42px; font-weight: 800; color: #1e293b; letter-spacing: 12px; font-family: 'Courier New', monospace;">
                  ${otp}
                </span>
              </div>
            </div>
            
            <!-- Instructions -->
            <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 18px; margin-right: 8px;">⚡</span>
                <strong style="color: #92400e; font-size: 14px;">Quick Instructions:</strong>
              </div>
              <ul style="color: #92400e; font-size: 14px; margin: 8px 0 0 0; padding-left: 20px;">
                <li>Enter this code in your ChatBot login screen</li>
                <li>Code expires in <strong>10 minutes</strong></li>
                <li>Don't share this code with anyone</li>
              </ul>
            </div>
            
            <!-- Security Notice -->
            <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 18px; margin-right: 8px;">🔒</span>
                <strong style="color: #dc2626; font-size: 14px;">Security Notice:</strong>
              </div>
              <p style="color: #dc2626; font-size: 14px; margin: 0; line-height: 1.4;">
                If you didn't request this login code, please ignore this email. Your account remains secure.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">
                <strong>Sent from:</strong> ${SENDER_EMAIL}<br>
                <strong>Time:</strong> ${new Date().toLocaleString()}<br>
                <strong>IP:</strong> Secure Server • <strong>Service:</strong> AI ChatBot Authentication
              </p>
            </div>
            
          </div>
          
          <!-- Footer outside box -->
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">
              © 2025 AI ChatBot • Secure Authentication System • Powered by Gemini AI
            </p>
          </div>
        </div>
      `,
      
      // Plain text fallback for email clients that don't support HTML
      text: `
🤖 AI ChatBot - Login Verification

Your verification code is: ${otp}

Instructions:
• Enter this code in your ChatBot login screen
• Code expires in 10 minutes  
• Keep this code secure and don't share it

If you didn't request this code, please ignore this email.

Sent from: ${SENDER_EMAIL}
Time: ${new Date().toLocaleString()}

© 2025 AI ChatBot Authentication System
      `,
      
      // Email headers for better deliverability
      headers: {
        'X-Priority': '1 (Highest)',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    console.log('📤 Sending email with enhanced template...');
    console.log('📧 Email size: ~' + Math.round(mailOptions.html.length / 1024) + 'KB');

    // Send email with retry logic
    let emailResult;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`📤 Send attempt ${attempts}/${maxAttempts}...`);
        
        emailResult = await emailTransporter.sendMail(mailOptions);
        break; // Success, exit retry loop
        
      } catch (sendError) {
        console.error(`❌ Send attempt ${attempts} failed:`, sendError.message);
        
        if (attempts >= maxAttempts) {
          throw sendError; // Final attempt failed
        }
        
        // Wait before retrying (exponential backoff)
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

    return {
      success: true,
      messageId: emailResult.messageId,
      sentFrom: SENDER_EMAIL,
      sentTo: email,
      otp: otp,
      timestamp: new Date().toISOString(),
      attempts: attempts,
      emailSize: Math.round(mailOptions.html.length / 1024) + 'KB'
    };

  } catch (error) {
    console.error(`\n❌ === EMAIL SEND FAILED ===`);
    console.error(`❌ Error: ${error.message}`);
    console.error(`❌ Email: ${email}`);
    console.error(`❌ OTP: ${otp}`);
    console.error(`❌ Full error:`, error);
    
    // Enhanced error details
    let errorDetails = {
      type: 'EMAIL_SEND_ERROR',
      message: error.message,
      email: email,
      timestamp: new Date().toISOString()
    };

    // Categorize common errors
    if (error.message.includes('invalid login')) {
      errorDetails.category = 'AUTHENTICATION_ERROR';
      errorDetails.solution = 'Check Gmail credentials and app password';
    } else if (error.message.includes('Network')) {
      errorDetails.category = 'NETWORK_ERROR';
      errorDetails.solution = 'Check internet connection';
    } else if (error.message.includes('timeout')) {
      errorDetails.category = 'TIMEOUT_ERROR';
      errorDetails.solution = 'Gmail service may be slow, try again';
    } else {
      errorDetails.category = 'UNKNOWN_ERROR';
      errorDetails.solution = 'Check server logs for details';
    }

    console.error('❌ Error details:', errorDetails);
    
    throw new Error(`Email send failed: ${error.message}`);
  }
};

// Test function for debugging email service
export const testEmailService = async (testEmail = 'test@example.com') => {
  try {
    console.log('🧪 === TESTING EMAIL SERVICE ===');
    
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

// Health check for email service
export const emailHealthCheck = async () => {
  try {
    const testTransporter = createTransporter();
    await testTransporter.verify();
    
    return {
      status: 'healthy',
      service: 'gmail',
      credentials: 'valid',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      status: 'unhealthy',
      service: 'gmail',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

console.log('✅ === EMAIL SERVICE MODULE LOADED ===');
console.log('✅ Functions exported: sendMail, testEmailService, emailHealthCheck');

export default sendMail;