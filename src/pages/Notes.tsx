/**
 * 文件名: src/pages/Notes.tsx
 * 分类: 页面
 * 作用: 便签/笔记页面，记录与管理文字内容。
 */
import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'

const STORAGE_PREFIX = 'notes:byDate:'

type DayNote = {
  date: string
  html: string
  updatedAt: string
}

export default function NotesPage() {
  const navigate = useNavigate()
  const today = dayjs().format('YYYY-MM-DD')
  const key = STORAGE_PREFIX + today

  const [html, setHtml] = useState<string>(() => {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw).html || '' : ''
  })
  const [showHistory, setShowHistory] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const [isComposing, setIsComposing] = useState(false)

  // 保存：输入时防抖
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!isComposing) {
        const value: DayNote = { date: today, html, updatedAt: dayjs().format('YYYY-MM-DD HH:mm') }
        localStorage.setItem(key, JSON.stringify(value))
      }
    }, 500)
    return () => clearTimeout(handler)
  }, [html, isComposing])

  // 初始化时将存量内容写入 DOM，之后不再由 React 受控，避免光标跳动
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = html || ''
    }
    // 仅初始化一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 历史日期列表
  const historyDates = useMemo(() => {
    const arr: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) || ''
      if (k.startsWith(STORAGE_PREFIX)) arr.push(k.replace(STORAGE_PREFIX, ''))
    }
    return arr.sort((a, b) => (dayjs(b).valueOf() - dayjs(a).valueOf()))
  }, [])

  function applyExec(command: string, value?: string) {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  function insertTable() {
    const tableHtml = '<table style="border-collapse:collapse;width:100%">' +
      Array.from({ length: 3 }).map(() => `<tr>${Array.from({ length: 3 }).map(() => '<td style="border:1px solid #ddd;padding:6px"> </td>').join('')}</tr>`).join('') +
      '</table>'
    document.execCommand('insertHTML', false, tableHtml)
    editorRef.current?.focus()
  }

  function onUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const src = String(reader.result)
      const img = `<img src="${src}" style="max-width:100%;height:auto;" />`
      document.execCommand('insertHTML', false, img)
      editorRef.current?.focus()
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // 字体大小（使用 execCommand 的 1-7 等级，再映射为 px）
  function setFontSize(px: number) {
    const map: Record<number, string> = { 12: '2', 14: '3', 16: '4', 18: '5', 20: '5' }
    document.execCommand('fontSize', false, map[px] || '3')
    // 将 <font size> 转换为内联 style（简化处理）
    const sel = window.getSelection()
    if (sel && sel.anchorNode) {
      // 略：不同浏览器行为差异，这里保持默认行为即可
    }
    editorRef.current?.focus()
  }

  return (
    <div style={{ padding: 16 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', marginRight: 16 }}>
            <Icon name="ic-back" size={20} alt="返回" />
          </button>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{today} 日记</div>
        </div>
        <button onClick={() => setShowHistory(true)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
          📅
        </button>
      </header>

      {/* 工具栏 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#fff', borderRadius: 12, padding: 8, boxShadow: '0 1px 2px rgba(0,0,0,.06)', marginBottom: 12 }}>
        <button onClick={() => applyExec('bold')} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>加粗</button>
        <button onClick={() => applyExec('italic')} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>斜体</button>
        <button onClick={() => applyExec('underline')} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>下划线</button>
        <button onClick={() => applyExec('strikeThrough')} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>删除线</button>
        <select onChange={(e) => setFontSize(Number(e.target.value))} defaultValue={14} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd' }}>
          <option value={12}>12px</option>
          <option value={14}>14px</option>
          <option value={16}>16px</option>
          <option value={18}>18px</option>
          <option value={20}>20px</option>
        </select>
        <button onClick={insertTable} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>表格</button>
        <label style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>
          上传图片
          <input type="file" accept="image/*" onChange={onUploadImage} style={{ display: 'none' }} />
        </label>
      </div>

      {/* 编辑器 */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={(e) => {
          setIsComposing(false)
          setHtml((e.target as HTMLDivElement).innerHTML)
        }}
        onInput={(e) => {
          if (isComposing) return
          setHtml((e.target as HTMLDivElement).innerHTML)
        }}
        style={{ minHeight: 320, background: '#fff', borderRadius: 12, padding: 12, boxShadow: '0 1px 2px rgba(0,0,0,.06)', lineHeight: 1.6 }}
      />

      {/* 历史记录弹层 */}
      {showHistory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: '92%', maxWidth: 720, background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 6px 18px rgba(0,0,0,.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>历史记录</div>
              <button onClick={() => setShowHistory(false)} style={{ border: 'none', background: '#1677ff', color: '#fff', padding: '6px 12px', borderRadius: 8, cursor: 'pointer' }}>关闭</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 12 }}>
              <div style={{ maxHeight: 380, overflow: 'auto', borderRight: '1px solid #eee', paddingRight: 8 }}>
                {historyDates.length === 0 ? (
                  <div style={{ color: '#999', fontSize: 13 }}>暂无历史</div>
                ) : (
                  historyDates.map(d => (
                    <div key={d} onClick={() => {
                      const v = localStorage.getItem(STORAGE_PREFIX + d)
                      if (v) {
                        const obj = JSON.parse(v) as DayNote
                        const preview = document.getElementById('notes-history-preview')
                        if (preview) preview.innerHTML = obj.html || ''
                      }
                    }} style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', userSelect: 'none' }}>{d}</div>
                  ))
                )}
              </div>
              <div id="notes-history-preview" style={{ minHeight: 320, padding: 8 }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


