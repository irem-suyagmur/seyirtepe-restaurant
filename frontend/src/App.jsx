import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { SiteSettingsProvider } from './context/SiteSettingsContext'
import MainLayout from './components/layout/MainLayout'
import AdminLayout from './components/layout/AdminLayout'
import { Loader2 } from 'lucide-react'

// Lazy load pages
const Home = lazy(() => import('./pages/Home'))
const Menu = lazy(() => import('./pages/Menu'))
const About = lazy(() => import('./pages/About'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Reservation = lazy(() => import('./pages/Reservation'))
const Contact = lazy(() => import('./pages/Contact'))
const AdminLogin = lazy(() => import('./pages/admin/Login'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const SiteSettings = lazy(() => import('./pages/admin/SiteSettings'))
const Products = lazy(() => import('./pages/admin/Products'))
const Categories = lazy(() => import('./pages/admin/Categories'))
const Reservations = lazy(() => import('./pages/admin/Reservations'))

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="animate-spin">
      <Loader2 className="w-12 h-12 text-amber-500" />
    </div>
  </div>
)

function App() {
  return (
    <SiteSettingsProvider>
      <CartProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Admin Routes - No Layout */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Admin Routes - With Admin Layout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="settings" element={<SiteSettings />} />
              <Route path="products" element={<Products />} />
              <Route path="categories" element={<Categories />} />
              <Route path="reservations" element={<Reservations />} />
            </Route>
            
            {/* Public Routes - With Layout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/about" element={<About />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/reservation" element={<Reservation />} />
              <Route path="/contact" element={<Contact />} />
            </Route>
          </Routes>
        </Suspense>
      </CartProvider>
    </SiteSettingsProvider>
  )
}

export default App
