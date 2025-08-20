// src/app/(main)/report/page.tsx

import ReportTable from '@/components/report/report';

const ReportPage = () => {
  return (
     <div className="min-h-screen bg-gradient-to-t from-green-600 to-zinc-50">
      <main className="max-w-[1800px] mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Reports</h1>
      <ReportTable />
    </main>
    </div>
  );
};

export default ReportPage;
