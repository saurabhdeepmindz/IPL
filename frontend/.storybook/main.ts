import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
    stories: [
        '../stories/**/*.mdx',
        '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
        '../src/**/*.mdx',
        '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    ],
    addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
    framework: '@storybook/nextjs-vite',
    staticDirs: ['../public'],
    // The Tailwind prefix() import is not understood by the default CSS minifier; Storybook is not shipped to users.
    viteFinal: async (viteConfig) => ({
        ...viteConfig,
        build: { ...viteConfig.build, cssMinify: false },
    }),
};

export default config;