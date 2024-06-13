import { basename, extname } from 'node:path';

export default {
    preset: 'ts-jest',
    verbose: true,
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'ts'],
    testMatch: ['**/*.test.ts'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    transform: {
        '^.+\\.ts$': 'ts-jest'
    },
    coverageReporters: ['json-summary', 'text', 'lcov'],
    collectCoverage: true,
    collectCoverageFrom: ['./src/**'],
    reporters: [
        'default',
        ['jest-junit', {
            outputDirectory: './test-results',
            outputName: 'junit.xml',
            classNameTemplate: '{classname}',
            titleTemplate: '{title}',
            suiteNameTemplate: (arg: { filepath: string }) => {
                const name = basename(arg.filepath, extname(arg.filepath));
                return basename(name, extname(name));
            }
        }]
    ]
};
