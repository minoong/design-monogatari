import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-mcp'],
  features: { componentsManifest: true },
  staticDirs: [
    { from: './public', to: '/' },
    // 앱이 커밋한 웹용 X5 모델을 그대로 서빙한다. 정적 빌드에서는 prune-storybook-models.mjs 가 지운다.
    { from: '../../../apps/web/public/models/g05-web', to: '/models/g05-web' },
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    config.optimizeDeps = {
      ...config.optimizeDeps,
      include: [
        ...(config.optimizeDeps?.include ?? []),
        // three 와 R3F 는 @repo/vehicle-3d 의 의존성이라 "패키지 > 의존성" 형식으로 지정한다
        '@repo/vehicle-3d > three',
        '@repo/vehicle-3d > three/addons/environments/RoomEnvironment.js',
        '@repo/vehicle-3d > three/addons/loaders/GLTFLoader.js',
        '@repo/vehicle-3d > three/addons/loaders/RGBELoader.js',
        '@repo/vehicle-3d > three/addons/controls/OrbitControls.js',
        '@repo/vehicle-3d > @react-three/fiber',
      ],
    };
    return config;
  },
};

export default config;
