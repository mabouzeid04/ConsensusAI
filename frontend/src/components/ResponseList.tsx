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

  return (
    <div className="w-full max-w-4xl space-y-8">
      {responsesWithEvaluations.map((item) => (
        <ResponseCard key={item.label} responseData={item} />
      ))}
    </div>
  );
} 