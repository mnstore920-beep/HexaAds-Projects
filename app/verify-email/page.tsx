"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type VerificationStatus = "loading" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<VerificationStatus>(
    token && email ? "loading" : "error"
  );

  const [message, setMessage] = useState(
    token && email
      ? "Verifying your email address..."
      : "Invalid verification link."
  );

  useEffect(() => {
    if (!token || !email) {
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `/api/auth/verify-email?token=${encodeURIComponent(
            token
          )}&email=${encodeURIComponent(email)}`
        );

        const data = await response.json();

        if (!response.ok) {
          setStatus("error");
          setMessage(data.error || "Unable to verify your email.");
          return;
        }

        setStatus("success");
        setMessage(
          data.message || "Your email has been verified successfully."
        );
      } catch (error) {
        console.error("Email verification error:", error);

        setStatus("error");
        setMessage(
          "Something went wrong while verifying your email. Please try again."
        );
      }
    };

    verifyEmail();
  }, [token, email]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-md text-center">
        {status === "loading" && (
          <>
            <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#5842EC]" />

            <h1 className="text-2xl font-semibold text-gray-900">
              Verifying your email
            </h1>

            <p className="mt-3 text-gray-600">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-semibold text-gray-900">
              Email Verified!
            </h1>

            <p className="mt-3 text-gray-600">{message}</p>

            <Link
              href="/login"
              className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-[#5842EC] px-6 py-3 font-medium text-white transition hover:bg-[#4934d4]"
            >
              Continue to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-semibold text-gray-900">
              Verification Failed
            </h1>

            <p className="mt-3 text-gray-600">{message}</p>

            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-lg bg-[#5842EC] px-6 py-3 font-medium text-white transition hover:bg-[#4934d4]"
              >
                Go to Login
              </Link>

              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Create a New Account
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function VerifyEmailFallback() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#5842EC]" />

        <h1 className="text-2xl font-semibold text-gray-900">
          Verifying your email
        </h1>

        <p className="mt-3 text-gray-600">
          Please wait while we verify your email address.
        </p>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}