import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts', '**/*.e2e-spec.ts'],
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;
