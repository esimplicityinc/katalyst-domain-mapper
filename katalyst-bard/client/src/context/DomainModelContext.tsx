/**
 * DomainModelProvider — Manages the active domain model.
 *
 * Stores the selected domain model ID in localStorage.
 * Provides the full model (with all artifacts) to child components
 * and a refresh callback to re-fetch after mutations.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { api } from '../api/client';
import type { DomainModel, DomainModelFull } from '../types/domain';

const STORAGE_KEY = 'katalyst-bard:active-domain-model-id';

interface DomainModelContextValue {
  /** All available domain models (for the switcher) */
  models: DomainModel[];
  /** The full active model with all artifacts, or null if loading */
  model: DomainModelFull | null;
  /** The active model ID */
  activeModelId: string | null;
  /** Switch to a different model */
  setActiveModelId: (id: string) => void;
  /** Re-fetch the active model (call after any mutation) */
  refresh: () => void;
  /** True while loading */
  loading: boolean;
  /** Error message, if any */
  error: string | null;
}

const DomainModelContext = createContext<DomainModelContextValue | null>(null);

export function DomainModelProvider({ children }: { children: ReactNode }) {
  const [models, setModels] = useState<DomainModel[]>([]);
  const [model, setModel] = useState<DomainModelFull | null>(null);
  const [activeModelId, setActiveModelIdState] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY) ?? null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Persist selection
  const setActiveModelId = useCallback((id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    setActiveModelIdState(id);
  }, []);

  // Load model list on mount
  useEffect(() => {
    let cancelled = false;
    api
      .listDomainModels()
      .then((list) => {
        if (cancelled) return;
        setModels(list);
        // Auto-select first model if none selected or stored ID not in list
        if (list.length > 0) {
          const storedExists = activeModelId && list.some((m) => m.id === activeModelId);
          if (!storedExists) {
            setActiveModelId(list[0].id);
          }
        } else if (activeModelId) {
          // No models exist — clear stale localStorage
          localStorage.removeItem(STORAGE_KEY);
          setActiveModelIdState(null);
          setLoading(false);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load models');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load full model when active ID changes
  const loadModel = useCallback(async () => {
    if (!activeModelId) {
      setModel(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const full = await api.getDomainModel(activeModelId);
      setModel(full);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load domain model'
      );
      setModel(null);
    } finally {
      setLoading(false);
    }
  }, [activeModelId]);

  useEffect(() => {
    loadModel();
  }, [loadModel]);

  const refresh = useCallback(() => {
    loadModel();
  }, [loadModel]);

  return (
    <DomainModelContext.Provider
      value={{
        models,
        model,
        activeModelId,
        setActiveModelId,
        refresh,
        loading,
        error,
      }}
    >
      {children}
    </DomainModelContext.Provider>
  );
}

export function useDomainModel(): DomainModelContextValue {
  const ctx = useContext(DomainModelContext);
  if (!ctx) {
    throw new Error('useDomainModel must be used within DomainModelProvider');
  }
  return ctx;
}
