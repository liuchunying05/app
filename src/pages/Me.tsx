/**
 * 文件名: src/pages/Me.tsx
 * 分类: 页面
 * 作用: 个人中心页，展示个人信息与设置入口。
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, setProfile } from '../utils/storage'
import { Icon } from '../components/Icon'

export default function Me() {
  const inputAvatar = useRef<HTMLInputElement | null>(null)
  const [myName, setMyName] = useState('')
  const [myAvatar, setMyAvatar] = useState<string | undefined>(localStorage.getItem('myAvatar') || undefined)
  const [editingName, setEditingName] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const p = getProfile()
    setMyName(p.nickname || '')
  }, [])

  function onPickAvatar() {
    inputAvatar.current?.click()
  }
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      localStorage.setItem('myAvatar', String(reader.result))
      setMyAvatar(String(reader.result))
      window.dispatchEvent(new Event('profile:avatar-updated'))
      alert('已保存')
    }
    reader.readAsDataURL(file)
  }

  function saveNickname(next: string) {
    const trimmed = next.trim()
    setMyName(trimmed)
    setProfile({ nickname: trimmed })
    setEditingName(false)
    window.dispatchEvent(new Event('profile:nickname-updated'))
  }

  function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('userPhone')
      navigate('/login')
    }
  }

  const phone = localStorage.getItem('userPhone')
  const masked = phone ? `${phone.slice(0,3)}****${phone.slice(-4)}` : '未登录'

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>我的</h3>

      {/* 顶部头像与账号信息：右侧双击修改昵称，下面显示登录信息 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div onClick={onPickAvatar} className="touch-feedback" style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', background: '#ddd', cursor: 'pointer' }}>
          {myAvatar ? (
            <img src={myAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 12 }}>点击设置头像</div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          {!editingName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                title={myName ? undefined : '双击修改'}
                onDoubleClick={() => setEditingName(true)}
                style={{ fontSize: 16, fontWeight: 600, cursor: 'text' }}
              >
                {myName || '双击修改'}
              </div>
              {!myName && <span style={{ fontSize: 12, color: '#999' }}>双击修改</span>}
            </div>
          ) : (
            <input
              autoFocus
              defaultValue={myName}
              onBlur={(e) => saveNickname(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveNickname((e.target as HTMLInputElement).value)
                } else if (e.key === 'Escape') {
                  setEditingName(false)
                }
              }}
              placeholder="输入昵称后回车"
              style={{
                fontSize: 16,
                fontWeight: 600,
                border: '1px solid #e5e5e5',
                borderRadius: 8,
                padding: '6px 10px',
                width: '60%'
              }}
            />
          )}
          <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>登录账号：{masked}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
        <button 
          onClick={onPickAvatar} 
          className="touch-feedback"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 6,
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          <Icon name="ic-avatar" size={16} /> 设置我的头像
        </button>
      </div>
      <input ref={inputAvatar} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />

      <div style={{ marginTop: 30, paddingTop: 20, borderTop: '1px solid #eee' }}>
        <button
          onClick={handleLogout}
          className="touch-feedback"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ff4d4f',
            borderRadius: 8,
            background: '#fff',
            color: '#ff4d4f',
            fontSize: 14,
            cursor: 'pointer',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          退出登录
        </button>
      </div>
    </div>
  )
}


