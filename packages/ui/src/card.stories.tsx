import type { Meta, StoryObj } from '@storybook/react';

import { Card } from './card';

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  args: {
    title: 'Documentation',
    href: 'https://turborepo.dev',
    children: 'Find in-depth information about Turborepo features and API.',
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
