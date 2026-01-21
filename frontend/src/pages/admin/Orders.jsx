import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { ShoppingCart, Clock, Package, CheckCircle, XCircle, Filter, Search, Bell, Volume2, VolumeX, User, DollarSign } from 'lucide-react';
import api from '../../services/api';

const POLL_INTERVAL_MS = 8000;
const ALARM_BEEPS = 28;

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem('ordersSoundEnabled') !== '0';
    } catch {
      return true;
    }
  });

  const lastSeenOrderIdRef = useRef(null);
  const didInitialLoadRef = useRef(false);
  const audioCtxRef = useRef(null);
  const titleRef = useRef(typeof document !== 'undefined' ? document.title : '');
  const blinkTimerRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('ordersSoundEnabled', soundEnabled ? '1' : '0');
    } catch {
      // ignore
    }
  }, [soundEnabled]);

  useEffect(() => {
    fetchOrders();

    const timer = setInterval(() => {
      fetchOrders({ silent: true });
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(timer);
      if (blinkTimerRef.current) {
        clearInterval(blinkTimerRef.current);
        blinkTimerRef.current = null;
      }
      if (typeof document !== 'undefined' && titleRef.current) {
        document.title = titleRef.current;
      }
    };
  }, []);

  const ensureAudioContext = () => {
    if (audioCtxRef.current) return audioCtxRef.current;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtxRef.current = new Ctx();
    return audioCtxRef.current;
  };

  const playAnnoyingAlarm = () => {
    const ctx = ensureAudioContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch {
      // ignore
    }

    const now = ctx.currentTime;
    const beepDuration = 0.18;
    const gap = 0.06;
    const baseFreq = 920;

    for (let i = 0; i < ALARM_BEEPS; i += 1) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      const startAt = now + i * (beepDuration + gap);
      // alternate higher tone and add slight sweep for extra annoyance
      const freqA = baseFreq + (i % 2 === 0 ? 0 : 260);
      const freqB = freqA + 120;
      osc.frequency.setValueAtTime(freqA, startAt);
      osc.frequency.linearRampToValueAtTime(freqB, startAt + Math.max(0.01, beepDuration - 0.03));

      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.42, startAt + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + beepDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startAt);
      osc.stop(startAt + beepDuration + 0.02);
    }
  };

  const blinkTitle = () => {
    if (typeof document === 'undefined') return;
    const original = titleRef.current || document.title;
    titleRef.current = original;

    if (blinkTimerRef.current) {
      clearInterval(blinkTimerRef.current);
    }

    let on = false;
    blinkTimerRef.current = setInterval(() => {
      on = !on;
      document.title = on ? '🔔 YENİ SİPARİŞ!' : original;
    }, 700);

    setTimeout(() => {
      if (blinkTimerRef.current) {
        clearInterval(blinkTimerRef.current);
        blinkTimerRef.current = null;
      }
      document.title = original;
    }, 10000);
  };

  const triggerNewOrderAlert = (count) => {
    showMessage('success', `Yeni sipariş geldi (${count})`);

    if (soundEnabled) {
      playAnnoyingAlarm();
    }

    if (navigator?.vibrate) {
      try {
        navigator.vibrate([200, 100, 200, 100, 400]);
      } catch {
        // ignore
      }
    }

    blinkTitle();

    if (typeof Notification !== 'undefined' && document?.hidden) {
      try {
        if (Notification.permission === 'granted') {
          new Notification('Yeni Sipariş!', { body: `Yeni sipariş sayısı: ${count}` });
        }
      } catch {
        // ignore
      }
    }
  };

  const fetchOrders = async ({ silent = false } = {}) => {
    try {
      const response = await api.get('/orders');
      const data = response.data;
      const list = Array.isArray(data) ? data : [];
      setOrders(list);

      const maxId = list.reduce((acc, o) => Math.max(acc, Number(o?.id) || 0), 0);
      const lastSeen = Number(lastSeenOrderIdRef.current) || 0;

      if (!didInitialLoadRef.current) {
        didInitialLoadRef.current = true;
        lastSeenOrderIdRef.current = maxId;
      } else if (maxId > lastSeen) {
        const newCount = list.filter((o) => (Number(o?.id) || 0) > lastSeen).length || 1;
        lastSeenOrderIdRef.current = maxId;
        if (!silent) {
          triggerNewOrderAlert(newCount);
        } else {
          // even in silent polling, still alert on new orders
          triggerNewOrderAlert(newCount);
        }
      }
    } catch (error) {
      if (!silent) {
        showMessage('error', 'Siparişler yüklenirken hata oluştu');
      }
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading((prev) => (prev ? false : prev));
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}`, { status });
      showMessage('success', `Sipariş durumu güncellendi: ${getStatusText(status)}`);
      fetchOrders();
      setShowDetailModal(false);
    } catch (error) {
      showMessage('error', 'Durum güncellenirken hata oluştu');
      console.error('Error updating order:', error);
    }
  };

  const getStatusColor = (status) => {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'delivered':
        return 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400';
      case 'ready':
        return 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400';
      case 'preparing':
        return 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400';
      case 'confirmed':
        return 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-400';
      case 'pending':
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400';
      case 'cancelled':
        return 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400';
      default:
        return 'from-gray-500/20 to-gray-600/20 border-gray-500/30 text-gray-400';
    }
  };

  const getStatusText = (status) => {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'pending':
        return 'Bekliyor';
      case 'confirmed':
        return 'Onaylandı';
      case 'preparing':
        return 'Hazırlanıyor';
      case 'ready':
        return 'Hazır';
      case 'delivered':
        return 'Teslim Edildi';
      case 'cancelled':
        return 'İptal';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || String(order.status || '').toLowerCase() === filterStatus;
    const matchesSearch = 
      (order.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer_phone || '').includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => String(o.status || '').toLowerCase() === 'pending').length,
    confirmed: orders.filter(o => String(o.status || '').toLowerCase() === 'confirmed').length,
    preparing: orders.filter(o => String(o.status || '').toLowerCase() === 'preparing').length,
    delivered: orders.filter(o => String(o.status || '').toLowerCase() === 'delivered').length,
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
    <>
      <Helmet>
        <title>Siparişler - Admin Panel</title>
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/30 backdrop-blur-xl p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/50">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Siparişler</h1>
                <p className="text-white/60">Müşteri siparişlerini yönetin</p>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    // prime audio context on user gesture
                    try {
                      ensureAudioContext();
                    } catch {
                      // ignore
                    }
                    setSoundEnabled((v) => !v);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-xl transition-all ${
                    soundEnabled
                      ? 'bg-red-500/15 border-red-500/30 text-red-200 hover:bg-red-500/20'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                  title={soundEnabled ? 'Sesli bildirim açık' : 'Sesli bildirim kapalı'}
                >
                  <Bell className="w-4 h-4" />
                  {soundEnabled ? (
                    <>
                      <Volume2 className="w-4 h-4" />
                      Ses Açık
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4" />
                      Sessiz
                    </>
                  )}
                </button>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm mb-1">Toplam</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                <ShoppingCart className="w-7 h-7 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm mb-1">Bekliyor</p>
                <p className="text-3xl font-bold text-white">{stats.pending}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
                <Clock className="w-7 h-7 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/30 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm mb-1">Onaylandı</p>
                <p className="text-3xl font-bold text-white">{stats.confirmed}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm mb-1">Hazırlanıyor</p>
                <p className="text-3xl font-bold text-white">{stats.preparing}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                <Package className="w-7 h-7 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm mb-1">Teslim</p>
                <p className="text-3xl font-bold text-white">{stats.delivered}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Filtrele</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Müşteri ara (isim, telefon)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
            >
              <option value="all" className="bg-gray-900">Tüm Durumlar</option>
              <option value="pending" className="bg-gray-900">Bekliyor</option>
              <option value="confirmed" className="bg-gray-900">Onaylandı</option>
              <option value="preparing" className="bg-gray-900">Hazırlanıyor</option>
              <option value="ready" className="bg-gray-900">Hazır</option>
              <option value="delivered" className="bg-gray-900">Teslim Edildi</option>
              <option value="cancelled" className="bg-gray-900">İptal</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20 hover:border-amber-500/50 transition-all duration-300 p-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-orange-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:via-orange-500/10 group-hover:to-amber-500/10 transition-all duration-500" />
              
              <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                {/* Customer Info */}
                <div className="lg:col-span-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{order.customer_name}</h3>
                      <p className="text-sm text-white/60">{order.customer_phone}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="lg:col-span-3">
                  <div className="space-y-1">
                    {Array.isArray(order.items) && order.items.length > 0 ? (
                      <>
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="text-sm text-white/80">
                            {item.product_name || 'Ürün'} x{item.quantity || 1}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-xs text-white/50">
                            +{order.items.length - 2} ürün daha
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-white/60">Ürün bilgisi yok</div>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <span className="text-xl font-bold text-green-400">
                      ₺{Number(order.total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="lg:col-span-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border bg-gradient-to-br ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {getStatusText(order.status)}
                  </span>
                </div>

                {/* Actions */}
                <div className="lg:col-span-2 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetailModal(true);
                    }}
                    className="flex-1 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all"
                  >
                    Detay
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="text-center py-12 text-white/60">
              {searchTerm || filterStatus !== 'all' ? 'Filtre kriterlerine uygun sipariş bulunamadı.' : 'Henüz sipariş yok.'}
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetailModal(false)}>
            <div className="relative max-w-2xl w-full rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-white mb-6">Sipariş Detayı</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-white/60">Müşteri</p>
                  <p className="text-lg font-semibold text-white">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60">Telefon</p>
                  <p className="text-lg text-white">{selectedOrder.customer_phone}</p>
                </div>
                {selectedOrder.customer_address && (
                  <div>
                    <p className="text-sm text-white/60">Adres</p>
                    <p className="text-lg text-white">{selectedOrder.customer_address}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-white/60 mb-2">Ürünler</p>
                  <div className="space-y-2">
                    {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                          <span className="text-white">{item.product_name || 'Ürün'} x{item.quantity || 1}</span>
                          <span className="text-green-400 font-semibold">₺{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-white/60 p-3">Ürün bilgisi yok</div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <span className="text-lg font-semibold text-white">Toplam</span>
                  <span className="text-2xl font-bold text-green-400">₺{Number(selectedOrder.total_amount || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateOrderStatus(selectedOrder.id, status)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      String(selectedOrder.status || '').toLowerCase() === status
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {getStatusText(status)}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="mt-6 w-full px-4 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-all"
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Orders;
