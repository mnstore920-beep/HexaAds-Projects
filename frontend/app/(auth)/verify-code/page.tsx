"use client";

import React, {
  useState,
  useRef,
  KeyboardEvent,
  Suspense,
} from "react";

import Image from "next/image";

import { useSearchParams, useRouter } from "next/navigation";

function VerifyForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);

    setOtp(newOtp);

    if (error) {
      setError("");
    }

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData("text")
      .slice(0, 6)
      .replace(/\D/g, "");

    if (pastedData) {
      const newOtp = [...otp];

      pastedData.split("").forEach((char, i) => {
        if (i < 6) {
          newOtp[i] = char;
        }
      });

      setOtp(newOtp);

      const nextFocusIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextFocusIndex]?.focus();
    }
  };

  const isComplete =
    otp.every((digit) => digit !== "") &&
    newPassword.length >= 8 &&
    Boolean(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isComplete) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: otp.join(""),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ||
            "Verification failed. Invalid or expired code."
        );
        setLoading(false);
        return;
      }

      setMessage(
        "Password reset successfully! Redirecting to login..."
      );

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      console.error(err);

      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Email address is missing.");
      return;
    }

    setResendLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(
          "If an account exists for this email, a new OTP code has been sent."
        );

        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.error || "Failed to resend OTP.");
      }
    } catch {
      setError("Connection failed. Could not resend code.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 sm:p-10">
      <div className="text-center space-y-3 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#5842EC]">
          Enter Verification Code
        </h1>

        <p className="text-xs sm:text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
          Enter the OTP sent to{" "}
          <span className="font-semibold text-gray-700">
            {email || "your email"}
          </span>
          .
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs rounded-lg text-center border border-red-200">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-6 p-3 bg-green-50 text-green-600 text-xs rounded-lg text-center border border-green-200">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center space-y-6"
      >
        {/* 6-Digit OTP Input Row */}
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
              onChange={(e) =>
                handleChange(index, e.target.value)
              }
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#F5F3FF] text-[#5842EC] font-bold text-center text-lg focus:outline-none focus:ring-2 focus:ring-[#5842EC] transition-all"
              maxLength={1}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              aria-label={`Verification digit ${index + 1}`}
            />
          ))}
        </div>

        {/* New Password Field */}
        <div className="w-full space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-gray-700">
            Set New Password
          </label>

          <input
            type="password"
            placeholder="At least 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5842EC]"
            minLength={8}
            required
          />

          <p className="text-[11px] text-gray-400">
            Password must be at least 8 characters long.
          </p>
        </div>

        {/* Resend Code Button */}
        <div className="text-center text-[11px] sm:text-xs text-gray-500">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading || loading}
            className="text-[#5842EC] font-semibold hover:underline disabled:opacity-50"
          >
            {resendLoading ? "Sending..." : "Resend code"}
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isComplete || loading}
          className={`w-full text-sm font-medium py-3.5 rounded-lg shadow-sm transition-all duration-300 ${
            isComplete && !loading
              ? "bg-[#5842EC] hover:bg-[#4632db] text-white cursor-pointer"
              : "bg-[#A3A3A3] text-white cursor-not-allowed opacity-80"
          }`}
        >
          {loading ? "Verifying & Resetting..." : "Submit code"}
        </button>
      </form>
    </div>
  );
}

export default function VerificationCodePage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gray-50 lg:bg-white">
      {/* FIXED LEFT IMAGE SECTION */}
      <div className="hidden lg:block relative w-full h-screen sticky top-0 bg-gray-50">
        <Image
          src="/A1.jpeg"
          alt="Verification Background"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
      </div>

      <div className="flex flex-col justify-center items-center p-6 sm:p-12 lg:p-20 overflow-y-auto">
        <Suspense
          fallback={
            <div className="text-sm text-gray-500">
              Loading form...
            </div>
          }
        >
          <VerifyForm />
        </Suspense>
      </div>
    </div>
  );
}