import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import AdminLayout from './components/admin/AdminLayout'
import AdminResourcePage from './components/admin/AdminResourcePage'
import ClientLayout from './components/client/ClientLayout'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminPaymentHubPage from './pages/admin/PaymentHubPage'
import AdminTenantPaymentAccountsPage from './pages/admin/TenantPaymentAccountsPage'
import AdminPaymentLedgerPage from './pages/admin/PaymentLedgerPage'
import AdminReconciliationPage from './pages/admin/ReconciliationPage'
import AdminSettingsPage from './pages/admin/SettingsPage'
import AdminReportsPage from './pages/admin/ReportsPage'
import HomePage from './pages/public/HomePage'
import ServicesPage from './pages/public/ServicesPage'
import PortfolioDetailPage from './pages/public/PortfolioDetailPage'
import BlogPage from './pages/public/BlogPage'
import BlogDetailPage from './pages/public/BlogDetailPage'
import AboutPage from './pages/public/AboutPage'
import ContactPage from './pages/public/ContactPage'
import PackagesPage from './pages/public/PackagesPage'
import SearchPage from './pages/public/SearchPage'
import ClientDashboardPage from './pages/client/ClientDashboardPage'
import ClientOrdersPage from './pages/client/ClientOrdersPage'
import ClientProfilePage from './pages/client/ClientProfilePage'
import TermsPage from './pages/public/TermsPage'
import PrivacyPage from './pages/public/PrivacyPage'
import FaqPage from './pages/public/FaqPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (!token) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { role } = useAuth()
  if (role !== 'admin') return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

function RequireClient({ children }: { children: React.ReactNode }) {
  const { role } = useAuth()
  if (role !== 'client') return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/layanan" element={<ServicesPage />} />
      <Route path="/portfolio/:slug" element={<PortfolioDetailPage />} />
      <Route path="/paket" element={<PackagesPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogDetailPage />} />
      <Route path="/tentang-kami" element={<AboutPage />} />
      <Route path="/kontak" element={<ContactPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/syarat-ketentuan" element={<TermsPage />} />
      <Route path="/kebijakan-privasi" element={<PrivacyPage />} />
      <Route path="/faq" element={<FaqPage />} />
      {/* Admin */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={
        <ProtectedRoute><RequireAdmin><AdminLayout /></RequireAdmin></ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="time-tracking" element={<AdminResourcePage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="payment-hub" element={<AdminPaymentHubPage />} />
        <Route path="merchant-accounts" element={<AdminTenantPaymentAccountsPage />} />
        <Route path="payment-ledger" element={<AdminPaymentLedgerPage />} />
        <Route path="reconciliation" element={<AdminReconciliationPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        {/* Generic CRUD resources: list / new / edit */}
        <Route path=":resource/new" element={<AdminResourcePage />} />
        <Route path=":resource/:id/edit" element={<AdminResourcePage />} />
        <Route path=":resource" element={<AdminResourcePage />} />
      </Route>
      {/* Client */}
      <Route path="/client" element={
        <ProtectedRoute><RequireClient><ClientLayout /></RequireClient></ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ClientDashboardPage />} />
        <Route path="orders" element={<ClientOrdersPage />} />
        <Route path="profile" element={<ClientProfilePage />} />
      </Route>
    </Routes>
  )
}
