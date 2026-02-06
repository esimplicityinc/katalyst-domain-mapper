import { useState } from 'react';
import { Key, AlertCircle, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { api } from '../api/client';

interface ApiKeyPromptProps {
  onConfigured: () => void;
  onSkip: () => void;
}

export function ApiKeyPrompt({ onConfigured, onSkip }: ApiKeyPromptProps) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = apiKey.trim();
    if (!trimmed) {
      setError('Please enter an API key');
      return;
    }

    if (!trimmed.startsWith('sk-ant-')) {
      setError('Key should start with sk-ant-');
      return;
    }

    setSubmitting(true);
    try {
      await api.setApiKey(trimmed);
      onConfigured();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set API key');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <Key className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Set Up Scanner
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            An Anthropic API key is needed to run FOE scans. You can still upload
            and view existing reports without one.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Anthropic API Key
            </label>
            <div className="relative">
              <input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError(null);
                }}
                placeholder="sk-ant-..."
                autoFocus
                className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              The key is stored in memory only and never persisted to disk.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors text-sm"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Key className="w-4 h-4" />
            )}
            {submitting ? 'Configuring...' : 'Save & Continue'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onSkip}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Skip for now
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            You can still upload reports manually
          </p>
        </div>
      </div>
    </div>
  );
}
