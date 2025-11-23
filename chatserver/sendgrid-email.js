import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ✅ Match the old sendMail function signature: (email, otp)
export const sendMail = async (email, otp) => {
  console.log('📧 SendGrid: Sending OTP email');
  console.log('📧 To:', email);
  console.log('🔢 OTP:', otp);
  
  const msg = {
    to: email,
    from: 'pratichighosh053@gmail.com',
    subject: '🔐 Your Login OTP Code', // ✅ Add subject as a string
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Your OTP Code</h2>
        <p>Your one-time password (OTP) is:</p>
        <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="font-size: 36px; letter-spacing: 8px; margin: 0; color: #2563eb;">
            ${otp}
          </h1>
        </div>
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          If you didn't request this code, please ignore this email.
        </p>
      </div>
    `,
  };

  try {
    const result = await sgMail.send(msg);
    console.log('✅ Email sent successfully via SendGrid to:', email);
    
    return {
      success: true,
      messageId: result[0].headers['x-message-id'] || 'sent',
      sentFrom: 'pratichighosh053@gmail.com',
      sentTo: email
    };
  } catch (error) {
    console.error('❌ SendGrid error:', error.response?.body || error.message);
    throw new Error('Failed to send email via SendGrid: ' + (error.response?.body?.errors?.[0]?.message || error.message));
  }
};