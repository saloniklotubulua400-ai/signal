import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { dateShort, statusLabel } from '../lib/format.js';
import { useToast } from '../context/ToastContext.jsx';

export default function License({ license, name }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  const title = name || license.products?.name || 'Your purchase';

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast('Could not copy. Select the text and copy it manually.', 'error');
    }
  };

  return (
    <div className="license">
      <div className="license-top">
        <strong>{title}</strong>
        <span className={`badge badge-${license.status}`}>{statusLabel(license.status)}</span>
      </div>
      {license.license_key && (
        <div className="license-row">
          <code className="license-key">{license.license_key}</code>
          <button className="btn btn-ghost btn-sm" onClick={() => copy(license.license_key)} aria-label="Copy license key">
            {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy</>}
          </button>
        </div>
      )}
      {license.delivery_details && <pre className="license-details">{license.delivery_details}</pre>}
      {license.status === 'pending_delivery' && (
        <p className="muted">Our team is setting this up for you. It will appear here as soon as it is ready.</p>
      )}
      {license.expires_at && <p className="muted">Valid until {dateShort(license.expires_at)}</p>}
    </div>
  );
}
