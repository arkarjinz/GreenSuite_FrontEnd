// pages/resource/goal.tsx
"use client";

import React from "react";
import Header from "@/components/resource/Header";
import GoalForm from "@/components/resource/GoalForm";

export default function GoalPage() {
    return (
        <main className="min-h-screen bg-white">
            <Header onBack={() => window.history.back()} />
            <section className="p-4">
                <GoalForm />
            </section>
        </main>
    );
}
