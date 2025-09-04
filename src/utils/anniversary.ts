// 类型定义
export interface Anniversary {
  id: string
  name: string
  date: string // YYYY-MM-DD 格式
  reminder: boolean
  color: string
  backgroundColor: string
  isTop: boolean
  createdAt: number
  updatedAt: number
}

export interface AnniversaryFormData {
  name: string
  date: string
  reminder: boolean
  color: string
  backgroundColor: string
}

const STORAGE_KEY = 'anniversaries'

// 获取所有纪念日
export function getAnniversaries(): Anniversary[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// 保存纪念日列表
export function saveAnniversaries(anniversaries: Anniversary[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(anniversaries))
}

// 添加纪念日
export function addAnniversary(data: AnniversaryFormData): Anniversary {
  const anniversaries = getAnniversaries()
  
  // 如果新添加的纪念日要置顶，先取消其他置顶
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
  
  // 触发更新事件
  window.dispatchEvent(new CustomEvent('anniversary:updated'))
  
  return newAnniversary
}

// 更新纪念日
export function updateAnniversary(id: string, data: Partial<AnniversaryFormData>): Anniversary | null {
  const anniversaries = getAnniversaries()
  const index = anniversaries.findIndex(item => item.id === id)
  
  if (index === -1) return null
  
  // 如果更新为置顶，先取消其他置顶
  if (data.reminder) {
    anniversaries.forEach(item => {
      item.isTop = false
    })
  }
  
  anniversaries[index] = {
    ...anniversaries[index],
    ...data,
    isTop: data.reminder || false,
    updatedAt: Date.now()
  }
  
  saveAnniversaries(anniversaries)
  
  // 触发更新事件
  window.dispatchEvent(new CustomEvent('anniversary:updated'))
  
  return anniversaries[index]
}

// 删除纪念日
export function deleteAnniversary(id: string): boolean {
  const anniversaries = getAnniversaries()
  const filtered = anniversaries.filter(item => item.id !== id)
  
  if (filtered.length === anniversaries.length) return false
  
  saveAnniversaries(filtered)
  
  // 触发更新事件
  window.dispatchEvent(new CustomEvent('anniversary:updated'))
  
  return true
}

// 设置置顶纪念日
export function setTopAnniversary(id: string): boolean {
  const anniversaries = getAnniversaries()
  const index = anniversaries.findIndex(item => item.id === id)
  
  if (index === -1) return false
  
  // 先取消所有置顶
  anniversaries.forEach(item => {
    item.isTop = false
  })
  
  // 设置新的置顶
  anniversaries[index].isTop = true
  anniversaries[index].updatedAt = Date.now()
  
  saveAnniversaries(anniversaries)
  
  // 触发更新事件
  window.dispatchEvent(new CustomEvent('anniversary:updated'))
  
  return true
}

// 获取置顶纪念日
export function getTopAnniversary(): Anniversary | null {
  const anniversaries = getAnniversaries()
  return anniversaries.find(item => item.isTop) || null
}

// 计算距离纪念日的天数
export function getDaysUntilAnniversary(date: string): number {
  const today = new Date()
  const anniversaryDate = new Date(date)
  
  // 设置今年的纪念日日期
  const currentYear = today.getFullYear()
  anniversaryDate.setFullYear(currentYear)
  
  // 如果今年的纪念日已经过了，计算明年的
  if (anniversaryDate < today) {
    anniversaryDate.setFullYear(currentYear + 1)
  }
  
  const diffTime = anniversaryDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// 获取纪念日状态描述
export function getAnniversaryStatus(date: string): string {
  const days = getDaysUntilAnniversary(date)
  
  if (days === 0) return '今天'
  if (days === 1) return '明天'
  if (days < 0) return `${Math.abs(days)}天前`
  return `${days}天后`
}
