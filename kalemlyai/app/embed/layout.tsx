"use client";

import { useEffect } from "react";

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // Mark body so CSS selector can target it
    body.setAttribute("data-embed", "true");

    // Force inline transparency — overrides Tailwind bg classes and globals.css
    html.style.setProperty("background", "transparent", "important");
    html.style.setProperty("background-color", "transparent", "important");
    body.style.setProperty("background", "transparent", "important");
    body.style.setProperty("background-color", "transparent", "important");

    // Strip any Tailwind bg-* and min-h-* classes injected by root layout
    const stripBg = (el: HTMLElement) => {
      el.className = el.className
        .split(" ")
        .filter((c) => !c.startsWith("bg-") && !c.startsWith("min-h"))
        .join(" ");
    };
    stripBg(body);
    stripBg(html);

    return () => {
      body.removeAttribute("data-embed");
    };
  }, []);

  return <>{children}</>;
}
