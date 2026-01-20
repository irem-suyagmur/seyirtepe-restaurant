import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { 
  TrendingUp, 
  ShoppingCart, 
  Calendar, 
  Users, 
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalReservations: 0,
    totalCustomers: 0,
    todayRevenue: 0,
    todayOrders: 0,
    pendingOrders: 0,
    completedOrders: 0
  })

  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    // TODO: Backend API'den gerçek verileri çek
    // Şimdilik mock data
    setStats({
      totalRevenue: 45750.00,
      totalOrders: 328,
      totalReservations: 156,
      totalCustomers: 892,
      todayRevenue: 3250.00,
      todayOrders: 24,
      pendingOrders: 5,
      completedOrders: 323
    })

    setRecentOrders([
      {
        id: 1,
        customer: 'Ahmet Yılmaz',
        phone: '0555 123 45 67',
        items: ['Menemen x1', 'Serpme Kahvaltı x2'],
        total: 325.00,
        status: 'completed',
        date: '2026-01-19 14:30'
      },
      {
        id: 2,
        customer: 'Ayşe Kaya',
        phone: '0532 987 65 43',
        items: ['Sucuklu Yumurta x1', 'Çay x2'],
        total: 150.00,
        status: 'pending',
        date: '2026-01-19 14:15'
      },
      {
        id: 3,
        customer: 'Mehmet Demir',
        phone: '0544 765 43 21',
        items: ['Kahvaltı Tabağı x3'],
        total: 450.00,
        status: 'completed',
        date: '2026-01-19 13:45'
      },
      {
        id: 4,
        customer: 'Fatma Şahin',
        phone: '0505 456 78 90',
        items: ['Omlet x2', 'Türk Kahvesi x2'],
        total: 180.00,
        status: 'pending',
        date: '2026-01-19 13:20'
      },
      {
        id: 5,
        customer: 'Ali Öztürk',
        phone: '0533 234 56 78',
        items: ['Gözleme x4', 'Ayran x4'],
        total: 280.00,
        status: 'cancelled',
        date: '2026-01-19 12:50'
      }
    ])
  }, [])

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-white/5 text-white/70 border-white/10'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusText = (status) => {
    switch(status) {
      case 'completed':
        return 'Tamamlandı'
      case 'pending':
        return 'Bekliyor'
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
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    },
    {
      title: 'Toplam Sipariş',
      value: stats.totalOrders.toString(),
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30'
    },
    {
      title: 'Rezervasyonlar',
      value: stats.totalReservations.toString(),
      change: '+15.3%',
      trend: 'up',
      icon: Calendar,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      title: 'Toplam Müşteri',
      value: stats.totalCustomers.toString(),
      change: '+6.8%',
      trend: 'up',
      icon: Users,
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
      title: 'Bekleyen',
      value: stats.pendingOrders.toString(),
      icon: Clock,
      color: 'text-amber-400'
    },
    {
      title: 'Tamamlanan',
      value: stats.completedOrders.toString(),
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
                  <div className="flex items-center gap-1 text-green-400 text-xs sm:text-sm font-medium">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                    {stat.change}
                  </div>
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
