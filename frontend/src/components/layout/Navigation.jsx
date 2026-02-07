import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { siteLogo } = useSiteSettings();
  const location = useLocation();

  const navItems = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Menü', path: '/menu' },
    { name: 'Galeri', path: '/gallery' },
    { name: 'Hakkımızda', path: '/about' },
    { name: 'İletişim', path: '/contact' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // logo comes from SiteSettingsContext

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'backdrop-blur-2xl bg-black/60 shadow-2xl border-b border-white/10'
            : 'bg-gradient-to-b from-black/40 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center space-x-3 group">
              {siteLogo ? (
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  src={siteLogo}
                  alt="Seyirtepe Logo"
                  className="h-12 w-auto object-contain max-w-[180px]"
                  onError={() => {}}
                />
              ) : (
                <>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold bg-gradient-to-r from-white via-primary-200 to-primary-300 bg-clip-text text-transparent">
                      Seyirtepe
                    </span>
                    <span className="text-xs text-primary-300 -mt-1 tracking-wider">RESTAURANT & CAFE</span>
                  </div>
                </>
              )}
            </Link>

            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} className="relative px-5 py-2.5 group focus:outline-none focus-visible:outline-none">
                    <motion.span
                      className={`relative z-10 text-sm font-medium transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                      }`}
                    >
                      {item.name}
                    </motion.span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-600/20 backdrop-blur-xl rounded-xl border border-primary-400/30 shadow-lg shadow-primary-500/20"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    {!isActive && (
                      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                  </Link>
                );
              })}
            </div>

            <Link
              to="/reservation"
              className="hidden lg:block relative overflow-hidden group focus:outline-none focus-visible:outline-none"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl font-medium text-white shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-shadow duration-300"
              >
                <span className="relative z-10">Rezervasyon</span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            </Link>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors duration-300 focus:outline-none focus-visible:outline-none"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 backdrop-blur-2xl bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 border-l border-white/10 shadow-2xl lg:hidden"
          >
            <div className="flex flex-col h-full pt-24 px-6">
              <nav className="flex flex-col space-y-2">
                {navItems.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        className={`block px-6 py-4 rounded-xl font-medium transition-all duration-300 focus:outline-none focus-visible:outline-none ${
                          isActive
                            ? 'bg-gradient-to-r from-primary-500/20 to-primary-600/20 text-white border border-primary-400/30 shadow-lg shadow-primary-500/20'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navItems.length * 0.1 }}
                className="mt-8"
              >
                <Link
                  to="/reservation"
                  className="block w-full text-center px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl font-medium text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-shadow duration-300 focus:outline-none focus-visible:outline-none"
                >
                  Rezervasyon Yap
                </Link>
              </motion.div>

              <div className="mt-auto pb-8">
                <div className="border-t border-white/10 pt-8">
                  <p className="text-center text-sm text-gray-400">
                    Amik Ovası'nın Eşsiz Lezzetleri
                  </p>
                  <p className="text-center text-xs text-gray-500 mt-2">
                    © 2024 Seyirtepe Restaurant & Cafe
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
