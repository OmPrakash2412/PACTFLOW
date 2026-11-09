'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationBannerProps {
  type: NotificationType;
  message: string;
  title?: string;
  onClose?: () => void;
  autoCloseMs?: number;
}

export default function NotificationBanner({
  type,
  message,
  title,
  onClose,
  autoCloseMs = 6000,
}: NotificationBannerProps) {
  useEffect(() => {
    if (autoCloseMs && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [autoCloseMs, onClose]);

  const config = {
    success: {
      bg: 'bg-emerald-50/95 border-emerald-300 text-emerald-950 shadow-emerald-700/10',
      icon: CheckCircle2,
      iconColor: 'text-emerald-700',
      defaultTitle: 'Success',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    error: {
      bg: 'bg-rose-50/95 border-rose-300 text-rose-950 shadow-rose-700/10',
      icon: AlertCircle,
      iconColor: 'text-rose-700',
      defaultTitle: 'Action Failed',
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
    },
    warning: {
      bg: 'bg-amber-50/95 border-amber-300 text-amber-950 shadow-amber-700/10',
      icon: AlertTriangle,
      iconColor: 'text-amber-700',
      defaultTitle: 'Attention',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    info: {
      bg: 'bg-purple-50/95 border-purple-300 text-purple-950 shadow-purple-700/10',
      icon: Info,
      iconColor: 'text-purple-700',
      defaultTitle: 'Notice',
      badge: 'bg-purple-100 text-purple-800 border-purple-300',
    },
  }[type];

  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`p-4 rounded-2xl border backdrop-blur-md shadow-md animate-fadeIn flex items-start justify-between gap-3 ${config.bg}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono uppercase tracking-wider">
              {title || config.defaultTitle}
            </span>
          </div>
          <p className="text-xs font-medium leading-relaxed">{message}</p>
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss notification"
          className="p-1 rounded-lg hover:bg-black/5 text-[#6B5C4D] hover:text-[#231A12] transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
