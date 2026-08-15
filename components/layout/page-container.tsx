import { cn } from "@/lib/utils";

type PageContainerProps = {
  className?: string;
  children: React.ReactNode;
};

export function PageContainer({ className, children }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
