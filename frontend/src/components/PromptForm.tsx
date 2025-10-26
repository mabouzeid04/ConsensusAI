import React, { useMemo, useState } from 'react';

interface PromptFormProps {
  onSubmit: (payload: { prompt: string; generators: string[]; judges: string[] }) => void;
  isLoading: boolean;
}

export default function PromptForm({ onSubmit, isLoading }: PromptFormProps) {
  const [prompt, setPrompt] = useState('');
  const MODELS = [
    { id: 'gpt5_low', label: 'GPT-5 Low' },
    { id: 'gpt5_high', label: 'GPT-5 High' },
    { id: 'claude_45_sonnet', label: 'Claude 4.5 Sonnet' },
    { id: 'deepseek_r1', label: 'DeepSeek R1' },
    { id: 'deepseek_v3', label: 'DeepSeek V3' },
    { id: 'gemini_20_flash', label: 'Gemini 2.5 Flash' },
    { id: 'gemini_25_pro', label: 'Gemini 2.5 Pro' },
    { id: 'grok_4', label: 'Grok 4' },
  ];
  const MODEL_COST: Record<string, number> = {
    gpt5_high: 4,
    gpt5_low: 3,
    claude_45_sonnet: 4,
    gemini_20_flash: 2,
    gemini_25_pro: 3,
    deepseek_v3: 2,
    deepseek_r1: 1,
    grok_4: 3,
  };
  const getDollarSigns = (tier: number) => '$'.repeat(Math.max(1, Math.min(4, tier || 1)));
  const SORTED_MODELS = useMemo(() => {
    return [...MODELS].sort((a, b) => (MODEL_COST[b.id] || 0) - (MODEL_COST[a.id] || 0));
  }, []);
  const [generators, setGenerators] = useState<string[]>([]);
  const [judges, setJudges] = useState<string[]>([]);

  const evalCount = useMemo(() => generators.length * judges.length, [generators.length, judges.length]);

  const toggle = (list: string[], setter: (v: string[]) => void, id: string) => {
    setter(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
  };

  const selectAll = (setter: (v: string[]) => void) => setter(MODELS.map(m => m.id));
  const selectNone = (setter: (v: string[]) => void) => setter([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    if (generators.length === 0 || judges.length === 0) return;
    onSubmit({ prompt, generators, judges });
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="prompt" className="block text-lg font-medium text-gray-700 mb-2">
            Enter your prompt
          </label>
          <div className="relative">
            <textarea
              id="prompt"
              rows={5}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out resize-none text-gray-800 placeholder-gray-400 bg-white/50 backdrop-blur-sm"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask anything... The AI models will compete to provide the best response."
              disabled={isLoading}
            />
            <div className="absolute bottom-3 right-3 text-sm text-gray-400">
              {prompt.length} characters
            </div>
          </div>
        </div>
        <div className="flex gap-4 w-full">
          <section className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-semibold text-gray-800">Generate with:</h3>
              <div className="space-x-2 text-sm">
                <button type="button" className="link" onClick={() => selectAll(setGenerators)}>Select all</button>
                <span className="text-gray-300">|</span>
                <button type="button" className="link" onClick={() => selectNone(setGenerators)}>None</button>
              </div>
            </div>
            <ul className="divide-y divide-gray-200">
              {SORTED_MODELS.map(m => (
                <li key={m.id} className={`flex items-center justify-between py-2 px-2 rounded-md ${generators.includes(m.id) ? 'bg-blue-50' : ''}`}>
                  <label className="flex items-center gap-2 cursor-pointer w-full">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={generators.includes(m.id)}
                      onChange={() => toggle(generators, setGenerators, m.id)}
                      disabled={isLoading}
                      aria-label={`Generate with ${m.label}`}
                    />
                    <span className="text-sm text-gray-800 truncate">{m.label}</span>
                  </label>
                  <span className="ml-3 text-sm tabular-nums text-gray-600">{getDollarSigns(MODEL_COST[m.id])}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-semibold text-gray-800">Judge with:</h3>
              <div className="space-x-2 text-sm">
                <button type="button" className="link" onClick={() => selectAll(setJudges)}>Select all</button>
                <span className="text-gray-300">|</span>
                <button type="button" className="link" onClick={() => selectNone(setJudges)}>None</button>
              </div>
            </div>
            <ul className="divide-y divide-gray-200">
              {SORTED_MODELS.map(m => (
                <li key={m.id} className={`flex items-center justify-between py-2 px-2 rounded-md ${judges.includes(m.id) ? 'bg-green-50' : ''}`}>
                  <label className="flex items-center gap-2 cursor-pointer w-full">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={judges.includes(m.id)}
                      onChange={() => toggle(judges, setJudges, m.id)}
                      disabled={isLoading}
                      aria-label={`Judge with ${m.label}`}
                    />
                    <span className="text-sm text-gray-800 truncate">{m.label}</span>
                  </label>
                  <span className="ml-3 text-sm tabular-nums text-gray-600">{getDollarSigns(MODEL_COST[m.id])}</span>
                </li>
              ))}
            </ul>
          </section>

        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !prompt.trim() || generators.length === 0 || judges.length === 0}
            className={`
              relative overflow-hidden group btn btn-primary btn-lg normal-case min-w-[200px]
              ${isLoading || !prompt.trim() || generators.length === 0 || judges.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 transform transition-transform'}
            `}
          >
            <span className="relative z-10">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <span className="loading loading-spinner"></span>
                  <span>Processing...</span>
                </div>
              ) : (
                'Compare AI Responses'
              )}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
} 