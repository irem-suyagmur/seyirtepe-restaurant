import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Calendar, Clock, Users, Phone, Mail, User, MessageSquare, ShoppingCart, X, Plus, Minus } from 'lucide-react'
import { useCart } from '../context/CartContext'
import api from '../services/api'

const Reservation = () => {
  const { cartItems, getTotalItems, getTotalPrice, updateQuantity, removeFromCart, clearCart } = useCart()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    notes: ''
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' })

  const timeSlots = [
    '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ]

  const guestOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '8+']

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
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
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon gerekli'
    }
    if (!formData.date) {
      newErrors.date = 'Tarih seçin'
    }
    if (!formData.time) {
      newErrors.time = 'Saat seçin'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const submitReservationAndMaybeOrder = async () => {
    setSubmitting(true)
    setSubmitMessage({ type: '', text: '' })

    try {
      const guestsValue = formData.guests === '8+' ? 8 : parseInt(formData.guests, 10)
      const reservationDateTime = new Date(`${formData.date}T${formData.time}:00`)

      const reservationPayload = {
        customer_name: formData.name.trim(),
        customer_email: null,
        customer_phone: formData.phone.trim(),
        date: reservationDateTime.toISOString(),
        guests: Number.isFinite(guestsValue) ? guestsValue : 2,
        special_requests: formData.notes?.trim() || null
      }

      const createdReservation = await api.post('/reservations/', reservationPayload)
      const reservationId = createdReservation?.data?.id

      if (cartItems.length > 0) {
        const orderPayload = {
          customer_name: formData.name.trim(),
          customer_phone: formData.phone.trim(),
          customer_address: null,
          items: cartItems.map((item) => ({
            product_id: Number(item.id) || 0,
            product_name: item.name || 'Ürün',
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0
          })),
          total_amount: Number(getTotalPrice()) || 0,
          notes: [
            reservationId ? `Rezervasyon ID: ${reservationId}` : null,
            `Rezervasyon: ${formData.date} ${formData.time}`,
            `Kişi: ${formData.guests}`,
            formData.notes?.trim() ? `Not: ${formData.notes.trim()}` : null
          ].filter(Boolean).join('\n')
        }

        await api.post('/orders/', orderPayload)
      }

      setSubmitMessage({
        type: 'success',
        text: cartItems.length > 0
          ? 'Rezervasyonunuz ve siparişiniz alındı. Admin panelinden görüntülenebilir.'
          : 'Rezervasyonunuz alındı. Admin panelinden görüntülenebilir.'
      })

      if (cartItems.length > 0) {
        clearCart()
      }

      setFormData({
        name: '',
        phone: '',
        date: '',
        time: '',
        guests: '2',
        notes: ''
      })
    } catch (error) {
      console.error('Reservation submit failed:', error)
      setSubmitMessage({
        type: 'error',
        text: 'Rezervasyon gönderilemedi. Lütfen tekrar deneyin.'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    await submitReservationAndMaybeOrder()
  }

  // Bugünden önceki tarihleri disable et
  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      <Helmet>
        <title>Rezervasyon - Seyirtepe Restaurant</title>
      </Helmet>

      <div className="min-h-screen py-24 px-4">
        <div className="container-custom max-w-5xl">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 px-4">
            <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-amber-500/20 border border-amber-500/30 backdrop-blur-xl mb-3 sm:mb-4">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              <span className="text-amber-300 font-medium text-sm sm:text-base">Rezervasyon</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4">
              Masanızı Ayırtın
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
              Amik Ovası'nın eşsiz manzarasında unutulmaz bir yemek deneyimi için yerinizi şimdi ayırtın
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Cart Summary */}
              {cartItems.length > 0 && (
                <div className="backdrop-blur-xl bg-amber-500/10 border border-amber-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                    <h3 className="text-white font-bold text-base sm:text-lg">Sepetiniz ({getTotalItems()} Ürün)</h3>
                  </div>
                  <div className="space-y-2 sm:space-y-3 max-h-60 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 sm:gap-3 bg-white/5 rounded-lg sm:rounded-xl p-2 sm:p-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm sm:text-base truncate">{item.name}</h4>
                          <p className="text-amber-400 text-xs sm:text-sm">{item.price}₺</p>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                          > 
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </button>
                          <span className="text-white font-medium w-6 sm:w-8 text-center text-sm sm:text-base">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors ml-1 sm:ml-2"
                          >
                            <X className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-amber-500/30">
                    <div className="flex justify-between items-center text-base sm:text-lg font-bold">
                      <span className="text-white">Toplam:</span>
                      <span className="text-amber-400">{getTotalPrice().toFixed(2)}₺</span>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
                {submitMessage.text && (
                  <div className={`mb-6 rounded-xl p-4 border ${
                    submitMessage.type === 'success'
                      ? 'bg-green-500/10 border-green-500/30 text-green-200'
                      : 'bg-red-500/10 border-red-500/30 text-red-200'
                  }`}>
                    {submitMessage.text}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
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

                  {/* Phone */}
                  <div className="md:col-span-2">
                    <label className="block text-white font-medium mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                        errors.phone ? 'border-red-500' : 'border-white/10'
                      } text-white placeholder-white/40 focus:outline-none focus:border-amber-500 transition-colors`}
                      placeholder="0555 123 45 67"
                    />
                    {errors.phone && (
                      <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      <Users className="w-4 h-4 inline mr-2" />
                      Kişi Sayısı
                    </label>
                    <select
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500 transition-colors"
                    >
                      {guestOptions.map(option => (
                        <option key={option} value={option} className="bg-gray-900">
                          {option} Kişi
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Tarih *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      min={today}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                        errors.date ? 'border-red-500' : 'border-white/10'
                      } text-white focus:outline-none focus:border-amber-500 transition-colors`}
                    />
                    {errors.date && (
                      <p className="text-red-400 text-sm mt-1">{errors.date}</p>
                    )}
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Saat *
                    </label>
                    <select
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                        errors.time ? 'border-red-500' : 'border-white/10'
                      } text-white focus:outline-none focus:border-amber-500 transition-colors`}
                    >
                      <option value="" className="bg-gray-900">Saat Seçin</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time} className="bg-gray-900">
                          {time}
                        </option>
                      ))}
                    </select>
                    {errors.time && (
                      <p className="text-red-400 text-sm mt-1">{errors.time}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-white font-medium mb-2">
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Özel İstekler (Opsiyonel)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                      placeholder="Özel istekleriniz veya alerjileriniz varsa belirtebilirsiniz..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl shadow-green-500/30 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  {submitting ? 'Gönderiliyor...' : 'Rezervasyonu Gönder'}
                </button>
              </form>
            </div>

            {/* Info Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold text-xl mb-4">İletişim Bilgileri</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white/60 text-sm">Telefon</p>
                      <a href="tel:+905551234567" className="text-white hover:text-amber-400 transition-colors">
                        +90 555 123 45 67
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white/60 text-sm">E-posta</p>
                      <a href="mailto:info@seyirtepe.com" className="text-white hover:text-amber-400 transition-colors">
                        info@seyirtepe.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold text-xl mb-4">Çalışma Saatleri</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Pazartesi - Cuma</span>
                    <span className="text-white font-medium">10:00 - 23:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Cumartesi - Pazar</span>
                    <span className="text-white font-medium">09:00 - 00:00</span>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="backdrop-blur-xl bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
                <p className="text-amber-300 text-sm">
                  <strong>Not:</strong> Rezervasyonunuz onaylandıktan sonra size e-posta veya telefon ile bilgi verilecektir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Reservation
