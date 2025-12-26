import React, { useMemo, useState } from 'react';

interface PromptFormProps {
  onSubmit: (payload: { prompt: string; generators: string[]; judges: string[]; image?: string }) => void;
  isLoading: boolean;
}

export default function PromptForm({ onSubmit, isLoading }: PromptFormProps) {
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');

  // Define which models support vision/document analysis
  const VISION_ENABLED_MODELS = new Set([
    'gpt5_low',
    'gpt5_high',
    'claude_45_sonnet',
    'gemini_20_flash',
    'gemini_25_pro',
    'grok_4'
  ]);

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

  // Filter models based on vision support if file is uploaded
  const availableModels = useMemo(() => {
    if (file) {
      return MODELS.filter(m => VISION_ENABLED_MODELS.has(m.id));
    }
    return MODELS;
  }, [file]);

  const toggle = (list: string[], setter: (v: string[]) => void, id: string) => {
    setter(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
  };

  const selectAll = (setter: (v: string[]) => void) => setter(availableModels.map(m => m.id));
  const selectNone = (setter: (v: string[]) => void) => setter([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    // Supported file types: images and PDFs
    const supportedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf'
    ];

    if (!supportedTypes.includes(uploadedFile.type)) {
      alert('Please upload an image (JPEG, PNG, GIF, WebP) or PDF file');
      return;
    }

    // Validate file size (max 10MB for PDFs, 5MB for images)
    const maxSize = uploadedFile.type === 'application/pdf' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (uploadedFile.size > maxSize) {
      const maxSizeMB = uploadedFile.type === 'application/pdf' ? '10MB' : '5MB';
      alert(`File size must be less than ${maxSizeMB}`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFile(base64String);
      setFileName(uploadedFile.name);
      setFileType(uploadedFile.type);

      // Remove non-vision models from selected generators and judges
      setGenerators(prev => prev.filter(id => VISION_ENABLED_MODELS.has(id)));
      setJudges(prev => prev.filter(id => VISION_ENABLED_MODELS.has(id)));
    };
    reader.readAsDataURL(uploadedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileName('');
    setFileType('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    if (generators.length === 0 || judges.length === 0) return;
    onSubmit({ prompt, generators, judges, image: file || undefined });
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="prompt" className="block text-lg font-medium text-base-content mb-2">
            Enter your prompt
          </label>
          <div className="relative">
            <textarea
              id="prompt"
              rows={5}
              className="w-full p-4 border-2 border-base-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ease-in-out resize-none text-base-content placeholder-base-content/50 bg-base-100"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask anything... The AI models will compete to provide the best response."
              disabled={isLoading}
            />
            <div className="absolute bottom-3 right-3 text-sm text-base-content/60">
              {prompt.length} characters
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <div>
          <label className="block text-lg font-medium text-base-content mb-2">
            Upload a file (optional)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="file-input file-input-bordered file-input-primary w-full max-w-xs"
            />
            {file && (
              <button
                type="button"
                onClick={handleRemoveFile}
                disabled={isLoading}
                className="btn btn-error btn-sm"
              >
                Remove File
              </button>
            )}
          </div>
          {file && (
            <div className="mt-4">
              <div className="relative inline-block">
                {fileType.startsWith('image/') ? (
                  <img
                    src={file}
                    alt="Uploaded preview"
                    className="max-w-xs max-h-48 rounded-lg border-2 border-base-300"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-base-200 rounded-lg border-2 border-base-300">
                    <svg className="w-12 h-12 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div className="font-medium text-base-content">PDF Document</div>
                      <div className="text-sm text-base-content/60">{fileName}</div>
                    </div>
                  </div>
                )}
                {fileType.startsWith('image/') && (
                  <div className="mt-2 text-sm text-base-content/60">
                    {fileName}
                  </div>
                )}
              </div>
            </div>
          )}
          {file && (
            <div className="mt-2 p-3 bg-info/10 border border-info/30 rounded-lg">
              <p className="text-sm text-base-content">
                <strong>Note:</strong> Only vision-enabled models (GPT-5, Claude 4.5, Gemini 2.5, Grok 4) can process files. Other models will be disabled.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-4 w-full">
          <section className="bg-base-200 border border-base-300 rounded-xl p-4 flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-semibold text-base-content">Generate with:</h3>
              <div className="space-x-2 text-sm">
                <button type="button" className="link" onClick={() => selectAll(setGenerators)}>Select all</button>
                <span className="text-gray-300">|</span>
                <button type="button" className="link" onClick={() => selectNone(setGenerators)}>None</button>
              </div>
            </div>
            <ul className="divide-y divide-base-300">
              {SORTED_MODELS.map(m => {
                const isDisabled = file && !VISION_ENABLED_MODELS.has(m.id);
                return (
                  <li key={m.id} className={`flex items-center justify-between py-2 px-2 rounded-md ${generators.includes(m.id) ? 'bg-primary/10' : ''} ${isDisabled ? 'opacity-50' : ''}`}>
                    <label className={`flex items-center gap-2 w-full ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={generators.includes(m.id)}
                        onChange={() => toggle(generators, setGenerators, m.id)}
                        disabled={isLoading || isDisabled}
                        aria-label={`Generate with ${m.label}`}
                      />
                      <span className="text-sm text-base-content truncate">
                        {m.label}
                        {isDisabled && <span className="ml-2 text-xs text-error">(No file support)</span>}
                      </span>
                    </label>
                    <span className="ml-3 text-sm tabular-nums text-base-content/80">{getDollarSigns(MODEL_COST[m.id])}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="bg-base-200 border border-base-300 rounded-xl p-4 flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-semibold text-base-content">Judge with:</h3>
              <div className="space-x-2 text-sm">
                <button type="button" className="link" onClick={() => selectAll(setJudges)}>Select all</button>
                <span className="text-gray-300">|</span>
                <button type="button" className="link" onClick={() => selectNone(setJudges)}>None</button>
              </div>
            </div>
            <ul className="divide-y divide-base-300">
              {SORTED_MODELS.map(m => {
                const isDisabled = file && !VISION_ENABLED_MODELS.has(m.id);
                return (
                  <li key={m.id} className={`flex items-center justify-between py-2 px-2 rounded-md ${judges.includes(m.id) ? 'bg-secondary/10' : ''} ${isDisabled ? 'opacity-50' : ''}`}>
                    <label className={`flex items-center gap-2 w-full ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={judges.includes(m.id)}
                        onChange={() => toggle(judges, setJudges, m.id)}
                        disabled={isLoading || isDisabled}
                        aria-label={`Judge with ${m.label}`}
                      />
                      <span className="text-sm text-base-content truncate">
                        {m.label}
                        {isDisabled && <span className="ml-2 text-xs text-error">(No file support)</span>}
                      </span>
                    </label>
                    <span className="ml-3 text-sm tabular-nums text-base-content/80">{getDollarSigns(MODEL_COST[m.id])}</span>
                  </li>
                );
              })}
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