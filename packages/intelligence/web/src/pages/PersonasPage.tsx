/**
 * PersonasPage
 *
 * Tabbed page under /design/personas/*
 * Tabs: Personas (list/grid), Stories (kanban board), Chat (persona AI)
 */

import { useState, useEffect, useRef } from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import { Sparkles, Users, BookOpen, Loader2 } from "lucide-react";
import { api } from "../api/client";
import { PersonaListView } from "../components/personas/PersonaListView";
import { UserStoryBoardView } from "../components/personas/UserStoryBoardView";
import { PersonaChat } from "../components/personas/PersonaChat";

const SUB_NAV = [
  { to: "/design/personas/list", label: "Personas", icon: Users },
  { to: "/design/personas/stories", label: "Stories", icon: BookOpen },
];

const CHAT_NAV = { to: "/design/personas/chat", label: "Chat", icon: Sparkles };

export function PersonasPage() {
  const [personaCount, setPersonaCount] = useState(0);
  const [storyCount, setStoryCount] = useState(0);
  const [capabilityCount, setCapabilityCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const initialLoadDone = useRef(false);

  const refresh = async () => {
    try {
      const [personas, stories, capabilities] = await Promise.allSettled([
        api.listPersonas(),
        api.listUserStories(),
        api.listCapabilities(),
      ]);
      if (personas.status === "fulfilled") setPersonaCount(personas.value.length);
      if (stories.status === "fulfilled") setStoryCount(stories.value.length);
      if (capabilities.status === "fulfilled") setCapabilityCount(capabilities.value.length);
    } catch {
      // API may not be available
    }
  };

  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const init = async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    };
    init();
  }, []);  

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading personas &amp; stories...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                Personas &amp; Stories
              </h1>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 ml-2">
              <span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {personaCount}
                </span>{" "}
                personas
              </span>
              <span>&middot;</span>
              <span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {storyCount}
                </span>{" "}
                stories
              </span>
            </div>
          </div>
        </div>

        {/* Sub-navigation tabs */}
        <div className="px-4 sm:px-6 flex gap-1 overflow-x-auto">
          <div className="flex gap-1 flex-1">
            {SUB_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-brand-primary-500 text-brand-primary-600 dark:text-brand-primary-300"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Chat tab on the right */}
          <NavLink
            to={CHAT_NAV.to}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ml-auto ${
                isActive
                  ? "border-brand-accent-lavender text-brand-accent-lavender dark:text-brand-accent-lavender"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
              }`
            }
          >
            <CHAT_NAV.icon className="w-4 h-4" />
            <span>{CHAT_NAV.label}</span>
            <span className="text-xs text-brand-accent-steel opacity-70">(Powered by Prima)</span>
          </NavLink>
        </div>
      </header>

      {/* Sub-route content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<Navigate to="chat" replace />} />
          <Route
            path="chat"
            element={
              <PersonaChat
                personaCount={personaCount}
                storyCount={storyCount}
                capabilityCount={capabilityCount}
                onUpdated={refresh}
              />
            }
          />
          <Route path="list" element={<PersonaListView />} />
          <Route path="stories" element={<UserStoryBoardView />} />
        </Routes>
      </div>
    </div>
  );
}
