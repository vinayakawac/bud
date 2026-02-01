'use client';

import Link from 'next/link';
import { ShieldOff, Home, ArrowLeft, LogIn } from 'lucide-react';

interface ForbiddenPageProps {
  message?: string;
  showLoginOption?: boolean;
}

export default function ForbiddenPage({ 
  message = "You don't have permission to access this resource.",
  showLoginOption = true 
}: ForbiddenPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="max-w-md mx-auto px-4 text-center">
        {/* Animated Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
            <ShieldOff className="w-16 h-16 text-red-500" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-sm">!</span>
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-8xl font-bold text-red-500/20 mb-2">403</h1>
        
        {/* Title */}
        <h2 className="text-2xl font-semibold text-textPrimary mb-4">
          Access Denied
        </h2>
        
        {/* Description */}
        <p className="text-textSecondary mb-8 leading-relaxed">
          {message}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-card text-textPrimary border border-border rounded-lg font-medium hover:bg-cardHover transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Login Option */}
        {showLoginOption && (
          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-textSecondary text-sm mb-4">
              Think you should have access?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/creator/login"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-accent hover:bg-accent/10 rounded-lg transition-colors text-sm"
              >
                <LogIn className="w-4 h-4" />
                Sign in as Creator
              </Link>
              <Link
                href="/admin/login"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-accent hover:bg-accent/10 rounded-lg transition-colors text-sm"
              >
                <LogIn className="w-4 h-4" />
                Sign in as Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
