import '../src/styles/globals.css';

import type { Decorator, Preview } from '@storybook/react';

import { cn } from '../src/lib/cn';

function resolveTheme(value: unknown): 'light' | 'dark' {
  return value === 'dark' || value === '다크' ? 'dark' : 'light';
}

function applyHtmlTheme(theme: 'light' | 'dark') {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('light', theme === 'light');
  root.style.colorScheme = theme;
}

const ThemeDecorator: Decorator = (Story, context) => {
  const theme = resolveTheme(context.globals.theme);
  const isFoundations = context.title.startsWith('파운데이션/');

  applyHtmlTheme(theme);

  return (
    <div
      className={cn(
        'bg-background text-foreground rounded-lg p-8',
        isFoundations ? 'w-full max-w-5xl' : 'min-w-80',
      )}
    >
      <Story />
    </div>
  );
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: '테마',
      defaultValue: 'light',
      toolbar: {
        title: '테마',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: '라이트', icon: 'sun' },
          { value: 'dark', title: '다크', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    layout: 'centered',
    backgrounds: { disable: true },
    options: {
      storySort: {
        order: [
          '파운데이션',
          ['소개', '색', '타이포그래피', '보더', '라운딩'],
          '컴포넌트',
          [
            '배지',
            '버튼',
            '금액',
            ['기본', '견적헤더', '견적합계', '폭고정', '뷰포트진입'],
            '다이얼로그',
            '라벨',
            '입력',
            '카드',
          ],
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [ThemeDecorator],
};

export default preview;
