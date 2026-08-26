"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailOrPhone(e.target.value);
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    if (!emailOrPhone.trim()) {
      setError('Please enter your email or phone number.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      console.log("Sending recovery code to:", emailOrPhone);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Error connecting to backend:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:block">
        <div className="relative w-full bg-gray-50" style={{ position: 'relative', height: '100vh' }}>
          <Image 
            src="/A1.jpeg"
            alt="Forget Password Background" 
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
              Forget Password?
            </h1>
            <p className="text-sm text-gray-500 max-w-[280px] sm:max-w-xs mx-auto leading-relaxed">
              Enter your registered email address or phone number to receive a code.
            </p>
          </div>

          {isSubmitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
                If an account exists with <strong>{emailOrPhone}</strong>, you will receive a recovery code shortly.
              </div>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="text-sm text-[#5842EC] font-semibold hover:underline"
              >
                Try a different email/phone
              </button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800">
                  Email or phone
                </label>
                <input 
                  type="text" 
                  value={emailOrPhone}
                  onChange={handleChange}
                  placeholder="abc@example.com" 
                  className={`w-full px-4 py-3 border rounded-lg text-sm placeholder-gray-300 focus:outline-none focus:ring-1 transition-colors ${
                    error 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-[#5842EC] focus:ring-[#5842EC]'
                  }`} 
                />
                {error && <p className="text-red-500 text-[11px] mt-1">{error}</p>}
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#5842EC] hover:bg-[#4632db] text-white text-sm font-medium py-3 rounded-lg shadow-sm transition duration-150"
              >
                Send Code
              </button>
            </form>
          )}

          <div className="text-center text-sm text-gray-500 pt-2">
            Remember password? Back to{' '}
            <Link href="/login" className="text-[#5842EC] font-semibold hover:underline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}