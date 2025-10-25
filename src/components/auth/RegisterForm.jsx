import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

const RegisterForm = ({ onSwitchToLogin, onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isRegistering, registerError } = useAuth();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setError,
    watch
  } = useForm();

  const watchPassword = watch('password');


  const onSubmit = async (data) => {
    try {
      const userData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName
        // No role - user will select role in next step
      };

      await registerUser(userData);
      onSuccess?.();
    } catch (error) {
      // Handle specific errors
      if (error.message.includes('email already exists') || error.message.includes('User already exists')) {
        setError('email', { 
          type: 'manual', 
          message: 'An account with this email already exists' 
        });
      } else if (error.message.includes('weak password') || error.message.includes('password')) {
        setError('password', { 
          type: 'manual', 
          message: 'Password does not meet requirements' 
        });
      } else {
        setError('root', { 
          type: 'manual', 
          message: error.message || 'Registration failed. Please try again.' 
        });
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-slate-900 border-slate-700">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-white">
          Create your account
        </CardTitle>
        <CardDescription className="text-center text-slate-400">
          Join Crelance and start your journey
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Global error alert */}
          {(registerError || errors.root) && (
            <Alert className="border-red-500/50 bg-red-950/50">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">
                {registerError?.message || errors.root?.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-white">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                {...register('firstName', {
                  required: 'First name is required',
                  minLength: {
                    value: 2,
                    message: 'First name must be at least 2 characters'
                  }
                })}
              />
              {errors.firstName && (
                <p className="text-sm text-red-400">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-white">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                {...register('lastName', {
                  required: 'Last name is required',
                  minLength: {
                    value: 2,
                    message: 'Last name must be at least 2 characters'
                  }
                })}
              />
              {errors.lastName && (
                <p className="text-sm text-red-400">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address'
                }
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                    message: 'Password must contain uppercase, lowercase, and number'
                  }
                })}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-slate-400" />
                ) : (
                  <Eye className="h-4 w-4 text-slate-400" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => value === watchPassword || 'Passwords do not match'
                })}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-slate-400" />
                ) : (
                  <Eye className="h-4 w-4 text-slate-400" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Terms and Privacy */}
          <div className="text-xs text-slate-400">
            By creating an account, you agree to our{' '}
            <Link to="/legal/terms-of-service" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/legal/privacy-policy" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
              Privacy Policy
            </Link>
          </div>
        </CardContent>

        <CardContent className="pt-0">
          <div className="space-y-4">
            <Button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              disabled={isRegistering}
            >
              {isRegistering ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create account
                </>
              )}
            </Button>

            <div className="text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Button
                type="button"
                variant="link"
                className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                onClick={onSwitchToLogin}
              >
                Sign in
              </Button>
            </div>
          </div>
        </CardContent>
      </form>
    </Card>
  );
};

export default RegisterForm;
