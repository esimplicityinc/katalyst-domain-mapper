import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ContributionProvider } from "./components/contribution/ContributionProvider";
import { PageContextProvider } from "./components/contribution/PageContextProvider";

// Legacy pages (will be nested under lifecycle stages)
import { DomainMapperPage } from "./pages/DomainMapperPage";
import { GovernanceDashboard } from "./pages/GovernanceDashboard";

// FOE Project Browser pages
import { FOEProjectsPage } from "./pages/FOEProjectsPage";

// Lifecycle pages
import { StrategyPage } from "./pages/lifecycle/StrategyPage";
import { DiscoveryPage } from "./pages/lifecycle/DiscoveryPage";
import { PlanningPage } from "./pages/lifecycle/PlanningPage";
import { DesignPage } from "./pages/lifecycle/DesignPage";
import { TestingPage } from "./pages/lifecycle/TestingPage";
import { AutomationPage } from "./pages/lifecycle/AutomationPage";
import { HistoryPage } from "./pages/lifecycle/HistoryPage";

// Design tools under /design
import { BusinessLandscapePage } from "./pages/BusinessLandscapePage";
import { ArchitecturePage } from "./pages/ArchitecturePage";
import { UserTypesPage } from "./pages/UserTypesPage";

// Organization pages (ROAD-049)
import { OrganizationPage } from "./pages/lifecycle/OrganizationPage";
import { TeamsPage } from "./pages/organization/TeamsPage";
import { PeoplePage } from "./pages/organization/PeoplePage";
import { AdoptionPage } from "./pages/organization/AdoptionPage";

// Value Streams pages (ROAD-049)
import { UserTypeJourneyPage } from "./pages/strategy/UserTypeJourneyPage";
import { OutcomeTraceabilityPage } from "./pages/strategy/OutcomeTraceabilityPage";

function App() {
  return (
    <BrowserRouter>
      <PageContextProvider>
      <ContributionProvider>
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

          {/* Organization section (ROAD-049) */}
          <Route path="organization" element={<OrganizationPage />} />
          <Route path="organization/overview" element={<OrganizationPage />} />
          <Route path="organization/teams/*" element={<TeamsPage />} />
          <Route path="organization/people/*" element={<PeoplePage />} />
          <Route path="organization/adoption" element={<AdoptionPage />} />

          {/* Design tools under /design */}
          <Route path="design/business-domain/*" element={<DomainMapperPage />} />
          <Route path="design/business-landscape/:domainModelId" element={<BusinessLandscapePage />} />
          <Route path="design/architecture/*" element={<ArchitecturePage />} />
          <Route path="design/user-types/*" element={<UserTypesPage />} />

          {/* Strategy tools under /strategy */}
          <Route path="strategy/foe-projects/*" element={<FOEProjectsPage />} />
          <Route path="strategy/governance" element={<GovernanceDashboard />} />
          <Route path="strategy/value-streams/journeys" element={<UserTypeJourneyPage />} />
          <Route path="strategy/value-streams/outcomes" element={<OutcomeTraceabilityPage />} />

          {/* Legacy redirects (backward compatibility) */}
          <Route path="strategy/foe-scanner" element={<Navigate to="/strategy/foe-projects/scanner" replace />} />
          <Route path="reports" element={<Navigate to="/strategy/foe-projects/scanner" replace />} />
          <Route path="reports/projects" element={<Navigate to="/strategy/foe-projects" replace />} />
          <Route path="testing/reports" element={<Navigate to="/strategy/foe-projects/scanner" replace />} />
          <Route path="mapper/*" element={<Navigate to="/design/business-domain" replace />} />
          <Route path="design/mapper/*" element={<Navigate to="/design/business-domain" replace />} />
          <Route path="governance" element={<Navigate to="/strategy/governance" replace />} />

          {/* 404 catch-all - redirect to Business Domain */}
          <Route path="*" element={<Navigate to="/design/business-domain" replace />} />
        </Route>
        </Routes>
      </ContributionProvider>
      </PageContextProvider>
    </BrowserRouter>
  );
}

export default App;
