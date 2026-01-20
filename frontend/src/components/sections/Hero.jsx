import { ArrowRight, ChefHat, MapPin, Clock, Sparkles, Mountain, Award, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const Hero = () => {
  const { aboutContent } = useSiteSettings();

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
      {/* Content */}
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-white/90">Amik Ovası, Hatay</span>
            </div>

            {/* Headline */}
            <div className="space-y-6">
              <h1 className="text-6xl md:text-7xl xl:text-8xl font-bold leading-tight">
                <span className="block text-white">Seyirtepe</span>
                <span className="block bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                  Restaurant & Cafe
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-white/60 leading-relaxed max-w-xl">
                {aboutContent?.subtitle}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/menu" className="group w-full sm:w-auto">
                <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg text-white hover:shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3">
                  Menüyü Keşfet
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>

              <Link to="/reservation" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300">
                  Rezervasyon Yap
                </button>
              </Link>
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-4 sm:gap-6 md:gap-8 pt-6 sm:pt-8 border-t border-white/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                  <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-white/50">Şef Özel</div>
                  <div className="text-sm sm:text-base font-semibold text-white">{aboutContent?.recipes} Tarif</div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-white/50">Açılış</div>
                  <div className="text-sm sm:text-base font-semibold text-white">10:00 - 23:00</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Feature Cards */}
          <div className="hidden lg:grid grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 border border-white/20 rounded-3xl p-8 hover:border-amber-400/40 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4">
                  <Utensils className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Hatay Mutfağı</h3>
                <p className="text-white/60 leading-relaxed">Geleneksel tarifler, modern dokunuşlarla</p>
              </div>

              <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 border border-white/20 rounded-3xl p-8 hover:border-amber-400/40 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Premium Deneyim</h3>
                <p className="text-white/60 leading-relaxed">Özenli hizmet, lüks atmosfer</p>
              </div>
            </div>

            <div className="space-y-6 pt-12">
              <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 border border-white/20 rounded-3xl p-8 hover:border-amber-400/40 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4">
                  <Mountain className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Manzara</h3>
                <p className="text-white/60 leading-relaxed">Amik Ovası'nın eşsiz güzelliği</p>
              </div>

              <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 border border-white/20 rounded-3xl p-8 hover:border-amber-400/40 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{aboutContent?.experience} Yıl</h3>
                <p className="text-white/60 leading-relaxed">Deneyim ve kalite güvencesi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
