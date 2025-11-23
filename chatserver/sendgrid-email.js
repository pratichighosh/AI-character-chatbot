import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendMail = async (to, subject, html) => {
  const msg = {
    to,
    from: 'pratichighosh053@gmail.com', // Must be verified in SendGrid
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Email sent via SendGrid');
    return true;
  } catch (error) {
    console.error('❌ SendGrid error:', error);
    throw error;
  }
};