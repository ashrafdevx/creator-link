import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import RoleSelection from './RoleSelection';
import { useNavigate, useLocation } from 'react-router-dom';

const Auth = ({
  initialMode = 'login',
  redirectTo = '/dashboard',
  onSuccess,
  showAsModal = false
}) => {
  const [mode, setMode] = useState(initialMode);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const { isSignedIn, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for pending role selection on component mount
  useEffect(() => {
    const needsRoleSelection = localStorage.getItem('needsRoleSelection') === 'true';
    
    // If user is signed in but needs role selection, show the modal
    if (isSignedIn && !isLoading && user && needsRoleSelection && !user.role) {
      setShowRoleSelection(true);
    }
  }, [isSignedIn, isLoading, user]);

  // Redirect if already signed in and user has a role
  useEffect(() => {
    const userHasRole = user && user.role;
    if (isSignedIn && !isLoading && userHasRole) {
      const from = location.state?.from?.pathname || redirectTo;
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isSignedIn, isLoading, user, navigate, redirectTo, onSuccess, location.state]);

  const handleAuthSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      const from = location.state?.from?.pathname || redirectTo;
      navigate(from, { replace: true });
    }
  };

  const handleRegistrationSuccess = () => {
    // Show role selection immediately after successful registration
    setShowRoleSelection(true);
    // Also set localStorage as fallback for edge cases
    localStorage.setItem('needsRoleSelection', 'true');
  };

  const handleRoleSelectionComplete = () => {
    setShowRoleSelection(false);
    localStorage.removeItem('needsRoleSelection');
    // Navigate to the intended destination after role selection
    const from = location.state?.from?.pathname || redirectTo;
    if (onSuccess) {
      onSuccess();
    } else {
      navigate(from, { replace: true });
    }
  };

  const switchToRegister = () => setMode('register');
  const switchToLogin = () => setMode('login');
  const switchToForgotPassword = () => setMode('forgotPassword');

  // Don't render if already signed in and user has role
  const userHasRole = user && user.role;
  if (isSignedIn && !isLoading && userHasRole) {
    return null;
  }

  const containerClass = showAsModal 
    ? "fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    : "min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8";

  return (
    <>
      <div className={containerClass}>
        <div className="w-full max-w-md">
          {mode === 'login' ? (
            <LoginForm 
              onSwitchToRegister={switchToRegister}
              onSwitchToForgotPassword={switchToForgotPassword}
              onSuccess={handleAuthSuccess}
            />
          ) : mode === 'register' ? (
            <RegisterForm 
              onSwitchToLogin={switchToLogin}
              onSuccess={handleRegistrationSuccess}
            />
          ) : mode === 'forgotPassword' ? (
            <ForgotPasswordForm 
              onBackToLogin={switchToLogin}
            />
          ) : null}
        </div>
      </div>
      
      {/* Role Selection Modal - Shows after successful registration */}
      {showRoleSelection && (
        <RoleSelection 
          isOpen={showRoleSelection}
          onComplete={handleRoleSelectionComplete}
          currentRole={user?.role}
        />
      )}
    </>
  );
};

export default Auth;