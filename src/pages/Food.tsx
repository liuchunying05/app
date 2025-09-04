/**
 * 文件名: src/pages/Food.tsx
 * 分类: 页面
 * 作用: 吃什么/点餐选择页面，提供随机或筛选功能。
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'

// 菜系类型定义
interface Cuisine {
  id: string
  name: string
  description: string
  image: string
  dishes: Dish[]
}

interface Dish {
  id: string
  name: string
  description: string
  price: string
  rating: number
  isFavorite: boolean
  tags: string[]
  createdAt: number
  recipeSteps: string[]
}

// 预设菜系数据
const defaultCuisines: Cuisine[] = [
  {
    id: '1',
    name: '川菜',
    description: '麻辣鲜香，口味浓郁',
    image: '🌶️',
    dishes: [
      {
        id: '1-1',
        name: '麻婆豆腐',
        description: '嫩滑豆腐配麻辣肉末，下饭神器',
        price: '¥28',
        rating: 4.8,
        isFavorite: true,
        tags: ['麻辣', '下饭菜', '经典'],
        createdAt: Date.now(),
        recipeSteps: [
          '豆腐切块焯水备用',
          '锅中下肉末煸香，加豆瓣酱炒出红油',
          '加入豆腐、清水，小火煮3-5分钟',
          '勾芡收汁，撒花椒粉与葱花即可'
        ]
      },
      {
        id: '1-2',
        name: '宫保鸡丁',
        description: '鸡肉嫩滑，花生香脆，酸甜微辣',
        price: '¥32',
        rating: 4.6,
        isFavorite: false,
        tags: ['酸甜', '鸡肉', '经典'],
        createdAt: Date.now(),
        recipeSteps: [
          '鸡胸肉切丁，加盐、淀粉腌15分钟',
          '爆香干辣椒花椒，放鸡丁滑炒至变色',
          '加入调味汁（糖醋酱）翻炒入味',
          '起锅前放花生米拌匀'
        ]
      }
    ]
  },
  {
    id: '2',
    name: '粤菜',
    description: '清淡鲜美，注重原味',
    image: '🥘',
    dishes: [
      {
        id: '2-1',
        name: '白切鸡',
        description: '皮爽肉嫩，配姜葱酱料',
        price: '¥45',
        rating: 4.7,
        isFavorite: true,
        tags: ['清淡', '鸡肉', '经典'],
        createdAt: Date.now(),
        recipeSteps: [
          '整鸡冷水下锅，加姜葱小火煮15-18分钟',
          '捞出过凉，抹香油，斩件装盘',
          '姜葱切末，加盐、热油、蒸鱼豉油拌匀蘸食'
        ]
      },
      {
        id: '2-2',
        name: '叉烧包',
        description: '甜咸适中，外皮松软',
        price: '¥18',
        rating: 4.5,
        isFavorite: false,
        tags: ['甜咸', '包子', '点心'],
        createdAt: Date.now(),
        recipeSteps: [
          '和面发酵，叉烧切丁拌馅',
          '包入馅料，醒发后上锅蒸10分钟'
        ]
      }
    ]
  }
]

// 本地存储管理
const getCuisines = (): Cuisine[] => {
  const stored = localStorage.getItem('cuisines')
  let data: any
  if (stored) {
    try {
      data = JSON.parse(stored)
    } catch {
      data = null
    }
  }
  const cuisines: Cuisine[] = (data || defaultCuisines).map((c: any) => ({
    id: String(c.id),
    name: c.name,
    description: c.description,
    image: c.image || '🍽️',
    dishes: (c.dishes || []).map((d: any) => ({
      id: String(d.id),
      name: d.name,
      description: d.description,
      price: d.price || '¥--',
      rating: typeof d.rating === 'number' ? d.rating : 4,
      isFavorite: !!d.isFavorite,
      tags: Array.isArray(d.tags) ? d.tags : [],
      createdAt: d.createdAt || Date.now(),
      recipeSteps: Array.isArray(d.recipeSteps) ? d.recipeSteps : (d.recipe ? [String(d.recipe)] : ['步骤待完善'])
    }))
  }))
  localStorage.setItem('cuisines', JSON.stringify(cuisines))
  return cuisines
}

const saveCuisines = (cuisines: Cuisine[]) => {
  localStorage.setItem('cuisines', JSON.stringify(cuisines))
}

const addDish = (cuisineId: string, dish: Omit<Dish, 'id' | 'createdAt'>) => {
  const cuisines = getCuisines()
  const cuisineIndex = cuisines.findIndex(c => c.id === cuisineId)
  if (cuisineIndex !== -1) {
    const newDish: Dish = {
      ...dish,
      id: `${cuisineId}-${Date.now()}`,
      createdAt: Date.now()
    }
    cuisines[cuisineIndex].dishes.push(newDish)
    saveCuisines(cuisines)
    return true
  }
  return false
}

const updateDish = (cuisineId: string, dishId: string, updates: Partial<Dish>) => {
  const cuisines = getCuisines()
  const ci = cuisines.findIndex(c => c.id === cuisineId)
  if (ci === -1) return false
  const di = cuisines[ci].dishes.findIndex(d => d.id === dishId)
  if (di === -1) return false
  cuisines[ci].dishes[di] = { ...cuisines[ci].dishes[di], ...updates }
  saveCuisines(cuisines)
  return true
}

const toggleFavorite = (cuisineId: string, dishId: string) => {
  const cuisines = getCuisines()
  const ci = cuisines.findIndex(c => c.id === cuisineId)
  if (ci !== -1) {
    const di = cuisines[ci].dishes.findIndex(d => d.id === dishId)
    if (di !== -1) {
      cuisines[ci].dishes[di].isFavorite = !cuisines[ci].dishes[di].isFavorite
      saveCuisines(cuisines)
      return true
    }
  }
  return false
}

export default function FoodPage() {
  const navigate = useNavigate()
  const [cuisines, setCuisines] = useState<Cuisine[]>(getCuisines())
  const [selectedCuisine, setSelectedCuisine] = useState<Cuisine | null>(null)
  const [selectedDishIds, setSelectedDishIds] = useState<{ cuisineId: string; dishId: string } | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [newDish, setNewDish] = useState({ name: '', description: '', price: '', tags: '', recipeSteps: '' })
  const [selectedCuisineId, setSelectedCuisineId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTag, setFilterTag] = useState('')

  const allTags = Array.from(new Set(cuisines.flatMap(c => c.dishes.flatMap(d => d.tags))))

  const filteredCuisines = cuisines.filter(cuisine => {
    if (searchTerm && !cuisine.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (filterTag && !cuisine.dishes.some(d => d.tags.includes(filterTag))) return false
    return true
  })

  const handleAddDish = () => {
    if (!selectedCuisineId || !newDish.name || !newDish.description || !newDish.price) {
      alert('请填写完整信息')
      return
    }
    const tags = newDish.tags.split(',').map(t => t.trim()).filter(Boolean)
    const steps = newDish.recipeSteps
      ? newDish.recipeSteps.split('\n').map(s => s.trim()).filter(Boolean)
      : ['待完善']
    if (
      addDish(selectedCuisineId, {
        name: newDish.name,
        description: newDish.description,
        price: newDish.price,
        rating: 4,
        isFavorite: false,
        tags,
        recipeSteps: steps
      })
    ) {
      setCuisines(getCuisines())
      setShowAddModal(false)
      setNewDish({ name: '', description: '', price: '', tags: '', recipeSteps: '' })
      setSelectedCuisineId('')
    }
  }

  const handleToggleFavorite = (cuisineId: string, dishId: string) => {
    if (toggleFavorite(cuisineId, dishId)) setCuisines(getCuisines())
  }

  const handleCuisineClick = (cuisine: Cuisine) => setSelectedCuisine(cuisine)
  const handleBackToList = () => setSelectedCuisine(null)

  const openDishDetail = (cuisineId: string, dishId: string) => setSelectedDishIds({ cuisineId, dishId })
  const closeDishDetail = () => setSelectedDishIds(null)

  // 详情页：菜品
  if (selectedDishIds) {
    const cuisine = cuisines.find(c => c.id === selectedDishIds.cuisineId)!
    const dish = cuisine.dishes.find(d => d.id === selectedDishIds.dishId)!

    const handleRatingClick = (value: number) => {
      updateDish(cuisine.id, dish.id, { rating: value })
      setCuisines(getCuisines())
    }

    const handleSaveRecipe = () => {
      const textarea = document.getElementById('recipe-editor') as HTMLTextAreaElement
      const steps = textarea.value.split('\n').map(s => s.trim()).filter(Boolean)
      updateDish(cuisine.id, dish.id, { recipeSteps: steps })
      setCuisines(getCuisines())
      setIsEditing(false)
    }

    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <header style={{ display: 'flex', alignItems: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
          <button onClick={closeDishDetail} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', marginRight: 16 }}>
            <Icon name="ic-back" size={20} alt="返回" />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 'bold' }}>{dish.name}</h1>
            <div style={{ opacity: 0.85, fontSize: 14 }}>{cuisine.name} · {dish.price}</div>
          </div>
          <button onClick={() => setIsEditing(!isEditing)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
            <Icon name={isEditing ? 'ic-close' : 'ic-edit'} size={20} alt="编辑" />
          </button>
        </header>

        <div style={{ padding: 16 }}>
          {/* 评分 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ fontSize: 18 }}>评分：</div>
            {[1, 2, 3, 4, 5].map(v => (
              <span
                key={v}
                onClick={() => handleRatingClick(v)}
                style={{ fontSize: 22, cursor: 'pointer', color: v <= Math.round(dish.rating) ? '#ffd700' : 'rgba(255,255,255,0.6)' }}
              >
                ★
              </span>
            ))}
            <span style={{ marginLeft: 6, opacity: 0.9 }}>{dish.rating.toFixed(1)}</span>
          </div>

          {/* 简介 */}
          <p style={{ margin: '8px 0 16px 0', lineHeight: 1.6, opacity: 0.9 }}>{dish.description}</p>

          {/* 做法 */}
          <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 'bold' }}>详细做法</div>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '6px 10px', color: 'white', cursor: 'pointer' }}>编辑</button>
              )}
            </div>

            {isEditing ? (
              <div>
                <textarea id="recipe-editor" defaultValue={dish.recipeSteps.join('\n')} rows={10} style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', outline: 'none' }} />
                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  <button onClick={() => setIsEditing(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.4)', background: 'transparent', color: 'white', cursor: 'pointer' }}>取消</button>
                  <button onClick={handleSaveRecipe} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: '#667eea', color: 'white', cursor: 'pointer' }}>保存</button>
                </div>
              </div>
            ) : (
              <ol style={{ margin: 0, paddingLeft: 18 }}>
                {(dish.recipeSteps || []).map((step, idx) => (
                  <li key={idx} style={{ margin: '6px 0', lineHeight: 1.6 }}>{step}</li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 菜系页 / 列表页
  if (selectedCuisine) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        {/* 头部 */}
        <header style={{ display: 'flex', alignItems: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
          <button onClick={handleBackToList} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', marginRight: 16 }}>
            <Icon name="ic-back" size={20} alt="返回" />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 'bold' }}>{selectedCuisine.image} {selectedCuisine.name}</h1>
            <p style={{ margin: '4px 0 0 0', opacity: 0.8 }}>{selectedCuisine.description}</p>
          </div>
        </header>

        {/* 菜品列表 */}
        <div style={{ padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {selectedCuisine.dishes.map(dish => (
              <div key={dish.id} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 'bold' }}>{dish.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => handleToggleFavorite(selectedCuisine.id, dish.id)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: dish.isFavorite ? '#ffd700' : 'rgba(255,255,255,0.6)' }}>{dish.isFavorite ? '❤️' : '🤍'}</button>
                    <button onClick={() => openDishDetail(selectedCuisine.id, dish.id)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '4px 8px', color: 'white', cursor: 'pointer' }}>详情</button>
                  </div>
                </div>
                <p style={{ margin: '8px 0', opacity: 0.8, lineHeight: 1.5 }}>{dish.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 18, fontWeight: 'bold', color: '#ffd700' }}>{dish.price}</span>
                  <span style={{ fontSize: 14 }}>{'★'.repeat(Math.round(dish.rating))}{'☆'.repeat(5 - Math.round(dish.rating))} {dish.rating}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {dish.tags.map(tag => (
                    <span key={tag} style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: 12, fontSize: 12 }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 首页：菜系列表
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
      <header style={{ display: 'flex', alignItems: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
        <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', marginRight: 16 }}>
          <Icon name="ic-back" size={20} alt="返回" />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 'bold' }}>🍽️ 美食天地</h1>
          <p style={{ margin: '4px 0 0 0', opacity: 0.8 }}>探索各种菜系，发现美味佳肴</p>
        </div>
        <button onClick={() => setShowAddModal(true)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
          <Icon name="ic-add" size={20} alt="添加" />
        </button>
      </header>

      {/* 搜索和筛选 */}
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <input type="text" placeholder="搜索菜系..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, padding: '12px 16px', border: 'none', borderRadius: 25, background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 16 }} />
          <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)} style={{ padding: '12px 16px', border: 'none', borderRadius: 25, background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 16, minWidth: 120 }}>
            <option value="">全部标签</option>
            {allTags.map(tag => (<option key={tag} value={tag}>{tag}</option>))}
          </select>
        </div>
      </div>

      {/* 菜系列表 */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filteredCuisines.map(cuisine => (
            <div key={cuisine.id} onClick={() => handleCuisineClick(cuisine)} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)' }} onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}>
              <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>{cuisine.image}</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>{cuisine.name}</h3>
              <p style={{ margin: '0 0 16px 0', opacity: 0.8, textAlign: 'center', lineHeight: 1.5 }}>{cuisine.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, opacity: 0.7 }}>
                <span>菜品: {cuisine.dishes.length}</span>
                <span>收藏: {cuisine.dishes.filter(d => d.isFavorite).length}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 添加菜品模态框 */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, width: '90%', maxWidth: 420, color: '#333' }}>
            <h2 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>🍽️ 添加新菜品</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>选择菜系</label>
              <select value={selectedCuisineId} onChange={(e) => setSelectedCuisineId(e.target.value)} style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 16 }}>
                <option value="">请选择菜系</option>
                {cuisines.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>菜品名称</label>
              <input type="text" value={newDish.name} onChange={(e) => setNewDish({ ...newDish, name: e.target.value })} placeholder="请输入菜品名称" style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 16 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>菜品描述</label>
              <textarea value={newDish.description} onChange={(e) => setNewDish({ ...newDish, description: e.target.value })} rows={3} placeholder="请输入菜品描述" style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 16, resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>价格</label>
              <input type="text" value={newDish.price} onChange={(e) => setNewDish({ ...newDish, price: e.target.value })} placeholder="例如: ¥28" style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 16 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>做法（每行一步）</label>
              <textarea value={newDish.recipeSteps} onChange={(e) => setNewDish({ ...newDish, recipeSteps: e.target.value })} rows={5} placeholder={'例：\n1. 备料\n2. 下锅翻炒\n3. 出锅装盘'} style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 16, resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>标签 (用逗号分隔)</label>
              <input type="text" value={newDish.tags} onChange={(e) => setNewDish({ ...newDish, tags: e.target.value })} placeholder="例如: 麻辣,下饭菜,经典" style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 16 }} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: 12, border: '1px solid #ddd', borderRadius: 8, background: '#f5f5f5', fontSize: 16, cursor: 'pointer' }}>取消</button>
              <button onClick={handleAddDish} style={{ flex: 1, padding: 12, border: 'none', borderRadius: 8, background: '#667eea', color: 'white', fontSize: 16, cursor: 'pointer' }}>添加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

