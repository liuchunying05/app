import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { getFriend, getProfile } from '../utils/storage'
import { Icon } from '../components/Icon'

type Post = {
  id: string
  text: string
  createdAt: string
  author: 'me' | 'friend'
}

function loadPosts(): Post[] {
  try {
    const raw = localStorage.getItem('posts')
    const arr = raw ? (JSON.parse(raw) as any[]) : []
    return arr.map((p) => ({
      id: String(p.id),
      text: String(p.text || ''),
      createdAt: String(p.createdAt || new Date().toISOString()),
      author: p.author === 'friend' ? 'friend' : 'me',
    }))
  } catch {
    return []
  }
}

function savePosts(posts: Post[]) {
  localStorage.setItem('posts', JSON.stringify(posts))
}

export default function Moment() {
  const [keyword, setKeyword] = useState('')
  const [text, setText] = useState('')
  const [posts, setPosts] = useState<Post[]>(loadPosts())
  const [author, setAuthor] = useState<'me' | 'friend'>('me')

  const filtered = useMemo(() => {
    if (!keyword.trim()) return posts
    return posts.filter((p) => p.text.includes(keyword.trim()))
  }, [posts, keyword])

  function onPublish() {
    if (!text.trim()) return
    const next: Post[] = [
      { id: String(Date.now()), text: text.trim(), createdAt: new Date().toISOString(), author },
      ...posts,
    ]
    setPosts(next)
    savePosts(next)
    setText('')
  }

  const bg = localStorage.getItem('momentBg') || undefined

  function onQuickPublish() {
    const v = window.prompt('发布一条动态：')
    if (!v || !v.trim()) return
    const next: Post[] = [
      { id: String(Date.now()), text: v.trim(), createdAt: new Date().toISOString(), author },
      ...posts,
    ]
    setPosts(next)
    savePosts(next)
  }

  return (
    <div>
      <div style={{ position: 'relative', height: 160, background: bg ? `url(${bg}) center/cover no-repeat` : '#ddd' }}>
        <button
          onClick={onQuickPublish}
          aria-label="发布"
          className="touch-feedback"
          style={{ 
            position: 'absolute', 
            right: 12, 
            top: 12, 
            width: 36, 
            height: 36, 
            borderRadius: '50%', 
            background: '#1677ff', 
            color: '#fff', 
            border: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            /* 移动端触摸优化 */
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          <Icon name="ic-add" size={18} />
        </button>
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索内容"
            style={{ 
              flex: 1, 
              padding: '8px 10px', 
              borderRadius: 8, 
              border: '1px solid #e5e5e5',
              /* 移动端输入优化 */
              fontSize: 16,
              WebkitAppearance: 'none',
              appearance: 'none',
              touchAction: 'manipulation'
            }}
          />
          <Icon name="ic-search" size={20} />
          <select 
            value={author} 
            onChange={(e) => setAuthor(e.target.value as any)} 
            style={{ 
              padding: '8px 10px', 
              borderRadius: 8, 
              border: '1px solid #e5e5e5',
              /* 移动端输入优化 */
              fontSize: 16,
              WebkitAppearance: 'none',
              appearance: 'none',
              touchAction: 'manipulation'
            }}
          >
            <option value="me">我</option>
            <option value="friend">好友</option>
          </select>
          <button 
            onClick={onPublish} 
            className="touch-feedback"
            style={{ 
              padding: '8px 12px',
              /* 移动端触摸优化 */
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            + 发布
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="此刻想说点什么..."
          rows={3}
          style={{ 
            width: '100%', 
            padding: 10, 
            borderRadius: 8, 
            border: '1px solid #e5e5e5', 
            resize: 'none',
            /* 移动端输入优化 */
            fontSize: 16,
            WebkitAppearance: 'none',
            appearance: 'none',
            touchAction: 'manipulation'
          }}
        />
      </div>
      <div style={{ padding: '0 12px 80px' }}>
        {filtered.map((p) => {
          const profile = getProfile()
          const friend = getFriend()
          const avatar = p.author === 'friend' ? friend.avatar : profile.avatar
          const name = p.author === 'friend' ? (friend.nickname || '好友') : (profile.nickname || '我')
          return (
            <div key={p.id} style={{ display: 'flex', gap: 10, background: '#fff', borderRadius: 12, padding: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#ccc', overflow: 'hidden' }}>
                {avatar ? (
                  <img src={avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : null}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>{name}</div>
                <div style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{p.text}</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>{dayjs(p.createdAt).format('YYYY-MM-DD HH:mm')}</div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999', padding: 24 }}>暂无内容</div>
        )}
      </div>
    </div>
  )
}


