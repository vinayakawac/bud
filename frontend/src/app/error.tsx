'use client';

import Link from 'next/link';
import { ServerCrash, Home, RefreshCw } from 'lucide-react';

interface ErrorPageProps {
  error?: Error & { digest?: string };
  reset?: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="max-w-md mx-auto px-4 text-center">
        {/* Animated Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-orange-500/10 rounded-full flex items-center justify-center">
            <ServerCrash className="w-16 h-16 text-orange-500" />
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-8xl font-bold text-orange-500/20 mb-2">500</h1>
        
        {/* Title */}
        <h2 className="text-2xl font-semibold text-textPrimary mb-4">
          Something Went Wrong
        </h2>
        
        {/* Description */}
        <p className="text-textSecondary mb-8 leading-relaxed">
          We apologize for the inconvenience. An unexpected error has occurred.
          Our team has been notified.
        </p>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-8 p-4 bg-card border border-border rounded-lg text-left">
            <p className="text-sm text-textSecondary font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-textSecondary/60 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {reset && (
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-card text-textPrimary border border-border rounded-lg font-medium hover:bg-cardHover transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-textSecondary text-sm">
            If this problem persists, please{' '}
            <Link href="/contact" className="text-accent hover:underline">
              contact support
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
