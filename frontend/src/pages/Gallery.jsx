import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { X, Camera } from 'lucide-react'
import api, { toAbsoluteApiUrl } from '../services/api'

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const categories = [
    { id: 'all', name: 'Tümü' },
    { id: 'food', name: 'Yemekler' },
    { id: 'interior', name: 'İç Mekan' },
    { id: 'events', name: 'Etkinlikler' },
    { id: 'view', name: 'Manzara' }
  ]

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get('/gallery')
        const list = Array.isArray(res.data) ? res.data : []
        const normalized = list.map((img) => ({
          id: img.id,
          src: toAbsoluteApiUrl(img.image_url),
          category: img.category || 'other',
          title: img.title || 'Galeri',
          description: img.description || ''
        }))
        if (!cancelled) setImages(normalized)
      } catch (e) {
        if (!cancelled) {
          setImages([])
          setError('Galeri yüklenemedi. Lütfen daha sonra tekrar deneyin.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredImages = useMemo(() => {
    return selectedCategory === 'all'
      ? images
      : images.filter((img) => String(img.category || '').toLowerCase() === selectedCategory)
  }, [images, selectedCategory])

  return (
    <>
      <Helmet>
        <title>Galeri - Seyirtepe Restaurant</title>
      </Helmet>

      <div className="min-h-screen py-20 sm:py-24 px-4">
        {/* Header */}
        <div className="container-custom mb-8 sm:mb-12">
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-amber-500/20 border border-amber-500/30 backdrop-blur-xl mb-3 sm:mb-4">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              <span className="text-amber-300 font-medium text-sm sm:text-base">Galeri</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white">
              Lezzetli Anılar
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto px-4">
              Seyirtepe'den görüntüler
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="container-custom mb-8 sm:mb-12">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="container-custom">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-200">{error}</p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-white/60">Henüz galeri resmi eklenmemiş.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  onClick={() => setSelectedImage(image)}
                  className="group relative aspect-square overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer"
                >
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white font-bold text-xl mb-1">
                        {image.title}
                      </h3>
                      {image.description ? (
                        <p className="text-white/80 text-sm">
                          {image.description}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Border Effect */}
                  <div className="absolute inset-0 border-2 border-amber-500/0 group-hover:border-amber-500/50 rounded-2xl transition-all duration-300" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lightbox Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <div 
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
              />
              
              <div className="mt-6 text-center">
                <h3 className="text-white font-bold text-2xl mb-2">
                  {selectedImage.title}
                </h3>
                <p className="text-white/70 text-lg">
                  {selectedImage.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Gallery
