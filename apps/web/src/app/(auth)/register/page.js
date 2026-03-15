"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { motion } from "framer-motion";
import AuthPreview from "@/components/dashboard/AuthPreview";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "agent",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Registration failed");
        return;
      }

      setSuccessMessage("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 1400);
    } catch (err) {
      console.error("Register error:", err);
      setError("Request failed. Check backend/CORS/network.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f3f2] p-3 sm:p-4 md:p-6 lg:p-8">
      {successMessage ? (
        <div className="fixed right-3 top-3 z-50 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 shadow-lg sm:right-4 sm:top-4 sm:px-5 sm:py-4">
          {successMessage}
        </div>
      ) : null}

      <section className="mx-auto w-full max-w-[1440px] overflow-hidden rounded-[24px] bg-[#f8f5f4] shadow-[0_10px_40px_rgba(0,0,0,0.06)] md:rounded-[26px] lg:grid lg:min-h-[calc(100vh-64px)] lg:grid-cols-[1.02fr_1.28fr] lg:rounded-[28px]">
        <div className="relative flex min-h-[calc(100vh-24px)] flex-col bg-[#f8f5f4] px-4 py-5 sm:min-h-[calc(100vh-32px)] sm:px-6 sm:py-7 md:min-h-[870px] md:px-8 md:py-8 lg:min-h-[unset] lg:px-10 lg:py-10">
          <div className="mb-8 flex items-center gap-3 md:mb-12 lg:mb-0">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl shadow-[0_8px_18px_rgba(255,106,61,0.28)] sm:h-11 sm:w-11">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#ff914d] to-[#ff6a3d]">
                <div className="h-5 w-5 rounded-full border-4 border-white/80 border-r-white/35 border-t-white/45" />
              </div>
            </div>

            <span className="text-[28px] font-semibold tracking-[-0.03em] text-[#3a2016] sm:text-[30px] lg:text-[32px]">
              Obliq
            </span>
          </div>

          <div className="flex flex-1 items-center justify-center md:items-start lg:items-center">
            <div className="w-full max-w-[350px] rounded-[26px] border border-white/70 bg-white/65 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur-sm sm:max-w-[380px] sm:p-6 md:mt-10 md:max-w-[380px] md:p-8 lg:mt-0 lg:max-w-[430px] lg:rounded-[28px] lg:p-10">
              <div className="mb-7 text-center sm:mb-8">
                <h1 className="text-[34px] font-semibold tracking-[-0.04em] text-[#1f2430] sm:text-[38px] md:text-[40px] lg:text-[42px]">
                  Sign up
                </h1>
                <p className="mt-2 text-sm text-[#a0a7b4] sm:text-base">
                  Create your account to continue
                </p>
              </div>

              <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-[#404756]"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="h-12 w-full rounded-2xl border border-[#e5e7eb] bg-white px-4 text-[15px] text-[#1f2430] outline-none transition focus:border-[#ff7a45] focus:ring-4 focus:ring-[#ff7a45]/10 lg:h-14"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-[#404756]"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-12 w-full rounded-2xl border border-[#e5e7eb] bg-white px-4 text-[15px] text-[#1f2430] outline-none transition focus:border-[#ff7a45] focus:ring-4 focus:ring-[#ff7a45]/10 lg:h-14"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-[#404756]"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="h-12 w-full rounded-2xl border border-[#e5e7eb] bg-white px-4 pr-12 text-[15px] text-[#1f2430] outline-none transition focus:border-[#ff7a45] focus:ring-4 focus:ring-[#ff7a45]/10 lg:h-14"
                    />

                    <button
                      type="button"
                      aria-label="Toggle password visibility"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b6bcc7] transition hover:text-[#8d96a5]"
                    >
                      {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-[#404756]"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="h-12 w-full rounded-2xl border border-[#e5e7eb] bg-white px-4 pr-12 text-[15px] text-[#1f2430] outline-none transition focus:border-[#ff7a45] focus:ring-4 focus:ring-[#ff7a45]/10 lg:h-14"
                    />

                    <button
                      type="button"
                      aria-label="Toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b6bcc7] transition hover:text-[#8d96a5]"
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff size={20} />
                      ) : (
                        <FiEye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                ) : null}

                {successMessage ? (
                  <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {successMessage}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-2xl bg-[#ff6f3d] hover:bg-white hover:border-[#ff6f3d] hover:border-2 hover:text-[#ff6f3d] text-base font-semibold text-white shadow-[0_14px_28px_rgba(255,111,61,0.28)] transition hover:bg-[#ff6224] disabled:cursor-not-allowed disabled:opacity-70 lg:h-14"
                >
                  {loading ? "Creating account..." : "Sign up"}
                </button>
              </form>

              <p className="mt-8 text-center text-[15px] text-[#737b8c] sm:mt-10">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="font-semibold text-[#1f2430]"
                >
                  Log in
                </button>
              </p>
            </div>
          </div>
        </div>

        <div className="hidden bg-[#f8f5f4] p-4 lg:block lg:p-6">
          <AuthPreview/>
        </div>
      </section>
    </main>
  );
}