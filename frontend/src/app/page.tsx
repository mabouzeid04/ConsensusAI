"use client";

import React, { useState } from 'react';
import PromptForm from '../components/PromptForm';
import ResponseList from '../components/ResponseList';
import { submitPrompt, evaluateResponses } from '../services/api';
import Link from 'next/link';

interface ModelResponse {
  model: string;
  response: string;
  label?: string;
}

interface EvaluationData {
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
  comparisonId?: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [results, setResults] = useState<EvaluationData | null>(null);
  const [step, setStep] = useState<'input' | 'evaluating' | 'results'>('input');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePromptSubmit = async ({ prompt, generators, judges }: { prompt: string; generators: string[]; judges: string[] }) => {
    setIsLoading(true);
    setPromptText(prompt);
    setStep('evaluating');
    setErrorMessage(null);

    try {
      const data = await submitPrompt({ prompt, generators });

      const evaluationData = await evaluateResponses({
        prompt,
        shuffledResponses: data.shuffledResponses,
        originalMapping: data.originalMapping,
        judges,
      });

      setResults(evaluationData);
      setStep('results');
    } catch (error: any) {
      console.error('Error:', error);
      const msg = error?.message || '';
      if (msg.toLowerCase().includes('insufficient funds')) {
        setErrorMessage('Insufficient funds in your wallet. Please top up on your Account page.');
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPromptText('');
    setResults(null);
    setStep('input');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {step === 'input' && (
        <div className="max-w-3xl mx-auto animate-fade-in-up">
          <div className="bg-base-200/50 backdrop-blur-xl border border-base-content/10 shadow-xl rounded-2xl p-8">
            <div className="flex justify-end mb-2">
              <Link href="/history" className="text-sm font-medium text-base-content/70 hover:text-primary transition-colors">View History</Link>
            </div>
            <PromptForm onSubmit={handlePromptSubmit} isLoading={isLoading} errorMessage={errorMessage} />
          </div>
        </div>
      )}

      {step === 'evaluating' && (
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <div className="bg-base-200/50 backdrop-blur-xl border border-base-content/10 shadow-xl rounded-2xl p-12">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              </div>
              <h2 className="text-2xl font-display font-bold text-base-content">Processing Your Request</h2>
              <p className="text-base-content/70 text-lg">
                Collecting responses from AI models and gathering their evaluations...
              </p>
            </div>
          </div>
        </div>
      )}

      {step === 'results' && results && (
        <div className="space-y-8 animate-fade-in-up">
          <div className="bg-base-200/50 backdrop-blur-xl border border-base-content/10 shadow-xl rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-base-content">Original Prompt</h2>
              <div className="px-3 py-1 rounded-full bg-base-200 border border-white/10 text-xs font-medium text-base-content/70">
                Blind judging enabled
              </div>
            </div>
            <div className="bg-base-200/50 rounded-xl p-6 border border-white/5">
              <p className="text-lg text-base-content leading-relaxed">{promptText}</p>
            </div>
          </div>

          <ResponseList results={results} />

          <div className="flex justify-center pt-8">
            <button
              onClick={handleReset}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 border-none px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Start New Comparison
            </button>
          </div>
        </div>
      )}
    </div>
  );
}