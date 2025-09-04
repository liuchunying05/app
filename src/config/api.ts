// API配置文件
export const API_CONFIG = {
  // DeepSeek API配置
  DEEPSEEK: {
    URL: 'https://api.deepseek.com/v1/chat/completions',
    // 请将你的实际API密钥替换这里
    // 注意：在生产环境中，应该使用环境变量来存储API密钥
    API_KEY: 'sk-20e626c4c31a4d6dafd7b4c48179131b', // 请将这里替换为你的真实API密钥
    MODEL: 'deepseek-chat',
    MAX_TOKENS: 200,
    TEMPERATURE: 0.7
  }
}

// 系统提示词配置
export const SYSTEM_PROMPTS = {
  ELF_ASSISTANT: `你是一个温暖友好的小精灵助手，专门为情侣用户提供贴心的建议和陪伴。

请遵循以下原则：
1. 用温柔、亲切的语气回复
2. 给出实用、贴心的建议
3. 回复要简洁明了，控制在100字以内
4. 避免过于正式或技术性的语言
5. 可以适当使用emoji表情增加亲和力
6. 针对情侣用户的特点，提供适合的建议

记住：你是他们的贴心小精灵，要像朋友一样温暖陪伴～`
}

// API错误处理
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接异常，请检查网络后重试～',
  API_ERROR: 'AI服务暂时不可用，请稍后再试～',
  RATE_LIMIT: '请求过于频繁，请稍等片刻再试～',
  INVALID_KEY: 'API密钥无效，请联系管理员～',
  UNKNOWN_ERROR: '发生未知错误，请稍后再试～'
}

// 获取错误消息
export function getErrorMessage(error: any): string {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return API_ERROR_MESSAGES.NETWORK_ERROR
  }
  
  if (error.status === 401) {
    return API_ERROR_MESSAGES.INVALID_KEY
  }
  
  if (error.status === 429) {
    return API_ERROR_MESSAGES.RATE_LIMIT
  }
  
  if (error.status >= 500) {
    return API_ERROR_MESSAGES.API_ERROR
  }
  
  return API_ERROR_MESSAGES.UNKNOWN_ERROR
}
