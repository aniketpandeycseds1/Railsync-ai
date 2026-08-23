import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';

// Layout
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RequestsPage } from './pages/RequestsPage';
import { SubmitRequestPage } from './pages/SubmitRequestPage';
import { NetworkPage } from './pages/NetworkPage';
import { OptimizerPage } from './pages/OptimizerPage';
import { BlockPlansPage } from './pages/BlockPlansPage';
import { ConflictsPage } from './pages/ConflictsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AssistantPage } from './pages/AssistantPage';
import { SettingsPage } from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  const user = useStore((s) => s.user);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="requests/new" element={<SubmitRequestPage />} />
          <Route path="network" element={<NetworkPage />} />
          <Route path="optimizer" element={<OptimizerPage />} />
          <Route path="blocks" element={<BlockPlansPage />} />
          <Route path="conflicts" element={<ConflictsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="assistant" element={<AssistantPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
