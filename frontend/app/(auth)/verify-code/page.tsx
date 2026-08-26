
"use client";

import React, { useState, useRef, KeyboardEvent } from 'react';
import Image from 'next/image';

export default function VerificationCodePage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '');
    
    if (pastedData) {
      const newOtp = [...otp];
      pastedData.split('').forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      
      const nextFocusIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextFocusIndex]?.focus();
    }
  };

  const isComplete = otp.every(digit => digit !== '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) return;
    
    console.log("Submitting code:", otp.join(''));
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gray-50 lg:bg-white">
      
      <div className="hidden lg:block relative w-full h-full bg-gray-50" style={{ position: 'relative' }}>
        <Image 
          src="/A1.jpeg" 
          alt="Verification Background" 
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="absolute inset-0 object-cover"
          priority
          unoptimized
        />
      </div>

      <div className="flex flex-col justify-center items-center p-6 sm:p-12 lg:p-20 overflow-y-auto">
        <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 sm:p-10">
          
          <div className="text-center space-y-3 mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#5842EC]">
              Enter Verification Code
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
              Enter the OTP sent to your registered email or phone number.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-10">
            
            <div className="flex justify-center gap-2 sm:gap-3 w-full">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#F5F3FF] text-[#5842EC] font-bold text-center text-lg focus:outline-none focus:ring-2 focus:ring-[#5842EC] transition-all"
                  maxLength={1}
                />
              ))}
            </div>
            <div className="text-center text-[11px] sm:text-xs text-gray-500">
              Didn't receive code?{' '}
              <button type="button" className="text-[#5842EC] font-semibold hover:underline">
                Resend code
              </button>
            </div>
            <button 
              type="submit" 
              disabled={!isComplete}
              className={`w-full text-sm font-medium py-3.5 rounded-lg shadow-sm transition-all duration-300 ${
                isComplete 
                  ? 'bg-[#5842EC] hover:bg-[#4632db] text-white cursor-pointer' 
                  : 'bg-[#A3A3A3] text-white cursor-not-allowed opacity-80'
              }`}
            >
              Submit code
            </button>

          </form>
        </div>
      </div>
      
    </div>
  );
}