const nodemailer = require("nodemailer");

function createTransporter() {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS ||
    !process.env.EMAIL_FROM
  ) {
    throw new Error("SMTP environment variables are missing");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

async function sendOtpEmail(email, name, otp) {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"Focus Trax" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Verify your Focus Trax account",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #111827;">
        <h2 style="margin-bottom: 12px;">Hello ${name},</h2>
        <p style="font-size: 15px; line-height: 1.6;">
          Your OTP for Focus Trax account verification is:
        </p>
        <div style="margin: 24px 0; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #d97706;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #4b5563;">
          This OTP is valid for 10 minutes.
        </p>
        <p style="font-size: 14px; color: #4b5563;">
          If you did not request this, please ignore this email.
        </p>
      </div>
    `,
  });
}

module.exports = sendOtpEmail;