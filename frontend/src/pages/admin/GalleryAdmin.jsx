import { useState, useEffect } from 'react'
import { Image as ImageIcon, Upload, Trash2, Edit2, X, Save } from 'lucide-react'
import api, { toAbsoluteApiUrl } from '../../services/api'

const GalleryAdmin = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    display_order: 0
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const categories = [
    { value: '', label: 'Tümü' },
    { value: 'interior', label: 'İç Mekan' },
    { value: 'food', label: 'Yemekler' },
    { value: 'events', label: 'Etkinlikler' },
    { value: 'view', label: 'Manzara' }
  ]

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      setLoading(true)
      const response = await api.get('/gallery')
      setImages(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Galeri resimleri yüklenirken hata:', error)
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Lütfen bir resim seçin')
      return
    }

    try {
      setUploading(true)

      // Upload image first
      const uploadFormData = new FormData()
      uploadFormData.append('file', selectedFile)

      const uploadResponse = await api.post('/gallery/upload-image', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Create gallery entry
      await api.post(
        '/gallery',
        {
          title: formData.title || null,
          description: formData.description || null,
          category: formData.category || null,
          display_order: Number.isFinite(formData.display_order) ? formData.display_order : 0,
        },
        {
          params: {
            image_url: uploadResponse.data.image_url,
          },
        }
      )

      alert('Resim başarıyla yüklendi!')
      setShowUploadModal(false)
      resetForm()
      fetchImages()
    } catch (error) {
      console.error('Yükleme hatası:', error)
      alert('Resim yüklenirken hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedImage) return

    try {
      await api.put(`/gallery/${selectedImage.id}`, formData)
      alert('Resim başarıyla güncellendi!')
      setShowEditModal(false)
      resetForm()
      fetchImages()
    } catch (error) {
      console.error('Güncelleme hatası:', error)
      alert('Resim güncellenirken hata oluştu')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu resmi silmek istediğinizden emin misiniz?')) return

    try {
      await api.delete(`/gallery/${id}`)
      alert('Resim başarıyla silindi!')
      fetchImages()
    } catch (error) {
      console.error('Silme hatası:', error)
      alert('Resim silinirken hata oluştu')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      display_order: 0
    })
    setSelectedFile(null)
    setPreviewUrl(null)
    setSelectedImage(null)
  }

  const openEditModal = (image) => {
    setSelectedImage(image)
    setFormData({
      title: image.title || '',
      description: image.description || '',
      category: image.category || '',
      display_order: image.display_order || 0
    })
    setShowEditModal(true)
  }

  const getCategoryLabel = (value) => {
    return categories.find(c => c.value === value)?.label || 'Diğer'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Galeri Yönetimi</h1>
          <p className="text-white/60 mt-1">Galeri resimlerini yönetin</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-200 font-medium text-sm sm:text-base"
        >
          <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Resim Yükle</span>
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-amber-500/30 transition-all duration-200"
          >
            <div className="aspect-square relative overflow-hidden bg-black/20">
              <img
                src={toAbsoluteApiUrl(image.image_url)}
                alt={image.title || 'Gallery image'}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                  {image.title && (
                    <h3 className="text-white font-semibold text-sm line-clamp-1">
                      {image.title}
                    </h3>
                  )}
                  {image.category && (
                    <span className="inline-block px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-lg border border-amber-500/30">
                      {getCategoryLabel(image.category)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => openEditModal(image)}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg transition-colors duration-200"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(image.id)}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-16">
          <ImageIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">Henüz galeri resmi eklenmemiş</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-4 text-amber-500 hover:text-amber-400 font-medium"
          >
            İlk resmi yükleyin
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Yeni Resim Yükle</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  resetForm()
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-white mb-2">Resim Seçin</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors"
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-white/40 mb-2" />
                        <p className="text-white/60">Resim yüklemek için tıklayın</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-white mb-2">Başlık (Opsiyonel)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50"
                  placeholder="Örn: Sunset View"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-white mb-2">Açıklama (Opsiyonel)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 resize-none"
                  placeholder="Resim açıklaması..."
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-white mb-2">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-gray-900">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-white mb-2">Sıralama</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-2.5 backdrop-blur-xl bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Yükleniyor...' : 'Yükle'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Resim Düzenle</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  resetForm()
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image Preview */}
              <div className="w-full h-48 rounded-xl overflow-hidden">
                <img
                  src={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'https://seyirtepe-api.onrender.com'}${selectedImage.image_url}`}
                  alt={selectedImage.title || 'Gallery image'}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-white mb-2">Başlık</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-white mb-2">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-white mb-2">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-gray-900">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-white mb-2">Sıralama</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-2.5 backdrop-blur-xl bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleEdit}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-200"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GalleryAdmin
