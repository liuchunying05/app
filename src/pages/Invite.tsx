import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

type FriendInfo = { phone: string; nickname?: string; avatar?: string }

function setFriend(info: FriendInfo) {
  localStorage.setItem('friendInfo', JSON.stringify(info))
  if (info.avatar !== undefined) localStorage.setItem('friendAvatar', info.avatar || '')
  if (info.nickname !== undefined) localStorage.setItem('friendNickname', info.nickname || '')
  window.dispatchEvent(new Event('profile:nickname-updated'))
  window.dispatchEvent(new Event('profile:avatar-updated'))
}

export default function InvitePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  
  const fromPhone = searchParams.get('from')

  useEffect(() => {
    if (!fromPhone) {
      setError('邀请链接无效')
      return
    }

    // 检查是否已经有好友
    const existingFriend = localStorage.getItem('friendInfo')
    if (existingFriend) {
      setError('你已经有一个好友了，无法添加更多好友')
      return
    }

    // 检查是否已经登录
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (!isLoggedIn) {
      setError('请先登录后再使用邀请链接')
      return
    }

    // 自动处理邀请
    handleInvite()
  }, [fromPhone])

  const handleInvite = async () => {
    setIsProcessing(true)
    
    try {
      // 模拟处理时间
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 获取当前用户信息
      const userPhone = localStorage.getItem('userPhone')
      if (!userPhone) {
        setError('用户信息获取失败')
        return
      }

      // 检查是否是邀请自己
      if (userPhone === fromPhone) {
        setError('不能邀请自己')
        return
      }

      // 自动添加好友
      const friendInfo: FriendInfo = { 
        phone: fromPhone || '', 
        nickname: `好友(${(fromPhone || '').slice(-4)})` // 使用手机号后4位作为默认昵称
      }
      
      setFriend(friendInfo)
      
      // 显示成功消息
      setTimeout(() => {
        navigate('/friend', { replace: true })
      }, 2000)
      
    } catch (err) {
      setError('处理邀请时出现错误')
    } finally {
      setIsProcessing(false)
    }
  }

  if (error) {
    return (
      <div style={{ 
        padding: 20, 
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>❌</div>
        <h2 style={{ color: '#ff4d4f', marginBottom: 16 }}>邀请失败</h2>
        <p style={{ color: '#666', marginBottom: 24, lineHeight: 1.6 }}>{error}</p>
        <button 
          onClick={() => navigate('/')}
          style={{ 
            padding: '12px 24px', 
            background: '#1677ff', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 8,
            fontSize: 16
          }}
        >
          返回首页
        </button>
      </div>
    )
  }

  return (
    <div style={{ 
      padding: 20, 
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {isProcessing ? (
        <>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🔄</div>
          <h2 style={{ color: '#1677ff', marginBottom: 16 }}>正在处理邀请...</h2>
          <p style={{ color: '#666', marginBottom: 24, lineHeight: 1.6 }}>
            正在为你自动添加好友<br/>
            请稍候...
          </p>
          <div style={{ 
            width: 40, 
            height: 40, 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #1677ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </>
      ) : (
        <>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🎉</div>
          <h2 style={{ color: '#52c41a', marginBottom: 16 }}>邀请成功！</h2>
          <p style={{ color: '#666', marginBottom: 24, lineHeight: 1.6 }}>
            好友已成功添加<br/>
            正在跳转到好友页面...
          </p>
        </>
      )}
    </div>
  )
}
