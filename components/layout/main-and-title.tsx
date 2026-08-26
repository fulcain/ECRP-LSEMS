import { PageContainer } from "./page-container";

type BodyAndMainTitleProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function BodyAndMainTitle({
  title,
  description,
  children,
}: BodyAndMainTitleProps) {
  return (
    <main className="min-h-screen">
      <PageContainer>
        <header className="mb-8 border-b border-slate-800/80 pb-6">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300/80">
            LSEMS Operations
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            {description}
          </p>
        </header>

        {children}
      </PageContainer>
    </main>
  );
}
