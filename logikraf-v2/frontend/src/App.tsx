import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import AdminLayout from './components/admin/AdminLayout'
import ClientLayout from './components/client/ClientLayout'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminServicesPage from './pages/admin/ServicesPage'
import AdminPortfoliosPage from './pages/admin/PortfoliosPage'
import AdminPackagesPage from './pages/admin/PackagesPage'
import AdminBlogPage from './pages/admin/BlogPage'
import AdminLeadsPage from './pages/admin/LeadsPage'
import AdminOrdersPage from './pages/admin/OrdersPage'
import AdminInvoicesPage from './pages/admin/InvoicesPage'
import AdminTransactionsPage from './pages/admin/TransactionsPage'
import AdminTimeTrackingPage from './pages/admin/TimeTrackingPage'
import AdminReportsPage from './pages/admin/ReportsPage'
import AdminPaymentHubPage from './pages/admin/PaymentHubPage'
import AdminTenantPaymentAccountsPage from './pages/admin/TenantPaymentAccountsPage'
import AdminPaymentLedgerPage from './pages/admin/PaymentLedgerPage'
import AdminReconciliationPage from './pages/admin/ReconciliationPage'
import AdminClientsPage from './pages/admin/ClientsPage'
import AdminTicketsPage from './pages/admin/TicketsPage'
import AdminSettingsPage from './pages/admin/SettingsPage'
import AdminTestimonialsPage from './pages/admin/TestimonialsPage'
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
				<Route path="services" element={<AdminServicesPage />} />
				<Route path="portfolios" element={<AdminPortfoliosPage />} />
				<Route path="packages" element={<AdminPackagesPage />} />
				<Route path="blog" element={<AdminBlogPage />} />
				<Route path="leads" element={<AdminLeadsPage />} />
				<Route path="orders" element={<AdminOrdersPage />} />
				<Route path="invoices" element={<AdminInvoicesPage />} />
				<Route path="transactions" element={<AdminTransactionsPage />} />
				<Route path="time-tracking" element={<AdminTimeTrackingPage />} />
				<Route path="reports" element={<AdminReportsPage />} />
				<Route path="payment-hub" element={<AdminPaymentHubPage />} />
				<Route path="merchant-accounts" element={<AdminTenantPaymentAccountsPage />} />
				<Route path="payment-ledger" element={<AdminPaymentLedgerPage />} />
				<Route path="reconciliation" element={<AdminReconciliationPage />} />
				<Route path="clients" element={<AdminClientsPage />} />
				<Route path="tickets" element={<AdminTicketsPage />} />
				<Route path="testimonials" element={<AdminTestimonialsPage />} />
				<Route path="settings" element={<AdminSettingsPage />} />
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
