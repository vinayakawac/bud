'use client';

import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="max-w-md mx-auto px-4 text-center">
        {/* Animated Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-accent/10 rounded-full flex items-center justify-center animate-pulse">
            <FileQuestion className="w-16 h-16 text-accent" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
            <span className="text-red-500 font-bold text-sm">?</span>
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-8xl font-bold text-accent/20 mb-2">404</h1>
        
        {/* Title */}
        <h2 className="text-2xl font-semibold text-textPrimary mb-4">
          Page Not Found
        </h2>
        
        {/* Description */}
        <p className="text-textSecondary mb-8 leading-relaxed">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. 
          It might have been moved, deleted, or never existed.
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

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-textSecondary text-sm mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/projects" className="text-accent hover:underline">
              Browse Projects
            </Link>
            <span className="text-border">•</span>
            <Link href="/creators" className="text-accent hover:underline">
              Find Creators
            </Link>
            <span className="text-border">•</span>
            <Link href="/contact" className="text-accent hover:underline">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
