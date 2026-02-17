/**
 * Business Landscape Page
 * 
 * Visualizes the complete business landscape showing:
 * - Systems (from taxonomy)
 * - Bounded contexts
 * - Domain events flowing between systems
 * - Capabilities as ports on systems
 * - Workflows threading through systems
 * - Personas riding on capabilities
 */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { LandscapeGraph, LandscapePositions } from "../types/landscape.js";
import { ElkLayoutEngine } from "../utils/layout/ElkLayoutEngine.js";
import { LandscapeCanvas } from "../components/landscape/LandscapeCanvas";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function BusinessLandscapePage() {
  const { domainModelId } = useParams<{ domainModelId: string }>();
  const [graph, setGraph] = useState<LandscapeGraph | null>(null);
  const [positions, setPositions] = useState<LandscapePositions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layoutEngine] = useState(() => new ElkLayoutEngine());

  useEffect(() => {
    if (!domainModelId) return;

    const fetchLandscape = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch landscape graph from API
        const response = await fetch(`${API_BASE}/api/v1/landscape/${domainModelId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch landscape: ${response.statusText}`);
        }

        const landscapeGraph: LandscapeGraph = await response.json();
        setGraph(landscapeGraph);

        // Run layout engine
        const layoutPositions = await layoutEngine.layout(landscapeGraph);
        setPositions(layoutPositions);
      } catch (err: any) {
        setError(err.message || "Failed to load landscape");
      } finally {
        setLoading(false);
      }
    };

    fetchLandscape();
  }, [domainModelId, layoutEngine]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading business landscape...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
            Error Loading Landscape
          </h2>
          <p className="text-gray-700 dark:text-gray-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!graph || !positions) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">No landscape data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Business Landscape
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Domain Model: {domainModelId}
        </p>
        <div className="mt-2 flex gap-4 text-xs text-gray-500 dark:text-gray-500">
          <span>{graph.systems.length} systems</span>
          <span>•</span>
          <span>{graph.contexts.length} contexts</span>
          <span>•</span>
          <span>{graph.events.length} events</span>
          <span>•</span>
          <span>{graph.capabilities.length} capabilities</span>
          <span>•</span>
          <span>{graph.inferredSystems.length} inferred systems</span>
        </div>
      </div>

      {/* Canvas */}
      <LandscapeCanvas graph={graph} positions={positions} />
    </div>
  );
}
