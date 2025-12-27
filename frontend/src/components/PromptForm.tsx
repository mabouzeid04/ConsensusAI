import React, { useMemo, useState } from 'react';

interface PromptFormProps {
  onSubmit: (payload: { prompt: string; generators: string[]; judges: string[] }) => void;
  isLoading: boolean;
  errorMessage?: string | null;
}

export default function PromptForm({ onSubmit, isLoading, errorMessage }: PromptFormProps) {
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
  const getDollarSigns = (tier: number) => Array(Math.max(1, Math.min(4, tier || 1))).fill('$');

  const SORTED_MODELS = useMemo(() => {
    return [...MODELS].sort((a, b) => (MODEL_COST[b.id] || 0) - (MODEL_COST[a.id] || 0));
  }, []);

  const [generators, setGenerators] = useState<string[]>([]);
  const [judges, setJudges] = useState<string[]>([]);

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
    <div className="w-full max-w-4xl mx-auto animate-fade-in-up">
      <form onSubmit={handleSubmit} className="space-y-8">
        {!!errorMessage && (
          <div className="alert alert-warning shadow-lg animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-3">
          <label htmlFor="prompt" className="block text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-secondary-300">
            What do you want to compare?
          </label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <textarea
              id="prompt"
              rows={5}
              className="relative w-full p-6 bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl text-lg text-content-primary placeholder-content-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-xl resize-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask a complex question, request code, or get creative writing..."
              disabled={isLoading}
            />
            <div className="absolute bottom-4 right-4 text-xs font-mono text-content-secondary/60 bg-surface/50 px-2 py-1 rounded-md border border-white/5">
              {prompt.length} chars
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Generators Selection */}
          <section className="bg-base-200/50 backdrop-blur-xl border border-border/10 shadow-xl rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-base-content flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_10px_rgba(6,182,212,0.5)]"></span>
                Generate with
              </h3>
              <div className="flex gap-3 text-xs font-medium">
                <button type="button" className="text-primary hover:text-primary-300 transition-colors" onClick={() => selectAll(setGenerators)}>All</button>
                <span className="text-white/10">|</span>
                <button type="button" className="text-content-secondary hover:text-base-content transition-colors" onClick={() => selectNone(setGenerators)}>None</button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {SORTED_MODELS.map(m => (
                <label
                  key={m.id}
                  className={`
                    relative flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 group
                    ${generators.includes(m.id)
                      ? 'bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                      : 'bg-base-200/30 border-white/5 hover:bg-base-200/50 hover:border-white/10'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-5 h-5 rounded-md border flex items-center justify-center transition-colors
                      ${generators.includes(m.id) ? 'bg-primary border-primary' : 'border-white/20 group-hover:border-white/40'}
                    `}>
                      {generators.includes(m.id) && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${generators.includes(m.id) ? 'text-white' : 'text-content-secondary group-hover:text-base-content'}`}>
                      {m.label}
                    </span>
                  </div>
                  <div className="flex gap-0.5">
                    {getDollarSigns(MODEL_COST[m.id]).map((_, i) => (
                      <span key={i} className="text-[10px] text-emerald-400">$</span>
                    ))}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={generators.includes(m.id)}
                    onChange={() => toggle(generators, setGenerators, m.id)}
                    disabled={isLoading}
                  />
                </label>
              ))}
            </div>
          </section>

          {/* Judges Selection */}
          <section className="bg-base-200/50 backdrop-blur-xl border border-border/10 shadow-xl rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-base-content flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span>
                Judge with
              </h3>
              <div className="flex gap-3 text-xs font-medium">
                <button type="button" className="text-accent hover:text-rose-300 transition-colors" onClick={() => selectAll(setJudges)}>All</button>
                <span className="text-white/10">|</span>
                <button type="button" className="text-content-secondary hover:text-base-content transition-colors" onClick={() => selectNone(setJudges)}>None</button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {SORTED_MODELS.map(m => (
                <label
                  key={m.id}
                  className={`
                    relative flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 group
                    ${judges.includes(m.id)
                      ? 'bg-accent/10 border-accent/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                      : 'bg-base-200/30 border-white/5 hover:bg-base-200/50 hover:border-white/10'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-5 h-5 rounded-md border flex items-center justify-center transition-colors
                      ${judges.includes(m.id) ? 'bg-accent border-accent' : 'border-white/20 group-hover:border-white/40'}
                    `}>
                      {judges.includes(m.id) && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${judges.includes(m.id) ? 'text-white' : 'text-content-secondary group-hover:text-base-content'}`}>
                      {m.label}
                    </span>
                  </div>
                  <div className="flex gap-0.5">
                    {getDollarSigns(MODEL_COST[m.id]).map((_, i) => (
                      <span key={i} className="text-[10px] text-emerald-400">$</span>
                    ))}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={judges.includes(m.id)}
                    onChange={() => toggle(judges, setJudges, m.id)}
                    disabled={isLoading}
                  />
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading || !prompt.trim() || generators.length === 0 || judges.length === 0}
            className={`
              relative group overflow-hidden rounded-xl px-8 py-4 font-bold text-white transition-all duration-300
              ${isLoading || !prompt.trim() || generators.length === 0 || judges.length === 0
                ? 'bg-surface cursor-not-allowed opacity-50'
                : 'btn-gradient hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]'}
            `}
          >
            <span className="relative z-10 flex items-center gap-3 text-lg">
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Compare AI Responses</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}