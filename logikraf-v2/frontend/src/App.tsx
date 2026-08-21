import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Public Pages
import HomePage from './pages/public/HomePage'

const PortfolioPage = lazy(() => import('./pages/public/PortfolioPage'))
const PortfolioDetailPage = lazy(() => import('./pages/public/PortfolioDetailPage'))
const BlogPage = lazy(() => import('./pages/public/BlogPage'))
const BlogDetailPage = lazy(() => import('./pages/public/BlogDetailPage'))
const AboutPage = lazy(() => import('./pages/public/AboutPage'))
const ContactPage = lazy(() => import('./pages/public/ContactPage'))
const PackagesPage = lazy(() => import('./pages/public/PackagesPage'))
const SearchPage = lazy(() => import('./pages/public/SearchPage'))
const TermsPage = lazy(() => import('./pages/public/TermsPage'))
const PrivacyPage = lazy(() => import('./pages/public/PrivacyPage'))
const RefundPolicyPage = lazy(() => import('./pages/public/RefundPolicyPage'))
const FaqPage = lazy(() => import('./pages/public/FaqPage'))

// Admin Components & Pages (Lazy Loaded)
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const AdminResourcePage = lazy(() => import('./components/admin/AdminResourcePage'))
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminPaymentHubPage = lazy(() => import('./pages/admin/PaymentHubPage'))
const AdminTenantPaymentAccountsPage = lazy(() => import('./pages/admin/TenantPaymentAccountsPage'))
const AdminPaymentLedgerPage = lazy(() => import('./pages/admin/PaymentLedgerPage'))
const AdminReconciliationPage = lazy(() => import('./pages/admin/ReconciliationPage'))
const AdminSettingsPage = lazy(() => import('./pages/admin/SettingsPage'))
const AdminReportsPage = lazy(() => import('./pages/admin/ReportsPage'))

// Client Pages (Lazy Loaded)
const ClientLayout = lazy(() => import('./components/client/ClientLayout'))
const ClientDashboardPage = lazy(() => import('./pages/client/ClientDashboardPage'))
const ClientOrdersPage = lazy(() => import('./pages/client/ClientOrdersPage'))
const ClientProfilePage = lazy(() => import('./pages/client/ClientProfilePage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth()
  if (loading) return <PageLoader />
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
    <Suspense fallback={<PageLoader />}>
      <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/portfolio/:slug" element={<PortfolioDetailPage />} />
      <Route path="/paket" element={<PackagesPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogDetailPage />} />
      <Route path="/tentang-kami" element={<AboutPage />} />
      <Route path="/kontak" element={<ContactPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/syarat-ketentuan" element={<TermsPage />} />
      <Route path="/kebijakan-privasi" element={<PrivacyPage />} />
      <Route path="/kebijakan-refund" element={<RefundPolicyPage />} />
      <Route path="/faq" element={<FaqPage />} />
      {/* Admin */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={
        <ProtectedRoute><RequireAdmin><AdminLayout /></RequireAdmin></ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
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
    </Suspense>
  )
}
