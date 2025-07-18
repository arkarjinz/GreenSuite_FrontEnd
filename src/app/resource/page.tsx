"use client";
import Header from "@/components/resource/Header";
import ResourceForm from "@/components/resource/ResourceForm";

export default function ResourcePage() {
  return (
    /*<main style={{ minHeight: "100vh", background: "#f9f9f9" }}>*/
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/11493765.png')" }}
    >
      <div className="bg-white/80 min-h-screen">
      <Header onBack={() => window.history.back()} />
      <section style={{ padding: "2rem 1rem" }}>
        <ResourceForm />
      </section>
      </div>
    </main>
  );
}
