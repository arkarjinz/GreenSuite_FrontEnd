import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ error: 'Month and year are required' });
  }

  const token = req.headers.authorization?.split(" ")[1]; // Get token from header

  try {
    const backendResponse = await fetch(
      `http://localhost:8080/api/carbon/goals/monthly?month=${month}&year=${year}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Forward the token
          "Content-Type": "application/json",
        },
      }
    );

    if (!backendResponse.ok) {
      const error = await backendResponse.json();
      return res.status(backendResponse.status).json(error);
    }

    const data = await backendResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Backend fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch from backend" });
  }
}