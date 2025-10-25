import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

const LoginForm = ({ onSwitchToRegister, onSwitchToForgotPassword, onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoggingIn, loginError } = useAuth();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setError
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      onSuccess?.();
    } catch (error) {
      // Handle specific errors
      if (error.message.includes('User not found')) {
        setError('email', { 
          type: 'manual', 
          message: 'No account found with this email address' 
        });
      } else if (error.message.includes('Invalid password') || error.message.includes('Invalid credentials')) {
        setError('password', { 
          type: 'manual', 
          message: 'Incorrect password' 
        });
      } else {
        setError('root', { 
          type: 'manual', 
          message: error.message || 'Login failed. Please try again.' 
        });
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-slate-900 border-slate-700">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-white">
          Welcome back
        </CardTitle>
        <CardDescription className="text-center text-slate-400">
          Sign in to your Crelance account
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Global error alert */}
          {(loginError || errors.root) && (
            <Alert className="border-red-500/50 bg-red-950/50">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">
                {loginError?.message || errors.root?.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
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
                placeholder="Enter your password"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
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

          {/* Forgot password link */}
          <div className="flex justify-end">
            <Button 
              type="button" 
              variant="link" 
              className="text-blue-400 hover:text-blue-300 p-0 h-auto"
              onClick={onSwitchToForgotPassword}
            >
              Forgot your password?
            </Button>
          </div>
        </CardContent>

        <CardFooter className="space-y-4">
          <Button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-2" />
                Sign in
              </>
            )}
          </Button>

          <div className="text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Button
              type="button"
              variant="link"
              className="text-blue-400 hover:text-blue-300 p-0 h-auto"
              onClick={onSwitchToRegister}
            >
              Sign up
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;