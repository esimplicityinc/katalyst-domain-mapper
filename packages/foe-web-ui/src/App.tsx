import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ReportsPage } from './pages/ReportsPage';
import { DomainMapperPage } from './pages/DomainMapperPage';
import { GovernanceDashboard } from './pages/GovernanceDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/reports" replace />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="mapper/*" element={<DomainMapperPage />} />
          <Route path="governance" element={<GovernanceDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
