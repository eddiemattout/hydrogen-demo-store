import {useState, useEffect, useCallback} from 'react';

const STORAGE_KEY = 'recently-viewed-products';
const MAX_ITEMS = 12;

export interface RecentlyViewedProduct {
  handle: string;
  viewedAt: number;
}

function getStoredProducts(): RecentlyViewedProduct[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as RecentlyViewedProduct[];
  } catch {
    return [];
  }
}

function setStoredProducts(products: RecentlyViewedProduct[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {
    // localStorage might be full or disabled
  }
}

export function useRecentlyViewed() {
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setProducts(getStoredProducts());
    setIsHydrated(true);
  }, []);

  const addProduct = useCallback((handle: string) => {
    if (!handle) return;

    setProducts((currentProducts) => {
      const filtered = currentProducts.filter((p) => p.handle !== handle);

      const newProduct: RecentlyViewedProduct = {
        handle,
        viewedAt: Date.now(),
      };

      const updated = [newProduct, ...filtered].slice(0, MAX_ITEMS);

      setStoredProducts(updated);
      return updated;
    });
  }, []);

  const removeProduct = useCallback((handle: string) => {
    setProducts((currentProducts) => {
      const updated = currentProducts.filter((p) => p.handle !== handle);
      setStoredProducts(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setProducts([]);
    setStoredProducts([]);
  }, []);

  const getHandles = useCallback((): string[] => {
    return products.map((p) => p.handle);
  }, [products]);

  return {
    products,
    handles: products.map((p) => p.handle),
    isHydrated,
    addProduct,
    removeProduct,
    clearAll,
    getHandles,
  };
}
