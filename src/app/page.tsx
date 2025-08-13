"use client"

import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import ModelShowcase from "@/components/3d/ModelShowcase";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import AICreditPricing from "@/components/payment/AICreditPricing";

function ModelShowcaseWrapper() {
  return (
    <ModelShowcase
      title="Rin Kazuki"
      tagline="Introducing"
      description="Rin Kazuki is our environmental sustainability teacher with an elegant, contemplative personality inspired by Yukari Yukino. Sophisticated, thoughtful, and deeply caring — Rin guides you through environmental topics with graceful wisdom and poetic insights."
      modelPath="/models/just_a_girl.glb"
      primaryCta={{ label: "Chat with Rin", href: "/ai-chat" }}
      secondaryCta={{ label: "See 3D Demo", href: "/3d-demo" }}
      fitMargin={0.4}
      autoRotate
    />
  );
}

function FallbackContent() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-20">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-6">
          Rin Kazuki
        </h1>
        <p className="text-lg md:text-xl text-gray-900 dark:text-gray-100 mb-8 max-w-3xl mx-auto">
          Rin Kazuki is our environmental sustainability teacher with an elegant, contemplative personality inspired by Yukari Yukino. 
          Sophisticated, thoughtful, and deeply caring — Rin guides you through environmental topics with graceful wisdom and poetic insights.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/ai-chat"
            className="inline-flex items-center justify-center rounded-xl text-white px-6 py-3 font-medium bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 transition"
          >
            Chat with Rin
          </a>
          <a
            href="/3d-demo"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 text-gray-800 px-6 py-3 font-medium hover:bg-gray-50 transition"
          >
            See 3D Demo
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <LoadingSpinner />
            </div>
          }>
            <ModelShowcaseWrapper />
          </Suspense>
          
          {/* AI Credit Pricing Section */}
          <AICreditPricing />
      </main>
    </div>
  );
}
