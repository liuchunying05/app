import { API_CONFIG } from '../../app/config/api'

// API连接测试函数
export async function testDeepSeekConnection(): Promise<{
  success: boolean
  message: string
  response?: any
}> {
  try {
    const response = await fetch(API_CONFIG.DEEPSEEK.URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.DEEPSEEK.API_KEY}`
      },
      body: JSON.stringify({
        model: API_CONFIG.DEEPSEEK.MODEL,
        messages: [
          {
            role: 'user',
            content: '你好，请回复"连接成功"'
          }
        ],
        max_tokens: 50,
        temperature: 0.1
      })
    })

    if (!response.ok) {
      return {
        success: false,
        message: `API连接失败: ${response.status} ${response.statusText}`
      }
    }

    const data = await response.json()
    
    if (data.choices && data.choices[0]?.message?.content) {
      return {
        success: true,
        message: 'API连接成功！',
        response: data.choices[0].message.content
      }
    } else {
      return {
        success: false,
        message: 'API响应格式异常'
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `连接错误: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }
}

// 检查API密钥格式
export function validateApiKey(apiKey: string): boolean {
  // DeepSeek API密钥通常以 'sk-' 开头
  return apiKey.startsWith('sk-') && apiKey.length > 10
}

// 获取API状态信息
export function getApiStatus(): {
  configured: boolean
  validKey: boolean
  keyPreview: string
} {
  const apiKey = API_CONFIG.DEEPSEEK.API_KEY
  const isDefaultKey = apiKey === 'sk-1234567890abcdef'
  
  return {
    configured: !isDefaultKey,
    validKey: validateApiKey(apiKey),
    keyPreview: isDefaultKey ? '未配置' : `${apiKey.substring(0, 8)}...`
  }
}
