// src/app/(main)/resource/goal/edit/[goalId]/page.tsx
"use client";

import React from "react";
import GoalEditForm from "@/components/resource/GoalEditForm";
import { use } from 'react';

interface Props {
  params: Promise<{ goalId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function GoalEditPage({ params, searchParams }: Props) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  
  return (
    <main className="min-h-screen bg-gradient-to-t from-green-600 to-zinc-50">
      <div className="min-h-screen">
        <section className="relative z-10 p-4">
          <GoalEditForm 
            goalId={resolvedParams.goalId}
            searchParams={resolvedSearchParams}
          />
        </section>
      </div>
    </main>
  );
}