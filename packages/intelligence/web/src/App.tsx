import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";

// Legacy pages (will be nested under lifecycle stages)
import { ReportsPage } from "./pages/ReportsPage";
import { DomainMapperPage } from "./pages/DomainMapperPage";
import { GovernanceDashboard } from "./pages/GovernanceDashboard";

// FOE Project Browser pages
import { FOEProjectListPage, FOEProjectDetailPage } from "./pages/reports";

// Lifecycle pages
import { StrategyPage } from "./pages/lifecycle/StrategyPage";
import { DiscoveryPage } from "./pages/lifecycle/DiscoveryPage";
import { PlanningPage } from "./pages/lifecycle/PlanningPage";
import { DesignPage } from "./pages/lifecycle/DesignPage";
import { TestingPage } from "./pages/lifecycle/TestingPage";
import { AutomationPage } from "./pages/lifecycle/AutomationPage";
import { HistoryPage } from "./pages/lifecycle/HistoryPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Default route - redirect to Business Domain */}
          <Route index element={<Navigate to="/design/business-domain" replace />} />

          {/* 7 Lifecycle Stage Routes */}
          <Route path="strategy" element={<StrategyPage />} />
          <Route path="discovery" element={<DiscoveryPage />} />
          <Route path="planning" element={<PlanningPage />} />
          <Route path="design" element={<DesignPage />} />
          <Route path="testing" element={<TestingPage />} />
          <Route path="automation" element={<AutomationPage />} />
          <Route path="history" element={<HistoryPage />} />

          {/* Design tools under /design */}
          <Route path="design/business-domain/*" element={<DomainMapperPage />} />

          {/* Strategy tools under /strategy (Governance) */}
          <Route path="strategy/foe-scanner" element={<ReportsPage />} />
          <Route path="strategy/governance" element={<GovernanceDashboard />} />

          {/* FOE Project Browser under /reports */}
          <Route path="reports/projects" element={<FOEProjectListPage />} />
          <Route path="reports/projects/:repositoryId/*" element={<FOEProjectDetailPage />} />

          {/* Legacy redirects (backward compatibility) */}
          <Route path="reports" element={<Navigate to="/strategy/foe-scanner" replace />} />
          <Route path="testing/reports" element={<Navigate to="/strategy/foe-scanner" replace />} />
          <Route path="mapper/*" element={<Navigate to="/design/business-domain" replace />} />
          <Route path="design/mapper/*" element={<Navigate to="/design/business-domain" replace />} />
          <Route path="governance" element={<Navigate to="/strategy/governance" replace />} />

          {/* 404 catch-all - redirect to Business Domain */}
          <Route path="*" element={<Navigate to="/design/business-domain" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
