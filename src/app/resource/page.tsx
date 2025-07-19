"use client";
import Header from "@/components/resource/Header";
import ResourceForm from "@/components/resource/ResourceForm";

export default function ResourcePage() {
  return (
    <main className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/11493765.png')" }}>
      <div className="min-h-screen bg-white/80">
        
        {/* Header */}
        <Header onBack={() => window.history.back()} />
        
        {/* Content section - Tightened spacing */}
        <section className="mx-auto max-w-4xl px-4 py-8 md:px-6 lg:px-8">
          <ResourceForm />
        </section>
        
      </div>
    </main>
  );
}