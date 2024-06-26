import { defineConfig } from 'cypress'
import {addMatchImageSnapshotPlugin} from '@simonsmith/cypress-image-snapshot/plugin'
import * as fs from 'fs-extra';
import * as path from 'path';

export default defineConfig({
  defaultCommandTimeout: 10000,
  viewportWidth: 1400,
  viewportHeight: 1280,
  pageLoadTimeout: 10000,
  projectId: 'fjsyqb',
  video: true,
  e2e: {
    async setupNodeEvents(on, config) {
      addMatchImageSnapshotPlugin(on)

      on('before:browser:launch', (browser, launchOptions) => {
        // Increase the Chrome size so we can take screenshots of viewports
        // that are 1280 x 720
        if (browser.name === 'chrome') {
          launchOptions.args.push('--window-size=1280,900')
        }

        return launchOptions
      })

      async function getEnvConfig() {
        const testEnv = config.env.testEnv;
        if (testEnv) {
          const pathOfConfigurationFile = `config/environments.json`;
          // If there is no file this will throw an error
          const content = await fs.readJson(path.join(__dirname, pathOfConfigurationFile));
          const environmentConfig = content[testEnv];
          if (!environmentConfig) {
            throw new Error(`Can't find environment ${testEnv} in ${pathOfConfigurationFile}`);
          }
          return environmentConfig;
        } else {
          return {};
        }
      }
      const envConfig = await getEnvConfig();
      const combinedConfig = { ...config, ...envConfig };
      
      return combinedConfig;
    },
    baseUrl: 'http://localhost:8080',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
})
