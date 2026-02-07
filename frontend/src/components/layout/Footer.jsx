import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, ChefHat } from 'lucide-react';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const Footer = () => {
  const { siteLogo, aboutContent } = useSiteSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-b from-black/40 to-black/80 backdrop-blur-xl border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              {siteLogo ? (
                <img 
                  src={siteLogo} 
                  alt="Seyirtepe Logo" 
                  className="h-16 w-auto object-contain max-w-[200px]"
                  onError={(e) => {
                    console.error('Footer logo yüklenirken hata')
                  }}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-amber-500/50 transition-shadow">
                    <ChefHat className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-white">Seyirtepe</span>
                    <span className="text-xs text-amber-400 -mt-1">RESTAURANT & CAFE</span>
                  </div>
                </div>
              )}
            </Link>
            <p className="text-white/60 leading-relaxed">
              {aboutContent?.subtitle || "Amik Ovası'nın eşsiz manzarasına karşı Hatay mutfağının geleneksel lezzetlerini modern sunumla deneyimleyin."}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all duration-300 flex items-center justify-center group">
                <Facebook className="w-5 h-5 text-white/60 group-hover:text-amber-400 transition-colors" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all duration-300 flex items-center justify-center group">
                <Instagram className="w-5 h-5 text-white/60 group-hover:text-amber-400 transition-colors" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all duration-300 flex items-center justify-center group">
                <Twitter className="w-5 h-5 text-white/60 group-hover:text-amber-400 transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Hızlı Bağlantılar</h3>
            <ul className="space-y-3">
              {[
                { name: 'Ana Sayfa', path: '/' },
                { name: 'Menü', path: '/menu' },
                { name: 'Galeri', path: '/gallery' },
                { name: 'Hakkımızda', path: '/about' },
                { name: 'İletişim', path: '/contact' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-white/60 hover:text-amber-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/0 group-hover:bg-amber-400 transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Working Hours */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Çalışma Saatleri</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <div className="flex justify-between gap-4">
                    <span className="text-white/60">Her Gün</span>
                    <span className="text-white font-medium">24 Saat Açık</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">İletişim</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Kıcı,+31350+Belen/Hatay" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-amber-400 transition-colors"
                >
                  Kıcı, 31350 Belen/Hatay
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <a href="tel:+905526010661" className="text-white/60 hover:text-amber-400 transition-colors">
                  +90 552 601 06 61
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <a href="mailto:info@seyirtepe.com" className="text-white/60 hover:text-amber-400 transition-colors">
                  info@seyirtepe.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm">
              © {currentYear} Seyirtepe Restaurant & Cafe. Tüm hakları saklıdır.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="text-white/50 hover:text-amber-400 transition-colors">
                Gizlilik Politikası
              </Link>
              <Link to="/terms" className="text-white/50 hover:text-amber-400 transition-colors">
                Kullanım Koşulları
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
