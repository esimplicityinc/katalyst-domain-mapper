import { useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";

export interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface SubNavTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function SubNavTabs({ tabs, activeTab, onTabChange }: SubNavTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!tabsRef.current?.contains(document.activeElement)) return;

      const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
      let newIndex = currentIndex;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      }

      if (newIndex !== currentIndex) {
        onTabChange(tabs[newIndex].id);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [tabs, activeTab, onTabChange]);

  return (
    <div
      ref={tabsRef}
      className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6"
      role="tablist"
      aria-label="Project navigation tabs"
    >
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              data-testid={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ${
                isActive
                  ? "border-blue-500 text-blue-600 dark:text-blue-400 font-bold"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
