import {
  getTokens,
  getRefreshToken,
  setTokens,
  clearTokens,
  isTokenExpired,
  getStoredUser,
  setStoredUser,
} from "./tokenStorage.js";
import { toast } from "sonner";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();

    if (data.success && data.data.tokens) {
      // Store new tokens
      setTokens(data.data.tokens, data.data.user);
      toast.success("Session refreshed");
      return data.data.tokens.accessToken;
    } else {
      throw new Error("Invalid refresh response");
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
    // Clear invalid tokens
    clearTokens();
    toast.error(error?.message || "Session refresh failed");
    throw error;
  }
};

/**
 * Get valid access token, refreshing if necessary
 */
export const getValidAccessToken = async () => {
  try {
    const tokens = getTokens();

    if (!tokens || !tokens.accessToken) {
      // toast.error("No access token found");
      return null;
    }

    // If token is not expired, return it
    if (!isTokenExpired()) {
      return tokens.accessToken;
    }

    // Try to refresh the token
    console.log("Access token expired, refreshing...");
    return await refreshAccessToken();
  } catch (error) {
    console.error("Failed to get valid access token:", error);
    toast.error("Authentication required");
    return null;
  }
};

/**
 * Make authenticated API request with automatic token refresh
 */
export const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  try {
    const accessToken = await getValidAccessToken();

    if (!accessToken) {
      clearTokens();
      window.location.href = "/auth";
      throw new Error("No valid access token available");
    }

    const requestOptions = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    };

    let response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);

    // If we get 401, token might be invalid, try to refresh once
    if (response.status === 401) {
      console.log("Received 401, attempting token refresh...");
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          requestOptions.headers["Authorization"] = `Bearer ${newToken}`;
          response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);

          // If still 401 after refresh, redirect to login
          if (response.status === 401) {
            clearTokens();
            toast.error("Session expired. Please login again.");
            window.location.href = "/auth";
          }
        }
      } catch (refreshError) {
        // Token refresh failed, redirect to login
        clearTokens();
        toast.error("Session expired. Please login again.");
        window.location.href = "/auth";
        throw refreshError;
      }
    }

    // Do not toast success here; the caller decides what "success" means.
    return response;
  } catch (error) {
    console.error("Authenticated request failed:", error);
    if (error.message !== "No valid access token available") {
      toast.error(error?.message || "Request failed");
    }
    throw error;
  }
};

/**
 * Login with email and password
 */
export const login = async (email, password) => {
  try {
    const requestBody = { email, password };

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Login failed");
    }

    const data = await response.json();

    if (data.success && data.data.tokens) {
      // Store tokens and user data
      setTokens(data.data.tokens, data.data.user);
      // toast.success("Logged in successfully");
      return data.data;
    } else {
      throw new Error("Invalid login response");
    }
  } catch (error) {
    console.error("Login failed:", error);
    toast.error(error?.message || "Login failed");
    throw error;
  }
};

/**
 * Register new user
 */
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Registration failed");
    }

    const data = await response.json();

    if (data.success && data.data.tokens) {
      // Store tokens and user data
      setTokens(data.data.tokens, data.data.user);
      toast.success("Account created");
      return data.data;
    } else {
      throw new Error("Invalid registration response");
    }
  } catch (error) {
    console.error("Registration failed:", error);
    toast.error(error?.message || "Registration failed");
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    // Call backend logout endpoint (if it exists)
    const accessToken = await getValidAccessToken();
    if (accessToken) {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).catch((err) => console.warn("Logout API call failed:", err));
    }
  } catch (error) {
    console.warn("Logout API call failed:", error);
    toast.error("Logout failed (local session cleared)");
  } finally {
    // Always clear local tokens
    clearTokens();
  }
};

/**
 * Get current user from API
 */
export const getCurrentUser = async () => {
  try {
    const response = await makeAuthenticatedRequest("/api/auth/me");

    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    const data = await response.json();

    if (data.success && data.data) {
      // Update stored user data
      setStoredUser(data.data);
      toast.success("Profile synced");
      return data.data;
    } else {
      throw new Error("Invalid user data response");
    }
  } catch (error) {
    console.error("Failed to get current user:", error);
    toast.error(error?.message || "Failed to fetch profile");
    throw error;
  }
};

/**
 * Check if user is authenticated and get user data
 */
export const checkAuthStatus = async () => {
  try {
    const tokens = getTokens();
    const storedUser = getStoredUser();

    if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
      // toast.error("Not authenticated");
      return { isAuthenticated: false, user: null };
    }

    // If we have stored user and token is not expired, return immediately
    if (storedUser && !isTokenExpired()) {
      // toast.success("Authenticated");
      return { isAuthenticated: true, user: storedUser };
    }

    // Try to get fresh user data from API
    try {
      const user = await getCurrentUser();
      // toast.success("Authenticated");
      return { isAuthenticated: true, user };
    } catch (error) {
      // If API call fails, clear tokens and return unauthenticated
      clearTokens();
      toast.error("Session expired");
      // Only redirect if we're on a protected route (admin dashboard)
      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/auth";
      }
      return { isAuthenticated: false, user: null };
    }
  } catch (error) {
    console.error("Auth status check failed:", error);
    toast.error("Authentication check failed");
    return { isAuthenticated: false, user: null };
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (role) => {
  try {
    const response = await makeAuthenticatedRequest("/api/auth/profile/role", {
      method: "PUT",
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to update role");
    }

    const data = await response.json();

    if (data.success && data.data) {
      // Update stored user data
      setStoredUser(data.data);
      toast.success("Role updated");
      return data.data;
    } else {
      throw new Error("Invalid role update response");
    }
  } catch (error) {
    console.error("Role update failed:", error);
    toast.error(error?.message || "Failed to update role");
    throw error;
  }
};

/* Login with email and password
 */
export const authForgetPassword = async (email) => {
  try {
    const requestBody = { email };

    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "reset password failed");
    }

    const data = await response.json();

    toast.success("Password reset email sent");
    return data;
  } catch (error) {
    console.error("Forgot Password failed:", error);
    toast.error(error?.message || "Reset password failed");
    throw error;
  }
};

// /**
//  * Authentication Utilities
//  * Handles token refresh, validation, and auth state management
//  */

// import {
//   getTokens,
//   getRefreshToken,
//   setTokens,
//   clearTokens,
//   isTokenExpired,
//   getStoredUser,
//   setStoredUser,
// } from "./tokenStorage.js";

// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// /**
//  * Refresh access token using refresh token
//  */
// export const refreshAccessToken = async () => {
//   try {
//     const refreshToken = getRefreshToken();
//     if (!refreshToken) {
//       throw new Error("No refresh token available");
//     }

//     const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ refreshToken }),
//     });

//     if (!response.ok) {
//       throw new Error("Token refresh failed");
//     }

//     const data = await response.json();

//     if (data.success && data.data.tokens) {
//       // Store new tokens
//       setTokens(data.data.tokens, data.data.user);
//       return data.data.tokens.accessToken;
//     } else {
//       throw new Error("Invalid refresh response");
//     }
//   } catch (error) {
//     console.error("Token refresh failed:", error);
//     // Clear invalid tokens
//     clearTokens();
//     throw error;
//   }
// };

// /**
//  * Get valid access token, refreshing if necessary
//  */
// export const getValidAccessToken = async () => {
//   try {
//     const tokens = getTokens();

//     if (!tokens || !tokens.accessToken) {
//       return null;
//     }

//     // If token is not expired, return it
//     if (!isTokenExpired()) {
//       return tokens.accessToken;
//     }

//     // Try to refresh the token
//     console.log("Access token expired, refreshing...");
//     return await refreshAccessToken();
//   } catch (error) {
//     console.error("Failed to get valid access token:", error);
//     return null;
//   }
// };

// /**
//  * Make authenticated API request with automatic token refresh
//  */
// export const makeAuthenticatedRequest = async (endpoint, options = {}) => {
//   try {
//     const accessToken = await getValidAccessToken();

//     if (!accessToken) {
//       throw new Error("No valid access token available");
//     }

//     const requestOptions = {
//       ...options,
//       headers: {
//         "Content-Type": "application/json",
//         ...options.headers,
//         Authorization: `Bearer ${accessToken}`,
//       },
//     };

//     const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);

//     // If we get 401, token might be invalid, try to refresh once
//     if (response.status === 401) {
//       console.log("Received 401, attempting token refresh...");

//       const newToken = await refreshAccessToken();
//       if (newToken) {
//         // Retry the request with new token
//         requestOptions.headers["Authorization"] = `Bearer ${newToken}`;
//         return await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
//       }
//     }

//     return response;
//   } catch (error) {
//     console.error("Authenticated request failed:", error);
//     throw error;
//   }
// };

// /**
//  * Login with email and password
//  */
// export const login = async (email, password) => {
//   try {
//     const requestBody = { email, password };

//     const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(requestBody),
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.message || "Login failed");
//     }

//     const data = await response.json();

//     if (data.success && data.data.tokens) {
//       // Store tokens and user data
//       setTokens(data.data.tokens, data.data.user);
//       return data.data;
//     } else {
//       throw new Error("Invalid login response");
//     }
//   } catch (error) {
//     console.error("Login failed:", error);
//     throw error;
//   }
// };

// /**
//  * Register new user
//  */
// export const register = async (userData) => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(userData),
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.message || "Registration failed");
//     }

//     const data = await response.json();

//     if (data.success && data.data.tokens) {
//       // Store tokens and user data
//       setTokens(data.data.tokens, data.data.user);
//       return data.data;
//     } else {
//       throw new Error("Invalid registration response");
//     }
//   } catch (error) {
//     console.error("Registration failed:", error);
//     throw error;
//   }
// };

// /**
//  * Logout user
//  */
// export const logout = async () => {
//   try {
//     // Call backend logout endpoint (if it exists)
//     const accessToken = await getValidAccessToken();
//     if (accessToken) {
//       await fetch(`${API_BASE_URL}/api/auth/logout`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }).catch((err) => console.warn("Logout API call failed:", err));
//     }
//   } catch (error) {
//     console.warn("Logout API call failed:", error);
//   } finally {
//     // Always clear local tokens
//     clearTokens();
//   }
// };

// /**
//  * Get current user from API
//  */
// export const getCurrentUser = async () => {
//   try {
//     const response = await makeAuthenticatedRequest("/api/auth/me");

//     if (!response.ok) {
//       throw new Error("Failed to fetch user data");
//     }

//     const data = await response.json();

//     if (data.success && data.data) {
//       // Update stored user data
//       setStoredUser(data.data);
//       return data.data;
//     } else {
//       throw new Error("Invalid user data response");
//     }
//   } catch (error) {
//     console.error("Failed to get current user:", error);
//     throw error;
//   }
// };

// /**
//  * Check if user is authenticated and get user data
//  */
// export const checkAuthStatus = async () => {
//   try {
//     const tokens = getTokens();
//     const storedUser = getStoredUser();

//     if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
//       return { isAuthenticated: false, user: null };
//     }

//     // If we have stored user and token is not expired, return immediately
//     if (storedUser && !isTokenExpired()) {
//       return { isAuthenticated: true, user: storedUser };
//     }

//     // Try to get fresh user data from API
//     try {
//       const user = await getCurrentUser();
//       return { isAuthenticated: true, user };
//     } catch (error) {
//       // If API call fails, clear tokens and return unauthenticated
//       clearTokens();
//       return { isAuthenticated: false, user: null };
//     }
//   } catch (error) {
//     console.error("Auth status check failed:", error);
//     return { isAuthenticated: false, user: null };
//   }
// };

// /**
//  * Update user role
//  */
// export const updateUserRole = async (role) => {
//   try {
//     const response = await makeAuthenticatedRequest("/api/auth/profile/role", {
//       method: "PUT",
//       body: JSON.stringify({ role }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.message || "Failed to update role");
//     }

//     const data = await response.json();

//     if (data.success && data.data) {
//       // Update stored user data
//       setStoredUser(data.data);
//       return data.data;
//     } else {
//       throw new Error("Invalid role update response");
//     }
//   } catch (error) {
//     console.error("Role update failed:", error);
//     throw error;
//   }
// };

// /* Login with email and password
//  */
// export const authForgetPassword = async (email) => {
//   try {
//     const requestBody = { email };

//     const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(requestBody),
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.message || "reser password failed");
//     }

//     const data = await response.json();

//     return data;
//   } catch (error) {
//     console.error("Forgot Password failed:", error);
//     throw error;
//   }
// };
