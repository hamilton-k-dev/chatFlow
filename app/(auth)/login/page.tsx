"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/lib/auth-client";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, MessageCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginInput) => {
    const { error } = await signIn.email({
      email: data.email,
      password: data.password,
    });
    if (error) {
      toast.error(error.message ?? "Invalid credentials. Please try again.");
      return;
    }
    router.push("/chat");
    router.refresh();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 40%, #ddd6fe 100%)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(139,92,246,0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute top-16 left-16 w-64 h-64 rounded-full bg-violet-300/20 blur-3xl" />
      <div className="absolute bottom-16 right-16 w-80 h-80 rounded-full bg-purple-400/15 blur-3xl" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-violet-500 shadow-lg shadow-violet-200">
              <MessageCircle className="text-white w-6 h-6" />
            </div>
            <span
              className="text-3xl font-bold text-gray-900"
              style={{ fontFamily: "var(--font-pacifico)" }}
            >
              ChatFlow
            </span>
          </div>
          <p className="text-gray-500 text-sm">Connect, chat, and collaborate in real time</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-violet-100/50 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <Link
              href="/login"
              className="flex-1 py-4 text-sm font-semibold text-violet-600 border-b-2 border-violet-500 bg-violet-50/50 text-center"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="flex-1 py-4 text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors text-center"
            >
              Create Account
            </Link>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors focus-within:border-violet-400 ${
                  errors.email
                    ? "border-red-300 bg-red-50/30"
                    : "border-gray-200 bg-gray-50 focus-within:bg-violet-50/30"
                }`}
              >
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors focus-within:border-violet-400 ${
                  errors.password
                    ? "border-red-300 bg-red-50/30"
                    : "border-gray-200 bg-gray-50 focus-within:bg-violet-50/30"
                }`}
              >
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:bg-violet-300 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-200 mt-2 cursor-pointer whitespace-nowrap"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
