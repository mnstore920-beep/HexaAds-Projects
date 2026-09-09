"use client";

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const errorParam = searchParams.get('error');

const loginErrorMessage = errorParam
  ? errorParam === 'OAuthCallbackError' ||
    errorParam === 'invalid_client' ||
    errorParam === 'OAuthSignin' ||
    errorParam === 'OAuthCallback'
    ? 'Google sign-in encountered an issue. Please verify your Google OAuth credentials or try again.'
    : errorParam === 'OAuthAccountNotLinked'
      ? 'An account with this email address already exists. Please sign in with your email and password.'
      : errorParam === 'CredentialsSignin'
        ? 'Invalid email or password. Please try again.'
        : `Authentication error: ${errorParam}. Please try again.`
  : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (loginError) {
      setLoginError('');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.email.trim()) {
      newErrors.email = 'Email or phone number is required';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoginError('');

    try {
      const res = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl: '/dashboard/data-sources',
      });

      if (res?.ok) {
        console.log("Logged in successfully!");
        router.push(res.url || '/dashboard/data-sources');
        router.refresh();
      } else {
        const errorMsg = res?.error || "Invalid email or password. Please try again.";
        setLoginError(errorMsg);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      const errorMsg = "Error connecting to the server. Please check your backend.";
      setLoginError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/dashboard/data-sources' });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      
      {/* FIXED LEFT IMAGE SECTION */}
      <div className="hidden lg:block relative w-full h-screen bg-gray-50">
        <Image 
          src="/A1.jpeg" 
          alt="Login Background" 
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
      </div>

      {/* RIGHT FORM SECTION */}
      <div className="flex flex-col justify-center items-center px-6 py-10 sm:px-12 lg:px-20 overflow-y-auto bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#5842EC]">
              Welcome back!
            </h1>
            <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
              Sign in to access your HexaAds dashboard and manage your ad campaigns seamlessly.
            </p>
          </div>

          {(loginError || loginErrorMessage) && (
  <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg text-center leading-relaxed">
    {loginError || loginErrorMessage}
  </div>
)}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Email or phone
              </label>
              <input 
                type="text" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. john.doe@example.com" 
                className={`w-full px-4 py-2.5 border rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#5842EC] focus:ring-[#5842EC]'}`} 
              />
              {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-gray-800">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-[#5842EC] hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password" 
                className={`w-full px-4 py-2.5 border rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#5842EC] focus:ring-[#5842EC]'}`} 
              />
              {errors.password && <p className="text-red-500 text-[11px] mt-1">{errors.password}</p>}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input 
                type="checkbox" 
                id="rememberMe" 
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 border-gray-300 rounded text-[#5842EC] focus:ring-[#5842EC] cursor-pointer" 
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-500 cursor-pointer select-none">
                Remember me
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#5842EC] hover:bg-[#4632db] text-white text-sm font-medium py-3 rounded-lg shadow-sm transition duration-150 mt-2 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isLoading ? "Logging in..." : "Login"}
            </button>

            <div className="text-center text-sm text-gray-500 pt-2">
              Don&apos;t have an account? <Link href="/signup" className="text-[#5842EC] font-semibold hover:underline">Sign Up</Link>
            </div>

            <div className="text-center py-2">
              <span className="text-sm text-[#5842EC] font-medium">OR</span>
            </div>

            <button 
              type="button" 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white border border-[#D0C9FF] hover:bg-gray-50 text-sm font-semibold text-[#5842EC] py-2.5 rounded-lg flex items-center justify-center gap-3 transition duration-150 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Login with Google</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-4 border-[#5842EC] border-t-transparent rounded-full animate-spin"></div></div>}>
      <LoginFormContent />
    </Suspense>
  );
}