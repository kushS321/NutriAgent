'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { UserRepository } from '@/lib/storage/userRepository';
import { SupabaseClient } from '@/lib/storage/supabaseClient';
import Nutrition3DGraphic from '@/components/auth/Nutrition3DGraphic';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const isSupabaseConfigured = SupabaseClient.isConfigured();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid email format (e.g. name@example.com).');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await SupabaseClient.signIn(cleanEmail, password);
        if (error) throw error;

        // Sync local profile state
        const profile = UserRepository.getProfile();
        profile.email = cleanEmail;
        profile.isGuest = false;
        profile.name = cleanEmail.split('@')[0];
        UserRepository.saveProfile(profile);
        UserRepository.markEntered();

        setSuccessMessage('Signed in successfully! Opening your dashboard...');
        setTimeout(() => router.push('/dashboard'), 700);
      } else {
        // Local-first authenticated session with hashed password verification
        const result = await UserRepository.loginUser(cleanEmail, password, rememberMe);
        if (!result.success) {
          throw new Error(result.error || 'Invalid email or password.');
        }
        UserRepository.markEntered();
        setSuccessMessage(`Welcome back, ${result.user?.name || 'Explorer'}! Redirecting...`);
        setTimeout(() => router.push('/dashboard'), 600);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // const handleContinueGuest = () => {
  //   UserRepository.logoutUser();
  //   UserRepository.markEntered();
  //   router.push('/dashboard');
  // };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) return;
    setForgotLoading(true);

    // Simulate recovery flow or invoke Supabase reset
    await new Promise((r) => setTimeout(r, 800));
    setForgotLoading(false);
    setForgotSent(true);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Column: Subtle 3D Nutrition Visual & Context */}
        <div className="hidden md:flex md:col-span-5 flex-col items-center justify-center p-6 bg-beige-100/60 rounded-3xl border border-beige-300 shadow-sm text-center">
          <Nutrition3DGraphic
            headline="Know Your Food. Know Your Health."
            subtext="Personalized label intelligence matching your allergies, health goals, and dietary choices."
          />

          <div className="mt-4 pt-4 border-t border-beige-300 w-full text-left space-y-2">
            <div className="flex items-center gap-2 text-xs text-coffee-800">
              <ShieldCheck className="w-4 h-4 text-pencil-sage-600 shrink-0" />
              <span>Evidence-based clinical benchmarks (ICMR-NIN & FSSAI)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-coffee-800">
              <UserCheck className="w-4 h-4 text-pencil-peach-600 shrink-0" />
              <span>Private, local-first dietary profile isolation</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sign In Card */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-beige-300 p-8 sm:p-10 shadow-card space-y-6">

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-coffee-950">
              <center>NutriAgent</center>
            </h1>
          {/* Header */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pencil-sage-50 text-pencil-sage-700 border border-pencil-sage-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Nutrition Hub</span>
            </div>
            <p className="text-xs sm:text-sm text-coffee-600">
              Access your personalized dietary rules, meal diary, and scanned food verdicts.
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-start gap-2.5 text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-pencil-sage-50 border border-pencil-sage-200 text-pencil-sage-800 rounded-2xl flex items-center gap-2.5 text-xs animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-pencil-sage-600" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="signin-email" className="block text-xs font-bold text-coffee-900">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-coffee-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-coffee-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-coffee-700 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="signin-password"
                  className="block text-xs font-bold text-coffee-900"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotSent(false);
                    setForgotModalOpen(true);
                  }}
                  className="text-[11px] text-pencil-peach-700 hover:text-pencil-peach-800 font-semibold transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-coffee-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-coffee-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-coffee-700 focus:bg-white transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-coffee-400 hover:text-coffee-700 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            {/* <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-coffee-800 border-beige-300 focus:ring-coffee-700 accent-coffee-800"
                />
                <span className="text-xs text-coffee-700">Remember me for 30 days</span>
              </label>
            </div> */}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-coffee-900 text-white font-bold text-xs sm:text-sm hover:bg-coffee-800 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-pencil-sage-300" />
                </>
              )}
            </button>
          </form>

          {/* Guest Mode & Register Navigation */}
          {/* <div className="pt-4 border-t border-beige-200 space-y-3 text-center">
            <p className="text-xs text-coffee-700">
              Don&apos;t have an account yet?{' '}
              <Link
                href="/auth/signup"
                className="font-bold text-coffee-950 underline hover:text-pencil-sage-700 transition-colors"
              >
                Create an account
              </Link>
            </p>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-beige-200"></div>
              <span className="flex-shrink mx-3 text-[10px] text-coffee-400 uppercase tracking-widest font-semibold">
                Or
              </span>
              <div className="flex-grow border-t border-beige-200"></div>
            </div>

            <button
              type="button"
              onClick={handleContinueGuest}
              className="w-full py-2.5 px-4 rounded-xl border border-beige-300 bg-beige-50/70 hover:bg-beige-100 text-coffee-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Continue as Guest</span>
              <span className="text-[10px] text-coffee-500 font-normal">
              </span>
            </button>
          </div> */}

          {/* Register Navigation */}
          <div className="pt-4 border-t border-beige-200 space-y-3 text-center">
            <p className="text-xs text-coffee-700">
              Don&apos;t have an account yet?{' '}
              <Link
                href="/auth/signup"
                className="font-bold text-coffee-950 underline hover:text-pencil-sage-700 transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-beige-300 p-6 sm:p-8 max-w-md w-full shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-coffee-950 font-serif font-bold text-lg">
                <HelpCircle className="w-5 h-5 text-pencil-peach-600" />
                <span>Password Recovery</span>
              </div>
              <button
                onClick={() => setForgotModalOpen(false)}
                className="p-1 rounded-lg text-coffee-400 hover:text-coffee-800 hover:bg-beige-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSent ? (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 rounded-full bg-pencil-sage-100 text-pencil-sage-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-coffee-950">Password Instructions Ready</h4>
                  <p className="text-xs text-coffee-600 leading-relaxed">
                    If an account is associated with <strong>{forgotEmail}</strong>, instructions to
                    reset your password have been generated.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-coffee-900 text-white text-xs font-bold hover:bg-coffee-800"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5">
                <p className="text-xs text-coffee-600 leading-relaxed">
                  Enter your registered email address. We will verify your account and provide
                  secure recovery options.
                </p>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-coffee-800">Email Address</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-xs text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="flex-1 py-2 rounded-xl border border-beige-300 text-xs font-semibold text-coffee-700 hover:bg-beige-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2 rounded-xl bg-coffee-900 text-white text-xs font-bold hover:bg-coffee-800 disabled:opacity-50"
                  >
                    {forgotLoading ? 'Processing...' : 'Send Recovery'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
