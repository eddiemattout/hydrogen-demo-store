import {useEffect, useRef} from 'react';
import {useFetcher} from '@remix-run/react';

import type {ProductCardFragment} from 'storefrontapi.generated';
import {ProductSwimlane} from '~/components/ProductSwimlane';
import {useRecentlyViewed} from '~/hooks/useRecentlyViewed';

interface RecentlyViewedProductsProps {
  title?: string;
  count?: number;
}

interface FetcherData {
  products: ProductCardFragment[];
}

export function RecentlyViewedProducts({
  title = 'Recently Viewed',
  count = 12,
}: RecentlyViewedProductsProps) {
  const {handles, isHydrated} = useRecentlyViewed();
  const fetcher = useFetcher<FetcherData>();
  const lastFetchedHandles = useRef<string>('');

  useEffect(() => {
    if (!isHydrated || handles.length === 0) return;

    const handlesToFetch = handles.slice(0, count);
    const handlesParam = handlesToFetch.join(',');

    if (lastFetchedHandles.current === handlesParam) return;

    lastFetchedHandles.current = handlesParam;
    const url = `/api/recently-viewed?handles=${encodeURIComponent(
      handlesParam,
    )}`;
    fetcher.load(url);
  }, [isHydrated, handles, count, fetcher]);

  if (!isHydrated || handles.length === 0) {
    return null;
  }

  if (fetcher.state === 'loading' && !fetcher.data) {
    return null;
  }

  const products = fetcher.data?.products ?? [];

  if (products.length === 0) {
    return null;
  }

  return (
    <ProductSwimlane title={title} products={{nodes: products}} count={count} />
  );
}
