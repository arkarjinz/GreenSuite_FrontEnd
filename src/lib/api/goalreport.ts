export async function fetchGoalData() {
  const res = await fetch('/api/goals');
  if (!res.ok) throw new Error('Failed to fetch goal data');
  return res.json();
}
