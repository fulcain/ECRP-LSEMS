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
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">
          {title}
        </h1>
        <p className="text-slate-400">{description}</p>
      </div>

      {children}
    </main>
  );
}
