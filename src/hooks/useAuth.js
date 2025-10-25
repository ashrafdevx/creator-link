import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import {
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  checkAuthStatus,
  updateUserRole as authUpdateRole,
  getCurrentUser,
  authForgetPassword,
} from "@/utils/authUtils.js";
import { authService } from "@/api/authService";
import { toast } from "sonner";

export const useAuth = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();

  // Check initial auth status on mount
  const {
    data: authStatus,
    isLoading: isCheckingAuth,
    error: authError,
  } = useQuery({
    queryKey: ["auth-status"],
    queryFn: checkAuthStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      // Don't retry auth errors
      if (error.message.includes("Unauthorized")) {
        return false;
      }
      return failureCount < 2;
    },
    onError: (error) => {
      toast.error(error?.message || "Authentication check failed");
    },
  });

  // Fetch user data when authenticated
  const {
    data: backendUser,
    isLoading: isBackendUserLoading,
    error: backendUserError,
  } = useQuery({
    queryKey: ["user", "current"],
    queryFn: async () => {
      try {
        const response = await authService.getCurrentUser();
        // Flatten the nested user object: response.data = { user: {...} }
        return response.data?.user || response.data;
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        throw error;
      }
    },
    enabled: authStatus?.isAuthenticated === true,
    retry: (failureCount, error) => {
      // Don't retry if unauthorized
      if (
        error.message.includes("User not found") ||
        error.message.includes("404") ||
        error.message.includes("Unauthorized")
      ) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    onSuccess: () => {
      toast.success("Profile synced");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to load profile");
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      return await authLogin(email, password);
    },
    onSuccess: () => {
      toast.success("Logged in successfully");
      // Invalidate auth status and user data
      queryClient.invalidateQueries({ queryKey: ["auth-status"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      console.error("Login failed:", error);
      toast.error(error?.message || "Login failed");
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData) => {
      return await authRegister(userData);
    },
    onSuccess: () => {
      toast.success("Account created");
      // Invalidate auth status and user data
      queryClient.invalidateQueries({ queryKey: ["auth-status"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      console.error("Registration failed:", error);
      toast.error(error?.message || "Registration failed");
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authLogout,
    onSuccess: () => {
      toast.success("Logged out");
      // Clear all queries
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      toast.error(error?.message || "Logout failed");
      // Clear queries anyway
      queryClient.clear();
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ role }) => {
      const response = await authService.updateOwnRole(role);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Role updated");
      // Invalidate and refetch user data
      queryClient.invalidateQueries({
        queryKey: ["user", "current"],
      });
      queryClient.invalidateQueries({
        queryKey: ["auth-status"],
      });
    },
    onError: (error) => {
      console.error("Role update failed:", error);
      toast.error(error?.message || "Failed to update role");
    },
  });

  const forgetPasswordMutation = useMutation({
    mutationFn: async ({ email }) => {
      return await authForgetPassword(email);
    },
    onSuccess: () => {
      toast.success("Password reset email sent");
      // Invalidate auth status and user data
      queryClient.invalidateQueries({
        queryKey: ["auth-status"],
      });
      queryClient.invalidateQueries({
        queryKey: ["user"],
      });
    },
    onError: (error) => {
      console.error("Forgot Password failed:", error);
      toast.error(error?.message || "Reset password failed");
    },
  });

  // Set initialized flag after initial auth check
  useEffect(() => {
    if (!isCheckingAuth) {
      setIsInitialized(true);
    }
  }, [isCheckingAuth]);

  // Determine loading state
  const isLoading =
    !isInitialized ||
    isCheckingAuth ||
    (authStatus?.isAuthenticated && isBackendUserLoading);

  // Determine if user is signed in
  const isSignedIn = authStatus?.isAuthenticated === true;

  // Get user data - prefer backend user, fallback to auth status user
  const user = backendUser || authStatus?.user;

  // Login function
  const login = useCallback(
    async (email, password) => {
      return loginMutation.mutateAsync({ email, password });
    },
    [loginMutation]
  );

  // Register function
  const register = useCallback(
    async (userData) => {
      return registerMutation.mutateAsync(userData);
    },
    [registerMutation]
  );

  // Logout function
  const logout = useCallback(async () => {
    return logoutMutation.mutateAsync();
  }, [logoutMutation]);

  return {
    // Auth state
    isSignedIn,
    isLoaded: isInitialized,
    isLoading,

    // User data
    user,
    backendUserError,

    // Auth functions
    login,
    register,
    logout,
    updateRole: updateRoleMutation.mutateAsync,
    forgetPasswordMutation,

    // Loading states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isUpdatingRole: updateRoleMutation.isPending,

    // Errors
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    logoutError: logoutMutation.error,
    roleUpdateError: updateRoleMutation.error,

    // Combined user data for components (maintaining compatibility)
    combinedUser: user
      ? {
          ...user,
          // Map fields to expected format
          full_name:
            user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.fullName || "",
          email: user.email || "",
          profile_image_url: user.avatar || user.imageUrl || "",
          id: user._id || user.id,
        }
      : null,

    // Legacy compatibility (for components that might still expect these)
    session: null, // No longer used
  };
};

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useCallback, useEffect, useState } from "react";
// import {
//   login as authLogin,
//   register as authRegister,
//   logout as authLogout,
//   checkAuthStatus,
//   updateUserRole as authUpdateRole,
//   getCurrentUser,
//   authForgetPassword,
// } from "@/utils/authUtils.js";
// import { authService } from "@/api/authService";

// export const useAuth = () => {
//   const [isInitialized, setIsInitialized] = useState(false);
//   const queryClient = useQueryClient();

//   // Check initial auth status on mount
//   const {
//     data: authStatus,
//     isLoading: isCheckingAuth,
//     error: authError,
//   } = useQuery({
//     queryKey: ["auth-status"],
//     queryFn: checkAuthStatus,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     refetchOnWindowFocus: true,
//     retry: (failureCount, error) => {
//       // Don't retry auth errors
//       if (error.message.includes("Unauthorized")) {
//         return false;
//       }
//       return failureCount < 2;
//     },
//   });

//   // Fetch user data when authenticated
//   const {
//     data: backendUser,
//     isLoading: isBackendUserLoading,
//     error: backendUserError,
//   } = useQuery({
//     queryKey: ["user", "current"],
//     queryFn: async () => {
//       try {
//         const response = await authService.getCurrentUser();
//         return response.data;
//       } catch (error) {
//         console.error("Failed to fetch user data:", error);
//         throw error;
//       }
//     },
//     enabled: authStatus?.isAuthenticated === true,
//     retry: (failureCount, error) => {
//       // Don't retry if unauthorized
//       if (
//         error.message.includes("User not found") ||
//         error.message.includes("404") ||
//         error.message.includes("Unauthorized")
//       ) {
//         return false;
//       }
//       return failureCount < 2;
//     },
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     refetchOnWindowFocus: false,
//   });

//   // Login mutation
//   const loginMutation = useMutation({
//     mutationFn: async ({ email, password }) => {
//       return await authLogin(email, password);
//     },
//     onSuccess: () => {
//       // Invalidate auth status and user data
//       queryClient.invalidateQueries({ queryKey: ["auth-status"] });
//       queryClient.invalidateQueries({ queryKey: ["user"] });
//     },
//     onError: (error) => {
//       console.error("Login failed:", error);
//     },
//   });

//   // Register mutation
//   const registerMutation = useMutation({
//     mutationFn: async (userData) => {
//       return await authRegister(userData);
//     },
//     onSuccess: () => {
//       // Invalidate auth status and user data
//       queryClient.invalidateQueries({ queryKey: ["auth-status"] });
//       queryClient.invalidateQueries({ queryKey: ["user"] });
//     },
//     onError: (error) => {
//       console.error("Registration failed:", error);
//     },
//   });

//   // Logout mutation
//   const logoutMutation = useMutation({
//     mutationFn: authLogout,
//     onSuccess: () => {
//       // Clear all queries
//       queryClient.clear();
//     },
//     onError: (error) => {
//       console.error("Logout failed:", error);
//       // Clear queries anyway
//       queryClient.clear();
//     },
//   });

//   // Update user role mutation
//   const updateRoleMutation = useMutation({
//     mutationFn: async ({ role }) => {
//       const response = await authService.updateOwnRole(role);
//       return response.data;
//     },
//     onSuccess: () => {
//       // Invalidate and refetch user data
//       queryClient.invalidateQueries({
//         queryKey: ["user", "current"],
//       });
//       queryClient.invalidateQueries({
//         queryKey: ["auth-status"],
//       });
//     },
//     onError: (error) => {
//       console.error("Role update failed:", error);
//     },
//   });

//   const forgetPasswordMutation = useMutation({
//     mutationFn: async ({ email }) => {
//       return await authForgetPassword(email);
//     },
//     onSuccess: () => {
//       // Invalidate auth status and user data
//       queryClient.invalidateQueries({
//         queryKey: ["auth-status"],
//       });
//       queryClient.invalidateQueries({
//         queryKey: ["user"],
//       });
//     },
//     onError: (error) => {
//       console.error("Forgot Password failed:", error);
//     },
//   });

//   // Set initialized flag after initial auth check
//   useEffect(() => {
//     if (!isCheckingAuth) {
//       setIsInitialized(true);
//     }
//   }, [isCheckingAuth]);

//   // Determine loading state
//   const isLoading =
//     !isInitialized ||
//     isCheckingAuth ||
//     (authStatus?.isAuthenticated && isBackendUserLoading);

//   // Determine if user is signed in
//   const isSignedIn = authStatus?.isAuthenticated === true;

//   // Get user data - prefer backend user, fallback to auth status user
//   const user = backendUser || authStatus?.user;

//   // Login function
//   const login = useCallback(
//     async (email, password) => {
//       return loginMutation.mutateAsync({ email, password });
//     },
//     [loginMutation]
//   );

//   // Register function
//   const register = useCallback(
//     async (userData) => {
//       return registerMutation.mutateAsync(userData);
//     },
//     [registerMutation]
//   );

//   // Logout function
//   const logout = useCallback(async () => {
//     return logoutMutation.mutateAsync();
//   }, [logoutMutation]);

//   return {
//     // Auth state
//     isSignedIn,
//     isLoaded: isInitialized,
//     isLoading,

//     // User data
//     user,
//     backendUserError,

//     // Auth functions
//     login,
//     register,
//     logout,
//     updateRole: updateRoleMutation.mutateAsync,
//     forgetPasswordMutation,

//     // Loading states
//     isLoggingIn: loginMutation.isPending,
//     isRegistering: registerMutation.isPending,
//     isLoggingOut: logoutMutation.isPending,
//     isUpdatingRole: updateRoleMutation.isPending,

//     // Errors
//     loginError: loginMutation.error,
//     registerError: registerMutation.error,
//     logoutError: logoutMutation.error,
//     roleUpdateError: updateRoleMutation.error,

//     // Combined user data for components (maintaining compatibility)
//     combinedUser: user
//       ? {
//           ...user,
//           // Map fields to expected format
//           full_name:
//             user.firstName && user.lastName
//               ? `${user.firstName} ${user.lastName}`
//               : user.fullName || "",
//           email: user.email || "",
//           profile_image_url: user.avatar || user.imageUrl || "",
//           id: user._id || user.id,
//         }
//       : null,

//     // Legacy compatibility (for components that might still expect these)
//     session: null, // No longer used
//   };
// };
