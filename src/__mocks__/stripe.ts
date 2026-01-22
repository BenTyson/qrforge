/**
 * Stripe Mock for Testing
 *
 * Provides mock implementations of Stripe API methods.
 * Use jest.mock('stripe', () => mockStripe)
 */

// Mock Stripe types
export interface MockSubscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'unpaid';
  customer: string;
  current_period_end: number;
  current_period_start: number;
  cancel_at_period_end: boolean;
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        product: string;
      };
    }>;
  };
}

export interface MockCustomer {
  id: string;
  email: string;
  name: string | null;
  metadata: Record<string, string>;
}

export interface MockCheckoutSession {
  id: string;
  mode: 'payment' | 'subscription' | 'setup';
  customer: string;
  subscription?: string;
  status: 'complete' | 'expired' | 'open';
  metadata: Record<string, string>;
}

export interface MockInvoice {
  id: string;
  customer: string;
  subscription: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  amount_due: number;
  amount_paid: number;
}

export interface MockWebhookEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

// Mock implementations
export const mockStripe = {
  webhooks: {
    constructEvent: jest.fn().mockImplementation(
      (payload: string, signature: string, _secret: string): MockWebhookEvent => {
        // Simulate signature verification
        if (!signature || signature === 'invalid') {
          throw new Error('Webhook signature verification failed');
        }
        return JSON.parse(payload);
      }
    ),
  },

  customers: {
    create: jest.fn().mockResolvedValue({
      id: 'cus_mock123',
      email: 'test@example.com',
      name: null,
      metadata: {},
    } as MockCustomer),

    retrieve: jest.fn().mockResolvedValue({
      id: 'cus_mock123',
      email: 'test@example.com',
      name: null,
      metadata: {},
    } as MockCustomer),

    update: jest.fn().mockResolvedValue({
      id: 'cus_mock123',
      email: 'test@example.com',
      name: 'Updated Name',
      metadata: {},
    } as MockCustomer),

    del: jest.fn().mockResolvedValue({ id: 'cus_mock123', deleted: true }),
  },

  subscriptions: {
    create: jest.fn().mockResolvedValue({
      id: 'sub_mock123',
      status: 'active',
      customer: 'cus_mock123',
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      current_period_start: Math.floor(Date.now() / 1000),
      cancel_at_period_end: false,
      items: { data: [{ id: 'si_mock123', price: { id: 'price_mock123', product: 'prod_mock123' } }] },
    } as MockSubscription),

    retrieve: jest.fn().mockResolvedValue({
      id: 'sub_mock123',
      status: 'active',
      customer: 'cus_mock123',
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      current_period_start: Math.floor(Date.now() / 1000),
      cancel_at_period_end: false,
      items: { data: [{ id: 'si_mock123', price: { id: 'price_mock123', product: 'prod_mock123' } }] },
    } as MockSubscription),

    update: jest.fn().mockResolvedValue({
      id: 'sub_mock123',
      status: 'active',
      customer: 'cus_mock123',
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      current_period_start: Math.floor(Date.now() / 1000),
      cancel_at_period_end: true,
      items: { data: [{ id: 'si_mock123', price: { id: 'price_mock123', product: 'prod_mock123' } }] },
    } as MockSubscription),

    cancel: jest.fn().mockResolvedValue({
      id: 'sub_mock123',
      status: 'canceled',
      customer: 'cus_mock123',
      current_period_end: Math.floor(Date.now() / 1000),
      current_period_start: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
      cancel_at_period_end: false,
      items: { data: [{ id: 'si_mock123', price: { id: 'price_mock123', product: 'prod_mock123' } }] },
    } as MockSubscription),

    list: jest.fn().mockResolvedValue({ data: [], has_more: false }),
  },

  checkout: {
    sessions: {
      create: jest.fn().mockResolvedValue({
        id: 'cs_mock123',
        url: 'https://checkout.stripe.com/mock',
        mode: 'subscription',
        customer: 'cus_mock123',
        status: 'open',
        metadata: {},
      } as MockCheckoutSession & { url: string }),

      retrieve: jest.fn().mockResolvedValue({
        id: 'cs_mock123',
        mode: 'subscription',
        customer: 'cus_mock123',
        subscription: 'sub_mock123',
        status: 'complete',
        metadata: {},
      } as MockCheckoutSession),
    },
  },

  billingPortal: {
    sessions: {
      create: jest.fn().mockResolvedValue({
        id: 'bps_mock123',
        url: 'https://billing.stripe.com/mock',
      }),
    },
  },

  invoices: {
    retrieve: jest.fn().mockResolvedValue({
      id: 'in_mock123',
      customer: 'cus_mock123',
      subscription: 'sub_mock123',
      status: 'paid',
      amount_due: 1000,
      amount_paid: 1000,
    } as MockInvoice),

    list: jest.fn().mockResolvedValue({ data: [], has_more: false }),
  },

  prices: {
    retrieve: jest.fn().mockResolvedValue({
      id: 'price_mock123',
      product: 'prod_mock123',
      unit_amount: 1000,
      currency: 'usd',
      recurring: { interval: 'month' },
    }),

    list: jest.fn().mockResolvedValue({ data: [], has_more: false }),
  },

  products: {
    retrieve: jest.fn().mockResolvedValue({
      id: 'prod_mock123',
      name: 'Pro Plan',
      metadata: { tier: 'pro' },
    }),
  },
};

// Helper to create webhook event
export function createMockWebhookEvent(type: string, data: Record<string, unknown>): MockWebhookEvent {
  return {
    id: `evt_mock${Date.now()}`,
    type,
    data: {
      object: data,
    },
  };
}

// Helper to create checkout.session.completed event
export function createCheckoutCompletedEvent(overrides: Partial<MockCheckoutSession> = {}): MockWebhookEvent {
  return createMockWebhookEvent('checkout.session.completed', {
    id: 'cs_mock123',
    mode: 'subscription',
    customer: 'cus_mock123',
    subscription: 'sub_mock123',
    status: 'complete',
    metadata: { user_id: 'user_mock123' },
    ...overrides,
  });
}

// Helper to create customer.subscription.deleted event
export function createSubscriptionDeletedEvent(overrides: Partial<MockSubscription> = {}): MockWebhookEvent {
  return createMockWebhookEvent('customer.subscription.deleted', {
    id: 'sub_mock123',
    status: 'canceled',
    customer: 'cus_mock123',
    ...overrides,
  });
}

// Helper to create customer.subscription.updated event
export function createSubscriptionUpdatedEvent(overrides: Partial<MockSubscription> = {}): MockWebhookEvent {
  return createMockWebhookEvent('customer.subscription.updated', {
    id: 'sub_mock123',
    status: 'active',
    customer: 'cus_mock123',
    current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    cancel_at_period_end: false,
    ...overrides,
  });
}

// Helper to clear all mocks
export function clearStripeMocks() {
  mockStripe.webhooks.constructEvent.mockClear();
  mockStripe.customers.create.mockClear();
  mockStripe.customers.retrieve.mockClear();
  mockStripe.customers.update.mockClear();
  mockStripe.subscriptions.create.mockClear();
  mockStripe.subscriptions.retrieve.mockClear();
  mockStripe.subscriptions.update.mockClear();
  mockStripe.subscriptions.cancel.mockClear();
  mockStripe.checkout.sessions.create.mockClear();
  mockStripe.checkout.sessions.retrieve.mockClear();
}

// Default export for jest.mock
export default mockStripe;
