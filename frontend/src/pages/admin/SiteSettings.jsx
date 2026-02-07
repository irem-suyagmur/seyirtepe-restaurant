import { useState, useEffect } from 'react'
import { useSiteSettings } from '../../context/SiteSettingsContext'
import { uploadSiteLogo, deleteSiteLogo } from '../../services/api'
import { 
  Save, 
  Image as ImageIcon, 
  Upload, 
  FileText, 
  Globe,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react'

const SiteSettings = () => {
  const { aboutContent: ctxAbout, siteLogo: ctxLogo, setAboutContent: setCtxAbout, setSiteLogo: setCtxLogo, refreshRemoteSettings } = useSiteSettings()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Logo state
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [currentLogo, setCurrentLogo] = useState('')
  
  // About content state
  const [aboutContent, setAboutContent] = useState({
    title: 'Seyirtepe Restaurant & Cafe',
    subtitle: 'Hatay\'ın köklü mutfak kültürünü modern anlayışla buluşturuyoruz',
    paragraph1: '2007 yılından bu yana, Hatay\'ın bereketli topraklarında, Amik Ovası\'nın eşsiz manzarasına karşı misafirlerimize hizmet vermenin gururunu yaşıyoruz. Seyirtepe Restaurant & Cafe olarak, geleneksel Hatay mutfağının zenginliğini modern sunumla buluşturarak unutulmaz lezzet deneyimleri sunuyoruz.',
    paragraph2: 'Restoranimiz, sadece bir yemek mekanı değil, aynı zamanda Hatay\'ın kültürel mirasını yaşatan bir buluşma noktasıdır. Her tabakta özenle hazırlanan yemeklerimiz, yöresel tariflerle modern mutfak tekniklerinin mükemmel uyumunu yansıtır.',
    paragraph3: 'Deneyimli şef ekibimiz, en taze ve kaliteli malzemelerle hazırladığı özel tariflerimizle damak zevkinize hitap ediyor. Sabah kahvaltısından akşam yemeğine, özel günlerinizden günlük buluşmalarınıza kadar her anınızı özel kılmak için buradayız.',
    since: '2007',
    experience: '16+',
    happyGuests: '50K+',
    recipes: '100+',
    rating: '4.8'
  })

  // Load saved data from localStorage
  useEffect(() => {
    if (ctxAbout) {
      setAboutContent(ctxAbout)
    }

    if (ctxLogo) {
      setCurrentLogo(ctxLogo)
    }
  }, [])

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Logo dosyası 5MB\'dan küçük olmalıdır!' })
        return
      }
      
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAboutChange = (field, value) => {
    setAboutContent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })
    
    try {
      // Save to localStorage (TODO: Replace with backend API)
      localStorage.setItem('aboutContent', JSON.stringify(aboutContent))
      setCtxAbout(aboutContent)
      
      if (logoFile) {
        const uploaded = await uploadSiteLogo(logoFile)
        const nextLogoUrl = uploaded?.logo_url || ''
        setCtxLogo(nextLogoUrl)
        setCurrentLogo(nextLogoUrl)
        setLogoPreview('')
        setLogoFile(null)
        await refreshRemoteSettings()
      }

      // Back-compat: keep existing event dispatch for any remaining listeners
      window.dispatchEvent(new CustomEvent('siteSettingsUpdated', {
        detail: { 
          logo: logoPreview || currentLogo, 
          aboutContent,
          timestamp: Date.now()
        }
      }))
      window.dispatchEvent(new Event('storage'))
      
      setMessage({ type: 'success', text: 'Değişiklikler başarıyla kaydedildi ve siteye yansıtıldı!' })
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Bir hata oluştu: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview('')
  }

  const removeCurrentLogo = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })
    try {
      await deleteSiteLogo()
      setCtxLogo(null)
      setCurrentLogo('')
      await refreshRemoteSettings()
      setMessage({ type: 'success', text: 'Logo kaldırıldı.' })
      setTimeout(() => setMessage({ type: '', text: '' }), 2000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Logo kaldırılamadı: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Site Ayarları</h1>
          <p className="text-white/60">Logo ve hakkımızda içeriğini yönetin</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Değişiklikleri Kaydet
            </>
          )}
        </button>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`flex items-center gap-3 p-4 rounded-xl ${
          message.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Logo Section */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Site Logosu</h2>
            <p className="text-sm text-white/60">PNG veya JPG formatında, maksimum 5MB</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Logo */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-3">
              Mevcut Logo
            </label>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 flex items-center justify-center h-48">
              {currentLogo ? (
                <img 
                  src={currentLogo} 
                  alt="Current Logo" 
                  className="max-h-full max-w-full object-contain"
                  onError={() => {
                    setCurrentLogo('')
                  }}
                />
              ) : (
                <div className="text-center">
                  <p className="text-white/50 text-sm">Henüz logo yüklenmedi</p>
                </div>
              )}
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={removeCurrentLogo}
                disabled={loading || !currentLogo}
                className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Logoyu Kaldır
              </button>
            </div>
          </div>

          {/* New Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-3">
              Yeni Logo Yükle
            </label>
            {logoPreview ? (
              <div className="relative">
                <div className="backdrop-blur-xl bg-white/5 border border-amber-500/30 rounded-xl p-6 flex items-center justify-center h-48">
                  <img 
                    src={logoPreview} 
                    alt="Logo Preview" 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <button
                  onClick={removeLogo}
                  className="absolute top-2 right-2 p-2 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="backdrop-blur-xl bg-white/5 border-2 border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-white/10 hover:border-amber-500/50 transition-all duration-200">
                <Upload className="w-12 h-12 text-white/40 mb-3" />
                <p className="text-white/60 text-sm mb-1">Logo dosyasını seçin</p>
                <p className="text-white/40 text-xs">veya sürükleyip bırakın</p>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* About Content Section */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Hakkımızda İçeriği</h2>
            <p className="text-sm text-white/60">Hakkımızda sayfasında görünen metinleri düzenleyin</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Ana Başlık
            </label>
            <input
              type="text"
              value={aboutContent.title}
              onChange={(e) => handleAboutChange('title', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 transition-colors"
              placeholder="Örn: Seyirtepe Restaurant & Cafe"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Alt Başlık
            </label>
            <input
              type="text"
              value={aboutContent.subtitle}
              onChange={(e) => handleAboutChange('subtitle', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 transition-colors"
              placeholder="Kısa açıklama..."
            />
          </div>

          {/* Paragraphs */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              1. Paragraf
            </label>
            <textarea
              value={aboutContent.paragraph1}
              onChange={(e) => handleAboutChange('paragraph1', e.target.value)}
              rows="4"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
              placeholder="İlk paragraf içeriği..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              2. Paragraf
            </label>
            <textarea
              value={aboutContent.paragraph2}
              onChange={(e) => handleAboutChange('paragraph2', e.target.value)}
              rows="4"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
              placeholder="İkinci paragraf içeriği..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              3. Paragraf
            </label>
            <textarea
              value={aboutContent.paragraph3}
              onChange={(e) => handleAboutChange('paragraph3', e.target.value)}
              rows="4"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
              placeholder="Üçüncü paragraf içeriği..."
            />
          </div>

          {/* Statistics */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-400" />
              İstatistikler
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-2">
                  Kuruluş Yılı
                </label>
                <input
                  type="text"
                  value={aboutContent.since}
                  onChange={(e) => handleAboutChange('since', e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-2">
                  Yıllık Tecrübe
                </label>
                <input
                  type="text"
                  value={aboutContent.experience}
                  onChange={(e) => handleAboutChange('experience', e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-2">
                  Mutlu Misafir
                </label>
                <input
                  type="text"
                  value={aboutContent.happyGuests}
                  onChange={(e) => handleAboutChange('happyGuests', e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-2">
                  Özel Tarif
                </label>
                <input
                  type="text"
                  value={aboutContent.recipes}
                  onChange={(e) => handleAboutChange('recipes', e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button (Mobile) */}
      <div className="md:hidden">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Değişiklikleri Kaydet
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default SiteSettings
