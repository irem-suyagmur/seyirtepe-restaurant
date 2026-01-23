import { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Loader2, Sparkles, ChefHat, ShoppingCart } from 'lucide-react';
import { getCategoriesWithProducts, toAbsoluteApiUrl, normalizeUploadsUrl } from '../services/api';
import { useCart } from '../context/CartContext';

const Menu = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCategoriesWithProducts();
      const categories = Array.isArray(data) ? data : [];
      setCategories(categories);
      if (categories.length > 0) {
        setSelectedCategory(categories[0].id);
      }
    } catch (err) {
      setError('Menü yüklenirken bir hata oluştu.');
      console.error('Menu fetch error:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectedCategoryData = useMemo(
    () => categories.find(cat => cat.id === selectedCategory),
    [categories, selectedCategory]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <Loader2 className="w-12 h-12 text-amber-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-3xl p-8 text-center max-w-md">
          <p className="text-red-400 text-lg">{error}</p>
          <button
            onClick={fetchMenuData}
            className="mt-4 px-6 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Menü - Seyirtepe Restaurant</title>
      </Helmet>

      <div className="min-h-screen py-20 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Modern Header */}
          <div className="text-center mb-10 sm:mb-16 space-y-4 sm:space-y-6">
            {/* Floating Badge */}
            <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/30 backdrop-blur-xl">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              <span className="text-amber-300 font-medium text-sm sm:text-base">Özel Menü</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight px-4">
              <span className="block bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                Lezzet Yolculuğu
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/60 max-w-3xl mx-auto font-light px-4">
              Hatay'ın zengin mutfak kültürünü modern dokunuşlarla sunan özel tariflerimizi keşfedin
            </p>

            {/* Cart and Reservation Buttons */}
            {getTotalItems() > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6 sm:mt-8 px-4">
                <button
                  onClick={() => navigate('/reservation')}
                  className="relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Sepetteki Ürünlerle Rezervasyon Yap</span>
                  <span className="sm:hidden">Sepete Git</span>
                  <span className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">
                    {getTotalItems()}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Ultra Modern Category Pills */}
          <div className="mb-10 sm:mb-16 overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex gap-2 sm:gap-3 justify-start sm:justify-center min-w-max px-4">
              {categories.map((category, index) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`group relative px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'text-white'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  {/* Background Gradient */}
                  {selectedCategory === category.id && (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl" />
                  )}
                  
                  {/* Hover Effect */}
                  {selectedCategory !== category.id && (
                    <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}

                  <span className="relative z-10 flex items-center gap-2">
                    {selectedCategory === category.id && <ChefHat className="w-5 h-5" />}
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid - Bento Style */}
          {selectedCategoryData && selectedCategoryData.products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {selectedCategoryData.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {selectedCategoryData && selectedCategoryData.products.length === 0 && (
            <div className="text-center py-20">
              <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-16 max-w-md mx-auto">
                <ChefHat className="w-20 h-20 text-white/20 mx-auto mb-6" />
                <p className="text-white/40 text-xl font-light">
                  Bu kategoride henüz ürün bulunmuyor
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Optimized Product Card with memo
const ProductCard = memo(({ product }) => {
  const { addToCart } = useCart();
  
  const handleAddToCart = useCallback(() => {
    addToCart(product);
    // Show a brief notification (optional)
    const btn = document.activeElement;
    const originalText = btn?.textContent;
    if (btn) {
      btn.textContent = 'Sepete Eklendi!';
      setTimeout(() => {
        if (btn) btn.textContent = originalText;
      }, 1000);
    }
  }, [product, addToCart]);

  return (
    <div className="group relative">
      <div className="relative h-full backdrop-blur-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20 rounded-3xl overflow-hidden shadow-2xl hover:-translate-y-2 transition-transform duration-300">
        {/* Animated Gradient Overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.15), transparent 70%)',
          }}
        />

        {/* Product Image or Placeholder */}
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-amber-500/10 to-orange-500/10">
          {product.image_url ? (
            <>
              <img
                src={toAbsoluteApiUrl(normalizeUploadsUrl(product.image_url))}
                alt={product.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ChefHat className="w-20 h-20 text-amber-500/30" />
            </div>
          )}

          {/* Floating Price Tag */}
          <div className="absolute top-4 right-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur-lg opacity-75" />
              <div className="relative backdrop-blur-xl bg-gradient-to-br from-amber-500 to-orange-600 px-5 py-3 rounded-2xl border border-amber-300/30">
                <span className="text-white font-bold text-xl">{product.price}₺</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Product Name */}
          <h3 className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors duration-300">
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-white/60 leading-relaxed line-clamp-2 text-sm">
              {product.description}
            </p>
          )}

          {/* Action Button */}
          <button 
            onClick={handleAddToCart}
            className="w-full relative overflow-hidden group/btn"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            <div className="relative px-6 py-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 group-hover/btn:border-transparent transition-all duration-300 flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-400 group-hover/btn:text-white transition-colors duration-300" />
              <span className="text-amber-400 group-hover/btn:text-white font-semibold transition-colors duration-300">
                Sepete Ekle
              </span>
            </div>
          </button>
        </div>

        {/* Decorative Corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default Menu;
