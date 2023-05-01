/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  testMatch: [
    '**/tests/**/*.[jt]s?(x)',
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[tj]s?(x)',
  ],
}
