/**
 * Supabase Mock for Testing
 *
 * Provides mock implementations of Supabase client methods.
 * Use jest.mock('@/lib/supabase/client', () => mockSupabaseClient)
 */

type MockFn = jest.Mock;

interface QueryBuilder {
  select: MockFn;
  insert: MockFn;
  update: MockFn;
  upsert: MockFn;
  delete: MockFn;
  eq: MockFn;
  neq: MockFn;
  gt: MockFn;
  gte: MockFn;
  lt: MockFn;
  lte: MockFn;
  like: MockFn;
  ilike: MockFn;
  is: MockFn;
  in: MockFn;
  contains: MockFn;
  containedBy: MockFn;
  range: MockFn;
  textSearch: MockFn;
  filter: MockFn;
  not: MockFn;
  or: MockFn;
  and: MockFn;
  match: MockFn;
  single: MockFn;
  maybeSingle: MockFn;
  order: MockFn;
  limit: MockFn;
  offset: MockFn;
  returns: MockFn;
}

// Create a chainable query builder
function createQueryBuilder(): QueryBuilder {
  const builder: Partial<QueryBuilder> = {};

  const methods = [
    'select', 'insert', 'update', 'upsert', 'delete',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
    'like', 'ilike', 'is', 'in',
    'contains', 'containedBy', 'range', 'textSearch',
    'filter', 'not', 'or', 'and', 'match',
    'order', 'limit', 'offset', 'returns',
  ];

  // Create chainable methods
  methods.forEach((method) => {
    builder[method as keyof QueryBuilder] = jest.fn().mockReturnThis();
  });

  // Terminal methods that return promises
  builder.single = jest.fn().mockResolvedValue({ data: null, error: null });
  builder.maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });

  return builder as QueryBuilder;
}

// Mock Supabase auth
export const mockAuth = {
  getUser: jest.fn().mockResolvedValue({
    data: { user: null },
    error: null,
  }),
  getSession: jest.fn().mockResolvedValue({
    data: { session: null },
    error: null,
  }),
  signInWithPassword: jest.fn().mockResolvedValue({
    data: { user: null, session: null },
    error: null,
  }),
  signUp: jest.fn().mockResolvedValue({
    data: { user: null, session: null },
    error: null,
  }),
  signOut: jest.fn().mockResolvedValue({ error: null }),
  onAuthStateChange: jest.fn().mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } },
  }),
  resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
  updateUser: jest.fn().mockResolvedValue({
    data: { user: null },
    error: null,
  }),
};

// Mock Supabase storage
export const mockStorage = {
  from: jest.fn().mockReturnValue({
    upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
    download: jest.fn().mockResolvedValue({ data: new Blob(), error: null }),
    remove: jest.fn().mockResolvedValue({ data: [], error: null }),
    list: jest.fn().mockResolvedValue({ data: [], error: null }),
    getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/test' } }),
    createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: 'https://example.com/signed' }, error: null }),
  }),
};

// Table query builders
const tableQueryBuilders: Map<string, QueryBuilder> = new Map();

function getTableQueryBuilder(table: string): QueryBuilder {
  if (!tableQueryBuilders.has(table)) {
    tableQueryBuilders.set(table, createQueryBuilder());
  }
  return tableQueryBuilders.get(table)!;
}

// Mock Supabase client
export const mockSupabaseClient = {
  auth: mockAuth,
  storage: mockStorage,
  from: jest.fn((table: string) => getTableQueryBuilder(table)),
  rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  channel: jest.fn().mockReturnValue({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockResolvedValue({ status: 'SUBSCRIBED' }),
    unsubscribe: jest.fn(),
  }),
  removeChannel: jest.fn(),
};

// Helper to set up mock responses
export function mockSupabaseResponse(table: string, method: keyof QueryBuilder, response: { data?: unknown; error?: unknown }) {
  const builder = getTableQueryBuilder(table);
  (builder[method] as MockFn).mockResolvedValue(response);
}

// Helper to set up mock user
export function mockAuthenticatedUser(user: { id: string; email: string }) {
  mockAuth.getUser.mockResolvedValue({
    data: { user },
    error: null,
  });
  mockAuth.getSession.mockResolvedValue({
    data: {
      session: {
        user,
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
      },
    },
    error: null,
  });
}

// Helper to clear all mocks
export function clearSupabaseMocks() {
  mockAuth.getUser.mockClear();
  mockAuth.getSession.mockClear();
  mockAuth.signInWithPassword.mockClear();
  mockAuth.signUp.mockClear();
  mockAuth.signOut.mockClear();
  mockSupabaseClient.from.mockClear();
  mockSupabaseClient.rpc.mockClear();
  tableQueryBuilders.clear();
}

// Reset mocks to default values
export function resetSupabaseMocks() {
  clearSupabaseMocks();
  mockAuth.getUser.mockResolvedValue({ data: { user: null }, error: null });
  mockAuth.getSession.mockResolvedValue({ data: { session: null }, error: null });
}

// Default export for jest.mock
export default mockSupabaseClient;
