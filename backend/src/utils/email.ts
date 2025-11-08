import nodemailer from 'nodemailer';
import { logger } from './logger';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates
const templates = {
  'email-verification': (data: any) => ({
    subject: 'Verify your ImmoConnect account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ea5e9;">Welcome to ImmoConnect!</h2>
        <p>Hi ${data.firstName},</p>
        <p>Thank you for registering with ImmoConnect. Please verify your email address by clicking the link below:</p>
        <a href="${process.env.APP_URL}/verify-email?token=${data.verificationToken}" 
           style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Verify Email
        </a>
        <p>If you didn't create an account, please ignore this email.</p>
        <p>Best regards,<br>The ImmoConnect Team</p>
      </div>
    `
  }),
  
  'password-reset': (data: any) => ({
    subject: 'Reset your ImmoConnect password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ea5e9;">Password Reset Request</h2>
        <p>Hi ${data.firstName},</p>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <a href="${process.env.APP_URL}/reset-password?token=${data.resetToken}" 
           style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The ImmoConnect Team</p>
      </div>
    `
  }),
  
  'welcome': (data: any) => ({
    subject: 'Welcome to ImmoConnect!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ea5e9;">Welcome to ImmoConnect!</h2>
        <p>Hi ${data.firstName},</p>
        <p>Your account has been successfully verified. You can now start using ImmoConnect to find your perfect property or list your own.</p>
        <a href="${process.env.APP_URL}/dashboard" 
           style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Go to Dashboard
        </a>
        <p>Best regards,<br>The ImmoConnect Team</p>
      </div>
    `
  }),
  
  'new-message': (data: any) => ({
    subject: 'New message on ImmoConnect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ea5e9;">New Message</h2>
        <p>Hi ${data.firstName},</p>
        <p>You have received a new message from ${data.senderName} regarding your property listing.</p>
        <a href="${process.env.APP_URL}/messages" 
           style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          View Message
        </a>
        <p>Best regards,<br>The ImmoConnect Team</p>
      </div>
    `
  })
};

export interface EmailOptions {
  to: string;
  subject: string;
  template?: string;
  data?: any;
  html?: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    const transporter = createTransporter();
    
    let html = options.html;
    let subject = options.subject;
    
    // Use template if provided
    if (options.template && templates[options.template as keyof typeof templates]) {
      const template = templates[options.template as keyof typeof templates](options.data || {});
      html = template.html;
      subject = template.subject;
    }
    
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.to,
      subject,
      html,
      text: options.text
    };
    
    const result = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${options.to}:`, result.messageId);
    return result;
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
};
