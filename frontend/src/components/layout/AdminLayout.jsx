import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  Menu as MenuIcon, 
  X, 
  LayoutDashboard, 
  ShoppingCart, 
  Calendar, 
  Package, 
  Users, 
  Settings, 
  LogOut,
  Globe,
  Image
} from 'lucide-react'
import AdminNotifier from './AdminNotifier'
import { useSiteSettings } from '../../context/SiteSettingsContext'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const isAuthenticated = localStorage.getItem('adminToken')
  const { siteLogo } = useSiteSettings()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location])

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    window.location.href = '/admin/login'
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: ShoppingCart, label: 'Siparişler', path: '/admin/orders' },
    { icon: Calendar, label: 'Rezervasyonlar', path: '/admin/reservations' },
    { icon: Package, label: 'Ürünler', path: '/admin/products' },
    { icon: MenuIcon, label: 'Kategoriler', path: '/admin/categories' },
    { icon: Image, label: 'Galeri', path: '/admin/gallery' },
    { icon: Users, label: 'Müşteriler', path: '/admin/customers' },
    { icon: Globe, label: 'Site Ayarları', path: '/admin/settings' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-[85vw] max-w-64 transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-full px-3 py-4 backdrop-blur-2xl bg-white/5 border-r border-white/10 flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 px-4 mb-8">
            {siteLogo ? (
              <img
                src={siteLogo}
                alt="Site Logo"
                className="h-10 w-auto object-contain max-w-[140px]"
                onError={() => {}}
              />
            ) : null}
            <div>
              <h2 className="text-white font-bold text-lg">Seyirtepe</h2>
              <p className="text-xs text-white/60">Admin Panel</p>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="space-y-2 flex-1 overflow-y-auto pr-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <a
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </a>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="pt-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Çıkış Yap</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-3 px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>

            <div className="flex items-center gap-2 sm:gap-4 ml-auto flex-wrap justify-end">
              <AdminNotifier />
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">Admin</p>
                <p className="text-xs text-white/60">admin@seyirtepe.com</p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
