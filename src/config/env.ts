/**
 * Environment configuration
 * Reads from Expo environment variables with safe fallback defaults.
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export { API_BASE_URL };
