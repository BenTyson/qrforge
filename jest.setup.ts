import '@testing-library/jest-dom';

// Set test environment variables
process.env.ENVIRONMENT = 'test';
// NODE_ENV is already set by Jest

// Mock Supabase URL for tests - uses local or test database
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

// Mock Stripe keys for tests
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_mock';
process.env.STRIPE_MONTHLY_PRO_PRICE_ID = 'price_test_monthly_pro';
process.env.STRIPE_YEARLY_PRO_PRICE_ID = 'price_test_yearly_pro';
process.env.STRIPE_MONTHLY_BUSINESS_PRICE_ID = 'price_test_monthly_business';
process.env.STRIPE_YEARLY_BUSINESS_PRICE_ID = 'price_test_yearly_business';

// Mock app URL
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3322';

// Mock Resend
process.env.RESEND_API_KEY = 're_test_mock';

// Mock crypto for Node.js environment
if (typeof global.crypto === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodeCrypto = require('crypto');
  Object.defineProperty(global, 'crypto', {
    value: {
      randomBytes: nodeCrypto.randomBytes,
      createHash: nodeCrypto.createHash,
      getRandomValues: (arr: Uint8Array) => nodeCrypto.randomFillSync(arr),
    },
  });
}

// Mock window.matchMedia for components that use media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}
global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Suppress console errors in tests (optional, uncomment if needed)
// const originalError = console.error;
// beforeAll(() => {
//   console.error = (...args: unknown[]) => {
//     if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
//       return;
//     }
//     originalError.call(console, ...args);
//   };
// });
// afterAll(() => {
//   console.error = originalError;
// });
