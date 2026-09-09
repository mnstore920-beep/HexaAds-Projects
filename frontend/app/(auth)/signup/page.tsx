"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    accountName: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    source: '',
    usage: '',
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Account name is required';
      isValid = false;
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
      isValid = false;
    }

    if (!formData.source) {
      newErrors.source = 'Please select how you found us';
      isValid = false;
    }

    if (!formData.usage) {
      newErrors.usage = 'Please select your intended usage';
      isValid = false;
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms of service to continue';
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
    setServerError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim() || formData.accountName,
          accountName: formData.accountName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          source: formData.source,
          usage: formData.usage,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsRedirecting(true);

        router.push(
          `/login?signup=success&email=${encodeURIComponent(
            formData.email.trim().toLowerCase()
          )}`
        );
      } else {
        const errorMsg = data?.error || 'Signup failed. Please try again.';
        setServerError(errorMsg);
        alert(errorMsg);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error during signup:", error);
      const errMsg = "Error connecting to server. Please check your backend.";
      setServerError(errMsg);
      alert(errMsg);
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    signIn('google', { callbackUrl: '/dashboard/data-sources' });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* FIXED LEFT IMAGE SECTION */}
      <div className="hidden lg:block relative w-full h-screen bg-gray-100">
        <Image
          src="/A1.jpeg"
          alt="HexaAds Dashboard Background"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
      </div>

      {/* RIGHT FORM SECTION */}
      <div className="flex flex-col justify-center items-center px-6 py-10 sm:px-12 lg:px-20 overflow-y-auto">
        <div className="w-full max-w-md space-y-5">

          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#5842EC]">Create account</h1>
            <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
              Join HexaAds today to manage your campaigns, analyze data, and grow your business seamlessly.
            </p>
          </div>

          <div className="w-full border border-[#D0C9FF] rounded-lg py-2.5 text-center text-xs text-gray-600">
            Already have an account? <Link href="/login" className="text-[#5842EC] font-semibold hover:underline">Login</Link>
          </div>

          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg text-center">
              {serverError}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>

            {/* Account Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">Account name*</label>
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                placeholder="e.g. HexaAds Corp"
                className={`w-full px-3.5 py-2 border rounded-lg text-xs placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${errors.accountName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#5842EC] focus:ring-[#5842EC]'}`}
              />
              {errors.accountName && <p className="text-red-500 text-[10px] mt-1">{errors.accountName}</p>}
            </div>

            {/* First Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">First name*</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="e.g. John"
                className={`w-full px-4 py-2 border rounded-lg text-xs placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#5842EC] focus:ring-[#5842EC]'}`}
              />
              {errors.firstName && <p className="text-red-500 text-[10px] mt-1">{errors.firstName}</p>}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">Last name*</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g. Doe"
                className={`w-full px-3.5 py-2 border rounded-lg text-xs placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#5842EC] focus:ring-[#5842EC]'}`}
              />
              {errors.lastName && <p className="text-red-500 text-[10px] mt-1">{errors.lastName}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">Email address*</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@example.com"
                className={`w-full px-3.5 py-2 border rounded-lg text-xs placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#5842EC] focus:ring-[#5842EC]'}`}
              />
              {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">Password*</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                className={`w-full px-3.5 py-2 border rounded-lg text-xs placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#5842EC] focus:ring-[#5842EC]'}`}
              />
              {errors.password && <p className="text-red-500 text-[10px] mt-1">{errors.password}</p>}
            </div>

            {/* Source Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">How did you find us?*</label>
              <div className="relative">
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2 border rounded-lg text-xs text-gray-600 bg-white appearance-none focus:outline-none transition-colors ${errors.source ? 'border-red-500' : 'border-gray-300 focus:border-[#5842EC]'}`}
                >
                  <option value="" disabled>Select an option</option>
                  <option value="search">Search Engine (Google, Bing, etc.)</option>
                  <option value="social">Social Media (LinkedIn, Twitter, etc.)</option>
                  <option value="friend">Friend / Colleague</option>
                  <option value="advertisement">Advertisement</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
              {errors.source && <p className="text-red-500 text-[10px] mt-1">{errors.source}</p>}
            </div>

            {/* Intended Usage Radios */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <label className="text-xs font-semibold text-gray-800 whitespace-nowrap">Intended usage*</label>
              <div className="space-y-2 text-xs text-gray-500 w-full sm:w-auto">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="usage"
                    value="Custom reports platform"
                    checked={formData.usage === "Custom reports platform"}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#5842EC] border-gray-300 focus:ring-[#5842EC] rounded"
                  />
                  <span>Custom reports platform</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="usage"
                    value="Data studio connectors"
                    checked={formData.usage === "Data studio connectors"}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#5842EC] border-gray-300 focus:ring-[#5842EC] rounded"
                  />
                  <span>Data studio connectors</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="usage"
                    value="Reporting HexaAds for google sheets"
                    checked={formData.usage === "Reporting HexaAds for google sheets"}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#5842EC] border-gray-300 focus:ring-[#5842EC] rounded"
                  />
                  <span>Reporting HexaAds for Google Sheets</span>
                </label>
                {errors.usage && <p className="text-red-500 text-[10px] mt-1">{errors.usage}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isRedirecting}
              className="w-full bg-[#5842EC] hover:bg-[#4632db] text-white text-xs font-medium py-3 rounded-lg shadow-sm transition duration-150 mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {(isLoading || isRedirecting) && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}

              {isRedirecting
                ? "Redirecting to login..."
                : isLoading
                  ? "Creating account..."
                  : "Sign Up"}
            </button>

            {/* Terms and Conditions */}
            <div>
              <div className="flex items-center justify-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="w-3.5 h-3.5 border-gray-300 rounded text-[#5842EC] focus:ring-[#5842EC]"
                />
                <label htmlFor="terms" className="text-[11px] text-gray-500 select-none">
                  By creating this account, I agree to the <Link href="/terms" className="text-[#5842EC] font-semibold hover:underline">Terms of Service</Link>
                </label>
              </div>
              {errors.termsAccepted && <p className="text-red-500 text-[10px] mt-1 text-center">{errors.termsAccepted}</p>}
            </div>

            <div className="text-center py-1">
              <span className="text-xs text-[#5842EC] font-semibold">OR</span>
            </div>

            {/* Google Signup */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isLoading || isRedirecting}
              className="w-full border border-[#D0C9FF] hover:bg-gray-50 text-xs font-semibold text-[#5842EC] py-2.5 rounded-lg flex items-center justify-center gap-2 transition duration-150 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>SignUp with Google</span>
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}