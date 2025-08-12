import ResultsPage from '@/components/resource/ResultsPage';

/*export default function Page({ params }: { params: { month: string, year: string, region: string } }) {
  return <ResultsPage params={params} />;
}*/
export default async function Page({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ month: string, year: string }>;
  searchParams: Promise<{ region?: string }>;
}) {
  // Await the params and searchParams
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  return (
    <ResultsPage 
      params={{ 
        month: resolvedParams.month, 
        year: resolvedParams.year, 
        region: resolvedSearchParams.region || 'us' // Default to 'us' if no region provided
      }} 
    />
  );
}