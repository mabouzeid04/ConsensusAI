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

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (score >= 6) return 'text-primary-400 bg-primary-400/10 border-primary-400/20';
    return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden group animate-fade-in-up">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
            {label}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">{model}</h3>
            <div className="text-xs text-content-secondary">Response Time: ~1.2s</div>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getScoreColor(averageScore)} backdrop-blur-md`}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-lg font-bold">{averageScore.toFixed(1)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6 bg-base-200/30">
        <div className="prose prose-invert max-w-none prose-p:text-content-secondary prose-headings:text-base-content prose-strong:text-base-content prose-code:text-primary-300 prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-white/10">
          <MarkdownRenderer content={response} />
        </div>
      </div>

      {/* Evaluations */}
      <div className="px-6 py-4 bg-black/20 border-t border-white/5">
        <h4 className="text-sm font-semibold text-content-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Model Evaluations
        </h4>
        <div className="grid gap-3">
          {evaluations.map((evaluation, index) => (
            <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-primary-200 text-sm">
                  {evaluation.model}
                </span>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${getScoreColor(evaluation.score)} bg-opacity-10 border-opacity-20`}>
                  <span>{evaluation.score}/10</span>
                </div>
              </div>
              <p className="text-content-secondary text-sm leading-relaxed">
                {evaluation.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}