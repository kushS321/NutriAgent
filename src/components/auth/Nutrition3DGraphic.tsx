'use client';

import React from 'react';
import { Apple, Leaf, ShieldCheck, Heart, Sparkles, Flame, Droplet } from 'lucide-react';

interface Nutrition3DGraphicProps {
  headline?: string;
  subtext?: string;
}

export default function Nutrition3DGraphic({
  headline = 'Pure Nutrition Intelligence',
  subtext = 'Evidence-backed dietary analysis aligned with ICMR-NIN & FSSAI standards',
}: Nutrition3DGraphicProps) {
  return (
    <div className="relative w-full py-8 flex flex-col items-center justify-center overflow-hidden select-none">
      {/* 3D Perspective Canvas Container */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center [perspective:1000px]">
        {/* Soft Background Radial Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pencil-sage-100/60 via-pencil-peach-100/40 to-pencil-yellow-100/50 blur-2xl transform -translate-y-2 pointer-events-none" />

        {/* Outer Orbit Ring (Lightweight CSS 3D Rotation) */}
        <div className="absolute inset-4 rounded-full border border-dashed border-pencil-sage-300/60 animate-[spin_24s_linear_infinite] motion-reduce:animate-none pointer-events-none" />
        <div className="absolute inset-10 rounded-full border border-beige-300/80 animate-[spin_18s_linear_infinite_reverse] motion-reduce:animate-none pointer-events-none" />

        {/* Central 3D Nutrition Sphere */}
        <div className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-beige-100 via-beige-50 to-pencil-sage-100/70 border-2 border-pencil-sage-200/80 shadow-[0_18px_36px_-8px_rgba(61,39,29,0.18)] flex flex-col items-center justify-center text-center p-3 transform transition-transform duration-700 hover:rotate-3 hover:scale-105">
          <div className="w-12 h-12 rounded-2xl bg-coffee-800 text-white flex items-center justify-center shadow-md mb-1.5">
            <Sparkles className="w-6 h-6 text-pencil-sage-300 animate-pulse motion-reduce:animate-none" />
          </div>
          <span className="text-[11px] font-serif font-bold text-coffee-950 tracking-tight leading-tight">
            NutriAgent
          </span>
          <span className="text-[9px] uppercase tracking-wider font-semibold text-pencil-sage-700 bg-pencil-sage-50 px-2 py-0.5 rounded-full border border-pencil-sage-200 mt-1">
            Safe Choice
          </span>
        </div>

        {/* Floating Pastel Ingredient Pill 1: Antioxidants / Berries (Top Left) */}
        <div className="absolute top-2 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-sm border border-pencil-peach-200 text-coffee-900 shadow-sm animate-[bounce_4s_ease-in-out_infinite] motion-reduce:animate-none">
          <div className="w-6 h-6 rounded-lg bg-pencil-peach-100 text-pencil-peach-700 flex items-center justify-center">
            <Apple className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold leading-none text-coffee-950">Nutrient Ratio</p>
            <p className="text-[9px] text-coffee-600 font-medium leading-tight">Sugar &lt; 25g/d</p>
          </div>
        </div>

        {/* Floating Pastel Ingredient Pill 2: Greens / Fiber (Bottom Right) */}
        <div className="absolute bottom-3 right-2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-sm border border-pencil-sage-200 text-coffee-900 shadow-sm animate-[bounce_5s_ease-in-out_infinite_reverse] motion-reduce:animate-none">
          <div className="w-6 h-6 rounded-lg bg-pencil-sage-100 text-pencil-sage-700 flex items-center justify-center">
            <Leaf className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold leading-none text-coffee-950">Dietary Fiber</p>
            <p className="text-[9px] text-pencil-sage-700 font-semibold leading-tight">100% Plant Fuel</p>
          </div>
        </div>

        {/* Floating Pastel Ingredient Pill 3: Allergen Safety Guard (Top Right) */}
        <div className="absolute top-4 right-1 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-white/95 backdrop-blur-sm border border-pencil-blue-200 text-coffee-900 shadow-sm animate-[pulse_3s_ease-in-out_infinite] motion-reduce:animate-none">
          <div className="w-6 h-6 rounded-lg bg-pencil-blue-100 text-pencil-blue-700 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold leading-none text-coffee-950">Allergen Shield</p>
            <p className="text-[9px] text-pencil-blue-700 font-medium leading-tight">Zero Guesswork</p>
          </div>
        </div>

        {/* Floating Pastel Pill 4: Heart Health & Sodium (Bottom Left) */}
        <div className="absolute bottom-4 left-2 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-white/95 backdrop-blur-sm border border-pencil-yellow-200 text-coffee-900 shadow-sm animate-[pulse_4s_ease-in-out_infinite_1s] motion-reduce:animate-none">
          <div className="w-6 h-6 rounded-lg bg-pencil-yellow-100 text-pencil-yellow-700 flex items-center justify-center">
            <Heart className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold leading-none text-coffee-950">Sodium Watch</p>
            <p className="text-[9px] text-coffee-600 font-medium leading-tight">&lt; 2,000 mg/d</p>
          </div>
        </div>
      </div>

      {/* Caption Text */}
      <div className="text-center mt-3 max-w-xs space-y-1">
        <h3 className="text-sm font-serif font-bold text-coffee-950">{headline}</h3>
        <p className="text-[11px] text-coffee-600 leading-snug">{subtext}</p>
      </div>
    </div>
  );
}

