import { useState, useEffect } from 'react';
import { Calendar, Users, Mail, Phone, Clock, Filter, Check, X, Eye, MessageSquare, Search } from 'lucide-react';
import api from '../../services/api';

function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await api.get('/reservations');
      const data = response.data;
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      showMessage('error', 'Rezervasyonlar yüklenirken hata oluştu');
      console.error('Error fetching reservations:', error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const updateReservationStatus = async (id, status) => {
    try {
      await api.patch(`/reservations/${id}`, { status });
      showMessage('success', `Rezervasyon ${getStatusText(status)} olarak işaretlendi`);
      fetchReservations();
      setShowDetailModal(false);
    } catch (error) {
      showMessage('error', 'Durum güncellenirken hata oluştu');
      console.error('Error updating reservation:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400';
      case 'confirmed': return 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400';
      case 'cancelled': return 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400';
      case 'completed': return 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400';
      default: return 'from-gray-500/20 to-gray-600/20 border-gray-500/30 text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'confirmed': return 'Onaylandı';
      case 'cancelled': return 'İptal Edildi';
      case 'completed': return 'Tamamlandı';
      default: return status;
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesStatus = filterStatus === 'all' || reservation.status === filterStatus;
    const term = searchTerm.toLowerCase();
    const customerName = String(reservation.customer_name || '').toLowerCase();
    const customerPhone = String(reservation.customer_phone || '');
    const customerEmail = String(reservation.customer_email || '').toLowerCase();
    const matchesSearch = customerName.includes(term) || customerPhone.includes(searchTerm) || customerEmail.includes(term);
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      {/* Modern Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-green-500/20 border border-green-500/30 backdrop-blur-xl p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/50">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Rezervasyonlar</h1>
              <p className="text-white/60">Müşteri rezervasyonlarını yönetin</p>
            </div>
          </div>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1">Toplam</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center">
              <Calendar className="w-7 h-7 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1">Beklemede</p>
              <p className="text-3xl font-bold text-white">{stats.pending}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-7 h-7 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1">Onaylandı</p>
              <p className="text-3xl font-bold text-white">{stats.confirmed}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center">
              <Check className="w-7 h-7 text-green-400" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/30 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1">İptal</p>
              <p className="text-3xl font-bold text-white">{stats.cancelled}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center">
              <X className="w-7 h-7 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Filtrele</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Müşteri ara (isim, telefon, email)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
          >
            <option value="all" className="bg-gray-900">Tüm Durumlar</option>
            <option value="pending" className="bg-gray-900">Beklemede</option>
            <option value="confirmed" className="bg-gray-900">Onaylandı</option>
            <option value="cancelled" className="bg-gray-900">İptal Edildi</option>
            <option value="completed" className="bg-gray-900">Tamamlandı</option>
          </select>
        </div>
      </div>

      {/* Reservations List */}
      <div className="space-y-4">
        {filteredReservations.map((reservation) => (
          <div
            key={reservation.id}
            className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20 hover:border-green-500/50 transition-all duration-300 p-6"
          >
            {/* Animated Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-emerald-500/0 to-green-500/0 group-hover:from-green-500/10 group-hover:via-emerald-500/10 group-hover:to-green-500/10 transition-all duration-500" />
            
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Customer Info */}
              <div className="lg:col-span-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{reservation.customer_name}</h3>
                    <p className="text-sm text-white/60">{reservation.guests} Kişi</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="lg:col-span-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-white/40" />
                  <span className="text-white/80">{reservation.customer_phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-white/40" />
                  <span className="text-white/80 truncate">{reservation.customer_email}</span>
                </div>
              </div>

              {/* Date & Time */}
              <div className="lg:col-span-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-white/40" />
                  <div>
                    <p className="text-white font-medium">{formatDate(reservation.date)}</p>
                    <p className="text-xs text-white/60">
                      Oluşturulma: {new Date(reservation.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="lg:col-span-3 flex items-center gap-3">
                <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getStatusColor(reservation.status)} border backdrop-blur-xl font-medium text-sm`}>
                  {getStatusText(reservation.status)}
                </div>
                <button
                  onClick={() => {
                    setSelectedReservation(reservation);
                    setShowDetailModal(true);
                  }}
                  className="relative overflow-hidden group/btn px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 hover:text-white font-medium transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                  <span className="relative flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Detay
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReservations.length === 0 && (
        <div className="text-center py-20">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-16 max-w-md mx-auto">
            <Calendar className="w-20 h-20 text-white/20 mx-auto mb-6" />
            <p className="text-white/60 text-xl font-light">Rezervasyon bulunamadı</p>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReservation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-2xl">
            <div className="relative overflow-hidden rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 border border-white/20 shadow-2xl">
              {/* Header */}
              <div className="relative overflow-hidden bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20 border-b border-white/10 p-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl" />
                <div className="relative flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Rezervasyon Detayları</h2>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-400" />
                    Müşteri Bilgileri
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-white/60">Ad Soyad</p>
                      <p className="text-white font-medium">{selectedReservation.customer_name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-white/60">Telefon</p>
                      <p className="text-white font-medium">{selectedReservation.customer_phone}</p>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-sm text-white/60">Email</p>
                      <p className="text-white font-medium">{selectedReservation.customer_email}</p>
                    </div>
                  </div>
                </div>

                {/* Reservation Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-400" />
                    Rezervasyon Bilgileri
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-white/60">Tarih & Saat</p>
                      <p className="text-white font-medium">{formatDate(selectedReservation.date)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-white/60">Kişi Sayısı</p>
                      <p className="text-white font-medium">{selectedReservation.guests} Kişi</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-white/60">Durum</p>
                      <div className={`inline-flex px-3 py-1 rounded-lg bg-gradient-to-r ${getStatusColor(selectedReservation.status)} border backdrop-blur-xl font-medium text-sm`}>
                        {getStatusText(selectedReservation.status)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-white/60">Oluşturulma Tarihi</p>
                      <p className="text-white font-medium">{formatDate(selectedReservation.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {selectedReservation.special_requests && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-green-400" />
                      Özel İstekler
                    </h3>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-white/80 leading-relaxed">{selectedReservation.special_requests}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedReservation.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={() => updateReservationStatus(selectedReservation.id, 'confirmed')}
                      className="flex-1 relative overflow-hidden group px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/60 transition-all"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <span className="relative flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" />
                        Onayla
                      </span>
                    </button>
                    <button
                      onClick={() => updateReservationStatus(selectedReservation.id, 'cancelled')}
                      className="flex-1 relative overflow-hidden group px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/60 transition-all"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <span className="relative flex items-center justify-center gap-2">
                        <X className="w-5 h-5" />
                        İptal Et
                      </span>
                    </button>
                  </div>
                )}

                {selectedReservation.status === 'confirmed' && (
                  <div className="flex gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={() => updateReservationStatus(selectedReservation.id, 'completed')}
                      className="flex-1 relative overflow-hidden group px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 transition-all"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <span className="relative flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" />
                        Tamamlandı Olarak İşaretle
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reservations;
