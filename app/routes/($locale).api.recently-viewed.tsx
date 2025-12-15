import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {flattenConnection} from '@shopify/hydrogen';

import type {ProductCardFragment} from 'storefrontapi.generated';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';

export async function loader({
  request,
  context: {storefront},
}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  const handlesParam = searchParams.get('handles') ?? '';
  const handles = handlesParam
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean);

  if (handles.length === 0) {
    return json({products: []});
  }

  const query = handles.map((handle) => `handle:${handle}`).join(' OR ');

  const {products} = await storefront.query(RECENTLY_VIEWED_PRODUCTS_QUERY, {
    variables: {
      query,
      count: handles.length,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
    cache: storefront.CacheShort(),
  });

  if (!products) {
    return json({products: []});
  }

  const flatProducts = flattenConnection(products) as ProductCardFragment[];

  const orderedProducts = handles
    .map((handle) => flatProducts.find((p) => p.handle === handle))
    .filter((p): p is ProductCardFragment => Boolean(p));

  return json({
    products: orderedProducts,
  });
}

const RECENTLY_VIEWED_PRODUCTS_QUERY = `#graphql
  query RecentlyViewedProducts(
    $query: String!
    $count: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $count, query: $query) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

export default function RecentlyViewedApiRoute() {
  return null;
}
