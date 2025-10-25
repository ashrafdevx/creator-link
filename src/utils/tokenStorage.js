/**
 * Token Storage Utilities
 * Handles JWT token storage, retrieval, and validation
 */

import { toast } from "sonner";

const TOKEN_KEY = "creatorlink_tokens";
const USER_KEY = "creatorlink_user";

/**
 * Decode JWT token to get expiration time
 */
const decodeJWTExpiration = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);

    // JWT exp is in seconds, convert to milliseconds
    return decoded.exp ? decoded.exp * 1000 : null;
  } catch (error) {
    console.error("Failed to decode JWT token:", error);
    return null;
  }
};

/**
 * Store authentication tokens and user data
 */
export const setTokens = (tokens, user = null) => {
  try {
    // Get actual expiration from JWT token
    const jwtExpiration = decodeJWTExpiration(tokens.accessToken);

    const tokenData = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: jwtExpiration || Date.now() + 15 * 60 * 1000, // Use JWT exp or fallback to 15 minutes
      storedAt: Date.now(),
    };

    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));

    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    return true;
  } catch (error) {
    console.error("Failed to store tokens:", error);
    toast.error("Failed to store session");
    return false;
  }
};

/**
 * Retrieve stored tokens
 */
export const getTokens = () => {
  try {
    const tokenData = localStorage.getItem(TOKEN_KEY);
    return tokenData ? JSON.parse(tokenData) : null;
  } catch (error) {
    console.error("Failed to retrieve tokens:", error);
    toast.error("Failed to read session");
    return null;
  }
};

/**
 * Get the access token
 */
export const getAccessToken = () => {
  const tokens = getTokens();
  return tokens?.accessToken || null;
};

/**
 * Get the refresh token
 */
export const getRefreshToken = () => {
  const tokens = getTokens();
  return tokens?.refreshToken || null;
};

/**
 * Check if access token is expired
 */
export const isTokenExpired = () => {
  const tokens = getTokens();
  if (!tokens || !tokens.expiresAt) return true;

  // Add 1 minute buffer to refresh before expiration
  return Date.now() >= tokens.expiresAt - 60000;
};

/**
 * Check if tokens exist and are valid
 */
export const hasValidTokens = () => {
  const tokens = getTokens();
  return tokens && tokens.accessToken && tokens.refreshToken;
};

/**
 * Get stored user data
 */
export const getStoredUser = () => {
  try {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Failed to retrieve user data:", error);
    toast.error("Failed to read profile from storage");
    return null;
  }
};

/**
 * Update stored user data
 */
export const setStoredUser = (user) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return true;
  } catch (error) {
    console.error("Failed to store user data:", error);
    toast.error("Failed to save profile locally");
    return false;
  }
};

/**
 * Clear all stored authentication data
 */
export const clearTokens = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear tokens:", error);
    toast.error("Failed to clear session");
    return false;
  }
};

/**
 * Check if user is authenticated (has valid tokens)
 */
export const isAuthenticated = () => {
  return hasValidTokens() && !isTokenExpired();
};

/**
 * Get authorization header for API requests
 */
export const getAuthHeader = () => {
  const accessToken = getAccessToken();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
};

// /**
//  * Token Storage Utilities
//  * Handles JWT token storage, retrieval, and validation
//  */

// const TOKEN_KEY = 'creatorlink_tokens';
// const USER_KEY = 'creatorlink_user';

// /**
//  * Store authentication tokens and user data
//  */
// export const setTokens = (tokens, user = null) => {
//   try {
//     const tokenData = {
//       accessToken: tokens.accessToken,
//       refreshToken: tokens.refreshToken,
//       expiresAt: Date.now() + (15 * 60 * 1000), // 15 minutes from now
//       storedAt: Date.now()
//     };

//     localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));

//     if (user) {
//       localStorage.setItem(USER_KEY, JSON.stringify(user));
//     }

//     return true;
//   } catch (error) {
//     console.error('Failed to store tokens:', error);
//     return false;
//   }
// };

// /**
//  * Retrieve stored tokens
//  */
// export const getTokens = () => {
//   try {
//     const tokenData = localStorage.getItem(TOKEN_KEY);
//     return tokenData ? JSON.parse(tokenData) : null;
//   } catch (error) {
//     console.error('Failed to retrieve tokens:', error);
//     return null;
//   }
// };

// /**
//  * Get the access token
//  */
// export const getAccessToken = () => {
//   const tokens = getTokens();
//   return tokens?.accessToken || null;
// };

// /**
//  * Get the refresh token
//  */
// export const getRefreshToken = () => {
//   const tokens = getTokens();
//   return tokens?.refreshToken || null;
// };

// /**
//  * Check if access token is expired
//  */
// export const isTokenExpired = () => {
//   const tokens = getTokens();
//   if (!tokens || !tokens.expiresAt) return true;

//   // Add 1 minute buffer to refresh before expiration
//   return Date.now() >= (tokens.expiresAt - 60000);
// };

// /**
//  * Check if tokens exist and are valid
//  */
// export const hasValidTokens = () => {
//   const tokens = getTokens();
//   return tokens && tokens.accessToken && tokens.refreshToken;
// };

// /**
//  * Get stored user data
//  */
// export const getStoredUser = () => {
//   try {
//     const userData = localStorage.getItem(USER_KEY);
//     return userData ? JSON.parse(userData) : null;
//   } catch (error) {
//     console.error('Failed to retrieve user data:', error);
//     return null;
//   }
// };

// /**
//  * Update stored user data
//  */
// export const setStoredUser = (user) => {
//   try {
//     localStorage.setItem(USER_KEY, JSON.stringify(user));
//     return true;
//   } catch (error) {
//     console.error('Failed to store user data:', error);
//     return false;
//   }
// };

// /**
//  * Clear all stored authentication data
//  */
// export const clearTokens = () => {
//   try {
//     localStorage.removeItem(TOKEN_KEY);
//     localStorage.removeItem(USER_KEY);
//     return true;
//   } catch (error) {
//     console.error('Failed to clear tokens:', error);
//     return false;
//   }
// };

// /**
//  * Check if user is authenticated (has valid tokens)
//  */
// export const isAuthenticated = () => {
//   return hasValidTokens() && !isTokenExpired();
// };

// /**
//  * Get authorization header for API requests
//  */
// export const getAuthHeader = () => {
//   const accessToken = getAccessToken();
//   return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
// };
