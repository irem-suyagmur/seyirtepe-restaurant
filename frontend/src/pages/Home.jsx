import { Clock, MapPin, Star } from 'lucide-react'
import Hero from '../components/sections/Hero'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div>
      <Hero />

      {/* CTA Section */}
      <section className="relative py-12 sm:py-20 md:py-32 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="backdrop-blur-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-16 text-center space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                Masanızı Ayırtın
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto px-2">
                Özel günlerinizi Seyirtepe'de kutlayın. Amik Ovası manzarasına karşı unutulmaz bir deneyim.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
              <Link to="/reservation" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg text-white hover:shadow-2xl hover:shadow-amber-500/50 transition-all duration-300">
                  Hemen Rezervasyon Yap
                </button>
              </Link>

              <Link to="/menu" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg text-white hover:bg-white/20 transition-all duration-300">
                  Menüyü İncele
                </button>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 pt-6 sm:pt-8 border-t border-white/20">
              <div className="flex items-center justify-center gap-2 text-white/80 text-sm sm:text-base">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 flex-shrink-0" />
                <span>7/24 Açık</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-white/80 text-sm sm:text-base">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 flex-shrink-0" />
                <span>Amik Ovası, Hatay</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
