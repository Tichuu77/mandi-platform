const transporter = require('../config/email');
const { passwordResetTemplate } = require('../templates/forgotPassword');
const { logger } = require('mandi-shared');

 const sendPasswordResetEmail = async (user, resetToken) => {
    try {
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        const { subject, html } = passwordResetTemplate(user, resetUrl);

        await transporter.sendMail({
            from: `"Support" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject,
            html,
        });
    }
    catch (error) {
        logger.error('Failed to send password reset email:', error.message);
    }
};

module.exports = sendPasswordResetEmail;