import {
  MessageSquare, Mail, MessageCircle, ShieldCheck, Phone, Hash, Wrench, Package,
} from 'lucide-react';

export const CATEGORIES = [
  { key: 'sms', label: 'SMS', color: '#0A7F96', tint: '#D3F1F8', icon: MessageSquare, match: ['sms', 'text message', 'bulk sms'] },
  { key: 'email', label: 'Email', color: '#173B73', tint: '#DCE6F6', icon: Mail, match: ['email', 'e-mail', 'newsletter'] },
  { key: 'whatsapp', label: 'WhatsApp', color: '#0B8F63', tint: '#D5F5E6', icon: MessageCircle, match: ['whatsapp', 'chat'] },
  { key: 'verify', label: 'Verification', color: '#6D3DF2', tint: '#E6DDFF', icon: ShieldCheck, match: ['verify', 'verification', 'otp', 'authentication'] },
  { key: 'voice', label: 'Voice', color: '#D2452C', tint: '#FFDFD8', icon: Phone, match: ['voice', 'call'] },
  { key: 'numbers', label: 'Phone numbers', color: '#273449', tint: '#E1E6EE', icon: Hash, match: ['number', 'sender'] },
  { key: 'setup', label: 'Setup services', color: '#A86500', tint: '#FFE8C2', icon: Wrench, match: ['setup', 'service', 'consult'] },
];

const OTHER = { key: 'other', label: 'Other', color: '#4F5878', tint: '#E4E8F4', icon: Package };

export function categoryMeta(name = '') {
  const n = String(name || '').toLowerCase().trim();
  return (
    CATEGORIES.find((c) => c.match.some((k) => n === k || (k.length > 3 && n.includes(k)))) || OTHER
  );
}

export const metaByKey = (key) => CATEGORIES.find((c) => c.key === key) || (key === 'other' ? OTHER : null);
