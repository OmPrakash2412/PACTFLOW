import React from 'react';
import Link from 'next/link';
import { LucideIcon, ArrowRight, FolderPlus } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export default function EmptyState({
  icon: Icon = FolderPlus,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel,
  secondaryHref,
}: EmptyStateProps) {
  return (
    <div className="glass-card p-8 sm:p-12 rounded-3xl border border-white/90 shadow-glass text-center space-y-5 max-w-xl mx-auto my-6">
      <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto shadow-sm text-stone-800">
        <Icon className="w-7 h-7 text-stone-800" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-[#231A12] tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-[#6B5C4D] leading-relaxed max-w-md mx-auto font-medium">
          {description}
        </p>
      </div>

      {(actionLabel || secondaryLabel) && (
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          {actionLabel && (
            actionHref ? (
              <Link
                href={actionHref}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 group min-h-[40px]"
              >
                <span>{actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <button
                onClick={onAction}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 group min-h-[40px]"
              >
                <span>{actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )
          )}

          {secondaryLabel && secondaryHref && (
            <Link
              href={secondaryHref}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-[#4B3F33] hover:text-[#231A12] border border-[#DFD4C3] text-xs font-semibold shadow-sm transition-all min-h-[40px] flex items-center justify-center"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

