import { defineConfig } from 'vitest/config';
import path from 'node:path';

// vitest does not read tsconfig `paths`, so the @/ alias is declared again here.
export default defineConfig({
    test: {
        environment: 'node',
        include: ['lib/**/*.test.ts'],
    },
    resolve: {
        alias: { '@': path.resolve(__dirname, '.') },
    },
});
