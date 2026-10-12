import { contrastRatio } from './contrast';
import { readRepoFile } from './repo-file';

/**
 * 파운데이션 페이지가 쓰는 토큰 값. `registry.json`의 theme 항목에서 읽는다. 이 항목은
 * `globals.css`에서 생성되고 `pnpm registry:check`가 어긋남을 막으므로, 문서의 색과 크기가
 * 실제 토큰과 달라질 수 없다.
 */

type ThemeVars = {
  theme: Record<string, string>;
  light: Record<string, string>;
  dark: Record<string, string>;
};

async function loadTheme(): Promise<ThemeVars> {
  const registry = JSON.parse((await readRepoFile('registry.json')).code) as {
    items: { name: string; cssVars?: ThemeVars }[];
  };
  const theme = registry.items.find((item) => item.name === 'theme')?.cssVars;
  if (!theme) {
    throw new Error('registry.json 에 theme 항목이 없습니다');
  }
  return theme;
}

export type PaletteRow = { step: string; value: string; tailwind: string };

/** 원시 스케일 한 줄(neutral 또는 blue). 다크 모드에서도 값이 바뀌지 않는다 */
export async function getPaletteRows(name: 'neutral' | 'blue'): Promise<PaletteRow[]> {
  const { light } = await loadTheme();
  return Object.entries(light)
    .filter(([key]) => key.startsWith(`${name}-`))
    .map(([key, value]) => {
      const step = key.slice(name.length + 1);
      return { step, value, tailwind: `bg-${name}-${step}` };
    });
}

export type ColorSpec = {
  /** 보여 줄 의미 토큰 이름 (예: 'background') */
  tokens: string[];
  descriptions: Record<string, string>;
  /** 토큰별 Tailwind 클래스. 없으면 `bg-<토큰>` */
  classes?: Record<string, string>;
  /** 글자색 토큰 → 대비를 잴 배경 토큰 */
  contrast?: Record<string, string>;
};

export type ColorRow = {
  token: string;
  tailwind: string;
  light: string;
  dark: string;
  description: string;
  contrast?: { against: string; light: number | null; dark: number | null };
};

/** 의미 토큰의 라이트/다크 값과 용도. 글자 토큰은 배경 대비 비율을 계산해 함께 준다 */
export async function getColorRows(spec: ColorSpec): Promise<ColorRow[]> {
  const { light, dark } = await loadTheme();

  return spec.tokens.map((token) => {
    const lightValue = light[token];
    const darkValue = dark[token];
    if (!lightValue || !darkValue) {
      throw new Error(`theme 에 ${token} 토큰이 없습니다`);
    }
    const description = spec.descriptions[token];
    if (!description) {
      throw new Error(`${token} 의 설명이 없습니다`);
    }
    const against = spec.contrast?.[token];
    return {
      token,
      tailwind: spec.classes?.[token] ?? `bg-${token}`,
      light: lightValue,
      dark: darkValue,
      description,
      contrast: against
        ? {
            against,
            light: contrastRatio(lightValue, light[against] ?? ''),
            dark: contrastRatio(darkValue, dark[against] ?? ''),
          }
        : undefined,
    };
  });
}

export type TypeRow = {
  token: string;
  tailwind: string;
  size: string;
  px: number;
  lineHeight: string;
};

/** 글자 역할 토큰(`text-title` 등)의 크기와 줄 높이 */
export async function getTypeRows(): Promise<TypeRow[]> {
  const { theme } = await loadTheme();
  return Object.entries(theme)
    .filter(([key]) => /^text-[a-z]+$/.test(key))
    .map(([key, size]) => ({
      token: key,
      tailwind: key,
      size,
      px: Number.parseFloat(size) * 16,
      lineHeight: theme[`${key}--line-height`] ?? '-',
    }));
}

export type RadiusRow = { token: string; tailwind: string; value: string };

/** 모서리 반경 토큰(`rounded-md` 등) */
export async function getRadiusRows(): Promise<RadiusRow[]> {
  const { theme } = await loadTheme();
  return Object.entries(theme)
    .filter(([key]) => key.startsWith('radius-'))
    .map(([key, value]) => ({
      token: `--${key}`,
      tailwind: `rounded-${key.slice('radius-'.length)}`,
      value,
    }));
}
