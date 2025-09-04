import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { wmoToZhDesc } from '../utils/weather'
import { Icon } from '../components/Icon'
import { getTopAnniversary, getAnniversaryStatus } from '../utils/anniversary'

const QUOTES = [
  '做你害怕的事，恐惧自然会消失。',
  '此刻的一小步，胜过永远不开始。',
  '越努力，越幸运。',
  '把简单的事做到极致，就是不简单。',
]

type WeatherData = {
  tempC?: number
  desc?: string
}

export default function Home() {
  const navigate = useNavigate()
  const [weather, setWeather] = useState<WeatherData>({})
  const [avatarRefreshTick, setAvatarRefreshTick] = useState(0)
  const [nicknameRefreshTick, setNicknameRefreshTick] = useState(0)
  const [topAnniversary, setTopAnniversary] = useState(getTopAnniversary())

  const quote = useMemo(() => {
    const index = Math.abs(parseInt(dayjs().format('YYYYMMDD'))) % QUOTES.length
    return QUOTES[index]
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) return reject(new Error('no-geo'))
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 })
        })
        const { latitude, longitude } = pos.coords
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
        const res = await fetch(url)
        const data = await res.json()
        const tempC: number | undefined = data?.current?.temperature_2m
        const code: number | undefined = data?.current?.weather_code
        setWeather({ tempC, desc: wmoToZhDesc(code) })
      } catch {
        setWeather({})
      }
    })()
  }, [])

  useEffect(() => {
    const onAvatar = () => setAvatarRefreshTick((n) => n + 1)
    const onName = () => setNicknameRefreshTick((n) => n + 1)
    const onAnniversaryUpdate = () => setTopAnniversary(getTopAnniversary())
    
    window.addEventListener('profile:avatar-updated', onAvatar)
    window.addEventListener('profile:nickname-updated', onName)
    window.addEventListener('anniversary:updated', onAnniversaryUpdate)
    
    return () => {
      window.removeEventListener('profile:avatar-updated', onAvatar)
      window.removeEventListener('profile:nickname-updated', onName)
      window.removeEventListener('anniversary:updated', onAnniversaryUpdate)
    }
  }, [])

  const today = dayjs().format('YYYY年MM月DD日 ddd')

  return (
    <div style={{ padding: 16 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 14, color: '#666' }}>{quote}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14 }}>{today}</div>
            <div style={{ fontSize: 12, color: '#999' }}>
              {weather.tempC != null ? `${weather.tempC}°C ${weather.desc || ''}` : '天气获取中'}
            </div>
          </div>
          <Icon name="ic-weather" size={20} alt="天气" />
        </div>
      </header>

      {topAnniversary && (
        <section style={{ margin: '12px 0' }}>
          <div onClick={() => navigate('/anniversary')} style={{ background: topAnniversary.backgroundColor, borderRadius: 12, padding: 16, border: `2px solid ${topAnniversary.color}`, cursor: 'pointer', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 12, color: topAnniversary.color }}>⭐ 置顶</div>
            <div style={{ color: topAnniversary.color, fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}>{topAnniversary.name}</div>
            <div style={{ color: topAnniversary.color, fontSize: 14 }}>{topAnniversary.date} ({getAnniversaryStatus(topAnniversary.date)})</div>
          </div>
        </section>
      )}

      <section style={{ margin: '12px 0', position: 'relative' }}>
        <div style={{ height: 2, background: '#eaeaea' }} />
        <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#f7f8fa', padding: '0 8px', fontSize: 12, color: '#666' }}>
          我们认识第 <b>{Math.max(1, dayjs().diff(dayjs(localStorage.getItem('metAt') || dayjs().format('YYYY-MM-DD')), 'day') + 1)}</b> 天
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <Avatar key={`me-${avatarRefreshTick}-${nicknameRefreshTick}`} who="me" />
          <Avatar key={`friend-${nicknameRefreshTick}`} who="friend" />
        </div>
      </section>

      <Grid />
    </div>
  )
}

function Avatar({ who }: { who: 'me' | 'friend' }) {
  const url = localStorage.getItem(who === 'me' ? 'myAvatar' : 'friendAvatar') || undefined
  const nickname = who === 'me' ? (localStorage.getItem('myNickname') || '我') : (localStorage.getItem('friendNickname') || 'TA')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ddd', overflow: 'hidden' }}>
        {url ? (<img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 12 }}>{who === 'me' ? '我' : 'TA'}</div>
        )}
      </div>
      <div style={{ fontSize: 12, color: '#666' }}>{nickname}</div>
    </div>
  )
}

function Grid() {
  const navigate = useNavigate()
  const items = [
    { key: 'anniv', label: '纪念日', path: '/anniversary' },
    { key: 'schedule', label: '时间表', path: '/schedule' },
    { key: 'bank', label: '存钱罐', path: '/bank' },
    { key: 'notes', label: '记事本', path: '/notes' },
    { key: 'elf', label: '小精灵', path: '/elf' },
    { key: 'eat', label: '吃饭', path: '/food' },
    { key: 'movie', label: '看电影', path: '/movie' },
    { key: 'roulette', label: '转盘', path: '/roulette' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {items.map((it) => (
        <div key={it.key} className="touch-feedback" onClick={() => it.path && navigate(it.path)} style={{ background: '#fff', borderRadius: 16, padding: 20, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.08)', cursor: 'pointer', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
          <Icon name={mapIcon(it.key)} size={32} alt={it.label} />
          <div style={{ fontSize: 14, marginTop: 8, fontWeight: '500' }}>{it.label}</div>
        </div>
      ))}
    </div>
  )
}

function mapIcon(key: string): string {
  if (key === 'anniv') return 'ic-anniv'
  if (key === 'schedule') return 'ic-schedule'
  if (key === 'bank') return 'ic-piggy'
  if (key === 'notes') return 'ic-notes'
  if (key === 'elf') return 'ic-elf'
  if (key === 'eat') return 'ic-eat'
  if (key === 'movie') return 'ic-movie'
  if (key === 'roulette') return 'zhuanpan'
  return 'ic-more'
}


