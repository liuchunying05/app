import { API_CONFIG, SYSTEM_PROMPTS } from '../../app/config/api'

// API调试工具
export class ApiDebugger {
  static async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    console.log('🔍 开始测试DeepSeek API连接...')
    console.log('API URL:', API_CONFIG.DEEPSEEK.URL)
    console.log('API Key:', API_CONFIG.DEEPSEEK.API_KEY.substring(0, 8) + '...')
    
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
              role: 'system',
              content: SYSTEM_PROMPTS.ELF_ASSISTANT
            },
            {
              role: 'user',
              content: '你好'
            }
          ],
          max_tokens: 50,
          temperature: 0.7
        })
      })

      console.log('📡 API响应状态:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API错误响应:', errorText)
        
        let errorMessage = `API请求失败: ${response.status} ${response.statusText}`
        
        if (response.status === 402) {
          errorMessage = '账户余额不足，请充值后重试'
        } else if (response.status === 401) {
          errorMessage = 'API密钥无效，请检查配置'
        } else if (response.status === 429) {
          errorMessage = '请求频率过高，请稍后重试'
        }
        
        return {
          success: false,
          message: errorMessage,
          details: { status: response.status, error: errorText }
        }
      }

      const data = await response.json()
      console.log('✅ API连接成功，响应数据:', data)
      
      return {
        success: true,
        message: 'API连接成功！可以正常使用AI对话功能。',
        details: data
      }
    } catch (error) {
      console.error('💥 API连接测试失败:', error)
      
      let errorMessage = '网络连接失败'
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = '网络连接失败，请检查网络设置'
        } else if (error.message.includes('CORS')) {
          errorMessage = '跨域请求被阻止，请检查浏览器设置'
        } else {
          errorMessage = error.message
        }
      }
      
      return {
        success: false,
        message: errorMessage,
        details: error
      }
    }
  }

  static async testFullConversation(): Promise<{
    success: boolean
    message: string
    conversation?: any
  }> {
    console.log('🧪 测试完整对话流程...')
    
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
              role: 'system',
              content: SYSTEM_PROMPTS.ELF_ASSISTANT
            },
            {
              role: 'user',
              content: '今天几号？'
            }
          ],
          max_tokens: API_CONFIG.DEEPSEEK.MAX_TOKENS,
          temperature: API_CONFIG.DEEPSEEK.TEMPERATURE
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        return {
          success: false,
          message: `对话测试失败: ${response.status}`,
          conversation: { error: errorText }
        }
      }

      const data = await response.json()
      console.log('💬 对话测试结果:', data)
      
      return {
        success: true,
        message: '对话测试成功！',
        conversation: {
          userMessage: '今天几号？',
          aiResponse: data.choices[0]?.message?.content,
          usage: data.usage
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `对话测试异常: ${error instanceof Error ? error.message : '未知错误'}`,
        conversation: { error }
      }
    }
  }

  static logApiConfig(): void {
    console.log('⚙️ API配置信息:')
    console.log('- URL:', API_CONFIG.DEEPSEEK.URL)
    console.log('- Model:', API_CONFIG.DEEPSEEK.MODEL)
    console.log('- Max Tokens:', API_CONFIG.DEEPSEEK.MAX_TOKENS)
    console.log('- Temperature:', API_CONFIG.DEEPSEEK.TEMPERATURE)
    console.log('- API Key:', API_CONFIG.DEEPSEEK.API_KEY.substring(0, 8) + '...')
  }
}

// 在控制台暴露调试工具
if (typeof window !== 'undefined') {
  (window as any).debugApi = ApiDebugger
  console.log('🛠️ API调试工具已加载，使用 window.debugApi 访问')
}
