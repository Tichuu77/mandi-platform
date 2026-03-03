const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { AuthenticationError, AppError } = require('mandi-shared').errors;

const generatePasswordResetToken = async (user) => {
    try {
        const resetToken = crypto.randomBytes(32).toString('hex');

        const salt = await bcrypt.genSalt(10);
        user.passwordResetToken = await bcrypt.hash(resetToken, salt);
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

        return resetToken;
    }
    catch (error) {
        throw new AppError('Failed to generate password reset token', 500);
    }
}

const comparePasswordResetToken = async function (candidateToken, user) {
    try {
        if (!user) {
            throw new AppError('User not provided', 400);
        }

        const passwordResetToken = user.getPasswordResetToken();
        if (!passwordResetToken || !user.passwordResetExpires) {
            return false;
        }

        const isPasswordResetTokenValid = await bcrypt.compare(candidateToken, passwordResetToken);

        if (isPasswordResetTokenValid && !user.isPasswordResetTokenExpired()) {
            return true;
        }

        throw new AuthenticationError('Invalid or expired password reset token');
    }
    catch (error) {

        // ✅ Preserve known errors
        if (error instanceof AuthenticationError || error instanceof AppError) {
            throw error;
        }

        // ✅ Wrap unexpected errors only
        throw new AppError('Failed to compare password reset token', 500);
    }
};

module.exports = {
    generatePasswordResetToken,
    comparePasswordResetToken
}