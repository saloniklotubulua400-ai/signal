import { categoryMeta } from '../lib/categories.js';

export default function ProductCover({ product, size = 'md' }) {
  const meta = categoryMeta(product.category);
  const Icon = meta.icon;
  const px = size === 'lg' ? 96 : size === 'sm' ? 28 : 56;
  return (
    <div className={`cover cover-${size}`} style={{ '--cat': meta.color, '--cat-tint': meta.tint }} aria-hidden="true">
      <Icon size={px} strokeWidth={1.8} />
    </div>
  );
}
