import { Button } from '@repo/ui/button';
import { cn } from '@repo/ui/cn';
import Image, { type ImageProps } from 'next/image';

import { ThemeToggle } from './theme-toggle';

type Props = Omit<ImageProps, 'src'> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, className, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className={cn('dark:hidden', className)} />
      <Image {...rest} src={srcDark} className={cn('hidden dark:block', className)} />
    </>
  );
};

const linkBaseClasses =
  'inline-flex h-12 items-center justify-center rounded-pill px-5 font-sans text-base leading-5 font-medium max-[600px]:h-10 max-[600px]:px-4 max-[600px]:text-sm';

export default function Home() {
  return (
    <div className="grid min-h-svh grid-rows-[auto_1fr_auto] items-center justify-items-center gap-16 p-20 max-[600px]:gap-16 max-[600px]:p-8 max-[600px]:pb-20">
      <div className="row-start-1 justify-self-end">
        <ThemeToggle />
      </div>
      <main className="row-start-2 flex flex-col gap-8 max-[600px]:items-center">
        <ThemeImage
          className="dark:invert"
          srcLight="turborepo-dark.svg"
          srcDark="turborepo-light.svg"
          alt="Turborepo logo"
          width={180}
          height={38}
          priority
        />
        <ol className="m-0 list-inside p-0 font-mono text-sm leading-6 tracking-tight max-[600px]:text-center">
          <li className="mb-2">
            Get started by editing{' '}
            <code className="bg-muted rounded px-1 py-0.5 font-semibold">
              apps/docs/app/page.tsx
            </code>
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className="flex gap-4 max-[600px]:flex-col">
          <a
            className={cn(
              linkBaseClasses,
              'bg-foreground text-background hover:bg-primary-hover gap-2',
            )}
            href="https://vercel.com/new/clone?demo-description=Learn+to+implement+a+monorepo+with+a+two+Next.js+sites+that+has+installed+three+local+packages.&demo-image=%2F%2Fimages.ctfassets.net%2Fe5382hct74si%2F4K8ZISWAzJ8X1504ca0zmC%2F0b21a1c6246add355e55816278ef54bc%2FBasic.png&demo-title=Monorepo+with+Turborepo&demo-url=https%3A%2F%2Fexamples-basic-web.vercel.sh%2F&from=templates&project-name=Monorepo+with+Turborepo&repository-name=monorepo-turborepo&repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fturborepo%2Ftree%2Fmain%2Fexamples%2Fbasic&root-directory=apps%2Fdocs&skippable-integrations=1&teamSlug=vercel&utm_source=create-turbo"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image src="/vercel.svg" alt="Vercel logomark" width={20} height={20} />
            Deploy now
          </a>
          <a
            href="https://turborepo.dev/docs?utm_source"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              linkBaseClasses,
              'border-muted-strong hover:bg-secondary-hover min-w-45 border hover:border-transparent max-[600px]:min-w-auto',
            )}
          >
            Read our docs
          </a>
        </div>
        <Button>다음에 하기</Button>
      </main>
      <footer className="row-start-3 flex gap-6 font-sans max-[600px]:flex-wrap max-[600px]:items-center max-[600px]:justify-center">
        <a
          className="inline-flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?search=turborepo&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/window.svg" alt="Window icon" width={16} height={16} />
          Examples
        </a>
        <a
          className="inline-flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://turborepo.dev?utm_source=create-turbo"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/globe.svg" alt="Globe icon" width={16} height={16} />
          Go to turborepo.dev →
        </a>
      </footer>
    </div>
  );
}
