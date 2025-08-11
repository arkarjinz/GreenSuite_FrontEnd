import ResultsPage from '@/components/results/ResultsPage';

export default function Page({ params }: { params: { month: string, year: string, region: string } }) {
  return <ResultsPage params={params} />;
}