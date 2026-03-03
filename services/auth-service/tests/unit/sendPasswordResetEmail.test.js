// tests/unit/sendPasswordResetEmail.test.js

jest.mock('../../src/config/email', () => ({
  sendMail: jest.fn(),
}));

jest.mock('../../src/templates/forgotPassword', () => ({
  passwordResetTemplate: jest.fn(),
}));

const transporter = require('../../src/config/email');
const { passwordResetTemplate } = require('../../src/templates/forgotPassword');
const { logger } = require('mandi-shared');

const sendPasswordResetEmail = require('../../src/utils/sendEmail'); // adjust path

describe('sendPasswordResetEmail Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CLIENT_URL = 'http://localhost:3000';
    process.env.SMTP_USER = 'support@test.com';
  });

  // ============================
  // SUCCESS CASE
  // ============================
  it('should send password reset email successfully', async () => {
    const user = {
      email: 'akash@test.com',
      name: 'Akash',
    };

    const resetToken = 'abc123';

    passwordResetTemplate.mockReturnValue({
      subject: 'Reset Your Password',
      html: '<p>Reset</p>',
    });

    transporter.sendMail.mockResolvedValueOnce(true);

    await sendPasswordResetEmail(user, resetToken);

    const expectedUrl =
      'http://localhost:3000/reset-password?token=abc123';

    expect(passwordResetTemplate).toHaveBeenCalledWith(
      user,
      expectedUrl
    );

    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: `"Support" <support@test.com>`,
      to: user.email,
      subject: 'Reset Your Password',
      html: '<p>Reset</p>',
    });

    expect(logger.error).not.toHaveBeenCalled();
  });

  // ============================
  // ERROR CASE
  // ============================
  it('should log error if sendMail fails', async () => {
    const user = {
      email: 'fail@test.com',
      name: 'Akash',
    };

    passwordResetTemplate.mockReturnValue({
      subject: 'Reset',
      html: '<p>Reset</p>',
    });

    transporter.sendMail.mockRejectedValueOnce(
      new Error('SMTP failed')
    );

    await sendPasswordResetEmail(user, 'token123');

    expect(logger.error).toHaveBeenCalledWith(
      'Failed to send password reset email:',
      'SMTP failed'
    );
  });
});