const { z } = require('zod');

// Common Schemas
const emailSchema = z.string().email('Invalid email address');

const phoneSchema = z
  .string()
  .regex(/^[0-9]{10}$/, 'Phone must be 10 digits');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');
 
// Pagination Schema
const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

module.exports = {
  // Common
  emailSchema,
  phoneSchema,
  passwordSchema,
  objectIdSchema,
  paginationSchema,
   
};