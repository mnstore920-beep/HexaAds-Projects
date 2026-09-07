"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrPhone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send recovery code. Please try again.');
        setLoading(false);
        return;
      }

      // Code successfully sent -> Verify Code page par email ke saath navigate karein
      router.push(`/verify-code?email=${encodeURIComponent(emailOrPhone)}`);
    } catch (err) {
      console.error("Error connecting to backend:", err);
      setError("Something went wrong. Please check your connection.");
      setLoading(false);
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
                className={`w-full px-4 py-3 border rounded-lg text-sm placeholder-gray-300 focus:outline-none focus:ring-1 transition-colors text-black ${
                  error 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-[#5842EC] focus:ring-[#5842EC]'
                }`} 
              />
              {error && <p className="text-red-500 text-[11px] mt-1">{error}</p>}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#5842EC] hover:bg-[#4632db] text-white text-sm font-medium py-3 rounded-lg shadow-sm transition duration-150 disabled:opacity-50"
            >
              {loading ? "Sending Code..." : "Send Code"}
            </button>
          </form>

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