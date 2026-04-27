/**
 * Application constants and configuration
 */

export const APP_NAME = 'AssetGuard';
export const APP_VERSION = '1.0.0';

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.assetguard.local';
export const API_TIMEOUT = 30000; // 30 seconds

// Database Configuration
export const DB_NAME = 'assetguard.db';
export const DB_VERSION = 1;

// Sync Configuration
export const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
export const SYNC_RETRY_LIMIT = 3;
export const SYNC_RETRY_DELAY = 5000; // 5 seconds

// Storage Configuration
export const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10 MB
export const PHOTO_QUALITY = 0.8;

// UI Constants
export const TOAST_DURATION = 3000;
export const ANIMATION_DURATION = 300;

// Job Constants
export const JOB_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export const JOB_STATUSES = ['pending', 'in-progress', 'completed', 'cancelled'] as const;
