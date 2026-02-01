/**
 * Input Validation & Sanitization Layer
 * 
 * Defensive validation at API boundaries.
 * Guarantees: type safety, array normalization, XSS prevention.
 * 
 * PRINCIPLE: Reject early, fail clearly, never coerce silently.
 */

// ============================================================================
// VALIDATION RESULT TYPES
// ============================================================================

export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] };

export interface ValidationError {
  field: string;
  message: string;
  code: ValidationErrorCode;
}

export enum ValidationErrorCode {
  REQUIRED = 'REQUIRED',
  INVALID_TYPE = 'INVALID_TYPE',
  INVALID_FORMAT = 'INVALID_FORMAT',
  TOO_SHORT = 'TOO_SHORT',
  TOO_LONG = 'TOO_LONG',
  OUT_OF_RANGE = 'OUT_OF_RANGE',
  INVALID_ENUM = 'INVALID_ENUM',
  MALFORMED = 'MALFORMED',
  XSS_DETECTED = 'XSS_DETECTED',
  UNKNOWN_FIELD = 'UNKNOWN_FIELD',
}

// ============================================================================
// SANITIZATION HELPERS
// ============================================================================

/**
 * Strip dangerous HTML/script content
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Normalize to array, never return null/undefined
 */
export function ensureArray<T>(input: unknown): T[] {
  if (Array.isArray(input)) return input;
  if (input === null || input === undefined) return [];
  if (typeof input === 'string') {
    // Handle comma-separated strings
    const trimmed = input.trim();
    if (trimmed === '') return [];
    return trimmed.split(',').map(s => s.trim()) as T[];
  }
  return [input] as T[];
}

/**
 * Parse JSON safely, return default on failure
 */
export function safeJsonParse<T>(input: unknown, defaultValue: T): T {
  if (typeof input !== 'string') return defaultValue;
  try {
    const parsed = JSON.parse(input);
    return parsed as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Ensure boolean, never coerce truthy/falsy
 */
export function ensureBoolean(input: unknown): boolean {
  if (typeof input === 'boolean') return input;
  if (input === 'true') return true;
  if (input === 'false') return false;
  return false;
}

/**
 * Ensure integer within bounds
 */
export function ensureInt(input: unknown, min: number, max: number, defaultValue: number): number {
  const num = typeof input === 'number' ? input : parseInt(String(input), 10);
  if (isNaN(num)) return defaultValue;
  return Math.max(min, Math.min(max, Math.floor(num)));
}

// ============================================================================
// FIELD VALIDATORS
// ============================================================================

interface FieldValidator<T> {
  validate(value: unknown, fieldName: string): ValidationResult<T>;
}

export const validators = {
  /**
   * Required string with length bounds
   */
  string(options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    patternMessage?: string;
    sanitize?: boolean;
  } = {}): FieldValidator<string> {
    const { 
      required = false, 
      minLength = 0, 
      maxLength = 10000,
      pattern,
      patternMessage = 'Invalid format',
      sanitize = true,
    } = options;

    return {
      validate(value: unknown, fieldName: string): ValidationResult<string> {
        if (value === undefined || value === null || value === '') {
          if (required) {
            return { 
              success: false, 
              errors: [{ field: fieldName, message: `${fieldName} is required`, code: ValidationErrorCode.REQUIRED }] 
            };
          }
          return { success: true, data: '' };
        }

        if (typeof value !== 'string') {
          return { 
            success: false, 
            errors: [{ field: fieldName, message: `${fieldName} must be a string`, code: ValidationErrorCode.INVALID_TYPE }] 
          };
        }

        let str = sanitize ? sanitizeString(value) : value.trim();

        if (str.length < minLength) {
          return { 
            success: false, 
            errors: [{ field: fieldName, message: `${fieldName} must be at least ${minLength} characters`, code: ValidationErrorCode.TOO_SHORT }] 
          };
        }

        if (str.length > maxLength) {
          return { 
            success: false, 
            errors: [{ field: fieldName, message: `${fieldName} must be at most ${maxLength} characters`, code: ValidationErrorCode.TOO_LONG }] 
          };
        }

        if (pattern && !pattern.test(str)) {
          return { 
            success: false, 
            errors: [{ field: fieldName, message: patternMessage, code: ValidationErrorCode.INVALID_FORMAT }] 
          };
        }

        return { success: true, data: str };
      }
    };
  },

  /**
   * Email validator
   */
  email(required = true): FieldValidator<string> {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return validators.string({
      required,
      maxLength: 255,
      pattern: emailPattern,
      patternMessage: 'Invalid email format',
    });
  },

  /**
   * URL validator
   */
  url(required = false): FieldValidator<string> {
    return {
      validate(value: unknown, fieldName: string): ValidationResult<string> {
        if (value === undefined || value === null || value === '') {
          if (required) {
            return { 
              success: false, 
              errors: [{ field: fieldName, message: `${fieldName} is required`, code: ValidationErrorCode.REQUIRED }] 
            };
          }
          return { success: true, data: '' };
        }

        if (typeof value !== 'string') {
          return { 
            success: false, 
            errors: [{ field: fieldName, message: `${fieldName} must be a string`, code: ValidationErrorCode.INVALID_TYPE }] 
          };
        }

        try {
          const url = new URL(value);
          if (!['http:', 'https:'].includes(url.protocol)) {
            return { 
              success: false, 
              errors: [{ field: fieldName, message: 'URL must use http or https', code: ValidationErrorCode.INVALID_FORMAT }] 
            };
          }
          return { success: true, data: value.trim() };
        } catch {
          return { 
            success: false, 
            errors: [{ field: fieldName, message: 'Invalid URL format', code: ValidationErrorCode.INVALID_FORMAT }] 
          };
        }
      }
    };
  },

  /**
   * Integer validator
   */
  integer(options: { required?: boolean; min?: number; max?: number } = {}): FieldValidator<number> {
    const { required = false, min = -Infinity, max = Infinity } = options;

    return {
      validate(value: unknown, fieldName: string): ValidationResult<number> {
        if (value === undefined || value === null || value === '') {
          if (required) {
            return { 
              success: false, 
              errors: [{ field: fieldName, message: `${fieldName} is required`, code: ValidationErrorCode.REQUIRED }] 
            };
          }
          return { success: true, data: 0 };
        }

        const num = typeof value === 'number' ? value : parseInt(String(value), 10);
        
        if (isNaN(num) || !Number.isInteger(num)) {
          return { 
            success: false, 
            errors: [{ field: fieldName, message: `${fieldName} must be an integer`, code: ValidationErrorCode.INVALID_TYPE }] 
          };
        }

        if (num < min || num > max) {
          return { 
            success: false, 
            errors: [{ field: fieldName, message: `${fieldName} must be between ${min} and ${max}`, code: ValidationErrorCode.OUT_OF_RANGE }] 
          };
        }

        return { success: true, data: num };
      }
    };
  },

  /**
   * Boolean validator
   */
  boolean(required = false): FieldValidator<boolean> {
    return {
      validate(value: unknown, fieldName: string): ValidationResult<boolean> {
        if (value === undefined || value === null) {
          if (required) {
            return { 
              success: false, 
              errors: [{ field: fieldName, message: `${fieldName} is required`, code: ValidationErrorCode.REQUIRED }] 
            };
          }
          return { success: true, data: false };
        }

        if (typeof value === 'boolean') {
          return { success: true, data: value };
        }

        if (value === 'true') return { success: true, data: true };
        if (value === 'false') return { success: true, data: false };

        return { 
          success: false, 
          errors: [{ field: fieldName, message: `${fieldName} must be a boolean`, code: ValidationErrorCode.INVALID_TYPE }] 
        };
      }
    };
  },

  /**
   * Enum validator
   */
  enum<T extends string>(allowedValues: readonly T[], required = true): FieldValidator<T> {
    return {
      validate(value: unknown, fieldName: string): ValidationResult<T> {
        if (value === undefined || value === null || value === '') {
          if (required) {
            return { 
              success: false, 
              errors: [{ field: fieldName, message: `${fieldName} is required`, code: ValidationErrorCode.REQUIRED }] 
            };
          }
          return { success: true, data: allowedValues[0] };
        }

        if (!allowedValues.includes(value as T)) {
          return { 
            success: false, 
            errors: [{ 
              field: fieldName, 
              message: `${fieldName} must be one of: ${allowedValues.join(', ')}`, 
              code: ValidationErrorCode.INVALID_ENUM 
            }] 
          };
        }

        return { success: true, data: value as T };
      }
    };
  },

  /**
   * Array validator with item validation
   */
  array<T>(itemValidator: FieldValidator<T>, options: { 
    required?: boolean; 
    minLength?: number; 
    maxLength?: number;
  } = {}): FieldValidator<T[]> {
    const { required = false, minLength = 0, maxLength = 100 } = options;

    return {
      validate(value: unknown, fieldName: string): ValidationResult<T[]> {
        const arr = ensureArray<unknown>(value);
        
        if (arr.length === 0 && required) {
          return { 
            success: false, 
            errors: [{ field: fieldName, message: `${fieldName} is required`, code: ValidationErrorCode.REQUIRED }] 
          };
        }

        if (arr.length < minLength) {
          return { 
            success: false, 
            errors: [{ field: fieldName, message: `${fieldName} must have at least ${minLength} items`, code: ValidationErrorCode.TOO_SHORT }] 
          };
        }

        if (arr.length > maxLength) {
          return { 
            success: false, 
            errors: [{ field: fieldName, message: `${fieldName} must have at most ${maxLength} items`, code: ValidationErrorCode.TOO_LONG }] 
          };
        }

        const validatedItems: T[] = [];
        const errors: ValidationError[] = [];

        for (let i = 0; i < arr.length; i++) {
          const result = itemValidator.validate(arr[i], `${fieldName}[${i}]`);
          if (result.success) {
            validatedItems.push(result.data);
          } else {
            errors.push(...result.errors);
          }
        }

        if (errors.length > 0) {
          return { success: false, errors };
        }

        return { success: true, data: validatedItems };
      }
    };
  },

  /**
   * UUID validator
   */
  uuid(required = true): FieldValidator<string> {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return validators.string({
      required,
      pattern: uuidPattern,
      patternMessage: 'Invalid UUID format',
      sanitize: false,
    });
  },
};

// ============================================================================
// SCHEMA VALIDATOR
// ============================================================================

type SchemaDefinition<T> = {
  [K in keyof T]: FieldValidator<T[K]>;
};

interface SchemaOptions {
  allowUnknownFields?: boolean;
}

/**
 * Validate object against schema
 */
export function validateSchema<T extends Record<string, unknown>>(
  data: unknown,
  schema: SchemaDefinition<T>,
  options: SchemaOptions = {}
): ValidationResult<T> {
  const { allowUnknownFields = false } = options;

  if (data === null || data === undefined || typeof data !== 'object') {
    return {
      success: false,
      errors: [{ field: 'body', message: 'Request body must be an object', code: ValidationErrorCode.MALFORMED }],
    };
  }

  const inputData = data as Record<string, unknown>;
  const errors: ValidationError[] = [];
  const validatedData: Partial<T> = {};

  // Check for unknown fields
  if (!allowUnknownFields) {
    const knownFields = new Set(Object.keys(schema));
    for (const key of Object.keys(inputData)) {
      if (!knownFields.has(key)) {
        errors.push({
          field: key,
          message: `Unknown field: ${key}`,
          code: ValidationErrorCode.UNKNOWN_FIELD,
        });
      }
    }
  }

  // Validate known fields
  for (const [fieldName, validator] of Object.entries(schema)) {
    const result = (validator as FieldValidator<unknown>).validate(inputData[fieldName], fieldName);
    if (result.success) {
      (validatedData as Record<string, unknown>)[fieldName] = result.data;
    } else {
      errors.push(...result.errors);
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: validatedData as T };
}

// ============================================================================
// PRE-BUILT SCHEMAS
// ============================================================================

export const schemas = {
  /**
   * Project creation schema
   */
  createProject: {
    title: validators.string({ required: true, minLength: 3, maxLength: 200 }),
    description: validators.string({ required: true, minLength: 10, maxLength: 10000 }),
    techStack: validators.array(validators.string({ maxLength: 50 }), { required: true, minLength: 1 }),
    category: validators.string({ required: true, maxLength: 100 }),
    previewImages: validators.array(validators.url(false), { maxLength: 10 }),
    externalLink: validators.url(false),
    isPublic: validators.boolean(false),
  },

  /**
   * Project update schema
   */
  updateProject: {
    title: validators.string({ minLength: 3, maxLength: 200 }),
    description: validators.string({ minLength: 10, maxLength: 10000 }),
    techStack: validators.array(validators.string({ maxLength: 50 })),
    category: validators.string({ maxLength: 100 }),
    previewImages: validators.array(validators.url(false), { maxLength: 10 }),
    externalLink: validators.url(false),
    isPublic: validators.boolean(false),
  },

  /**
   * User registration schema
   */
  registerCreator: {
    name: validators.string({ required: true, minLength: 2, maxLength: 100 }),
    email: validators.email(true),
    username: validators.string({ 
      required: true, 
      minLength: 3, 
      maxLength: 30,
      pattern: /^[a-zA-Z0-9_-]+$/,
      patternMessage: 'Username can only contain letters, numbers, hyphens, and underscores',
    }),
    password: validators.string({ required: true, minLength: 8, maxLength: 128 }),
  },

  /**
   * Login schema
   */
  login: {
    email: validators.email(true),
    password: validators.string({ required: true, minLength: 1, maxLength: 128 }),
  },

  /**
   * Rating submission schema
   */
  createRating: {
    rating: validators.integer({ required: true, min: 1, max: 5 }),
    feedback: validators.string({ maxLength: 2000 }),
  },

  /**
   * Comment creation schema
   */
  createComment: {
    content: validators.string({ required: true, minLength: 1, maxLength: 5000 }),
    name: validators.string({ required: true, minLength: 1, maxLength: 100 }),
    email: validators.email(true),
    parentId: validators.uuid(false),
  },

  /**
   * Contact message schema
   */
  contactMessage: {
    name: validators.string({ required: true, minLength: 2, maxLength: 100 }),
    email: validators.email(true),
    message: validators.string({ required: true, minLength: 10, maxLength: 5000 }),
  },
};

// ============================================================================
// RESPONSE HELPERS
// ============================================================================

import { NextResponse } from 'next/server';

/**
 * Return validation error response
 */
export function validationError(errors: ValidationError[]) {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      validationErrors: errors,
    },
    { status: 400 }
  );
}
