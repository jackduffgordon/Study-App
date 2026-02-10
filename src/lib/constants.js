export const TIER_LIMITS = {
  free: {
    uploads: 5,
    generations: 15,
    storage: 100 * 1024 * 1024, // 100MB
    friends: 10,
  },
  pro: {
    uploads: 30,
    generations: 100,
    storage: 2 * 1024 * 1024 * 1024, // 2GB
    friends: 50,
  },
  unlimited: {
    uploads: Infinity,
    generations: Infinity,
    storage: 10 * 1024 * 1024 * 1024, // 10GB
    friends: Infinity,
  },
};

export const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
  'video/webm': ['.webm'],
};

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const MODULE_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#F8B88B', // Peach
];

export const MODULE_ICONS = [
  'BookOpen',
  'Lightbulb',
  'Beaker',
  'Code',
  'Music',
  'Palette',
  'Globe',
  'Target',
];
