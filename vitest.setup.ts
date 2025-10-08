import '@testing-library/jest-dom';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.test file for integration tests
config({ path: resolve(process.cwd(), '.env.test') });














