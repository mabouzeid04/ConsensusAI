"use client";

import React from 'react';
import { useState } from 'react';
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
  const [shuffledResponses, setShuffledResponses] = useState<ModelResponse[]>([]);
  const [originalMapping, setOriginalMapping] = useState<ModelResponse[]>([]);
  const [comparisonId, setComparisonId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePromptSubmit = async ({ prompt, generators, judges }: { prompt: string; generators: string[]; judges: string[] }) => {
    setIsLoading(true);
    setPromptText(prompt);
    setStep('evaluating');
    setErrorMessage(null);
    
    try {
      const data = await submitPrompt({ prompt, generators });
      setShuffledResponses(data.shuffledResponses);
      setOriginalMapping(data.originalMapping);
      
      const evaluationData = await evaluateResponses({
        prompt,
        shuffledResponses: data.shuffledResponses,
        originalMapping: data.originalMapping,
        judges,
      });
      
      setResults(evaluationData);
      if (evaluationData?.comparisonId) {
        setComparisonId(evaluationData.comparisonId);
      } else {
        setComparisonId(null);
      }
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
    setShuffledResponses([]);
    setOriginalMapping([]);
    setStep('input');
    setComparisonId(null);
  };

  return (
    <div className="min-h-screen bg-base-200">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-transparent bg-clip-text animate-gradient mb-4">
            ConsensusAI
          </h1>
        </div>

        {step === 'input' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-base-100 rounded-2xl shadow-xl p-8">
              <div className="flex justify-end mb-2">
                <Link href="/history" className="btn btn-ghost normal-case">View History</Link>
              </div>
              <PromptForm onSubmit={handlePromptSubmit} isLoading={isLoading} errorMessage={errorMessage} />
            </div>
          </div>
        )}

        {step === 'evaluating' && (
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-base-100 rounded-2xl shadow-xl p-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <h2 className="text-2xl font-semibold text-base-content">Processing Your Request</h2>
                <p className="text-base-content/70">
                  Collecting responses from AI models and gathering their evaluations...
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 'results' && results && (
          <div className="space-y-8">
            <div className="bg-base-100 rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-base-content">Original Prompt</h2>
                <div className="tooltip" data-tip="Model names are anonymized before judging.">
                  <span className="badge badge-ghost">Blind judging</span>
                </div>
              </div>
              <div className="bg-base-200 rounded-xl p-6 border border-base-300">
                <p className="text-base-content text-lg">{promptText}</p>
              </div>
            </div>

            <ResponseList results={results} />

            <div className="text-center mt-8 space-x-4">
              <button
                onClick={handleReset}
                className="btn btn-primary btn-lg normal-case"
              >
                Start New Comparison
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 