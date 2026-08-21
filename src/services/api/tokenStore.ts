import * as SecureStore from 'expo-secure-store';

/**
 * Token storage keys for expo-secure-store.
 * Secure storage is used for auth tokens to prevent extraction.
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@as_associates:access_token',
  REFRESH_TOKEN: '@as_associates:refresh_token',
} as const;

/**
 * Retrieves the access token from secure storage.
 * @returns The access token string, or null if not found.
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  } catch {
    return null;
  }
}

/**
 * Stores the access token in secure storage.
 * @param token - The access token to persist.
 */
export async function setAccessToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token);
}

/**
 * Retrieves the refresh token from secure storage.
 * @returns The refresh token string, or null if not found.
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  } catch {
    return null;
  }
}

/**
 * Stores the refresh token in secure storage.
 * @param token - The refresh token to persist.
 */
export async function setRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token);
}

/**
 * Clears both access and refresh tokens from secure storage.
 * Called on logout or when refresh fails permanently.
 */
export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
    SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
  ]);
}
