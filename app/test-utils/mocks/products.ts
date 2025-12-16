import type {ProductCardFragment} from 'storefrontapi.generated';

export function createMockProduct(
  overrides: Partial<ProductCardFragment> = {},
): ProductCardFragment {
  return {
    id: 'gid://shopify/Product/1',
    title: 'Test Product',
    handle: 'test-product',
    publishedAt: new Date().toISOString(),
    vendor: 'Test Vendor',
    variants: {
      nodes: [
        {
          id: 'gid://shopify/ProductVariant/1',
          availableForSale: true,
          price: {amount: '10.00', currencyCode: 'USD'},
          compareAtPrice: null,
          image: {
            url: 'https://example.com/image.jpg',
            altText: 'Test Image',
            width: 100,
            height: 100,
          },
          selectedOptions: [],
          product: {
            handle: 'test-product',
            title: 'Test Product',
          },
        },
      ],
    },
    ...overrides,
  };
}

export function createMockProductWithDiscount(
  overrides: Partial<ProductCardFragment> = {},
): ProductCardFragment {
  return createMockProduct({
    variants: {
      nodes: [
        {
          id: 'gid://shopify/ProductVariant/1',
          availableForSale: true,
          price: {amount: '10.00', currencyCode: 'USD'},
          compareAtPrice: {amount: '15.00', currencyCode: 'USD'},
          image: {
            url: 'https://example.com/image.jpg',
            altText: 'Test Image',
            width: 100,
            height: 100,
          },
          selectedOptions: [],
          product: {
            handle: 'test-product',
            title: 'Test Product',
          },
        },
      ],
    },
    ...overrides,
  });
}
