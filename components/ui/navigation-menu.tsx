"use client";

import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";
import Link from "next/link";
import * as React from "react";

type NavigationMenuContextType = {
  openItem: string | null;
  setOpenItem: React.Dispatch<React.SetStateAction<string | null>>;
};

const NavigationMenuContext = React.createContext<NavigationMenuContextType>({
  openItem: null,
  setOpenItem: () => null,
});

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { viewport?: boolean }) {
  const [openItem, setOpenItem] = React.useState<string | null>(null);

  // click outside to close
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-slot="navigation-menu"]')) {
        setOpenItem(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...props}
    >
      <NavigationMenuContext.Provider value={{ openItem, setOpenItem }}>
        {children}
        {viewport && <NavigationMenuViewport />}
      </NavigationMenuContext.Provider>
    </div>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  );
}

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium disabled:pointer-events-none disabled:opacity-50 data-[state=open]:text-accent-foreground data-[state=open]:bg-accent/50 outline-none transition-[color,box-shadow]",
);

function NavigationMenuTrigger({
  className,
  children,
  value,
  href = "#",
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { value: string }) {
  const ctx = React.useContext(NavigationMenuContext);
  const isOpen = ctx.openItem === value;

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    ctx.setOpenItem(isOpen ? null : value);
  };

  return (
    <Link
      href={href}
      data-slot="navigation-menu-trigger"
      data-state={isOpen ? "open" : "closed"}
      onClick={handleClick}
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}
      <ChevronDownIcon
        className="relative top-[1px] ml-1 size-3 transition-transform duration-300 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </Link>
  );
}

function NavigationMenuContent({
  className,
  value,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const ctx = React.useContext(NavigationMenuContext);
  const isOpen = ctx.openItem === value;

  return (
    <div
      data-slot="navigation-menu-content"
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        "bg-popover text-popover-foreground top-full left-0 mt-1.5 w-auto origin-top rounded-md border shadow-md transition-all duration-200 md:absolute",
        "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95",
        !isOpen && "pointer-events-none scale-95 opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuViewport({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="navigation-menu-viewport"
      className={cn(
        "absolute top-full left-0 isolate z-50 flex justify-center",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuLink({
  className,
  asChild,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      data-slot="navigation-menu-link"
      className={cn(
        "flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="navigation-menu-indicator"
      className={cn(
        "data-[state=visible]:fade-in data-[state=hidden]:fade-out top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden transition-all duration-200",
        className,
      )}
      {...props}
    >
      <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
    </div>
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};
