'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

// ============================================================================
// BUTTON COMPONENT (inline to avoid dependency issues)
// ============================================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  asChild?: boolean;
  children: ReactNode;
}

function Button({ 
  variant = 'default', 
  size = 'default', 
  className = '',
  children,
  asChild,
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: combinedClassName,
      ...props,
    });
  }

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
}

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'section' | 'component';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Report to error tracking service
    console.error('[ErrorBoundary] Caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          level={this.props.level || 'component'}
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// ERROR FALLBACK UI
// ============================================================================

interface ErrorFallbackProps {
  level: 'page' | 'section' | 'component';
  error?: Error;
  onReset?: () => void;
}

export function ErrorFallback({ level, error, onReset }: ErrorFallbackProps) {
  const isProduction = process.env.NODE_ENV === 'production';

  if (level === 'component') {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <span className="text-sm text-red-700 dark:text-red-300">
          Something went wrong loading this content.
        </span>
        {onReset && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  if (level === 'section') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Unable to load this section</h3>
        <p className="text-muted-foreground text-center mb-4 max-w-md">
          We encountered an error while loading this content. Please try refreshing.
        </p>
        {!isProduction && error && (
          <pre className="text-xs bg-muted p-3 rounded mb-4 max-w-lg overflow-auto">
            {error.message}
          </pre>
        )}
        {onReset && (
          <Button onClick={onReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  // Page level fallback
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
      <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        We're sorry, but something unexpected happened. Our team has been notified.
      </p>
      {!isProduction && error && (
        <details className="mb-6 max-w-lg w-full">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            Technical details
          </summary>
          <pre className="text-xs bg-muted p-3 rounded mt-2 overflow-auto">
            {error.message}
            {'\n\n'}
            {error.stack}
          </pre>
        </details>
      )}
      <div className="flex gap-3">
        {onReset && (
          <Button onClick={onReset} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        <Button asChild>
          <a href="/">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </a>
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// ASYNC BOUNDARY (Suspense-like)
// ============================================================================

interface AsyncBoundaryProps {
  children: ReactNode;
  loading?: ReactNode;
  error?: ReactNode;
}

interface AsyncBoundaryState {
  status: 'loading' | 'success' | 'error';
  error?: Error;
}

export class AsyncBoundary extends Component<AsyncBoundaryProps, AsyncBoundaryState> {
  constructor(props: AsyncBoundaryProps) {
    super(props);
    this.state = { status: 'success' };
  }

  static getDerivedStateFromError(error: Error): Partial<AsyncBoundaryState> {
    return { status: 'error', error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[AsyncBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.status === 'error') {
      return this.props.error || <ErrorFallback level="section" error={this.state.error} />;
    }

    return this.props.children;
  }
}

// ============================================================================
// RETRY WRAPPER
// ============================================================================

interface RetryWrapperProps {
  children: ReactNode;
  maxRetries?: number;
  onMaxRetriesReached?: () => void;
}

interface RetryWrapperState {
  hasError: boolean;
  retryCount: number;
  error?: Error;
}

export class RetryWrapper extends Component<RetryWrapperProps, RetryWrapperState> {
  constructor(props: RetryWrapperProps) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<RetryWrapperState> {
    return { hasError: true, error };
  }

  handleRetry = () => {
    const maxRetries = this.props.maxRetries || 3;
    
    if (this.state.retryCount >= maxRetries) {
      this.props.onMaxRetriesReached?.();
      return;
    }

    this.setState(prev => ({
      hasError: false,
      retryCount: prev.retryCount + 1,
      error: undefined,
    }));
  };

  render() {
    const maxRetries = this.props.maxRetries || 3;

    if (this.state.hasError) {
      const retriesRemaining = maxRetries - this.state.retryCount;

      return (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <AlertTriangle className="w-8 h-8 text-yellow-500 mb-3" />
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Failed to load. {retriesRemaining > 0 
              ? `${retriesRemaining} retries remaining.`
              : 'Maximum retries reached.'}
          </p>
          {retriesRemaining > 0 && (
            <Button size="sm" onClick={this.handleRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// HOOK-BASED ERROR HANDLING
// ============================================================================

export function useErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: string) => {
    console.error(`[Error${context ? ` in ${context}` : ''}]:`, error);
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // trackError(error, context);
    }
  }, []);

  return { handleError };
}
