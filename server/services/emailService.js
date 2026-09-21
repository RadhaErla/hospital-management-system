const nodemailer = require('nodemailer');

// Create reusable transporter
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        secure: process.env.EMAIL_PORT === '465',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const mailTransporter = getTransporter();

  if (!mailTransporter) {
    console.log(`\n📧 [DEV EMAIL LOG - No SMTP configured]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text || html?.replace(/<[^>]*>?/gm, '')}`);
    console.log(`-----------------------------------------\n`);
    return { success: true, mocked: true };
  }

  try {
    const info = await mailTransporter.sendMail({
      from: process.env.EMAIL_FROM || '"AuraHealth" <noreply@aurahealth.com>',
      to,
      subject,
      text,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error.message);
    return { success: false, error: error.message };
  }
};

// Standard email templates
const sendWelcomeEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to AuraHealth Hospital Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0d9488;">Welcome to AuraHealth!</h2>
        <p>Dear ${user.name},</p>
        <p>Your account has been successfully registered in our healthcare portal with the role of <strong>${user.role}</strong>.</p>
        <p>You can now log in to manage your appointments, medical records, and healthcare communications seamlessly.</p>
        <br/>
        <p>Warm regards,<br/><strong>AuraHealth Medical Team</strong></p>
      </div>
    `,
    text: `Welcome to AuraHealth, ${user.name}! Your account as ${user.role} has been created successfully.`,
  });
};

const sendAppointmentEmail = async ({ patientEmail, patientName, doctorName, date, time, status }) => {
  return sendEmail({
    to: patientEmail,
    subject: `Appointment Update: ${status}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0d9488;">Appointment ${status}</h2>
        <p>Dear ${patientName},</p>
        <p>Your appointment with <strong>Dr. ${doctorName}</strong> has been updated to: <span style="font-weight: bold; color: #0f766e;">${status}</span>.</p>
        <table style="width: 100%; margin: 15px 0; border-collapse: collapse;">
          <tr><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Date:</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">${date}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Time Slot:</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">${time}</td></tr>
        </table>
        <p>Please arrive 15 minutes prior to your scheduled slot.</p>
        <br/>
        <p>Warm regards,<br/><strong>AuraHealth Front Desk</strong></p>
      </div>
    `,
    text: `Your appointment with Dr. ${doctorName} on ${date} at ${time} is now ${status}.`,
  });
};

const sendPrescriptionEmail = async ({ patientEmail, patientName, doctorName, date }) => {
  return sendEmail({
    to: patientEmail,
    subject: 'New Prescription Available - AuraHealth',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0d9488;">New Prescription Issued</h2>
        <p>Dear ${patientName},</p>
        <p>Dr. ${doctorName} has issued a new prescription for your consultation on ${date}.</p>
        <p>You can view and print the prescription from your patient portal dashboard anytime.</p>
        <br/>
        <p>Wishing you a speedy recovery,<br/><strong>AuraHealth Clinical Team</strong></p>
      </div>
    `,
    text: `Dr. ${doctorName} has issued a new prescription for your visit on ${date}. Log in to view it.`,
  });
};

const sendPaymentEmail = async ({ patientEmail, patientName, invoiceNumber, amount, paymentMethod }) => {
  return sendEmail({
    to: patientEmail,
    subject: `Payment Receipt: ${invoiceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0d9488;">Payment Received Successfully</h2>
        <p>Dear ${patientName},</p>
        <p>We have received your payment of <strong>$${amount}</strong> for invoice <strong>${invoiceNumber}</strong> via <strong>${paymentMethod}</strong>.</p>
        <p>Thank you for choosing AuraHealth for your healthcare services.</p>
        <br/>
        <p>Warm regards,<br/><strong>AuraHealth Billing Department</strong></p>
      </div>
    `,
    text: `Payment of $${amount} received for invoice ${invoiceNumber} via ${paymentMethod}.`,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendAppointmentEmail,
  sendPrescriptionEmail,
  sendPaymentEmail,
};
