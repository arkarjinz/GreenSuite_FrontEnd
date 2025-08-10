"use client";
//import Header from "@/components/resource/Header";
import ResourceForm from "@/components/resource/ResourceForm";

export default function ResourcePage() {
  
  return (
    /*<main style={{ minHeight: "100vh", background: "#f9f9f9" }}>*/
    <main className="min-h-screen bg-gradient-to-t from-green-600 to-zinc-50">

    
      <div className="min-h-screen">
      {/*<Header onBack={() => window.history.back()} />*/}
      <section style={{ padding: "2rem 1rem" }}>
        <ResourceForm />
      </section>
      </div>
    </main>
  );
}
