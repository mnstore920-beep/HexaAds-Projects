"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateNewPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    newPassword: '',
    reEnterPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!formData.newPassword) {
      newErrors.newPassword = 'Password is required';
      isValid = false;
    } else if (!passwordRegex.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain an alphabet, number, special character, and be at least 8 characters long.';
      isValid = false;
    }

    if (!formData.reEnterPassword) {
      newErrors.reEnterPassword = 'Please re-enter your password';
      isValid = false;
    } else if (formData.newPassword !== formData.reEnterPassword) {
      newErrors.reEnterPassword = 'Passwords do not match';
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

    try {
      // Backend API call here:
      // await fetch('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(formData) });
      console.log("Password updated successfully");
      router.push('/login');
    } catch (err) {
      console.error("Error updating password:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:block">
        <div className="relative w-full bg-gray-50" style={{ position: 'relative', height: '100vh' }}>
          <Image 
            src="/A1.jpeg" 
            alt="Create New Password Background" 
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="absolute inset-0 object-cover"
            priority
            unoptimized
          />
        </div>
      </div>

      <div className="flex flex-col justify-center items-center px-6 py-10 sm:px-12 lg:px-20 overflow-y-auto bg-white">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#5842EC]">
              Create new password
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-[280px] sm:max-w-xs mx-auto leading-relaxed">
              Please enter your new password below to secure your account and regain access.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800">
                New password
              </label>
              <input 
                type="password" 
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter a strong password (e.g. Pass@123)" 
                className={`w-full px-4 py-3 border rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
                  errors.newPassword 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-[#5842EC] focus:ring-[#5842EC]'
                }`} 
              />
              <p className={`text-[10px] mt-1 ${errors.newPassword ? 'text-red-500' : 'text-[#7B61FF]'}`}>
                {errors.newPassword || 'Your password must contain an alphabet, number and special character'}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800">
                Re-Enter Password
              </label>
              <input 
                type="password" 
                name="reEnterPassword"
                value={formData.reEnterPassword}
                onChange={handleChange}
                placeholder="Confirm your new password" 
                className={`w-full px-4 py-3 border rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
                  errors.reEnterPassword 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-[#5842EC] focus:ring-[#5842EC]'
                }`} 
              />
              {errors.reEnterPassword && (
                <p className="text-red-500 text-[10px] mt-1">{errors.reEnterPassword}</p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#5842EC] hover:bg-[#4632db] text-white text-sm font-medium py-3.5 rounded-lg shadow-sm transition duration-150 mt-4 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save password"}
            </button>

          </form>

          <div className="text-center text-xs sm:text-sm text-gray-500 pt-2">
            Change password later?{' '}
            <Link href="/login" className="text-[#5842EC] font-semibold hover:underline">
              Skip
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}