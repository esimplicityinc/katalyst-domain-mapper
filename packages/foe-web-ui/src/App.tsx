import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ReportsPage } from './pages/ReportsPage';
import { DomainMapperPage } from './pages/DomainMapperPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/reports" replace />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="mapper/*" element={<DomainMapperPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
