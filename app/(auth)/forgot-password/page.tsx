"use client";

import React, { useState } from "react";

import Image from "next/image";

import Link from "next/link";

import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEmail(e.target.value);

    if (error) {
      setError("");
    }
  };

  const validateForm = () => {
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return false;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      setError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading || !validateForm()) {
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ||
            "Unable to process your request. Please try again."
        );
        setLoading(false);
        return;
      }

      /*
       * The API intentionally returns the same success response
       * whether or not the email belongs to an account.
       */
      router.push(
        `/verify-code?email=${encodeURIComponent(normalizedEmail)}`
      );
    } catch (err) {
      console.error(
        "Error connecting to password reset endpoint:",
        err
      );

      setError(
        "Something went wrong. Please check your connection and try again."
      );

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      <div className="hidden lg:block relative min-h-screen overflow-hidden bg-stone-100">
        <Image
          src="/A1.jpeg"
          alt="HexaAds workspace"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
      </div>

      <div className="flex flex-col justify-center items-center px-6 py-10 sm:px-10 lg:px-16 xl:px-20 bg-white">
        <div className="w-full max-w-[616px] space-y-7">
          <div className="text-center space-y-3">
            <h1 className="text-[2.3rem] sm:text-[2.6rem] font-semibold tracking-[-0.04em] text-[#4b35f5]">
              Forgot Password?
            </h1>

            <p className="text-[15px] text-gray-500 max-w-[330px] mx-auto leading-relaxed">
              Enter your registered email address or phone number to receive a code.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[15px] font-medium text-gray-800">
                Email or phone
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={handleChange}
                placeholder="abc@example.com"
                autoComplete="email"
                required
                disabled={loading}
                className={`w-full h-[52px] rounded-xl border bg-white px-4 text-[15px] text-gray-800 placeholder:text-gray-400 focus:outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed ${
                  error
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-[#d7d3ff] focus:border-[#4b35f5] focus:ring-2 focus:ring-[#ebe7ff]"
                }`}
              />

              {error && <p className="text-red-500 text-[11px] mt-1">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] bg-[#4b35f5] hover:bg-[#4231d6] text-white text-[15px] font-medium rounded-xl shadow-sm transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending Code..." : "Send Code"}
            </button>
          </form>

          <div className="text-center text-[15px] text-gray-500 pt-1">
            Remember password? Back to{" "}
            <Link href="/login" className="text-[#4b35f5] font-semibold hover:underline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}