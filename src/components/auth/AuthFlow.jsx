import React from "react";
import { useAuth } from "@/hooks/useAuth";
import Auth from "./Auth";

const AuthFlow = ({ children, requireAuth = false }) => {
  const { isSignedIn, isLoading } = useAuth();

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If auth is required and user is not signed in, show auth form
  if (requireAuth && !isSignedIn) {
    return <Auth redirectTo={window.location.pathname} />;
  }

  // Render children (the main app content)
  return <>{children}</>;
};

export default AuthFlow;
