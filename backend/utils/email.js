import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let cachedTransporter = null;

export const createTransporter = () => {
  if (cachedTransporter) return cachedTransporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, SMTP_FROM } = process.env;

  const port = Number(SMTP_PORT || 587);
  // If SMTP_SECURE not provided, infer from port (465 => secure)
  const secure = SMTP_SECURE != null
    ? String(SMTP_SECURE).toLowerCase() === 'true'
    : port === 465;

  if (!SMTP_HOST) {
    console.warn('[email] SMTP_HOST is not set. Configure SMTP_* env vars.');
  }
  if (!SMTP_USER || !SMTP_PASS) {
    console.warn('[email] SMTP_USER/SMTP_PASS not set. Auth may fail unless your server allows unauthenticated relay.');
  }
  if (!SMTP_FROM && SMTP_USER) {
    // Not an error; we will fall back to SMTP_USER as From
  }

  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
  });
  return cachedTransporter;
};

export const sendEmail = async ({ to, subject, html, text, from }) => {
  const transporter = createTransporter();
  const defaultFrom = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@igisura.com';
  const message = {
    from: from || defaultFrom,
    to,
    subject,
    text: text || undefined,
    html: html || undefined
  };
  return transporter.sendMail(message);
};

export const renderTemplate = (templateFn, data) => {
  const { subject, html, text } = templateFn(data);
  return { subject, html, text };
};

// Registry to allow future modules to plug in templates by key
export const EmailTemplates = {
  orderStatusChanged: ({ customerName, orderId, prevStatus, newStatus }) => {
    const pretty = (s) => String(s || '').replace(/_/g, ' ').toUpperCase();
    const subject = `Your order #${orderId} status updated to ${pretty(newStatus)}`;

    // Resolve template file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const templatePath = path.resolve(__dirname, '..', 'templates', 'order-status.html');
    let html = fs.readFileSync(templatePath, 'utf8');
    html = html
      .replace(/{{orderId}}/g, String(orderId))
      .replace(/{{customerName}}/g, customerName || 'there')
      .replace(/{{prevStatusPretty}}/g, pretty(prevStatus))
      .replace(/{{newStatusPretty}}/g, pretty(newStatus));

    const text = `Hello\nYour order #${orderId} status changed from ${pretty(prevStatus)} to ${pretty(newStatus)}.`;
    return { subject, html, text };
  }
};

export const sendTemplatedEmail = async (templateKey, templateData, options = {}) => {
  const template = EmailTemplates[templateKey];
  if (!template) throw new Error(`Unknown email template: ${templateKey}`);
  const { subject, html, text } = renderTemplate(template, templateData);
  return sendEmail({ subject, html, text, ...options });
};


    // in backend/utils/email.js (temporary)
    createTransporter().verify((err, success) => {
        if (err) console.error('SMTP verify error:', err.message);
        else console.log('SMTP connection ready:', success);
      });