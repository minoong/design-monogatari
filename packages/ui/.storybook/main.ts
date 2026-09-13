import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  staticDirs: [{ from: './public', to: '/' }],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    config.optimizeDeps = {
      ...config.optimizeDeps,
      include: [
        ...(config.optimizeDeps?.include ?? []),
        'three',
        'three/addons/environments/RoomEnvironment.js',
        'three/addons/libs/fflate.module.js',
        'three/addons/loaders/FBXLoader.js',
        'three/addons/loaders/GLTFLoader.js',
        'three/addons/loaders/TGALoader.js',
        'three/addons/loaders/RGBELoader.js',
        'three/addons/controls/OrbitControls.js',
        '@react-three/fiber',
      ],
    };
    return config;
  },
};

export default config;
