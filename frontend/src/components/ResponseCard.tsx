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
  const scoreColor = averageScore >= 8 ? 'text-green-600' : averageScore >= 6 ? 'text-blue-600' : 'text-yellow-600';

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm bg-opacity-90 transition-all duration-300 hover:shadow-2xl">
      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-semibold text-gray-700">Response {label}</span>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              {model}
            </span>
          </div>
          <div className={`flex items-center space-x-2 ${scoreColor} bg-white px-4 py-2 rounded-full shadow-sm`}>
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
      
      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-t border-gray-100">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Model Evaluations</h4>
        <div className="space-y-4">
          {evaluations.map((evaluation, index) => (
            <div key={index} className="bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-200 transition-colors duration-200">
              <div className="flex justify-between items-start mb-3">
                <span className="font-medium text-gray-800 bg-gray-100 px-3 py-1 rounded-full text-sm">
                  {evaluation.model}
                </span>
                <div className="flex items-center space-x-1 bg-gray-50 px-3 py-1 rounded-full">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-semibold text-gray-700">{evaluation.score}/10</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {evaluation.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 