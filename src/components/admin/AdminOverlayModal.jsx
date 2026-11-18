import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

/**
 * Reusable Card Overlay Modal untuk aksi Create / Edit di Portal Admin
 */
export const AdminCardOverlayModal = ({
  isOpen,
  onClose,
  title,
  subtitle = '',
  maxWidth = 'max-w-2xl',
  children
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${maxWidth} bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8`}
      >
        {/* Header */}
        <div className="bg-[#06152b] px-6 py-4 text-white flex items-center justify-between gap-4 border-b border-white/10">
          <div className="min-w-0">
            <h4 className="text-sm sm:text-base font-black font-heading text-white truncate">
              {title}
            </h4>
            {subtitle && (
              <p className="text-[11px] text-slate-300 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[78vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

/**
 * Reusable Card Overlay Modal untuk konfirmasi Delete / Reject / Aksi Kritis di Portal Admin
 */
export const AdminConfirmOverlayModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Penghapusan',
  message = 'Apakah Anda yakin ingin menghapus data ini?',
  confirmLabel = 'Ya, Hapus',
  variant = 'danger' // 'danger' | 'warning'
}) => {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start space-x-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                isDanger
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {isDanger ? (
                <Trash2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-slate-900 font-heading">{title}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{message}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm?.();
                onClose?.();
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-xs transition-colors ${
                isDanger
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
