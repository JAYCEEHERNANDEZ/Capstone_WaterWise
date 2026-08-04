import sgMail from "@sendgrid/mail";

function getMailConfiguration() {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM_EMAIL;

  if (!apiKey || !from) {
    const error = new Error("Password reset email is not configured.");
    error.statusCode = 500;
    throw error;
  }

  sgMail.setApiKey(apiKey);
  return { from };
}

export async function sendPasswordResetOtp({ email, otp, username }) {
  const { from } = getMailConfiguration();
  const safeUsername = String(username || "WaterWise user").replace(
    /[&<>"']/g,
    (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character],
  );

  await sgMail.send({
    to: email,
    from,
    subject: "Your WaterWise password reset code",
    text: `Hello ${username || "WaterWise user"},\n\nYour WaterWise password reset code is: ${otp}\n\nThis code expires in 10 minutes. If you did not request a password reset, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:560px;margin:auto">
        <h1 style="color:#075985">Your password reset code</h1>
        <p>Hello ${safeUsername},</p>
        <p>Enter this verification code in WaterWise. It expires in 10 minutes.</p>
        <p style="margin:28px 0;font-size:32px;letter-spacing:8px;font-weight:bold;color:#075985">${otp}</p>
        <p>If you did not request this change, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendAdminLoginOtp({ email, otp, username }) {
  const { from } = getMailConfiguration();
  const safeUsername = String(username || "Administrator").replace(
    /[&<>"']/g,
    (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character],
  );

  await sgMail.send({
    to: email,
    from,
    subject: "Your WaterWise admin sign-in code",
    text: `Hello ${username || "Administrator"},\n\nYour WaterWise admin sign-in code is: ${otp}\n\nThis code expires in 10 minutes. If you did not try to sign in, change your password immediately.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:560px;margin:auto">
        <h1 style="color:#075985">Admin sign-in verification</h1>
        <p>Hello ${safeUsername},</p>
        <p>Enter this verification code to finish signing in to the WaterWise admin portal. It expires in 10 minutes.</p>
        <p style="margin:28px 0;font-size:32px;letter-spacing:8px;font-weight:bold;color:#075985">${otp}</p>
        <p>If you did not try to sign in, change your password immediately.</p>
      </div>
    `,
  });
}
