import { Search, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface ProjectSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  debounceMs?: number;
}

export function ProjectSearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Search projects...",
  debounceMs = 300,
}: ProjectSearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<number | null>(null);

  // Sync external value changes to local state
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced onChange
  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = window.setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    // Cleanup on unmount or when localValue changes
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [localValue, debounceMs, onChange]);

  const handleClear = () => {
    setLocalValue("");
    onChange("");
    onClear?.();
  };

  return (
    <div className="relative" data-testid="project-search">
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
      </div>

      {/* Input */}
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search projects"
        className="
          block w-full pl-10 pr-10 py-2.5
          text-gray-900 dark:text-white
          placeholder-gray-500 dark:placeholder-gray-400
          bg-white dark:bg-gray-800
          border border-gray-300 dark:border-gray-600
          rounded-lg
          focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
          focus:border-transparent
          transition-colors
        "
      />

      {/* Clear Button */}
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="
            absolute inset-y-0 right-0 pr-3 flex items-center
            text-gray-400 dark:text-gray-500
            hover:text-gray-600 dark:hover:text-gray-300
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 rounded
          "
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
