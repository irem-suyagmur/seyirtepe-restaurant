import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Image as ImageIcon, Search, Package, DollarSign, Grid3x3, Filter } from 'lucide-react';
import api from '../../services/api';

const getBackendOrigin = () => {
  const base = api?.defaults?.baseURL || '';
  return String(base).replace(/\/?api\/v1\/?$/, '').replace(/\/+$/, '');
};

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deleteModal, setDeleteModal] = useState({ show: false, product: null });
  const [imageUploading, setImageUploading] = useState(false);
  const [localImagePreview, setLocalImagePreview] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category_id: '',
    display_order: 0
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      showMessage('error', 'Ürünler yüklenirken hata oluştu');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imageUploading) {
      showMessage('error', 'Görsel yükleniyor, lütfen bekleyin');
      return;
    }
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        category_id: parseInt(formData.category_id),
        display_order: parseInt(formData.display_order) || 0
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, productData);
        showMessage('success', 'Ürün başarıyla güncellendi');
      } else {
        await api.post('/products', productData);
        showMessage('success', 'Ürün başarıyla eklendi');
      }

      fetchProducts();
      handleCloseModal();
    } catch (error) {
      showMessage('error', 'İşlem sırasında hata oluştu');
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = (product) => {
    setDeleteModal({ show: true, product });
  };

  const confirmDelete = async () => {
    if (!deleteModal.product) return;

    try {
      await api.delete(`/products/${deleteModal.product.id}`);
      showMessage('success', 'Ürün başarıyla silindi');
      fetchProducts();
      setDeleteModal({ show: false, product: null });
    } catch (error) {
      showMessage('error', 'Ürün silinirken hata oluştu');
      console.error('Error deleting product:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    if (localImagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(localImagePreview);
    }
    setLocalImagePreview('');
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      image_url: product.image_url || '',
      category_id: product.category_id.toString(),
      display_order: product.display_order || 0
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    if (localImagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(localImagePreview);
    }
    setLocalImagePreview('');
    setImageUploading(false);
    setFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category_id: '',
      display_order: 0
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showMessage('error', 'Resim boyutu 5MB\'dan küçük olmalıdır');
        return;
      }

      if (localImagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(localImagePreview);
      }
      setLocalImagePreview(URL.createObjectURL(file));

      try {
        setImageUploading(true);
        const data = new FormData();
        data.append('file', file);

        const response = await api.post('/products/upload-image', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const backendOrigin = getBackendOrigin();
        const uploadedUrl = response?.data?.url ? `${backendOrigin}${response.data.url}` : '';
        if (!uploadedUrl) {
          throw new Error('Upload response missing url');
        }

        setFormData((prev) => ({ ...prev, image_url: uploadedUrl }));
        if (localImagePreview?.startsWith('blob:')) {
          URL.revokeObjectURL(localImagePreview);
        }
        setLocalImagePreview('');
        showMessage('success', 'Görsel yüklendi');
      } catch (error) {
        showMessage('error', 'Görsel yüklenirken hata oluştu');
        console.error('Error uploading image:', error);
      } finally {
        setImageUploading(false);
        // Aynı dosya tekrar seçilebilsin
        e.target.value = '';
      }
    }
  };

  // Filtreleme
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || product.category_id.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Bilinmiyor';
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-purple-500/20 border border-purple-500/30 backdrop-blur-xl p-4 sm:p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Ürünler</h1>
                <p className="text-white/60">Menü ürünlerinizi yönetin</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="group relative overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Yeni Ürün Ekle
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1">Toplam Ürün</p>
              <p className="text-3xl font-bold text-white">{products.length}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center">
              <Package className="w-7 h-7 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1">Kategoriler</p>
              <p className="text-3xl font-bold text-white">{categories.length}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center">
              <Grid3x3 className="w-7 h-7 text-green-400" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/30 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1">Ortalama Fiyat</p>
              <p className="text-3xl font-bold text-white">
                ₺{products.length > 0 ? (products.reduce((acc, p) => acc + p.price, 0) / products.length).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Filtrele</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
          >
            <option value="all" className="bg-gray-900">Tüm Kategoriler</option>
            {categories.map(category => (
              <option key={category.id} value={category.id.toString()} className="bg-gray-900">
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <div 
            key={product.id} 
            className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20"
          >
            {/* Animated Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-pink-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:via-pink-500/10 group-hover:to-purple-500/10 transition-all duration-500" />
            
            {/* Product Image */}
            <div className="relative h-48 overflow-hidden">
              {product.image_url ? (
                <>
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-white/20" />
                </div>
              )}
              
              {/* Price Badge */}
              <div className="absolute top-4 right-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur-lg opacity-75" />
                  <div className="relative backdrop-blur-xl bg-gradient-to-br from-amber-500 to-orange-600 px-4 py-2 rounded-2xl border border-amber-300/30 shadow-lg">
                    <span className="text-white font-bold text-lg">₺{product.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="relative p-5 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors duration-300 line-clamp-1">
                  {product.name}
                </h3>
                <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 whitespace-nowrap">
                  {getCategoryName(product.category_id)}
                </span>
              </div>
              
              {product.description && (
                <p className="text-white/60 text-sm line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-white/10">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 relative overflow-hidden group/btn px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:text-white font-medium transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                  <span className="relative flex items-center justify-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    Düzenle
                  </span>
                </button>
                <button
                  onClick={() => handleDelete(product)}
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
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-16 max-w-md mx-auto">
            <ImageIcon className="w-20 h-20 text-white/20 mx-auto mb-6" />
            <p className="text-white/60 text-xl font-light">Ürün bulunamadı</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:shadow-xl transition-all"
            >
              İlk Ürünü Ekle
            </button>
          </div>
        </div>
      )}

      {/* Modern Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-5xl my-2 sm:my-8">
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 border border-white/20 shadow-2xl">
              {/* Modal Header with Gradient */}
              <div className="sticky top-0 z-10 relative overflow-hidden bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 border-b border-white/10 p-3 sm:p-6 backdrop-blur-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="relative flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h2 className="text-base sm:text-2xl font-bold text-white truncate">
                      {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                    </h2>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all flex items-center justify-center shrink-0"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-3 sm:p-6 max-h-[80vh] overflow-y-auto overscroll-contain">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Left Column */}
                  <div className="space-y-5">
                    {/* Product Name */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                        <Package className="w-4 h-4 text-purple-400" />
                        Ürün Adı *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
                        placeholder="Örn: Mantı"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                        <Grid3x3 className="w-4 h-4 text-purple-400" />
                        Kategori *
                      </label>
                      <select
                        required
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
                      >
                        <option value="" className="bg-gray-900">Kategori Seçin</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id} className="bg-gray-900">
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                        <DollarSign className="w-4 h-4 text-purple-400" />
                        Fiyat (₺) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
                        placeholder="Örn: 45.00"
                      />
                    </div>

                    {/* Display Order */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">
                        Sıralama
                      </label>
                      <input
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
                        placeholder="0"
                      />
                      <p className="text-xs text-white/40 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-white/40" />
                        Küçük değerler önce gösterilir
                      </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">
                        Açıklama
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none resize-none"
                        placeholder="Ürün açıklaması..."
                      />
                    </div>
                  </div>

                  {/* Right Column - Image Upload */}
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">
                        Ürün Görseli
                      </label>
                      <div className="border-2 border-dashed border-white/10 rounded-xl p-2 sm:p-4 bg-white/5 h-40 sm:h-56 lg:h-[320px] flex items-center justify-center">
                        {(localImagePreview || formData.image_url) ? (
                          <div className="relative w-full h-full">
                            <img
                              src={localImagePreview || formData.image_url}
                              alt="Preview"
                              className="w-full h-full object-contain rounded-xl"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (localImagePreview?.startsWith('blob:')) {
                                  URL.revokeObjectURL(localImagePreview);
                                }
                                setLocalImagePreview('');
                                setFormData((prev) => ({ ...prev, image_url: '' }));
                              }}
                              className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            {imageUploading && (
                              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                                <div className="flex items-center gap-3 text-white">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                  <span className="text-sm">Yükleniyor...</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                            <Upload className="w-10 h-10 sm:w-16 sm:h-16 text-white/40 mb-2 sm:mb-4" />
                            <span className="text-xs sm:text-sm text-white/60 mb-1 text-center">Resim yüklemek için tıklayın</span>
                            <span className="text-[10px] sm:text-xs text-white/40">PNG, JPG (Max 5MB)</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                      <p className="text-xs text-white/40">
                        Veya URL girebilirsiniz:
                      </p>
                      <input
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => {
                          if (localImagePreview?.startsWith('blob:')) {
                            URL.revokeObjectURL(localImagePreview);
                          }
                          setLocalImagePreview('');
                          setFormData({ ...formData, image_url: e.target.value });
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions - Full Width at Bottom */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 font-medium transition-all"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={imageUploading}
                    className={`flex-1 relative overflow-hidden group px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/50 transition-all ${imageUploading ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl hover:shadow-purple-500/60'}`}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative">
                      {imageUploading ? 'Yükleniyor...' : (editingProduct ? 'Güncelle' : 'Ekle')}
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
                    <h3 className="text-xl font-bold text-white">Ürünü Sil</h3>
                    <p className="text-sm text-white/60">Bu işlem geri alınamaz</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <p className="text-white/80 leading-relaxed">
                  <span className="font-semibold text-white">{deleteModal.product?.name}</span> ürününü silmek istediğinizden emin misiniz?
                </p>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <p className="text-sm text-red-400 flex items-start gap-2">
                    <span className="mt-0.5">⚠️</span>
                    <span>Bu ürün menüden kalıcı olarak kaldırılacaktır.</span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 p-6 pt-0">
                <button
                  onClick={() => setDeleteModal({ show: false, product: null })}
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
                    Sil
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

export default Products;
