# Unit Test Implementation Plan

This document outlines a comprehensive plan for adding unit test coverage to the Hydrogen Demo Store codebase. The repository currently has end-to-end testing with Playwright but lacks unit tests.

## 1. Testing Framework Selection

### Recommendation: Vitest

For this Hydrogen/Remix-based storefront, **Vitest** is the recommended unit testing framework over Jest for the following reasons:

**Why Vitest over Jest:**

1. **Native Vite Integration**: The project already uses Vite as its build tool (`vite.config.ts`). Vitest is built on top of Vite and shares its configuration, plugins, and transformation pipeline. This means faster test execution and zero additional configuration for path aliases, TypeScript, and ESM modules.

2. **ESM-First Design**: The project uses `"type": "module"` in `package.json`. Vitest has first-class ESM support, while Jest requires additional configuration and workarounds for ESM modules.

3. **Faster Test Execution**: Vitest uses Vite's on-demand compilation and HMR capabilities, resulting in significantly faster test runs compared to Jest, especially for watch mode during development.

4. **Compatible API**: Vitest provides a Jest-compatible API, making it easy for developers familiar with Jest to adopt. The `describe`, `it`, `expect`, and mocking APIs are nearly identical.

5. **Built-in TypeScript Support**: No additional configuration needed for TypeScript, which the project uses extensively.

6. **Hydrogen/Remix Ecosystem Alignment**: Shopify's Hydrogen documentation and community examples increasingly use Vitest for unit testing.

### Additional Testing Libraries

| Library                     | Purpose                                     |
| --------------------------- | ------------------------------------------- |
| `@testing-library/react`    | Component testing with user-centric queries |
| `@testing-library/jest-dom` | Custom DOM matchers for assertions          |
| `happy-dom` or `jsdom`      | DOM environment for component tests         |
| `@remix-run/testing`        | Utilities for testing Remix loaders/actions |
| `msw` (Mock Service Worker) | API mocking for Storefront API calls        |

## 2. Configuration Setup

### 2.1 Vitest Configuration File

Create `vitest.config.ts` in the project root:

```typescript
/// <reference types="vitest" />
import {defineConfig} from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['app/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'tests/**/*'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['app/**/*.{ts,tsx}'],
      exclude: [
        'app/**/*.test.{ts,tsx}',
        'app/entry.*.tsx',
        'app/root.tsx',
        '**/*.d.ts',
      ],
      thresholds: {
        statements: 50,
        branches: 50,
        functions: 50,
        lines: 50,
      },
    },
  },
});
```

### 2.2 Test Setup File

Create `vitest.setup.ts` in the project root:

```typescript
import '@testing-library/jest-dom/vitest';
import {cleanup} from '@testing-library/react';
import {afterEach, vi} from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia for components that use media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver for components using react-intersection-observer
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});
```

### 2.3 TypeScript Configuration Update

Update `tsconfig.json` to include Vitest types:

```json
{
  "compilerOptions": {
    "types": ["@shopify/oxygen-workers-types", "vitest/globals"]
  }
}
```

### 2.4 ESLint Configuration Update

Update `.eslintrc.cjs` to remove the Jest rule workaround and add Vitest support:

```javascript
module.exports = {
  extends: [
    '@remix-run/eslint-config',
    'plugin:hydrogen/recommended',
    'plugin:hydrogen/typescript',
  ],
  overrides: [
    {
      files: ['**/*.test.{ts,tsx}'],
      plugins: ['vitest'],
      extends: ['plugin:vitest/recommended'],
    },
  ],
  rules: {
    // Remove the jest/no-deprecated-functions rule
    // ... other existing rules
  },
};
```

## 3. Package.json Changes

### 3.1 New Dependencies

Add the following devDependencies:

```json
{
  "devDependencies": {
    "vitest": "^2.1.0",
    "@vitest/coverage-v8": "^2.1.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.6.0",
    "happy-dom": "^15.0.0",
    "@remix-run/testing": "^2.15.3",
    "msw": "^2.6.0",
    "eslint-plugin-vitest": "^0.5.0"
  }
}
```

### 3.2 New Scripts

Add the following scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

**Script Descriptions:**

| Script          | Description                                              |
| --------------- | -------------------------------------------------------- |
| `test`          | Run all unit tests once (for CI)                         |
| `test:watch`    | Run tests in watch mode (for development)                |
| `test:coverage` | Run tests with coverage report                           |
| `test:ui`       | Run tests with Vitest UI (interactive browser interface) |

## 4. CI/CD Integration

### 4.1 Updated GitHub Actions Workflow

Add a new `unit-test` job to `.github/workflows/ci.yml`:

```yaml
unit-test:
  name: Unit Tests
  runs-on: ubuntu-latest
  timeout-minutes: 15
  concurrency:
    group: ci-unit-test-${{ github.ref }}
    cancel-in-progress: true
  steps:
    - name: Checkout repo
      uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2

    - name: Setup node
      uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4.4.0
      with:
        node-version-file: '.nvmrc'
        cache: 'npm'
        cache-dependency-path: '**/package-lock.json'

    - name: Install dependencies
      run: npm ci

    - name: Run unit tests
      run: npm run test:coverage

    - name: Upload coverage report
      uses: actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4.6.2
      if: always()
      with:
        name: coverage-report
        path: ./coverage/
        retention-days: 30
```

### 4.2 Job Ordering Recommendation

The recommended job execution order in CI is:

1. `lint` - Fast feedback on code style
2. `format` - Fast feedback on formatting
3. `unit-test` - Fast feedback on logic correctness
4. `typecheck` - Type validation (includes build)
5. `e2e` - Slower integration tests

Unit tests should run early in the pipeline since they provide fast feedback and can catch issues before more expensive operations like builds and E2E tests.

## 5. Test Coverage Goals

### 5.1 Priority 1: Utility Functions (High Value, Low Effort)

Start with pure utility functions in `app/lib/` as they are the easiest to test and provide immediate value:

| File                      | Functions to Test                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app/lib/utils.ts`        | `missingClass`, `formatText`, `getExcerpt`, `isNewArrival`, `isDiscounted`, `statusMessage`, `getLocaleFromRequest`, `parseAsCurrency`, `isLocalPath`, `parseMenu` |
| `app/lib/sitemap.ts`      | Sitemap generation functions                                                                                                                                       |
| `app/lib/seo.server.ts`   | `truncate` (internal), SEO payload generators                                                                                                                      |
| `app/lib/placeholders.ts` | Placeholder data generators                                                                                                                                        |

**Example Test for `app/lib/utils.ts`:**

```typescript
// app/lib/utils.test.ts
import {describe, it, expect} from 'vitest';
import {
  missingClass,
  isDiscounted,
  isNewArrival,
  isLocalPath,
  getExcerpt,
  statusMessage,
} from './utils';

describe('missingClass', () => {
  it('returns true when string is undefined', () => {
    expect(missingClass(undefined, 'test')).toBe(true);
  });

  it('returns true when class is not present', () => {
    expect(missingClass('foo bar', 'baz')).toBe(true);
  });

  it('returns false when class is present', () => {
    expect(missingClass('foo bar', 'foo')).toBe(false);
  });
});

describe('isDiscounted', () => {
  it('returns true when compareAtPrice is greater than price', () => {
    const price = {amount: '10.00', currencyCode: 'USD'};
    const compareAtPrice = {amount: '15.00', currencyCode: 'USD'};
    expect(isDiscounted(price, compareAtPrice)).toBe(true);
  });

  it('returns false when prices are equal', () => {
    const price = {amount: '10.00', currencyCode: 'USD'};
    const compareAtPrice = {amount: '10.00', currencyCode: 'USD'};
    expect(isDiscounted(price, compareAtPrice)).toBe(false);
  });
});

describe('isNewArrival', () => {
  it('returns true for products published within the last 30 days', () => {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 15);
    expect(isNewArrival(recentDate.toISOString())).toBe(true);
  });

  it('returns false for products published more than 30 days ago', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 45);
    expect(isNewArrival(oldDate.toISOString())).toBe(false);
  });
});

describe('isLocalPath', () => {
  it('returns true for relative paths', () => {
    expect(isLocalPath('/products/test')).toBe(true);
  });

  it('returns false for absolute URLs', () => {
    expect(isLocalPath('https://example.com/path')).toBe(false);
  });
});

describe('getExcerpt', () => {
  it('extracts content from paragraph tags', () => {
    const html = '<p>Hello World</p>';
    expect(getExcerpt(html)).toBe('<p>Hello World</p>');
  });

  it('returns original text if no paragraph found', () => {
    const text = 'Plain text';
    expect(getExcerpt(text)).toBe('Plain text');
  });
});

describe('statusMessage', () => {
  it('returns correct translation for SUCCESS', () => {
    expect(statusMessage('SUCCESS')).toBe('Success');
  });

  it('returns correct translation for PENDING', () => {
    expect(statusMessage('PENDING')).toBe('Pending');
  });
});
```

### 5.2 Priority 2: React Components (Medium Value, Medium Effort)

Test presentational components that have conditional rendering logic:

| Component         | Test Focus                                                         |
| ----------------- | ------------------------------------------------------------------ |
| `ProductCard.tsx` | Label rendering (Sale/New), price display, quick add button states |
| `Button.tsx`      | Variant styles, disabled states                                    |
| `Text.tsx`        | Typography variants                                                |
| `Input.tsx`       | Error states, styling                                              |
| `Grid.tsx`        | Layout variations                                                  |
| `Skeleton.tsx`    | Loading states                                                     |

**Example Component Test:**

```typescript
// app/components/Button.test.tsx
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Button} from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies primary variant styles by default', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');
  });

  it('applies secondary variant styles when specified', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-primary/10');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 5.3 Priority 3: Remix Loaders/Actions (High Value, Higher Effort)

Test data loading and mutation logic in route files:

| Route                          | Test Focus                                       |
| ------------------------------ | ------------------------------------------------ |
| `($locale).cart.tsx`           | Cart action handlers (add, update, remove lines) |
| `($locale).search.tsx`         | Search query handling                            |
| `($locale).discount.$code.tsx` | Discount code validation                         |
| `[sitemap.xml].tsx`            | Sitemap generation                               |

**Example Loader Test:**

```typescript
// app/routes/($locale).search.test.ts
import {describe, it, expect, vi} from 'vitest';
import {loader} from './($locale).search';

describe('Search loader', () => {
  it('returns empty results for empty search term', async () => {
    const request = new Request('http://localhost/search?q=');
    const context = createMockContext();

    const response = await loader({request, context, params: {}});
    const data = await response.json();

    expect(data.searchTerm).toBe('');
  });
});

function createMockContext() {
  return {
    storefront: {
      query: vi.fn().mockResolvedValue({products: {nodes: []}}),
    },
    // ... other context properties
  };
}
```

### 5.4 Priority 4: Custom Hooks (Medium Value, Medium Effort)

Test custom React hooks:

| Hook                      | Location           | Test Focus           |
| ------------------------- | ------------------ | -------------------- |
| `usePrefixPathWithLocale` | `app/lib/utils.ts` | Path prefixing logic |
| `useIsHomePath`           | `app/lib/utils.ts` | Home path detection  |

### 5.5 What NOT to Unit Test

The following should be covered by E2E tests instead:

- Full page rendering with data fetching
- Cart drawer interactions
- Checkout flow
- Authentication flows
- Complex multi-component interactions

## 6. Directory Structure

### Recommended: Co-located Tests

Place test files alongside the source files they test:

```
app/
├── components/
│   ├── Button.tsx
│   ├── Button.test.tsx          # Component test
│   ├── ProductCard.tsx
│   ├── ProductCard.test.tsx
│   └── ...
├── lib/
│   ├── utils.ts
│   ├── utils.test.ts            # Utility tests
│   ├── seo.server.ts
│   ├── seo.server.test.ts
│   └── ...
├── routes/
│   ├── ($locale).cart.tsx
│   ├── ($locale).cart.test.ts   # Route loader/action tests
│   └── ...
└── test-utils/                   # Shared test utilities
    ├── index.ts
    ├── mocks/
    │   ├── storefront.ts        # Storefront API mocks
    │   ├── cart.ts              # Cart mocks
    │   └── products.ts          # Product data fixtures
    └── render.tsx               # Custom render with providers
```

**Benefits of Co-location:**

1. Easy to find tests for any given file
2. Tests are updated when source files change
3. Clear ownership of test coverage
4. Encourages testing as part of development

### Test Utilities Directory

Create `app/test-utils/` for shared testing infrastructure:

```typescript
// app/test-utils/render.tsx
import {render, type RenderOptions} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import type {ReactElement} from 'react';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
}

function customRender(
  ui: ReactElement,
  {initialEntries = ['/'], ...options}: CustomRenderOptions = {},
) {
  function Wrapper({children}: {children: React.ReactNode}) {
    return (
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    );
  }

  return render(ui, {wrapper: Wrapper, ...options});
}

export * from '@testing-library/react';
export {customRender as render};
```

```typescript
// app/test-utils/mocks/products.ts
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
        },
      ],
    },
    ...overrides,
  };
}
```

## 7. Migration Strategy

### Phase 1: Foundation (Week 1)

**Goals:**

- Set up testing infrastructure
- Establish patterns and conventions
- Get CI running with unit tests

**Tasks:**

1. Install dependencies:

   ```bash
   npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom happy-dom @remix-run/testing msw eslint-plugin-vitest
   ```

2. Create configuration files:

   - `vitest.config.ts`
   - `vitest.setup.ts`

3. Update existing configuration:

   - `tsconfig.json` (add Vitest types)
   - `.eslintrc.cjs` (add Vitest plugin, remove Jest rule)
   - `package.json` (add scripts)

4. Update CI workflow:

   - Add `unit-test` job to `.github/workflows/ci.yml`

5. Write first tests for `app/lib/utils.ts`:

   - Target: 5-10 tests covering core utility functions
   - This validates the setup works correctly

6. Create test utilities:
   - `app/test-utils/render.tsx`
   - `app/test-utils/mocks/products.ts`

**Success Criteria:**

- `npm run test` executes successfully
- CI pipeline includes unit test job
- Coverage report generates correctly

### Phase 2: Utility Coverage (Week 2)

**Goals:**

- Achieve 80%+ coverage on utility functions
- Establish mocking patterns for Shopify APIs

**Tasks:**

1. Complete tests for `app/lib/utils.ts` (all exported functions)
2. Add tests for `app/lib/seo.server.ts`
3. Add tests for `app/lib/sitemap.ts`
4. Add tests for `app/lib/placeholders.ts`
5. Set up MSW for API mocking

**Success Criteria:**

- `app/lib/` directory has 80%+ test coverage
- All utility functions have at least one test

### Phase 3: Component Testing (Weeks 3-4)

**Goals:**

- Test key presentational components
- Establish component testing patterns

**Tasks:**

1. Add tests for simple components:

   - `Button.tsx`
   - `Text.tsx`
   - `Input.tsx`
   - `Grid.tsx`
   - `Skeleton.tsx`

2. Add tests for complex components:

   - `ProductCard.tsx`
   - `OrderCard.tsx`
   - `FeaturedProducts.tsx`

3. Document component testing patterns

**Success Criteria:**

- 10+ component test files created
- Component testing patterns documented

### Phase 4: Route Testing (Weeks 5-6)

**Goals:**

- Test critical route loaders and actions
- Establish patterns for testing Remix routes

**Tasks:**

1. Add tests for cart actions (`($locale).cart.tsx`)
2. Add tests for search loader (`($locale).search.tsx`)
3. Add tests for discount route (`($locale).discount.$code.tsx`)
4. Add tests for sitemap routes

**Success Criteria:**

- Critical routes have loader/action tests
- Route testing patterns documented

### Phase 5: Maintenance & Growth (Ongoing)

**Goals:**

- Maintain test coverage as codebase grows
- Continuously improve test quality

**Practices:**

1. **New Feature Development**: Require unit tests for new utility functions and components
2. **Bug Fixes**: Add regression tests when fixing bugs
3. **Code Review**: Include test coverage in PR review criteria
4. **Coverage Monitoring**: Track coverage trends over time

**Coverage Targets:**

| Phase   | Target Coverage |
| ------- | --------------- |
| Phase 1 | 10%             |
| Phase 2 | 30%             |
| Phase 3 | 50%             |
| Phase 4 | 60%             |
| Ongoing | 70%+            |

## 8. Best Practices

### 8.1 Test Organization

```typescript
describe('ComponentName', () => {
  describe('when condition A', () => {
    it('should behave in way X', () => {});
    it('should behave in way Y', () => {});
  });

  describe('when condition B', () => {
    it('should behave in way Z', () => {});
  });
});
```

### 8.2 Naming Conventions

- Test files: `*.test.ts` or `*.test.tsx`
- Test descriptions: Use clear, behavior-focused language
- Mock files: Place in `__mocks__/` directories or `test-utils/mocks/`

### 8.3 Mocking Guidelines

1. **Prefer real implementations** when possible
2. **Mock external dependencies** (APIs, browser APIs)
3. **Use MSW for API mocking** instead of mocking fetch directly
4. **Create reusable mock factories** for common data structures

### 8.4 Assertion Guidelines

1. **One logical assertion per test** (multiple `expect` calls are fine if testing one behavior)
2. **Use specific matchers** (`toHaveTextContent` over `toContain`)
3. **Test behavior, not implementation**
4. **Avoid testing implementation details** (internal state, private methods)

## 9. Resources

### Documentation

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Remix Testing Guide](https://remix.run/docs/en/main/guides/testing)
- [MSW Documentation](https://mswjs.io/docs/)

### Hydrogen-Specific Resources

- [Hydrogen Testing Patterns](https://shopify.dev/docs/custom-storefronts/hydrogen)
- [Storefront API Reference](https://shopify.dev/docs/api/storefront)

## 10. Appendix: Quick Start Commands

```bash
# Install all testing dependencies
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom happy-dom @remix-run/testing msw eslint-plugin-vitest

# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```
