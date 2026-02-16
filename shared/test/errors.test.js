const errors = require('../utils/errors');

describe('Custom Errors', () => {

    const errorCases = [
        { Class: errors.ValidationError, name: 'ValidationError', code: 400 },
        { Class: errors.AuthenticationError, name: 'AuthenticationError', code: 401 },
        { Class: errors.AuthorizationError, name: 'AuthorizationError', code: 403 },
        { Class: errors.NotFoundError, name: 'NotFoundError', code: 404 },
        { Class: errors.ConflictError, name: 'ConflictError', code: 409 },
        { Class: errors.DatabaseError, name: 'DatabaseError', code: 500 },
    ];

    errorCases.forEach(({ Class, name, code }) => {
        test(`${name} should work correctly`, () => {
            const error = new Class('Test message');

            expect(error).toBeInstanceOf(Error);
            expect(error.name).toBe(name);
            expect(error.message).toBe('Test message');
            expect(error.statusCode).toBe(code);
            expect(error.stack).toBeDefined();
        });
    });

});
