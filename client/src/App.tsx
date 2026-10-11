import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { ReportPage } from './pages/ReportPage';
import { EvidencePage } from './pages/EvidencePage';
import { VerificationWorkbenchPage } from './pages/VerificationWorkbenchPage';
import { PreventionLabPage } from './pages/PreventionLabPage';
import { ActionBoardPage } from './pages/ActionBoardPage';
import { AdminPage } from './pages/AdminPage';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Core Platform Routes within Shell */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route path="/incidents/:id" element={<IncidentDetailPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/evidence" element={<EvidencePage />} />
            <Route path="/verification" element={<VerificationWorkbenchPage />} />
            <Route path="/prevention" element={<PreventionLabPage />} />
            <Route path="/actions" element={<ActionBoardPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
