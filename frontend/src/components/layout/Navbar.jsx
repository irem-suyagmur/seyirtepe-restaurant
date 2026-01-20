import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone, MapPin } from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [logo, setLogo] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const savedLogo = localStorage.getItem('siteLogo')
    console.log('Navbar: Ba\u015flang\u0131\u00e7ta localStorage logo:', savedLogo ? 'Var' : 'Yok')
    if (savedLogo && savedLogo !== 'null' && savedLogo !== 'undefined') {
      try {
        setLogo(savedLogo)
      } catch (error) {
        console.error('Navbar: Logo y\u00fcklenirken hata:', error)
        setLogo(null)
      }
    }

    // Listen for site settings updates
    const handleSettingsUpdate = (event) => {
      console.log('Navbar: siteSettingsUpdated eventi al\u0131nd\u0131!', event.detail)
      const savedLogo = localStorage.getItem('siteLogo')
      if (savedLogo && savedLogo !== 'null' && savedLogo !== 'undefined') {
        console.log('Navbar: Yeni logo y\u00fckleniyor')
        setLogo(savedLogo)
      } else {
        console.log('Navbar: Logo siliniyor')
        setLogo(null)
      }
    }

    const handleStorageUpdate = () => {
      console.log('Navbar: storage eventi al\u0131nd\u0131!')
      const savedLogo = localStorage.getItem('siteLogo')
      if (savedLogo && savedLogo !== 'null' && savedLogo !== 'undefined') {
        setLogo(savedLogo)
      } else {
        setLogo(null)
      }
    }

    window.addEventListener('siteSettingsUpdated', handleSettingsUpdate)
    window.addEventListener('storage', handleStorageUpdate)

    return () => {
      window.removeEventListener('siteSettingsUpdated', handleSettingsUpdate)
      window.removeEventListener('storage', handleStorageUpdate)
    }
  }, [])

  const navItems = [
    { path: '/', label: 'Ana Sayfa' },
    { path: '/menu', label: 'Menü' },
    { path: '/about', label: 'Hakkımızda' },
    { path: '/gallery', label: 'Galeri' },
    { path: '/reservation', label: 'Rezervasyon' },
    { path: '/contact', label: 'İletişim' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            {logo ? (
              <img 
                src={logo} 
                alt="Seyirtepe Logo" 
                className={`h-12 w-auto object-contain max-w-[150px] ${
                  scrolled ? '' : 'brightness-110'
                }`}
                onError={(e) => {
                  console.error('Logo y\u00fcklenirken hata olu\u015ftu')
                  setLogo(null)
                }}
              />
            ) : (
              <span 
                className={`text-2xl font-serif font-bold ${
                  scrolled ? 'text-primary-600' : 'text-white'
                }`}
              >
                Seyirtepe
              </span>
            )}
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-primary-600'
                    : scrolled
                    ? 'text-dark-700 hover:text-primary-600'
                    : 'text-white hover:text-primary-200'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 rounded-lg ${
              scrolled ? 'text-dark-700' : 'text-white'
            }`}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white shadow-lg"
          >
            <div className="container-custom py-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block py-3 font-medium ${
                    location.pathname === item.path
                      ? 'text-primary-600'
                      : 'text-dark-700 hover:text-primary-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar
