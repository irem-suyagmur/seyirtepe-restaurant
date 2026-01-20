import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react'
import { sendContactMessage } from '../services/api'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errors, setErrors] = useState({})

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
    
    if (!formData.name.trim()) {
      newErrors.name = 'İsim gerekli'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gerekli'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta girin'
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Konu gerekli'
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Mesaj gerekli'
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
      await sendContactMessage(formData)
      
      setSubmitSuccess(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })

      setTimeout(() => {
        setSubmitSuccess(false)
      }, 5000)

    } catch (error) {
      console.error('Contact error:', error)
      const errorMessage = error.response?.data?.detail || 'Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.'
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>İletişim - Seyirtepe Restaurant</title>
      </Helmet>

      <div className="min-h-screen py-20 sm:py-24 px-4">
        <div className="container-custom max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-amber-500/20 border border-amber-500/30 backdrop-blur-xl mb-3 sm:mb-4">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              <span className="text-amber-300 font-medium text-sm sm:text-base">İletişim</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4">
              Bize Ulaşın
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto px-4">
              Sorularınız, önerileriniz veya rezervasyon talepleriniz için bize ulaşabilirsiniz
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              {/* Phone */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-3 sm:mb-4">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-white font-bold text-base sm:text-lg mb-1 sm:mb-2">Telefon</h3>
                <a href="tel:+905551234567" className="text-white/70 hover:text-amber-400 transition-colors text-sm sm:text-base">
                  +90 555 123 45 67
                </a>
              </div>

              {/* Email */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-3 sm:mb-4">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-white font-bold text-base sm:text-lg mb-1 sm:mb-2">E-posta</h3>
                <a href="mailto:info@seyirtepe.com" className="text-white/70 hover:text-amber-400 transition-colors text-sm sm:text-base break-all">
                  info@seyirtepe.com
                </a>
              </div>

              {/* Address */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-3 sm:mb-4">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-white font-bold text-base sm:text-lg mb-1 sm:mb-2">Adres</h3>
                <p className="text-white/70 text-sm sm:text-base">
                  Amik Ovası, Reyhanlı Yolu<br />
                  Hatay, Türkiye
                </p>
              </div>

              {/* Working Hours */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-4">Çalışma Saatleri</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Pazartesi - Cuma</span>
                    <span className="text-white">10:00 - 23:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Cumartesi - Pazar</span>
                    <span className="text-white">09:00 - 00:00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Mesaj Gönderin</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      İsim Soyisim *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                        errors.name ? 'border-red-500' : 'border-white/10'
                      } text-white placeholder-white/40 focus:outline-none focus:border-amber-500 transition-colors`}
                      placeholder="Adınız Soyadınız"
                    />
                    {errors.name && (
                      <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      E-posta *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                        errors.email ? 'border-red-500' : 'border-white/10'
                      } text-white placeholder-white/40 focus:outline-none focus:border-amber-500 transition-colors`}
                      placeholder="ornek@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Telefon (Opsiyonel)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="0555 123 45 67"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Konu *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                        errors.subject ? 'border-red-500' : 'border-white/10'
                      } text-white placeholder-white/40 focus:outline-none focus:border-amber-500 transition-colors`}
                      placeholder="Mesaj konusu"
                    />
                    {errors.subject && (
                      <p className="text-red-400 text-sm mt-1">{errors.subject}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="md:col-span-2">
                    <label className="block text-white font-medium mb-2">
                      Mesajınız *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="6"
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                        errors.message ? 'border-red-500' : 'border-white/10'
                      } text-white placeholder-white/40 focus:outline-none focus:border-amber-500 transition-colors resize-none`}
                      placeholder="Mesajınızı buraya yazın..."
                    />
                    {errors.message && (
                      <p className="text-red-400 text-sm mt-1">{errors.message}</p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  {isSubmitting ? 'Gönderiliyor...' : 'Mesaj Gönder'}
                </button>
              </form>

              {/* Success Message */}
              {submitSuccess && (
                <div className="mt-6 backdrop-blur-xl bg-green-500/20 border border-green-500/30 rounded-2xl p-6 flex items-center gap-4">
                  <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-bold text-lg">Mesaj Gönderildi!</h3>
                    <p className="text-white/80">En kısa sürede size dönüş yapacağız.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Contact
