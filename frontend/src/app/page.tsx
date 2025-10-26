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

  const handlePromptSubmit = async ({ prompt, generators, judges }: { prompt: string; generators: string[]; judges: string[] }) => {
    setIsLoading(true);
    setPromptText(prompt);
    setStep('evaluating');
    
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
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-transparent bg-clip-text animate-gradient mb-4">
            ConsensusAI
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Zibda doesn't want to do homework. Zibda wants to have fun. This generates a response from each of the best AI models and has them evaluate and rate each other's responses without knowing who produced them.
          </p>
        </div>

        {step === 'input' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-opacity-90">
              <div className="flex justify-end mb-2">
                <Link href="/history" className="btn normal-case bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200">View History</Link>
              </div>
              <PromptForm onSubmit={handlePromptSubmit} isLoading={isLoading} />
            </div>
          </div>
        )}

        {step === 'evaluating' && (
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-opacity-90">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <h2 className="text-2xl font-semibold text-gray-800">Processing Your Request</h2>
                <p className="text-gray-600">
                  Collecting responses from 5 AI models and gathering their evaluations...
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 'results' && results && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-opacity-90">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Original Prompt</h2>
                <div className="tooltip" data-tip="Model names are anonymized before judging.">
                  <span className="inline-flex items-center text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-full px-2 py-1">
                    Blind judging
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <p className="text-gray-700 text-lg">{promptText}</p>
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
              {comparisonId && (
                <Link href={`/history/${comparisonId}`} className="btn btn-lg normal-case bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200">
                  View in History
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 