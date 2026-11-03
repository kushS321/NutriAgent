'use client';

import React from 'react';
import { AssessmentStatus } from '@/types/nutrition';
import { CheckCircle2, AlertTriangle, HelpCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: AssessmentStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const configs: Record<
    AssessmentStatus,
    {
      label: string;
      fullText: string;
      icon: any;
      containerClasses: string;
      iconClasses: string;
    }
  > = {
    fits_preferences: {
      label: 'Fits Preferences',
      fullText: 'Fits your stated preferences',
      icon: CheckCircle2,
      containerClasses: 'bg-[#E4F1E9] text-[#275A3A] border-[#A7D1B7]',
      iconClasses: 'text-pencil-sage-600',
    },
    review_carefully: {
      label: 'Review Carefully',
      fullText: 'Review before choosing',
      icon: AlertTriangle,
      containerClasses: 'bg-[#FDF9D7] text-[#715707] border-[#FAF0AE]',
      iconClasses: 'text-[#9A7B0D]',
    },
    potential_conflict: {
      label: 'Potential Conflict',
      fullText: 'Potential conflict with your preferences',
      icon: XCircle,
      containerClasses: 'bg-[#FCE6DF] text-[#A8442A] border-[#F1A593]',
      iconClasses: 'text-pencil-terracotta-600',
    },
    not_enough_information: {
      label: 'Not Enough Info',
      fullText: 'Insufficient information to assess',
      icon: HelpCircle,
      containerClasses: 'bg-beige-100 text-coffee-800 border-beige-300',
      iconClasses: 'text-coffee-600',
    },
  };

  const config = configs[status] || configs.not_enough_information;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-xs sm:text-sm px-3.5 py-1.5 gap-1.5',
    lg: 'text-sm sm:text-base px-4 py-2 gap-2 font-bold shadow-subtle',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold tracking-tight transition-all ${config.containerClasses} ${sizeClasses}`}
    >
      {showIcon && (
        <Icon
          className={`shrink-0 ${
            size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
          } ${config.iconClasses}`}
        />
      )}
      <span>{size === 'lg' ? config.fullText : config.label}</span>
    </span>
  );
}
