import { useState, useEffect, useCallback } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  NavLink,
  Outlet,
  Navigate,
} from 'react-router';
import {
  Target,
  Layers,
  Network,
  Building2,
  Users,
  UserCheck,
  Grid3X3,
  FolderKanban,
  Shield,
  GitBranch,
  TreePine,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Inbox,
  Loader2,
  ChevronsUpDown,
  MessageSquare,
  Sun,
  Moon,
} from 'lucide-react';
import {
  Card,
  CardContent,
} from '@databricks/appkit-ui/react';
import { DomainModelProvider, useDomainModel } from './context/DomainModelContext';
import { api } from './api/client';
import { ContextMapView } from './components/domain/ContextMapView';
import { AggregateTreeView } from './components/domain/AggregateTreeView';
import { EventFlowView } from './components/domain/EventFlowView';
import { ValueObjectView } from './components/domain/ValueObjectView';
import { GlossaryView } from './components/domain/GlossaryView';
import { WorkflowView } from './components/domain/WorkflowView';
import { ContributionPanel } from './components/ContributionPanel';
import { PlaceholderPage } from './pages/PlaceholderPage';

// ── Navigation items (mirrors source Layout.tsx) ────────────────────────

const NAV_ITEMS = [
  {
    to: '/design',
    label: 'Design',
    icon: Layers,
    description: 'Architecture & models',
    children: [
      { to: '/design/business-domain', label: 'Business Domain', icon: Network, description: 'Model domains & contexts' },
      { to: '/design/architecture', label: 'Architecture', icon: Building2, description: 'Taxonomy system hierarchy' },
      { to: '/design/user-types', label: 'User Types & Stories', icon: Users, description: 'User types & coverage' },
    ],
  },
  {
    to: '/organization',
    label: 'Organization',
    icon: Building2,
    description: 'Teams, people & adoption',
    children: [
      { to: '/organization/overview', label: 'Overview', icon: Network, description: 'Organization map' },
      { to: '/organization/teams', label: 'Teams', icon: Users, description: 'Team profiles' },
      { to: '/organization/people', label: 'People', icon: UserCheck, description: 'Competency profiles' },
      { to: '/organization/adoption', label: 'Adoption', icon: Grid3X3, description: 'Practice heatmap' },
    ],
  },
  {
    to: '/strategy',
    label: 'Strategy',
    icon: Target,
    description: 'Goals & governance',
    children: [
      { to: '/strategy/foe-projects', label: 'FOE Projects', icon: FolderKanban, description: 'Flow Optimized Engineering' },
      { to: '/strategy/governance', label: 'Governance', icon: Shield, description: 'NFRs & metrics' },
      { to: '/strategy/journeys', label: 'User Type Journeys', icon: GitBranch, description: 'User-to-team traceability' },
      { to: '/strategy/outcomes', label: 'Outcome Traceability', icon: TreePine, description: 'Contribution chains' },
    ],
  },
];

// ── Business Domain sub-tabs ────────────────────────────────────────────

const DOMAIN_TABS = [
  { to: '/design/business-domain', label: 'Context Map', end: true },
  { to: '/design/business-domain/aggregates', label: 'Aggregates' },
  { to: '/design/business-domain/events', label: 'Events' },
  { to: '/design/business-domain/value-objects', label: 'Value Objects' },
  { to: '/design/business-domain/glossary', label: 'Glossary' },
  { to: '/design/business-domain/workflows', label: 'Workflows' },
];

// ── Model Switcher ──────────────────────────────────────────────────────

function ModelSwitcher() {
  const { models, activeModelId, setActiveModelId, loading } = useDomainModel();
  const [open, setOpen] = useState(false);

  if (models.length <= 1) return null;

  const active = models.find((m) => m.id === activeModelId);

  return (
    <div className="relative px-3 mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-foreground bg-muted/50 border border-border rounded-md hover:bg-muted transition-colors"
      >
        <span className="truncate">{loading ? 'Loading…' : active?.name ?? 'Select model'}</span>
        <ChevronsUpDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-3 right-3 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 py-1 max-h-60 overflow-y-auto">
            {models.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setActiveModelId(m.id);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${
                  m.id === activeModelId ? 'bg-accent font-medium' : ''
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Sidebar navigation ──────────────────────────────────────────────────

function Sidebar({
  open,
  onClose,
  onOpenContributions,
}: {
  open: boolean;
  onClose: () => void;
  onOpenContributions: () => void;
}) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const stored = localStorage.getItem('bard-sidebar-expanded');
    if (stored) try { return JSON.parse(stored); } catch { /* ignore */ }
    return { '/design': true, '/organization': true, '/strategy': true };
  });

  useEffect(() => {
    localStorage.setItem('bard-sidebar-expanded', JSON.stringify(expandedSections));
  }, [expandedSections]);

  const toggle = (path: string) =>
    setExpandedSections((prev) => ({ ...prev, [path]: !prev[path] }));

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border
        flex flex-col transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0 md:flex-shrink-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Logo */}
      <div className="px-4 py-4 border-b border-sidebar-border flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-sidebar-foreground leading-tight">
            Katalyst Bard
          </h1>
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-muted-foreground">Business Domain</p>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-warning/20 text-warning leading-none">
              Alpha
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Model Switcher */}
      <div className="pt-3">
        <ModelSwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-3 overflow-y-auto">
        {NAV_ITEMS.map((section) => (
          <div key={section.to}>
            <div className="flex items-center gap-1">
              {section.children && (
                <button
                  onClick={() => toggle(section.to)}
                  className="p-1 rounded hover:bg-sidebar-accent"
                  aria-label={expandedSections[section.to] ? 'Collapse' : 'Expand'}
                >
                  {expandedSections[section.to] ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              )}
              <NavLink
                to={section.to}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-primary'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`
                }
              >
                <section.icon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div>{section.label}</div>
                  <div className="text-xs font-normal text-muted-foreground">
                    {section.description}
                  </div>
                </div>
              </NavLink>
            </div>

            {section.children && expandedSections[section.to] && (
              <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-border pl-2">
                {section.children.map((child) => (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-primary'
                          : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                      }`
                    }
                  >
                    <child.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{child.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-sidebar-border space-y-2">
        <button
          onClick={onOpenContributions}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <Inbox className="w-4 h-4" />
          Contributions
        </button>
        <p className="text-xs text-muted-foreground px-3">
          Flow Optimized Engineering
        </p>
      </div>
    </aside>
  );
}

// ── Wrapper components (bridge context hook → view props) ───────────────

function ContextMapWrapper() {
  const { model, refresh } = useDomainModel();
  if (!model) return null;
  return <ContextMapView model={model} onModelUpdated={refresh} />;
}

function AggregateTreeWrapper() {
  const { model, refresh } = useDomainModel();
  if (!model) return null;
  return <AggregateTreeView model={model} onModelUpdated={refresh} />;
}

function EventFlowWrapper() {
  const { model, refresh } = useDomainModel();
  if (!model) return null;
  return <EventFlowView model={model} onModelUpdated={refresh} />;
}

function ValueObjectWrapper() {
  const { model, refresh } = useDomainModel();
  if (!model) return null;
  return <ValueObjectView model={model} onModelUpdated={refresh} />;
}

function GlossaryWrapper() {
  const { model, refresh } = useDomainModel();
  if (!model) return null;
  return <GlossaryView model={model} onModelUpdated={refresh} />;
}

function WorkflowWrapper() {
  const { model, refresh } = useDomainModel();
  if (!model) return null;
  return <WorkflowView model={model} onModelUpdated={refresh} />;
}

// ── Business Domain Layout (with sub-tabs) ──────────────────────────────

function BusinessDomainLayout() {
  const { model, models, loading, error, setActiveModelId, refresh } = useDomainModel();
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const created = await api.createDomainModel({ name });
      setActiveModelId(created.id);
      setNewName('');
      refresh();
    } catch (e) {
      console.error('Failed to create model:', e);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // No models exist yet — show create prompt
  if (models.length === 0 || (!model && !error)) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <Card>
          <CardContent className="py-8 text-center space-y-4">
            <Network className="w-12 h-12 text-muted-foreground mx-auto" />
            <div>
              <p className="font-medium mb-1">No domain models yet</p>
              <p className="text-sm text-muted-foreground">Create your first domain model to get started.</p>
            </div>
            <div className="flex gap-2 max-w-sm mx-auto">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. My Project"
                className="flex-1 px-3 py-2 border rounded-md text-sm bg-background"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                disabled={creating}
              />
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error loading a specific model (but models exist)
  if (error && models.length > 0) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <Card>
          <CardContent className="py-8 text-center space-y-4">
            <p className="text-destructive font-medium">Failed to load domain model</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => { setActiveModelId(models[0].id); refresh(); }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
            >
              Switch to {models[0].name}
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive font-medium mb-2">Failed to load domain model</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <Card>
          <CardContent className="py-8 text-center">
            <Network className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No domain model selected. Create one first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Sub-tab navigation */}
      <div className="border-b border-border bg-background px-6 pt-2">
        <nav className="flex gap-0.5 -mb-px">
          {DOMAIN_TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

// ── Root Layout ─────────────────────────────────────────────────────────

function RootLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contribOpen, setContribOpen] = useState(false);
  const [contribMode, setContribMode] = useState<'queue' | 'chat'>('queue');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('katalyst-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('katalyst-theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    // AppKit uses :root:not(.light) for media-query dark mode.
    // We must add .light explicitly to override when user picks light mode.
    document.documentElement.classList.toggle('light', !darkMode);
  }, [darkMode]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenContributions={() => setContribOpen(true)}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-background border-b border-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-foreground hover:bg-muted"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold text-foreground">Katalyst Bard</span>
          <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-warning/20 text-warning leading-none">
            Alpha
          </span>
          <div className="flex-1" />
          <button
            onClick={() => { setContribMode('chat'); setContribOpen(true); }}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="AI Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setContribMode('queue'); setContribOpen(true); }}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="Contributions"
          >
            <Inbox className="w-5 h-5" />
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Desktop top bar */}
        <div className="hidden md:flex items-center justify-end gap-2 px-4 py-2 bg-background border-b border-border">
          <button
            onClick={() => { setContribMode('chat'); setContribOpen(true); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            AI Chat
          </button>
          <div className="w-px h-5 bg-border" />
          <button
            onClick={() => { setContribMode('queue'); setContribOpen(true); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Inbox className="w-4 h-4" />
            Contributions
          </button>
          <div className="w-px h-5 bg-border" />
          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Routed content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Contribution Panel */}
      <ContributionPanel
        open={contribOpen}
        onClose={() => setContribOpen(false)}
        initialTab={contribMode}
      />
    </div>
  );
}

// ── Router ──────────────────────────────────────────────────────────────

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Default redirect
      { index: true, element: <Navigate to="/design/business-domain" replace /> },

      // Design section
      {
        path: 'design',
        children: [
          { index: true, element: <Navigate to="/design/business-domain" replace /> },
          {
            path: 'business-domain',
            element: <BusinessDomainLayout />,
            children: [
              { index: true, element: <ContextMapWrapper /> },
              { path: 'aggregates', element: <AggregateTreeWrapper /> },
              { path: 'events', element: <EventFlowWrapper /> },
              { path: 'value-objects', element: <ValueObjectWrapper /> },
              { path: 'glossary', element: <GlossaryWrapper /> },
              { path: 'workflows', element: <WorkflowWrapper /> },
            ],
          },
          { path: 'architecture', element: <PlaceholderPage title="Architecture" description="Taxonomy system hierarchy. Coming in a future release." /> },
          { path: 'user-types', element: <PlaceholderPage title="User Types & Stories" description="User types, stories, and coverage tracking. Coming in a future release." /> },
        ],
      },

      // Organization section
      {
        path: 'organization',
        children: [
          { index: true, element: <Navigate to="/organization/overview" replace /> },
          { path: 'overview', element: <PlaceholderPage title="Organization Overview" description="Organization map graph. Coming in a future release." /> },
          { path: 'teams', element: <PlaceholderPage title="Teams" description="Team profiles & systems. Coming in a future release." /> },
          { path: 'people', element: <PlaceholderPage title="People" description="Competency profiles. Coming in a future release." /> },
          { path: 'adoption', element: <PlaceholderPage title="Adoption" description="Practice area heatmap. Coming in a future release." /> },
        ],
      },

      // Strategy section
      {
        path: 'strategy',
        children: [
          { index: true, element: <Navigate to="/strategy/foe-projects" replace /> },
          { path: 'foe-projects', element: <PlaceholderPage title="FOE Projects" description="Flow Optimized Engineering projects. Coming in a future release." /> },
          { path: 'governance', element: <PlaceholderPage title="Governance Dashboard" description="NFRs & governance metrics. Coming in a future release." /> },
          { path: 'journeys', element: <PlaceholderPage title="User Type Journeys" description="User-to-team traceability. Coming in a future release." /> },
          { path: 'outcomes', element: <PlaceholderPage title="Outcome Traceability" description="Contribution-to-outcome chains. Coming in a future release." /> },
        ],
      },
    ],
  },
]);

// ── App entrypoint ──────────────────────────────────────────────────────

export default function App() {
  return (
    <DomainModelProvider>
      <RouterProvider router={router} />
    </DomainModelProvider>
  );
}
