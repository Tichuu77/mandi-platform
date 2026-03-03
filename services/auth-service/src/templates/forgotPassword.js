const passwordResetTemplate = (user, resetUrl) => {
  const subject = "Reset Your Password";

  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Password Reset</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:40px auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <tr>
          <td style="background:#4f46e5; padding:20px; text-align:center;">
            <h1 style="color:#ffffff; margin:0; font-size:22px;">
              Password Reset Request
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:30px; color:#333333;">
            <p style="font-size:16px; margin-bottom:15px;">
              Hi ${user.name || "User"},
            </p>

            <p style="font-size:14px; line-height:1.6; margin-bottom:20px;">
              We received a request to reset your password. Click the button below to set a new password.
            </p>

            <!-- Button -->
            <div style="text-align:center; margin:30px 0;">
              <a href="${resetUrl}" 
                 style="background:#4f46e5; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:5px; font-size:14px; display:inline-block;">
                Reset Password
              </a>
            </div>

            <p style="font-size:13px; color:#666; line-height:1.6;">
              If you didn’t request this, you can safely ignore this email. 
              This password reset link will expire soon for security reasons.
            </p>

            <p style="font-size:13px; color:#999; margin-top:25px;">
              If the button above doesn’t work, copy and paste this URL into your browser:
            </p>

            <p style="font-size:12px; word-break:break-all; color:#4f46e5;">
              ${resetUrl}
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f4f6f8; padding:15px; text-align:center; font-size:12px; color:#999;">
            © ${new Date().getFullYear()} Your Company. All rights reserved.
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

  return { subject, html };
};

module.exports = { passwordResetTemplate };