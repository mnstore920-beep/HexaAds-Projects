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
    <div className="w-full max-w-[460px] bg-white rounded-[28px] p-7 sm:p-8">
      <div className="text-center space-y-3 mb-7">
        <h1 className="text-[2.2rem] sm:text-[2.5rem] font-semibold tracking-[-0.04em] text-[#4b35f5]">
          Enter verification code
        </h1>

        <p className="text-[15px] text-gray-500 max-w-[330px] mx-auto leading-relaxed">
          Enter the OTP sent to <span className="font-semibold text-gray-700">{email || "your email"}</span>.
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

      <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-6">
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
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#f5f3ff] text-[#4b35f5] font-semibold text-center text-lg border border-[#e1dcff] focus:outline-none focus:ring-2 focus:ring-[#4b35f5] transition-all"
              maxLength={1}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              aria-label={`Verification digit ${index + 1}`}
            />
          ))}
        </div>

        <div className="w-full space-y-2 text-left">
          <label className="block text-[15px] font-medium text-gray-800">Set new password</label>

          <input
            type="password"
            placeholder="At least 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full h-[52px] rounded-xl border border-[#d7d3ff] bg-white px-4 text-[15px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ebe7ff]"
            minLength={8}
            required
          />

          <p className="text-[11px] text-gray-400">Password must be at least 8 characters long.</p>
        </div>

        <div className="text-center text-[13px] text-gray-500">
          Didn&apos;t receive the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading || loading}
            className="text-[#4b35f5] font-semibold hover:underline disabled:opacity-50"
          >
            {resendLoading ? "Sending..." : "Resend code"}
          </button>
        </div>

        <button
          type="submit"
          disabled={!isComplete || loading}
          className={`w-full h-[52px] text-[15px] font-medium rounded-xl shadow-sm transition-all duration-300 ${
            isComplete && !loading
              ? "bg-[#4b35f5] hover:bg-[#4231d6] text-white cursor-pointer"
              : "bg-[#a3a3a3] text-white cursor-not-allowed opacity-80"
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] bg-white">
      <div className="hidden lg:block relative min-h-screen overflow-hidden bg-stone-100">
        <Image
          src="/A1.jpeg"
          alt="HexaAds verification background"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
      </div>

      <div className="flex flex-col justify-center items-center px-6 py-10 sm:px-10 lg:px-16 xl:px-20">
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