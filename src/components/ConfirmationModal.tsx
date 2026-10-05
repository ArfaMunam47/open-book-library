import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
  isSubmitting = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div 
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden transform transition-all p-6"
      >
        <div className="flex items-start gap-3.5 mb-4">
          <div className={`p-2.5 rounded-full shrink-0 ${isDestructive ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug">
              {title}
            </h3>
            <p className="text-stone-600 text-xs mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`px-4 py-2 text-xs font-medium text-white rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50 ${
              isDestructive 
                ? 'bg-red-700 hover:bg-red-800' 
                : 'bg-stone-900 hover:bg-stone-800'
            }`}
          >
            {isSubmitting ? (
              <span>Deleting...</span>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
