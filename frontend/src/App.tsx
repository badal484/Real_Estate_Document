import { Navigate, Route, Routes } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { UploadPage } from '@/pages/UploadPage';
import { DealsPage } from '@/pages/DealsPage';
import { DealDetailPage } from '@/pages/DealDetailPage';
import { ReviewPage } from '@/pages/ReviewPage';
import { AuditPage } from '@/pages/AuditPage';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Navigate to="/upload" replace />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/deals/:id" element={<DealDetailPage />} />
          <Route path="/deals/:id/review" element={<ReviewPage />} />
          <Route path="/audit" element={<AuditPage />} />
        </Routes>
      </main>
    </>
  );
}
