const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// The three parameters — email, name, otp — are what authController.js passes in
async function sendOtpEmail(email, name, otp) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing from environment variables");
  }

  // We use the exact same parameter names throughout — email, name, otp
  await resend.emails.send({
    from: "onboarding@resend.dev", // Free Resend sender, works for testing
    to: email,                      // ✅ 'email' not 'userEmail'
    subject: "Your OTP Code - Focus Trax",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2>Hi ${name} 👋</h2>
        <p>Your One-Time Password (OTP) for signing up is:</p>
        <h1 style="letter-spacing: 8px; color: #f97316;">${otp}</h1>
        <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>
    `,   // ✅ 'otp' not 'otpCode'
  });
}

module.exports = sendOtpEmail;