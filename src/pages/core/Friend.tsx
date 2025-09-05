/**
 * 文件名: src/pages/Friend.tsx
 * 分类: 页面
 * 作用: 好友/情侣关系页，展示与互动相关内容。
 */
import { useEffect, useRef, useState } from 'react'

type Message = { id: string; author: 'me' | 'friend'; text: string; createdAt: string }

type FriendInfo = { phone: string; nickname?: string; avatar?: string }

function getFriend(): FriendInfo | undefined {
  try {
    const raw = localStorage.getItem('friendInfo')
    return raw ? (JSON.parse(raw) as FriendInfo) : undefined
  } catch { return undefined }
}

function setFriend(info: FriendInfo) {
  localStorage.setItem('friendInfo', JSON.stringify(info))
  if (info.avatar !== undefined) localStorage.setItem('friendAvatar', info.avatar || '')
  if (info.nickname !== undefined) localStorage.setItem('friendNickname', info.nickname || '')
  window.dispatchEvent(new Event('profile:nickname-updated'))
  window.dispatchEvent(new Event('profile:avatar-updated'))
}

function loadMsgs(): Message[] {
  try {
    const raw = localStorage.getItem('friendMsgs')
    return raw ? (JSON.parse(raw) as Message[]) : []
  } catch { return [] }
}

function saveMsgs(msgs: Message[]) {
  localStorage.setItem('friendMsgs', JSON.stringify(msgs))
}

export default function FriendPage() {
  const [friend, setFriendState] = useState<FriendInfo | undefined>(getFriend())
  const [inputPhone, setInputPhone] = useState('')
  const [inputNick, setInputNick] = useState('')
  const [msgs, setMsgs] = useState<Message[]>(loadMsgs())
  const [text, setText] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)
  const inputAvatarRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  function onAddFriend() {
    const phone = inputPhone.trim()
    if (!/^1\d{10}$/.test(phone)) { alert('请输入正确的手机号'); return }
    const info: FriendInfo = { phone, nickname: inputNick.trim() || undefined }
    setFriend(info)
    setFriendState(info)
    setShowAddForm(false)
    setInputPhone('')
    setInputNick('')
  }

  function onSend(author: 'me' | 'friend') {
    const v = text.trim()
    if (!v) return
    const next = [...msgs]
    next.push({ id: String(Date.now()), author, text: v, createdAt: new Date().toISOString() })
    setMsgs(next)
    saveMsgs(next)
    setText('')
  }

  function onPickAvatar() {
    inputAvatarRef.current?.click()
  }

  function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const next: FriendInfo = { ...(friend as FriendInfo), avatar: String(reader.result) }
      setFriend(next)
      setFriendState(next)
      alert('好友头像已更新')
    }
    reader.readAsDataURL(file)
  }

  function onRemoveFriend() {
    if (confirm('确定要删除当前好友吗？这将清空聊天记录。')) {
      localStorage.removeItem('friendInfo')
      localStorage.removeItem('friendAvatar')
      localStorage.removeItem('friendNickname')
      localStorage.removeItem('friendMsgs')
      setFriendState(undefined)
      setMsgs([])
      setShowAddForm(false)
      window.dispatchEvent(new Event('profile:nickname-updated'))
      window.dispatchEvent(new Event('profile:avatar-updated'))
    }
  }

  // 如果没有好友，显示添加好友表单
  if (!friend) {
    return (
      <div style={{ padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>邀请好友</h3>
        {/* 分享说明 */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: 16, 
          borderRadius: 12, 
          marginBottom: 20,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#333' }}>
            🎉 邀请你的另一半加入情侣空间
          </div>
          <div style={{ fontSize: 14, color: '#666', lineHeight: 1.5 }}>
            生成专属邀请链接，发送给微信好友<br/>
            好友点击链接即可一键登录并自动成为你的好友
          </div>
        </div>

        {/* 生成分享链接 */}
        <div style={{ 
          background: '#fff', 
          padding: 16, 
          borderRadius: 12, 
          border: '1px solid #e5e5e5',
          marginBottom: 20
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#333' }}>
            分享链接
          </div>
          
          {/* 链接显示区域 */}
          <div style={{ 
            background: '#f8f9fa', 
            padding: 12, 
            borderRadius: 8, 
            border: '1px solid #e5e5e5',
            marginBottom: 12,
            wordBreak: 'break-all',
            fontSize: 12,
            color: '#666'
          }}>
            {`${window.location.origin}/invite?from=${encodeURIComponent(localStorage.getItem('userPhone') || '')}`}
          </div>
          
          {/* 操作按钮 */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              onClick={() => {
                const link = `${window.location.origin}/invite?from=${encodeURIComponent(localStorage.getItem('userPhone') || '')}`
                navigator.clipboard.writeText(link).then(() => {
                  alert('链接已复制到剪贴板！')
                }).catch(() => {
                  // 如果剪贴板API不可用，使用传统方法
                  const textArea = document.createElement('textarea')
                  textArea.value = link
                  document.body.appendChild(textArea)
                  textArea.select()
                  document.execCommand('copy')
                  document.body.removeChild(textArea)
                  alert('链接已复制到剪贴板！')
                })
              }}
              style={{ 
                flex: 1, 
                padding: '12px 16px', 
                background: '#1677ff', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 8,
                fontSize: 14
              }}
            >
              复制链接
            </button>
            <button 
              onClick={() => {
                const link = `${window.location.origin}/invite?from=${encodeURIComponent(localStorage.getItem('userPhone') || '')}`
                const text = `邀请你加入我的情侣空间！点击链接即可一键登录：${link}`
                if (navigator.share) {
                  navigator.share({
                    title: '情侣空间邀请',
                    text: text,
                    url: link
                  })
                } else {
                  // 如果不支持原生分享，复制到剪贴板
                  navigator.clipboard.writeText(text).then(() => {
                    alert('邀请文本已复制到剪贴板，请粘贴到微信发送给好友！')
                  })
                }
              }}
              style={{ 
                flex: 1, 
                padding: '12px 16px', 
                background: '#52c41a', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 8,
                fontSize: 14
              }}
            >
              分享到微信
            </button>
          </div>
        </div>

        {/* 使用说明 */}
        <div style={{ 
          background: '#fff7e6', 
          padding: 12, 
          borderRadius: 8, 
          border: '1px solid #ffd591'
        }}>
          <div style={{ fontSize: 12, color: '#d46b08', lineHeight: 1.5 }}>
            💡 <strong>使用说明：</strong><br/>
            1. 点击"复制链接"或"分享到微信"<br/>
            2. 将链接发送给你的另一半<br/>
            3. 好友点击链接后会自动登录并成为你的好友<br/>
            4. 本应用仅支持一个好友，添加成功后此区域将隐藏
          </div>
        </div>
      </div>
    )
  }

  const friendName = friend.nickname || '好友'

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>好友</h3>

      {/* 好友信息头部：头像+昵称，支持更换头像 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div 
          onClick={onPickAvatar} 
          style={{ width: 56, height: 56, borderRadius: '50%', background: '#ddd', overflow: 'hidden', cursor: 'pointer' }}
        >
          {friend.avatar ? (
            <img src={friend.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 12 }}>
              上传头像
            </div>
          )}
        </div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{friendName}</div>
        <input ref={inputAvatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onAvatarChange} />
      </div>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ padding: '8px 12px', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 6 }}
        >
          {showAddForm ? '取消' : '重新添加好友'}
        </button>
        <button 
          onClick={onRemoveFriend}
          style={{ padding: '8px 12px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6 }}
        >
          删除好友
        </button>
      </div>

      {/* 重新添加好友表单 */}
      {showAddForm && (
        <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <input 
              value={inputPhone} 
              onChange={(e) => setInputPhone(e.target.value)} 
              placeholder="好友手机号" 
              maxLength={11} 
              style={{ flex: '1 1 120px', minWidth: '120px', padding: '8px 10px', border: '1px solid #e5e5e5', borderRadius: 6 }} 
            />
            <input 
              value={inputNick} 
              onChange={(e) => setInputNick(e.target.value)} 
              placeholder="好友昵称(可选)" 
              style={{ flex: '1 1 120px', minWidth: '120px', padding: '8px 10px', border: '1px solid #e5e5e5', borderRadius: 6 }} 
            />
            <button 
              onClick={onAddFriend} 
              style={{ flex: '0 0 auto', padding: '8px 12px', background: '#52c41a', color: '#fff', border: 'none', borderRadius: 6, whiteSpace: 'nowrap' }}
            >
              更新
            </button>
          </div>
        </div>
      )}

      {/* 聊天区域 */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 12, height: '50vh', overflowY: 'auto', boxShadow: '0 1px 2px rgba(0,0,0,.04)' }}>
        {msgs.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.author === 'me' ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
            <div style={{ 
              maxWidth: '75%', 
              background: m.author === 'me' ? '#1677ff' : '#f2f3f5', 
              color: m.author === 'me' ? '#fff' : '#333', 
              padding: '8px 10px', 
              borderRadius: 10 
            }}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* 消息输入区域 */}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          placeholder="输入消息..." 
          style={{ flex: 1, padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: 8 }} 
        />
        <button 
          onClick={() => onSend('me')}
          style={{ padding: '10px 16px', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 8 }}
        >
          发送
        </button>
        <button 
          onClick={() => onSend('friend')}
          style={{ padding: '10px 16px', background: '#52c41a', color: '#fff', border: 'none', borderRadius: 8 }}
        >
          模拟对方
        </button>
      </div>
    </div>
  )
}
