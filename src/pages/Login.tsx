import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // 模拟发送验证码
  async function sendCode() {
    if (!phone || phone.length !== 11) {
      alert('请输入正确的手机号')
      return
    }
    
    setIsLoading(true)
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟验证码发送成功
      alert(`验证码已发送到 ${phone}`)
      setCountdown(60)
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
    } catch (error) {
      alert('发送失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 模拟登录验证
  async function handleLogin() {
    if (!phone || !code) {
      alert('请填写完整信息')
      return
    }
    
    if (code.length !== 6) {
      alert('验证码格式错误')
      return
    }
    
    setIsLoading(true)
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟登录成功
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userPhone', phone)
      navigate('/')
      
    } catch (error) {
      alert('登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      /* 移动端安全区域 */
      paddingTop: `max(20px, env(safe-area-inset-top))`,
      paddingBottom: `max(20px, env(safe-area-inset-bottom))`,
      paddingLeft: `max(20px, env(safe-area-inset-left))`,
      paddingRight: `max(20px, env(safe-area-inset-right))`,
      /* 移动端触摸优化 */
      WebkitOverflowScrolling: 'touch'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: 40,
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        /* 移动端适配 */
        paddingTop: 'max(40px, env(safe-area-inset-top) + 20px)',
        paddingBottom: 'max(40px, env(safe-area-inset-bottom) + 20px)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>
            欢迎回来
          </div>
          <div style={{ fontSize: 14, color: '#666' }}>
            请输入手机号获取验证码登录
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 8, fontSize: 14, color: '#333' }}>手机号</div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="请输入手机号"
            maxLength={11}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #e5e5e5',
              borderRadius: 8,
              fontSize: 16,
              boxSizing: 'border-box',
              /* 移动端输入优化 */
              WebkitAppearance: 'none',
              appearance: 'none',
              touchAction: 'manipulation'
            }}
          />
        </div>

        <div style={{ marginBottom: 30 }}>
          <div style={{ marginBottom: 8, fontSize: 14, color: '#333' }}>验证码</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="请输入验证码"
              maxLength={6}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #e5e5e5',
                borderRadius: 8,
                fontSize: 16,
                boxSizing: 'border-box',
                /* 移动端输入优化 */
                WebkitAppearance: 'none',
                appearance: 'none',
                touchAction: 'manipulation'
              }}
            />
            <button
              onClick={sendCode}
              disabled={countdown > 0 || isLoading || !phone || phone.length !== 11}
              className="touch-feedback"
              style={{
                padding: '12px 20px',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                cursor: countdown > 0 || isLoading || !phone || phone.length !== 11 ? 'not-allowed' : 'pointer',
                background: countdown > 0 || isLoading || !phone || phone.length !== 11 ? '#f5f5f5' : '#1677ff',
                color: countdown > 0 || isLoading || !phone || phone.length !== 11 ? '#999' : '#fff',
                whiteSpace: 'nowrap',
                /* 移动端触摸优化 */
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              {countdown > 0 ? `${countdown}s` : '获取验证码'}
            </button>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoading || !phone || !code}
          className="touch-feedback"
          style={{
            width: '100%',
            padding: '14px',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 'bold',
            cursor: isLoading || !phone || !code ? 'not-allowed' : 'pointer',
            background: isLoading || !phone || !code ? '#f5f5f5' : '#1677ff',
            color: isLoading || !phone || !code ? '#999' : '#fff',
            /* 移动端触摸优化 */
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          {isLoading ? '登录中...' : '登录'}
        </button>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: '#999' }}>
          登录即表示同意用户协议和隐私政策
        </div>
      </div>
    </div>
  )
}
