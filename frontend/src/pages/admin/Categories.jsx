import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Tag, Grid3x3, ArrowUpDown } from 'lucide-react';
import api from '../../services/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deleteModal, setDeleteModal] = useState({ show: false, category: null });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    display_order: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      showMessage('error', 'Kategoriler yüklenirken hata oluştu');
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const categoryData = {
        ...formData,
        display_order: parseInt(formData.display_order) || 0
      };

      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, categoryData);
        showMessage('success', 'Kategori başarıyla güncellendi');
      } else {
        await api.post('/categories', categoryData);
        showMessage('success', 'Kategori başarıyla eklendi');
      }

      fetchCategories();
      handleCloseModal();
    } catch (error) {
      showMessage('error', 'İşlem sırasında hata oluştu');
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = (category) => {
    setDeleteModal({ show: true, category });
  };

  const confirmDelete = async () => {
    if (!deleteModal.category) return;

    try {
      await api.delete(`/categories/${deleteModal.category.id}`);
      showMessage('success', 'Kategori başarıyla silindi');
      fetchCategories();
      setDeleteModal({ show: false, category: null });
    } catch (error) {
      showMessage('error', 'Kategori silinirken hata oluştu');
      console.error('Error deleting category:', error);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      display_order: category.display_order || 0
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      display_order: 0
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern Header with Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/30 backdrop-blur-xl p-4 sm:p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/50">
                <Grid3x3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Kategoriler</h1>
                <p className="text-white/60">Menü kategorilerinizi organize edin</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="group relative overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/50 hover:shadow-xl hover:shadow-amber-500/60 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Yeni Kategori
            </span>
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`relative overflow-hidden rounded-2xl p-4 ${
          message.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        } backdrop-blur-xl`}>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-400' : 'bg-red-400'}`} />
            {message.text}
          </div>
        </div>
      )}

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1">Toplam Kategori</p>
              <p className="text-3xl font-bold text-white">{categories.length}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center">
              <Tag className="w-7 h-7 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1">Aktif Kategoriler</p>
              <p className="text-3xl font-bold text-white">{categories.length}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center">
              <Grid3x3 className="w-7 h-7 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/30 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1">Sıralama</p>
              <p className="text-3xl font-bold text-white">0-{categories.length}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center">
              <ArrowUpDown className="w-7 h-7 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <div 
            key={category.id} 
            className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/20"
          >
            {/* Animated Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-orange-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:via-orange-500/10 group-hover:to-amber-500/10 transition-all duration-500" />
            
            {/* Order Badge */}
            <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/50 font-bold text-white">
              {category.display_order}
            </div>

            <div className="relative p-6 space-y-4">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Tag className="w-8 h-8 text-amber-400" />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors duration-300">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-white/60 text-sm line-clamp-2 leading-relaxed">
                    {category.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 relative overflow-hidden group/btn px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:text-white font-medium transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                  <span className="relative flex items-center justify-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    Düzenle
                  </span>
                </button>
                <button
                  onClick={() => handleDelete(category)}
                  className="relative overflow-hidden group/btn px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:text-white font-medium transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                  <span className="relative flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </span>
                </button>
              </div>
            </div>

            {/* Decorative Corner */}
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-20">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-16 max-w-md mx-auto">
            <Tag className="w-20 h-20 text-white/20 mx-auto mb-6" />
            <p className="text-white/60 text-xl font-light">Henüz kategori eklenmemiş</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:shadow-xl transition-all"
            >
              İlk Kategoriyi Ekle
            </button>
          </div>
        </div>
      )}

      {/* Modern Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg">
            <div className="relative overflow-hidden rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 border border-white/20 shadow-2xl max-h-[90vh] flex flex-col">
              {/* Modal Header with Gradient */}
              <div className="sticky top-0 z-10 relative overflow-hidden bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-b border-white/10 p-4 sm:p-6 backdrop-blur-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl" />
                <div className="relative flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
                    </h2>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto overscroll-contain min-h-0">
                {/* Category Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <Tag className="w-4 h-4 text-amber-400" />
                    Kategori Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
                    placeholder="Örn: Ana Yemekler"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">
                    Açıklama
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none resize-none"
                    placeholder="Kategori açıklaması..."
                  />
                </div>

                {/* Display Order */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <ArrowUpDown className="w-4 h-4 text-amber-400" />
                    Sıralama
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
                    placeholder="0"
                  />
                  <p className="text-xs text-white/40 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-white/40" />
                    Küçük değerler önce gösterilir
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 font-medium transition-all"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 relative overflow-hidden group px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/50 hover:shadow-xl hover:shadow-amber-500/60 transition-all"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative">
                      {editingCategory ? 'Güncelle' : 'Ekle'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="relative w-full max-w-md">
            <div className="relative overflow-hidden rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 border border-red-500/30 shadow-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="relative overflow-hidden bg-gradient-to-r from-red-500/20 via-red-600/20 to-red-500/20 border-b border-red-500/30 p-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-3xl" />
                <div className="relative flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/50">
                    <Trash2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Kategoriyi Sil</h3>
                    <p className="text-sm text-white/60">Bu işlem geri alınamaz</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <p className="text-white/80 leading-relaxed">
                  <span className="font-semibold text-white">{deleteModal.category?.name}</span> kategorisini silmek istediğinizden emin misiniz?
                </p>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-2">
                  <p className="text-sm text-red-400 flex items-start gap-2">
                    <span className="mt-0.5">⚠️</span>
                    <span className="font-semibold">Dikkat: Bu kategorideki tüm ürünler de silinecektir!</span>
                  </p>
                  <p className="text-xs text-red-400/80 ml-6">
                    Bu işlem geri alınamaz ve tüm ilişkili veriler kalıcı olarak kaldırılacaktır.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 p-6 pt-0">
                <button
                  onClick={() => setDeleteModal({ show: false, category: null })}
                  className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 font-medium transition-all"
                >
                  İptal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 relative overflow-hidden group px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/60 transition-all"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative flex items-center justify-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Kategoriyi Sil
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
