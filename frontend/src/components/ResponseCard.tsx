import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface EvaluationProps {
  model: string;
  score: number;
  explanation: string;
}

interface ResponseCardProps {
  responseData: {
    label: string;
    model: string;
    response: string;
    evaluations: EvaluationProps[];
  };
}

export default function ResponseCard({ responseData }: ResponseCardProps) {
  const { label, model, response, evaluations } = responseData;
  
  // Calculate average score
  const averageScore = evaluations.reduce((acc, curr) => acc + curr.score, 0) / evaluations.length;
  const scoreColor = averageScore >= 8 ? 'text-success' : averageScore >= 6 ? 'text-primary' : 'text-warning';

  return (
    <div className="bg-base-100 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
      <div className="bg-base-100 px-6 py-4 border-b border-base-300">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-semibold text-base-content">{model}</span>
          </div>
          <div className={`flex items-center space-x-2 ${scoreColor} bg-base-100 px-4 py-2 rounded-full shadow-sm`}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-lg font-bold">{averageScore.toFixed(1)}</span>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4">
        <div className="prose max-w-none">
          <MarkdownRenderer content={response} />
        </div>
      </div>
      
      <div className="bg-base-100 px-6 py-4 border-t border-base-300">
        <h4 className="text-lg font-semibold text-base-content mb-4">Model Evaluations</h4>
        <div className="space-y-4">
          {evaluations.map((evaluation, index) => (
            <div key={index} className="bg-base-100 rounded-xl p-4 border border-base-300 hover:border-primary/40 transition-colors duration-200">
              <div className="flex justify-between items-start mb-3">
                <span className="font-medium text-base-content bg-base-200 px-3 py-1 rounded-full text-sm">
                  {evaluation.model}
                </span>
                <div className="flex items-center space-x-1 bg-base-200 px-3 py-1 rounded-full">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-semibold text-base-content">{evaluation.score}/10</span>
                </div>
              </div>
              <p className="text-base-content/80 text-sm leading-relaxed">
                {evaluation.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 