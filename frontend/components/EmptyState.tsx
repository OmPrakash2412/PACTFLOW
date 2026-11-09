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
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-100 to-amber-100 border border-purple-200/80 flex items-center justify-center mx-auto shadow-sm text-purple-700">
        <Icon className="w-8 h-8 text-purple-700" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xl font-black text-[#231A12] tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-[#6B5C4D] leading-relaxed max-w-md mx-auto font-medium">
          {description}
        </p>
      </div>

      {(actionLabel || secondaryLabel) && (
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {actionLabel && (
            actionHref ? (
              <Link
                href={actionHref}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 group"
              >
                <span>{actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <button
                onClick={onAction}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 group"
              >
                <span>{actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            )
          )}

          {secondaryLabel && secondaryHref && (
            <Link
              href={secondaryHref}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white hover:bg-purple-50 text-[#4B3F33] hover:text-[#231A12] border border-[#DFD4C3] text-xs font-bold shadow-sm transition-all"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

