const User = require('../models/user');
const redis = require('../config/redis');
const { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } = require('../utils/jwt');
const { ValidationError, AuthenticationError, ConflictError } = require('mandi-shared').errors;
const { logger } = require('mandi-shared');
const { generatePasswordResetToken,comparePasswordResetToken } = require('../utils/bycript');
const {
    publishUserRegistered,
    publishUserLoggedIn,
    publishUserLoggedOut
} = require('../events/publisher');
const { sendPasswordResetEmail } = require('../utils/sendEmail');

class AuthService {
    /**
     * Register new user
     */
    async register(data) {
        try {
            // Check if user already exists
            const existingUser = await User.findOne({ email: data.email });
            if (existingUser) {
                throw new ConflictError('User with this email already exists');
            }

            // Create new user
            const user = await User.create({
                name: data.name,
                email: data.email,
                password: data.password,
                phone: data.phone,
                mandiName: data.mandiName,
                gstNumber: data.gstNumber,
                address: data.address,
            });

            if (!user) {
                throw new ValidationError('Failed to create user');
            }

            // Publish event
            await publishUserRegistered(user.toAuthJSON());

            logger.info('User registered:', user.email);

            return {
                success: true,
                message: 'Registration successful. Awaiting approval.',
                userId: user._id.toString(),
            };
        } catch (error) {
            logger.error('Registration error:', error.message);
            throw error;
        }
    }

    /**
     * Login user
     */
    async login(email, password) {
        try {
            // Find user with password field
            const user = await User.findOne({ email }).select('+password');

            if (!user) {
                throw new AuthenticationError('Invalid email or password');
            }

            // Verify password
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                throw new AuthenticationError('Invalid email or password');
            }

            // Check if user is active
            if (user.status !== 'active') {
                throw new AuthenticationError('Account is not active. Contact administrator.');
            }


            // Generate tokens
            const payload = {
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
                tenantId: user.tenantId?.toString(),
            };

            const accessToken = generateAccessToken(payload);
            const refreshToken = generateRefreshToken(payload);

            // Save refresh token to database
            user.refreshToken = refreshToken;
            user.lastLogin = new Date();
            await user.save();

            // Store session in Redis (24 hour TTL)
            await redis.setex(
                `session:${user._id}`,
                24 * 60 * 60, // 24 hours
                JSON.stringify({
                    userId: user._id.toString(),
                    email: user.email,
                    role: user.role,
                    tenantId: user.tenantId?.toString(),
                })
            );

            // Publish event
            await publishUserLoggedIn(user.toAuthJSON());

            logger.info('User logged in:', user.email);

            return {
                success: true,
                message: 'Login successful',
                accessToken,
                refreshToken,
                user: user.toAuthJSON(),
            };
        } catch (error) {
            logger.error('Login error:', error.message);
            throw error;
        }
    }

    /**
     * Verify token
     */
    async verifyToken(token) {
        try {
            const decoded = verifyAccessToken(token);

            // Check if session exists in Redis
            const session = await redis.get(`session:${decoded.userId}`);
            if (!session) {
                throw new AuthenticationError('Session expired');
            }

            // Get user from database
            const user = await User.findById(decoded.userId);
            if (!user || user.status !== 'active') {
                throw new AuthenticationError('User not found or inactive');
            }

            return {
                valid: true,
                user: user.toAuthJSON(),
            };
        } catch (error) {
            logger.error('Token verification error:', error.message);
            throw error;
        }
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken) {
        try {
            const decoded = verifyRefreshToken(refreshToken);

            // Get user from database
            const user = await User.findById(decoded.userId);
            if (!user || user.status !== 'active') {
                throw new AuthenticationError('User not found or inactive');
            }

            // Verify refresh token matches stored token
            if (user.refreshToken !== refreshToken) {
                throw new AuthenticationError('Invalid refresh token');
            }

            // Generate new tokens
            const payload = {
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
                tenantId: user.tenantId?.toString(),
            };

            const newAccessToken = generateAccessToken(payload);
            const newRefreshToken = generateRefreshToken(payload);

            // Update refresh token in database
            user.refreshToken = newRefreshToken;
            await user.save();

            logger.info('Token refreshed for user:', user.email);

            return {
                success: true,
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            };
        } catch (error) {
            logger.error('Token refresh error:', error.message);
            throw error;
        }
    }

    /**
     * Logout user
     */
    async logout(userId, token) {
        try {
            // Remove session from Redis
            await redis.del(`session:${userId}`);

            // Remove refresh token from database
            await User.findByIdAndUpdate(userId, { refreshToken: null });

            // Publish event
            await publishUserLoggedOut(userId);

            logger.info('User logged out:', userId);

            return {
                success: true,
                message: 'Logged out successfully',
            };
        } catch (error) {
            logger.error('Logout error:', error.message);
            throw error;
        }
    }

    /**
     * Change password
     */
    async changePassword(userId, oldPassword, newPassword) {
        try {
            const user = await User.findById(userId).select('+password');
            if (!user) {
                throw new ValidationError('User not found');
            }

            // Verify old password
            const isPasswordValid = await user.comparePassword(oldPassword);
            if (!isPasswordValid) {
                throw new AuthenticationError('Current password is incorrect');
            }

            // Update password
            user.password = newPassword;
            await user.save();

            // Invalidate all sessions
            await redis.del(`session:${userId}`);
            user.refreshToken = null;
            await user.save();

            logger.info('Password changed for user:', user.email);

            return {
                success: true,
                message: 'Password changed successfully. Please login again.',
            };
        } catch (error) {
            logger.error('Change password error:', error.message);
            throw error;
        }
    }

    async forgotPassword(email) {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new ValidationError('User with this email does not exist');
            }
            const resetToken = await generatePasswordResetToken.call(user);

            if (!resetToken) {
                throw new ValidationError('Failed to generate password reset token');
            }

            // Send email
            await sendPasswordResetEmail(user, resetToken);

            await user.save();

            logger.info('Password reset token generated for user:', user.email);
            return {
                success: true,
                message: 'Password reset token generated. Check your email.',
            };

        } catch (error) {
            logger.error('Forgot password error:', error.message);
            throw error;
        }
    };


    /**
     * Reset password
     */
    async resetPassword(email, resetToken, newPassword) {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new ValidationError('User with this email does not exist');
            }

            const isTokenValid = await comparePasswordResetToken(resetToken, user);
            if (!isTokenValid) {
                throw new ValidationError('Invalid or expired password reset token');
            }

            user.password = newPassword;
            await user.save();

            logger.info('Password reset for user:', user.email);
            return {
                success: true,
                message: 'Password reset successfully. Please login again.',
            };
        } catch (error) {
            logger.error('Reset password error:', error.message);
            throw error;
        }
    };

}



module.exports = new AuthService();