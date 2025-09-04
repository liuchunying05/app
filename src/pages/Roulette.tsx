import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import * as echarts from 'echarts'

type RouletteItem = { id: string; text: string }

const DEFAULT_ITEMS: RouletteItem[] = [
  { id: '1', text: '点外卖' },
  { id: '4', text: '吃火锅' },
  { id: '5', text: '吃烧烤' },
  { id: '6', text: '去看电影' },
]

const readItems = (): RouletteItem[] => {
  try {
    const raw = localStorage.getItem('roulette_items')
    const arr = raw ? JSON.parse(raw) : DEFAULT_ITEMS
    return Array.isArray(arr) && arr.length ? arr : DEFAULT_ITEMS
  } catch {
    return DEFAULT_ITEMS
  }
}
const saveItems = (items: RouletteItem[]) => localStorage.setItem('roulette_items', JSON.stringify(items))

const readDuration = (): number => {
  const raw = localStorage.getItem('roulette_duration')
  const n = raw ? Number(raw) : 3
  return isNaN(n) || n <= 0 ? 3 : n
}
const saveDuration = (n: number) => localStorage.setItem('roulette_duration', String(n))

export default function RoulettePage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<RouletteItem[]>(readItems())
  const [duration, setDuration] = useState<number>(readDuration())
  const [editing, setEditing] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => saveItems(items), [items])
  useEffect(() => saveDuration(duration), [duration])

  const colors = useMemo(() => {
    const palette = ['#ff6b6b', '#4ecdc4', '#54a0ff', '#feca57', '#5f27cd', '#96ceb4', '#45b7d1', '#ff9ff3']
    return items.map((_, i) => palette[i % palette.length])
  }, [items])

  // 创建ECharts配置
  const createChartOption = (startAngle: number = 0, animation: boolean = false) => ({
    series: [
      {
        type: 'pie',
        radius: '85%', // 增大半径，让转盘更大
        center: ['50%', '50%'],
        startAngle,
        data: items.map((item, index) => ({
          value: 1,
          name: item.text,
          itemStyle: { color: colors[index] },
          label: {
            show: true,
            position: 'inside',
            formatter: item.text,
            fontSize: 16, // 增大字体
            fontWeight: 'bold',
            color: '#fff'
          }
        })),
        emphasis: { disabled: true },
        animation,
        animationDuration: animation ? duration * 1000 : 0,
        animationEasing: 'cubicOut'
      }
    ]
  })

  // 初始化ECharts转盘
  useEffect(() => {
    if (!chartRef.current || items.length === 0) return

    if (chartInstance.current) {
      chartInstance.current.dispose()
    }

    chartInstance.current = echarts.init(chartRef.current)
    chartInstance.current.setOption(createChartOption())

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose()
      }
    }
  }, [items, colors])

  const start = () => {
    if (spinning || items.length === 0 || !chartInstance.current) return
    
    setSpinning(true)
    
    // 先快速旋转几圈，营造一直转的效果
    let currentAngle = 0
    let spinCount = 0
    const maxSpins = 8 + Math.floor(Math.random() * 4) // 8-11圈
    
    const spinInterval = setInterval(() => {
      spinCount++
      currentAngle += 30 // 每次旋转30度，营造快速旋转效果
      
      // 更新转盘角度
      chartInstance.current?.setOption(createChartOption(currentAngle, false))
      
      // 达到最大圈数后，随机选择一个结果并停止
      if (spinCount >= maxSpins * 12) { // 12 * 30度 = 360度
        clearInterval(spinInterval)
        
        // 随机选择结果
        const targetIndex = Math.floor(Math.random() * items.length)
        const anglePerItem = 360 / items.length
        
        // 计算最终角度：让目标项停在12点方向（指针位置）
        // 由于ECharts的startAngle是从3点开始，我们需要让目标项的中心对准12点
        const finalAngle = 270 - (targetIndex * anglePerItem + anglePerItem / 2)
        
        // 最后缓慢旋转到目标位置
        chartInstance.current?.setOption(createChartOption(finalAngle, true))
        
        // 立即停止旋转状态，与转盘停止同步
        setSpinning(false)
      }
    }, 50) // 每50ms旋转一次，营造快速旋转效果
  }

  const addItem = () => {
    const text = prompt('请输入候选项：')
    if (!text) return
    setItems((list) => [...list, { id: String(Date.now()), text }])
  }
  const removeItem = (id: string) => setItems((list) => list.filter((i) => i.id !== id))

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg,#667eea,#764ba2)', 
      color: 'white',
      width: '100%',
      maxWidth: '100vw',
      overflow: 'hidden'
    }}>
      <header style={{ display: 'flex', alignItems: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
        <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', marginRight: 16 }}>
          <Icon name="ic-back" size={20} alt="返回" />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 'bold' }}>🎯 转盘</h1>
          <div style={{ opacity: 0.85, fontSize: 14 }}>自定义候选项与时长，随机选一个</div>
        </div>
        <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
          <Icon name="ic-back" size={20} alt="返回" />
        </button>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, width: '100%' }}>
        <div style={{ position: 'relative', width: 'min(450px, 90vw)', height: 'min(450px, 90vw)' }}>
          {/* ECharts转盘 */}
          <div
            ref={chartRef}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
          
          {/* 固定指针 - 底部在转盘中心，指向12点方向 */}
          <div style={{ 
            position: 'absolute', 
            left: '50%', 
            top: '50%', 
            transform: 'translate(-50%, -100%)', 
            width: 0, 
            height: 0, 
            borderLeft: '12px solid transparent', 
            borderRight: '12px solid transparent', 
            borderBottom: '70px solid #ffeb3b', 
            zIndex: 4, 
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' 
          }} />
          
          {/* 中心圆点 - 在指针底部中心 */}
          <div style={{ 
            position: 'absolute', 
            left: '50%', 
            top: '50%', 
            transform: 'translate(-50%, -50%)', 
            width: 24, 
            height: 24, 
            borderRadius: '50%', 
            background: '#fff', 
            boxShadow: '0 0 0 3px rgba(0,0,0,0.1)', 
            zIndex: 5 
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
        <button onClick={start} disabled={spinning || items.length === 0} style={{ padding: '12px 24px', background: '#4ecdc4', color: '#fff', border: 'none', borderRadius: 10, cursor: spinning ? 'not-allowed' : 'pointer', fontSize: 16 }}>
          {spinning ? '旋转中…' : '开始'}
        </button>
      </div>

      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', color: '#333', width: '90%', maxWidth: 520, borderRadius: 14, padding: 20 }}>
            <h3 style={{ margin: '0 0 12px 0', textAlign: 'center' }}>设置</h3>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>旋转时长（秒）</div>
              <input type="number" min={1} value={duration} onChange={(e) => setDuration(Math.max(1, Number(e.target.value) || 1))} style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8 }} />
            </div>
            <div style={{ fontWeight: 600, margin: '8px 0' }}>候选项</div>
            {items.map((it) => (
              <div key={it.id} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input value={it.text} onChange={(e) => setItems((arr) => arr.map((x) => (x.id === it.id ? { ...x, text: e.target.value } : x)))} style={{ flex: 1, padding: 10, border: '1px solid #ddd', borderRadius: 8 }} />
                <button onClick={() => removeItem(it.id)} style={{ padding: '10px 12px', border: '1px solid #ddd', background: '#fff', borderRadius: 8, cursor: 'pointer' }}>删除</button>
              </div>
            ))}
            <button onClick={addItem} style={{ width: '100%', padding: 10, border: '1px dashed #bbb', background: '#fff', borderRadius: 8, cursor: 'pointer', marginBottom: 14 }}>+ 添加一项</button>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setEditing(false)} style={{ flex: 1, padding: 12, border: '1px solid #ddd', borderRadius: 10, background: '#f5f5f5', cursor: 'pointer' }}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
