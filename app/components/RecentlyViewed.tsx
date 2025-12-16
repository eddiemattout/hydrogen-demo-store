import {Section} from '~/components/Text';
import {ProductCard} from '~/components/ProductCard';
import {
  useRecentlyViewed,
  type RecentlyViewedProduct,
} from '~/hooks/useRecentlyViewed';
import type {ProductCardFragment} from 'storefrontapi.generated';

type RecentlyViewedProps = {
  title?: string;
  currentProductId?: string;
};

export function RecentlyViewed({
  title = 'Recently Viewed',
  currentProductId,
}: RecentlyViewedProps) {
  const {products, isHydrated} = useRecentlyViewed(currentProductId);

  if (!isHydrated || products.length === 0) {
    return null;
  }

  return (
    <Section heading={title} padding="y">
      <div className="swimlane hiddenScroll md:pb-8 md:scroll-px-8 lg:scroll-px-12 md:px-8 lg:px-12">
        {products.map((product) => (
          <ProductCard
            product={product as unknown as ProductCardFragment}
            key={product.id}
            className="snap-start w-80"
          />
        ))}
      </div>
    </Section>
  );
}
