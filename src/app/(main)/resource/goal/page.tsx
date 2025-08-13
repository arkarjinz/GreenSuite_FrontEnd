// pages/resource/goal.tsx
"use client";

import React from "react";
//import Header from "@/components/resource/Header";
import GoalForm from "@/components/resource/GoalForm";

export default function GoalPage() {
    return (
        
            <main className="min-h-screen bg-gradient-to-t from-green-600 to-zinc-50">

    
            <div className="min-h-screen">
            <section className="relative z-10 p-4">
                <GoalForm />
            </section>
            </div>
        </main>
    );
}
