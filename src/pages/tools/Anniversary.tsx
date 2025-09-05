/**
 * 文件名: src/pages/Anniversary.tsx
 * 分类: 页面
 * 作用: 纪念日页面，记录重要日期并进行展示与提醒（如需）。
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'

// 简化的类型定义
interface Anniversary {
  id: string
  name: string
  date: string
  reminder: boolean
  color: string
  backgroundColor: string
  isTop: boolean
  createdAt: number
  updatedAt: number
}

interface AnniversaryFormData {
  name: string
  date: string
  reminder: boolean
  color: string
  backgroundColor: string
}

// 简化的存储函数
const STORAGE_KEY = 'anniversaries'

function getAnniversaries(): Anniversary[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveAnniversaries(anniversaries: Anniversary[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(anniversaries))
}

function addAnniversary(data: AnniversaryFormData): Anniversary {
  const anniversaries = getAnniversaries()
  
  if (data.reminder) {
    anniversaries.forEach(item => {
      item.isTop = false
    })
  }
  
  const newAnniversary: Anniversary = {
    id: Date.now().toString(),
    ...data,
    isTop: data.reminder,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  
  anniversaries.push(newAnniversary)
  saveAnniversaries(anniversaries)
  
  window.dispatchEvent(new CustomEvent('anniversary:updated'))
  
  return newAnniversary
}

function getAnniversaryStatus(date: string): string {
  const today = new Date()
  const anniversaryDate = new Date(date)
  const currentYear = today.getFullYear()
  anniversaryDate.setFullYear(currentYear)
  
  if (anniversaryDate < today) {
    anniversaryDate.setFullYear(currentYear + 1)
  }
  
  const diffTime = anniversaryDate.getTime() - today.getTime()
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '明天'
  if (days < 0) return `${Math.abs(days)}天前`
  return `${days}天后`
}

export default function AnniversaryPage() {
  const navigate = useNavigate()
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<AnniversaryFormData>({
    name: '',
    date: '',
    reminder: false,
    color: '#ff6b6b',
    backgroundColor: '#ffe8e8'
  })

  useEffect(() => {
    loadAnniversaries()
  }, [])

  const loadAnniversaries = () => {
    const data = getAnniversaries()
    setAnniversaries(data)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.date) {
      alert('请填写完整信息')
      return
    }

    addAnniversary(formData)
    loadAnniversaries()
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      reminder: false,
      color: '#ff6b6b',
      backgroundColor: '#ffe8e8'
    })
    setShowForm(false)
  }

  const colorOptions = [
    { color: '#ff6b6b', bg: '#ffe8e8' },
    { color: '#4ecdc4', bg: '#e8f8f5' },
    { color: '#45b7d1', bg: '#e8f4f8' },
    { color: '#96ceb4', bg: '#f0f8f0' },
    { color: '#feca57', bg: '#fff8e8' },
    { color: '#ff9ff3', bg: '#fef0fd' },
    { color: '#54a0ff', bg: '#e8f2ff' },
    { color: '#5f27cd', bg: '#f0e8ff' }
  ]

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
          <h2 style={{ margin: 0, fontSize: 20 }}>纪念日</h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
        >
          <Icon name="ic-add" size={20} alt="添加" />
        </button>
      </header>

      {/* 置顶纪念日 */}
      {anniversaries.filter(a => a.isTop).map(anniversary => (
        <div
          key={anniversary.id}
          style={{
            background: anniversary.backgroundColor,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            border: `2px solid ${anniversary.color}`,
            position: 'relative'
          }}
        >
          <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 12, color: anniversary.color }}>
            ⭐ 置顶
          </div>
          <div style={{ color: anniversary.color, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
            {anniversary.name}
          </div>
          <div style={{ color: anniversary.color, fontSize: 14, marginBottom: 8 }}>
            {anniversary.date} ({getAnniversaryStatus(anniversary.date)})
          </div>
        </div>
      ))}

      {/* 普通纪念日列表 */}
      {anniversaries.filter(a => !a.isTop).map(anniversary => (
        <div
          key={anniversary.id}
          style={{
            background: anniversary.backgroundColor,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            border: `1px solid ${anniversary.color}`
          }}
        >
          <div style={{ color: anniversary.color, fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}>
            {anniversary.name}
          </div>
          <div style={{ color: anniversary.color, fontSize: 14, marginBottom: 8 }}>
            {anniversary.date} ({getAnniversaryStatus(anniversary.date)})
          </div>
        </div>
      ))}

      {anniversaries.length === 0 && (
        <div style={{ textAlign: 'center', color: '#999', marginTop: 40 }}>
          <Icon name="ic-anniv" size={48} alt="纪念日" />
          <div style={{ marginTop: 16 }}>还没有纪念日，快来添加第一个吧！</div>
        </div>
      )}

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
            maxWidth: 400,
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>添加纪念日</h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 'bold' }}>
                  纪念日名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    fontSize: 14
                  }}
                  placeholder="请输入纪念日名称"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 'bold' }}>
                  纪念日日期
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    fontSize: 14
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={formData.reminder}
                    onChange={(e) => setFormData({ ...formData, reminder: e.target.checked })}
                  />
                  设为置顶纪念日
                </label>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 'bold' }}>
                  选择颜色主题
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {colorOptions.map((option, index) => (
                    <div
                      key={index}
                      onClick={() => setFormData({
                        ...formData,
                        color: option.color,
                        backgroundColor: option.bg
                      })}
                      style={{
                        width: 40,
                        height: 40,
                        background: option.bg,
                        border: `2px solid ${formData.color === option.color ? option.color : '#ddd'}`,
                        borderRadius: 8,
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
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
                    background: '#ff6b6b',
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
    </div>
  )
}


