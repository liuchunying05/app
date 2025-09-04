/**
 * 文件名: src/pages/Movie.tsx
 * 分类: 页面
 * 作用: 电影推荐/选择页面，与播放器进行联动。
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'

// 类型定义
interface MovieItem {
  id: string
  title: string
  type: 'movie' | 'tv' // movie: 电影, tv: 电视剧
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
  // 本地上传支持
  sourceType?: 'remote' | 'local'
  localUrl?: string // 使用 URL.createObjectURL 生成的本地播放地址
}

interface MovieFormData {
  title: string
  type: 'movie' | 'tv'
  poster: string
  rating: number
  year: number
  genre: string
  description: string
  duration: string
}

// 存储函数
const STORAGE_KEY = 'movies'

function getMovies(): MovieItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveMovies(movies: MovieItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movies))
}

function addMovie(data: MovieFormData): MovieItem {
  const movies = getMovies()
  
  const newMovie: MovieItem = {
    id: Date.now().toString(),
    ...data,
    isWatched: false,
    isShared: false,
    createdAt: Date.now(),
    sourceType: 'remote'
  }
  
  movies.push(newMovie)
  saveMovies(movies)
  
  return newMovie
}

function updateMovie(id: string, updates: Partial<MovieItem>): boolean {
  const movies = getMovies()
  const index = movies.findIndex(movie => movie.id === id)
  
  if (index === -1) return false
  
     movies[index] = { ...movies[index], ...updates }
  saveMovies(movies)
  return true
}

function deleteMovie(id: string): boolean {
  const movies = getMovies()
  const filtered = movies.filter(movie => movie.id !== id)
  
  if (filtered.length === movies.length) return false
  
  saveMovies(filtered)
  return true
}

// 预设电影数据
const defaultMovies: MovieItem[] = [
  {
    id: '1',
    title: '泰坦尼克号',
    type: 'movie',
    poster: 'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p457760035.jpg',
    rating: 9.4,
    year: 1997,
    genre: '爱情/灾难',
    description: '1912年4月15日，载着1316号乘客和891名船员的豪华巨轮"泰坦尼克号"与冰山相撞而沉没，这场海难被认为是20世纪人间十大灾难之一。',
    duration: '194分钟',
    isWatched: false,
    isShared: false,
    createdAt: Date.now()
  },
  {
    id: '2',
    title: '肖申克的救赎',
    type: 'movie',
    poster: 'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p480747492.jpg',
    rating: 9.7,
    year: 1994,
    genre: '剧情/犯罪',
    description: '一场谋杀案使银行家安迪（蒂姆·罗宾斯）蒙冤入狱，谋杀妻子及其情人的指控将他关进了肖申克监狱。',
    duration: '142分钟',
    isWatched: false,
    isShared: false,
    createdAt: Date.now()
  },
  {
    id: '3',
    title: '权力的游戏',
    type: 'tv',
    poster: 'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2869056072.jpg',
    rating: 9.3,
    year: 2011,
    genre: '奇幻/剧情',
    description: '故事背景中虚构的世界，分为两片大陆：位于西面的"日落国度"维斯特洛；位于东面的类似亚欧大陆。',
    duration: '8季',
    isWatched: false,
    isShared: false,
    createdAt: Date.now()
  },
  {
    id: '4',
    title: '老友记',
    type: 'tv',
    poster: 'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p1910895711.jpg',
    rating: 9.7,
    year: 1994,
    genre: '喜剧/爱情',
    description: '故事以生活在纽约曼哈顿的六个老友为中心，描述他们携手走过的十年风雨历程。',
    duration: '10季',
    isWatched: false,
    isShared: false,
    createdAt: Date.now()
  }
]

// 初始化默认数据
function initializeDefaultMovies(): void {
  const existingMovies = getMovies()
  if (existingMovies.length === 0) {
    saveMovies(defaultMovies)
  }
}

export default function MoviePage() {
  const navigate = useNavigate()
  const [movies, setMovies] = useState<MovieItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showLocalUpload, setShowLocalUpload] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<MovieItem | null>(null)
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all')
  const [formData, setFormData] = useState<MovieFormData>({
    title: '',
    type: 'movie',
    poster: '',
    rating: 8.0,
    year: new Date().getFullYear(),
    genre: '',
    description: '',
    duration: ''
  })

  useEffect(() => {
    initializeDefaultMovies()
    setMovies(getMovies())
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.genre || !formData.description) {
      alert('请填写完整信息')
      return
    }

    addMovie(formData)
    setMovies(getMovies())
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个影视作品吗？')) {
      deleteMovie(id)
      setMovies(getMovies())
    }
  }

  const handleToggleWatched = (id: string) => {
    const movie = movies.find(m => m.id === id)
    if (movie) {
      updateMovie(id, { isWatched: !movie.isWatched })
      setMovies(getMovies())
    }
  }

  const handleShare = (movie: MovieItem) => {
    setSelectedMovie(movie)
    setShowShareModal(true)
  }

  const handleShareConfirm = () => {
    if (selectedMovie) {
      updateMovie(selectedMovie.id, { 
        isShared: true, 
        sharedWith: localStorage.getItem('friendPhone') || '好友'
      })
      setMovies(getMovies())
      setShowShareModal(false)
      setSelectedMovie(null)
      alert('已分享给好友！')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'movie',
      poster: '',
      rating: 8.0,
      year: new Date().getFullYear(),
      genre: '',
      description: '',
      duration: ''
    })
    setShowForm(false)
  }

  const filteredMovies = movies.filter(movie => {
    if (filter === 'all') return true
    return movie.type === filter
  })

  const watchedCount = movies.filter(m => m.isWatched).length
  const sharedCount = movies.filter(m => m.isShared).length

  return (
    <div style={{ padding: 16 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', marginRight: 16 }}
          >
            <Icon name="ic-back" size={20} alt="返回" />
          </button>
          <h2 style={{ margin: 0, fontSize: 20 }}>看电影</h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => setShowForm(true)}
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
        >
          <Icon name="ic-add" size={20} alt="添加" />
        </button>
        <button
          onClick={() => setShowLocalUpload(true)}
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
        >
          📁
        </button>
        </div>
      </header>

      {/* 统计信息 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div style={{ 
          background: '#e8f8f5', 
          padding: '12px 16px', 
          borderRadius: 8, 
          flex: 1,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#4ecdc4' }}>{movies.length}</div>
          <div style={{ fontSize: 12, color: '#666' }}>总数量</div>
        </div>
        <div style={{ 
          background: '#fff8e8', 
          padding: '12px 16px', 
          borderRadius: 8, 
          flex: 1,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#feca57' }}>{watchedCount}</div>
          <div style={{ fontSize: 12, color: '#666' }}>已观看</div>
        </div>
        <div style={{ 
          background: '#f0e8ff', 
          padding: '12px 16px', 
          borderRadius: 8, 
          flex: 1,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#5f27cd' }}>{sharedCount}</div>
          <div style={{ fontSize: 12, color: '#666' }}>已分享</div>
        </div>
      </div>

      {/* 筛选器 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            borderRadius: 8,
            background: filter === 'all' ? '#4ecdc4' : 'white',
            color: filter === 'all' ? 'white' : '#333',
            cursor: 'pointer'
          }}
        >
          全部
        </button>
        <button
          onClick={() => setFilter('movie')}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            borderRadius: 8,
            background: filter === 'movie' ? '#4ecdc4' : 'white',
            color: filter === 'movie' ? 'white' : '#333',
            cursor: 'pointer'
          }}
        >
          电影
        </button>
        <button
          onClick={() => setFilter('tv')}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            borderRadius: 8,
            background: filter === 'tv' ? '#4ecdc4' : 'white',
            color: filter === 'tv' ? 'white' : '#333',
            cursor: 'pointer'
          }}
        >
          电视剧
        </button>
      </div>

      {/* 影视列表 */}
      <div style={{ display: 'grid', gap: 16 }}>
        {filteredMovies.map(movie => (
          <div
            key={movie.id}
            style={{
              background: 'white',
              borderRadius: 12,
              padding: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              gap: 16,
              opacity: movie.isWatched ? 0.7 : 1
            }}
          >
            {/* 海报 */}
            <div style={{ flexShrink: 0 }}>
              <img
                src={movie.poster}
                alt={movie.title}
                style={{
                  width: 80,
                  height: 120,
                  borderRadius: 8,
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/80x120/ccc/999?text=暂无'
                }}
              />
            </div>

            {/* 信息 */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 'bold' }}>{movie.title}</h3>
                <span style={{
                  padding: '2px 6px',
                  background: movie.type === 'movie' ? '#4ecdc4' : '#ff6b6b',
                  color: 'white',
                  borderRadius: 4,
                  fontSize: 10
                }}>
                  {movie.type === 'movie' ? '电影' : '电视剧'}
                </span>
                {movie.isWatched && (
                  <span style={{
                    padding: '2px 6px',
                    background: '#feca57',
                    color: 'white',
                    borderRadius: 4,
                    fontSize: 10
                  }}>
                    已看
                  </span>
                )}
                {movie.isShared && (
                  <span style={{
                    padding: '2px 6px',
                    background: '#5f27cd',
                    color: 'white',
                    borderRadius: 4,
                    fontSize: 10
                  }}>
                    已分享
                  </span>
                )}
              </div>

              <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                <span>⭐ {movie.rating}</span>
                <span style={{ margin: '0 8px' }}>•</span>
                <span>{movie.year}</span>
                <span style={{ margin: '0 8px' }}>•</span>
                <span>{movie.genre}</span>
                <span style={{ margin: '0 8px' }}>•</span>
                <span>{movie.duration}</span>
              </div>

              <div style={{ fontSize: 12, color: '#666', marginBottom: 12, lineHeight: 1.4 }}>
                {movie.description.length > 60 ? movie.description.slice(0, 60) + '...' : movie.description}
              </div>

                             {/* 操作按钮 */}
               <div style={{ display: 'flex', gap: 8 }}>
                 <button
                   onClick={() => navigate(`/movie/player/${movie.id}`)}
                   style={{
                     padding: '6px 12px',
                     border: '1px solid #4ecdc4',
                     borderRadius: 6,
                     background: '#4ecdc4',
                     color: 'white',
                     fontSize: 12,
                     cursor: 'pointer'
                   }}
                 >
                   观看
                 </button>
                 <button
                   onClick={() => handleToggleWatched(movie.id)}
                   style={{
                     padding: '6px 12px',
                     border: '1px solid #ddd',
                     borderRadius: 6,
                     background: movie.isWatched ? '#feca57' : 'white',
                     color: movie.isWatched ? 'white' : '#333',
                     fontSize: 12,
                     cursor: 'pointer'
                   }}
                 >
                   {movie.isWatched ? '取消观看' : '标记已看'}
                 </button>
                <button
                  onClick={() => handleShare(movie)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    background: movie.isShared ? '#5f27cd' : 'white',
                    color: movie.isShared ? 'white' : '#333',
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  {movie.isShared ? '已分享' : '分享给好友'}
                </button>
                <button
                  onClick={() => handleDelete(movie.id)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #ff6b6b',
                    borderRadius: 6,
                    background: 'white',
                    color: '#ff6b6b',
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 添加表单 */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 24,
            width: '90%',
            maxWidth: 500,
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>添加影视作品</h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 'bold' }}>
                  标题
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                  placeholder="请输入影视作品标题"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 'bold' }}>
                    类型
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'movie' | 'tv' })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: 8,
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="movie">电影</option>
                    <option value="tv">电视剧</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 'bold' }}>
                    年份
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: 8,
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 'bold' }}>
                    评分
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 8.0 })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: 8,
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 'bold' }}>
                    时长
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: 8,
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                    placeholder="如：120分钟 或 8季"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 'bold' }}>
                  类型
                </label>
                <input
                  type="text"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                  placeholder="如：爱情/剧情/喜剧"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 'bold' }}>
                  海报链接
                </label>
                <input
                  type="url"
                  value={formData.poster}
                  onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                  placeholder="请输入海报图片链接（可选）"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 'bold' }}>
                  简介
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    fontSize: 14,
                    minHeight: 80,
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                  placeholder="请输入影视作品简介"
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    background: 'white',
                    fontSize: 14,
                    cursor: 'pointer'
                  }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: 'none',
                    borderRadius: 8,
                    background: '#4ecdc4',
                    color: 'white',
                    fontSize: 14,
                    cursor: 'pointer'
                  }}
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 本地上传弹窗 */}
      {showLocalUpload && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, width: '90%', maxWidth: 480 }}>
            <h3 style={{ margin: '0 0 16px 0', textAlign: 'center' }}>本地上传影片</h3>
            <LocalUploadForm onClose={() => setShowLocalUpload(false)} onSaved={() => { setShowLocalUpload(false); setMovies(getMovies()) }} />
          </div>
        </div>
      )}

      {/* 分享确认弹窗 */}
      {showShareModal && selectedMovie && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 24,
            width: '90%',
            maxWidth: 400,
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 16px 0' }}>分享给好友</h3>
            <p style={{ margin: '0 0 20px 0', color: '#666' }}>
              确定要将《{selectedMovie.title}》分享给好友一起观看吗？
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowShareModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  background: 'white',
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                取消
              </button>
              <button
                onClick={handleShareConfirm}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  borderRadius: 8,
                  background: '#4ecdc4',
                  color: 'white',
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                确认分享
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LocalUploadForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'movie' | 'tv'>('movie')
  const [file, setFile] = useState<File | null>(null)
  const [poster, setPoster] = useState('')

  function save() {
    if (!title.trim()) return alert('请输入影片名称')
    if (!file) return alert('请选择本地视频文件')
    const url = URL.createObjectURL(file)

    const movies = getMovies()
    const item: MovieItem = {
      id: Date.now().toString(),
      title: title.trim(),
      type,
      poster: poster || 'https://via.placeholder.com/80x120/ccc/999?text=本地',
      rating: 8.0,
      year: new Date().getFullYear(),
      genre: '本地',
      description: '本地上传影片',
      duration: '—',
      isWatched: false,
      isShared: false,
      createdAt: Date.now(),
      sourceType: 'local',
      localUrl: url,
    }
    movies.unshift(item)
    saveMovies(movies)
    onSaved()
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 'bold' }}>影片名称</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="请输入影片名称" style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, boxSizing: 'border-box' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 'bold' }}>类型</label>
          <select value={type} onChange={(e) => setType(e.target.value as 'movie' | 'tv')} style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, boxSizing: 'border-box' }}>
            <option value="movie">电影</option>
            <option value="tv">电视剧/动漫</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 'bold' }}>海报（可选）</label>
          <input value={poster} onChange={(e) => setPoster(e.target.value)} placeholder="图片链接" style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, boxSizing: 'border-box' }} />
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 'bold' }}>选择视频文件</label>
        <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ width: '100%' }} />
        <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>提示：文件不会上传到服务器，仅在本地浏览器播放。</div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onClose} style={{ flex: 1, padding: 12, border: '1px solid #ddd', borderRadius: 8, background: 'white', cursor: 'pointer' }}>取消</button>
        <button onClick={save} style={{ flex: 1, padding: 12, border: 'none', borderRadius: 8, background: '#1677ff', color: '#fff', cursor: 'pointer' }}>保存</button>
      </div>
    </div>
  )
}
