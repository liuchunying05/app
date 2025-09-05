/**
 * 文件名: src/pages/Moment.tsx
 * 分类: 页面
 * 作用: 动态/时刻页面，记录并展示日常动态内容。
 */
import { useMemo, useState, useRef } from 'react'
import dayjs from 'dayjs'
import { getFriend, getProfile } from '../../utils/platform/storage'
import { Icon } from '../../components/Icon'

type Post = {
  id: string
  text: string
  image?: string
  createdAt: string
  author: 'me' | 'friend'
  likes: number
  liked: boolean
  comments: Comment[]
}

type Comment = {
  id: string
  text: string
  author: 'me' | 'friend'
  createdAt: string
}

function loadPosts(): Post[] {
  try {
    const raw = localStorage.getItem('posts')
    const arr = raw ? (JSON.parse(raw) as any[]) : []
    return arr.map((p) => ({
      id: String(p.id),
      text: String(p.text || ''),
      image: p.image ? String(p.image) : undefined,
      createdAt: String(p.createdAt || new Date().toISOString()),
      author: p.author === 'friend' ? 'friend' : 'me',
      likes: Number(p.likes || 0),
      // 修复：如果liked字段不存在或为undefined，则根据likes数量判断
      liked: p.liked !== undefined ? Boolean(p.liked) : (Number(p.likes || 0) > 0),
      comments: Array.isArray(p.comments) ? p.comments.map((c: any) => ({
        id: String(c.id),
        text: String(c.text || ''),
        author: c.author === 'friend' ? 'friend' : 'me',
        createdAt: String(c.createdAt || new Date().toISOString())
      })) : []
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
  const [posts, setPosts] = useState<Post[]>(() => {
    const loadedPosts = loadPosts()
    // 数据迁移：确保所有帖子都有liked字段
    const migratedPosts = loadedPosts.map(post => ({
      ...post,
      liked: post.liked !== undefined ? post.liked : (post.likes > 0)
    }))
    // 如果数据有变化，保存迁移后的数据
    if (JSON.stringify(loadedPosts) !== JSON.stringify(migratedPosts)) {
      savePosts(migratedPosts)
    }
    return migratedPosts
  })
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [publishText, setPublishText] = useState('')
  const [publishImage, setPublishImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    if (!keyword.trim()) return posts
    return posts.filter((p) => p.text.includes(keyword.trim()))
  }, [posts, keyword])

  const bg = localStorage.getItem('momentBg') || undefined

  function onBackgroundUpload() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          localStorage.setItem('momentBg', result)
          window.location.reload()
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  function onBackgroundClick() {
    if (bg) {
      // 如果已有背景，点击更换
      onBackgroundUpload()
    } else {
      // 如果没有背景，点击设置
      onBackgroundUpload()
    }
  }

  function onPublish() {
    if (!publishText.trim() && !publishImage) return
    const next: Post[] = [
      { 
        id: String(Date.now()), 
        text: publishText.trim(), 
        image: publishImage || undefined,
        createdAt: new Date().toISOString(), 
        author: 'me',
        likes: 0,
        liked: false,
        comments: []
      },
      ...posts,
    ]
    setPosts(next)
    savePosts(next)
    setPublishText('')
    setPublishImage(null)
    setShowPublishModal(false)
  }

  function onImageUpload() {
    fileInputRef.current?.click()
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPublishImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function removeImage() {
    setPublishImage(null)
  }

  function toggleLike(postId: string) {
    const next = posts.map(p => 
      p.id === postId 
        ? { 
            ...p, 
            liked: !p.liked,
            likes: p.liked ? p.likes - 1 : p.likes + 1
          }
        : p
    )
    setPosts(next)
    savePosts(next)
  }

  function addComment(postId: string, text: string) {
    if (!text.trim()) return
    const comment: Comment = {
      id: String(Date.now()),
      text: text.trim(),
      author: 'me',
      createdAt: new Date().toISOString()
    }
    const next = posts.map(p => 
      p.id === postId 
        ? { ...p, comments: [...p.comments, comment] }
        : p
    )
    setPosts(next)
    savePosts(next)
  }

  function deletePost(postId: string) {
    if (window.confirm('确定要删除这条动态吗？')) {
      const next = posts.filter(p => p.id !== postId)
      setPosts(next)
      savePosts(next)
    }
  }


  return (
    <div>
      {/* 顶部背景区域 */}
      <div 
        style={{ 
          position: 'relative', 
          height: 160, 
          background: bg ? `url(${bg}) center/cover no-repeat` : '#ddd',
          cursor: 'pointer'
        }}
        onClick={onBackgroundClick}
      >
        {/* 背景设置提示 - 只在没有背景时显示 */}
        {!bg && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 14
          }}>
            点击设置背景
          </div>
        )}
        
        {/* 顶部工具栏 - 覆盖在背景图上 */}
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            padding: 12,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.1), transparent)',
            backdropFilter: 'blur(2px)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* 搜索框 */}
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索内容"
                onClick={(e) => e.stopPropagation()}
                style={{ 
                  width: '100%',
                  padding: '8px 10px 8px 36px', 
                  borderRadius: 20, 
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: 16,
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  touchAction: 'manipulation',
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  color: '#333'
                }}
              />
              <Icon 
                name="ic-search" 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: 10, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#666'
                }} 
              />
            </div>
            
            
            {/* 发布按钮 - 恢复原来的圆形样式 */}
            <button 
              onClick={(e) => {
                e.stopPropagation()
                setShowPublishModal(true)
              }}
              className="touch-feedback"
              style={{ 
            width: 36, 
            height: 36, 
            borderRadius: '50%', 
            background: '#1677ff', 
            color: '#fff', 
            border: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          <Icon name="ic-add" size={18} />
        </button>
      </div>
        </div>
      </div>

      {/* 动态列表 */}
      <div style={{ padding: '0 12px 80px' }}>
        {filtered.map((p) => {
          const profile = getProfile()
          const friend = getFriend()
          const avatar = p.author === 'friend' ? friend.avatar : profile.avatar
          const name = p.author === 'friend' ? (friend.nickname || '好友') : (profile.nickname || '我')
          const isMyPost = p.author === 'me'
          return (
            <div key={p.id} style={{ 
              background: '#fff', 
              borderRadius: 12, 
              padding: 12, 
              marginBottom: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              {/* 用户信息行 */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#ccc', overflow: 'hidden' }}>
                {avatar ? (
                  <img src={avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : null}
              </div>
              <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontSize: 13, color: '#666' }}>{name}</div>
                    {isMyPost && (
                      <button 
                        onClick={() => deletePost(p.id)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#999', 
                          cursor: 'pointer',
                          fontSize: 16,
                          padding: 4
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {p.text && (
                    <div style={{ fontSize: 14, whiteSpace: 'pre-wrap', marginBottom: 8 }}>{p.text}</div>
                  )}
                  {p.image && (
                    <div style={{ marginBottom: 8 }}>
                      <img 
                        src={p.image} 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: 200, 
                          borderRadius: 8,
                          objectFit: 'cover'
                        }} 
                      />
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
                    {dayjs(p.createdAt).format('YYYY-MM-DD HH:mm')}
                  </div>
                  
                  {/* 点赞和评论按钮 */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                    <button 
                      onClick={() => toggleLike(p.id)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: p.liked ? '#ff4757' : '#999', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 14
                      }}
                    >
                      {p.liked ? '❤️' : '🤍'} {p.likes > 0 ? p.likes : ''}
                    </button>
                    <button 
                      onClick={() => {
                        const text = window.prompt('添加评论：')
                        if (text) addComment(p.id, text)
                      }}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#999', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 14
                      }}
                    >
                      💬 {p.comments.length > 0 ? p.comments.length : ''}
                    </button>
                  </div>
                  
                  {/* 评论列表 */}
                  {p.comments.length > 0 && (
                    <div style={{ 
                      background: '#f8f9fa', 
                      borderRadius: 8, 
                      padding: 8, 
                      marginTop: 8 
                    }}>
                      {p.comments.map((comment) => (
                        <div key={comment.id} style={{ 
                          display: 'flex', 
                          gap: 8, 
                          marginBottom: 4,
                          fontSize: 13
                        }}>
                          <span style={{ color: '#666', fontWeight: 'bold' }}>
                            {comment.author === 'me' ? (profile.nickname || '我') : (friend.nickname || '好友')}:
                          </span>
                          <span style={{ color: '#333' }}>{comment.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999', padding: 24 }}>暂无内容</div>
        )}
      </div>

      {/* 发布弹窗 */}
      {showPublishModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{ 
            background: '#fff', 
            width: '100%', 
            maxWidth: 400, 
            borderRadius: 12, 
            padding: 20,
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 16 
            }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>发布动态</h3>
              <button 
                onClick={() => setShowPublishModal(false)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: 20, 
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ×
              </button>
            </div>
            
            <textarea
              value={publishText}
              onChange={(e) => setPublishText(e.target.value)}
              placeholder="此刻想说点什么..."
              rows={4}
              style={{ 
                width: '100%', 
                padding: 12, 
                borderRadius: 8, 
                border: '1px solid #e5e5e5', 
                resize: 'none',
                fontSize: 16,
                marginBottom: 12
              }}
            />
            
            {publishImage && (
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <img 
                  src={publishImage} 
                  style={{ 
                    width: '100%', 
                    maxHeight: 200, 
                    borderRadius: 8,
                    objectFit: 'cover'
                  }} 
                />
                <button 
                  onClick={removeImage}
                  style={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8, 
                    background: 'rgba(0,0,0,0.6)', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '50%', 
                    width: 24, 
                    height: 24, 
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button 
                onClick={onImageUpload}
                style={{ 
                  padding: '8px 12px', 
                  border: '1px solid #e5e5e5', 
                  background: '#fff', 
                  borderRadius: 8, 
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                📷 添加图片
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setShowPublishModal(false)}
                style={{ 
                  flex: 1, 
                  padding: 12, 
                  border: '1px solid #e5e5e5', 
                  borderRadius: 8, 
                  background: '#f5f5f5', 
                  cursor: 'pointer',
                  fontSize: 16
                }}
              >
                取消
              </button>
              <button 
                onClick={onPublish}
                disabled={!publishText.trim() && !publishImage}
                style={{ 
                  flex: 1, 
                  padding: 12, 
                  border: 'none', 
                  borderRadius: 8, 
                  background: '#1677ff', 
                  color: '#fff', 
                  cursor: 'pointer',
                  fontSize: 16,
                  opacity: (!publishText.trim() && !publishImage) ? 0.5 : 1
                }}
              >
                发布
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


