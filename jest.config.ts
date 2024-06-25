import type {Config} from '@jest/types';
// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  testEnvironment: "jsdom",
  transform: {
  '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    "\\.(css|less|sass)$": "identity-obj-proxy"
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/cypress/",
  ],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",

};
export default config;
