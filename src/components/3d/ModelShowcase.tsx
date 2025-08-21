"use client";

import Link from "next/link";
import Model3D from "@/components/3d/Model3D";

export interface ModelShowcaseProps {
  title: string;
  tagline?: string;
  description?: string;
  modelPath: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  className?: string;
  // Visual tuning
  fitMargin?: number; // lower = closer (zoomed in)
  autoRotate?: boolean;
}

export default function ModelShowcase({
  title,
  tagline = "Introducing",
  description,
  modelPath,
  primaryCta,
  secondaryCta,
  className = "",
  fitMargin = 0.9, // zoomed-in compared to default 1.2
  autoRotate = true,
}: ModelShowcaseProps) {
  return (
    <section className={`relative max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-20 overflow-hidden ${className}`}>
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl -z-10" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-emerald-300/15 blur-3xl -z-10" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* 3D Model Panel */}
        <div className="group relative w-full h-[420px] md:h-[520px]">
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-transparent blur-2xl" />
          <div className="relative h-full rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-xl ring-1 ring-black/5 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.15)] transition-all duration-300 group-hover:shadow-[0_8px_30px_-6px_rgba(16,185,129,0.25)]">
            <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/50 dark:ring-white/10 pointer-events-none" />
            <div className="relative w-full h-full rounded-3xl overflow-hidden">
              <Model3D modelPath={modelPath} autoRotate={autoRotate} fitMargin={fitMargin} />

              {/* Controls hint */}
              <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur px-3 py-1.5 text-xs text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-600/20 shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
                  <path d="M12 2C9.24 2 7 4.24 7 7v4H6a2 2 0 0 0-2 2v3a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-3a2 2 0 0 0-2-2h-1V7c0-2.76-2.24-5-5-5Z" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                Drag to rotate
              </div>
            </div>
          </div>
        </div>

        {/* Details / CTA */}
        <div className="space-y-6">
          <div>
            {tagline && (
              <span className="inline-flex items-center gap-2 font-semibold tracking-wide uppercase text-[10px] px-2 py-0.5 rounded-full text-emerald-800 bg-emerald-50 ring-1 ring-emerald-200">
                <span className="inline-block w-1 h-1 rounded-full bg-emerald-500" />
                {tagline}
              </span>
            )}
            <h1 className="mt-3 text-2xl md:text-4xl font-bold leading-tight text-gray-900 dark:text-gray-100">
              <span className="bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent">
                {title}
              </span>
            </h1>
            {description && (
              <p className="mt-4 text-sm md:text-base text-gray-800 dark:text-gray-100 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {primaryCta && (
              <Link
                href={primaryCta.href}
                className="inline-flex items-center justify-center rounded-xl text-white px-4 py-2.5 text-sm font-medium shadow-lg transition focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
              >
                <span>{primaryCta.label}</span>
                <svg className="ml-2 h-3.5 w-3.5 opacity-90" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            )}
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="inline-flex items-center justify-center rounded-xl border border-gray-400 dark:border-gray-500 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm font-medium hover:bg-emerald-50/60 dark:hover:bg-white/5 transition"
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-gray-800 dark:text-gray-200">
            <li className="flex items-center gap-2">
              <span className="grid place-items-center w-3.5 h-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Smooth, responsive 3D viewer
            </li>
            <li className="flex items-center gap-2">
              <span className="grid place-items-center w-3.5 h-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Auto-fit with gentle zoom
            </li>
            <li className="flex items-center gap-2">
              <span className="grid place-items-center w-3.5 h-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Elegant glass & gradient styling
            </li>
            <li className="flex items-center gap-2">
              <span className="grid place-items-center w-3.5 h-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Mobile-friendly layout
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
} 