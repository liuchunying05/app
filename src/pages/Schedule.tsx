import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import dayjs from 'dayjs'
import React from 'react'

// 类型定义
interface ScheduleItem {
  id: string
  title: string
  description?: string
  date: string // YYYY-MM-DD 格式
  time: string // HH:MM 格式
  duration: number // 分钟
  color: string
  backgroundColor: string
  createdAt: number
  updatedAt: number
}

interface ScheduleFormData {
  title: string
  description: string
  date: string
  time: string
  duration: number
  color: string
  backgroundColor: string
}

// 存储函数
const STORAGE_KEY = 'schedules'

function getSchedules(): ScheduleItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveSchedules(schedules: ScheduleItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules))
}

function addSchedule(data: ScheduleFormData): ScheduleItem {
  const schedules = getSchedules()
  
  const newSchedule: ScheduleItem = {
    id: Date.now().toString(),
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  
  schedules.push(newSchedule)
  saveSchedules(schedules)
  
  return newSchedule
}

function deleteSchedule(id: string): boolean {
  const schedules = getSchedules()
  const filtered = schedules.filter(item => item.id !== id)
  
  if (filtered.length === schedules.length) return false
  
  saveSchedules(filtered)
  return true
}

// 获取一周的日期（周一到周日）
function getWeekDates(date: dayjs.Dayjs): dayjs.Dayjs[] {
  const startOfWeek = date.startOf('week').add(1, 'day') // 从周一开始
  const dates: dayjs.Dayjs[] = []
  
  for (let i = 0; i < 7; i++) {
    dates.push(startOfWeek.add(i, 'day'))
  }
  
  return dates
}

// 获取指定日期的日程
function getSchedulesForDate(date: string): ScheduleItem[] {
  const schedules = getSchedules()
  return schedules.filter(item => item.date === date)
}


export default function SchedulePage() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [showForm, setShowForm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [formData, setFormData] = useState<ScheduleFormData>({
    title: '',
    description: '',
    date: dayjs().format('YYYY-MM-DD'),
    time: '09:00',
    duration: 60,
    color: '#4ecdc4',
    backgroundColor: '#e8f8f5'
  })

  // 简化周日期计算
  const weekDates = getWeekDates(currentDate)
  const today = dayjs().format('YYYY-MM-DD')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.date || !formData.time) {
      alert('请填写完整信息')
      return
    }

    // 检查时间冲突
    const existingSchedules = getSchedulesForDate(formData.date)
    const newStartTime = new Date(`2000-01-01T${formData.time}`)
    const newEndTime = new Date(newStartTime.getTime() + formData.duration * 60000)
    
    const hasConflict = existingSchedules.some(schedule => {
      const scheduleStartTime = new Date(`2000-01-01T${schedule.time}`)
      const scheduleEndTime = new Date(scheduleStartTime.getTime() + schedule.duration * 60000)
      
      // 检查时间重叠
      return !(newEndTime <= scheduleStartTime || newStartTime >= scheduleEndTime)
    })
    
    if (hasConflict) {
      alert('该时间段已有其他日程，请选择其他时间')
      return
    }

    addSchedule(formData)
    resetForm()
    // 强制重新渲染
    setCurrentDate(prev => prev.clone())
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个日程吗？')) {
      deleteSchedule(id)
      // 强制重新渲染
      setCurrentDate(prev => prev.clone())
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: selectedDate || dayjs().format('YYYY-MM-DD'),
      time: '09:00',
      duration: 60,
      color: '#4ecdc4',
      backgroundColor: '#e8f8f5'
    })
    setShowForm(false)
  }

  const colorOptions = [
    { color: '#4ecdc4', bg: '#e8f8f5' },
    { color: '#ff6b6b', bg: '#ffe8e8' },
    { color: '#45b7d1', bg: '#e8f4f8' },
    { color: '#96ceb4', bg: '#f0f8f0' },
    { color: '#feca57', bg: '#fff8e8' },
    { color: '#ff9ff3', bg: '#fef0fd' },
    { color: '#54a0ff', bg: '#e8f2ff' },
    { color: '#5f27cd', bg: '#f0e8ff' }
  ]

  const timeSlots = Array.from({ length: 24 }, (_, i) => 
    `${i.toString().padStart(2, '0')}:00`
  )

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
          <h2 style={{ margin: 0, fontSize: 20 }}>时间表</h2>
        </div>
        <button
          onClick={() => setShowHistory(true)}
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
        >
          📊
        </button>
      </header>

      {/* 周导航 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button
          onClick={() => setCurrentDate(currentDate.subtract(1, 'week'))}
          style={{
            background: 'transparent',
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          上一周
        </button>
                 <div style={{ fontSize: 16, fontWeight: 'bold' }}>
           {currentDate.format('YYYY年MM月')} 第{Math.ceil(currentDate.date() / 7)}周
         </div>
        <button
          onClick={() => setCurrentDate(currentDate.add(1, 'week'))}
          style={{
            background: 'transparent',
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          下一周
        </button>
      </div>

             {/* 滚动提示 */}
       <div style={{ 
         textAlign: 'center', 
         fontSize: 12, 
         color: '#666', 
         marginBottom: 8,
         fontStyle: 'italic'
       }}>
         💡 左右滑动查看更多内容
       </div>
       
       {/* 周视图容器 */}
       <div style={{ 
         overflow: 'auto',
         borderRadius: 8,
         border: '1px solid #e1e5e9',
         background: '#f5f5f5',
         maxHeight: '70vh'
       }}>
         {/* 周视图网格 */}
         <div style={{ 
           display: 'grid', 
           gridTemplateColumns: '80px repeat(7, 120px)', 
           gridTemplateRows: `40px repeat(${timeSlots.length}, 30px)`,
           gap: 0,
           minWidth: 'fit-content',
           background: '#f5f5f5'
         }}>
                 {/* 时间轴头部 */}
         <div style={{ 
           gridColumn: '1',
           gridRow: '1',
           background: 'white',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           fontSize: 12, 
           color: '#999',
           borderBottom: '1px solid #e0e0e0',
           borderRight: '1px solid #e0e0e0'
         }}>
           时间
         </div>
         
         {/* 时间轴标签 */}
         {timeSlots.map((time, index) => (
           <div 
             key={time}
             style={{ 
               gridColumn: '1',
               gridRow: `${index + 2}`,
               background: 'white',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               fontSize: 10, 
               color: '#666',
               borderBottom: '1px solid #e0e0e0',
               borderRight: '1px solid #e0e0e0'
             }}
           >
             {time}
           </div>
         ))}

        {/* 每天的列 */}
        {weekDates.map((date, dateIndex) => {
          const dateStr = date.format('YYYY-MM-DD')
          const isToday = dateStr === today
          const columnIndex = dateIndex + 2 // 从第2列开始（第1列是时间轴）
          
          return (
            <React.Fragment key={`date-${dateStr}`}>
              {/* 日期头部 */}
              <div 
                style={{ 
                  gridColumn: columnIndex,
                  gridRow: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isToday ? '#4ecdc4' : '#f8f9fa',
                  color: isToday ? 'white' : '#333',
                  fontSize: 12,
                  fontWeight: 'bold',
                  borderBottom: '1px solid #e0e0e0',
                  borderRight: '1px solid #e0e0e0'
                }}
              >
                <div>{date.format('MM/DD')}</div>
                <div>{date.format('ddd')}</div>
              </div>
              
              {/* 时间网格单元格 */}
              {timeSlots.map((time, timeIndex) => (
                <div
                  key={`${dateStr}-${time}`}
                  style={{
                    gridColumn: columnIndex,
                    gridRow: timeIndex + 2,
                    background: 'white',
                    borderBottom: '1px solid #e0e0e0',
                    borderRight: '1px solid #e0e0e0',
                    position: 'relative'
                  }}
                />
              ))}
            </React.Fragment>
          )
        })}

        {/* 渲染所有日程项 */}
        {weekDates.flatMap((date, dateIndex) => {
          const dateStr = date.format('YYYY-MM-DD')
          const daySchedules = getSchedulesForDate(dateStr)
          const columnIndex = dateIndex + 2
          
          return daySchedules.map((schedule) => {
            const startHour = parseInt(schedule.time.split(':')[0])
            const timeIndex = timeSlots.findIndex(time => time === `${startHour.toString().padStart(2, '0')}:00`)
            
            if (timeIndex === -1) return null
            
            const rowSpan = Math.ceil(schedule.duration / 60)
                 
            return (
              <div
                key={schedule.id}
                style={{
                  gridColumn: columnIndex,
                  gridRow: `${timeIndex + 2} / span ${rowSpan}`,
                  background: schedule.backgroundColor,
                  border: `1px solid ${schedule.color}`,
                  borderRadius: 2,
                  padding: 4,
                  fontSize: 10,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
                onClick={() => {
                  setSelectedDate(schedule.date)
                  setFormData({
                    title: schedule.title,
                    description: schedule.description || '',
                    date: schedule.date,
                    time: schedule.time,
                    duration: schedule.duration,
                    color: schedule.color,
                    backgroundColor: schedule.backgroundColor
                  })
                  setShowForm(true)
                }}
              >
                <div style={{ 
                  color: schedule.color, 
                  fontWeight: 'bold',
                  marginBottom: 2
                }}>
                  {schedule.title}
                </div>
                <div style={{ 
                  color: schedule.color, 
                  fontSize: 8
                }}>
                  {schedule.time} - {(() => {
                    const startTime = new Date(`2000-01-01T${schedule.time}`)
                    const endTime = new Date(startTime.getTime() + schedule.duration * 60000)
                    return endTime.toTimeString().slice(0, 5)
                  })()}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(schedule.id)
                  }}
                  style={{
                    position: 'absolute',
                    top: 1,
                    right: 1,
                    background: 'rgba(255,255,255,0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 12,
                    height: 12,
                    fontSize: 6,
                    cursor: 'pointer',
                    color: '#ff6b6b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              </div>
            )
          }).filter(Boolean)
        })}

        {/* 可点击的空白时间段区域 */}
        {weekDates.flatMap((date, dateIndex) => {
          const dateStr = date.format('YYYY-MM-DD')
          const daySchedules = getSchedulesForDate(dateStr)
          const columnIndex = dateIndex + 2
          
          return timeSlots.map((time, timeIndex) => {
            const hour = parseInt(time.split(':')[0])
            
            // 检查这个时间段是否已被日程占用
            const isOccupied = daySchedules.some(schedule => {
              const scheduleStartHour = parseInt(schedule.time.split(':')[0])
              const scheduleStartMinute = parseInt(schedule.time.split(':')[1])
              const scheduleEndHour = scheduleStartHour + Math.floor((scheduleStartMinute + schedule.duration) / 60)
              
              const timeStart = hour
              const timeEnd = hour + 1
              
              // 检查时间段是否重叠
              if (scheduleEndHour < timeStart || scheduleStartHour > timeEnd) {
                return false
              }
              if (scheduleStartHour === timeEnd && scheduleStartMinute > 0) {
                return false
              }
              if (scheduleEndHour === timeStart && scheduleStartMinute === 0) {
                return false
              }
              return true
            })
            
            if (!isOccupied) {
              return (
                <div
                  key={`${dateStr}-${time}`}
                  style={{
                    gridColumn: columnIndex,
                    gridRow: timeIndex + 2,
                    cursor: 'pointer',
                    border: '1px dashed transparent',
                    transition: 'all 0.2s ease',
                    zIndex: 5
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border = '1px dashed #4ecdc4'
                    e.currentTarget.style.background = 'rgba(78, 205, 196, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border = '1px dashed transparent'
                    e.currentTarget.style.background = 'transparent'
                  }}
                  onClick={() => {
                    setSelectedDate(dateStr)
                    setFormData({
                      title: '',
                      description: '',
                      date: dateStr,
                      time: time,
                      duration: 60,
                      color: '#4ecdc4',
                      backgroundColor: '#e8f8f5'
                    })
                    setShowForm(true)
                  }}
                />
              )
            }
            return null
          }).filter(Boolean)
        })}
         </div>
       </div>

      {/* 添加/编辑表单 */}
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
             borderRadius: 20,
             padding: 28,
             width: '90%',
             maxWidth: 450,
             maxHeight: '90vh',
             overflow: 'auto',
             boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
           }}>
             <h3 style={{ 
               margin: '0 0 24px 0', 
               textAlign: 'center',
               fontSize: 20,
               fontWeight: 'bold',
               color: '#333'
             }}>添加日程</h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 'bold' }}>
                  日程标题
                </label>
                                 <input
                   type="text"
                   value={formData.title}
                   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                   style={{
                     width: '100%',
                     padding: '14px 16px',
                     border: '2px solid #e1e5e9',
                     borderRadius: 12,
                     fontSize: 14,
                     background: '#f8f9fa',
                     transition: 'all 0.3s ease',
                     boxSizing: 'border-box'
                   }}
                   onFocus={(e) => {
                     e.target.style.border = '2px solid #4ecdc4'
                     e.target.style.background = 'white'
                   }}
                   onBlur={(e) => {
                     e.target.style.border = '2px solid #e1e5e9'
                     e.target.style.background = '#f8f9fa'
                   }}
                   placeholder="请输入日程标题"
                 />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 'bold' }}>
                  描述
                </label>
                                 <textarea
                   value={formData.description}
                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                   style={{
                     width: '100%',
                     padding: '14px 16px',
                     border: '2px solid #e1e5e9',
                     borderRadius: 12,
                     fontSize: 14,
                     minHeight: 100,
                     resize: 'vertical',
                     background: '#f8f9fa',
                     transition: 'all 0.3s ease',
                     boxSizing: 'border-box',
                     fontFamily: 'inherit'
                   }}
                   onFocus={(e) => {
                     e.target.style.border = '2px solid #4ecdc4'
                     e.target.style.background = 'white'
                   }}
                   onBlur={(e) => {
                     e.target.style.border = '2px solid #e1e5e9'
                     e.target.style.background = '#f8f9fa'
                   }}
                   placeholder="请输入日程描述（可选）"
                 />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 'bold' }}>
                  日期
                </label>
                                 <input
                   type="date"
                   value={formData.date}
                   onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                   style={{
                     width: '100%',
                     padding: '14px 16px',
                     border: '2px solid #e1e5e9',
                     borderRadius: 12,
                     fontSize: 14,
                     background: '#f8f9fa',
                     transition: 'all 0.3s ease',
                     boxSizing: 'border-box'
                   }}
                   onFocus={(e) => {
                     e.target.style.border = '2px solid #4ecdc4'
                     e.target.style.background = 'white'
                   }}
                   onBlur={(e) => {
                     e.target.style.border = '2px solid #e1e5e9'
                     e.target.style.background = '#f8f9fa'
                   }}
                 />
              </div>

                             <div style={{ marginBottom: 16 }}>
                 <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 'bold' }}>
                   开始时间
                 </label>
                                    <input
                     type="time"
                     value={formData.time}
                     onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                     style={{
                       width: '100%',
                       padding: '14px 16px',
                       border: '2px solid #e1e5e9',
                       borderRadius: 12,
                       fontSize: 14,
                       background: '#f8f9fa',
                       transition: 'all 0.3s ease',
                       boxSizing: 'border-box'
                     }}
                     onFocus={(e) => {
                       e.target.style.border = '2px solid #4ecdc4'
                       e.target.style.background = 'white'
                     }}
                     onBlur={(e) => {
                       e.target.style.border = '2px solid #e1e5e9'
                       e.target.style.background = '#f8f9fa'
                     }}
                   />
               </div>

               <div style={{ marginBottom: 16 }}>
                 <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 'bold' }}>
                   结束时间
                 </label>
                                    <input
                     type="time"
                     value={(() => {
                       const startTime = new Date(`2000-01-01T${formData.time}`)
                       const endTime = new Date(startTime.getTime() + formData.duration * 60000)
                       return endTime.toTimeString().slice(0, 5)
                     })()}
                     onChange={(e) => {
                       const startTime = new Date(`2000-01-01T${formData.time}`)
                       const endTime = new Date(`2000-01-01T${e.target.value}`)
                       const duration = Math.max(15, Math.round((endTime.getTime() - startTime.getTime()) / 60000))
                       setFormData({ ...formData, duration })
                     }}
                     style={{
                       width: '100%',
                       padding: '14px 16px',
                       border: '2px solid #e1e5e9',
                       borderRadius: 12,
                       fontSize: 14,
                       background: '#f8f9fa',
                       transition: 'all 0.3s ease',
                       boxSizing: 'border-box'
                     }}
                     onFocus={(e) => {
                       e.target.style.border = '2px solid #4ecdc4'
                       e.target.style.background = 'white'
                     }}
                     onBlur={(e) => {
                       e.target.style.border = '2px solid #e1e5e9'
                       e.target.style.background = '#f8f9fa'
                     }}
                   />
               </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 'bold' }}>
                  选择颜色主题
                </label>
                                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                   {colorOptions.map((option, index) => (
                     <div
                       key={index}
                       onClick={() => setFormData({
                         ...formData,
                         color: option.color,
                         backgroundColor: option.bg
                       })}
                       style={{
                         width: 50,
                         height: 50,
                         background: option.bg,
                         border: `3px solid ${formData.color === option.color ? option.color : '#e1e5e9'}`,
                         borderRadius: 12,
                         cursor: 'pointer',
                         transition: 'all 0.3s ease',
                         transform: formData.color === option.color ? 'scale(1.1)' : 'scale(1)',
                         boxShadow: formData.color === option.color ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                       }}
                       onMouseEnter={(e) => {
                         if (formData.color !== option.color) {
                           e.currentTarget.style.transform = 'scale(1.05)'
                           e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                         }
                       }}
                       onMouseLeave={(e) => {
                         if (formData.color !== option.color) {
                           e.currentTarget.style.transform = 'scale(1)'
                           e.currentTarget.style.boxShadow = 'none'
                         }
                       }}
                     />
                   ))}
                 </div>
              </div>

                             <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                 <button
                   type="button"
                   onClick={resetForm}
                   style={{
                     flex: 1,
                     padding: '16px',
                     border: '2px solid #e1e5e9',
                     borderRadius: 12,
                     background: 'white',
                     fontSize: 16,
                     fontWeight: 'bold',
                     cursor: 'pointer',
                     transition: 'all 0.3s ease',
                     color: '#666'
                   }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.border = '2px solid #4ecdc4'
                     e.currentTarget.style.color = '#4ecdc4'
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.border = '2px solid #e1e5e9'
                     e.currentTarget.style.color = '#666'
                   }}
                 >
                   取消
                 </button>
                 <button
                   type="submit"
                   style={{
                     flex: 1,
                     padding: '16px',
                     border: 'none',
                     borderRadius: 12,
                     background: '#4ecdc4',
                     color: 'white',
                     fontSize: 16,
                     fontWeight: 'bold',
                     cursor: 'pointer',
                     transition: 'all 0.3s ease',
                     boxShadow: '0 4px 12px rgba(78, 205, 196, 0.3)'
                   }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.transform = 'translateY(-2px)'
                     e.currentTarget.style.boxShadow = '0 6px 16px rgba(78, 205, 196, 0.4)'
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.transform = 'translateY(0)'
                     e.currentTarget.style.boxShadow = '0 4px 12px rgba(78, 205, 196, 0.3)'
                   }}
                 >
                   保存
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* 历史数据弹窗 */}
      {showHistory && (
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
            maxWidth: 600,
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>历史数据</h3>
              <button
                onClick={() => setShowHistory(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 20,
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ maxHeight: 400, overflow: 'auto' }}>
              {getSchedules()
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(schedule => (
                  <div
                    key={schedule.id}
                    style={{
                      padding: 12,
                      border: `1px solid ${schedule.color}`,
                      borderRadius: 8,
                      marginBottom: 8,
                      background: schedule.backgroundColor
                    }}
                  >
                    <div style={{ 
                      color: schedule.color, 
                      fontWeight: 'bold',
                      marginBottom: 4
                    }}>
                      {schedule.title}
                    </div>
                    {schedule.description && (
                      <div style={{ 
                        color: schedule.color, 
                        fontSize: 12,
                        marginBottom: 4
                      }}>
                        {schedule.description}
                      </div>
                    )}
                    <div style={{ 
                      color: schedule.color, 
                      fontSize: 12
                    }}>
                      {schedule.date} {schedule.time} - {(() => {
                        const startTime = new Date(`2000-01-01T${schedule.time}`)
                        const endTime = new Date(startTime.getTime() + schedule.duration * 60000)
                        return endTime.toTimeString().slice(0, 5)
                      })()}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
