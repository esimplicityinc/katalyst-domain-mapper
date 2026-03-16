/**
 * UserTypesPage
 *
 * Tabbed page under /design/user-types/*
 * Tabs: User Types (list/grid), Stories (kanban board)
 */

import { useState, useEffect, useRef } from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import { Users, BookOpen, Loader2 } from "lucide-react";
import { api } from "../api/client";
import { UserTypeListView } from "../components/user-types/UserTypeListView";
import { UserStoryBoardView } from "../components/user-types/UserStoryBoardView";
import { usePageContextWriter } from "../components/contribution/PageContextProvider";
import type { ManagedUserType } from "../types/taxonomy-management";
// Chat tab removed — now handled by the global ContributionPanel

const SUB_NAV = [
  { to: "/design/user-types/list", label: "User Types", icon: Users },
  { to: "/design/user-types/stories", label: "Stories", icon: BookOpen },
];

export function UserTypesPage() {
  const [userTypesList, setUserTypesList] = useState<ManagedUserType[]>([]);
  const [storyCount, setStoryCount] = useState(0);
  const [capabilityCount, setCapabilityCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const initialLoadDone = useRef(false);
  const { setPageContext } = usePageContextWriter();

  // Publish page context for ContributionChat preamble
  useEffect(() => {
    setPageContext({
      currentPage: "user-types",
      userTypeCount: userTypesList.length,
      userStoryCount: storyCount,
      capabilityCount,
      userTypes: userTypesList.map((ut) => ({
        id: ut.id,
        name: ut.name,
        archetype: ut.archetype,
        status: ut.status,
      })),
    });
  }, [userTypesList, storyCount, capabilityCount, setPageContext]);

  const refresh = async () => {
    try {
      const [userTypes, stories, caps] = await Promise.allSettled([
        api.listUserTypes(),
        api.listUserStories(),
        api.listCapabilities(),
      ]);
      if (userTypes.status === "fulfilled") setUserTypesList(userTypes.value);
      if (stories.status === "fulfilled") setStoryCount(stories.value.length);
      if (caps.status === "fulfilled") setCapabilityCount(caps.value.length);
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
            Loading user types &amp; stories...
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
                User Types &amp; Stories
              </h1>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 ml-2">
              <span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {userTypesList.length}
                </span>{" "}
                user types
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
        </div>
      </header>

      {/* Sub-route content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<Navigate to="list" replace />} />
          <Route path="list" element={<UserTypeListView />} />
          <Route path="stories" element={<UserStoryBoardView />} />
        </Routes>
      </div>
    </div>
  );
}
