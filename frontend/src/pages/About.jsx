import { Helmet } from 'react-helmet-async'
import { MapPin, Award, Users, Heart, Clock, ChefHat } from 'lucide-react'
import { useSiteSettings } from '../context/SiteSettingsContext'

const About = () => {
  const { aboutContent } = useSiteSettings()

  const features = [
    {
      icon: Award,
      title: '2007\'den Beri',
      description: 'Hatay mutfağının geleneksel lezzetlerini modern sunumla buluşturuyoruz'
    },
    {
      icon: Users,
      title: 'Deneyimli Ekip',
      description: 'Alanında uzman şeflerimiz ve misafirperverlik anlayışıyla hizmetinizdeyiz'
    },
    {
      icon: Heart,
      title: 'Kalite & Lezzet',
      description: 'En taze malzemelerle hazırlanan yemeklerimiz damak zevkinize hitap ediyor'
    },
    {
      icon: MapPin,
      title: 'Eşsiz Manzara',
      description: 'Amik Ovası\'nın büyüleyici manzarasına karşı unutulmaz bir yemek deneyimi'
    }
  ]

  const stats = aboutContent ? [
    { number: aboutContent.experience, label: 'Yıllık Tecrübe' },
    { number: aboutContent.happyGuests, label: 'Mutlu Misafir' },
    { number: aboutContent.recipes, label: 'Özel Tarif' },
    { number: aboutContent.rating, label: 'Müşteri Puanı' }
  ] : []

  return (
    <>
      <Helmet>
        <title>Hakkımızda - Seyirtepe Restaurant</title>
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative h-[40vh] sm:h-[50vh] min-h-[300px] sm:min-h-[400px] flex items-center justify-center overflow-hidden">
          {/* Background (no external asset dependency) */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/60 to-amber-900/10" />
          <div className="relative z-10 text-center px-4">
            <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-amber-500/20 border border-amber-500/30 backdrop-blur-xl mb-4 sm:mb-6">
              <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              <span className="text-amber-300 font-medium text-sm sm:text-base">Since {aboutContent.since}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-3 sm:mb-4">
              Hikayemiz
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto px-4">
              {aboutContent.subtitle}
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="container-custom py-10 sm:py-16 md:py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
                {aboutContent.title}
              </h2>
              
              <div className="space-y-3 sm:space-y-4 text-white/70 leading-relaxed text-sm sm:text-base md:text-lg">
                <p>
                  {aboutContent.paragraph1}
                </p>
                
                <p>
                  {aboutContent.paragraph2}
                </p>
                
                <p>
                  {aboutContent.paragraph3}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="container-custom pb-10 sm:pb-16 md:pb-20 px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="backdrop-blur-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center hover:scale-105 transition-transform duration-300"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-400 mb-1 sm:mb-2">
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm md:text-base text-white/60 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="container-custom pb-10 sm:pb-16 md:pb-20 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-8 sm:mb-12">
            Neden Seyirtepe?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div 
                  key={index}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 hover:bg-white/10 transition-all duration-300 group h-full"
                >
                  <div className="flex items-start gap-3 sm:gap-4 md:gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-white/70 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Opening Hours Section */}
        <div className="container-custom pb-10 sm:pb-16 md:pb-20 px-4">
          <div className="max-w-3xl mx-auto backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-10">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-amber-400" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Çalışma Saatlerimiz</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span className="text-white/70 text-base md:text-lg">Her Gün</span>
                <span className="text-white font-semibold text-base md:text-lg">24 Saat Açık</span>
              </div>
            </div>

            <div className="mt-6 p-3 md:p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <p className="text-center text-amber-300 text-sm">
                <strong>Not:</strong> Özel günlerde çalışma saatlerimiz değişebilir. 
                Lütfen rezervasyon yaparken bizi arayın.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="container-custom pb-20">
          <div className="max-w-4xl mx-auto backdrop-blur-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Sizi Aramızda Görmekten Mutluluk Duyarız
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
              Amik Ovası'nın büyüleyici manzarasında, unutulmaz bir yemek deneyimi için 
              hemen rezervasyon yapın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/reservation"
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl shadow-amber-500/30"
              >
                Rezervasyon Yap
              </a>
              <a
                href="/contact"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all"
              >
                İletişime Geç
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default About
