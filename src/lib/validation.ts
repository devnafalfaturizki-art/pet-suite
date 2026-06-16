import { z } from 'zod';

// ============================================================
// Shared Validation Schemas
// ============================================================

export const uuidSchema = z.string().uuid('Invalid UUID');

export const emailSchema = z.string().email('Invalid email address');

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-()]{7,20}$/, 'Invalid phone number')
  .optional();

export const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)');

export const timeStringSchema = z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)');

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// ============================================================
// Address Schema
// ============================================================

export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required').max(255),
  city: z.string().min(1, 'City is required').max(100),
  province: z.string().min(1, 'Province is required').max(100),
  postalCode: z.string().regex(/^\d{5}$/, 'Invalid postal code').optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;

// ============================================================
// Price & Money Schema
// ============================================================

export const priceSchema = z.number().min(0, 'Price must be non-negative').max(999999999);

export const quantitySchema = z.number().int().min(0, 'Quantity must be non-negative');

export const percentageSchema = z.number().min(0).max(100);

// ============================================================
// Status Machine Helper
// ============================================================

/**
 * Creates a Zod schema that validates status transitions.
 * @param transitions - Map of current status to allowed next statuses
 */
export function createStatusMachine<T extends string>(
  transitions: Record<T, T[]>
) {
  return {
    canTransition: (from: T, to: T): boolean => {
      const allowed = transitions[from];
      return allowed ? allowed.includes(to) : false;
    },
    getNextStates: (current: T): T[] => {
      return transitions[current] ?? [];
    },
    validateTransition: (from: T, to: T): { valid: boolean; error?: string } => {
      if (from === to) {
        return { valid: true };
      }
      const allowed = transitions[from];
      if (!allowed) {
        return { valid: false, error: `No transitions allowed from '${from}'` };
      }
      if (!allowed.includes(to)) {
        return {
          valid: false,
          error: `Cannot transition from '${from}' to '${to}'. Allowed: ${allowed.join(', ')}`,
        };
      }
      return { valid: true };
    },
  };
}