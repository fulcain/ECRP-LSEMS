import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main
      className={cn(
        // The top padding clears the fixed navigation button, which sits over
        // the page below `lg` - without it the button covers the heading's
        // first line on every page.
        "mx-auto w-full max-w-6xl animate-fade-in px-4 pb-6 pt-16 sm:px-6 sm:pb-8 lg:px-8 lg:pt-8",
        className,
      )}
    >
      {children}
    </main>
  );
}