import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import RoleSelection from './RoleSelection';

const RoleSelectionGuard = () => {
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const { isSignedIn, isLoading, user } = useAuth();

  // Check for role selection needed on auth state changes
  useEffect(() => {
    const needsRoleSelection = localStorage.getItem('needsRoleSelection') === 'true';
    
    // Only check when we have a signed in user and not loading
    if (isSignedIn && !isLoading && user) {
      // Show role selection if localStorage flag is set OR user has no role
      if (needsRoleSelection || !user.role) {
        setShowRoleSelection(true);
      }
    }
  }, [isSignedIn, isLoading, user]);

  const handleRoleSelectionComplete = () => {
    localStorage.removeItem('needsRoleSelection');
    setShowRoleSelection(false);
  };

  // Only render if we need to show role selection
  if (!showRoleSelection) {
    return null;
  }

  return (
    <RoleSelection 
      isOpen={showRoleSelection}
      onComplete={handleRoleSelectionComplete}
      currentRole={user?.role}
    />
  );
};

export default RoleSelectionGuard;