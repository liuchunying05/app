/**
 * 文件名: src/pages/MoviePlayer.tsx
 * 分类: 页面
 * 作用: 简易播放器页面，演示播放进度与控制（含类型修正）。
 */
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'
function resolvePoster(poster?: string): string {
  const p = poster || ''
  if (p.startsWith('http') || p.startsWith('data:')) return p
  if (p.startsWith('/')) return p
  if (p.startsWith('public/')) return `/${p.slice(7)}`
  return `/${p}`
}


// 类型定义
interface MovieItem {
  id: string
  title: string
  type: 'movie' | 'tv'
  poster: string
  rating: number
  year: number
  genre: string
  description: string
  duration: string
  isWatched: boolean
  isShared: boolean
  sharedWith?: string
  createdAt: number
}

// 获取电影数据
function getMovieById(id: string): MovieItem | null {
  try {
    const movies = JSON.parse(localStorage.getItem('movies') || '[]')
    return movies.find((movie: MovieItem) => movie.id === id) || null
  } catch {
    return null
  }
}

// 更新观看状态
function updateMovieWatched(id: string, isWatched: boolean): void {
  try {
    const movies = JSON.parse(localStorage.getItem('movies') || '[]')
    const index = movies.findIndex((movie: MovieItem) => movie.id === id)
    if (index !== -1) {
      movies[index].isWatched = isWatched
      localStorage.setItem('movies', JSON.stringify(movies))
    }
  } catch {
    // 忽略错误
  }
}

export default function MoviePlayerPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [movie, setMovie] = useState<MovieItem | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (id) {
      const movieData = getMovieById(id)
      setMovie(movieData)
      if (movieData) {
        // 自动标记为已观看
        updateMovieWatched(id, true)
        // 设置模拟时长（从电影时长中提取分钟数）
        const durationMatch = movieData.duration.match(/(\d+)/)
        if (durationMatch) {
          setDuration(parseInt(durationMatch[1]) * 60) // 转换为秒
        }
      }
    }
  }, [id])

  useEffect(() => {
    // 自动隐藏控制栏
    const timer = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [isPlaying, showControls])

  // 模拟播放进度更新
  useEffect(() => {
         let interval: NodeJS.Timeout | number
    if (isPlaying && duration > 0) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isPlaying, duration])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    setShowControls(true)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
    // 这里可以添加实际的视频跳转逻辑
  }

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleBack = () => {
    navigate('/movie')
  }

  if (!movie) {
    return (
      <div style={{ 
        padding: 16, 
        textAlign: 'center',
        color: '#666'
      }}>
        <div style={{ fontSize: 18, marginBottom: 16 }}>电影不存在</div>
        <button
          onClick={handleBack}
          style={{
            padding: '12px 24px',
            background: '#4ecdc4',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer'
          }}
        >
          返回电影列表
        </button>
      </div>
    )
  }

  return (
    <div style={{ 
      background: '#000', 
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
             {/* 视频播放区域 */}
       <div 
         onClick={() => setShowControls(!showControls)}
         style={{
           position: 'relative',
           width: '100%',
           height: '100vh',
           background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${resolvePoster(movie.poster)})`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           cursor: 'pointer'
         }}
       >
                 {/* 播放按钮 */}
         {!isPlaying && (
           <div
             onClick={(e) => {
               e.stopPropagation()
               handlePlayPause()
             }}
             style={{
               width: 80,
               height: 80,
               background: 'rgba(255,255,255,0.2)',
               borderRadius: '50%',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               cursor: 'pointer',
               backdropFilter: 'blur(10px)'
             }}
           >
             <div style={{ color: 'white', fontSize: 32 }}>▶</div>
           </div>
         )}

        {/* 控制栏 */}
        {showControls && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
            padding: '20px 16px',
            color: 'white'
          }}>
            {/* 进度条 */}
                         <div style={{ marginBottom: 16 }}>
               <input
                 type="range"
                 min="0"
                 max={duration || 100}
                 value={currentTime}
                 onChange={(e) => {
                   e.stopPropagation()
                   handleSeek(e)
                 }}
                 onClick={(e) => e.stopPropagation()}
                 style={{
                   width: '100%',
                   height: 4,
                   background: 'rgba(255,255,255,0.3)',
                   borderRadius: 2,
                   outline: 'none'
                 }}
               />
             </div>

            {/* 控制按钮 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                 <button
                   onClick={(e) => {
                     e.stopPropagation()
                     handlePlayPause()
                   }}
                   style={{
                     background: 'transparent',
                     border: 'none',
                     color: 'white',
                     cursor: 'pointer',
                     padding: 8
                   }}
                 >
                   <div style={{ fontSize: 24 }}>
                     {isPlaying ? "⏸" : "▶"}
                   </div>
                 </button>
                <div style={{ fontSize: 14 }}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                 <button
                   onClick={(e) => {
                     e.stopPropagation()
                     handleFullscreen()
                   }}
                   style={{
                     background: 'transparent',
                     border: 'none',
                     color: 'white',
                     cursor: 'pointer',
                     padding: 8
                   }}
                 >
                   <div style={{ fontSize: 24 }}>⛶</div>
                 </button>
              </div>
            </div>
          </div>
        )}

        {/* 顶部信息栏 */}
        {showControls && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(rgba(0,0,0,0.8), transparent)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                             <button
                 onClick={(e) => {
                   e.stopPropagation()
                   handleBack()
                 }}
                 style={{
                   background: 'rgba(255,255,255,0.2)',
                   border: 'none',
                   borderRadius: '50%',
                   width: 40,
                   height: 40,
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   cursor: 'pointer',
                   backdropFilter: 'blur(10px)'
                 }}
               >
                 <Icon name="ic-back" size={20} alt="返回" style={{ color: 'white' }} />
               </button>
              <div>
                <div style={{ fontSize: 16, fontWeight: 'bold' }}>{movie.title}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  {movie.year} • {movie.genre} • {movie.duration}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, opacity: 0.8 }}>⭐ {movie.rating}</span>
            </div>
          </div>
        )}
      </div>

      {/* 电影信息卡片 */}
      <div style={{
        background: 'white',
        padding: 20,
        margin: 16,
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <img
            src={resolvePoster(movie.poster)}
            alt={movie.title}
            style={{
              width: 80,
              height: 120,
              borderRadius: 8,
              objectFit: 'cover'
            }}
            onError={(e) => { e.currentTarget.src = '/icon/ic-error.svg' }}
          />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: 18 }}>{movie.title}</h2>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              {movie.year} • {movie.genre} • {movie.duration}
            </div>
            <div style={{ fontSize: 14, color: '#666' }}>
              ⭐ {movie.rating} 分
            </div>
          </div>
        </div>

        <div style={{ fontSize: 14, lineHeight: 1.6, color: '#333' }}>
          {movie.description}
        </div>

        {/* 观看状态 */}
        <div style={{
          marginTop: 16,
          padding: 12,
          background: '#f8f9fa',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: 14, color: '#666' }}>
            观看状态：{movie.isWatched ? '已观看' : '未观看'}
          </div>
          {movie.isShared && (
            <div style={{ fontSize: 12, color: '#4ecdc4' }}>
              已分享给 {movie.sharedWith}
            </div>
          )}
        </div>
      </div>

      
    </div>
  )
}
