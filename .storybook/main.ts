import type { StorybookConfig } from '@storybook/nextjs';
import path from 'path';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [],
  "framework": {
    "name": "@storybook/nextjs",
    "options": {}
  },
  "staticDirs": [
    "../public"
  ],
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'next/navigation': path.resolve(__dirname, '../.storybook/mocks/next-navigation.ts'),
      };
    }
    return config;
  },
};
export default config;