import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const SiteSettingsContext = createContext(null)

const DEFAULT_ABOUT = {
  title: 'Seyirtepe Restaurant & Cafe',
  subtitle: "Hatay'ın köklü mutfak kültürünü modern anlayışla buluşturuyoruz",
  paragraph1:
    "2007 yılından bu yana, Hatay'ın bereketli topraklarında, Amik Ovası'nın eşsiz manzarasına karşı misafirlerimize hizmet vermenin gururunu yaşıyoruz. Seyirtepe Restaurant & Cafe olarak, geleneksel Hatay mutfağının zenginliğini modern sunumla buluşturarak unutulmaz lezzet deneyimleri sunuyoruz.",
  paragraph2:
    "Restoranimiz, sadece bir yemek mekanı değil, aynı zamanda Hatay'ın kültürel mirasını yaşatan bir buluşma noktasıdır. Her tabakta özenle hazırlanan yemeklerimiz, yöresel tariflerle modern mutfak tekniklerinin mükemmel uyumunu yansıtır.",
  paragraph3:
    'Deneyimli şef ekibimiz, en taze ve kaliteli malzemelerle hazırladığı özel tariflerimizle damak zevkinize hitap ediyor. Sabah kahvaltısından akşam yemeğine, özel günlerinizden günlük buluşmalarınıza kadar her anınızı özel kılmak için buradayız.',
  since: '2007',
  experience: '16+',
  happyGuests: '50K+',
  recipes: '100+',
  rating: '4.8'
}

function safeReadJSON(key) {
  const raw = localStorage.getItem(key)
  if (!raw || raw === 'null' || raw === 'undefined') return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function safeReadString(key) {
  const raw = localStorage.getItem(key)
  if (!raw || raw === 'null' || raw === 'undefined') return null
  return raw
}

export function SiteSettingsProvider({ children }) {
  const [aboutContent, setAboutContent] = useState(DEFAULT_ABOUT)
  const [siteLogo, setSiteLogo] = useState(null)

  const reloadFromStorage = () => {
    const savedAbout = safeReadJSON('aboutContent')
    const savedLogo = safeReadString('siteLogo')

    if (savedAbout) setAboutContent({ ...DEFAULT_ABOUT, ...savedAbout })
    else setAboutContent(DEFAULT_ABOUT)

    setSiteLogo(savedLogo)
  }

  useEffect(() => {
    reloadFromStorage()

    const onStorage = (e) => {
      if (!e || !e.key || e.key === 'aboutContent' || e.key === 'siteLogo') {
        reloadFromStorage()
      }
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(
    () => ({
      aboutContent,
      siteLogo,
      setAboutContent: (next) => {
        setAboutContent((prev) => ({ ...prev, ...next }))
      },
      setSiteLogo: (next) => {
        setSiteLogo(next)
      },
      reloadFromStorage
    }),
    [aboutContent, siteLogo]
  )

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext)
  if (!ctx) {
    throw new Error('useSiteSettings must be used within SiteSettingsProvider')
  }
  return ctx
}
