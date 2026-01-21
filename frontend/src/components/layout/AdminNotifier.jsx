import { useEffect, useRef, useState } from 'react'
import { Bell, Volume2, VolumeX, Play } from 'lucide-react'
import api from '../../services/api'

const POLL_INTERVAL_MS = 8000
const ALARM_BEEPS = 6

const safeMaxId = (list) => {
  if (!Array.isArray(list) || list.length === 0) return 0
  return list.reduce((acc, item) => Math.max(acc, Number(item?.id) || 0), 0)
}

const countNewerThan = (list, lastSeenId) => {
  if (!Array.isArray(list) || list.length === 0) return 0
  const last = Number(lastSeenId) || 0
  return list.filter((item) => (Number(item?.id) || 0) > last).length
}

export default function AdminNotifier() {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem('adminSoundEnabled') !== '0'
    } catch {
      return true
    }
  })

  const [toast, setToast] = useState({ text: '', type: '' })

  const audioCtxRef = useRef(null)
  const didInitialRef = useRef(false)
  const lastSeenOrderIdRef = useRef(0)
  const lastSeenReservationIdRef = useRef(0)

  const titleRef = useRef(typeof document !== 'undefined' ? document.title : '')
  const blinkTimerRef = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem('adminSoundEnabled', enabled ? '1' : '0')
    } catch {
      // ignore
    }
  }, [enabled])

  useEffect(() => {
    const tick = () => {
      poll({ silent: true })
    }

    poll({ silent: false })
    const timer = setInterval(tick, POLL_INTERVAL_MS)

    return () => {
      clearInterval(timer)
      if (blinkTimerRef.current) {
        clearInterval(blinkTimerRef.current)
        blinkTimerRef.current = null
      }
      if (typeof document !== 'undefined' && titleRef.current) {
        document.title = titleRef.current
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showToast = (type, text) => {
    setToast({ type, text })
    setTimeout(() => setToast({ type: '', text: '' }), 3500)
  }

  const ensureAudioContext = () => {
    if (audioCtxRef.current) return audioCtxRef.current
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null
    audioCtxRef.current = new Ctx()
    return audioCtxRef.current
  }

  const playAnnoyingAlarm = () => {
    const ctx = ensureAudioContext()
    if (!ctx) return

    try {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
      }
    } catch {
      // ignore
    }

    const now = ctx.currentTime
    const beepDuration = 0.12
    const gap = 0.08
    const baseFreq = 880

    for (let i = 0; i < ALARM_BEEPS; i += 1) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'square'
      osc.frequency.setValueAtTime(baseFreq + (i % 2 === 0 ? 0 : 220), now)

      const startAt = now + i * (beepDuration + gap)
      gain.gain.setValueAtTime(0.0001, startAt)
      gain.gain.exponentialRampToValueAtTime(0.35, startAt + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + beepDuration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startAt)
      osc.stop(startAt + beepDuration + 0.02)
    }
  }

  const blinkTitle = (label) => {
    if (typeof document === 'undefined') return
    const original = titleRef.current || document.title
    titleRef.current = original

    if (blinkTimerRef.current) {
      clearInterval(blinkTimerRef.current)
    }

    let on = false
    blinkTimerRef.current = setInterval(() => {
      on = !on
      document.title = on ? `🔔 ${label}` : original
    }, 700)

    setTimeout(() => {
      if (blinkTimerRef.current) {
        clearInterval(blinkTimerRef.current)
        blinkTimerRef.current = null
      }
      document.title = original
    }, 10000)
  }

  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') return
    if (Notification.permission === 'granted' || Notification.permission === 'denied') return
    try {
      await Notification.requestPermission()
    } catch {
      // ignore
    }
  }

  const triggerAlert = ({ ordersCount = 0, reservationsCount = 0 }) => {
    const parts = []
    if (ordersCount > 0) parts.push(`Sipariş: ${ordersCount}`)
    if (reservationsCount > 0) parts.push(`Rezervasyon: ${reservationsCount}`)

    const msg = `Yeni kayıt geldi (${parts.join(' • ')})`
    showToast('success', msg)

    if (enabled) {
      playAnnoyingAlarm()
    }

    if (navigator?.vibrate) {
      try {
        navigator.vibrate([200, 100, 200, 100, 400])
      } catch {
        // ignore
      }
    }

    blinkTitle('YENİ SİPARİŞ/REZERVASYON!')

    if (typeof Notification !== 'undefined' && document?.hidden) {
      try {
        if (Notification.permission === 'granted') {
          new Notification('Yeni Kayıt!', { body: msg })
        }
      } catch {
        // ignore
      }
    }
  }

  const poll = async ({ silent } = { silent: true }) => {
    try {
      const [ordersRes, reservationsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/reservations')
      ])

      const ordersList = Array.isArray(ordersRes.data) ? ordersRes.data : []
      const reservationsList = Array.isArray(reservationsRes.data) ? reservationsRes.data : []

      const maxOrderId = safeMaxId(ordersList)
      const maxReservationId = safeMaxId(reservationsList)

      if (!didInitialRef.current) {
        didInitialRef.current = true
        lastSeenOrderIdRef.current = maxOrderId
        lastSeenReservationIdRef.current = maxReservationId
        return
      }

      const lastOrderId = lastSeenOrderIdRef.current
      const lastReservationId = lastSeenReservationIdRef.current

      const newOrders = maxOrderId > lastOrderId ? countNewerThan(ordersList, lastOrderId) || 1 : 0
      const newReservations = maxReservationId > lastReservationId ? countNewerThan(reservationsList, lastReservationId) || 1 : 0

      if (newOrders > 0 || newReservations > 0) {
        lastSeenOrderIdRef.current = Math.max(lastOrderId, maxOrderId)
        lastSeenReservationIdRef.current = Math.max(lastReservationId, maxReservationId)

        // even in silent polling, we still alert
        triggerAlert({ ordersCount: newOrders, reservationsCount: newReservations })
      }
    } catch (err) {
      if (!silent) {
        showToast('error', 'Bildirim kontrolü başarısız')
      }
      // swallow errors (network etc.)
    }
  }

  const onToggle = async () => {
    // user gesture: prime audio + request notification permission
    try {
      ensureAudioContext()
    } catch {
      // ignore
    }
    await requestNotificationPermission()
    setEnabled((v) => !v)
  }

  const onTest = async () => {
    try {
      ensureAudioContext()
    } catch {
      // ignore
    }
    await requestNotificationPermission()
    playAnnoyingAlarm()
    showToast('success', 'Test sesi çalındı')
  }

  return (
    <div className="flex items-center gap-2">
      {toast.text ? (
        <div
          className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-xl text-xs ${
            toast.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-200'
              : 'bg-red-500/10 border-red-500/30 text-red-200'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
          <span className="whitespace-nowrap">{toast.text}</span>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onTest}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 backdrop-blur-xl transition-all"
        title="Test bildirimi (ses çal)"
      >
        <Play className="w-4 h-4" />
        <span className="font-medium">Test Ses</span>
      </button>

      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-xl transition-all ${
          enabled
            ? 'bg-red-500/15 border-red-500/30 text-red-200 hover:bg-red-500/20'
            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
        }`}
        title={enabled ? 'Sesli bildirim açık' : 'Sesli bildirim kapalı'}
      >
        <Bell className="w-4 h-4" />
        {enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        <span className="hidden md:inline">{enabled ? 'Ses Açık' : 'Sessiz'}</span>
      </button>
    </div>
  )
}
