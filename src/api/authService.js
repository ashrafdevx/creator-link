/**
 * Authentication Service
 * Updated to use custom JWT authentication with automatic token management
 */

import { makeAuthenticatedRequest, getValidAccessToken } from '@/utils/authUtils.js';

const createAuthService = () => {
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  // Validate base URL on initialization
  if (!baseURL) {
    console.error("VITE_API_BASE_URL is not defined in environment variables");
  }

  const makeRequest = async (endpoint, options = {}) => {
    if (!baseURL) {
      throw new Error("API base URL is not configured");
    }

    const url = `${baseURL}${endpoint}`;

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Merge options and headers
    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {}),
      },
    };

    // Remove any headers explicitly set to null/undefined (e.g. to omit Content-Type)
    Object.keys(requestOptions.headers).forEach((k) => {
      if (requestOptions.headers[k] == null) {
        delete requestOptions.headers[k];
      }
    });

    // Debug logging
    console.log(`Making ${requestOptions.method || "GET"} request to:`, url);
    if (requestOptions.body) {
      console.log("Request body:", requestOptions.body);
    }

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        let errorData = null;

        try {
          errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error(`API Error Response (${response.status}):`, errorData);
        } catch {
          try {
            const errorText = await response.text();
            console.error(
              `Non-JSON Error Response (${response.status}):`,
              errorText
            );
            errorMessage = errorText || response.statusText || errorMessage;
          } catch {
            errorMessage = response.statusText || errorMessage;
          }
        }

        // Same specific errors as original
        if (response.status === 400) {
          throw new Error(errorMessage || "Bad Request - Invalid data format");
        }
        if (response.status === 401) {
          throw new Error("Unauthorized - please sign in again");
        }
        if (response.status === 404) {
          throw new Error("User not found");
        }
        if (response.status === 403) {
          throw new Error("Access forbidden - insufficient permissions");
        }
        if (response.status >= 500) {
          throw new Error("Server error - please try again later");
        }

        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      // Only log non-401 errors to avoid spam in console
      if (!String(error?.message || "").includes("Unauthorized")) {
        console.error(`API Request failed (${endpoint}):`, error);
      }
      throw error;
    }
  };

  const getCurrentUser = async () => {
    try {
      const response = await makeAuthenticatedRequest("/api/auth/me");
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get current user: ${error.message}`);
    }
  };

  // Create user is no longer needed in JWT flow - users are created during registration
  const createUser = async (userData = {}) => {
    console.warn('createUser is deprecated in JWT auth. Use register instead.');
    throw new Error('createUser is not supported in JWT auth flow. Use register instead.');
  };

  // Alternative createUser method - also deprecated
  const createUserNoBody = async () => {
    console.warn('createUserNoBody is deprecated in JWT auth. Users are created during registration.');
    throw new Error('createUserNoBody is not supported in JWT auth flow.');
  };

  const updateOwnRole = async (role) => {
    if (!role) throw new Error("Role is required");
    
    try {
      const response = await makeAuthenticatedRequest("/api/auth/profile/role", {
        method: "PUT",
        body: JSON.stringify({ role }),
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to update role: ${error.message}`);
    }
  };

  const updateUserRole = async (userId, role) => {
    if (!userId) throw new Error("User ID is required");
    if (!role) throw new Error("Role is required");
    
    try {
      const response = await makeAuthenticatedRequest(`/api/auth/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role }),
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to update user role: ${error.message}`);
    }
  };

  const getAllUsers = async () => {
    try {
      const response = await makeAuthenticatedRequest("/api/auth/users");
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  };

  return {
    makeRequest,
    getCurrentUser,
    createUser,
    createUserNoBody,
    updateOwnRole,
    updateUserRole,
    getAllUsers,
  };
};

// Export the same way you used the class instance before
export const authService = createAuthService();

// // src/api/authService.js
// export const createAuthService = () => {
//   const rawBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
//   if (!rawBase) {
//     console.error("VITE_API_BASE_URL is not defined in environment variables");
//   }

//   // Default to '/api' unless base already ends with '/api'
//   const baseHasApi = /\/api\/?$/.test(rawBase);
//   const apiPrefix = baseHasApi ? "" : "/api";

//   const urlFor = (endpoint /* e.g. "/auth/me" */) =>
//     `${rawBase}${apiPrefix}${endpoint}`;

//   const makeRequest = async (endpoint, options = {}) => {
//     if (!rawBase) throw new Error("API base URL is not configured");

//     const url = urlFor(endpoint);

//     const defaultOptions = {
//       headers: { "Content-Type": "application/json" },
//     };

//     const requestOptions = {
//       ...defaultOptions,
//       ...options,
//       headers: {
//         ...defaultOptions.headers,
//         ...(options.headers || {}),
//       },
//     };

//     console.log(`Making ${requestOptions.method || "GET"} request to:`, url);
//     if (requestOptions.body) console.log("Request body:", requestOptions.body);

//     try {
//       const res = await fetch(url, requestOptions);

//       if (!res.ok) {
//         let errorMessage = `HTTP ${res.status}`;

//         try {
//           const data = await res.json();
//           console.error(`API Error Response (${res.status}):`, data);
//           errorMessage = data.message || data.error || errorMessage;
//         } catch {
//           try {
//             const text = await res.text();
//             console.error(`Non-JSON Error Response (${res.status}):`, text);
//             errorMessage = text || res.statusText || errorMessage;
//           } catch {
//             errorMessage = res.statusText || errorMessage;
//           }
//         }

//         if (res.status === 400)
//           throw new Error(errorMessage || "Bad Request - Invalid data format");
//         if (res.status === 401)
//           throw new Error("Unauthorized - please sign in again");
//         if (res.status === 403)
//           throw new Error("Access forbidden - insufficient permissions");
//         if (res.status === 404) throw new Error("Route not found");
//         if (res.status >= 500)
//           throw new Error("Server error - please try again later");

//         throw new Error(errorMessage);
//       }

//       return await res.json();
//     } catch (err) {
//       if (!String(err.message || "").includes("Unauthorized")) {
//         console.error(`API Request failed (${endpoint}):`, err);
//       }
//       throw err;
//     }
//   };

//   const authHeader = (token) => {
//     if (!token) throw new Error("Session token is required");
//     return { Authorization: `Bearer ${token}` };
//   };

//   // ---- PUBLIC API (unchanged signatures) ----
//   const getCurrentUser = (token) =>
//     makeRequest("/auth/me", {
//       method: "GET",
//       headers: authHeader(token),
//     });

//   const createUser = (token, userData = {}) =>
//     makeRequest("/auth/create-user", {
//       method: "POST",
//       headers: authHeader(token),
//       body: JSON.stringify(userData),
//     });

//   const createUserNoBody = (token) =>
//     makeRequest("/auth/create-user", {
//       method: "POST",
//       headers: {
//         ...authHeader(token),
//         "Content-Type": undefined, // no body
//       },
//     });

//   const updateOwnRole = (role, token) => {
//     if (!role) throw new Error("Role is required");
//     return makeRequest("/api/auth/profile/role", {
//       method: "PUT",
//       headers: authHeader(token),
//       body: JSON.stringify({ role }),
//     });
//   };

//   const updateUserRole = (userId, role, token) => {
//     if (!userId) throw new Error("User ID is required");
//     if (!role) throw new Error("Role is required");
//     return makeRequest(`/auth/users/${userId}/role`, {
//       method: "PUT",
//       headers: authHeader(token),
//       body: JSON.stringify({ role }),
//     });
//   };

//   const getAllUsers = (token) =>
//     makeRequest("/auth/users", {
//       method: "GET",
//       headers: authHeader(token),
//     });

//   return {
//     makeRequest,
//     getCurrentUser,
//     createUser,
//     createUserNoBody,
//     updateOwnRole,
//     updateUserRole,
//     getAllUsers,
//   };
// };

// export const authService = createAuthService();
