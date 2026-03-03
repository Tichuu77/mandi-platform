const { passwordResetTemplate } = require('../../src/templates/forgotPassword');

describe('passwordResetTemplate', () => {

  const resetUrl = 'http://localhost:3000/reset-password?token=abc123';

  it('should return correct subject and html with user name', () => {
    const user = { name: 'John Doe' };

    const result = passwordResetTemplate(user, resetUrl);

    expect(result).toBeDefined();
    expect(result.subject).toBe('Reset Your Password');
    expect(typeof result.html).toBe('string');

    // Check user name appears
    expect(result.html).toContain('Hi John Doe');

    // Check reset URL appears
    expect(result.html).toContain(resetUrl);

    // Check button text
    expect(result.html).toContain('Reset Password');
  });

  it('should fallback to "User" if name is not provided', () => {
    const user = {};

    const result = passwordResetTemplate(user, resetUrl);

    expect(result.html).toContain('Hi User');
  });

  it('should include current year in footer', () => {
    const user = { name: 'John' };

    const result = passwordResetTemplate(user, resetUrl);

    const currentYear = new Date().getFullYear();

    expect(result.html).toContain(`© ${currentYear}`);
  });

});