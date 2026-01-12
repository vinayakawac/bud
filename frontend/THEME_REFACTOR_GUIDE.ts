// Theme refactoring utility - semantic token mapping
// Old pattern: dark:bg-dark-bg light:bg-light-bg
// New pattern: bg-bg

export const SEMANTIC_TOKEN_MAP = {
  // Backgrounds
  'bg-dark-bg dark:bg-dark-bg light:bg-light-bg': 'bg-bg',
  'bg-dark-surface dark:bg-dark-surface light:bg-light-surface': 'bg-card',
  'bg-dark-bg/95 dark:bg-dark-bg/95 light:bg-light-bg/95': 'bg-bg/95',
  
  // Hover states
  'hover:bg-dark-surface dark:hover:bg-dark-surface light:hover:bg-light-surface': 'hover:bg-cardHover',
  
  // Text
  'text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary': 'text-textPrimary',
  'text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary': 'text-textSecondary',
  
  // Borders  
  'border-dark-border dark:border-dark-border light:border-light-border': 'border-border',
  'hover:border-dark-accent dark:hover:border-dark-accent light:hover:border-light-accent': 'hover:border-borderHover',
  
  // Accents
  'text-dark-accent dark:text-dark-accent light:text-light-accent': 'text-accent',
  'bg-dark-accent dark:bg-dark-accent light:bg-light-accent': 'bg-accent',
  'bg-dark-accent/10 dark:bg-dark-accent/10 light:bg-light-accent/10': 'bg-accent/10',
  
  // Focus
  'focus:border-dark-accent dark:focus:border-dark-accent light:focus:border-light-accent': 'focus:border-accent',
};

// Instructions for manual refactoring:
// 1. Find and replace all instances using the map above
// 2. Remove all `dark:` and `light:` variants
// 3. Use semantic tokens only: bg-bg, bg-card, text-textPrimary, border-border, etc.
