import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Calendar, Clock, Users, Phone, Mail, User, MessageSquare, ShoppingCart, X, Plus, Minus } from 'lucide-react'
import { useCart } from '../context/CartContext'
import api from '../services/api'

const WHATSAPP_NUMBER = '905524553131' // +90 552 455 31 31

const Reservation = () => {
  const { cartItems, getTotalItems, getTotalPrice, updateQuantity, removeFromCart, clearCart } = useCart()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gerekli'
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

  const createWhatsAppMessage = () => {
    let message = `🍽️ *Seyirtepe Restaurant Rezervasyon*\n\n`
    message += `👤 *İsim:* ${formData.name}\n`
    message += `📧 *E-posta:* ${formData.email}\n`
    message += `📞 *Telefon:* ${formData.phone}\n`
    message += `📅 *Tarih:* ${formData.date}\n`
    message += `🕐 *Saat:* ${formData.time}\n`
    message += `👥 *Kişi Sayısı:* ${formData.guests}\n\n`
    
    if (cartItems.length > 0) {
      message += `🛒 *Sipariş Edilen Ürünler:*\n`
      cartItems.forEach((item, index) => {
        message += `${index + 1}. ${item.name} x${item.quantity} - ${(item.price * item.quantity).toFixed(2)}₺\n`
      })
      message += `\n💰 *Toplam:* ${getTotalPrice().toFixed(2)}₺\n\n`
    }
    
    if (formData.notes.trim()) {
      message += `📝 *Notlar:* ${formData.notes}\n`
    }
    
    return message
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    setSubmitMessage({ type: '', text: '' })

    try {
      const guestsValue = formData.guests === '8+' ? 8 : parseInt(formData.guests, 10)
      const reservationDateTime = new Date(`${formData.date}T${formData.time}:00`)

      const reservationPayload = {
        customer_name: formData.name.trim(),
        customer_email: formData.email.trim(),
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
        email: '',
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
        text: 'Rezervasyon gönderilemedi. Lütfen tekrar deneyin. İsterseniz WhatsApp ile de gönderebilirsiniz.'
      })
    } finally {
      setSubmitting(false)
    }
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

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-white font-medium mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
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
                      placeholder="ornek@mail.com"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">{errors.email}</p>
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  {submitting ? 'Gönderiliyor...' : 'Rezervasyonu Gönder'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const message = createWhatsAppMessage()
                    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
                    window.open(whatsappUrl, '_blank')
                  }}
                  className="w-full mt-3 px-8 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/15 transition-all border border-white/15 flex items-center justify-center gap-2"
                >
                  WhatsApp ile Gönder (Opsiyonel)
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
