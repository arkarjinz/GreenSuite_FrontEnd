// src/app/(main)/report/page.tsx

import ReportTable from '@/components/report/report';

const ReportPage = () => {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Reports</h1>
      <ReportTable />
    </main>
  );
};

export default ReportPage;
