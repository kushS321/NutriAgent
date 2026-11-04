'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sparkles,
  Barcode,
  Columns,
  History,
  User,
  LayoutDashboard,
  Utensils,
  Bot,
  BookOpen,
  Menu,
  X,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { UserRepository } from '@/lib/storage/userRepository';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isGuest, setIsGuest] = useState(true);
  const [userName, setUserName] = useState('Guest');

  useEffect(() => {
    const profile = UserRepository.getProfile();
    setIsGuest(profile.isGuest);
    setUserName(profile.name || 'Guest');
  }, [pathname]);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/scan', label: 'Scan Food', icon: Barcode, highlight: true },
    { href: '/meal-planner', label: 'Meal Diary', icon: Utensils },
    { href: '/insights', label: 'Insights', icon: History },
    { href: '/compare', label: 'Compare', icon: Columns },
    { href: '/assistant', label: 'Assistant', icon: Bot },
    { href: '/knowledge', label: 'Knowledge', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-beige-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-coffee-800 flex items-center justify-center text-white shadow-subtle group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-pencil-sage-300" />
              </div>
              <div>
                <span className="text-lg font-serif font-bold tracking-tight text-coffee-950">
                  Nutri<span className="text-pencil-sage-600">Agent</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] tracking-wider uppercase font-semibold text-[#275A3A] bg-[#E4F1E9] px-2 py-0.5 rounded-full border border-[#A7D1B7]">
                  Know Your Food
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-coffee-800 text-[#FAF7F2] shadow-subtle'
                        : link.highlight
                        ? 'text-[#275A3A] bg-[#E4F1E9] hover:bg-[#D1E7DD] border border-[#A7D1B7]'
                        : 'text-coffee-700 hover:text-coffee-950 hover:bg-beige-200/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Profile / Auth Pill */}
            {!isGuest && (
              <Link href="/profile" className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-coffee-800 bg-white rounded-xl border border-beige-300 hover:bg-beige-100 transition-colors shadow-subtle">
                <div className="w-4 h-4 rounded-full bg-pencil-sage-100 text-pencil-sage-800 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[110px] truncate">{userName}</span>
              </Link>
            )}
            : (
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-coffee-800 bg-white rounded-xl border border-beige-300 hover:bg-beige-100 transition-colors shadow-subtle"
              >
                <div className="w-4 h-4 rounded-full bg-pencil-sage-100 text-pencil-sage-800 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[110px] truncate">{userName}</span>
              </Link>
            )

            {/* Primary Action Button */}
            <Link
              href="/scan"
              className="hidden sm:inline-flex items-center gap-1.5 btn-pencil-brown text-xs py-2 px-3.5 font-bold"
            >
              <Barcode className="w-3.5 h-3.5 text-pencil-sage-300" />
              <span>Check Food</span>
            </Link>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-coffee-700 hover:bg-beige-200 border border-beige-300"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-beige-300 px-4 pt-3 pb-6 space-y-2 shadow-card animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-coffee-800 text-[#FAF7F2]'
                      : 'text-coffee-800 hover:bg-beige-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {!isGuest && (
            <div className="pt-3 border-t border-beige-200 flex items-center justify-between">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold text-coffee-800 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-pencil-sage-600" />
                <span>{userName} Profile</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  UserRepository.logoutUser();
                  UserRepository.clearEntered();
                  router.push('/auth/signin');
                }}
                className="text-xs text-pencil-terracotta-600 font-bold"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
