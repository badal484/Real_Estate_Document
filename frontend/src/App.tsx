import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { LoginPage } from '@/pages/LoginPage';
import { UploadPage } from '@/pages/UploadPage';
import { DealsPage } from '@/pages/DealsPage';
import { DealDetailPage } from '@/pages/DealDetailPage';
import { ReviewPage } from '@/pages/ReviewPage';
import { AuditPage } from '@/pages/AuditPage';
import { NotificationSettingsPage } from '@/pages/NotificationSettingsPage';
import { AssistantPage } from '@/pages/AssistantPage';

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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/upload" replace /> : <LoginPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/upload" replace />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/deals/:id" element={<DealDetailPage />} />
        <Route path="/deals/:id/review" element={<ReviewPage />} />
        <Route path="/deals/:id/assistant" element={<AssistantPage />} />
        <Route path="/deals/:id/notifications" element={<NotificationSettingsPage />} />
        <Route path="/audit" element={<AuditPage />} />
      </Route>
    </Routes>
  );
}
