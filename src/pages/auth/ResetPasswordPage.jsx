import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");
  const [isValidToken, setIsValidToken] = useState(null); // null = checking, true = valid, false = invalid

  // Get token from URL query params
  const token = searchParams.get("token");

  // useEffect(() => {
  //   if (!token) {
  //     setError('Reset token is missing from the URL.');
  //     setIsValidToken(false);
  //     return;
  //   }

  //   // TODO: Validate token with backend
  //   // For now, just simulate validation
  //   const validateToken = async () => {
  //     try {
  //       // await validateResetToken(token);
  //       // Simulate API call
  //       await new Promise(resolve => setTimeout(resolve, 1000));
  //       setIsValidToken(true);
  //     } catch (err) {
  //       setError('This reset link is invalid or has expired. Please request a new one.');
  //       setIsValidToken(false);
  //     }
  //   };

  //   validateToken();
  // }, [token]);

  const handleSuccess = () => {
    navigate("/auth", {
      replace: true,
      state: {
        message:
          "Password updated successfully. Please sign in with your new password.",
      },
    });
  };

  const handleBackToLogin = () => {
    navigate("/auth", { replace: true });
  };

  // Show loading while validating token
  if (isValidToken != null) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-slate-400">Validating reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (false) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Alert className="border-red-500/50 bg-red-950/50">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">
              {error}
            </AlertDescription>
          </Alert>

          <div className="mt-6 text-center">
            <button
              onClick={handleBackToLogin}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Go to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show reset password form if token is valid
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <ResetPasswordForm
          token={token}
          onSuccess={handleSuccess}
          onBackToLogin={handleBackToLogin}
        />
      </div>
    </div>
  );
};

export default ResetPasswordPage;
