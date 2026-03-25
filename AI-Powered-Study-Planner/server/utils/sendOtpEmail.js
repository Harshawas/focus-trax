const nodemailer = require("nodemailer");

function createTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER or EMAIL_PASS is missing");
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
}

async function sendOtpEmail(email, name, otp) {
  const transporter = createTransporter();

  await transporter.verify();

  await transporter.sendMail({
    from: `"Focus Trax" <${process.env.EMAIL_USER}>`,
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
      </div>
    `,
  });
}

module.exports = sendOtpEmail;