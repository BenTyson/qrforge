import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

const config: Config = {
  // Test environment
  testEnvironment: 'jest-environment-jsdom',

  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Module path aliases (matching tsconfig paths)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.ts',
    '<rootDir>/src/**/__tests__/**/*.test.tsx',
  ],

  // Files to ignore
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
  ],

  // Transform node_modules that use ESM (like @upstash/redis and its deps)
  transformIgnorePatterns: [
    '/node_modules/(?!(uncrypto|@upstash)/)',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/app/**/{layout,page,loading,error}.tsx',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },

  // Clear mocks between tests
  clearMocks: true,

  // Verbose output for CI
  verbose: true,

  // Transform settings
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
    }],
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
