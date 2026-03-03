const { generatePasswordResetToken, comparePasswordResetToken } = require('../../src/utils/bycript');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../src/models/user');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
})

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
})

beforeEach(async () => {
    await User.deleteMany({});
})

describe('test bycript', () => {
    const payload = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test1234',
        phone: '9876543210',
        mandiName: 'Test Mandi',
    };


    describe('generatePasswordResetToken', () => {
        it('should generate a password reset token', async () => {
            const user = {};

            const token = await generatePasswordResetToken(user);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');

            expect(user.passwordResetToken).toBeDefined();
            expect(user.passwordResetExpires).toBeDefined();

            expect(user.passwordResetExpires).toBeGreaterThan(Date.now());
        });
    })

    it('should throw an error if user is not found', async () => {
        let user = null;
        await expect(generatePasswordResetToken(user)).rejects.toThrow('Failed to generate password reset token');
    });

    describe('comparePasswordResetToken', () => {
        it('should compare password reset token successfully', async () => {
            const user = {};

            const token = await generatePasswordResetToken(user);

            // mock required methods
            user.getPasswordResetToken = function () {
                return this.passwordResetToken;
            };

            user.isPasswordResetTokenExpired = function () {
                return false;
            };

            const result = await comparePasswordResetToken(token, user);

            expect(result).toBe(true);
        });

        it('should return false if token is not defined', async () => {
            const user = {};

            const token = await generatePasswordResetToken(user);

            // mock required methods
            user.getPasswordResetToken = function () {
                return null;
            };

            const result = await comparePasswordResetToken(token, user);

            expect(result).toBe(false);
        });

        it('should return authentication error if token is expired', async () => {
            const user = {};

            const token = await generatePasswordResetToken(user);

            // mock required methods
            user.getPasswordResetToken = function () {
                return this.passwordResetToken;
            };

            user.isPasswordResetTokenExpired = function () {
                return true;
            };

            await expect(comparePasswordResetToken(token, user)).rejects.toThrow('Invalid or expired password reset token');
        });

        it('should return error on user undefined', async () => {
            await expect(comparePasswordResetToken('token', undefined))
                .rejects.toThrow('User not provided');
        });
    })
})