import { cn } from "@/lib/utils";

type PageContainerProps = {
  className?: string;
  children: React.ReactNode;
};

export function PageContainer({ className, children }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10",
        className,
      )}
    >
      {children}
    </div>
  );
}
