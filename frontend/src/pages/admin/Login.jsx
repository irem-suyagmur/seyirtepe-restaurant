import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import api from '../../services/api'

const AdminLogin = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gerekli'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta girin'
    }
    
    if (!formData.password) {
      newErrors.password = 'Şifre gerekli'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalı'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const res = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      })

      const token = res?.data?.access_token
      if (!token) {
        setErrors({ password: 'Giriş başarısız (token alınamadı)' })
        return
      }

      localStorage.setItem('adminToken', token)
      navigate('/admin/dashboard')

    } catch (error) {
      const status = error?.response?.status
      if (status === 401) {
        setErrors({ password: 'E-posta veya şifre hatalı' })
      } else {
        setErrors({ password: 'Giriş yapılırken bir hata oluştu' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Admin Girişi - Seyirtepe Restaurant</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(249,115,22,0.1),transparent_50%)]" />

        <div className="relative z-10 w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-4 sm:mb-6 shadow-2xl shadow-amber-500/30">
              <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              Admin Paneli
            </h1>
            <p className="text-sm sm:text-base text-white/60">
              Seyirtepe Restaurant Yönetim Sistemi
            </p>
          </div>

          {/* Login Card */}
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Email */}
              <div>
                <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                  <Mail className="w-4 h-4 inline mr-2" />
                  E-posta
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 sm:py-3.5 rounded-xl bg-white/5 border ${
                    errors.email ? 'border-red-500' : 'border-white/10'
                  } text-white placeholder-white/40 focus:outline-none focus:border-amber-500 focus:bg-white/10 transition-all text-sm sm:text-base`}
                  placeholder="admin@seyirtepe.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Şifre
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 sm:py-3.5 rounded-xl bg-white/5 border ${
                      errors.password ? 'border-red-500' : 'border-white/10'
                    } text-white placeholder-white/40 focus:outline-none focus:border-amber-500 focus:bg-white/10 transition-all pr-12 text-sm sm:text-base`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-white/70 group-hover:text-white transition-colors">
                    Beni Hatırla
                  </span>
                </label>
                <button
                  type="button"
                  className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
                >
                  Şifremi Unuttum
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Giriş Yapılıyor...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Giriş Yap
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials Info */}
            <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <p className="text-xs sm:text-sm text-amber-200 text-center">
                <strong>Not:</strong> Admin giriş bilgileri artık backend üzerinden doğrulanıyor.
              </p>
            </div>
          </div>

          {/* Back to Site */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/')}
              className="text-sm sm:text-base text-white/60 hover:text-white transition-colors"
            >
              ← Siteye Dön
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminLogin
