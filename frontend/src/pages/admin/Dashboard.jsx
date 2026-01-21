import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { 
  TrendingUp, 
  ShoppingCart, 
  Calendar, 
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import api from '../../services/api'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalReservations: 0,
    totalProducts: 0,
    todayRevenue: 0,
    todayOrders: 0,
    activeOrders: 0,
    deliveredOrders: 0
  })

  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersRes, reservationsRes, productsRes] = await Promise.all([
          api.get('/orders'),
          api.get('/reservations'),
          api.get('/products'),
        ])

        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : []
        const reservations = Array.isArray(reservationsRes.data) ? reservationsRes.data : []
        const products = Array.isArray(productsRes.data) ? productsRes.data : []

        const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
        const totalOrders = orders.length
        const totalReservations = reservations.length
        const totalProducts = products.length

        const now = new Date()
        const isSameDay = (a, b) =>
          a.getFullYear() === b.getFullYear() &&
          a.getMonth() === b.getMonth() &&
          a.getDate() === b.getDate()

        const todayOrdersList = orders.filter((o) => {
          const createdAt = o?.created_at ? new Date(o.created_at) : null
          return createdAt && !Number.isNaN(createdAt.getTime()) && isSameDay(createdAt, now)
        })

        const todayRevenue = todayOrdersList.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
        const todayOrders = todayOrdersList.length

        const isDelivered = (status) => String(status || '').toLowerCase() === 'delivered'
        const isCancelled = (status) => String(status || '').toLowerCase() === 'cancelled'
        const deliveredOrders = orders.filter((o) => isDelivered(o.status)).length
        const activeOrders = orders.filter((o) => !isDelivered(o.status) && !isCancelled(o.status)).length

        setStats({
          totalRevenue,
          totalOrders,
          totalReservations,
          totalProducts,
          todayRevenue,
          todayOrders,
          activeOrders,
          deliveredOrders,
        })

        const formatOrderDate = (value) => {
          const d = value ? new Date(value) : null
          if (!d || Number.isNaN(d.getTime())) return ''
          return d.toLocaleString('tr-TR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
        }

        const sorted = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setRecentOrders(
          sorted.slice(0, 5).map((o) => ({
            id: o.id,
            customer: o.customer_name,
            phone: o.customer_phone,
            items: Array.isArray(o.items)
              ? o.items.map((i) => `${i.product_name} x${i.quantity}`)
              : [],
            total: Number(o.total_amount) || 0,
            status: String(o.status || '').toLowerCase(),
            date: formatOrderDate(o.created_at),
          }))
        )
      } catch (e) {
        // API sorunlarında dashboard'u 0 / boş göster
        setStats({
          totalRevenue: 0,
          totalOrders: 0,
          totalReservations: 0,
          totalProducts: 0,
          todayRevenue: 0,
          todayOrders: 0,
          activeOrders: 0,
          deliveredOrders: 0,
        })
        setRecentOrders([])
        console.error('Dashboard load error:', e)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending':
      case 'confirmed':
      case 'preparing':
      case 'ready':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-white/5 text-white/70 border-white/10'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />
      case 'pending':
      case 'confirmed':
      case 'preparing':
      case 'ready':
        return <Clock className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusText = (status) => {
    switch(status) {
      case 'pending':
        return 'Bekliyor'
      case 'confirmed':
        return 'Onaylandı'
      case 'preparing':
        return 'Hazırlanıyor'
      case 'ready':
        return 'Hazır'
      case 'delivered':
        return 'Teslim'
      case 'cancelled':
        return 'İptal'
      default:
        return 'Bilinmiyor'
    }
  }

  const statCards = [
    {
      title: 'Toplam Ciro',
      value: `₺${stats.totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    },
    {
      title: 'Toplam Sipariş',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30'
    },
    {
      title: 'Rezervasyonlar',
      value: stats.totalReservations.toString(),
      icon: Calendar,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      title: 'Ürünler',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30'
    }
  ]

  const todayStats = [
    {
      title: 'Bugünkü Ciro',
      value: `₺${stats.todayRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      title: 'Bugünkü Sipariş',
      value: stats.todayOrders.toString(),
      icon: Package,
      color: 'text-amber-400'
    },
    {
      title: 'Aktif',
      value: stats.activeOrders.toString(),
      icon: Clock,
      color: 'text-amber-400'
    },
    {
      title: 'Teslim',
      value: stats.deliveredOrders.toString(),
      icon: CheckCircle,
      color: 'text-green-400'
    }
  ]

  return (
    <>
      <Helmet>
        <title>Dashboard - Admin Panel</title>
      </Helmet>

      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-white/60">
            Hoş geldiniz! İşte güncel istatistikleriniz.
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className={`backdrop-blur-xl ${stat.bgColor} border ${stat.borderColor} rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-transform duration-300`}
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  {loading ? (
                    <div className="text-xs sm:text-sm text-white/40">Yükleniyor…</div>
                  ) : null}
                </div>
                <h3 className="text-white/70 text-xs sm:text-sm mb-1">{stat.title}</h3>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
              </div>
            )
          })}
        </div>

        {/* Today Stats */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Bugünkü Özet</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {todayStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-white/60">{stat.title}</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white">Son Siparişler</h2>
            <button className="text-xs sm:text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium">
              Tümünü Gör →
            </button>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Müşteri
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider hidden md:table-cell">
                        Ürünler
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Tutar
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider hidden lg:table-cell">
                        Tarih
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{order.customer}</div>
                            <div className="text-xs text-white/60">{order.phone}</div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                          <div className="text-sm text-white/70 max-w-xs truncate">
                            {order.items.join(', ')}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-green-400">
                            ₺{order.total.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-white/60 hidden lg:table-cell">
                          {order.date}
                        </td>
                      </tr>
                    ))}
                    {!loading && recentOrders.length === 0 ? (
                      <tr>
                        <td className="px-4 sm:px-6 py-6 text-sm text-white/60" colSpan={5}>
                          Henüz sipariş yok.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard
