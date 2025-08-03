// pages/resource/goal.tsx
"use client";

import React from "react";
//import Header from "@/components/resource/Header";
import GoalForm from "@/components/resource/GoalForm";

export default function GoalPage() {
    return (
        
            <main className="relative min-h-screen overflow-hidden">
            {/* Background image layer with opacity */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-40 z-0"
                style={{ backgroundImage: "url('/goal.jpg')" }}
            />
            <section className="relative z-10 p-4">
                <GoalForm />
            </section>
        </main>
    );
}
