import React, { useMemo, useState } from 'react';

interface PromptFormProps {
  onSubmit: (payload: { prompt: string; generators: string[]; judges: string[] }) => void;
  isLoading: boolean;
}

export default function PromptForm({ onSubmit, isLoading }: PromptFormProps) {
  const [prompt, setPrompt] = useState('');
  const MODELS = [
    { id: 'gpt4o_t07', label: 'GPT-4o (T0.7)' },
    { id: 'gpt4o_t10', label: 'GPT-4o (T1.0)' },
    { id: 'claude_37_sonnet', label: 'Claude 3.7 Sonnet' },
    { id: 'deepseek_r1', label: 'DeepSeek R1' },
    { id: 'gemini_20_flash', label: 'Gemini 2.0 Flash' },
  ];
  const [generators, setGenerators] = useState<string[]>(MODELS.map(m => m.id));
  const [judges, setJudges] = useState<string[]>(MODELS.map(m => m.id));

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
        <div className="space-y-4">
          <section className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-semibold text-gray-800">Generate with</h3>
              <div className="space-x-2 text-sm">
                <button type="button" className="link" onClick={() => selectAll(setGenerators)}>Select all</button>
                <span className="text-gray-300">|</span>
                <button type="button" className="link" onClick={() => selectNone(setGenerators)}>None</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {MODELS.map(m => (
                <label key={m.id} className={`px-3 py-2 rounded-lg border cursor-pointer ${generators.includes(m.id) ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}`}>
                  <input
                    type="checkbox"
                    className="mr-2 align-middle"
                    checked={generators.includes(m.id)}
                    onChange={() => toggle(generators, setGenerators, m.id)}
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-800">{m.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-semibold text-gray-800">Judge with</h3>
              <div className="space-x-2 text-sm">
                <button type="button" className="link" onClick={() => selectAll(setJudges)}>Select all</button>
                <span className="text-gray-300">|</span>
                <button type="button" className="link" onClick={() => selectNone(setJudges)}>None</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {MODELS.map(m => (
                <label key={m.id} className={`px-3 py-2 rounded-lg border cursor-pointer ${judges.includes(m.id) ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'}`}>
                  <input
                    type="checkbox"
                    className="mr-2 align-middle"
                    checked={judges.includes(m.id)}
                    onChange={() => toggle(judges, setJudges, m.id)}
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-800">{m.label}</span>
                </label>
              ))}
            </div>
          </section>

          <div className="text-sm text-gray-600">
            {generators.length} generator{generators.length !== 1 ? 's' : ''}, {judges.length} judge{judges.length !== 1 ? 's' : ''} → {generators.length} responses, {judges.length}×{generators.length} evaluations
          </div>
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