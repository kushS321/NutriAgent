'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { UserRepository } from '@/lib/storage/userRepository';
import { SupabaseClient } from '@/lib/storage/supabaseClient';
import Nutrition3DGraphic from '@/components/auth/Nutrition3DGraphic';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isSupabaseConfigured = SupabaseClient.isConfigured();

  // Password strength calculation
  const passwordMetrics = useMemo(() => {
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    let score = 0;
    if (password.length >= 6) score += 1;
    if (hasMinLength) score += 1;
    if (hasNumber && hasLetter) score += 1;
    if (hasSpecial) score += 1;

    let label = 'Too Short';
    let color = 'bg-red-400';
    let textColor = 'text-red-700';

    if (score === 1) {
      label = 'Weak';
      color = 'bg-orange-400';
      textColor = 'text-orange-700';
    } else if (score === 2) {
      label = 'Fair';
      color = 'bg-pencil-yellow-400';
      textColor = 'text-pencil-yellow-700';
    } else if (score === 3) {
      label = 'Good';
      color = 'bg-pencil-blue-400';
      textColor = 'text-pencil-blue-700';
    } else if (score >= 4) {
      label = 'Strong';
      color = 'bg-pencil-sage-500';
      textColor = 'text-pencil-sage-700';
    }

    return {
      score,
      label,
      color,
      textColor,
      hasMinLength,
      hasNumber,
      hasLetter,
      hasSpecial,
    };
  }, [password]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter to confirm.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await SupabaseClient.signUp(cleanEmail, password, {
          full_name: cleanName,
        });
        if (error) throw error;

        // Create local profile record
        const profile = UserRepository.getProfile();
        profile.name = cleanName;
        profile.email = cleanEmail;
        profile.isGuest = false;
        UserRepository.saveProfile(profile);

        UserRepository.markEntered();
        setSuccessMessage('Account created! Opening your dashboard...');
        setTimeout(() => router.push('/dashboard'), 700);
      } else {
        // Register in local-first multi-account store
        const result = await UserRepository.registerUser(cleanName, cleanEmail, password);
        if (!result.success) {
          throw new Error(result.error || 'Failed to register account.');
        }

        UserRepository.markEntered();
        setSuccessMessage('Account registered successfully! Opening your dashboard...');
        setTimeout(() => router.push('/dashboard'), 700);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check your information.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Column: Subtle 3D Nutrition Visual & Trust Info */}
        <div className="hidden md:flex md:col-span-5 flex-col items-center justify-center p-6 bg-beige-100/60 rounded-3xl border border-beige-300 shadow-sm text-center">
          <Nutrition3DGraphic
            headline="Your Personal Nutrition Guardian"
            subtext="Track allergens, manage chronic health targets, and safely decode packaged foods."
          />

          <div className="mt-4 pt-4 border-t border-beige-300 w-full text-left space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-coffee-800">
              <ShieldCheck className="w-4 h-4 text-pencil-sage-600 shrink-0" />
              <span>Zero ad tracking &amp; strict data minimization</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-coffee-800">
              <Check className="w-4 h-4 text-pencil-peach-600 shrink-0" />
              <span>Safety-critical allergen &amp; cross-contact filters</span>
            </div>
          </div>
        </div>

        {/* Right Column: Registration Card */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-beige-300 p-8 sm:p-10 shadow-card space-y-6">
          {/* Header */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pencil-peach-50 text-pencil-peach-700 border border-pencil-peach-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Join NutriAgent</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-coffee-950">
              Create Your Account
            </h1>
            <p className="text-xs sm:text-sm text-coffee-600">
              Personalize food scanning, track dietary goals, and save your preferences securely.
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

          {/* Registration Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="signup-name" className="block text-xs font-bold text-coffee-900">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-coffee-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-coffee-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-coffee-700 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label htmlFor="signup-email" className="block text-xs font-bold text-coffee-900">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-coffee-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="signup-email"
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

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="signup-password" className="block text-xs font-bold text-coffee-900">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-coffee-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="space-y-1.5 pt-1 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-coffee-600">Password strength:</span>
                    <span className={`font-bold ${passwordMetrics.textColor}`}>
                      {passwordMetrics.label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-beige-200 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        passwordMetrics.score >= 1 ? passwordMetrics.color : 'bg-transparent'
                      }`}
                      style={{ width: '25%' }}
                    />
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        passwordMetrics.score >= 2 ? passwordMetrics.color : 'bg-transparent'
                      }`}
                      style={{ width: '25%' }}
                    />
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        passwordMetrics.score >= 3 ? passwordMetrics.color : 'bg-transparent'
                      }`}
                      style={{ width: '25%' }}
                    />
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        passwordMetrics.score >= 4 ? passwordMetrics.color : 'bg-transparent'
                      }`}
                      style={{ width: '25%' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="signup-confirm-password"
                className="block text-xs font-bold text-coffee-900"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-coffee-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="signup-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-coffee-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-coffee-700 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Terms and Privacy Consent Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-coffee-800 border-beige-300 focus:ring-coffee-700 accent-coffee-800"
                  required
                />
                <span className="text-xs text-coffee-700 leading-relaxed">
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="font-semibold text-coffee-950 underline hover:text-pencil-peach-700"
                  >
                    Terms of Service
                  </Link>{' '}
                  and acknowledge the{' '}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="font-semibold text-coffee-950 underline hover:text-pencil-peach-700"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-coffee-900 text-white font-bold text-xs sm:text-sm hover:bg-coffee-800 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Your Profile...</span>
                </>
              ) : (
                <>
                  <span>Create Account &amp; Setup Profile</span>
                  <ArrowRight className="w-4 h-4 text-pencil-sage-300" />
                </>
              )}
            </button>
          </form>

          {/* Existing Account Link */}
          <div className="pt-4 border-t border-beige-200 text-center">
            <p className="text-xs text-coffee-700">
              Already have an account?{' '}
              <Link
                href="/auth/signin"
                className="font-bold text-coffee-950 underline hover:text-pencil-sage-700 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
