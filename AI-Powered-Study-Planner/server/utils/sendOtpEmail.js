const nodemailer = require("nodemailer");

async function sendOtpEmail(email, name, otp) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER or EMAIL_PASS environment variables are missing");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Focus Trax" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code - Focus Trax",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2>Hi ${name} 👋</h2>
        <p>Your One-Time Password (OTP) for signing up is:</p>
        <h1 style="letter-spacing: 8px; color: #f97316;">${otp}</h1>
        <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Nodemailer Error:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

module.exports = sendOtpEmail;