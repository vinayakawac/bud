'use client';

import React, { useState, useCallback, ReactNode, ButtonHTMLAttributes } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

// ============================================================================
// BUTTON COMPONENT (inline to avoid dependency issues)
// ============================================================================

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  children: ReactNode;
}

function Button({ 
  variant = 'default', 
  size = 'default', 
  className = '',
  children,
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700',
    ghost: 'hover:bg-gray-100 text-gray-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  };
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3 text-sm',
    lg: 'h-11 rounded-md px-8',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
}

// ============================================================================
// CONFIRMATION DIALOG
// ============================================================================

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  requireTyping?: string; // Require typing a phrase to confirm
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  requireTyping,
}: ConfirmationDialogProps) {
  const [typedValue, setTypedValue] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const canConfirm = !requireTyping || typedValue === requireTyping;

  const handleConfirm = async () => {
    if (!canConfirm) return;
    
    setIsConfirming(true);
    try {
      await onConfirm();
      setTypedValue('');
      onClose();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    setTypedValue('');
    onClose();
  };

  if (!isOpen) return null;

  const iconColor = {
    danger: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  }[variant];

  const bgColor = {
    danger: 'bg-red-50 dark:bg-red-950/20',
    warning: 'bg-yellow-50 dark:bg-yellow-950/20',
    info: 'bg-blue-50 dark:bg-blue-950/20',
  }[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className={`p-4 ${bgColor} flex items-start gap-3`}>
          <div className={`${iconColor} mt-0.5`}>
            {variant === 'danger' ? (
              <Trash2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Typing confirmation */}
        {requireTyping && (
          <div className="p-4 border-t">
            <label className="block text-sm font-medium mb-2">
              Type <span className="font-mono bg-muted px-1 rounded">{requireTyping}</span> to confirm:
            </label>
            <input
              type="text"
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={requireTyping}
              autoFocus
            />
          </div>
        )}

        {/* Actions */}
        <div className="p-4 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={!canConfirm || isConfirming}
          >
            {isConfirming ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DELETE CONFIRMATION HOOK
// ============================================================================

interface UseDeleteConfirmationOptions {
  itemName: string;
  itemType: string;
  onDelete: () => Promise<void>;
  requireTyping?: boolean;
}

export function useDeleteConfirmation({
  itemName,
  itemType,
  onDelete,
  requireTyping = false,
}: UseDeleteConfirmationOptions) {
  const [isOpen, setIsOpen] = useState(false);

  const requestDelete = useCallback(() => {
    setIsOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    await onDelete();
  }, [onDelete]);

  const cancelDelete = useCallback(() => {
    setIsOpen(false);
  }, []);

  const DeleteConfirmationDialog = useCallback(() => (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={cancelDelete}
      onConfirm={confirmDelete}
      title={`Delete ${itemType}?`}
      message={`Are you sure you want to delete "${itemName}"? This action cannot be easily undone.`}
      confirmText="Delete"
      variant="danger"
      requireTyping={requireTyping ? itemName : undefined}
    />
  ), [isOpen, cancelDelete, confirmDelete, itemType, itemName, requireTyping]);

  return {
    requestDelete,
    DeleteConfirmationDialog,
    isConfirmationOpen: isOpen,
  };
}

// ============================================================================
// INLINE CONFIRM BUTTON
// ============================================================================

interface ConfirmButtonProps {
  children: React.ReactNode;
  onConfirm: () => void | Promise<void>;
  confirmMessage?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  disabled?: boolean;
}

export function ConfirmButton({
  children,
  onConfirm,
  confirmMessage = 'Are you sure?',
  variant = 'default',
  size = 'default',
  className,
  disabled,
}: ConfirmButtonProps) {
  const [state, setState] = useState<'idle' | 'confirming' | 'loading'>('idle');

  const handleClick = async () => {
    if (state === 'idle') {
      setState('confirming');
      // Auto-reset after 3 seconds
      setTimeout(() => setState('idle'), 3000);
      return;
    }

    if (state === 'confirming') {
      setState('loading');
      try {
        await onConfirm();
      } catch (error) {
        console.error('Confirm action failed:', error);
      } finally {
        setState('idle');
      }
    }
  };

  return (
    <Button
      variant={state === 'confirming' ? 'destructive' : variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || state === 'loading'}
      className={className}
    >
      {state === 'loading' ? (
        'Processing...'
      ) : state === 'confirming' ? (
        confirmMessage
      ) : (
        children
      )}
    </Button>
  );
}

// ============================================================================
// DANGER ZONE COMPONENT
// ============================================================================

interface DangerZoneProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => Promise<void>;
  confirmPhrase?: string;
}

export function DangerZone({
  title,
  description,
  actionLabel,
  onAction,
  confirmPhrase,
}: DangerZoneProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50/50 dark:bg-red-950/10">
      <h4 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
        {title}
      </h4>
      <p className="text-sm text-red-600 dark:text-red-400 mb-4">
        {description}
      </p>
      <Button 
        variant="destructive" 
        onClick={() => setIsOpen(true)}
      >
        {actionLabel}
      </Button>

      <ConfirmationDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={onAction}
        title={title}
        message={description}
        confirmText={actionLabel}
        variant="danger"
        requireTyping={confirmPhrase}
      />
    </div>
  );
}
