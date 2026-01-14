/**
 * Normalize techStack to always return a string array
 * Handles: arrays, JSON strings, plain strings, null/undefined
 */
export function normalizeTechStack(value: unknown): string[] {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return [value];
    }
  }

  return [];
}

/**
 * Normalize previewImages to always return a string array
 */
export function normalizePreviewImages(value: unknown): string[] {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      // Handle comma-separated strings
      return value.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  return [];
}
