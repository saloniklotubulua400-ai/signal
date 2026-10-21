export function money(cents, currency = 'USD') {
  const value = (Number(cents) || 0) / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export const dateShort = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';

export const shortId = (id) => (id ? String(id).slice(0, 8) : '');

export const billingLabel = (type) =>
  ({ one_time: 'one-time', monthly: 'per month', yearly: 'per year' }[type] || '');

export const statusLabel = (s) =>
  ({
    pending: 'Waiting for payment',
    paid: 'Paid, preparing delivery',
    fulfilled: 'Delivered',
    cancelled: 'Cancelled',
    failed: 'Payment failed',
    active: 'Active',
    pending_delivery: 'Being prepared',
    revoked: 'Revoked',
  }[s] || s);
