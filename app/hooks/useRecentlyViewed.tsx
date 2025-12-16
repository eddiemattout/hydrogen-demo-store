import {useState, useEffect, useCallback} from 'react';

import type {ProductCardFragment} from 'storefrontapi.generated';

const STORAGE_KEY = 'recently-viewed-products';
const MAX_PRODUCTS = 8;

export type RecentlyViewedProduct = Pick<
  ProductCardFragment,
  'id' | 'title' | 'handle' | 'vendor' | 'publishedAt'
> & {
  variants: {
    nodes: Array<{
      id: string;
      availableForSale: boolean;
      image: {
        url: string;
        altText: string | null;
        width: number;
        height: number;
      } | null;
      price: {
        amount: string;
        currencyCode: string;
      };
      compareAtPrice: {
        amount: string;
        currencyCode: string;
      } | null;
      selectedOptions: Array<{
        name: string;
        value: string;
      }>;
      product: {
        handle: string;
        title: string;
      };
    }>;
  };
};

function getStoredProducts(): RecentlyViewedProduct[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function storeProducts(products: RecentlyViewedProduct[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {
    // localStorage might be full or disabled
  }
}

export function useRecentlyViewed(currentProductId?: string) {
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    setProducts(getStoredProducts());
  }, []);

  const addProduct = useCallback((product: RecentlyViewedProduct) => {
    setProducts((prevProducts) => {
      const filtered = prevProducts.filter((p) => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, MAX_PRODUCTS);
      storeProducts(updated);
      return updated;
    });
  }, []);

  const filteredProducts = currentProductId
    ? products.filter((p) => p.id !== currentProductId)
    : products;

  return {
    products: filteredProducts,
    addProduct,
    isHydrated,
  };
}
