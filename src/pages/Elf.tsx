/**
 * 文件名: src/pages/Elf.tsx
 * 分类: 页面
 * 作用: 趣味/精灵互动页面，提供轻量娱乐交互。
 */
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { API_CONFIG, SYSTEM_PROMPTS, getErrorMessage } from '../config/api'

import { ApiDebugger } from '../utils/debugApi'

// 消息类型定义
interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: number
}



// 预设问题
const presetQuestions = [
  '今天天气怎么样？',
  '推荐一部好看的电影',
  '如何保持健康？',
  '今天适合做什么？',
  '有什么有趣的事情吗？',
  '帮我制定一个计划'
]

// DeepSeek API调用函数
async function callDeepSeekAPI(userMessage: string): Promise<string> {
  console.log('🤖 开始调用DeepSeek API...')
  console.log('用户消息:', userMessage)
  console.log('API配置:', {
    url: API_CONFIG.DEEPSEEK.URL,
    model: API_CONFIG.DEEPSEEK.MODEL,
    key: API_CONFIG.DEEPSEEK.API_KEY.substring(0, 8) + '...'
  })
  
  try {
    const requestBody = {
      model: API_CONFIG.DEEPSEEK.MODEL,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPTS.ELF_ASSISTANT
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      max_tokens: API_CONFIG.DEEPSEEK.MAX_TOKENS,
      temperature: API_CONFIG.DEEPSEEK.TEMPERATURE
    }
    
    console.log('📤 发送请求:', requestBody)
    
    const response = await fetch(API_CONFIG.DEEPSEEK.URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.DEEPSEEK.API_KEY}`
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📡 收到响应:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API错误响应:', errorText)
      const error: any = new Error(`API请求失败: ${response.status} ${response.statusText}`)
      error.status = response.status
      error.details = errorText
      throw error
    }

    const data = await response.json()
    console.log('✅ API响应数据:', data)
    
    const aiResponse = data.choices[0]?.message?.content
    if (aiResponse) {
      console.log('🎉 AI回复:', aiResponse)
      return aiResponse
    } else {
      console.warn('⚠️ API响应格式异常:', data)
      return '抱歉，我现在无法回答，请稍后再试～'
    }
  } catch (error) {
    console.error('💥 DeepSeek API调用失败:', error)
    // 如果API调用失败，使用备用回复
    return getFallbackResponse(userMessage)
  }
}

// 备用回复函数（当API不可用时使用）
function getFallbackResponse(userMessage: string): string {
  const message = userMessage.toLowerCase()
  
  // 天气相关
  if (message.includes('天气') || message.includes('温度')) {
    return '今天天气不错呢！建议你出去走走，呼吸新鲜空气。记得带件外套，天气可能会变化哦～'
  }
  
  // 电影推荐
  if (message.includes('电影') || message.includes('推荐')) {
    return '我推荐你看《泰坦尼克号》或者《肖申克的救赎》，都是经典好片！或者你可以去电影页面看看有什么新片～'
  }
  
  // 健康相关
  if (message.includes('健康') || message.includes('运动') || message.includes('锻炼')) {
    return '保持健康很重要！建议每天运动30分钟，多喝水，早睡早起。可以试试散步、跑步或者瑜伽～'
  }
  
  // 计划相关
  if (message.includes('计划') || message.includes('安排')) {
    return '制定计划是个好习惯！建议你先列出今天要做的事情，按重要性排序。记得给自己留一些休息时间～'
  }
  
  // 有趣的事情
  if (message.includes('有趣') || message.includes('好玩')) {
    return '有趣的事情很多呢！你可以看看电影、听音乐、和朋友聊天，或者去时间表页面安排一些有趣的活动～'
  }
  
  // 问候
  if (message.includes('你好') || message.includes('hello') || message.includes('hi')) {
    return '你好呀！我是你的小精灵助手，有什么想聊的吗？我可以陪你聊天、回答问题，或者给你一些建议～'
  }
  
  // 感谢
  if (message.includes('谢谢') || message.includes('感谢')) {
    return '不客气！能帮到你是我的荣幸。还有什么想聊的吗？'
  }
  
  // 默认回复
  const defaultResponses = [
    '这个问题很有趣呢！让我想想...',
    '嗯，我觉得你可以试试这样...',
    '这是个好问题！我的建议是...',
    '让我为你分析一下这个问题...',
    '我觉得你可以考虑...',
    '这个问题我建议你...'
  ]
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)] + 
    ' 不过我觉得最好的建议是，相信你自己的判断，做你觉得对的事情！'
}

export default function ElfPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '你好！我是你的小精灵助手 🧚‍♀️ 有什么想聊的吗？我可以陪你聊天、回答问题，或者给你一些建议～',
      timestamp: Date.now()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<'ready' | 'error' | 'offline'>('ready')
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [lastError, setLastError] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 调试API连接
  const handleDebugApi = async () => {
    setDebugInfo('正在测试API连接...')
    try {
      const result = await ApiDebugger.testConnection()
      setDebugInfo(result.message)
      console.log('API测试结果:', result)
      
      if (result.success) {
        setApiStatus('ready')
      } else {
        setApiStatus('error')
        setLastError(result.message)
      }
    } catch (error) {
      setDebugInfo('调试测试失败')
      setApiStatus('error')
      console.error('调试测试异常:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setApiStatus('ready')

    try {
      // 调用DeepSeek API
      const aiResponse = await callDeepSeekAPI(userMessage.content)
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: Date.now()
      }
      
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('发送消息失败:', error)
      setApiStatus('error')
      setLastError(error instanceof Error ? error.message : String(error))
      
      // 显示错误消息
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: getErrorMessage(error),
        timestamp: Date.now()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePresetQuestion = (question: string) => {
    setInputValue(question)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getApiStatusText = () => {
    if (!API_CONFIG.DEEPSEEK.API_KEY || API_CONFIG.DEEPSEEK.API_KEY === 'sk-1234567890abcdef') {
      return 'API未配置'
    }
    
    if (apiStatus === 'error') {
      if (lastError?.includes('402') || lastError?.includes('Payment Required')) {
        return '余额不足'
      }
      if (lastError?.includes('401') || lastError?.includes('Unauthorized')) {
        return 'API密钥无效'
      }
      if (lastError?.includes('Failed to fetch') || lastError?.includes('NetworkError')) {
        return '网络连接异常'
      }
      return 'API连接异常'
    }
    
    if (apiStatus === 'ready') {
      return 'AI智能对话'
    }
    
    return 'API未配置'
  }

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* 头部 */}
      <header style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: '1px solid rgba(255,255,255,0.2)'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white'
          }}
        >
          <Icon name="ic-back" size={20} alt="返回" />
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 18, color: 'white', fontWeight: 'bold' }}>
            小精灵助手
          </h2>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
            {getApiStatusText()}
          </div>
        </div>
                 <div style={{ display: 'flex', gap: 8 }}>
           <button
             onClick={handleDebugApi}
             style={{
               width: 32,
               height: 32,
               background: 'rgba(255,255,255,0.2)',
               border: 'none',
               borderRadius: '50%',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               cursor: 'pointer',
               fontSize: 12,
               color: 'white'
             }}
             title="调试API连接"
           >
             🔧
           </button>
           <div style={{
             width: 40,
             height: 40,
             background: 'rgba(255,255,255,0.2)',
             borderRadius: '50%',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             fontSize: 20
           }}>
             🧚‍♀️
                     </div>
        </div>
      </header>

      {/* 调试信息 */}
      {debugInfo && (
        <div style={{
          padding: '8px 16px',
          background: 'rgba(255,255,255,0.1)',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          fontSize: 12,
          color: 'white',
          textAlign: 'center'
        }}>
          {debugInfo}
        </div>
      )}

      {/* 错误信息 */}
      {lastError && (
        <div style={{
          padding: '8px 16px',
          background: 'rgba(255,0,0,0.1)',
          borderBottom: '1px solid rgba(255,0,0,0.3)',
          fontSize: 12,
          color: 'rgba(255,255,255,0.9)',
          textAlign: 'center'
        }}>
          🚨 错误详情: {lastError}
        </div>
      )}

      {/* 消息列表 */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        {messages.map(message => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 8
            }}
          >
            <div style={{
              maxWidth: '80%',
              padding: '12px 16px',
              borderRadius: message.type === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: message.type === 'user' 
                ? 'rgba(255,255,255,0.9)' 
                : 'rgba(255,255,255,0.2)',
              color: message.type === 'user' ? '#333' : 'white',
              fontSize: 14,
              lineHeight: 1.4,
              position: 'relative'
            }}>
              <div style={{ marginBottom: 4 }}>
                {message.content}
              </div>
              <div style={{
                fontSize: 10,
                opacity: 0.6,
                textAlign: message.type === 'user' ? 'right' : 'left'
              }}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {/* 加载状态 */}
        {isLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: 8
          }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '18px 18px 18px 4px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: 14
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 16 }}>🧚‍♀️</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <div style={{
                    width: 6,
                    height: 6,
                    background: 'white',
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite ease-in-out'
                  }} />
                  <div style={{
                    width: 6,
                    height: 6,
                    background: 'white',
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite ease-in-out 0.2s'
                  }} />
                  <div style={{
                    width: 6,
                    height: 6,
                    background: 'white',
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite ease-in-out 0.4s'
                  }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 预设问题 */}
      {messages.length === 1 && (
        <div style={{
          padding: '16px',
          background: 'rgba(255,255,255,0.1)',
          borderTop: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ fontSize: 14, color: 'white', marginBottom: 12, textAlign: 'center' }}>
            试试这些问题：
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 8
          }}>
            {presetQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handlePresetQuestion(question)}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 16,
                  color: 'white',
                  fontSize: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                }}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 输入框 */}
      <div style={{
        padding: '16px',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{
          display: 'flex',
          gap: 12,
          alignItems: 'flex-end'
        }}>
          <div style={{ flex: 1 }}>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入你的问题..."
              style={{
                width: '100%',
                minHeight: 40,
                maxHeight: 120,
                padding: '12px 16px',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 20,
                background: 'rgba(255,255,255,0.9)',
                fontSize: 14,
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            style={{
              width: 40,
              height: 40,
              background: inputValue.trim() && !isLoading 
                ? 'rgba(255,255,255,0.9)' 
                : 'rgba(255,255,255,0.3)',
              border: 'none',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed',
              color: inputValue.trim() && !isLoading ? '#667eea' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.2s'
            }}
          >
            <Icon name="ic-send" size={20} alt="发送" />
          </button>
        </div>
      </div>

      {/* 动画样式 */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}
