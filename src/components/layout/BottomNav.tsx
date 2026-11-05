'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  // Barcode,
  Utensils,
  Bot,
  User,
} from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const items = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/meal-planner', label: 'Diary', icon: Utensils },
    // { href: '/scan', label: 'Check Food', icon: Barcode, center: true },
    { href: '/assistant', label: 'Assistant', icon: Bot },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-beige-300 shadow-lg px-2 py-1.5 safe-area-bottom">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          // if (item.center) {
          //   return (
          //     <Link
          //       key={item.href}
          //       href={item.href}
          //       className="flex flex-col items-center justify-center -mt-5 group"
          //     >
          //       <div className="w-12 h-12 rounded-full bg-coffee-800 text-[#FAF7F2] flex items-center justify-center shadow-warm group-active:scale-95 transition-transform border-2 border-white">
          //         <Icon className="w-6 h-6 text-pencil-sage-300" />
          //       </div>
          //       <span className="text-[10px] font-bold text-coffee-900 mt-0.5">
          //         Check Food
          //       </span>
          //     </Link>
          //   );
          // }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors ${
                isActive ? 'text-coffee-950 font-bold' : 'text-coffee-500 hover:text-coffee-800'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? 'text-pencil-sage-700' : 'text-coffee-400'}`}
              />
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
