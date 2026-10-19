import type { Config } from 'jest';
import nextJest from 'next/jest.js';
import dotenv from 'dotenv';


dotenv.config({ path: '.env.local', quiet: true });
const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  testEnvironment: 'node',
  clearMocks: true,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

export default createJestConfig(config);