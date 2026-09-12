import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useEffect } from 'react'

// Public Pages
import HomePage from './pages/public/HomePage'
import PaymentQris from './pages/public/PaymentQris'

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
const VerifyEmailPage = lazy(() => import('./pages/client/VerifyEmailPage'))
const FaqPage = lazy(() => import('./pages/public/FaqPage'))

// Admin Components & Pages (Lazy Loaded)
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const AdminClientFilesPage = lazy(() => import('./pages/admin/ClientFilesAdminPage'))
const AdminTicketsPage = lazy(() => import('./pages/admin/AdminTicketsPage'))
const AdminResourcePage = lazy(() => import('./components/admin/AdminResourcePage'))
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminPaymentLedgerPage = lazy(() => import('./pages/admin/PaymentLedgerPage'))
const AdminSettingsPage = lazy(() => import('./pages/admin/SettingsPage'))
const AdminHeroStatsPage = lazy(() => import('./pages/admin/HeroStatsPage'))
const AdminPartnerPortalPage = lazy(() => import('./pages/admin/PartnerPortalPage'))
const AdminEmailSignaturePage = lazy(() => import('./pages/admin/EmailSignaturePage'))
const AdminPaymentGuidePage = lazy(() => import('./pages/admin/PaymentGuidePage'))
const AdminCronJobsPage = lazy(() => import('./pages/admin/CronJobsPage'))
// Client Pages (Lazy Loaded)
const ClientLayout = lazy(() => import('./components/client/ClientLayout'))
const ClientDashboardPage = lazy(() => import('./pages/client/ClientDashboardPage'))
const ClientOrdersPage = lazy(() => import('./pages/client/ClientOrdersPage'))
const ClientProfilePage = lazy(() => import('./pages/client/ClientProfilePage'))
const ClientFilesPage = lazy(() => import('./pages/client/ClientFilesPage'))
const ClientInvoicesPage = lazy(() => import('./pages/client/ClientInvoicesPage'))
const ClientTicketDetailPage = lazy(() => import('./pages/client/ClientTicketDetailPage'))
const ClientProgressPage = lazy(() => import('./pages/client/ClientProgressPage'))
const ClientPortalGate = lazy(() => import('./components/client/ClientPortalGate'))
const ClientLoginPage = lazy(() => import('./pages/client/ClientLoginPage'))
const ForgotPasswordPage = lazy(() => import('./pages/client/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/client/ResetPasswordPage'))
const ClientRegisterPage = lazy(() => import('./pages/client/ClientRegisterPage'))
const ClientTicketsPage = lazy(() => import('./pages/client/ClientTicketsPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// H1: Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth()
  const { pathname } = useLocation()
  if (loading) return <PageLoader />
  if (!token) {
    // Rute klien -> login klien (URL bersih di host portal), rute admin -> login admin.
    const to = pathname.startsWith('/client') ? '/client/login' : pathname.startsWith('/admin') ? '/admin/login' : '/login'
    return <Navigate to={to} replace />
  }
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

// H10: 404 page
function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas-light text-center p-6">
      <h1 className="font-display text-7xl font-black text-brand-primary mb-4">404</h1>
      <p className="text-xl font-semibold text-text-main mb-2">Halaman Tidak Ditemukan</p>
      <p className="text-text-muted mb-8 max-w-md">Halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
      <a href="/" className="btn-primary">Kembali ke Beranda</a>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ScrollToTop />
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
      <Route path="/pay/qris/:reference" element={<PaymentQris />} />
      {/* Admin */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={
        <ProtectedRoute><RequireAdmin><AdminLayout /></RequireAdmin></ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="partner-portal" element={<AdminPartnerPortalPage />} />
        <Route path="signature-email" element={<AdminEmailSignaturePage />} />
        <Route path="payment-guide" element={<AdminPaymentGuidePage />} />
        <Route path="cron" element={<AdminCronJobsPage />} />
        <Route path="payment-ledger" element={<AdminPaymentLedgerPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="hero-stats" element={<AdminHeroStatsPage />} />
        <Route path="client-files" element={<AdminClientFilesPage />} />
        <Route path="tickets" element={<AdminTicketsPage />} />
        {/* Generic CRUD resources: list / new / edit */}
        <Route path=":resource/new" element={<AdminResourcePage />} />
        <Route path=":resource/:id/edit" element={<AdminResourcePage />} />
        <Route path=":resource" element={<AdminResourcePage />} />
      </Route>
      {/* Client */}
      <Route path="/login" element={<ClientPortalGate><ClientLoginPage /></ClientPortalGate>} />
      <Route path="/register" element={<ClientPortalGate><ClientRegisterPage /></ClientPortalGate>} />
      <Route path="/forgot-password" element={<ClientPortalGate><ForgotPasswordPage /></ClientPortalGate>} />
      <Route path="/reset-password" element={<ClientPortalGate><ResetPasswordPage /></ClientPortalGate>} />
      <Route path="/verify-email" element={<ClientPortalGate><VerifyEmailPage /></ClientPortalGate>} />
      <Route path="/client/forgot-password" element={<ClientPortalGate><ForgotPasswordPage /></ClientPortalGate>} />
      <Route path="/client/reset-password" element={<ClientPortalGate><ResetPasswordPage /></ClientPortalGate>} />
      <Route path="/client/login" element={<ClientPortalGate><ClientLoginPage /></ClientPortalGate>} />
      <Route path="/client/register" element={<ClientPortalGate><ClientRegisterPage /></ClientPortalGate>} />
      <Route path="/client" element={
        <ClientPortalGate><ProtectedRoute><RequireClient><ClientLayout /></RequireClient></ProtectedRoute></ClientPortalGate>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ClientDashboardPage />} />
        <Route path="orders" element={<ClientOrdersPage />} />
        <Route path="tickets" element={<ClientTicketsPage />} />
        <Route path="tickets/:id" element={<ClientTicketDetailPage />} />
        <Route path="invoices" element={<ClientInvoicesPage />} />
        <Route path="progress" element={<ClientProgressPage />} />
        <Route path="profile" element={<ClientProfilePage />} />
      </Route>
      {/* Portal klien - URL bersih di host portal (client.logikraf.id/dashboard) */}
      <Route element={<ClientPortalGate><ProtectedRoute><RequireClient><ClientLayout /></RequireClient></ProtectedRoute></ClientPortalGate>}>
        <Route path="/dashboard" element={<ClientDashboardPage />} />
        <Route path="/orders" element={<ClientOrdersPage />} />
        <Route path="/tickets" element={<ClientTicketsPage />} />
        <Route path="/tickets/:id" element={<ClientTicketDetailPage />} />
        <Route path="/files" element={<ClientFilesPage />} />
        <Route path="/invoices" element={<ClientInvoicesPage />} />
        <Route path="/progress" element={<ClientProgressPage />} />
        <Route path="/profile" element={<ClientProfilePage />} />
      </Route>
      {/* H10: 404 catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </Suspense>
  )
}
