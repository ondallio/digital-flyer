import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRequests from './pages/admin/AdminRequests';
import AdminVendors from './pages/admin/AdminVendors';
import AdminVendorDetail from './pages/admin/AdminVendorDetail';
import AdminTickets from './pages/admin/AdminTickets';
import ManagerEdit from './pages/manager/ManagerEdit';
import PublicFlyer from './pages/public/PublicFlyer';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="requests" element={<AdminRequests />} />
        <Route path="vendors" element={<AdminVendors />} />
        <Route path="vendors/:id" element={<AdminVendorDetail />} />
        <Route path="tickets" element={<AdminTickets />} />
      </Route>

      {/* Manager Edit Route */}
      <Route path="/edit/:token" element={<ManagerEdit />} />

      {/* Public Flyer Route */}
      <Route path="/s/:slug" element={<PublicFlyer />} />

      {/* Root redirect to admin */}
      <Route path="/" element={<Navigate to="/admin" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

