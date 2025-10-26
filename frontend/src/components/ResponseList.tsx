import React from 'react';
import ResponseCard from './ResponseCard';

interface ResponseListProps {
  results: {
    prompt: string;
    responsesWithEvaluations: Array<{
      label: string;
      model: string;
      response: string;
      evaluations: Array<{
        model: string;
        score: number;
        explanation: string;
      }>;
    }>;
  };
}

export default function ResponseList({ results }: ResponseListProps) {
  const { responsesWithEvaluations } = results;

  const calculateAverage = (scores: Array<{ score: number }>) => {
    if (!scores || scores.length === 0) return 0;
    const total = scores.reduce((acc, curr) => acc + (curr.score || 0), 0);
    return total / scores.length;
  };

  const sortedByScore = [...responsesWithEvaluations].sort((a, b) => {
    const avgA = calculateAverage(a.evaluations);
    const avgB = calculateAverage(b.evaluations);
    return avgB - avgA; // descending
  });

  return (
    <div className="w-full max-w-4xl space-y-8">
      {sortedByScore.map((item) => (
        <ResponseCard key={item.label} responseData={item} />
      ))}
    </div>
  );
} 