'use client';

import * as React from 'react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';
import { Button } from './button';
import { AlertTriangle, LogOut, Trash2, Info, Loader2 } from 'lucide-react';

export interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  icon?: 'logout' | 'delete' | 'warning' | 'info';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  icon = 'warning',
  isLoading = false,
  onConfirm,
}: ConfirmModalProps) {
  const getIcon = () => {
    switch (icon) {
      case 'logout':
        return <LogOut className="h-5 w-5 text-state-error" />;
      case 'delete':
        return <Trash2 className="h-5 w-5 text-state-error" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-state-warning" />;
      default:
        return <Info className="h-5 w-5 text-white" />;
    }
  };

  const getConfirmButtonClasses = () => {
    switch (variant) {
      case 'danger':
        return 'bg-state-error text-white hover:bg-state-error/90 font-mono text-xs';
      case 'warning':
        return 'bg-amber-600 text-white hover:bg-amber-700 font-mono text-xs';
      default:
        return 'bg-white text-black hover:bg-neutral-200 font-mono text-xs font-semibold';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="font-mono text-sm font-bold text-white flex items-center gap-2.5">
          {getIcon()}
          <span>{title}</span>
        </DialogTitle>
        <DialogDescription className="font-mono text-xs text-foreground-secondary pt-1 leading-relaxed">
          {description}
        </DialogDescription>
      </DialogHeader>

      <DialogFooter className="gap-2 pt-4 border-t border-border mt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenChange(false)}
          disabled={isLoading}
          className="font-mono text-xs"
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={async () => {
            await onConfirm();
          }}
          disabled={isLoading}
          className={getConfirmButtonClasses()}
        >
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
          <span>{confirmLabel}</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
