const nodemailer = require('nodemailer');

/**
 * Best-effort email sender.
 * This project should not crash if SMTP credentials are invalid in dev/test.
 */
const isDeliverableEmail = (email = '') => {
  const value = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return false;
  }
  // Skip known placeholder/local domains that frequently bounce.
  if (value.endsWith('@movie.com') || value.endsWith('.local') || value.endsWith('@example.com')) {
    return false;
  }
  return true;
};

const sendMail = async (recieverMail, subjectofMail, body) => {
  try {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || 'MovieHub <no-reply@moviehub.local>';

    if (!host || !user || !pass) {
      console.warn("Email skipped: SMTP credentials are not configured.");
      return null;
    }

    // connect with the smtp
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    if (!isDeliverableEmail(recieverMail)) {
      console.warn("Email skipped: recipient is not deliverable ->", recieverMail);
      return null;
    }

    const info = await transporter.sendMail({
      from,
      to: recieverMail,
      subject: subjectofMail,
      text: body,
    });

    console.log("Email sent to:", recieverMail, "id:", info?.messageId);
    return info;
  } catch (err) {
    console.warn("Email send failed (ignored):", err?.message || err);
    return null;
  }
};

sendMail.isDeliverableEmail = isDeliverableEmail;

module.exports = sendMail;