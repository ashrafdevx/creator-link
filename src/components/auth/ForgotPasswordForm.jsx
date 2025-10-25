import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";

const ForgotPasswordForm = ({ onBackToLogin }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { forgetPasswordMutation } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");

    try {
      await forgetPasswordMutation.mutateAsync({ email: data.email.trim() });
      setIsSubmitted(true);
    } catch (err) {
      setError(err?.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (true) {
    return (
      <Card className="w-full max-w-md mx-auto bg-slate-900 border-slate-700">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Check your email
          </CardTitle>
          <CardDescription className="text-slate-400">
            We sent a password reset link to {getValues("email")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center text-sm text-slate-400">
            <p>Didn't receive the email? Check your spam folder or</p>
          </div>
        </CardContent>

        <CardFooter className="space-y-4 md:space-y-0 space-x-3 flex items-center justify-center">
          <Button
            type="button"
            variant="outline"
            className="w-full border-slate-600 text-black hover:text-white hover:bg-slate-800"
            onClick={() => setIsSubmitted(false)}
          >
            Try again
          </Button>

          <div className="text-center flex items-center justify-center">
            <Button
              type="button"
              variant="link"
              className="text-blue-400 hover:text-blue-300 p-0 h-auto"
              onClick={onBackToLogin}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to sign in
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-slate-900 border-slate-700">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-white">
          Forgot password?
        </CardTitle>
        <CardDescription className="text-center text-slate-400">
          Enter your email address and we'll send you a reset link
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Error alert */}
          {error && (
            <Alert className="border-red-500/50 bg-red-950/50">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Please enter a valid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="space-y-4">
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send reset link
              </>
            )}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              className="text-blue-400 hover:text-blue-300 p-0 h-auto"
              onClick={onBackToLogin}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to sign in
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ForgotPasswordForm;
