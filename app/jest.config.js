// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  testMatch: [
    '<rootDir>/__tests__/**/*.(spec|test).[jt]s?(x)',
    '<rootDir>/(app|src|app/src)/**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  clearMocks: true,
}

module.exports = createJestConfig(config)
