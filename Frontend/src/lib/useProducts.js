import { useEffect, useState } from 'react';
import { api } from './api.js';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api.get('/api/products', { auth: false })
      .then((d) => alive && setProducts(Array.isArray(d) ? d : []))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  return { products, loading, error };
}
