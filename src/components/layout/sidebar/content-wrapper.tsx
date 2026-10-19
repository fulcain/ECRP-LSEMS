"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSidebar } from "./sidebar-context";
import { cn } from "@/lib/utils";

export function ContentWrapper({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  const pathname = usePathname();
  const sceneRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopPointer = window.matchMedia(
      "(min-width: 1024px) and (pointer: fine)",
    );
    if (reduceMotion.matches || !desktopPointer.matches) return;

    let disposed = false;
    let cleanup = () => {};
    void Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      import("lenis"),
    ]).then(([gsapModule, scrollTriggerModule, lenisModule]) => {
        if (disposed) return;
        const gsap = gsapModule.gsap;
        const { ScrollTrigger } = scrollTriggerModule;
        gsap.registerPlugin(ScrollTrigger);
        const lenis = new lenisModule.default({
          autoRaf: false,
          smoothWheel: true,
          syncTouch: false,
          respectReducedMotion: true,
          allowNestedScroll: true,
        });
        const tick = (time: number) => lenis.raf(time * 1000);
        const onScroll = () => ScrollTrigger.update();
        lenis.on("scroll", onScroll);
        gsap.ticker.add(tick);

        const scene = sceneRef.current;
        const moveX = scene
          ? gsap.quickTo(scene, "--spotlight-x", {
              duration: 0.8,
              ease: "power3.out",
            })
          : null;
        const moveY = scene
          ? gsap.quickTo(scene, "--spotlight-y", {
              duration: 0.8,
              ease: "power3.out",
            })
          : null;
        const onPointerMove = (event: PointerEvent) => {
          moveX?.(event.clientX);
          moveY?.(event.clientY);
        };
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        cleanup = () => {
          window.removeEventListener("pointermove", onPointerMove);
          lenis.off("scroll", onScroll);
          gsap.ticker.remove(tick);
          lenis.destroy();
        };
      });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  useEffect(() => {
    const desktopPointer = window.matchMedia(
      "(min-width: 1024px) and (pointer: fine)",
    );
    if (
      !routeRef.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !desktopPointer.matches
    ) {
      return;
    }

    let active = true;
    let cleanup = () => {};
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([gsapModule, scrollTriggerModule]) => {
        const route = routeRef.current;
        if (!active || !route) return;

        const gsap = gsapModule.gsap;
        const { ScrollTrigger } = scrollTriggerModule;
        gsap.registerPlugin(ScrollTrigger);
        gsap.fromTo(
          route,
          { autoAlpha: 0.72 },
          {
            autoAlpha: 1,
            duration: 0.32,
            ease: "power2.out",
            clearProps: "opacity,visibility",
          },
        );

        const panels = Array.from(
          route.querySelectorAll<HTMLElement>(".panel"),
        ).filter((panel) => !panel.parentElement?.closest(".panel"));
        panels.forEach((panel, index) => {
          gsap.fromTo(
            panel,
            { autoAlpha: 0, y: 22 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.65,
              delay: index < 2 ? index * 0.08 : 0,
              ease: "power3.out",
              clearProps: "transform,opacity,visibility",
              scrollTrigger: {
                trigger: panel,
                start: "top 90%",
                once: true,
              },
            },
          );
        });
        ScrollTrigger.refresh();

        cleanup = () => {
          ScrollTrigger.getAll()
            .filter(
              (trigger) =>
                trigger.trigger instanceof Element &&
                route.contains(trigger.trigger),
            )
            .forEach((trigger) => trigger.kill());
          gsap.killTweensOf(route);
        };
      },
    );
    return () => {
      active = false;
      cleanup();
    };
  }, [pathname]);

  // A route change should move focus to the new page, the way a real page
  // load does - otherwise a keyboard user stays at the top of the old DOM.
  useEffect(() => {
    routeRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div ref={sceneRef} className="motion-scene">
      <div aria-hidden="true" className="ambient-orb ambient-orb--one" />
      <div aria-hidden="true" className="ambient-orb ambient-orb--two" />
      <div
        className={cn(
          "relative z-10 min-h-screen transition-[padding] duration-300 ease-in-out",
          collapsed ? "lg:pl-[76px]" : "lg:pl-64",
        )}
      >
        <div
          ref={routeRef}
          key={pathname}
          id="main-content"
          tabIndex={-1}
          className="min-h-screen outline-none"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
