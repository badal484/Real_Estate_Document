import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { UploadPage } from '@/pages/UploadPage';
import { DealsPage } from '@/pages/DealsPage';
import { DealDetailPage } from '@/pages/DealDetailPage';
import { ReviewPage } from '@/pages/ReviewPage';
import { AuditPage } from '@/pages/AuditPage';
import { NotificationSettingsPage } from '@/pages/NotificationSettingsPage';
import { AssistantPage } from '@/pages/AssistantPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { DocsPage } from '@/pages/DocsPage';
import { PricingPage } from '@/pages/PricingPage';
import { ContractsLibraryPage } from '@/pages/ContractsLibraryPage';
import { SecurityPage } from '@/pages/SecurityPage';
import { LeadsPage } from '@/pages/LeadsPage';
import { LeadDetailPage } from '@/pages/LeadDetailPage';
import { PropertiesPage } from '@/pages/PropertiesPage';
import { KnowledgePage } from '@/pages/KnowledgePage';
import { OrganizationPage } from '@/pages/OrganizationPage';

function ProtectedLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-slate-200">
      {/* ── Atmospheric Ambient Lighting for Glassmorphism ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-sky-400/15 via-blue-500/10 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-indigo-400/12 via-slate-400/8 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 h-[550px] w-[550px] rounded-full bg-gradient-to-t from-teal-400/10 via-emerald-400/6 to-transparent blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.8) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/upload" replace /> : <LoginPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/leads/:id" element={<LeadDetailPage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/organization" element={<OrganizationPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/deals/:id" element={<DealDetailPage />} />
        <Route path="/deals/:id/review" element={<ReviewPage />} />
        <Route path="/deals/:id/assistant" element={<AssistantPage />} />
        <Route path="/deals/:id/notifications" element={<NotificationSettingsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contracts" element={<ContractsLibraryPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/audit" element={<AuditPage />} />
      </Route>
    </Routes>
  );
}
