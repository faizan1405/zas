'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle, AlertCircle, ShoppingCart, X } from 'lucide-react';

/**
 * Global cart notification (toast/snackbar) system.
 *
 * Presentational only — the toast queue lives in StoreContext so that the
 * existing `addToCart` logic can raise notifications from a single place and
 * every Add-to-Cart button on the site stays consistent.
 */

const TOAST_ICONS = {
  success: CheckCircle,
  info: ShoppingCart,
  error: AlertCircle,
};

const CartToast = ({ toast, onDismiss }) => {
  const Icon = TOAST_ICONS[toast.type] || CheckCircle;
  const duration = toast.duration || 3500;

  return (
    <div
      className={`cart-toast cart-toast-${toast.type || 'success'}`}
      role="status"
      style={{ '--toast-duration': `${duration}ms` }}
    >
      <span className="cart-toast-icon" aria-hidden="true">
        <Icon size={20} />
      </span>

      {toast.image ? (
        <img src={toast.image} alt="" className="cart-toast-thumb" loading="lazy" />
      ) : null}

      <div className="cart-toast-content">
        <p className="cart-toast-title">{toast.title}</p>
        {toast.name ? <p className="cart-toast-name">{toast.name}</p> : null}
        {toast.message ? <p className="cart-toast-message">{toast.message}</p> : null}

        {toast.action ? (
          <Link
            href={toast.action.href}
            className="cart-toast-action"
            onClick={() => onDismiss(toast.id)}
          >
            <ShoppingCart size={14} />
            {toast.action.label}
          </Link>
        ) : null}
      </div>

      <button
        type="button"
        className="cart-toast-close"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(toast.id)}
      >
        <X size={16} />
      </button>

      {toast.type !== 'error' ? (
        <span className="cart-toast-progress" aria-hidden="true" />
      ) : null}
    </div>
  );
};

const Toast = ({ toasts = [], onDismiss = () => {} }) => {
  if (!toasts.length) return null;

  return (
    <div
      className="cart-toast-viewport"
      role="region"
      aria-label="Cart notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <CartToast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export default Toast;
